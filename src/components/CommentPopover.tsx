import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@tiptaptoe/ui-components';

interface CommentPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  onSubmit: (content: string, author?: { id: string; name: string; color: string }) => void;
  onClose: () => void;
  author?: { id: string; name: string; color: string };
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  isOpen,
  position,
  selectedText,
  onSubmit,
  onClose,
  author = { id: 'default-user', name: 'User', color: '#3b82f6' },
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), author);
      setContent('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="comment-popover"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        padding: '20px',
        minWidth: '320px',
        maxWidth: '420px',
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: author.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {author.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151'
          }}>
            {author.name}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280'
          }}>
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Add comment for:
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          maxHeight: '60px',
          overflow: 'auto',
          wordBreak: 'break-word',
          lineHeight: '1.4'
        }}>
          "{selectedText}"
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your comment here..."
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          marginBottom: '12px',
        }}
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '8px' 
      }}>
        <Button
          data-style="outline"
          onClick={onClose}
          style={{ 
            fontSize: '12px', 
            padding: '6px 12px',
            backgroundColor: '#f9fafb',
            borderColor: '#d1d5db',
            color: '#374151',
            fontWeight: '500'
          }}
        >
          Cancel
        </Button>
        <Button
          data-style="default"
          onClick={handleSubmit}
          disabled={!content.trim()}
          style={{ 
            fontSize: '12px', 
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            color: 'white',
            fontWeight: '500'
          }}
        >
          Add Comment
        </Button>
      </div>
      
      <div style={{ 
        fontSize: '11px', 
        color: '#9ca3af', 
        marginTop: '8px',
        textAlign: 'center'
      }}>
        Press Cmd/Ctrl + Enter to submit
      </div>
    </div>
  );
};