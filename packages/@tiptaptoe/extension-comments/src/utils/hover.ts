import { Editor } from '@tiptap/core'

export function hoverThread(editor: Editor, threadIds: string[]) {
  if (!editor || !threadIds.length) return
  
  const { view } = editor
  const { doc } = view.state
  
  // Remove existing hover classes
  hoverOffThread(editor)
  
  // Add hover class to all elements with the specified thread IDs
  doc.descendants((node, pos) => {
    if (node.marks) {
      node.marks.forEach(mark => {
        if (mark.type.name === 'commentMark' && threadIds.includes(mark.attrs.threadId)) {
          const dom = view.domAtPos(pos)
          if (dom.node && dom.node.nodeType === Node.ELEMENT_NODE) {
            const element = dom.node as HTMLElement
            const commentElement = element.closest('[data-thread-id]') || 
                                  element.querySelector(`[data-thread-id="${mark.attrs.threadId}"]`)
            
            if (commentElement) {
              commentElement.classList.add('comment-thread-hover')
            }
          }
        }
      })
    }
  })
}

export function hoverOffThread(editor: Editor) {
  if (!editor) return
  
  const { view } = editor
  
  try {
    // Remove all hover classes from comment elements
    const hoverElements = view.dom.querySelectorAll('.comment-thread-hover')
    hoverElements.forEach(element => {
      element.classList.remove('comment-thread-hover')
    })
  } catch (error) {
    // Silently handle DOM query failures
  }
}

export function getThreadsAtPosition(editor: Editor, pos: number): string[] {
  const { doc } = editor.state
  const threadIds: string[] = []
  
  try {
    // Check bounds
    if (pos < 0 || pos >= doc.content.size) {
      return threadIds
    }
    
    doc.nodeAt(pos)?.marks?.forEach(mark => {
      if (mark.type.name === 'commentMark' && mark.attrs.threadId) {
        threadIds.push(mark.attrs.threadId)
      }
    })
  } catch (error) {
    // Return empty array on error
  }
  
  return threadIds
}

export function getAllThreadRanges(editor: Editor): Array<{ threadId: string; from: number; to: number }> {
  const { doc } = editor.state
  const ranges: Array<{ threadId: string; from: number; to: number }> = []
  
  doc.descendants((node, pos) => {
    if (node.marks) {
      node.marks.forEach(mark => {
        if (mark.type.name === 'commentMark' && mark.attrs.threadId) {
          ranges.push({
            threadId: mark.attrs.threadId,
            from: pos,
            to: pos + node.nodeSize
          })
        }
      })
    }
  })
  
  return ranges
}