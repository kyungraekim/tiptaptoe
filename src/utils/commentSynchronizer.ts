import { Editor } from '@tiptap/react';
import { commentStorage } from './commentStorage';

export interface CommentMark {
  commentId: string;
  from: number;
  to: number;
}

export class CommentSynchronizer {
  private editor: Editor;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 200; // Reduced to 200ms delay
  private onSyncCallback?: () => void;

  constructor(editor: Editor, onSyncCallback?: () => void) {
    this.editor = editor;
    this.onSyncCallback = onSyncCallback;
  }

  /**
   * Get all comment marks currently in the editor by traversing the document
   */
  getEditorCommentMarks(): CommentMark[] {
    if (!this.editor) return [];
    
    const marks: CommentMark[] = [];
    const { doc } = this.editor.state;
    
    try {
      doc.descendants((node, pos) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'commentMark' && mark.attrs.commentId) {
              marks.push({
                commentId: mark.attrs.commentId,
                from: pos,
                to: pos + node.nodeSize,
              });
            }
          });
        }
      });
      
      return marks;
    } catch (error) {
      console.error('Error getting comment marks:', error);
      return [];
    }
  }

  /**
   * Validate comment positions against current document
   * Only removes comments when positions are clearly invalid (beyond bounds or extraction fails)
   */
  validateCommentPositions(): void {
    const comments = commentStorage.getComments();
    const { doc } = this.editor.state;
    const docSize = doc.content.size;
    
    const invalidComments = comments.filter(comment => {
      const { from, to } = comment.position;
      
      // Check if positions are beyond document bounds
      if (from > docSize || to > docSize || from < 0 || to < 0) {
        console.log(`Comment ${comment.id} has out-of-bounds position: ${from}-${to} (docSize: ${docSize})`);
        return true;
      }
      
      // Check if we can extract text at these positions
      try {
        const currentText = doc.textBetween(from, to);
        
        // Only consider it invalid if the extraction completely fails
        // OR if the text is completely empty (indicates deletion)
        if (currentText.trim() === '') {
          console.log(`Comment ${comment.id} has empty text at position ${from}-${to}, likely deleted`);
          return true;
        }
        
        // Don't validate exact text match here - rely on mark-based sync instead
        return false;
        
      } catch (error) {
        // If we can't extract text at these positions, it's definitely invalid
        console.log(`Cannot extract text for comment ${comment.id} at positions ${from}-${to}:`, error);
        return true;
      }
    });

    // Remove invalid comments
    invalidComments.forEach(comment => {
      console.log(`Removing orphaned comment: ${comment.id} (position: ${comment.position.from}-${comment.position.to}, docSize: ${docSize})`);
      commentStorage.deleteComment(comment.id);
    });

    if (invalidComments.length > 0) {
      console.log(`Cleaned up ${invalidComments.length} orphaned comments`);
    }
  }

  /**
   * Synchronize comments with editor marks
   * Remove comments that don't have corresponding marks
   */
  syncCommentsWithMarks(): void {
    const editorMarks = this.getEditorCommentMarks();
    const storedComments = commentStorage.getComments();
    
    console.log(`Syncing: Found ${editorMarks.length} editor marks and ${storedComments.length} stored comments`);
    
    // Find comments that don't have corresponding marks
    const orphanedComments = storedComments.filter(comment => 
      !editorMarks.find(mark => mark.commentId === comment.id)
    );

    // Remove orphaned comments
    orphanedComments.forEach(comment => {
      console.log(`Removing comment without mark: ${comment.id} (text: "${comment.selectedText}")`);
      commentStorage.deleteComment(comment.id);
    });

    if (orphanedComments.length > 0) {
      console.log(`Cleaned up ${orphanedComments.length} comments without marks`);
    }
  }

  /**
   * Full synchronization - prioritize mark-based sync over position validation
   */
  synchronize(): void {
    console.log('=== Starting Comment Synchronization ===');
    const initialCommentCount = commentStorage.getComments().length;
    console.log(`Initial comment count: ${initialCommentCount}`);
    
    // Prioritize mark-based sync - this is more reliable
    this.syncCommentsWithMarks();
    
    // Only do position validation if mark sync didn't change anything
    const afterMarkSync = commentStorage.getComments().length;
    if (afterMarkSync === initialCommentCount) {
      console.log('No changes from mark sync, running position validation...');
      this.validateCommentPositions();
    } else {
      console.log('Mark sync made changes, skipping position validation to avoid false positives');
    }
    
    const finalCommentCount = commentStorage.getComments().length;
    console.log(`Final comment count: ${finalCommentCount}`);
    
    // Notify if comments were cleaned up
    if (initialCommentCount !== finalCommentCount) {
      console.log(`Comments changed! Calling onSyncCallback...`);
      this.onSyncCallback?.();
    }
    console.log('=== Synchronization Complete ===');
  }

  /**
   * Debounced synchronization to avoid excessive calls
   */
  debouncedSynchronize(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.synchronize();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Clean up timers
   */
  destroy(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}