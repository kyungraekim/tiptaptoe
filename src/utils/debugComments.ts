import { commentStorage } from './commentStorage';

// Debug utility for testing comment synchronization
// Can be called from browser console: window.debugComments()
export function debugComments() {
  console.log('=== Comment Debug Info ===');
  
  const comments = commentStorage.getComments();
  console.log(`Total comments in storage: ${comments.length}`);
  
  comments.forEach((comment, index) => {
    console.log(`Comment ${index + 1}:`, {
      id: comment.id,
      selectedText: comment.selectedText,
      position: comment.position,
      content: comment.content.substring(0, 50) + '...',
      resolved: comment.resolved
    });
  });
  
  // Try to find the editor instance
  const editorElements = document.querySelectorAll('.ProseMirror');
  console.log(`Found ${editorElements.length} editor elements`);
  
  // Look for comment marks in the DOM
  const commentMarkElements = document.querySelectorAll('.comment-mark');
  console.log(`Found ${commentMarkElements.length} comment mark elements in DOM`);
  
  commentMarkElements.forEach((element, index) => {
    const commentId = element.getAttribute('data-comment-id');
    console.log(`Mark ${index + 1}: commentId=${commentId}, text="${element.textContent}"`);
  });
  
  console.log('=== End Debug Info ===');
}

// Test function to create and delete comments for testing
export function testCommentOrphaning() {
  console.log('=== Testing Comment Orphaning ===');
  
  // Add test comment
  const testComment = commentStorage.addComment({
    content: 'Test comment for orphaning',
    selectedText: 'test text',
    position: { from: 0, to: 9 }
  });
  
  console.log('Created test comment:', testComment.id);
  
  // Wait a bit, then check if it gets cleaned up
  setTimeout(() => {
    const remainingComments = commentStorage.getComments();
    const testStillExists = remainingComments.find(c => c.id === testComment.id);
    
    if (testStillExists) {
      console.log('Test comment still exists (this might be expected if text is still there)');
    } else {
      console.log('Test comment was automatically cleaned up!');
    }
    
    debugComments();
  }, 2000);
}

// Manual sync trigger for testing
export function manualSync() {
  console.log('=== Manual Sync Triggered ===');
  
  // Try to find the synchronizer in the global scope
  const editorElements = document.querySelectorAll('.ProseMirror');
  if (editorElements.length > 0) {
    // Try to trigger a document change event
    const event = new Event('input', { bubbles: true });
    editorElements[0].dispatchEvent(event);
    console.log('Dispatched input event to trigger sync');
  }
  
  // Also manually check for orphaned comments
  setTimeout(() => {
    debugComments();
  }, 1000);
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugComments = debugComments;
  (window as any).testCommentOrphaning = testCommentOrphaning;
  (window as any).manualSync = manualSync;
  console.log('Debug functions available: window.debugComments(), window.testCommentOrphaning(), window.manualSync()');
}