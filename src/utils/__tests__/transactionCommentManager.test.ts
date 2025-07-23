import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Editor } from '@tiptap/react';
import { TransactionCommentManager } from '../transactionCommentManager';
import { Comment } from '../../types/comments';

// Mock TipTap Editor
const createMockEditor = () => {
  const mockState = {
    tr: {
      setMeta: vi.fn().mockReturnThis(),
      getMeta: vi.fn().mockReturnValue({}),
      replaceWith: vi.fn().mockReturnThis()
    },
    doc: {
      content: { size: 100 }
    }
  };

  const mockView = {
    dispatch: vi.fn()
  };

  return {
    state: mockState,
    view: mockView,
    storage: {
      history: {
        done: [],
        undone: []
      }
    },
    getJSON: vi.fn().mockReturnValue({ type: 'doc', content: [] })
  } as unknown as Editor;
};

describe('TransactionCommentManager', () => {
  let editor: Editor;
  let manager: TransactionCommentManager;
  let mockTransaction: any;

  beforeEach(() => {
    editor = createMockEditor();
    manager = new TransactionCommentManager(editor);
    
    mockTransaction = {
      setMeta: vi.fn().mockReturnThis(),
      getMeta: vi.fn().mockReturnValue({})
    };
  });

  describe('storeCommentInTransaction', () => {
    it('should store comment metadata in transaction', () => {
      const comment = {
        id: 'test-comment-1',
        threadId: 'test-thread-1',
        content: 'Test comment content',
        selectedText: 'selected text',
        position: { from: 10, to: 20 },
        timestamp: new Date(),
        author: 'Test User'
      };

      const result = manager.storeCommentInTransaction(mockTransaction, 'create', comment);

      expect(mockTransaction.setMeta).toHaveBeenCalledWith(
        'transaction-comments',
        expect.objectContaining({
          'test-comment-1': expect.objectContaining({
            action: 'create',
            comment: expect.objectContaining({
              id: 'test-comment-1',
              threadId: 'test-thread-1',
              content: 'Test comment content'
            })
          })
        })
      );

      expect(result).toBe(mockTransaction);
    });

    it('should handle multiple comments in same transaction', () => {
      // Mock existing comments in transaction
      mockTransaction.getMeta.mockReturnValue({
        'existing-comment': { action: 'create', comment: { id: 'existing-comment' } }
      });

      const newComment = {
        id: 'new-comment',
        threadId: 'new-thread',
        content: 'New comment',
        selectedText: '',
        position: { from: 0, to: 0 },
        timestamp: new Date()
      };

      manager.storeCommentInTransaction(mockTransaction, 'create', newComment);

      expect(mockTransaction.setMeta).toHaveBeenCalledWith(
        'transaction-comments',
        expect.objectContaining({
          'existing-comment': expect.any(Object),
          'new-comment': expect.any(Object)
        })
      );
    });
  });

  describe('getCommentsFromTransaction', () => {
    it('should retrieve comment metadata from transaction', () => {
      const mockComments = {
        'comment-1': { action: 'create', comment: { id: 'comment-1' } }
      };
      
      mockTransaction.getMeta.mockReturnValue(mockComments);

      const result = manager.getCommentsFromTransaction(mockTransaction);

      expect(result).toEqual(mockComments);
      expect(mockTransaction.getMeta).toHaveBeenCalledWith('transaction-comments');
    });

    it('should return empty object when no comments in transaction', () => {
      mockTransaction.getMeta.mockReturnValue(undefined);

      const result = manager.getCommentsFromTransaction(mockTransaction);

      expect(result).toEqual({});
    });
  });

  describe('createCommentTransaction', () => {
    it('should create a comment and dispatch transaction', () => {
      const comment: Omit<Comment, 'timestamp'> = {
        id: 'test-comment',
        threadId: 'test-thread',
        content: 'Test content',
        selectedText: 'selected',
        position: { from: 5, to: 15 },
        author: 'Test User'
      };

      const result = manager.createCommentTransaction(comment);

      expect(result).toBe(true);
      expect(editor.state.tr.setMeta).toHaveBeenCalledWith(
        'transaction-comments',
        expect.any(Object)
      );
      expect(editor.view.dispatch).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      // Mock dispatch to throw error
      (editor.view.dispatch as any).mockImplementation(() => {
        throw new Error('Dispatch failed');
      });

      const comment: Omit<Comment, 'timestamp'> = {
        id: 'test-comment',
        content: 'Test content',
        selectedText: '',
        position: { from: 0, to: 0 }
      };

      const result = manager.createCommentTransaction(comment);

      expect(result).toBe(false);
    });
  });

  describe('updateCommentTransaction', () => {
    beforeEach(() => {
      // Create a comment in the cache first
      manager.createCommentTransaction({
        id: 'existing-comment',
        threadId: 'existing-thread',
        content: 'Original content',
        selectedText: 'original',
        position: { from: 0, to: 10 },
        author: 'Original Author'
      });
      
      // Reset the dispatch mock to track only update calls
      (editor.view.dispatch as any).mockClear();
    });

    it('should update existing comment', () => {
      const updates = {
        content: 'Updated content',
        author: 'Updated Author'
      };

      const result = manager.updateCommentTransaction('existing-comment', updates);

      expect(result).toBe(true);
      expect(editor.view.dispatch).toHaveBeenCalled();
    });

    it('should return false for non-existent comment', () => {
      const result = manager.updateCommentTransaction('non-existent', { content: 'test' });

      expect(result).toBe(false);
      expect(editor.view.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('deleteCommentTransaction', () => {
    it('should create delete transaction', () => {
      const result = manager.deleteCommentTransaction('comment-to-delete');

      expect(result).toBe(true);
      expect(editor.state.tr.setMeta).toHaveBeenCalledWith(
        'transaction-comments',
        expect.objectContaining({
          'comment-to-delete': expect.objectContaining({
            action: 'delete'
          })
        })
      );
      expect(editor.view.dispatch).toHaveBeenCalled();
    });
  });

  describe('getDocumentWithComments', () => {
    it('should return unified document structure', () => {
      const mockComments: Comment[] = [
        {
          id: 'comment-1',
          content: 'Test comment',
          selectedText: 'test',
          position: { from: 0, to: 4 },
          timestamp: new Date(),
          author: 'User'
        }
      ];

      vi.spyOn(manager, 'getAllCommentsFromHistory').mockReturnValue(mockComments);

      const result = manager.getDocumentWithComments();

      expect(result).toEqual({
        content: { type: 'doc', content: [] },
        comments: mockComments
      });
    });
  });

  describe('applyAIRevision', () => {
    it('should apply content and comment changes atomically', () => {
      const revision = {
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'AI revised content' }] }] },
        comments: [
          {
            id: 'ai-comment',
            content: 'AI added comment',
            selectedText: 'revised',
            position: { from: 0, to: 7 },
            timestamp: new Date(),
            author: 'AI Assistant'
          }
        ]
      };

      const result = manager.applyAIRevision(revision);

      expect(result).toBe(true);
      expect(editor.state.tr.replaceWith).toHaveBeenCalled();
      expect(editor.view.dispatch).toHaveBeenCalled();
    });

    it('should handle errors in AI revision application', () => {
      // Mock replaceWith to throw error
      (editor.state.tr.replaceWith as any).mockImplementation(() => {
        throw new Error('Replace failed');
      });

      const revision = { content: {}, comments: [] };
      const result = manager.applyAIRevision(revision);

      expect(result).toBe(false);
    });
  });

  describe('syncWithProvider', () => {
    it('should sync transaction comments with provider system', () => {
      const mockProvider = {
        getComment: vi.fn().mockReturnValue(null),
        createComment: vi.fn()
      };

      const mockComments: Comment[] = [
        {
          id: 'sync-comment',
          threadId: 'sync-thread',
          content: 'Sync test',
          selectedText: 'sync',
          position: { from: 0, to: 4 },
          timestamp: new Date(),
          author: 'Sync User'
        }
      ];

      vi.spyOn(manager, 'getAllCommentsFromHistory').mockReturnValue(mockComments);

      manager.syncWithProvider(mockProvider);

      expect(mockProvider.createComment).toHaveBeenCalledWith(
        'sync-thread',
        'Sync test',
        'transaction-user',
        expect.objectContaining({
          selectedText: 'sync',
          position: { from: 0, to: 4 },
          author: 'Sync User'
        })
      );
    });

    it('should handle provider sync errors gracefully', () => {
      const mockProvider = {
        getComment: vi.fn().mockImplementation(() => {
          throw new Error('Provider error');
        })
      };

      vi.spyOn(manager, 'getAllCommentsFromHistory').mockReturnValue([]);

      // Should not throw
      expect(() => manager.syncWithProvider(mockProvider)).not.toThrow();
    });
  });
});