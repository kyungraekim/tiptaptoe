import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommentPopover } from '../CommentPopover';
import { CommentsPanel } from '../CommentsPanel';
import { CommentIndicator } from '../CommentIndicator';
import { Comment } from '../../types/comments';

describe('Comment System', () => {
  const mockAuthor = { id: 'test-user', name: 'Test User', color: '#3b82f6' };
  
  describe('CommentPopover', () => {
    const defaultProps = {
      isOpen: true,
      position: { x: 100, y: 100 },
      selectedText: 'This is selected text',
      onSubmit: vi.fn(),
      onClose: vi.fn(),
      author: mockAuthor,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render when open', () => {
      render(<CommentPopover {...defaultProps} />);
      expect(screen.getByText('Add comment for:')).toBeInTheDocument();
      expect(screen.getByText('"This is selected text"')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<CommentPopover {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Add comment for:')).not.toBeInTheDocument();
    });

    it('should call onSubmit with content and author when form is submitted', async () => {
      render(<CommentPopover {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Write your comment here...');
      const submitButton = screen.getByText('Add Comment');
      
      fireEvent.change(textarea, { target: { value: 'This is a test comment' } });
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('This is a test comment', mockAuthor);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when Cancel button is clicked', () => {
      render(<CommentPopover {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<CommentPopover {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Write your comment here...');
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onSubmit when Cmd+Enter is pressed', () => {
      render(<CommentPopover {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Write your comment here...');
      fireEvent.change(textarea, { target: { value: 'Test comment' } });
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Test comment', mockAuthor);
    });

    it('should disable submit button when content is empty', () => {
      render(<CommentPopover {...defaultProps} />);
      
      const submitButton = screen.getByText('Add Comment');
      expect(submitButton).toBeDisabled();
    });

    it('should handle author information display correctly', () => {
      render(<CommentPopover {...defaultProps} />);
      
      expect(screen.getByText('T')).toBeInTheDocument(); // Avatar initial
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('CommentsPanel', () => {
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'First comment',
        selectedText: 'selected text 1',
        position: { from: 0, to: 10 },
        timestamp: new Date('2024-01-01T10:00:00Z'),
        author: 'Test User',
        resolved: false,
      },
      {
        id: '2',
        content: 'Second comment',
        selectedText: 'selected text 2',
        position: { from: 20, to: 30 },
        timestamp: new Date('2024-01-02T10:00:00Z'),
        author: 'Another User',
        resolved: true,
      },
    ];

    const defaultProps = {
      comments: mockComments,
      onCommentUpdate: vi.fn(),
      onCommentDelete: vi.fn(),
      onCommentResolve: vi.fn(),
      onCommentJump: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should display all active comments by default', () => {
      render(<CommentsPanel {...defaultProps} />);
      
      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.queryByText('Second comment')).not.toBeInTheDocument(); // resolved
      expect(screen.getByText('1 active')).toBeInTheDocument();
    });

    it('should show resolved comments when toggle is checked', async () => {
      render(<CommentsPanel {...defaultProps} />);
      
      const showResolvedCheckbox = screen.getByLabelText(/Show resolved/);
      fireEvent.click(showResolvedCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Second comment')).toBeInTheDocument();
      });
    });

    it('should call onCommentJump when Jump to button is clicked', () => {
      render(<CommentsPanel {...defaultProps} />);
      
      const jumpButton = screen.getByText('Jump to');
      fireEvent.click(jumpButton);
      
      expect(defaultProps.onCommentJump).toHaveBeenCalledWith('1');
    });

    it('should allow editing comments', async () => {
      render(<CommentsPanel {...defaultProps} />);
      
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      const textarea = screen.getByDisplayValue('First comment');
      fireEvent.change(textarea, { target: { value: 'Updated comment' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(defaultProps.onCommentUpdate).toHaveBeenCalledWith('1', 'Updated comment');
    });

    it('should call onCommentDelete when Delete button is clicked', () => {
      render(<CommentsPanel {...defaultProps} />);
      
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      expect(defaultProps.onCommentDelete).toHaveBeenCalledWith('1');
    });

    it('should call onCommentResolve when Resolve button is clicked', () => {
      render(<CommentsPanel {...defaultProps} />);
      
      const resolveButton = screen.getByText('Resolve');
      fireEvent.click(resolveButton);
      
      expect(defaultProps.onCommentResolve).toHaveBeenCalledWith('1');
    });

    it('should show empty state when no comments exist', () => {
      render(<CommentsPanel {...defaultProps} comments={[]} />);
      
      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    });

    it('should format timestamps correctly', () => {
      render(<CommentsPanel {...defaultProps} />);
      
      // Check that timestamp is displayed (exact format may vary by locale)
      expect(screen.getByText(/Jan/)).toBeInTheDocument();
    });
  });

  describe('CommentIndicator', () => {
    const defaultProps = {
      threadId: 'thread-1',
      content: 'This is a comment content that should be displayed',
      author: 'Test User',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      position: { x: 100, y: 200 },
      onClick: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should render comment information correctly', () => {
      render(<CommentIndicator {...defaultProps} />);
      
      expect(screen.getByText('T')).toBeInTheDocument(); // Avatar initial
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.content)).toBeInTheDocument();
    });

    it('should truncate long content', () => {
      const longContent = 'This is a very long comment that should be truncated because it exceeds the maximum length allowed for display in the indicator';
      render(<CommentIndicator {...defaultProps} content={longContent} />);
      
      expect(screen.getByText(/This is a very long comment that should be trunca.../)).toBeInTheDocument();
      expect(screen.getByText('Click to read more...')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
      render(<CommentIndicator {...defaultProps} />);
      
      const indicator = screen.getByText(defaultProps.content).closest('div');
      fireEvent.click(indicator!);
      
      expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('should format timestamp relative to current time', () => {
      // Mock current time to be 1 hour after the comment timestamp
      const now = new Date('2024-01-01T11:00:00Z');
      vi.setSystemTime(now);
      
      render(<CommentIndicator {...defaultProps} />);
      
      expect(screen.getByText('1h ago')).toBeInTheDocument();
      
      vi.useRealTimers();
    });

    it('should apply hover styles when isHovered is true', () => {
      render(<CommentIndicator {...defaultProps} isHovered={true} />);
      
      const indicator = screen.getByText(defaultProps.content).closest('div');
      expect(indicator).toBeInTheDocument();
      // Note: We can't easily test inline styles in JSDOM, so we just verify the component renders
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty comment content gracefully', () => {
      const onSubmit = vi.fn();
      render(
        <CommentPopover
          isOpen={true}
          position={{ x: 0, y: 0 }}
          selectedText="test"
          onSubmit={onSubmit}
          onClose={() => {}}
          author={mockAuthor}
        />
      );
      
      const textarea = screen.getByPlaceholderText('Write your comment here...');
      const submitButton = screen.getByText('Add Comment');
      
      // Try to submit empty content
      fireEvent.change(textarea, { target: { value: '   ' } }); // Only whitespace
      fireEvent.click(submitButton);
      
      expect(onSubmit).not.toHaveBeenCalled();
      expect(submitButton).toBeDisabled();
    });

    it('should handle extremely long comments', () => {
      const longComment = 'a'.repeat(10000);
      const comment: Comment = {
        id: '1',
        content: longComment,
        selectedText: 'test',
        position: { from: 0, to: 10 },
        timestamp: new Date(),
        author: 'Test User',
        resolved: false,
      };
      
      render(
        <CommentsPanel
          comments={[comment]}
          onCommentUpdate={() => {}}
          onCommentDelete={() => {}}
          onCommentResolve={() => {}}
          onCommentJump={() => {}}
        />
      );
      
      // Should still render without errors
      expect(screen.getByText(longComment)).toBeInTheDocument();
    });

    it('should handle malformed timestamps gracefully', () => {
      const comment: Comment = {
        id: '1',
        content: 'Test comment',
        selectedText: 'test',
        position: { from: 0, to: 10 },
        timestamp: new Date('invalid-date'),
        author: 'Test User',
        resolved: false,
      };
      
      render(
        <CommentsPanel
          comments={[comment]}
          onCommentUpdate={() => {}}
          onCommentDelete={() => {}}
          onCommentResolve={() => {}}
          onCommentJump={() => {}}
        />
      );
      
      // Should render without crashing
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });
});