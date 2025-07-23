/**
 * Browser test script for transaction-based comment system
 * 
 * Run this in the browser console to test the comment functionality
 */

export const testTransactionComments = () => {
  console.log('🧪 Testing Transaction-Based Comment System Integration');
  
  // Get the transaction manager from global scope
  const manager = (window as any).transactionCommentManager;
  
  if (!manager) {
    console.error('❌ TransactionCommentManager not found. Make sure the app is loaded.');
    return;
  }
  
  console.log('✅ TransactionCommentManager found');
  
  // Test integration with undo/redo
  console.log('\n🔄 Testing Undo/Redo Integration...');
  
  // Check if we can access editor commands
  const editorCanUndo = manager.canUndo();
  const editorCanRedo = manager.canRedo();
  console.log('Editor can undo:', editorCanUndo);
  console.log('Editor can redo:', editorCanRedo);
  
  // Test 1: Create a comment
  console.log('\n📝 Test 1: Creating a comment...');
  const testComment = {
    id: `test-comment-${Date.now()}`,
    content: 'This is a test comment from transaction system',
    selectedText: 'test text',
    position: { from: 0, to: 9 },
    author: 'Test User'
  };
  
  const createResult = manager.createCommentTransaction(testComment);
  console.log('Create result:', createResult);
  
  // Test 2: Check if comment appears in cache
  console.log('\n📋 Test 2: Checking comment cache...');
  const allComments = manager.getAllCommentsFromHistory();
  console.log('Comments in cache:', allComments);
  console.log('Found test comment:', allComments.find((c: any) => c.id === testComment.id));
  
  // Test 3: Update the comment
  console.log('\n✏️ Test 3: Updating comment...');
  const updateResult = manager.updateCommentTransaction(testComment.id, {
    content: 'Updated test comment content'
  });
  console.log('Update result:', updateResult);
  
  // Check updated comment
  const updatedComments = manager.getAllCommentsFromHistory();
  const updatedComment = updatedComments.find((c: any) => c.id === testComment.id);
  console.log('Updated comment:', updatedComment);
  
  // Test 4: Test undo/redo
  console.log('\n↶ Test 4: Testing undo/redo...');
  console.log('Can undo:', manager.canUndo());
  console.log('Can redo:', manager.canRedo());
  
  if (manager.canUndo()) {
    console.log('Performing undo...');
    manager.undo();
    console.log('Comments after undo:', manager.getAllCommentsFromHistory());
    
    if (manager.canRedo()) {
      console.log('Performing redo...');
      manager.redo();
      console.log('Comments after redo:', manager.getAllCommentsFromHistory());
    }
  }
  
  // Test 5: Delete comment
  console.log('\n🗑️ Test 5: Deleting comment...');
  const deleteResult = manager.deleteCommentTransaction(testComment.id);
  console.log('Delete result:', deleteResult);
  
  const finalComments = manager.getAllCommentsFromHistory();
  console.log('Comments after deletion:', finalComments);
  console.log('Test comment still exists:', finalComments.find((c: any) => c.id === testComment.id));
  
  // Test 6: Test unified document structure
  console.log('\n📄 Test 6: Testing unified document structure...');
  const document = manager.getDocumentWithComments();
  console.log('Unified document:', document);
  console.log('Document has content:', !!document.content);
  console.log('Document has comments array:', Array.isArray(document.comments));
  
  // Test 7: Test comment persistence through undo/redo after deletion
  console.log('\n🔄 Test 7: Testing comment persistence through undo/redo...');
  
  // Create a test comment
  const persistenceTestComment = {
    id: `persistence-test-${Date.now()}`,
    content: 'This comment should survive undo/redo',
    selectedText: 'test persistence',
    position: { from: 5, to: 20 },
    author: 'Test User'
  };
  
  const persistenceResult = manager.createCommentTransaction(persistenceTestComment);
  console.log('Created persistence test comment:', persistenceResult);
  
  // Check comments before undo
  const commentsBeforeUndo = manager.getAllCommentsFromHistory();
  console.log('Comments before undo:', commentsBeforeUndo.length);
  
  // Perform undo
  if (manager.canUndo()) {
    console.log('Performing undo...');
    manager.undo();
    
    const commentsAfterUndo = manager.getAllCommentsFromHistory();
    console.log('Comments after undo:', commentsAfterUndo.length);
    
    // Perform redo
    if (manager.canRedo()) {
      console.log('Performing redo...');
      manager.redo();
      
      const commentsAfterRedo = manager.getAllCommentsFromHistory();
      console.log('Comments after redo:', commentsAfterRedo.length);
      
      // Check if comment is restored
      const restoredComment = commentsAfterRedo.find((c: any) => c.id === persistenceTestComment.id);
      console.log('Comment restored after redo:', !!restoredComment);
      
      if (restoredComment) {
        console.log('✅ Comment persistence through undo/redo works!');
      } else {
        console.log('❌ Comment was not restored after redo');
      }
    }
  }
  
  console.log('\n✅ Transaction-based comment system integration test complete!');
  console.log('💡 Try adding a comment through the UI and test undo/redo manually');
};

// Auto-expose to window for easy access
if (typeof window !== 'undefined') {
  (window as any).testTransactionComments = testTransactionComments;
  console.log('💡 Run testTransactionComments() in the console to test the comment system');
}

// Auto-run after a delay to let the app initialize
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if ((window as any).transactionCommentManager) {
      console.log('🚀 Transaction comment system is ready for testing!');
      console.log('Run testTransactionComments() to test the system');
    }
  }, 3000);
}