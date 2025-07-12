import { Editor } from '@tiptap/react';

export interface ThreadMark {
  threadId: string;
  from: number;
  to: number;
}

export class CommentSynchronizer {
  private editor: Editor;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 200;
  private onSyncCallback?: () => void;

  constructor(editor: Editor, onSyncCallback?: () => void) {
    this.editor = editor;
    this.onSyncCallback = onSyncCallback;
  }

  /**
   * Get all thread marks currently in the editor by traversing the document
   */
  getEditorThreadMarks(): ThreadMark[] {
    if (!this.editor) return [];
    
    const marks: ThreadMark[] = [];
    const { doc } = this.editor.state;
    
    try {
      doc.descendants((node, pos) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'commentMark' && mark.attrs.threadId) {
              marks.push({
                threadId: mark.attrs.threadId,
                from: pos,
                to: pos + node.nodeSize,
              });
            }
          });
        }
      });
      
      return marks;
    } catch (error) {
      console.error('Error getting thread marks:', error);
      return [];
    }
  }

  /**
   * Get the comments provider from the editor
   */
  private getProvider() {
    return this.editor?.storage?.commentsKit?.provider;
  }

  /**
   * Remove threads that don't have corresponding marks in the document
   * This handles the case where text with comments was deleted
   */
  syncThreadsWithMarks(): void {
    const provider = this.getProvider();
    if (!provider) return;

    const editorMarks = this.getEditorThreadMarks();
    const existingThreads = provider.getThreads();
    
    console.log(`Syncing: Found ${editorMarks.length} thread marks and ${existingThreads.length} stored threads`);
    
    // Find threads that don't have corresponding marks in the document
    const orphanedThreads = existingThreads.filter((thread: any) => 
      !editorMarks.find(mark => mark.threadId === thread.id)
    );

    // Remove orphaned threads
    orphanedThreads.forEach((thread: any) => {
      console.log(`Removing orphaned thread: ${thread.id} (comments: ${thread.comments.length})`);
      (this.editor.commands as any).removeThread?.({ id: thread.id });
    });

    if (orphanedThreads.length > 0) {
      console.log(`Cleaned up ${orphanedThreads.length} orphaned threads`);
      this.onSyncCallback?.();
    }
  }

  /**
   * Validate thread positions against current document content
   * Remove threads where the marked text no longer exists or is invalid
   */
  validateThreadPositions(): void {
    const provider = this.getProvider();
    if (!provider) return;

    const { doc } = this.editor.state;
    const docSize = doc.content.size;
    const editorMarks = this.getEditorThreadMarks();
    
    const threadsToRemove: string[] = [];
    
    editorMarks.forEach(mark => {
      const { threadId, from, to } = mark;
      
      // Check if positions are beyond document bounds
      if (from > docSize || to > docSize || from < 0 || to < 0) {
        console.log(`Thread ${threadId} has out-of-bounds position: ${from}-${to} (docSize: ${docSize})`);
        threadsToRemove.push(threadId);
        return;
      }
      
      // Check if we can extract text at these positions
      try {
        const currentText = doc.textBetween(from, to);
        
        // If the text is completely empty, the content was likely deleted
        if (currentText.trim() === '') {
          console.log(`Thread ${threadId} has empty text at position ${from}-${to}, content was deleted`);
          threadsToRemove.push(threadId);
        }
        
      } catch (error) {
        console.log(`Cannot extract text for thread ${threadId} at positions ${from}-${to}:`, error);
        threadsToRemove.push(threadId);
      }
    });

    // Remove invalid threads
    threadsToRemove.forEach(threadId => {
      console.log(`Removing thread with invalid position: ${threadId}`);
      (this.editor.commands as any).removeThread?.({ id: threadId });
    });

    if (threadsToRemove.length > 0) {
      console.log(`Cleaned up ${threadsToRemove.length} threads with invalid positions`);
      this.onSyncCallback?.();
    }
  }

  /**
   * Full synchronization using the new thread-based system
   */
  synchronize(): void {
    console.log('=== Starting Thread Synchronization ===');
    
    const provider = this.getProvider();
    if (!provider) {
      console.log('No comments provider available, skipping sync');
      return;
    }
    
    const initialThreadCount = provider.getThreads().length;
    console.log(`Initial thread count: ${initialThreadCount}`);
    
    // First, sync threads with marks - removes orphaned threads
    this.syncThreadsWithMarks();
    
    // Then validate positions of remaining threads
    this.validateThreadPositions();
    
    const finalThreadCount = provider.getThreads().length;
    console.log(`Final thread count: ${finalThreadCount}`);
    console.log('=== Thread Synchronization Complete ===');
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