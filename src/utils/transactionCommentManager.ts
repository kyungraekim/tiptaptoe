import { Editor } from '@tiptap/react';
import { Transaction } from '@tiptap/pm/state';
import { Comment } from '../types/comments';

/**
 * Transaction-based comment metadata system
 * 
 * This class manages comment data as part of TipTap's transaction system,
 * enabling proper undo/redo support and unified document state.
 */
export class TransactionCommentManager {
  private editor: Editor;
  private readonly COMMENT_META_KEY = 'transaction-comments';
  private commentCache = new Map<string, Comment>();
  
  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Store comment data in transaction metadata
   * This makes comments part of the undoable transaction history
   */
  storeCommentInTransaction(
    transaction: Transaction,
    action: 'create' | 'update' | 'delete',
    comment: Partial<Comment> & { id: string; threadId?: string }
  ): Transaction {
    const existingComments = this.getCommentsFromTransaction(transaction);
    
    const commentMetadata = {
      action,
      timestamp: Date.now(),
      comment: {
        id: comment.id,
        threadId: comment.threadId || comment.id,
        content: comment.content || '',
        selectedText: comment.selectedText || '',
        position: comment.position || { from: 0, to: 0 },
        author: comment.author || 'User',
        resolved: comment.resolved || false
      }
    };

    // Store in transaction metadata
    return transaction.setMeta(this.COMMENT_META_KEY, {
      ...existingComments,
      [comment.id]: commentMetadata
    });
  }

  /**
   * Retrieve comment data from transaction metadata
   */
  getCommentsFromTransaction(transaction: Transaction): Record<string, any> {
    return transaction.getMeta(this.COMMENT_META_KEY) || {};
  }

  /**
   * Get all comments from current document state
   * Uses cache for immediate access while transactions build up history
   */
  getAllCommentsFromHistory(): Comment[] {
    return Array.from(this.commentCache.values());
  }

  /**
   * Update comment cache when operations are performed
   */
  updateCommentCache(action: 'create' | 'update' | 'delete', comment: Partial<Comment> & { id: string }) {
    switch (action) {
      case 'create':
      case 'update':
        const existingComment = this.commentCache.get(comment.id) || {} as Comment;
        const updatedComment = {
          ...existingComment,
          ...comment,
          timestamp: comment.timestamp || new Date(),
          threadId: comment.threadId || comment.id
        } as Comment;
        
        this.commentCache.set(comment.id, updatedComment);
        this.persistComment(updatedComment);
        break;
      case 'delete':
        this.commentCache.delete(comment.id);
        this.removePersistedComment(comment.id);
        break;
    }
  }

  /**
   * Create a comment and store it in a transaction
   */
  createCommentTransaction(comment: Omit<Comment, 'timestamp'>): boolean {
    try {
      const { state, view } = this.editor;
      let tr = state.tr;
      
      const fullComment = {
        ...comment,
        id: comment.id,
        threadId: comment.threadId || comment.id,
        timestamp: new Date()
      };
      
      // Create visual comment mark in the editor
      const { from, to } = comment.position;
      
      // Try to use CommentsKit command if available
      if ((this.editor.commands as any).createThread) {
        const success = (this.editor.commands as any).createThread({
          id: comment.threadId,
          from,
          to
        });
        
        if (success) {
          console.log('Created thread with visual highlight:', comment.threadId);
          
          // Add comment to the thread via provider
          const provider = this.editor.storage?.commentsKit?.provider;
          if (provider) {
            provider.createComment(
              comment.threadId,
              comment.content,
              'default-user', // user id
              {
                selectedText: comment.selectedText,
                position: comment.position,
                author: comment.author
              }
            );
          }
        }
      } else {
        // Fallback: create comment mark manually
        const commentMarkType = this.editor.schema.marks.commentMark;
        if (commentMarkType) {
          const mark = commentMarkType.create({ threadId: comment.threadId });
          tr = tr.addMark(from, to, mark);
        }
      }
      
      // Store comment in transaction metadata
      tr = this.storeCommentInTransaction(tr, 'create', fullComment);
      
      // Update cache immediately
      this.updateCommentCache('create', fullComment);
      
      // Apply transaction if we made manual changes
      if (!((this.editor.commands as any).createThread)) {
        view.dispatch(tr);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to create comment transaction:', error);
      return false;
    }
  }

  /**
   * Update a comment through transaction system
   */
  updateCommentTransaction(commentId: string, updates: Partial<Comment>): boolean {
    try {
      const { state, view } = this.editor;
      const tr = state.tr;
      
      // Get existing comment data from cache
      const existingComment = this.commentCache.get(commentId);
      
      if (!existingComment) {
        console.warn(`Comment ${commentId} not found for update`);
        return false;
      }

      const updatedComment = {
        ...existingComment,
        ...updates,
        id: commentId,
        threadId: existingComment.threadId || commentId
      };

      // Store updated comment in transaction metadata
      const updatedTr = this.storeCommentInTransaction(tr, 'update', updatedComment);
      
      // Update cache immediately
      this.updateCommentCache('update', updatedComment);
      
      // Apply transaction
      view.dispatch(updatedTr);
      
      return true;
    } catch (error) {
      console.error('Failed to update comment transaction:', error);
      return false;
    }
  }

  /**
   * Delete a comment through transaction system
   */
  deleteCommentTransaction(commentId: string): boolean {
    try {
      const { state, view } = this.editor;
      const tr = state.tr;
      
      // Store deletion in transaction metadata
      const updatedTr = this.storeCommentInTransaction(tr, 'delete', {
        id: commentId,
        threadId: commentId
      });
      
      // Update cache immediately
      this.updateCommentCache('delete', { id: commentId });
      
      // Apply transaction
      view.dispatch(updatedTr);
      
      return true;
    } catch (error) {
      console.error('Failed to delete comment transaction:', error);
      return false;
    }
  }

  /**
   * Bridge method: Sync transaction-based comments with existing provider system
   * This creates visual highlights and threads in CommentsKit based on transaction data
   */
  syncWithProvider(provider: any): void {
    try {
      const transactionComments = this.getAllCommentsFromHistory();
      const existingThreads = provider.getThreads?.() || [];
      
      console.log('Syncing transaction comments to provider:', {
        transactionComments: transactionComments.length,
        existingThreads: existingThreads.length
      });
      
      // Group comments by threadId
      const commentsByThread = new Map<string, Comment[]>();
      
      transactionComments.forEach(comment => {
        const threadId = comment.threadId || comment.id;
        if (!commentsByThread.has(threadId)) {
          commentsByThread.set(threadId, []);
        }
        commentsByThread.get(threadId)!.push(comment);
      });

      // Create missing threads and comments in the provider
      commentsByThread.forEach((comments, threadId) => {
        // Check if thread exists in provider
        const existingThread = existingThreads.find((t: any) => t.id === threadId);
        
        if (!existingThread) {
          console.log('Creating missing thread in provider:', threadId);
          
          // Use editor commands to create the thread with proper highlighting
          const firstComment = comments[0];
          if (firstComment && this.editor.commands) {
            // Create thread using editor commands (this creates the visual highlight)
            const success = (this.editor.commands as any).createThread?.({
              id: threadId,
              from: firstComment.position.from,
              to: firstComment.position.to
            });
            
            if (success) {
              console.log('Thread created successfully with highlighting:', threadId);
              
              // Add all comments to the newly created thread
              comments.forEach(comment => {
                provider.createComment?.(
                  threadId,
                  comment.content,
                  comment.author || 'User',
                  {
                    selectedText: comment.selectedText,
                    position: comment.position,
                    author: comment.author
                  }
                );
              });
            }
          }
        } else {
          // Thread exists, check for missing comments
          const existingComments = existingThread.comments || [];
          
          comments.forEach(comment => {
            const commentExists = existingComments.find((c: any) => c.id === comment.id);
            
            if (!commentExists) {
              console.log('Adding missing comment to existing thread:', comment.id);
              provider.createComment?.(
                threadId,
                comment.content,
                comment.author || 'User',
                {
                  selectedText: comment.selectedText,
                  position: comment.position,
                  author: comment.author
                }
              );
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Failed to sync with provider:', error);
    }
  }

  /**
   * Handle undo/redo events to maintain comment state consistency
   */
  handleHistoryChange(onCommentsChange?: (comments: Comment[]) => void): void {
    console.log('Transaction history changed - rebuilding comment cache from transactions');
    
    // Rebuild cache from transaction history
    this.rebuildCacheFromTransactions();
    
    // Notify UI if callback provided
    if (onCommentsChange) {
      const currentComments = this.getAllCommentsFromHistory();
      onCommentsChange(currentComments);
    }
  }

  /**
   * Rebuild comment cache from transaction history
   * This is called after undo/redo to restore comment state
   */
  private rebuildCacheFromTransactions(): void {
    console.log('Rebuilding comment cache from transaction history...');
    this.commentCache.clear();
    
    // Get the current editor state to work with the latest document
    const { state } = this.editor;
    
    // Simple approach: scan current document for comment marks and match with stored metadata
    const commentMarks: Array<{threadId: string, from: number, to: number, text: string}> = [];
    
    // Find all comment marks in current document
    state.doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'commentMark' && mark.attrs.threadId) {
            commentMarks.push({
              threadId: mark.attrs.threadId,
              from: pos,
              to: pos + node.nodeSize,
              text: node.textContent
            });
          }
        });
      }
    });

    console.log(`Found ${commentMarks.length} comment marks in current document`);

    // For each comment mark, try to restore from local storage or create minimal data
    commentMarks.forEach(mark => {
      // Try to get full comment data from localStorage or create minimal comment
      const storedCommentKey = `comment-${mark.threadId}`;
      let commentData: Comment;
      
      try {
        const stored = localStorage.getItem(storedCommentKey);
        if (stored) {
          commentData = JSON.parse(stored);
          // Update position to current mark position
          commentData.position = { from: mark.from, to: mark.to };
          commentData.selectedText = mark.text;
        } else {
          // Create minimal comment data
          commentData = {
            id: mark.threadId,
            threadId: mark.threadId,
            content: `Comment for "${mark.text}"`,
            selectedText: mark.text,
            position: { from: mark.from, to: mark.to },
            author: 'User',
            timestamp: new Date(),
            resolved: false
          };
        }
        
        this.commentCache.set(commentData.id, commentData);
        console.log(`Restored comment: ${commentData.id}`);
        
      } catch (error) {
        console.error('Error restoring comment:', error);
      }
    });

    console.log(`Rebuilt comment cache: ${this.commentCache.size} comments`);
    
    // Sync with the extension provider to ensure UI consistency
    const provider = this.editor.storage?.commentsKit?.provider;
    if (provider) {
      console.log('Syncing rebuilt comments with provider...');
      this.syncWithProvider(provider);
    }
  }

  /**
   * Persist comment to localStorage for recovery after undo/redo
   */
  private persistComment(comment: Comment): void {
    try {
      const key = `comment-${comment.id}`;
      localStorage.setItem(key, JSON.stringify(comment));
    } catch (error) {
      console.error('Failed to persist comment:', error);
    }
  }

  /**
   * Remove comment from localStorage
   */
  private removePersistedComment(commentId: string): void {
    try {
      const key = `comment-${commentId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove persisted comment:', error);
    }
  }

  /**
   * Get comment data for AI workflows
   * Returns unified document + comments structure
   */
  getDocumentWithComments(): { content: any; comments: Comment[] } {
    return {
      content: this.editor.getJSON(),
      comments: this.getAllCommentsFromHistory()
    };
  }

  /**
   * Apply AI revision that includes both content and comment changes
   */
  applyAIRevision(revision: { content: any; comments: Comment[] }): boolean {
    try {
      const { state, view } = this.editor;
      let tr = state.tr;
      
      // Apply content changes
      tr = tr.replaceWith(0, state.doc.content.size, revision.content);
      
      // Apply comment changes as transaction metadata
      revision.comments.forEach(comment => {
        tr = this.storeCommentInTransaction(tr, 'update', comment);
      });
      
      // Apply as single atomic transaction
      view.dispatch(tr);
      
      return true;
    } catch (error) {
      console.error('Failed to apply AI revision:', error);
      return false;
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.editor.can().undo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.editor.can().redo();
  }

  /**
   * Perform undo
   */
  undo(): boolean {
    if (this.canUndo()) {
      this.editor.commands.undo();
      return true;
    }
    return false;
  }

  /**
   * Perform redo
   */
  redo(): boolean {
    if (this.canRedo()) {
      this.editor.commands.redo();
      return true;
    }
    return false;
  }

  /**
   * Mark a comment as resolved
   */
  resolveComment(commentId: string): boolean {
    try {
      const comment = this.commentCache.get(commentId);
      if (!comment) {
        console.warn(`Comment ${commentId} not found for resolve`);
        return false;
      }

      return this.updateCommentTransaction(commentId, { resolved: true });
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      return false;
    }
  }

  /**
   * Jump to a comment's position in the editor
   */
  jumpToComment(commentId: string): boolean {
    try {
      const comment = this.commentCache.get(commentId);
      if (!comment) {
        console.warn(`Comment ${commentId} not found for jump`);
        return false;
      }

      const { from, to } = comment.position;
      
      // Set selection to the comment's position
      this.editor.commands.setTextSelection({ from, to });
      this.editor.commands.focus();
      
      return true;
    } catch (error) {
      console.error('Failed to jump to comment:', error);
      return false;
    }
  }

  /**
   * Get a specific comment by ID
   */
  getComment(commentId: string): Comment | undefined {
    return this.commentCache.get(commentId);
  }

  /**
   * Get comments by thread ID
   */
  getCommentsByThread(threadId: string): Comment[] {
    return Array.from(this.commentCache.values()).filter(
      comment => comment.threadId === threadId
    );
  }

  /**
   * Check if a comment exists
   */
  hasComment(commentId: string): boolean {
    return this.commentCache.has(commentId);
  }

  /**
   * Get total comment count
   */
  getCommentCount(): number {
    return this.commentCache.size;
  }

  /**
   * Get resolved comment count
   */
  getResolvedCommentCount(): number {
    return Array.from(this.commentCache.values()).filter(
      comment => comment.resolved
    ).length;
  }

  /**
   * Get active (non-resolved) comment count
   */
  getActiveCommentCount(): number {
    return Array.from(this.commentCache.values()).filter(
      comment => !comment.resolved
    ).length;
  }

  /**
   * Set up event listeners for undo/redo to automatically update UI
   */
  setupHistoryListeners(onCommentsChange?: (comments: Comment[]) => void): () => void {
    const handleUpdate = ({ transaction }: { transaction: any }) => {
      // Check various ways TipTap marks undo/redo operations
      const isUndo = transaction.getMeta('isUndo') || 
                   transaction.getMeta('uiEvent') === 'undo' ||
                   transaction.getMeta('addToHistory') === false;
      const isRedo = transaction.getMeta('isRedo') || 
                   transaction.getMeta('uiEvent') === 'redo';
      
      // Also check for history plugin specific metadata
      const historyMeta = transaction.getMeta('history$');
      const isHistoryOperation = historyMeta && (historyMeta.undo || historyMeta.redo);
      
      if (isUndo || isRedo || isHistoryOperation) {
        console.log(`Detected ${isUndo || historyMeta?.undo ? 'undo' : 'redo'} operation, updating comment state`);
        // Use setTimeout to ensure the transaction is fully processed
        setTimeout(() => {
          this.handleHistoryChange(onCommentsChange);
        }, 0);
      }
    };

    // Also listen for the history plugin events directly if available
    const handleHistoryUpdate = () => {
      console.log('History state changed, updating comments');
      setTimeout(() => {
        this.handleHistoryChange(onCommentsChange);
      }, 0);
    };

    // Listen for editor updates
    this.editor.on('update', handleUpdate);

    // Try to listen to history plugin events if available
    const historyExtension = this.editor.extensionManager.extensions.find(ext => ext.name === 'history');
    if (historyExtension) {
      // Some versions of TipTap expose history events
      try {
        (this.editor as any).on('historyUpdate', handleHistoryUpdate);
      } catch (e) {
        // History events not available in this version
      }
    }

    // Return cleanup function
    return () => {
      this.editor.off('update', handleUpdate);
      try {
        (this.editor as any).off('historyUpdate', handleHistoryUpdate);
      } catch (e) {
        // History events not available
      }
    };
  }
}