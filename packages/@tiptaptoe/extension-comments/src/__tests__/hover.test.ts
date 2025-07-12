import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { hoverThread, hoverOffThread, getThreadsAtPosition, getAllThreadRanges } from '../utils/hover'
import { CommentsKit } from '../extension/CommentsKit'

const createEditor = (content = '<p>Hello world, this is test content.</p>') => {
  return new Editor({
    content,
    extensions: [
      StarterKit,
      CommentsKit.configure({
        user: { id: 'user-1', name: 'Test User' },
      }),
    ],
  })
}

// Mock DOM methods for testing
const mockElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  closest: jest.fn(),
  querySelector: jest.fn(),
}

const mockQuerySelectorAll = jest.fn()

Object.defineProperty(global, 'HTMLElement', {
  value: class HTMLElement {
    classList = mockElement.classList
    closest = mockElement.closest
    querySelector = mockElement.querySelector
  },
})

describe('Hover Utilities', () => {
  let editor: Editor

  beforeEach(() => {
    editor = createEditor()
    jest.clearAllMocks()
    
    // Mock DOM querySelectorAll
    editor.view.dom.querySelectorAll = mockQuerySelectorAll
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
    }
  })

  describe('hoverThread', () => {
    beforeEach(() => {
      // Create a comment thread for testing
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()
    })

    it('should add hover class to comment elements', () => {
      // Mock DOM structure
      mockElement.closest.mockReturnValue(mockElement)
      mockElement.querySelector.mockReturnValue(mockElement)
      mockQuerySelectorAll.mockReturnValue([])

      hoverThread(editor, ['thread-1'])

      // Should attempt to add hover class
      expect(mockElement.classList.add).toHaveBeenCalledWith('comment-thread-hover')
    })

    it('should handle multiple thread IDs', () => {
      // Create another thread
      editor.chain()
        .setTextSelection({ from: 6, to: 10 })
        .createThread({ id: 'thread-2' })
        .run()

      mockElement.closest.mockReturnValue(mockElement)
      mockElement.querySelector.mockReturnValue(mockElement)
      mockQuerySelectorAll.mockReturnValue([])

      hoverThread(editor, ['thread-1', 'thread-2'])

      // Should process both threads
      expect(mockElement.classList.add).toHaveBeenCalledWith('comment-thread-hover')
    })

    it('should handle empty thread IDs array', () => {
      hoverThread(editor, [])

      // Should not attempt to add any classes
      expect(mockElement.classList.add).not.toHaveBeenCalled()
    })

    it('should handle null editor gracefully', () => {
      expect(() => {
        hoverThread(null as any, ['thread-1'])
      }).not.toThrow()
    })

    it('should remove existing hover classes before adding new ones', () => {
      const existingHoverElements = [mockElement, mockElement]
      mockQuerySelectorAll.mockReturnValue(existingHoverElements)
      mockElement.closest.mockReturnValue(mockElement)
      mockElement.querySelector.mockReturnValue(mockElement)

      hoverThread(editor, ['thread-1'])

      // Should remove existing hover classes first
      expect(mockElement.classList.remove).toHaveBeenCalledWith('comment-thread-hover')
    })
  })

  describe('hoverOffThread', () => {
    it('should remove hover classes from all elements', () => {
      const hoverElements = [mockElement, mockElement, mockElement]
      mockQuerySelectorAll.mockReturnValue(hoverElements)

      hoverOffThread(editor)

      expect(mockQuerySelectorAll).toHaveBeenCalledWith('.comment-thread-hover')
      expect(mockElement.classList.remove).toHaveBeenCalledTimes(3)
      expect(mockElement.classList.remove).toHaveBeenCalledWith('comment-thread-hover')
    })

    it('should handle empty hover elements', () => {
      mockQuerySelectorAll.mockReturnValue([])

      hoverOffThread(editor)

      expect(mockElement.classList.remove).not.toHaveBeenCalled()
    })

    it('should handle null editor gracefully', () => {
      expect(() => {
        hoverOffThread(null as any)
      }).not.toThrow()
    })
  })

  describe('getThreadsAtPosition', () => {
    beforeEach(() => {
      // Create comment threads at different positions
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.chain()
        .setTextSelection({ from: 3, to: 8 })
        .createThread({ id: 'thread-2' })
        .run()
    })

    it('should return thread IDs at a specific position', () => {
      const threads = getThreadsAtPosition(editor, 4)

      // Position 4 should be covered by both threads
      expect(threads).toContain('thread-1')
      expect(threads).toContain('thread-2')
    })

    it('should return empty array for position without threads', () => {
      const threads = getThreadsAtPosition(editor, 15)

      expect(threads).toEqual([])
    })

    it('should handle position at document boundary', () => {
      const threads = getThreadsAtPosition(editor, 0)

      expect(threads).toEqual([])
    })

    it('should return unique thread IDs', () => {
      // Create overlapping marks with same thread ID
      editor.chain()
        .setTextSelection({ from: 2, to: 6 })
        .setCommentMark({ threadId: 'thread-1' })
        .run()

      const threads = getThreadsAtPosition(editor, 4)

      // Should not have duplicates
      const uniqueThreads = [...new Set(threads)]
      expect(threads.length).toBe(uniqueThreads.length)
    })
  })

  describe('getAllThreadRanges', () => {
    beforeEach(() => {
      // Create comment threads
      editor.chain()
        .setTextSelection({ from: 1, to: 5 })
        .createThread({ id: 'thread-1' })
        .run()

      editor.chain()
        .setTextSelection({ from: 10, to: 15 })
        .createThread({ id: 'thread-2' })
        .run()
    })

    it('should return all thread ranges in the document', () => {
      const ranges = getAllThreadRanges(editor)

      expect(ranges.length).toBeGreaterThan(0)
      
      const thread1Ranges = ranges.filter(r => r.threadId === 'thread-1')
      const thread2Ranges = ranges.filter(r => r.threadId === 'thread-2')
      
      expect(thread1Ranges.length).toBeGreaterThan(0)
      expect(thread2Ranges.length).toBeGreaterThan(0)
    })

    it('should return ranges with correct structure', () => {
      const ranges = getAllThreadRanges(editor)

      ranges.forEach(range => {
        expect(range).toHaveProperty('threadId')
        expect(range).toHaveProperty('from')
        expect(range).toHaveProperty('to')
        expect(typeof range.threadId).toBe('string')
        expect(typeof range.from).toBe('number')
        expect(typeof range.to).toBe('number')
        expect(range.from).toBeLessThanOrEqual(range.to)
      })
    })

    it('should return empty array for document without threads', () => {
      const cleanEditor = createEditor()
      const ranges = getAllThreadRanges(cleanEditor)

      expect(ranges).toEqual([])
      
      cleanEditor.destroy()
    })

    it('should handle overlapping thread ranges', () => {
      // Create overlapping thread
      editor.chain()
        .setTextSelection({ from: 3, to: 12 })
        .createThread({ id: 'thread-3' })
        .run()

      const ranges = getAllThreadRanges(editor)

      const thread3Ranges = ranges.filter(r => r.threadId === 'thread-3')
      expect(thread3Ranges.length).toBeGreaterThan(0)
    })

    it('should return ranges in document order', () => {
      const ranges = getAllThreadRanges(editor)

      // Sort ranges by position to verify order
      const sortedRanges = [...ranges].sort((a, b) => a.from - b.from)
      
      for (let i = 0; i < ranges.length - 1; i++) {
        expect(ranges[i].from).toBeLessThanOrEqual(ranges[i + 1].from)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle editor with no content', () => {
      const emptyEditor = createEditor('')
      
      expect(() => {
        hoverThread(emptyEditor, ['thread-1'])
        hoverOffThread(emptyEditor)
        getThreadsAtPosition(emptyEditor, 0)
        getAllThreadRanges(emptyEditor)
      }).not.toThrow()
      
      emptyEditor.destroy()
    })

    it('should handle invalid thread IDs', () => {
      expect(() => {
        hoverThread(editor, ['', null as any, undefined as any])
      }).not.toThrow()
    })

    it('should handle negative positions', () => {
      const threads = getThreadsAtPosition(editor, -1)
      expect(threads).toEqual([])
    })

    it('should handle positions beyond document length', () => {
      const docLength = editor.state.doc.content.size
      const threads = getThreadsAtPosition(editor, docLength + 100)
      expect(threads).toEqual([])
    })
  })

  describe('DOM Interaction', () => {
    it('should handle missing DOM elements gracefully', () => {
      mockElement.closest.mockReturnValue(null)
      mockElement.querySelector.mockReturnValue(null)

      expect(() => {
        hoverThread(editor, ['thread-1'])
      }).not.toThrow()
    })

    it('should handle DOM query failures', () => {
      mockQuerySelectorAll.mockImplementation(() => {
        throw new Error('DOM query failed')
      })

      expect(() => {
        hoverOffThread(editor)
      }).not.toThrow()
    })

    it('should handle classList operations failures', () => {
      mockElement.classList.add.mockImplementation(() => {
        throw new Error('ClassList operation failed')
      })

      mockElement.closest.mockReturnValue(mockElement)
      mockElement.querySelector.mockReturnValue(mockElement)

      expect(() => {
        hoverThread(editor, ['thread-1'])
      }).not.toThrow()
    })
  })
})