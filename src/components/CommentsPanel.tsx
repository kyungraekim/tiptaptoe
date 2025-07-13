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
  const [isHovered, setIsHovered] = useState(false);

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
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div
      className={`thread ${comment.resolved ? 'resolved' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: '0.5rem',
        boxShadow: '0px 0px 0px 1px var(--gray-3, #d1d5db) inset',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s cubic-bezier(0.65,0.05,0.36,1)',
        marginBottom: '0.5rem',
        backgroundColor: comment.resolved ? '#f9fafb' : 'white',
        opacity: comment.resolved ? 0.7 : 1,
      }}
    >
      <div 
        className="header-group"
        style={{ 
          borderBottom: '1px solid var(--gray-3, #d1d5db)',
          padding: '0.375rem 0.5rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start'
        }}
      >
        <div style={{ flex: 1 }}>
          <div 
            className="label-group"
            style={{ 
              columnGap: '0.25rem',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: '0.5rem'
            }}
          >
            <label style={{ 
              color: 'var(--black, #000)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {formatDate(comment.timestamp)}
            </label>
          </div>
          <p style={{ 
            fontSize: '0.75rem',
            lineHeight: 1.4,
            margin: 0,
            overflow: 'hidden',
            color: 'var(--gray-5, #6b7280)',
            fontStyle: 'italic',
            backgroundColor: '#f3f4f6',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontFamily: 'monospace'
          }}>
            "{comment.selectedText}"
          </p>
        </div>
      </div>

      {isEditing ? (
        <div 
          className="comment-edit"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            padding: '0.2rem 0.8rem 0.8rem'
          }}
        >
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              height: '4.5rem',
              resize: 'none',
              padding: '0.375rem 0.625rem',
              lineHeight: 1.3,
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'inherit',
              outline: 'none'
            }}
            autoFocus
          />
          <div 
            className="flex-row"
            style={{ 
              display: 'flex',
              columnGap: '0.5rem',
              rowGap: '0.25rem'
            }}
          >
            <Button
              data-style="default"
              onClick={handleSave}
              disabled={!editContent.trim()}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.375rem',
                borderRadius: '0.375rem'
              }}
            >
              Save
            </Button>
            <Button
              data-style="default"
              onClick={handleCancel}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.375rem',
                borderRadius: '0.375rem'
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="comments-group"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0.8rem'
          }}
        >
          <div 
            className="comment"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem'
            }}
          >
            <div 
              className="comment-content"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem'
              }}
            >
              <p style={{ 
                fontSize: '0.75rem', 
                lineHeight: 1.4,
                margin: 0,
                overflow: 'hidden',
                color: '#374151'
              }}>
                {comment.content}
              </p>
              {isHovered && (
                <div 
                  className="button-group"
                  style={{ 
                    display: 'flex',
                    gap: '0.125rem',
                    alignItems: 'center'
                  }}
                >
                  <Button
                    data-style="ghost"
                    onClick={onJump}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.375rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'unset',
                      color: '#059669'
                    }}
                  >
                    Jump to
                  </Button>
                  {!comment.resolved && (
                    <>
                      <Button
                        data-style="ghost"
                        onClick={() => setIsEditing(true)}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.375rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'unset',
                          color: '#059669'
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        data-style="ghost"
                        onClick={onResolve}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.375rem',
                          borderRadius: '0.375rem',
                          color: '#059669',
                          backgroundColor: 'unset'
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
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.375rem',
                      borderRadius: '0.375rem',
                      color: '#dc2626',
                      backgroundColor: 'unset'
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
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
    <div 
      className="sidebar"
      style={{
        borderLeft: '1px solid var(--gray-3, #d1d5db)',
        flexGrow: 0,
        flexShrink: 0,
        padding: '1rem',
        width: '20rem',
        position: 'sticky',
        height: '100vh',
        top: 0,
        backgroundColor: 'white'
      }}
    >
      <div 
        className="sidebar-options"
        style={{
          alignItems: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '1rem',
          position: 'sticky',
          top: '1rem'
        }}
      >
        <div 
          className="option-group"
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
            width: '100%',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--gray-3, #d1d5db)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--black, #000)'
            }}>
              Comments
            </h3>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--gray-5, #6b7280)',
              backgroundColor: 'var(--gray-2, #f3f4f6)',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.625rem'
            }}>
              {activeCount} active
            </div>
          </div>
          
          {resolvedCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--gray-5, #6b7280)',
                cursor: 'pointer',
                fontWeight: 400
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
        
        <div 
          className="threads-group"
          style={{
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            margin: '0 -1rem',
            overflow: 'auto',
            padding: '0 1rem',
            flex: 1
          }}
        >
          {visibleComments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--gray-5, #9ca3af)',
              fontSize: '0.875rem',
              marginTop: '2.5rem',
              padding: '1rem'
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
    </div>
  );
};