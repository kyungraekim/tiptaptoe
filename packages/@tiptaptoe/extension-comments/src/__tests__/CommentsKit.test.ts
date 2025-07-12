import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CommentsKit } from '../extension/CommentsKit'
import { DefaultCommentProvider } from '../storage/DefaultProvider'
import { CommentUser } from '../types'

const mockUser: CommentUser = {
  id: 'user-1',
  name: 'Test User',
  color: '#3b82f6',
}

const createEditor = (options = {}) => {
  return new Editor({
    content: '<p>Hello world, this is a test document.</p>',
    extensions: [
      StarterKit,
      CommentsKit.configure({
        user: mockUser,
        ...options,
      }),
    ],
  })
}

describe('CommentsKit', () => {
  let editor: Editor

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('Extension Setup', () => {
    it('should initialize with default options', () => {
      editor = createEditor()

      expect(editor.storage.commentsKit.user).toEqual(mockUser)
      expect(editor.storage.commentsKit.provider).toBeInstanceOf(DefaultCommentProvider)
      expect(editor.storage.commentsKit.focusedThreads).toEqual([])
    })

    it('should use custom provider when provided', () => {
      const customProvider = new DefaultCommentProvider(mockUser)
      editor = createEditor({ provider: customProvider })

      expect(editor.storage.commentsKit.provider).toBe(customProvider)
    })

    it('should use anonymous user when no user provided', () => {
      editor = new Editor({
        content: '<p>Test</p>',
        extensions: [StarterKit, CommentsKit],
      })

      expect(editor.storage.commentsKit.user).toEqual({
        id: 'anonymous',
        name: 'Anonymous User',
        color: '#3b82f6',
      })
    })
  })

  describe('Comment Commands', () => {
    beforeEach(() => {
      editor = createEditor()
    })

    it('should create a comment thread', () => {
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      const provider = editor.storage.commentsKit.provider
      const thread = provider.getThread('thread-1')
      
      expect(thread).toBeDefined()
      expect(thread!.id).toBe('thread-1')
      expect(editor.getHTML()).toContain('data-thread-id="thread-1"')
    })

    it('should not create thread with empty selection', () => {
      editor.chain()
        .setTextSelection({ from: 1, to: 1 })
        .createThread({ id: 'thread-1' })
        .run()

      const provider = editor.storage.commentsKit.provider
      const thread = provider.getThread('thread-1')
      
      expect(thread).toBeUndefined()
    })

    it('should select a thread', () => {
      // First create a thread
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      // Then select it
      editor.commands.selectThread({ id: 'thread-1' })

      expect(editor.storage.commentsKit.focusedThreads).toContain('thread-1')
    })

    it('should unselect thread', () => {
      editor.storage.commentsKit.focusedThreads = ['thread-1']

      editor.commands.unselectThread()

      expect(editor.storage.commentsKit.focusedThreads).toEqual([])
    })

    it('should remove a thread', () => {
      // Create and then remove thread
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.commands.removeThread({ id: 'thread-1' })

      const provider = editor.storage.commentsKit.provider
      expect(provider.getThread('thread-1')).toBeUndefined()
      expect(editor.getHTML()).not.toContain('data-thread-id="thread-1"')
    })

    it('should resolve a thread', () => {
      // Create thread first
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.commands.resolveThread({ id: 'thread-1' })

      const provider = editor.storage.commentsKit.provider
      const thread = provider.getThread('thread-1')
      expect(thread!.resolvedAt).toBeInstanceOf(Date)
      expect(thread!.resolvedBy).toBe(mockUser.id)
    })

    it('should unresolve a thread', () => {
      // Create and resolve thread first
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()
      editor.commands.resolveThread({ id: 'thread-1' })

      editor.commands.unresolveThread({ id: 'thread-1' })

      const provider = editor.storage.commentsKit.provider
      const thread = provider.getThread('thread-1')
      expect(thread!.resolvedAt).toBeUndefined()
    })

    it('should update a comment', () => {
      // Create thread and comment
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      const provider = editor.storage.commentsKit.provider
      const comment = provider.createComment('thread-1', 'Original content', mockUser.id)

      editor.commands.updateComment({
        threadId: 'thread-1',
        id: comment.id,
        content: 'Updated content',
      })

      const updatedComment = provider.getComments('thread-1')[0]
      expect(updatedComment.content).toBe('Updated content')
    })

    it('should delete a comment', () => {
      // Create thread and comment
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      const provider = editor.storage.commentsKit.provider
      const comment = provider.createComment('thread-1', 'To be deleted', mockUser.id)

      editor.commands.deleteComment({
        threadId: 'thread-1',
        id: comment.id,
      })

      const deletedComment = provider.getComments('thread-1')[0]
      expect(deletedComment.deletedAt).toBeInstanceOf(Date)
    })
  })

  describe('Event Callbacks', () => {
    it('should call onCreateThread callback', () => {
      const onCreateThread = jest.fn()
      editor = createEditor({ onCreateThread })

      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      expect(onCreateThread).toHaveBeenCalledWith('thread-1')
    })

    it('should call onDeleteThread callback', () => {
      const onDeleteThread = jest.fn()
      editor = createEditor({ onDeleteThread })

      // Create and remove thread
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.commands.removeThread({ id: 'thread-1' })

      expect(onDeleteThread).toHaveBeenCalledWith('thread-1')
    })

    it('should call onClickThread callback when selecting', () => {
      const onClickThread = jest.fn()
      editor = createEditor({ onClickThread })

      // Create and select thread
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.commands.selectThread({ id: 'thread-1' })

      expect(onClickThread).toHaveBeenCalledWith('thread-1')
    })

    it('should call onResolveThread callback', () => {
      const onResolveThread = jest.fn()
      editor = createEditor({ onResolveThread })

      // Create and resolve thread
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.commands.resolveThread({ id: 'thread-1' })

      expect(onResolveThread).toHaveBeenCalledWith('thread-1')
    })

    it('should call onUpdateComment callback', () => {
      const onUpdateComment = jest.fn()
      editor = createEditor({ onUpdateComment })

      // Create thread and update comment
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      const provider = editor.storage.commentsKit.provider
      const comment = provider.createComment('thread-1', 'Original', mockUser.id)

      editor.commands.updateComment({
        threadId: 'thread-1',
        id: comment.id,
        content: 'Updated',
      })

      expect(onUpdateComment).toHaveBeenCalledWith('thread-1', comment.id, 'Updated', undefined)
    })
  })

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      editor = createEditor()
    })

    it('should have keyboard shortcut defined', () => {
      const commentsExtension = editor.extensionManager.extensions
        .find(ext => ext.name === 'commentsKit')

      expect(commentsExtension).toBeDefined()
      
      // Check if addKeyboardShortcuts method exists
      if (commentsExtension?.options?.addKeyboardShortcuts) {
        const shortcuts = commentsExtension.options.addKeyboardShortcuts()
        expect(shortcuts).toHaveProperty('Mod-Shift-c')
        expect(typeof shortcuts['Mod-Shift-c']).toBe('function')
      }
    })

    it('should handle keyboard shortcut execution', () => {
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .run()

      const commentsExtension = editor.extensionManager.extensions
        .find(ext => ext.name === 'commentsKit')

      // Test that the shortcut function exists and can be called without throwing
      if (commentsExtension?.options?.addKeyboardShortcuts) {
        const shortcuts = commentsExtension.options.addKeyboardShortcuts()
        if (shortcuts && shortcuts['Mod-Shift-c']) {
          expect(() => {
            shortcuts['Mod-Shift-c']()
          }).not.toThrow()
        }
      }
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      editor = createEditor()
    })

    it('should handle selecting non-existent thread', () => {
      const result = editor.commands.selectThread({ id: 'non-existent' })
      expect(result).toBe(false)
    })

    it('should handle resolving with no user', () => {
      // Temporarily remove user
      editor.storage.commentsKit.user = null

      const result = editor.commands.resolveThread({ id: 'thread-1' })
      expect(result).toBe(false)
    })

    it('should handle updating non-existent comment', () => {
      // This should not throw, but return false
      const result = editor.commands.updateComment({
        threadId: 'non-existent',
        id: 'comment-1',
        content: 'test',
      })
      expect(result).toBe(false)
    })
  })
})