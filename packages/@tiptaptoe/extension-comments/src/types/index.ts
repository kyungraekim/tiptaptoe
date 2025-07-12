export interface CommentUser {
  id: string
  name: string
  color?: string
  avatar?: string
}

export interface Comment {
  id: string
  content: string
  threadId: string
  userId: string
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date
  data?: Record<string, any>
}

export interface CommentThread {
  id: string
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  data?: Record<string, any>
  comments: Comment[]
}

export interface CommentRange {
  from: number
  to: number
}

export interface CommentMark {
  threadId: string
  range: CommentRange
}

export interface CommentsStorage {
  threads: CommentThread[]
  marks: CommentMark[]
}

export interface CommentProvider {
  getThreads(): CommentThread[]
  getThread(threadId: string): CommentThread | undefined
  createThread(threadId: string, data?: Record<string, any>): CommentThread
  deleteThread(threadId: string): void
  resolveThread(threadId: string, userId: string): void
  unresolveThread(threadId: string): void
  
  getComments(threadId: string): Comment[]
  createComment(threadId: string, content: string, userId: string, data?: Record<string, any>): Comment
  updateComment(threadId: string, commentId: string, content: string, data?: Record<string, any>): Comment
  deleteComment(threadId: string, commentId: string): void
  
  onUpdate(callback: (threads: CommentThread[]) => void): () => void
}

export interface CommentsKitOptions {
  provider?: CommentProvider
  user?: CommentUser
  useLegacyWrapping?: boolean
  onClickThread?: (threadId: string) => void
  onCreateThread?: (threadId: string) => void
  onDeleteThread?: (threadId: string) => void
  onResolveThread?: (threadId: string) => void
  onUpdateComment?: (threadId: string, commentId: string, content: string, data?: Record<string, any>) => void
}

export interface CommentCommands {
  createThread: (options?: { id?: string; range?: CommentRange; data?: Record<string, any> }) => boolean
  selectThread: (options: { id: string; updateSelection?: boolean }) => boolean
  unselectThread: () => boolean
  removeThread: (options: { id: string }) => boolean
  resolveThread: (options: { id: string }) => boolean
  unresolveThread: (options: { id: string }) => boolean
  updateComment: (options: { threadId: string; id: string; content: string; data?: Record<string, any> }) => boolean
  deleteComment: (options: { threadId: string; id: string }) => boolean
}