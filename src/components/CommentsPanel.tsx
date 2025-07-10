import React, { useState } from 'react';
import { Button } from '@tiptaptoe/ui-components';
import { Comment } from '../types/comments';

interface CommentsPanelProps {
  comments: Comment[];
  onCommentUpdate: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentResolve: (commentId: string) => void;
  onCommentJump: (commentId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onResolve: () => void;
  onJump: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete,
  onResolve,
  onJump,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        backgroundColor: comment.resolved ? '#f9fafb' : 'white',
        opacity: comment.resolved ? 0.7 : 1,
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '8px' 
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            marginBottom: '4px',
            fontWeight: '500'
          }}>
            {formatDate(comment.timestamp)}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#9ca3af',
            backgroundColor: '#f3f4f6',
            padding: '4px 6px',
            borderRadius: '4px',
            marginBottom: '8px',
            fontFamily: 'monospace',
            maxHeight: '40px',
            overflow: 'hidden',
            wordBreak: 'break-word',
            lineHeight: '1.3'
          }}>
            "{comment.selectedText}"
          </div>
        </div>
        
        <Button
          data-style="ghost"
          onClick={onJump}
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px',
            marginLeft: '8px',
            color: '#6b7280'
          }}
        >
          Jump to
        </Button>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              marginBottom: '8px',
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button
              data-style="default"
              onClick={handleSave}
              disabled={!editContent.trim()}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Save
            </Button>
            <Button
              data-style="default"
              onClick={handleCancel}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            fontSize: '13px', 
            color: '#374151',
            marginBottom: '8px',
            lineHeight: '1.4'
          }}>
            {comment.content}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            alignItems: 'center'
          }}>
            {!comment.resolved && (
              <>
                <Button
                  data-style="ghost"
                  onClick={() => setIsEditing(true)}
                  style={{ 
                    fontSize: '10px', 
                    padding: '3px 6px',
                    color: '#6b7280'
                  }}
                >
                  Edit
                </Button>
                <Button
                  data-style="ghost"
                  onClick={onResolve}
                  style={{ 
                    fontSize: '10px', 
                    padding: '3px 6px',
                    color: '#059669'
                  }}
                >
                  Resolve
                </Button>
              </>
            )}
            <Button
              data-style="ghost"
              onClick={onDelete}
              style={{ 
                fontSize: '10px', 
                padding: '3px 6px',
                color: '#dc2626'
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  onCommentUpdate,
  onCommentDelete,
  onCommentResolve,
  onCommentJump,
}) => {
  const [showResolved, setShowResolved] = useState(false);

  const visibleComments = comments.filter(comment => 
    showResolved || !comment.resolved
  );

  const resolvedCount = comments.filter(c => c.resolved).length;
  const activeCount = comments.filter(c => !c.resolved).length;

  return (
    <div className="comments-panel" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
          }}>
            Comments
          </h3>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '10px',
          }}>
            {activeCount} active
          </div>
        </div>
        
        {resolvedCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#6b7280',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                style={{ margin: 0 }}
              />
              Show resolved ({resolvedCount})
            </label>
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
      }}>
        {visibleComments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            marginTop: '40px',
          }}>
            {comments.length === 0 
              ? 'No comments yet. Right-click on selected text to add a comment.' 
              : 'No active comments. Toggle "Show resolved" to see resolved comments.'
            }
          </div>
        ) : (
          visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={(content) => onCommentUpdate(comment.id, content)}
              onDelete={() => onCommentDelete(comment.id)}
              onResolve={() => onCommentResolve(comment.id)}
              onJump={() => onCommentJump(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};