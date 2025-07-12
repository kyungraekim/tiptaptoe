import { Extension } from '@tiptap/core'
import { v4 as uuid } from 'uuid'
import { CommentMark } from '../marks/CommentMark'
import { DefaultCommentProvider } from '../storage/DefaultProvider'
import { CommentsKitOptions, CommentProvider, CommentUser, CommentThread } from '../types'

export const CommentsKit = Extension.create<CommentsKitOptions>({
  name: 'commentsKit',

  addOptions() {
    return {
      provider: undefined,
      user: undefined,
      useLegacyWrapping: false,
      onClickThread: undefined,
      onCreateThread: undefined,
      onDeleteThread: undefined,
      onResolveThread: undefined,
      onUpdateComment: undefined,
    }
  },

  addExtensions() {
    return [
      CommentMark.configure({
        class: this.options.useLegacyWrapping ? 'comment-thread-legacy' : 'comment-thread',
      }),
    ]
  },

  addStorage() {
    const user: CommentUser = this.options.user || {
      id: 'anonymous',
      name: 'Anonymous User',
      color: '#3b82f6'
    }

    const provider: CommentProvider = this.options.provider || new DefaultCommentProvider(user)

    return {
      provider,
      user,
      focusedThreads: [] as string[],
      hoveredThreads: [] as string[],
    }
  },

  onCreate() {
    // Set up provider update listener
    if (this.storage.provider.onUpdate) {
      this.storage.provider.onUpdate((threads: CommentThread[]) => {
        // Custom event handling can be added here
        this.editor.view.dispatch(
          this.editor.view.state.tr.setMeta('comments:update', threads)
        )
      })
    }
  },

  onDestroy() {
    // Clean up any listeners or resources
  },

  addCommands() {
    const provider = this.storage.provider
    
    return {
      createThread: (options = {}) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { from, to } = selection
        
        if (from === to) {
          return false
        }

        const threadId = options.id || uuid()
        const range = options.range || { from, to }

        try {
          provider.createThread(threadId, options.data)
          
          // Apply comment mark to the transaction
          tr.addMark(range.from, range.to, state.schema.marks.commentMark.create({ threadId }))
          tr.setMeta('commentThread', { action: 'create', threadId, range })
          
          if (this.options.onCreateThread) {
            this.options.onCreateThread(threadId)
          }
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to create thread:', error)
          return false
        }
      },

      removeThread: (options) => ({ tr, state, dispatch }) => {
        const { id: threadId } = options
        
        try {
          provider.deleteThread(threadId)
          
          // Remove all marks for this thread
          const { doc } = state
          const commentMarkType = state.schema.marks.commentMark

          doc.descendants((node, pos) => {
            if (node.marks) {
              node.marks.forEach(mark => {
                if (mark.type.name === 'commentMark' && mark.attrs.threadId === threadId) {
                  tr.removeMark(pos, pos + node.nodeSize, commentMarkType)
                }
              })
            }
          })
          
          tr.setMeta('commentThread', { action: 'remove', threadId })
          
          if (this.options.onDeleteThread) {
            this.options.onDeleteThread(threadId)
          }
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to remove thread:', error)
          return false
        }
      },

      selectThread: (options) => ({ tr, dispatch }) => {
        const { id: threadId } = options
        
        if (!provider.getThread(threadId)) {
          return false
        }

        tr.setMeta('commentSelection', { threadId, selected: true })
        this.storage.focusedThreads = [threadId]
        
        if (this.options.onClickThread) {
          this.options.onClickThread(threadId)
        }
        
        if (dispatch) {
          dispatch(tr)
        }
        
        return true
      },

      unselectThread: () => ({ tr, dispatch }) => {
        tr.setMeta('commentSelection', { selected: false })
        this.storage.focusedThreads = []
        
        if (dispatch) {
          dispatch(tr)
        }
        
        return true
      },

      resolveThread: (options) => ({ tr, dispatch }) => {
        const { id: threadId } = options
        
        try {
          const user = this.storage.user
          if (!user) {
            console.error('No user found in comments storage')
            return false
          }
          
          provider.resolveThread(threadId, user.id)
          tr.setMeta('commentThread', { action: 'resolve', threadId })
          
          if (this.options.onResolveThread) {
            this.options.onResolveThread(threadId)
          }
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to resolve thread:', error)
          return false
        }
      },

      unresolveThread: (options) => ({ tr, dispatch }) => {
        const { id: threadId } = options
        
        try {
          provider.unresolveThread(threadId)
          tr.setMeta('commentThread', { action: 'unresolve', threadId })
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to unresolve thread:', error)
          return false
        }
      },

      updateComment: (options) => ({ tr, dispatch }) => {
        const { threadId, id: commentId, content, data } = options
        
        try {
          provider.updateComment(threadId, commentId, content, data)
          tr.setMeta('commentUpdate', { threadId, commentId, content, data })
          
          if (this.options.onUpdateComment) {
            this.options.onUpdateComment(threadId, commentId, content, data)
          }
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to update comment:', error)
          return false
        }
      },

      deleteComment: (options) => ({ tr, dispatch }) => {
        const { threadId, id: commentId } = options
        
        try {
          provider.deleteComment(threadId, commentId)
          tr.setMeta('commentDelete', { threadId, commentId })
          
          if (dispatch) {
            dispatch(tr)
          }
          
          return true
        } catch (error) {
          console.error('Failed to delete comment:', error)
          return false
        }
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => {
        const { selection } = this.editor.state
        if (!selection.empty) {
          return this.editor.commands.createThread()
        }
        return false
      },
    }
  },
})