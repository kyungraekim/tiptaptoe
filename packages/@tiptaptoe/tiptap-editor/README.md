# @tiptaptoe/tiptap-editor

A highly configurable TipTap editor with customizable toolbar and plugin system.

## Installation

```bash
npm install @tiptaptoe/tiptap-editor @tiptaptoe/ui-components @tiptaptoe/tiptap-toolbar
```

## Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install @tiptap/react @tiptap/core react react-dom
```

You'll also need TipTap extensions based on your configuration:

```bash
npm install @tiptap/starter-kit @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-task-item @tiptap/extension-task-list @tiptap/extension-text-align @tiptap/extension-underline
```

## Usage

### Basic Setup

```tsx
import { TiptapEditor } from '@tiptaptoe/tiptap-editor';
import '@tiptaptoe/ui-components/dist/styles.css';
import '@tiptaptoe/tiptap-editor/dist/styles.css';

// Import your desired TipTap extensions
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';

function MyEditor() {
  const [content, setContent] = useState('');

  const editorConfig = {
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: '<p>Hello world!</p>',
  };

  return (
    <TiptapEditor
      config={editorConfig}
      content={content}
      onChange={setContent}
    />
  );
}
```

### Custom Toolbar Configuration

```tsx
import { TiptapEditor, MINIMAL_TOOLBAR, STANDARD_TOOLBAR } from '@tiptaptoe/tiptap-editor';

// Use preset toolbar
const minimalConfig = {
  extensions: [StarterKit],
  toolbar: {
    config: MINIMAL_TOOLBAR
  }
};

// Custom toolbar configuration
const customConfig = {
  extensions: [StarterKit, Underline, Highlight],
  toolbar: {
    config: [
      { type: 'spacer' },
      {
        type: 'group',
        items: [
          { type: 'undo' },
          { type: 'redo' }
        ]
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'bold' },
          { type: 'italic' },
          { type: 'underline' },
          { type: 'highlight' }
        ]
      },
      { type: 'spacer' }
    ]
  }
};
```

### Plugin System

```tsx
// Create a custom plugin
const customPlugin = {
  name: 'custom-feature',
  component: ({ editor }) => (
    <div>Custom UI for editor</div>
  ),
  toolbar: [
    { type: 'custom', component: CustomToolbarButton }
  ],
  extensions: [/* custom extensions */]
};

const configWithPlugin = {
  extensions: [StarterKit],
  plugins: [customPlugin]
};
```

### Advanced Configuration

```tsx
const advancedConfig = {
  extensions: [
    StarterKit,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image,
    Link.configure({ openOnClick: false }),
  ],
  content: '<h1>Advanced Editor</h1>',
  placeholder: 'Start writing something amazing...',
  editable: true,
  autofocus: true,
  toolbar: {
    enabled: true,
    config: [
      { type: 'spacer' },
      {
        type: 'group',
        items: [
          { type: 'undo' },
          { type: 'redo' }
        ]
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'heading', levels: [1, 2, 3, 4] },
          { type: 'list', types: ['bulletList', 'orderedList', 'taskList'] },
          { type: 'blockquote' },
          { type: 'codeBlock' }
        ]
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'bold' },
          { type: 'italic' },
          { type: 'underline' },
          { type: 'strike' },
          { type: 'code' },
          { type: 'highlight' },
          { type: 'link' }
        ]
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'alignLeft' },
          { type: 'alignCenter' },
          { type: 'alignRight' },
          { type: 'alignJustify' }
        ]
      },
      { type: 'separator' },
      {
        type: 'group',
        items: [
          { type: 'image', text: 'Add Image' }
        ]
      },
      { type: 'spacer' },
      {
        type: 'group',
        items: [
          { type: 'theme' }
        ]
      }
    ],
    mobile: {
      enabled: true,
      collapseItems: true
    }
  }
};
```

## Configuration Options

### TiptapEditorConfig

```tsx
interface TiptapEditorConfig {
  extensions?: Extension[];           // TipTap extensions to use
  content?: string;                  // Initial content
  placeholder?: string;              // Placeholder text
  editable?: boolean;                // Whether editor is editable
  autofocus?: boolean;              // Auto-focus on mount
  toolbar?: {
    enabled?: boolean;              // Show/hide toolbar
    config?: ToolbarConfig;         // Toolbar configuration
    mobile?: {
      enabled?: boolean;            // Enable mobile support
      collapseItems?: boolean;      // Collapse toolbar on mobile
    };
  };
  plugins?: EditorPlugin[];         // Custom plugins
}
```

### Toolbar Items

Available toolbar item types:
- `'undo'` / `'redo'` - Undo/redo actions
- `'heading'` - Heading dropdown (specify `levels`)
- `'list'` - List dropdown (specify `types`)
- `'blockquote'` / `'codeBlock'` - Block formatting
- `'bold'` / `'italic'` / `'underline'` / `'strike'` / `'code'` - Text formatting
- `'superscript'` / `'subscript'` - Text effects
- `'highlight'` - Text highlighting
- `'link'` - Link insertion/editing
- `'alignLeft'` / `'alignCenter'` / `'alignRight'` / `'alignJustify'` - Text alignment
- `'image'` - Image insertion (specify `text`)
- `'theme'` - Dark/light mode toggle
- `'custom'` - Custom component (specify `component`)

### Toolbar Layout

- `{ type: 'group', items: [...] }` - Group of toolbar items
- `{ type: 'separator' }` - Visual separator
- `{ type: 'spacer' }` - Flexible space

## Preset Configurations

### MINIMAL_TOOLBAR
Basic formatting tools: bold, italic, underline

### STANDARD_TOOLBAR  
Common editing tools: undo/redo, headings, lists, basic formatting

### DEFAULT_TOOLBAR_CONFIG
Full-featured toolbar with all available tools

## Hooks

### useEditorConfig
Utility for merging configurations and plugins:

```tsx
import { useEditorConfig } from '@tiptaptoe/tiptap-editor';

const config = useEditorConfig({
  config: myConfig,
  plugins: [plugin1, plugin2]
});
```

## Plugin Development

```tsx
interface EditorPlugin {
  name: string;
  component?: React.ComponentType<{ editor: Editor }>;
  toolbar?: ToolbarItemConfig[];
  extensions?: Extension[];
}

// Example plugin
const myPlugin: EditorPlugin = {
  name: 'my-feature',
  component: MyFeatureComponent,
  toolbar: [
    { type: 'custom', component: MyToolbarButton }
  ],
  extensions: [MyCustomExtension]
};
```

## Styling

The editor comes with comprehensive CSS styles. Import the CSS file:

```tsx
import '@tiptaptoe/tiptap-editor/dist/styles.css';
```

Styles include:
- Dark/light mode support
- Responsive design
- Professional typography
- Syntax highlighting for code blocks
- Task list styling

## TypeScript

This package includes complete TypeScript definitions for all components, configurations, and plugins.

## License

MIT