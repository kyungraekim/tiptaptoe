# Comment System Migration Test Plan

## What Was Changed

The comment system has been migrated from using the CommentsKit provider to the TransactionCommentManager for better undo/redo support and AI integration.

### Key Changes:

1. **App.tsx**: 
   - Replaced provider-based comment operations with TransactionCommentManager
   - Added `commentManagerRef` to manage the instance
   - Updated all comment handlers (update, delete, resolve, jump)

2. **AppEditor.tsx**: 
   - Initialize TransactionCommentManager when editor is ready
   - Set up undo/redo listeners for automatic comment restoration
   - Pass commentManagerRef to ChatPlugin

3. **ChatPlugin.tsx**: 
   - Replaced provider-based comment creation with TransactionCommentManager
   - Simplified comment creation flow

4. **TransactionCommentManager.ts**: 
   - Enhanced with UI integration methods
   - Added localStorage persistence for undo/redo recovery
   - Improved undo/redo detection and handling
   - Added comment scanning from document marks

## Testing Steps

### 1. Basic Comment Operations
- [ ] Create a comment by selecting text and using the comment popup
- [ ] Verify comment appears in the side panel
- [ ] Edit a comment in the panel
- [ ] Delete a comment from the panel
- [ ] Resolve a comment in the panel
- [ ] Jump to a comment by clicking "Jump to"

### 2. Undo/Redo with Comments
- [ ] Create a comment on some text
- [ ] Delete the text containing the comment
- [ ] Verify comment disappears from panel
- [ ] Use Ctrl+Z (undo) to restore the text
- [ ] **CRITICAL**: Verify comment reappears in the panel after undo
- [ ] Use Ctrl+Y (redo) to delete text again
- [ ] Verify comment disappears again

### 3. Complex Scenarios
- [ ] Create multiple comments
- [ ] Delete some text with comments, keep other comments
- [ ] Undo and verify only the affected comments return
- [ ] Mix content editing with comment operations
- [ ] Test undo/redo through multiple comment and content changes

### 4. Edge Cases
- [ ] Create comment, immediately undo creation
- [ ] Edit comment content, undo the edit
- [ ] Resolve comment, undo the resolution
- [ ] Delete comment, undo the deletion

## Expected Behavior

After this migration:
- Comments should persist through undo/redo operations
- The UI panel should automatically update when comments are restored
- All existing comment functionality should work unchanged
- Comments should be properly synchronized between the editor and panel

## Debugging

If issues occur, check:
- Browser console for TransactionCommentManager logs
- `window.transactionCommentManager` for debugging
- localStorage for persisted comment data
- Undo/redo detection logs in console

## Rollback Plan

If the migration fails, the old system can be restored by:
1. Reverting the changes to use CommentsKit provider
2. Re-enabling the old comment handlers in App.tsx
3. Removing TransactionCommentManager integration