import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core';
import { CommentMarkProps } from '../types/comments';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentMark: {
      setCommentMark: (options: { commentId: string }) => ReturnType;
      unsetCommentMark: (commentId?: string) => ReturnType;
      toggleCommentMark: (options: { commentId: string }) => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentMarkProps>({
  name: 'commentMark',

  addOptions() {
    return {
      commentId: '',
      isActive: false,
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
        getAttrs: element => {
          const commentId = (element as HTMLElement).getAttribute('data-comment-id');
          return commentId ? { commentId } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'comment-mark',
        style: 'background-color: #fef3c7; border-bottom: 2px solid #f59e0b; cursor: pointer; position: relative;',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCommentMark:
        (options) =>
        ({ commands }) => {
          return commands.setMark(this.name, options);
        },
      unsetCommentMark:
        (commentId) =>
        ({ commands }) => {
          if (commentId) {
            return commands.unsetMark(this.name);
          }
          return commands.unsetMark(this.name);
        },
      toggleCommentMark:
        (options) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, options);
        },
    };
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /\[comment:([^\]]+)\]/g,
        type: this.type,
        getAttributes: (match) => ({
          commentId: match[1],
        }),
      }),
    ];
  },
});