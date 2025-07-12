import { Mark, mergeAttributes } from '@tiptap/core'

export interface CommentMarkAttributes {
  threadId: string
  class?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentMark: {
      setCommentMark: (options: { threadId: string }) => ReturnType
      unsetCommentMark: (threadId?: string) => ReturnType
      toggleCommentMark: (options: { threadId: string }) => ReturnType
    }
  }
}

export const CommentMark = Mark.create<CommentMarkAttributes>({
  name: 'commentMark',

  addOptions() {
    return {
      threadId: '',
      class: 'comment-thread'
    }
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: element => element.getAttribute('data-thread-id'),
        renderHTML: attributes => ({
          'data-thread-id': attributes.threadId,
        }),
      },
      class: {
        default: this.options.class,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => ({
          class: attributes.class,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-thread-id]`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options, HTMLAttributes, {
        'data-comment-mark': '',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setCommentMark: options => ({ commands }) => {
        return commands.setMark(this.name, options)
      },
      unsetCommentMark: threadId => ({ tr, state, commands }) => {
        if (threadId) {
          const { doc } = state
          const ranges: { from: number; to: number }[] = []

          doc.descendants((node, pos) => {
            if (node.marks) {
              node.marks.forEach(mark => {
                if (mark.type.name === this.name && mark.attrs.threadId === threadId) {
                  ranges.push({
                    from: pos,
                    to: pos + node.nodeSize,
                  })
                }
              })
            }
          })

          ranges.forEach(({ from, to }) => {
            tr.removeMark(from, to, this.type)
          })

          return true
        }

        return commands.unsetMark(this.name)
      },
      toggleCommentMark: options => ({ commands }) => {
        return commands.toggleMark(this.name, options)
      },
    }
  },
})