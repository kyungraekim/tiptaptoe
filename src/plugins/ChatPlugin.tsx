import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDialog } from '../components/ChatDialog';
import { CommentPopover } from '../components/CommentPopover';
import { useFileContext } from '../contexts/FileContextProvider';
import { commentStorage } from '../utils/commentStorage';
import { Comment } from '../types/comments';

interface ChatPluginComponentProps {
  editor: Editor;
  onCommentsChange?: (comments: Comment[]) => void;
}

export const ChatPluginComponent: React.FC<ChatPluginComponentProps> = ({ editor, onCommentsChange }) => {
  const { availableFiles } = useFileContext();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedTextForChat, setSelectedTextForChat] = useState('');
  const [isCommentPopoverOpen, setIsCommentPopoverOpen] = useState(false);
  const [commentPopoverPosition, setCommentPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedTextForComment, setSelectedTextForComment] = useState('');
  const [commentSelectionRange, setCommentSelectionRange] = useState({ from: 0, to: 0 });

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

  const handleCommentSubmit = (content: string) => {
    const newComment = commentStorage.addComment({
      content,
      selectedText: selectedTextForComment,
      position: commentSelectionRange,
    });

    // Apply comment mark to the selected text
    editor.chain()
      .focus()
      .setTextSelection(commentSelectionRange)
      .setCommentMark({ commentId: newComment.id })
      .run();

    // Notify parent component about comments change
    if (onCommentsChange) {
      onCommentsChange(commentStorage.getComments());
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
export const createChatPlugin = (onCommentsChange?: (comments: Comment[]) => void) => ({
  name: 'chat',
  component: (props: { editor: Editor }) => (
    <ChatPluginComponent editor={props.editor} onCommentsChange={onCommentsChange} />
  ),
});