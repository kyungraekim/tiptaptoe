# @tiptaptoe/ui-components

Reusable UI components, icons, and hooks extracted from TipTapToe editor.

## Installation

```bash
npm install @tiptaptoe/ui-components
```

## Usage

### Import Styles

```tsx
import '@tiptaptoe/ui-components/dist/styles.css';
```

### Components

```tsx
import {
  Button,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  Dropdown,
  DropdownItem,
  Portal,
  Spacer,
} from '@tiptaptoe/ui-components';

// Button with different styles
<Button data-style="default">Default</Button>
<Button data-style="ghost">Ghost</Button>
<Button data-style="outline">Outline</Button>

// Button with different sizes
<Button data-size="sm">Small</Button>
<Button data-size="md">Medium</Button>
<Button data-size="lg">Large</Button>

// Button with active state
<Button data-state="active">Active</Button>

// Toolbar layout
<Toolbar>
  <ToolbarGroup>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <Button>Action 3</Button>
  </ToolbarGroup>
  <Spacer />
  <ToolbarGroup>
    <Button>Right Side</Button>
  </ToolbarGroup>
</Toolbar>

// Dropdown menu
<Dropdown
  trigger={<Button>Open Menu</Button>}
>
  <DropdownItem onClick={() => console.log('Item 1')}>
    Item 1
  </DropdownItem>
  <DropdownItem onClick={() => console.log('Item 2')}>
    Item 2
  </DropdownItem>
</Dropdown>
```

### Icons

```tsx
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  CodeIcon,
  HighlighterIcon,
  LinkIcon,
  // ... and many more
} from '@tiptaptoe/ui-components';

<Button>
  <BoldIcon className="tiptap-button-icon" />
  Bold
</Button>
```

### Hooks

```tsx
import { useMobile, useWindowSize } from '@tiptaptoe/ui-components';

function MyComponent() {
  const isMobile = useMobile(); // defaults to 768px breakpoint
  const isMobileTablet = useMobile(1024); // custom breakpoint
  const { width, height } = useWindowSize();

  return (
    <div>
      {isMobile ? 'Mobile' : 'Desktop'}
      <p>Window size: {width} x {height}</p>
    </div>
  );
}
```

## Available Components

- **Button** - Versatile button component with multiple styles and states
- **Toolbar** - Horizontal toolbar container with groups and separators
- **Dropdown** - Portal-based dropdown with intelligent positioning
- **Portal** - React portal utility component
- **Spacer** - Flexible space utility component

## Available Icons (20+ icons)

Text formatting: `BoldIcon`, `ItalicIcon`, `UnderlineIcon`, `StrikeIcon`, `CodeIcon`, `HighlighterIcon`

Alignment: `AlignLeftIcon`, `AlignCenterIcon`, `AlignRightIcon`, `AlignJustifyIcon`

Lists: `ListIcon`, `NumberedListIcon`

Actions: `UndoIcon`, `RedoIcon`, `LinkIcon`, `ImageIcon`, `QuoteIcon`

Navigation: `ArrowLeftIcon`, `ChevronDownIcon`

Text effects: `SuperscriptIcon`, `SubscriptIcon`

Theme: `SunIcon`, `MoonIcon`

## Available Hooks

- **useMobile(breakpoint?)** - Detects mobile viewport with customizable breakpoint
- **useWindowSize()** - Tracks window dimensions with resize handling

## Styling

Components use CSS custom properties and data attributes for styling. Dark mode is supported via:
- CSS `prefers-color-scheme: dark` media query
- `.dark` class on parent elements

## TypeScript

This package includes TypeScript definitions for all components, icons, and hooks.

## License

MIT