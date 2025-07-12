// Test utility to verify comment system functionality
export const testCommentSystemFunctionality = () => {
  console.log('🧪 Testing Comment System Functionality');
  
  // Test 1: Check if the comments extension is properly loaded
  const testExtensionLoading = () => {
    console.log('Test 1: Extension Loading');
    
    // Try to access the editor after a short delay
    setTimeout(() => {
      const editorElement = document.querySelector('.ProseMirror');
      if (editorElement) {
        console.log('✅ Editor found');
        
        // Check if the extension is loaded
        const hasCommentsExtension = document.querySelector('[data-comment-mark]');
        if (hasCommentsExtension) {
          console.log('✅ Comments extension detected');
        } else {
          console.log('❌ Comments extension not detected');
        }
      } else {
        console.log('❌ Editor not found');
      }
    }, 1000);
  };
  
  // Test 2: Check comment highlighting styles
  const testCommentStyles = () => {
    console.log('Test 2: Comment Styles');
    
    setTimeout(() => {
      const commentElements = document.querySelectorAll('.comment-thread');
      console.log(`Found ${commentElements.length} comment threads`);
      
      commentElements.forEach((element, index) => {
        console.log(`Comment ${index + 1}:`, {
          threadId: element.getAttribute('data-thread-id'),
          text: element.textContent?.substring(0, 50) + '...',
          styles: window.getComputedStyle(element)
        });
      });
    }, 2000);
  };
  
  // Test 3: Check comments panel
  const testCommentsPanel = () => {
    console.log('Test 3: Comments Panel');
    
    setTimeout(() => {
      const commentsPanel = document.querySelector('.comments-panel');
      if (commentsPanel) {
        console.log('✅ Comments panel found');
        
        const commentItems = commentsPanel.querySelectorAll('.comment-item');
        console.log(`Found ${commentItems.length} comment items in panel`);
        
        commentItems.forEach((item, index) => {
          const content = item.querySelector('.comment-content')?.textContent;
          const author = item.querySelector('[style*="font-weight: 600"]')?.textContent;
          console.log(`Panel Comment ${index + 1}: "${content}" by ${author}`);
        });
      } else {
        console.log('❌ Comments panel not found');
      }
    }, 3000);
  };
  
  // Test 4: Content deletion synchronization
  const testContentDeletion = () => {
    console.log('Test 4: Content Deletion Synchronization');
    
    setTimeout(() => {
      console.log('📝 Testing content deletion:');
      console.log('1. Add a comment to some text');
      console.log('2. Delete the commented text');
      console.log('3. Verify the comment is automatically removed from the panel');
      console.log('4. Check that no orphaned highlights remain');
    }, 4000);
  };

  // Test 5: Undo/Redo functionality
  const testUndoRedo = () => {
    console.log('Test 5: Undo/Redo Functionality');
    
    setTimeout(() => {
      console.log('📝 Testing undo/redo:');
      console.log('1. Add a comment');
      console.log('2. Press Ctrl+Z (or Cmd+Z) to undo');
      console.log('3. Verify the comment and highlight disappear');
      console.log('4. Press Ctrl+Y (or Cmd+Shift+Z) to redo');
      console.log('5. Verify the comment and highlight reappear');
      console.log('6. Try editing a comment, then undo/redo the edit');
      console.log('7. Try deleting a comment, then undo/redo the deletion');
    }, 5000);
  };

  // Run all tests
  testExtensionLoading();
  testCommentStyles();
  testCommentsPanel();
  testContentDeletion();
  testUndoRedo();

  // Instructions
  console.log('📝 Manual Testing Instructions:');
  console.log('1. Select some text in the editor');
  console.log('2. Click the comment icon (💬) in the popup');
  console.log('3. Add a comment and submit');
  console.log('4. Check that only ONE comment appears in the panel');
  console.log('5. Try editing the comment');
  console.log('6. Try deleting the comment and verify the highlight disappears');
  console.log('7. Add multiple comments and verify each works independently');
  console.log('8. Test content deletion: delete text with comments');
  console.log('9. Test undo/redo: use Ctrl+Z and Ctrl+Y for comment operations');
};

// Auto-run the test when the script is loaded
if (typeof window !== 'undefined') {
  // Add to window for manual access
  (window as any).testCommentSystem = testCommentSystemFunctionality;
  
  // Auto-run after page load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testCommentSystemFunctionality, 2000);
  });
}