// src/components/ChatBubble.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface ChatBubbleProps {
  editor: Editor | null;
  onChatClick: (selectedText: string) => void;
  onCommentClick: (selectedText: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ editor, onChatClick, onCommentClick }) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const updateBubblePosition = () => {
      const { state } = editor;
      const { selection } = state;
      const { from, to } = selection;

      // Check if there's a text selection (not just cursor)
      if (from === to || selection.empty) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      // Get the selected text
      const text = state.doc.textBetween(from, to, ' ');
      if (text.trim().length === 0) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      setSelectedText(text);

      // Get the coordinates of the selection
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Calculate position for the bubble
      const editorRect = view.dom.getBoundingClientRect();
      const bubbleTop = start.top - editorRect.top - 50; // 50px above selection
      const bubbleLeft = (start.left + end.left) / 2 - editorRect.left - 20; // Center of selection, offset by half bubble width

      setPosition({
        top: bubbleTop,
        left: Math.max(10, Math.min(bubbleLeft, editorRect.width - 50)) // Keep within editor bounds
      });
    };

    // Listen to selection changes
    editor.on('selectionUpdate', updateBubblePosition);
    editor.on('update', updateBubblePosition);

    // Also listen to mouse up events to catch selection changes
    const handleMouseUp = () => {
      setTimeout(updateBubblePosition, 10);
    };
    
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      editor.off('selectionUpdate', updateBubblePosition);
      editor.off('update', updateBubblePosition);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  if (!position || !selectedText.trim()) {
    return null;
  }

  const handleChatClick = () => {
    onChatClick(selectedText);
  };

  const handleCommentClick = () => {
    onCommentClick(selectedText);
  };

  return (
    <div
      ref={bubbleRef}
      className="selection-bubble"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '20px',
        padding: '6px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <button
        onClick={handleChatClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '12px',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Chat with AI"
      >
        <ChatIcon />
      </button>
      <button
        onClick={handleCommentClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '12px',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Add Comment"
      >
        <CommentIcon />
      </button>
    </div>
  );
};

// Chat icon SVG component
const ChatIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Comment icon SVG component  
const CommentIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
