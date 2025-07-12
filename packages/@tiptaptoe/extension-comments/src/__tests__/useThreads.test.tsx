import { renderHook, act } from '@testing-library/react'
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useThreads } from '../hooks/useThreads'
import { DefaultCommentProvider } from '../storage/DefaultProvider'
import { CommentUser } from '../types'
import { CommentsKit } from '../extension/CommentsKit'

const mockUser: CommentUser = {
  id: 'user-1',
  name: 'Test User',
  color: '#3b82f6',
}

const createMockEditor = () => {
  const editor = new Editor({
    content: '<p>Hello world, this is test content for commenting.</p>',
    extensions: [
      StarterKit,
      CommentsKit.configure({
        user: mockUser,
      }),
    ],
  })

  // Set a selection for testing
  editor.chain().setTextSelection({ from: 1, to: 10 }).run()

  return editor
}

describe('useThreads Hook', () => {
  let editor: Editor
  let provider: DefaultCommentProvider

  beforeEach(() => {
    editor = createMockEditor()
    provider = editor.storage.commentsKit.provider
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('Initialization', () => {
    it('should initialize with empty threads', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      expect(result.current.threads).toEqual([])
    })

    it('should load existing threads', () => {
      // Create a thread directly in provider
      provider.createThread('existing-thread')

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      expect(result.current.threads).toHaveLength(1)
      expect(result.current.threads[0].id).toBe('existing-thread')
    })

    it('should handle undefined provider gracefully', () => {
      const { result } = renderHook(() => 
        useThreads(undefined, editor, mockUser)
      )

      expect(result.current.threads).toEqual([])
    })

    it('should handle null editor gracefully', () => {
      const { result } = renderHook(() => 
        useThreads(provider, null, mockUser)
      )

      expect(result.current.threads).toEqual([])
    })
  })

  describe('Thread Creation', () => {
    it('should create a new thread', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        const success = result.current.createThread()
        expect(success).toBe(true)
      })

      expect(result.current.threads).toHaveLength(1)
    })

    it('should not create thread with empty selection', () => {
      // Set empty selection
      editor.chain().setTextSelection({ from: 1, to: 1 }).run()

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        const success = result.current.createThread()
        expect(success).toBe(false)
      })

      expect(result.current.threads).toHaveLength(0)
    })

    it('should not create thread without editor', () => {
      const { result } = renderHook(() => 
        useThreads(provider, null, mockUser)
      )

      act(() => {
        const success = result.current.createThread()
        expect(success).toBe(false)
      })
    })

    it('should not create thread without provider', () => {
      const { result } = renderHook(() => 
        useThreads(undefined, editor, mockUser)
      )

      act(() => {
        const success = result.current.createThread()
        expect(success).toBe(false)
      })
    })
  })

  describe('Thread Management', () => {
    let threadId: string

    beforeEach(() => {
      const thread = provider.createThread('test-thread')
      threadId = thread.id
    })

    it('should delete a thread', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.deleteThread(threadId)
      })

      expect(provider.getThread(threadId)).toBeUndefined()
    })

    it('should resolve a thread', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.resolveThread(threadId)
      })

      const thread = provider.getThread(threadId)
      expect(thread!.resolvedAt).toBeInstanceOf(Date)
    })

    it('should unresolve a thread', () => {
      // First resolve it
      provider.resolveThread(threadId, mockUser.id)

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.unresolveThread(threadId)
      })

      const thread = provider.getThread(threadId)
      expect(thread!.resolvedAt).toBeUndefined()
    })

    it('should handle operations without editor gracefully', () => {
      const { result } = renderHook(() => 
        useThreads(provider, null, mockUser)
      )

      // These should not throw
      act(() => {
        result.current.deleteThread(threadId)
        result.current.resolveThread(threadId)
        result.current.unresolveThread(threadId)
      })
    })
  })

  describe('Comment Management', () => {
    let threadId: string

    beforeEach(() => {
      const thread = provider.createThread('test-thread')
      threadId = thread.id
    })

    it('should add a comment to a thread', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.addComment(threadId, 'Test comment')
      })

      const comments = provider.getComments(threadId)
      expect(comments).toHaveLength(1)
      expect(comments[0].content).toBe('Test comment')
      expect(comments[0].userId).toBe(mockUser.id)
    })

    it('should add comment with data', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      const commentData = { priority: 'high', tags: ['bug'] }

      act(() => {
        result.current.addComment(threadId, 'Bug report', commentData)
      })

      const comments = provider.getComments(threadId)
      expect(comments[0].data).toEqual(commentData)
    })

    it('should update a comment', () => {
      const comment = provider.createComment(threadId, 'Original content', mockUser.id)

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.updateComment(threadId, comment.id, 'Updated content')
      })

      const updatedComment = provider.getComments(threadId)[0]
      expect(updatedComment.content).toBe('Updated content')
    })

    it('should delete a comment', () => {
      const comment = provider.createComment(threadId, 'To be deleted', mockUser.id)

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        result.current.deleteComment(threadId, comment.id)
      })

      const deletedComment = provider.getComments(threadId)[0]
      expect(deletedComment.deletedAt).toBeInstanceOf(Date)
    })

    it('should handle comment operations without editor gracefully', () => {
      const comment = provider.createComment(threadId, 'Test', mockUser.id)

      const { result } = renderHook(() => 
        useThreads(provider, null, mockUser)
      )

      // These should not throw
      act(() => {
        result.current.updateComment(threadId, comment.id, 'Updated')
        result.current.deleteComment(threadId, comment.id)
      })
    })

    it('should handle add comment without provider gracefully', () => {
      const { result } = renderHook(() => 
        useThreads(undefined, editor, mockUser)
      )

      // Should not throw
      act(() => {
        result.current.addComment(threadId, 'Test comment')
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should update threads when provider changes', () => {
      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      // Initially empty
      expect(result.current.threads).toHaveLength(0)

      // Add thread through provider
      act(() => {
        provider.createThread('new-thread')
      })

      // Hook should update
      expect(result.current.threads).toHaveLength(1)
      expect(result.current.threads[0].id).toBe('new-thread')
    })

    it('should update threads when comments are added', () => {
      const thread = provider.createThread('test-thread')

      const { result } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      act(() => {
        provider.createComment(thread.id, 'New comment', mockUser.id)
      })

      const updatedThread = result.current.threads.find(t => t.id === thread.id)
      expect(updatedThread!.comments).toHaveLength(1)
    })

    it('should clean up subscription on unmount', () => {
      const { unmount } = renderHook(() => 
        useThreads(provider, editor, mockUser)
      )

      // Add a spy to track unsubscribe calls
      const mockUnsubscribe = jest.fn()
      jest.spyOn(provider, 'onUpdate').mockReturnValue(mockUnsubscribe)

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle provider errors gracefully', () => {
      // Mock provider to throw error
      const errorProvider = {
        getThreads: jest.fn().mockReturnValue([]),
        onUpdate: jest.fn().mockReturnValue(() => {}),
        createComment: jest.fn().mockImplementation(() => {
          throw new Error('Provider error')
        })
      }

      const { result } = renderHook(() => 
        useThreads(errorProvider as any, editor, mockUser)
      )

      // Should not throw
      act(() => {
        result.current.addComment('thread-1', 'Test comment')
      })
    })

    it('should handle editor command errors gracefully', () => {
      // Mock editor commands to return false
      const mockEditor = {
        ...editor,
        commands: {
          createThread: jest.fn().mockReturnValue(false),
          removeThread: jest.fn(),
          resolveThread: jest.fn(),
          unresolveThread: jest.fn(),
          updateComment: jest.fn(),
          deleteComment: jest.fn(),
        }
      }

      const { result } = renderHook(() => 
        useThreads(provider, mockEditor as any, mockUser)
      )

      act(() => {
        const success = result.current.createThread()
        expect(success).toBe(false)
      })
    })
  })
})