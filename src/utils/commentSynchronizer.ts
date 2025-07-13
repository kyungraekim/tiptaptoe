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
   * Finds continuous ranges of marked text for each threadId
   */
  getEditorThreadMarks(): ThreadMark[] {
    if (!this.editor) return [];
    
    const { doc } = this.editor.state;
    const marks: ThreadMark[] = [];
    
    try {
      // Group consecutive marked nodes by threadId
      const threadRanges = new Map<string, Array<{from: number, to: number}>>();
      
      doc.descendants((node, pos) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'commentMark' && mark.attrs.threadId) {
              const threadId = mark.attrs.threadId;
              const nodeStart = pos;
              const nodeEnd = pos + node.nodeSize;
              
              if (!threadRanges.has(threadId)) {
                threadRanges.set(threadId, []);
              }
              
              threadRanges.get(threadId)!.push({ from: nodeStart, to: nodeEnd });
            }
          });
        }
      });
      
      // Merge consecutive ranges for each thread
      threadRanges.forEach((ranges, threadId) => {
        // Sort ranges by position
        ranges.sort((a, b) => a.from - b.from);
        
        // Merge consecutive/overlapping ranges
        const mergedRanges: Array<{from: number, to: number}> = [];
        let currentRange = ranges[0];
        
        for (let i = 1; i < ranges.length; i++) {
          const nextRange = ranges[i];
          
          // If ranges are consecutive or overlapping, merge them
          if (nextRange.from <= currentRange.to) {
            currentRange.to = Math.max(currentRange.to, nextRange.to);
          } else {
            // Gap between ranges, start a new range
            mergedRanges.push(currentRange);
            currentRange = nextRange;
          }
        }
        mergedRanges.push(currentRange);
        
        // Add each merged range as a separate ThreadMark
        mergedRanges.forEach(range => {
          marks.push({
            threadId,
            from: range.from,
            to: range.to,
          });
        });
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
   * Create missing threads for marks that exist in the document but not in the provider
   * This handles the case where undo restored comment marks but threads were deleted
   */
  createMissingThreadsFromMarks(): void {
    const provider = this.getProvider();
    if (!provider) return;

    const editorMarks = this.getEditorThreadMarks();
    const existingThreads = provider.getThreads();
    
    console.log(`Checking for missing threads: Found ${editorMarks.length} thread marks and ${existingThreads.length} stored threads`);
    console.log('Editor marks:', editorMarks.map(m => ({ threadId: m.threadId, from: m.from, to: m.to, text: this.editor.state.doc.textBetween(m.from, m.to) })));
    console.log('Existing threads:', existingThreads.map((t: any) => ({ id: t.id, comments: t.comments.length })));
    
    // Find marks that don't have corresponding threads in the provider
    const missingThreads = editorMarks.filter((mark) => 
      !existingThreads.find((thread: any) => thread.id === mark.threadId)
    );
    
    console.log('Missing threads to restore:', missingThreads.map(m => ({ threadId: m.threadId, from: m.from, to: m.to })));

    missingThreads.forEach((mark) => {
      console.log(`Creating missing thread for mark: ${mark.threadId} at ${mark.from}-${mark.to}`);
      
      // Try to restore from localStorage
      const storedCommentKey = `comment-${mark.threadId}`;
      let commentData: any = null;
      
      try {
        const stored = localStorage.getItem(storedCommentKey);
        if (stored) {
          commentData = JSON.parse(stored);
          console.log('Found stored comment data:', commentData);
        }
      } catch (error) {
        console.error('Error loading stored comment:', error);
      }
      
      // Use stored position if available and valid, otherwise use mark position
      let from = mark.from;
      let to = mark.to;
      let selectedText = '';
      
      try {
        selectedText = this.editor.state.doc.textBetween(from, to);
        
        // If we have stored position data, try to use it
        if (commentData?.position) {
          const storedFrom = commentData.position.from;
          const storedTo = commentData.position.to;
          
          // Verify the stored position is still valid
          if (storedFrom >= 0 && storedTo <= this.editor.state.doc.content.size && storedFrom < storedTo) {
            const storedText = this.editor.state.doc.textBetween(storedFrom, storedTo);
            
            // If the stored text matches the original selected text, use stored position
            if (commentData.selectedText && storedText === commentData.selectedText) {
              from = storedFrom;
              to = storedTo;
              selectedText = storedText;
              console.log(`Using stored position ${from}-${to} for thread ${mark.threadId}`);
            } else {
              console.log(`Stored position text mismatch for ${mark.threadId}, using mark position`);
            }
          }
        }
      } catch (error) {
        console.error('Error calculating position for thread', mark.threadId, error);
        selectedText = commentData?.selectedText || 'Restored text';
      }
      
      // Create thread directly in provider (don't use createThread command as it might interfere with existing marks)
      try {
        provider.createThread(mark.threadId, {});
        console.log('Thread created successfully in provider, adding comment content');
        
        // Try to find comment data from the main localStorage storage if not found in individual keys
        if (!commentData) {
          try {
            const mainStorage = localStorage.getItem('tiptaptoe_comments');
            if (mainStorage) {
              const allComments = JSON.parse(mainStorage);
              // Find comment with matching threadId
              commentData = allComments.find((c: any) => c.threadId === mark.threadId || c.id === mark.threadId);
              if (commentData) {
                console.log('Found comment data in main storage:', commentData);
              }
            }
          } catch (error) {
            console.error('Error reading main comment storage:', error);
          }
        }
        
        const content = commentData?.content || `Restored comment for "${selectedText}"`;
        const author = commentData?.author || 'User';
        
        // Add comment to the newly created thread
        provider.createComment?.(
          mark.threadId,
          content,
          author,
          {
            selectedText: commentData?.selectedText || selectedText,
            position: { from: from, to: to },
            author: author
          }
        );
        
        // Save to individual localStorage key for future restoration
        if (commentData) {
          try {
            const individualKey = `comment-${mark.threadId}`;
            localStorage.setItem(individualKey, JSON.stringify({
              id: mark.threadId,
              threadId: mark.threadId,
              content: content,
              selectedText: commentData.selectedText || selectedText,
              position: { from: from, to: to },
              author: author,
              timestamp: commentData.timestamp || new Date(),
              resolved: commentData.resolved || false
            }));
            console.log(`Saved comment data to individual key: ${individualKey}`);
          } catch (error) {
            console.error('Error saving to individual localStorage:', error);
          }
        }
      } catch (error) {
        console.error(`Failed to create thread for ${mark.threadId}:`, error);
      }
    });

    if (missingThreads.length > 0) {
      console.log(`Created ${missingThreads.length} missing threads`);
      this.onSyncCallback?.();
    }
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
    
    // First, create missing threads for any marks that exist but don't have threads
    // This handles undo restoration
    this.createMissingThreadsFromMarks();
    
    // Then, sync threads with marks - removes orphaned threads
    this.syncThreadsWithMarks();
    
    // Finally, validate positions of remaining threads
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