import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Editor } from '@tiptap/react';
import { TransactionCommentManager } from '../transactionCommentManager';

/**
 * Integration tests for comment undo/redo functionality
 * 
 * These tests verify that comment operations properly integrate with
 * TipTap's transaction system and participate in undo/redo operations.
 */

// Mock a more realistic TipTap Editor with transaction capabilities
const createRealisticMockEditor = () => {
  const transactions: any[] = [];
  let currentTransactionIndex = -1;
  
  const mockState = {
    tr: {
      setMeta: vi.fn().mockImplementation(function(this: any, key: string, value: any) {
        this.meta = this.meta || {};
        this.meta[key] = value;
        return this;
      }),
      getMeta: vi.fn().mockImplementation(function(this: any, key: string) {
        return this.meta?.[key];
      }),
      replaceWith: vi.fn().mockReturnThis(),
      meta: {}
    },
    doc: {
      content: { size: 100 }
    }
  };

  const mockView = {
    dispatch: vi.fn().mockImplementation((tr) => {
      // Simulate transaction being added to history
      transactions.push({
        transaction: tr,
        meta: tr.meta || {}
      });
      currentTransactionIndex = transactions.length - 1;
    })
  };

  const mockHistory = {
    done: [],
    undone: [],
    // Simulate undo operation
    undo: () => {
      if (currentTransactionIndex >= 0) {
        const undoneTransaction = transactions[currentTransactionIndex];
        (mockHistory.undone as any[]).push(undoneTransaction);
        currentTransactionIndex--;
        return true;
      }
      return false;
    },
    // Simulate redo operation
    redo: () => {
      if ((mockHistory.undone as any[]).length > 0) {
        const redoneTransaction = (mockHistory.undone as any[]).pop();
        transactions.push(redoneTransaction);
        currentTransactionIndex = transactions.length - 1;
        return true;
      }
      return false;
    }
  };

  const mockEditor = {
    state: mockState,
    view: mockView,
    storage: {
      history: mockHistory
    },
    getJSON: vi.fn().mockReturnValue({ type: 'doc', content: [] }),
    can: vi.fn().mockReturnValue({
      undo: () => currentTransactionIndex >= 0,
      redo: () => (mockHistory.undone as any[]).length > 0
    }),
    commands: {
      undo: vi.fn().mockImplementation(() => {
        return mockHistory.undo();
      }),
      redo: vi.fn().mockImplementation(() => {
        return mockHistory.redo();
      })
    },
    // Add method to get transactions for testing
    _getTransactions: () => transactions,
    _getCurrentTransactionIndex: () => currentTransactionIndex
  } as unknown as Editor;

  return mockEditor;
};

describe('Comment Undo/Redo Integration', () => {
  let editor: Editor;
  let manager: TransactionCommentManager;

  beforeEach(() => {
    editor = createRealisticMockEditor();
    manager = new TransactionCommentManager(editor);
  });

  describe('Comment Creation and Undo/Redo', () => {
    it('should create comment and allow undo/redo', () => {
      const comment = {
        id: 'test-comment-1',
        threadId: 'test-thread-1',
        content: 'Test comment content',
        selectedText: 'selected text',
        position: { from: 10, to: 20 },
        author: 'Test User'
      };

      // Create comment
      const createResult = manager.createCommentTransaction(comment);
      expect(createResult).toBe(true);

      // Verify transaction was dispatched
      expect(editor.view.dispatch).toHaveBeenCalled();
      
      // Get transaction history
      const transactions = (editor as any)._getTransactions();
      expect(transactions).toHaveLength(1);
      
      // Verify comment metadata is in transaction
      const lastTransaction = transactions[transactions.length - 1];
      expect(lastTransaction.meta['transaction-comments']).toBeDefined();
      expect(lastTransaction.meta['transaction-comments']['test-comment-1']).toMatchObject({
        action: 'create',
        comment: expect.objectContaining({
          id: 'test-comment-1',
          content: 'Test comment content'
        })
      });

      // Test undo capability
      expect(manager.canUndo()).toBe(true);
      
      // Perform undo
      const undoResult = manager.undo();
      expect(undoResult).toBe(true);
      expect(editor.commands.undo).toHaveBeenCalled();
      
      // Test redo capability
      expect(manager.canRedo()).toBe(true);
      
      // Perform redo
      const redoResult = manager.redo();
      expect(redoResult).toBe(true);
      expect(editor.commands.redo).toHaveBeenCalled();
    });

    it('should handle multiple comment operations with proper undo/redo', () => {
      // Create first comment
      const comment1 = {
        id: 'comment-1',
        content: 'First comment',
        selectedText: 'text1',
        position: { from: 0, to: 5 },
        author: 'User1'
      };
      
      manager.createCommentTransaction(comment1);

      // Create second comment
      const comment2 = {
        id: 'comment-2',
        content: 'Second comment',
        selectedText: 'text2',
        position: { from: 10, to: 15 },
        author: 'User2'
      };
      
      manager.createCommentTransaction(comment2);

      // Mock getAllCommentsFromHistory to return the created comments
      vi.spyOn(manager, 'getAllCommentsFromHistory').mockReturnValue([
        { id: 'comment-1', content: 'First comment', selectedText: 'text1', position: { from: 0, to: 5 }, timestamp: new Date(), author: 'User1' },
        { id: 'comment-2', content: 'Second comment', selectedText: 'text2', position: { from: 10, to: 15 }, timestamp: new Date(), author: 'User2' }
      ]);

      // Update first comment
      manager.updateCommentTransaction('comment-1', { content: 'Updated first comment' });

      // Verify we have 3 transactions
      const transactions = (editor as any)._getTransactions();
      expect(transactions).toHaveLength(3);

      // Verify we can undo
      expect(manager.canUndo()).toBe(true);
      
      // Undo the update
      manager.undo();
      
      // Undo the second comment creation
      manager.undo();
      
      // Undo the first comment creation
      manager.undo();
      
      // Should not be able to undo further
      expect(manager.canUndo()).toBe(false);
      
      // Should be able to redo
      expect(manager.canRedo()).toBe(true);
      
      // Redo all operations
      manager.redo(); // First comment
      manager.redo(); // Second comment
      manager.redo(); // Update
      
      // Should not be able to redo further
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('Comment Deletion and Undo/Redo', () => {
    it('should allow undoing comment deletion', () => {
      // Create a comment first
      const comment = {
        id: 'deletable-comment',
        content: 'This will be deleted',
        selectedText: 'deletable',
        position: { from: 0, to: 9 },
        author: 'User'
      };
      
      manager.createCommentTransaction(comment);
      
      // Delete the comment
      const deleteResult = manager.deleteCommentTransaction('deletable-comment');
      expect(deleteResult).toBe(true);
      
      // Verify we have 2 transactions (create + delete)
      const transactions = (editor as any)._getTransactions();
      expect(transactions).toHaveLength(2);
      
      // Check delete transaction metadata
      const deleteTransaction = transactions[1];
      expect(deleteTransaction.meta['transaction-comments']['deletable-comment']).toMatchObject({
        action: 'delete'
      });
      
      // Undo deletion
      manager.undo();
      
      // Undo creation
      manager.undo();
      
      // Redo creation
      manager.redo();
      
      // Comment should be recreated
      expect(manager.canRedo()).toBe(true);
      
      // Redo deletion
      manager.redo();
      
      // Comment should be deleted again
      expect(manager.canUndo()).toBe(true);
    });
  });

  describe('AI Revision Undo/Redo', () => {
    it('should allow undoing AI revisions that modify both content and comments', () => {
      // Create initial comment
      const initialComment = {
        id: 'ai-comment',
        content: 'Original comment',
        selectedText: 'original',
        position: { from: 0, to: 8 },
        author: 'User'
      };
      
      manager.createCommentTransaction(initialComment);
      
      // Apply AI revision
      const aiRevision = {
        content: { 
          type: 'doc', 
          content: [{ 
            type: 'paragraph', 
            content: [{ type: 'text', text: 'AI revised content' }] 
          }] 
        },
        comments: [{
          id: 'ai-comment',
          content: 'AI updated comment',
          selectedText: 'revised',
          position: { from: 0, to: 7 },
          timestamp: new Date(),
          author: 'AI Assistant'
        }]
      };
      
      const revisionResult = manager.applyAIRevision(aiRevision);
      expect(revisionResult).toBe(true);
      
      // Verify AI revision created transaction
      expect(editor.state.tr.replaceWith).toHaveBeenCalled();
      expect(editor.view.dispatch).toHaveBeenCalled();
      
      // Should be able to undo AI revision
      expect(manager.canUndo()).toBe(true);
      
      // Undo AI revision
      manager.undo();
      
      // Should be able to redo AI revision
      expect(manager.canRedo()).toBe(true);
      
      // Redo AI revision
      manager.redo();
      
      // Verify we're back to AI revised state
      expect(manager.canUndo()).toBe(true);
    });
  });

  describe('Document with Comments Serialization', () => {
    it('should provide unified document structure for AI workflows', () => {
      // Mock getAllCommentsFromHistory to return test data
      const mockComments = [
        {
          id: 'test-comment',
          content: 'Test comment',
          selectedText: 'test',
          position: { from: 0, to: 4 },
          timestamp: new Date(),
          author: 'User'
        }
      ];
      
      vi.spyOn(manager, 'getAllCommentsFromHistory').mockReturnValue(mockComments);
      
      const document = manager.getDocumentWithComments();
      
      expect(document).toEqual({
        content: { type: 'doc', content: [] },
        comments: mockComments
      });
      
      // This structure is perfect for AI workflows
      expect(document.content).toBeDefined();
      expect(document.comments).toBeInstanceOf(Array);
      expect(document.comments[0]).toMatchObject({
        id: 'test-comment',
        content: 'Test comment'
      });
    });
  });
});