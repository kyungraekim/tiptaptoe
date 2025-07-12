import { DefaultCommentProvider } from '../storage/DefaultProvider'
import { CommentUser } from '../types'

describe('DefaultCommentProvider', () => {
  let provider: DefaultCommentProvider
  let mockUser: CommentUser

  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      name: 'Test User',
      color: '#3b82f6',
    }
    provider = new DefaultCommentProvider(mockUser)
  })

  describe('Thread Management', () => {
    it('should create a new thread', () => {
      const threadId = 'thread-1'
      const data = { topic: 'test' }

      const thread = provider.createThread(threadId, data)

      expect(thread).toEqual({
        id: threadId,
        createdAt: expect.any(Date),
        data,
        comments: [],
      })
    })

    it('should get all threads', () => {
      provider.createThread('thread-1')
      provider.createThread('thread-2')

      const threads = provider.getThreads()

      expect(threads).toHaveLength(2)
      expect(threads[0].id).toBe('thread-1')
      expect(threads[1].id).toBe('thread-2')
    })

    it('should get a specific thread by id', () => {
      const threadId = 'thread-1'
      provider.createThread(threadId)

      const thread = provider.getThread(threadId)

      expect(thread).toBeDefined()
      expect(thread!.id).toBe(threadId)
    })

    it('should return undefined for non-existent thread', () => {
      const thread = provider.getThread('non-existent')

      expect(thread).toBeUndefined()
    })

    it('should delete a thread', () => {
      const threadId = 'thread-1'
      provider.createThread(threadId)

      provider.deleteThread(threadId)

      expect(provider.getThread(threadId)).toBeUndefined()
      expect(provider.getThreads()).toHaveLength(0)
    })

    it('should resolve a thread', () => {
      const threadId = 'thread-1'
      const userId = 'user-1'
      provider.createThread(threadId)

      provider.resolveThread(threadId, userId)

      const thread = provider.getThread(threadId)
      expect(thread!.resolvedAt).toBeInstanceOf(Date)
      expect(thread!.resolvedBy).toBe(userId)
    })

    it('should unresolve a thread', () => {
      const threadId = 'thread-1'
      provider.createThread(threadId)
      provider.resolveThread(threadId, 'user-1')

      provider.unresolveThread(threadId)

      const thread = provider.getThread(threadId)
      expect(thread!.resolvedAt).toBeUndefined()
      expect(thread!.resolvedBy).toBeUndefined()
    })
  })

  describe('Comment Management', () => {
    beforeEach(() => {
      provider.createThread('thread-1')
    })

    it('should create a comment in a thread', () => {
      const threadId = 'thread-1'
      const content = 'Test comment'
      const userId = 'user-1'
      const data = { priority: 'high' }

      const comment = provider.createComment(threadId, content, userId, data)

      expect(comment).toEqual({
        id: expect.any(String),
        content,
        threadId,
        userId,
        createdAt: expect.any(Date),
        data,
      })

      const comments = provider.getComments(threadId)
      expect(comments).toHaveLength(1)
      expect(comments[0]).toEqual(comment)
    })

    it('should throw error when creating comment in non-existent thread', () => {
      expect(() => {
        provider.createComment('non-existent', 'content', 'user-1')
      }).toThrow('Thread non-existent not found')
    })

    it('should get comments for a thread', () => {
      const threadId = 'thread-1'
      provider.createComment(threadId, 'Comment 1', 'user-1')
      provider.createComment(threadId, 'Comment 2', 'user-2')

      const comments = provider.getComments(threadId)

      expect(comments).toHaveLength(2)
      expect(comments[0].content).toBe('Comment 1')
      expect(comments[1].content).toBe('Comment 2')
    })

    it('should return empty array for non-existent thread comments', () => {
      const comments = provider.getComments('non-existent')

      expect(comments).toEqual([])
    })

    it('should update a comment', () => {
      const threadId = 'thread-1'
      const comment = provider.createComment(threadId, 'Original', 'user-1')
      const newContent = 'Updated content'
      const newData = { edited: true }

      const updatedComment = provider.updateComment(threadId, comment.id, newContent, newData)

      expect(updatedComment.content).toBe(newContent)
      expect(updatedComment.updatedAt).toBeInstanceOf(Date)
      expect(updatedComment.data).toEqual(newData)
    })

    it('should throw error when updating comment in non-existent thread', () => {
      expect(() => {
        provider.updateComment('non-existent', 'comment-1', 'content')
      }).toThrow('Thread non-existent not found')
    })

    it('should throw error when updating non-existent comment', () => {
      expect(() => {
        provider.updateComment('thread-1', 'non-existent', 'content')
      }).toThrow('Comment non-existent not found')
    })

    it('should delete a comment (mark as deleted)', () => {
      const threadId = 'thread-1'
      const comment = provider.createComment(threadId, 'To be deleted', 'user-1')

      provider.deleteComment(threadId, comment.id)

      const comments = provider.getComments(threadId)
      expect(comments[0].deletedAt).toBeInstanceOf(Date)
    })

    it('should handle delete of non-existent comment gracefully', () => {
      expect(() => {
        provider.deleteComment('thread-1', 'non-existent')
      }).not.toThrow()
    })
  })

  describe('Update Notifications', () => {
    it('should notify subscribers when threads are updated', () => {
      const callback = jest.fn()
      const unsubscribe = provider.onUpdate(callback)

      provider.createThread('thread-1')

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'thread-1' })
      ])

      unsubscribe()
    })

    it('should stop notifications after unsubscribing', () => {
      const callback = jest.fn()
      const unsubscribe = provider.onUpdate(callback)

      unsubscribe()
      provider.createThread('thread-1')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should notify on comment creation', () => {
      const callback = jest.fn()
      provider.onUpdate(callback)
      provider.createThread('thread-1')
      callback.mockClear()

      provider.createComment('thread-1', 'New comment', 'user-1')

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should notify on thread resolution', () => {
      const callback = jest.fn()
      provider.createThread('thread-1')
      provider.onUpdate(callback)
      callback.mockClear()

      provider.resolveThread('thread-1', 'user-1')

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
})