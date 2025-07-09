import { Comment, CommentStorage } from '../types/comments';

class CommentStorageImpl implements CommentStorage {
  private comments: Comment[] = [];

  getComments(): Comment[] {
    return [...this.comments];
  }

  addComment(comment: Omit<Comment, 'id' | 'timestamp'>): Comment {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false
    };
    
    this.comments.push(newComment);
    this.saveToStorage();
    return newComment;
  }

  updateComment(commentId: string, content: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.content = content;
      this.saveToStorage();
    }
  }

  deleteComment(commentId: string): void {
    this.comments = this.comments.filter(c => c.id !== commentId);
    this.saveToStorage();
  }

  resolveComment(commentId: string): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      this.saveToStorage();
    }
  }

  getCommentsByRange(from: number, to: number): Comment[] {
    return this.comments.filter(comment => {
      const commentStart = comment.position.from;
      const commentEnd = comment.position.to;
      
      // Check if comment range overlaps with the given range
      return (commentStart <= to && commentEnd >= from);
    });
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('tiptaptoe_comments', JSON.stringify(this.comments));
    } catch (error) {
      console.error('Failed to save comments to localStorage:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('tiptaptoe_comments');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.comments = parsed.map((comment: any) => ({
          ...comment,
          timestamp: new Date(comment.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
      this.comments = [];
    }
  }

  clearComments(): void {
    this.comments = [];
    this.saveToStorage();
  }
}

export const commentStorage = new CommentStorageImpl();

// Initialize storage on module load
commentStorage.loadFromStorage();