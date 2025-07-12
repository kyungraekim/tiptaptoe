# @tiptaptoe/extension-comments

A comprehensive commenting system for TipTap editor, inspired by the commercial TipTap Pro comments extension.

## Features

- ✅ **Thread-based Comments**: Organize comments into threads for better discussion flow
- ✅ **Comment Marks**: Visual highlighting of commented text in the editor
- ✅ **Hover Effects**: Interactive hover states for comment threads
- ✅ **Keyboard Shortcuts**: Quick comment creation with `Cmd/Ctrl + Shift + C`
- ✅ **Flexible Provider System**: Use default storage or implement custom providers
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Thread Management**: Create, resolve, unresolve, and delete comment threads
- ✅ **Comment Operations**: Add, edit, and delete individual comments

## Installation

```bash
npm install @tiptaptoe/extension-comments
```

## Basic Usage

```typescript
import { Editor } from '@tiptap/react'
import { CommentsKit, useThreads } from '@tiptaptoe/extension-comments'

const editor = new Editor({
  extensions: [
    // ... other extensions
    CommentsKit.configure({
      user: {
        id: 'user-1',
        name: 'John Doe',
        color: '#3b82f6'
      },
      onClickThread: (threadId) => {
        console.log('Thread clicked:', threadId)
      }
    })
  ]
})

// In your React component
const { threads, createThread, addComment } = useThreads(
  editor?.storage.commentsKit?.provider,
  editor,
  { id: 'user-1', name: 'John Doe' }
)
```

## Advanced Usage

### Custom Provider

```typescript
import { CommentProvider } from '@tiptaptoe/extension-comments'

class YourCustomProvider implements CommentProvider {
  // Implement all required methods
  getThreads() { /* ... */ }
  createThread(threadId, data) { /* ... */ }
  // ... other methods
}

const editor = new Editor({
  extensions: [
    CommentsKit.configure({
      provider: new YourCustomProvider(),
      user: yourUser
    })
  ]
})
```

### Hover Effects

```typescript
import { hoverThread, hoverOffThread } from '@tiptaptoe/extension-comments'

// Highlight threads on hover
const onHoverThread = useCallback((threadId) => {
  hoverThread(editor, [threadId])
}, [editor])

const onLeaveThread = useCallback(() => {
  hoverOffThread(editor)
}, [editor])
```

## API Reference

### CommentsKit Options

- `provider?: CommentProvider` - Custom storage provider
- `user?: CommentUser` - Current user information
- `useLegacyWrapping?: boolean` - Use legacy CSS classes
- `onClickThread?: (threadId: string) => void` - Thread click handler
- `onCreateThread?: (threadId: string) => void` - Thread creation handler
- `onDeleteThread?: (threadId: string) => void` - Thread deletion handler
- `onResolveThread?: (threadId: string) => void` - Thread resolution handler
- `onUpdateComment?: (threadId, commentId, content, data) => void` - Comment update handler

### Editor Commands

- `createThread(options?)` - Create a new comment thread
- `selectThread({ id, updateSelection? })` - Select and focus a thread
- `unselectThread()` - Unselect current thread
- `removeThread({ id })` - Delete a thread
- `resolveThread({ id })` - Mark thread as resolved
- `unresolveThread({ id })` - Mark thread as unresolved
- `updateComment({ threadId, id, content, data? })` - Update a comment
- `deleteComment({ threadId, id })` - Delete a comment

### Keyboard Shortcuts

- `Cmd/Ctrl + Shift + C` - Create comment thread from selection

## Types

The package exports comprehensive TypeScript types for all interfaces:

- `CommentUser` - User information
- `Comment` - Individual comment data
- `CommentThread` - Thread containing comments
- `CommentProvider` - Storage provider interface
- `CommentsKitOptions` - Extension configuration options

## Styling

The extension adds CSS classes that you can style:

```css
.comment-thread {
  background-color: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  cursor: pointer;
}

.comment-thread-hover {
  background-color: #fde68a;
}

.comment-thread-legacy {
  /* Legacy styling if useLegacyWrapping is true */
}
```

## License

MIT