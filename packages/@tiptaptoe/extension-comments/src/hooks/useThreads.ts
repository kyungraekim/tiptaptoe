import { useEffect, useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import { v4 as uuid } from 'uuid'
import { CommentProvider, CommentThread, CommentUser } from '../types'

export interface UseThreadsReturn {
  threads: CommentThread[]
  createThread: () => boolean
  deleteThread: (threadId: string) => void
  resolveThread: (threadId: string) => void
  unresolveThread: (threadId: string) => void
  updateComment: (threadId: string, commentId: string, content: string, data?: Record<string, any>) => void
  deleteComment: (threadId: string, commentId: string) => void
  addComment: (threadId: string, content: string, data?: Record<string, any>) => void
}

export function useThreads(
  provider: CommentProvider | undefined,
  editor: Editor | null,
  user: CommentUser
): UseThreadsReturn {
  const [threads, setThreads] = useState<CommentThread[]>([])

  // Load initial threads and set up update listener
  useEffect(() => {
    if (!provider) return

    const initialThreads = provider.getThreads()
    setThreads(initialThreads)

    const unsubscribe = provider.onUpdate(setThreads)
    return unsubscribe
  }, [provider])

  const createThread = useCallback(() => {
    if (!editor || !provider) return false

    const { selection } = editor.state
    if (selection.empty) return false

    const threadId = uuid()
    
    try {
      // Create the thread using the editor command
      return editor.commands.createThread({ id: threadId })
    } catch (error) {
      console.error('Failed to create thread:', error)
      return false
    }
  }, [editor, provider])

  const deleteThread = useCallback((threadId: string) => {
    if (!editor) return
    
    editor.commands.removeThread({ id: threadId })
  }, [editor])

  const resolveThread = useCallback((threadId: string) => {
    if (!editor) return
    
    editor.commands.resolveThread({ id: threadId })
  }, [editor])

  const unresolveThread = useCallback((threadId: string) => {
    if (!editor) return
    
    editor.commands.unresolveThread({ id: threadId })
  }, [editor])

  const updateComment = useCallback((
    threadId: string,
    commentId: string,
    content: string,
    data?: Record<string, any>
  ) => {
    if (!editor) return
    
    editor.commands.updateComment({
      threadId,
      id: commentId,
      content,
      data
    })
  }, [editor])

  const deleteComment = useCallback((threadId: string, commentId: string) => {
    if (!editor) return
    
    editor.commands.deleteComment({
      threadId,
      id: commentId
    })
  }, [editor])

  const addComment = useCallback((
    threadId: string,
    content: string,
    data?: Record<string, any>
  ) => {
    if (!provider) return
    
    try {
      provider.createComment(threadId, content, user.id, data)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }, [provider, user.id])

  return {
    threads,
    createThread,
    deleteThread,
    resolveThread,
    unresolveThread,
    updateComment,
    deleteComment,
    addComment,
  }
}