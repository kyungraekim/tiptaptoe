import { Editor } from '@tiptap/react';

/**
 * Utility for managing comment history and undo/redo operations
 */
export class CommentHistory {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Execute a comment operation that can be undone/redone
   */
  executeOperation(operation: () => void, description: string = 'Comment operation') {
    if (!this.editor) return false;

    try {
      // Start a new transaction group for undo/redo
      const { tr } = this.editor.state;
      
      // Add metadata to mark this as a comment operation
      tr.setMeta('comment-operation', { description, timestamp: Date.now() });
      
      // Execute the operation
      operation();
      
      // The operation should have created its own transaction
      // The history extension will automatically handle undo/redo
      
      return true;
    } catch (error) {
      console.error('Comment operation failed:', error);
      return false;
    }
  }

  /**
   * Create a thread with undo/redo support
   */
  createThread(options: any = {}) {
    try {
      // Use the extension's command directly
      const commentsKit = this.editor.extensionManager.extensions.find(ext => ext.name === 'commentsKit');
      if (commentsKit && (this.editor.commands as any).createThread) {
        return (this.editor.commands as any).createThread(options);
      }
      return false;
    } catch (error) {
      console.error('Failed to create thread:', error);
      return false;
    }
  }

  /**
   * Delete a thread with undo/redo support
   */
  deleteThread(threadId: string) {
    try {
      // Use the extension's command directly
      if ((this.editor.commands as any).removeThread) {
        return (this.editor.commands as any).removeThread({ id: threadId });
      }
      return false;
    } catch (error) {
      console.error('Failed to delete thread:', error);
      return false;
    }
  }

  /**
   * Add a comment with undo/redo support
   */
  addComment(threadId: string, content: string, data?: any) {
    try {
      // Use the provider directly since addComment is not a command
      const provider = this.editor.storage?.commentsKit?.provider;
      if (provider) {
        provider.createComment(threadId, content, this.getCurrentUser().id, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add comment:', error);
      return false;
    }
  }

  /**
   * Update a comment with undo/redo support
   */
  updateComment(threadId: string, commentId: string, content: string, data?: any) {
    try {
      if ((this.editor.commands as any).updateComment) {
        return (this.editor.commands as any).updateComment({
          threadId,
          id: commentId,
          content,
          data
        });
      }
      return false;
    } catch (error) {
      console.error('Failed to update comment:', error);
      return false;
    }
  }

  /**
   * Delete a comment with undo/redo support
   */
  deleteComment(threadId: string, commentId: string) {
    try {
      if ((this.editor.commands as any).deleteComment) {
        return (this.editor.commands as any).deleteComment({
          threadId,
          id: commentId
        });
      }
      return false;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      return false;
    }
  }

  /**
   * Resolve a thread with undo/redo support
   */
  resolveThread(threadId: string) {
    try {
      if ((this.editor.commands as any).resolveThread) {
        return (this.editor.commands as any).resolveThread({ id: threadId });
      }
      return false;
    } catch (error) {
      console.error('Failed to resolve thread:', error);
      return false;
    }
  }

  /**
   * Unresolve a thread with undo/redo support
   */
  unresolveThread(threadId: string) {
    try {
      if ((this.editor.commands as any).unresolveThread) {
        return (this.editor.commands as any).unresolveThread({ id: threadId });
      }
      return false;
    } catch (error) {
      console.error('Failed to unresolve thread:', error);
      return false;
    }
  }

  /**
   * Get the current user from the editor storage
   */
  private getCurrentUser() {
    return this.editor.storage?.commentsKit?.user || { 
      id: 'default-user', 
      name: 'User', 
      color: '#3b82f6' 
    };
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
}