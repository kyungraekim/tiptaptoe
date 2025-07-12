// Main extension export
export { CommentsKit } from './extension/CommentsKit'

// Mark exports
export { CommentMark } from './marks/CommentMark'

// Storage/Provider exports
export { DefaultCommentProvider } from './storage/DefaultProvider'

// Utility exports
export { hoverThread, hoverOffThread, getThreadsAtPosition, getAllThreadRanges } from './utils/hover'

// Hook exports
export { useThreads } from './hooks/useThreads'
export type { UseThreadsReturn } from './hooks/useThreads'

// Type exports
export type {
  CommentUser,
  Comment,
  CommentThread,
  CommentRange,
  CommentMark as CommentMarkType,
  CommentsStorage,
  CommentProvider,
  CommentsKitOptions,
  CommentCommands,
} from './types'

// Re-export specific types that might be commonly used
export type { CommentMarkAttributes } from './marks/CommentMark'