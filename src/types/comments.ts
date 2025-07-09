// Types for the commenting system
export interface Comment {
  id: string;
  content: string;
  selectedText: string;
  position: CommentPosition;
  timestamp: Date;
  author?: string;
  resolved?: boolean;
}

export interface CommentPosition {
  from: number;
  to: number;
  nodeId?: string;
}

export interface CommentMarkProps {
  commentId: string;
  isActive?: boolean;
}

export interface CommentsPanelProps {
  comments: Comment[];
  onCommentUpdate: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  onCommentResolve: (commentId: string) => void;
  onCommentJump: (commentId: string) => void;
}

export interface CommentStorage {
  getComments: () => Comment[];
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => Comment;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  resolveComment: (commentId: string) => void;
  getCommentsByRange: (from: number, to: number) => Comment[];
}

export interface AIRevisionRequest {
  documentContent: string;
  comments: Comment[];
  prompt?: string;
}

export interface AIRevisionResponse {
  success: boolean;
  revisedContent?: string;
  error?: string;
}