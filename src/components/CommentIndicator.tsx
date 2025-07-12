import React from 'react';

interface CommentIndicatorProps {
  threadId: string;
  content: string;
  author: string;
  timestamp: Date;
  position: { x: number; y: number };
  onClick: () => void;
  isHovered?: boolean;
}

export const CommentIndicator: React.FC<CommentIndicatorProps> = ({
  content,
  author,
  timestamp,
  position,
  onClick,
  isHovered = false,
}) => {
  // Truncate content for preview
  const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={`comment-indicator ${isHovered ? 'hovered' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px',
        minWidth: '200px',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: isHovered ? 1 : 0.9,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onClick={onClick}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: '600'
        }}>
          {author.charAt(0).toUpperCase()}
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151'
        }}>
          {author}
        </div>
        <div style={{
          fontSize: '10px',
          color: '#6b7280',
          marginLeft: 'auto'
        }}>
          {formatTimestamp(timestamp)}
        </div>
      </div>
      
      <div style={{
        fontSize: '12px',
        color: '#4b5563',
        lineHeight: '1.4',
        wordBreak: 'break-word'
      }}>
        {truncatedContent}
      </div>
      
      {content.length > 50 && (
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '4px',
          fontStyle: 'italic'
        }}>
          Click to read more...
        </div>
      )}
    </div>
  );
};