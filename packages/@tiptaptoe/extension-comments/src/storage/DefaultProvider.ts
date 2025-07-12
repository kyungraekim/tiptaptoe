import { v4 as uuid } from 'uuid'
import { CommentProvider, CommentThread, Comment, CommentUser } from '../types'

export class DefaultCommentProvider implements CommentProvider {
  private threads: Map<string, CommentThread> = new Map()
  private updateCallbacks: Set<(threads: CommentThread[]) => void> = new Set()

  constructor(private _currentUser: CommentUser) {
    // Store user for potential future use in collaborative features
  }

  getThreads(): CommentThread[] {
    return Array.from(this.threads.values())
  }

  getThread(threadId: string): CommentThread | undefined {
    return this.threads.get(threadId)
  }

  createThread(threadId: string, data?: Record<string, any>): CommentThread {
    const thread: CommentThread = {
      id: threadId,
      createdAt: new Date(),
      data,
      comments: []
    }
    
    this.threads.set(threadId, thread)
    this.notifyUpdate()
    return thread
  }

  deleteThread(threadId: string): void {
    this.threads.delete(threadId)
    this.notifyUpdate()
  }

  resolveThread(threadId: string, userId: string): void {
    const thread = this.threads.get(threadId)
    if (thread) {
      thread.resolvedAt = new Date()
      thread.resolvedBy = userId
      this.notifyUpdate()
    }
  }

  unresolveThread(threadId: string): void {
    const thread = this.threads.get(threadId)
    if (thread) {
      delete thread.resolvedAt
      delete thread.resolvedBy
      this.notifyUpdate()
    }
  }

  getComments(threadId: string): Comment[] {
    const thread = this.threads.get(threadId)
    return thread ? thread.comments : []
  }

  createComment(threadId: string, content: string, userId: string, data?: Record<string, any>): Comment {
    const thread = this.threads.get(threadId)
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`)
    }

    const comment: Comment = {
      id: uuid(),
      content,
      threadId,
      userId,
      createdAt: new Date(),
      data
    }

    thread.comments.push(comment)
    this.notifyUpdate()
    return comment
  }

  updateComment(threadId: string, commentId: string, content: string, data?: Record<string, any>): Comment {
    const thread = this.threads.get(threadId)
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`)
    }

    const comment = thread.comments.find(c => c.id === commentId)
    if (!comment) {
      throw new Error(`Comment ${commentId} not found`)
    }

    comment.content = content
    comment.updatedAt = new Date()
    if (data) {
      comment.data = { ...comment.data, ...data }
    }

    this.notifyUpdate()
    return comment
  }

  deleteComment(threadId: string, commentId: string): void {
    const thread = this.threads.get(threadId)
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`)
    }

    const comment = thread.comments.find(c => c.id === commentId)
    if (comment) {
      comment.deletedAt = new Date()
      this.notifyUpdate()
    }
  }

  onUpdate(callback: (threads: CommentThread[]) => void): () => void {
    this.updateCallbacks.add(callback)
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  private notifyUpdate(): void {
    const threads = this.getThreads()
    this.updateCallbacks.forEach(callback => callback(threads))
  }
}