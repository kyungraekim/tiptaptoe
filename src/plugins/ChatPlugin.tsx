import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDialog } from '../components/ChatDialog';
import { CommentPopover } from '../components/CommentPopover';
import { useFileContext } from '../contexts/FileContextProvider';
import { useThreads } from '@tiptaptoe/extension-comments';
import { Comment } from '../types/comments';
import { CommentHistory } from '../utils/commentHistory';

interface ChatPluginComponentProps {
  editor: Editor;
  onCommentsChange?: (comments: Comment[]) => void;
  onCommentAdded?: () => void;
}

export const ChatPluginComponent: React.FC<ChatPluginComponentProps> = ({ editor, onCommentsChange, onCommentAdded }) => {
  const { availableFiles } = useFileContext();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedTextForChat, setSelectedTextForChat] = useState('');
  const [isCommentPopoverOpen, setIsCommentPopoverOpen] = useState(false);
  const [commentPopoverPosition, setCommentPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedTextForComment, setSelectedTextForComment] = useState('');
  const [commentSelectionRange, setCommentSelectionRange] = useState({ from: 0, to: 0 });

  // Use the new comments extension hook
  const { addComment } = useThreads(
    editor?.storage?.commentsKit?.provider,
    editor,
    { id: 'default-user', name: 'User', color: '#3b82f6' }
  );

  // Create comment history helper for undo/redo support
  const commentHistory = editor ? new CommentHistory(editor) : null;

  const handleChatClick = (selectedText: string) => {
    setSelectedTextForChat(selectedText);
    setIsChatDialogOpen(true);
  };

  const handleCommentClick = (selectedText: string) => {
    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;
    
    setSelectedTextForComment(selectedText);
    setCommentSelectionRange({ from, to });
    
    // Position the popover near the selected text
    const coords = editor.view.coordsAtPos(from);
    setCommentPopoverPosition({
      x: coords.left,
      y: coords.bottom + 10
    });
    setIsCommentPopoverOpen(true);
  };

  const currentUser = { id: 'default-user', name: 'User', color: '#3b82f6' };
  
  const handleCommentSubmit = (content: string, author?: { id: string; name: string; color: string }) => {
    if (!commentHistory) return;

    // Create thread with undo/redo support
    const success = commentHistory.createThread();
    
    if (success) {
      // Get the latest threads to find the newly created one
      const latestThreads = editor?.storage?.commentsKit?.provider?.getThreads() || [];
      const newThread = latestThreads[latestThreads.length - 1];
      
      if (newThread) {
        // Add a comment to the thread with proper author information and undo/redo support
        addComment(newThread.id, content, {
          selectedText: selectedTextForComment,
          position: commentSelectionRange,
          author: author?.name || currentUser.name,
        });

        // Save comment data to individual localStorage key for undo/redo restoration
        try {
          const commentData = {
            id: newThread.id,
            threadId: newThread.id,
            content: content,
            selectedText: selectedTextForComment,
            position: commentSelectionRange,
            author: author?.name || currentUser.name,
            timestamp: new Date(),
            resolved: false
          };
          const individualKey = `comment-${newThread.id}`;
          localStorage.setItem(individualKey, JSON.stringify(commentData));
          console.log(`Saved new comment data to individual key: ${individualKey}`);
        } catch (error) {
          console.error('Error saving comment to individual localStorage:', error);
        }

        // Refresh the comments in the panel by converting all current threads
        refreshCommentsFromProvider();
        
        // Notify parent that a comment was added
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    }
    
    // Close the popover
    setIsCommentPopoverOpen(false);
  };

  // Helper function to convert provider threads to Comment format and update state
  const refreshCommentsFromProvider = () => {
    if (!editor?.storage?.commentsKit?.provider) return;
    
    const provider = editor.storage.commentsKit.provider;
    const threads = provider.getThreads();
    
    const convertedComments: Comment[] = threads.flatMap((thread: any) => 
      thread.comments
        .filter((comment: any) => !comment.deletedAt) // Filter out deleted comments
        .map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          selectedText: comment.data?.selectedText || '',
          position: comment.data?.position || { from: 0, to: 0 },
          timestamp: comment.createdAt,
          author: comment.data?.author || currentUser.name,
          resolved: !!thread.resolvedAt,
          threadId: thread.id
        }))
    );

    if (onCommentsChange) {
      onCommentsChange(convertedComments);
    }
  };

  const handleApplyResponse = (response: string, action: 'append' | 'replace') => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;

    if (action === 'replace') {
      // Replace the selected text with parsed HTML content
      editor.chain().focus().deleteRange({ from, to }).insertContent(response).run();
    } else if (action === 'append') {
      // Find the end of the current paragraph/block that contains the selection
      const $pos = state.doc.resolve(to);
      const blockEnd = $pos.end($pos.depth);
      
      // Move to end of the current paragraph and append on the next line
      editor.chain().focus().setTextSelection(blockEnd).insertContent(response).run();
    }
  };

  return (
    <>
      {/* Chat bubble overlay */}
      <ChatBubble 
        editor={editor} 
        onChatClick={handleChatClick}
        onCommentClick={handleCommentClick}
      />

      {/* Chat dialog */}
      <ChatDialog
        isOpen={isChatDialogOpen}
        onClose={() => setIsChatDialogOpen(false)}
        selectedText={selectedTextForChat}
        onApplyResponse={handleApplyResponse}
        initialFiles={availableFiles}
      />

      {/* Comment popover */}
      <CommentPopover
        isOpen={isCommentPopoverOpen}
        position={commentPopoverPosition}
        selectedText={selectedTextForComment}
        onSubmit={handleCommentSubmit}
        onClose={() => setIsCommentPopoverOpen(false)}
        author={currentUser}
      />
    </>
  );
};

// Chat plugin definition
export const chatPlugin = {
  name: 'chat',
  component: ChatPluginComponent as any,
};

// Chat plugin factory function that accepts onCommentsChange
export const createChatPlugin = (
  onCommentsChange?: (comments: Comment[]) => void, 
  onCommentAdded?: () => void
) => ({
  name: 'chat',
  component: (props: { editor: Editor }) => (
    <ChatPluginComponent 
      editor={props.editor} 
      onCommentsChange={onCommentsChange}
      onCommentAdded={onCommentAdded}
    />
  ),
});