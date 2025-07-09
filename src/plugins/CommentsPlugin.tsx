import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { CommentPopover } from '../components/CommentPopover';
import { Comment } from '../types/comments';
import { commentStorage } from '../utils/commentStorage';

interface CommentsPluginComponentProps {
  editor: Editor;
  onCommentsChange?: (comments: Comment[]) => void;
}

export const CommentsPluginComponent: React.FC<CommentsPluginComponentProps> = ({ 
  editor, 
  onCommentsChange 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ from: 0, to: 0 });

  // Load comments on mount
  useEffect(() => {
    const loadedComments = commentStorage.getComments();
    setComments(loadedComments);
    onCommentsChange?.(loadedComments);
  }, [onCommentsChange]);

  // Handle selection change to show comment option
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const { from, to } = selection;

      if (from !== to) {
        const text = state.doc.textBetween(from, to);
        if (text.trim()) {
          setSelectedText(text);
          setSelectionRange({ from, to });
        }
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Handle keyboard shortcut for adding comments (Cmd/Ctrl + Shift + C)
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        const { state } = editor;
        const { selection } = state;
        const { from, to } = selection;

        if (from !== to) {
          const text = state.doc.textBetween(from, to);
          if (text.trim()) {
            setSelectedText(text);
            setSelectionRange({ from, to });
            // Position the popover near the selected text
            const coords = editor.view.coordsAtPos(from);
            setPopoverPosition({ x: coords.left, y: coords.bottom + 10 });
            setIsPopoverOpen(true);
          }
        }
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('keydown', handleKeyDown);
    
    return () => {
      editorDom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  // Handle right-click to add comment
  useEffect(() => {
    if (!editor || !editor.view || !editor.view.dom) return;

    const handleContextMenu = (e: MouseEvent) => {
      setTimeout(() => {
        const { state } = editor;
        const { selection } = state;
        const { from, to } = selection;

        if (from !== to) {
          e.preventDefault();
          e.stopPropagation();
          const text = state.doc.textBetween(from, to);
          if (text.trim()) {
            setSelectedText(text);
            setSelectionRange({ from, to });
            setPopoverPosition({ x: e.clientX, y: e.clientY });
            setIsPopoverOpen(true);
          }
        }
      }, 0);
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('contextmenu', handleContextMenu, { passive: false });
    
    return () => {
      editorDom.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [editor]);

  const handleCommentSubmit = useCallback((content: string) => {
    const newComment = commentStorage.addComment({
      content,
      selectedText,
      position: {
        from: selectionRange.from,
        to: selectionRange.to,
      },
    });

    // Apply comment mark to the selected text
    if (editor) {
      editor.chain()
        .focus()
        .setTextSelection(selectionRange)
        .setCommentMark({ commentId: newComment.id })
        .run();
    }

    const updatedComments = commentStorage.getComments();
    setComments(updatedComments);
    onCommentsChange?.(updatedComments);
  }, [editor, selectedText, selectionRange, onCommentsChange]);

  const handleCommentClick = useCallback((commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && editor) {
      // Highlight the comment in the editor
      editor.chain()
        .focus()
        .setTextSelection(comment.position)
        .run();
    }
  }, [comments, editor]);

  // Add click handler for comment marks
  useEffect(() => {
    if (!editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const commentMark = target.closest('.comment-mark');
      if (commentMark) {
        const commentId = commentMark.getAttribute('data-comment-id');
        if (commentId) {
          handleCommentClick(commentId);
        }
      }
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('click', handleClick);
    
    return () => {
      editorDom.removeEventListener('click', handleClick);
    };
  }, [editor, handleCommentClick]);

  return (
    <>
      <CommentPopover
        isOpen={isPopoverOpen}
        position={popoverPosition}
        selectedText={selectedText}
        onSubmit={handleCommentSubmit}
        onClose={() => setIsPopoverOpen(false)}
      />
    </>
  );
};

// Comments plugin definition
export const commentsPlugin = {
  name: 'comments',
  extensions: [],
  component: CommentsPluginComponent as any,
};