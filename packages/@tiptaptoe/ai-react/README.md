# @tiptaptoe/ai-react

React components and hooks for AI functionality in TipTapToe applications.

## Features

- **React Hooks**: `useChat`, `useAISettings` for AI state management
- **Chat Components**: Complete chat interface with file context support
- **PDF Components**: PDF upload, analysis, and AI summarization
- **Settings Components**: Comprehensive AI configuration UI
- **Context Providers**: File context management
- **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install @tiptaptoe/ai-react @tiptaptoe/ai-core @tiptaptoe/ui-components
```

## Quick Start

### 1. Wrap your app with providers

```tsx
import { FileContextProvider } from '@tiptaptoe/ai-react';

function App() {
  return (
    <FileContextProvider>
      <YourApplication />
    </FileContextProvider>
  );
}
```

### 2. Use AI Settings

```tsx
import { useAISettings, SettingsModal } from '@tiptaptoe/ai-react';

function SettingsButton() {
  const { settings, saveSettings, testConnection } = useAISettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>AI Settings</button>
      <SettingsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
```

### 3. Add PDF Summarization

```tsx
import { GenerateButton, useFileContext } from '@tiptaptoe/ai-react';

function PDFSummarizer() {
  const { availableFiles } = useFileContext();

  const handleSummaryGenerated = (summary: string) => {  
    console.log('Generated summary:', summary);
    // Insert summary into your editor or display it
  };

  return (
    <GenerateButton onSummaryGenerated={handleSummaryGenerated} />
  );
}
```

### 4. Add AI Chat

```tsx
import { useChat, ChatDialog } from '@tiptaptoe/ai-react';

function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const { availableFiles } = useFileContext();

  const handleApplyResponse = (response: string, action: 'append' | 'replace') => {
    // Apply AI response to your editor
    console.log('Apply response:', response, action);
  };

  return (
    <ChatDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      selectedText={selectedText}
      onApplyResponse={handleApplyResponse}
      initialFiles={availableFiles}
    />
  );
}
```

### 5. Add Selection Bubble

```tsx
import { ChatBubble } from '@tiptaptoe/ai-react';
import { useEditor } from '@tiptap/react';

function Editor() {
  const editor = useEditor({...});

  const handleChatClick = (selectedText: string) => {
    setSelectedText(selectedText);
    setChatOpen(true);
  };

  const handleCommentClick = (selectedText: string) => {
    // Handle comment creation
  };

  return (
    <div style={{ position: 'relative' }}>
      <EditorContent editor={editor} />
      <ChatBubble
        editor={editor}
        onChatClick={handleChatClick}
        onCommentClick={handleCommentClick}
      />
    </div>
  );
}
```

## Components

### Chat Components
- `ChatDialog` - Main chat interface modal
- `ChatBubble` - Text selection bubble with AI/comment buttons
- `ChatMessages` - Message list with apply response buttons
- `ChatInput` - Message input with send functionality
- `FileContextPanel` - File selection and management

### PDF Components
- `GenerateButton` - PDF upload and AI summarization

### Settings Components
- `SettingsModal` - Complete AI settings interface
- `BasicSettings` - API key, base URL, model selection
- `AdvancedSettings` - Max tokens, temperature, timeout
- `ConnectionStatus` - Real-time connection testing

## Hooks

### useAISettings
```tsx
const {
  settings,
  isLoading,
  error,
  updateSettings,
  resetSettings,
  saveSettings,
  testConnection,
  validateCurrentSettings
} = useAISettings();
```

### useChat
```tsx
const {
  messages,
  inputValue,
  isLoading,
  error,
  availableFiles,
  selectedFiles,
  setInputValue,
  sendMessage,
  applyResponse,
  clearChat,
  handleFileToggle
} = useChat({ selectedText, onApplyResponse, initialFiles });
```

## Context Providers

### FileContextProvider
Manages file context for AI conversations:

```tsx
const {
  availableFiles,
  addFile,
  removeFile,
  clearFiles,
  getFileById
} = useFileContext();
```

## Styling

Import the CSS file for default styling:

```tsx
import '@tiptaptoe/ai-react/dist/styles.css';
```

Or use the utility functions for custom styling:

```tsx
import { createOverlayStyle, createButtonStyle } from '@tiptaptoe/ai-react';
```

## Requirements

- React 18+
- Tauri application environment
- `@tiptaptoe/ai-core` for AI functionality
- `@tiptaptoe/ui-components` for UI primitives

## Peer Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## License

MIT