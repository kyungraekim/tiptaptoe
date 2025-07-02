# @tiptaptoe/tiptap-toolbar

Complete set of toolbar components for TipTap rich text editors.

## Installation

```bash
npm install @tiptaptoe/tiptap-toolbar @tiptaptoe/ui-components
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @tiptap/react @tiptap/core react react-dom
```

You'll also need the relevant TipTap extensions for the toolbar components you use:

```bash
npm install @tiptap/starter-kit @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-task-item @tiptap/extension-task-list @tiptap/extension-text-align @tiptap/extension-underline
```

## Usage

### Basic Setup

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Toolbar, 
  ToolbarGroup, 
  ToolbarSeparator,
  Spacer 
} from '@tiptaptoe/ui-components';
import {
  MarkButton,
  HeadingDropdownMenu,
  UndoRedoButton,
  // ... other toolbar components
} from '@tiptaptoe/tiptap-toolbar';

function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello world!</p>',
  });

  if (!editor) return null;

  return (
    <div>
      <Toolbar>
        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>
        
        <ToolbarSeparator />
        
        <ToolbarGroup>
          <HeadingDropdownMenu levels={[1, 2, 3]} />
        </ToolbarGroup>
        
        <ToolbarSeparator />
        
        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="underline" />
          <MarkButton type="strike" />
        </ToolbarGroup>
        
        <Spacer />
        
        <ToolbarGroup>
          <ThemeToggle />
        </ToolbarGroup>
      </Toolbar>
      
      <EditorContent editor={editor} />
    </div>
  );
}
```

## Available Components

### Text Formatting
- **MarkButton** - Bold, italic, underline, strike, code, superscript, subscript
- **ColorHighlightPopover** - Text highlighting with color picker

### Block Elements  
- **HeadingDropdownMenu** - Heading levels and paragraph
- **BlockquoteButton** - Blockquote formatting
- **CodeBlockButton** - Code block insertion
- **ListDropdownMenu** - Bullet lists, numbered lists, task lists

### Content Insertion
- **ImageUploadButton** - Image insertion with file picker
- **LinkPopover** - Link creation and editing

### Layout & Alignment
- **TextAlignButton** - Text alignment (left, center, right, justify)

### Actions
- **UndoRedoButton** - Undo and redo actions

### UI Controls
- **ThemeToggle** - Dark/light mode toggle

## Component Props

### MarkButton
```tsx
<MarkButton type="bold" />
<MarkButton type="italic" />
<MarkButton type="underline" />
<MarkButton type="strike" />
<MarkButton type="code" />
<MarkButton type="superscript" />
<MarkButton type="subscript" />
```

### HeadingDropdownMenu
```tsx
<HeadingDropdownMenu levels={[1, 2, 3, 4, 5, 6]} />
```

### UndoRedoButton
```tsx
<UndoRedoButton action="undo" />
<UndoRedoButton action="redo" />
```

### TextAlignButton
```tsx
<TextAlignButton align="left" />
<TextAlignButton align="center" />
<TextAlignButton align="right" />
<TextAlignButton align="justify" />
```

### ListDropdownMenu
```tsx
<ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
```

### ImageUploadButton
```tsx
<ImageUploadButton text="Add Image" />
```

## Hooks

### useCursorVisibility
Tracks cursor position for UI positioning:

```tsx
import { useCursorVisibility } from '@tiptaptoe/tiptap-toolbar';

function MyComponent() {
  const { editor } = useCurrentEditor();
  const bodyRect = useCursorVisibility({ editor });
  
  return <div style={{ top: bodyRect.y }}>Floating element</div>;
}
```

## Required Extensions

Different toolbar components require specific TipTap extensions:

- **MarkButton**: StarterKit (bold, italic, strike, code), Underline, Superscript, Subscript
- **HeadingDropdownMenu**: StarterKit  
- **ColorHighlightPopover**: Highlight
- **TextAlignButton**: TextAlign
- **ListDropdownMenu**: StarterKit (bullet/ordered lists), TaskList + TaskItem
- **ImageUploadButton**: Image
- **LinkPopover**: Link
- **UndoRedoButton**: StarterKit
- **BlockquoteButton**: StarterKit
- **CodeBlockButton**: StarterKit

## TypeScript

This package includes TypeScript definitions. Some TipTap commands use `any` types for compatibility across different extension combinations.

## License

MIT