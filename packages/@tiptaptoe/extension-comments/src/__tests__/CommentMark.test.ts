import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CommentMark } from '../marks/CommentMark'

// Helper to create a test editor
const createEditor = (content = '') => {
  return new Editor({
    content,
    extensions: [StarterKit, CommentMark],
  })
}

describe('CommentMark', () => {
  let editor: Editor

  beforeEach(() => {
    editor = createEditor('<p>Hello world</p>')
  })

  afterEach(() => {
    editor.destroy()
  })

  describe('Mark Creation', () => {
    it('should create comment mark with threadId', () => {
      const threadId = 'thread-123'
      
      editor.chain()
        .selectAll()
        .setCommentMark({ threadId })
        .run()

      const html = editor.getHTML()
      expect(html).toContain(`data-thread-id="${threadId}"`)
      expect(html).toContain('class="comment-thread"')
    })

    it('should handle custom class option', () => {
      const customEditor = new Editor({
        content: '<p>Test</p>',
        extensions: [
          StarterKit,
          CommentMark.configure({
            class: 'custom-comment-class'
          })
        ],
      })

      customEditor.chain()
        .selectAll()
        .setCommentMark({ threadId: 'test' })
        .run()

      const html = customEditor.getHTML()
      expect(html).toContain('class="custom-comment-class"')
      
      customEditor.destroy()
    })
  })

  describe('Mark Commands', () => {
    beforeEach(() => {
      editor.chain()
        .selectAll()
        .setCommentMark({ threadId: 'thread-1' })
        .run()
    })

    it('should toggle comment mark', () => {
      // First toggle should remove the mark
      editor.chain()
        .selectAll()
        .toggleCommentMark({ threadId: 'thread-1' })
        .run()

      let html = editor.getHTML()
      expect(html).not.toContain('data-thread-id="thread-1"')

      // Second toggle should add it back
      editor.chain()
        .selectAll()
        .toggleCommentMark({ threadId: 'thread-1' })
        .run()

      html = editor.getHTML()
      expect(html).toContain('data-thread-id="thread-1"')
    })

    it('should unset comment mark', () => {
      editor.chain()
        .selectAll()
        .unsetCommentMark()
        .run()

      const html = editor.getHTML()
      expect(html).not.toContain('data-thread-id')
    })

    it('should unset specific comment mark by threadId', () => {
      // Add another comment mark
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .setCommentMark({ threadId: 'thread-2' })
        .run()

      // Remove only thread-1
      editor.commands.unsetCommentMark('thread-1')

      const html = editor.getHTML()
      expect(html).not.toContain('data-thread-id="thread-1"')
      expect(html).toContain('data-thread-id="thread-2"')
    })
  })

  describe('HTML Parsing', () => {
    it('should parse HTML with comment marks', () => {
      const htmlContent = `
        <p>
          This is 
          <span data-thread-id="thread-1" class="comment-thread">commented text</span>
          in a paragraph.
        </p>
      `

      const parseEditor = createEditor(htmlContent)
      const parsed = parseEditor.getHTML()
      
      expect(parsed).toContain('data-thread-id="thread-1"')
      
      parseEditor.destroy()
    })

    it('should ignore spans without data-thread-id', () => {
      const htmlContent = `
        <p>
          This is <span class="other-class">regular text</span> in a paragraph.
        </p>
      `

      const parseEditor = createEditor(htmlContent)
      const parsed = parseEditor.getHTML()
      
      // Should not add comment mark attributes to regular spans
      expect(parsed).not.toContain('data-comment-mark')
      
      parseEditor.destroy()
    })
  })

  describe('Mark Attributes', () => {
    it('should have correct default attributes', () => {
      const mark = CommentMark
      const attributes = mark.options

      expect(attributes.threadId).toBe('')
      expect(attributes.class).toBe('comment-thread')
    })

    it('should render HTML with correct attributes', () => {
      editor.chain()
        .selectAll()
        .setCommentMark({ threadId: 'test-thread' })
        .run()

      const html = editor.getHTML()
      expect(html).toContain('data-thread-id="test-thread"')
      expect(html).toContain('data-comment-mark=""')
      expect(html).toContain('class="comment-thread"')
    })
  })

  describe('Mark State', () => {
    it('should detect active comment mark', () => {
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .setCommentMark({ threadId: 'thread-1' })
        .run()

      // Check if mark is active at position
      editor.chain().setTextSelection({ from: 2, to: 3 }).run()
      
      const isActive = editor.isActive('commentMark', { threadId: 'thread-1' })
      expect(isActive).toBe(true)
    })

    it('should not detect inactive comment mark', () => {
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .setCommentMark({ threadId: 'thread-1' })
        .run()

      // Check at position without mark
      editor.chain().setTextSelection({ from: 7, to: 8 }).run()
      
      const isActive = editor.isActive('commentMark', { threadId: 'thread-1' })
      expect(isActive).toBe(false)
    })
  })

  describe('Multiple Comment Marks', () => {
    it('should handle overlapping comment marks', () => {
      // Add first comment mark
      editor.chain()
        .setTextSelection({ from: 1, to: 8 })
        .setCommentMark({ threadId: 'thread-1' })
        .run()

      // Add overlapping second comment mark
      editor.chain()
        .setTextSelection({ from: 5, to: 10 })
        .setCommentMark({ threadId: 'thread-2' })
        .run()

      const html = editor.getHTML()
      expect(html).toContain('data-thread-id="thread-1"')
      expect(html).toContain('data-thread-id="thread-2"')
    })

    it('should remove specific mark while preserving others', () => {
      // Add multiple marks
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .setCommentMark({ threadId: 'thread-1' })
        .run()

      editor.chain()
        .setTextSelection({ from: 6, to: 10 })
        .setCommentMark({ threadId: 'thread-2' })
        .run()

      // Remove only thread-1
      editor.commands.unsetCommentMark('thread-1')

      const html = editor.getHTML()
      expect(html).not.toContain('data-thread-id="thread-1"')
      expect(html).toContain('data-thread-id="thread-2"')
    })
  })
})