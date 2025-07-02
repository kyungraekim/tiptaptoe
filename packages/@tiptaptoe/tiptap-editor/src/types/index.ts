import { Extension } from '@tiptap/core';
import { Editor } from '@tiptap/react';

// Toolbar configuration types
export type ToolbarGroupConfig = {
  type: 'group';
  items: ToolbarItemConfig[];
};

export type ToolbarSeparatorConfig = {
  type: 'separator';
};

export type ToolbarSpacerConfig = {
  type: 'spacer';
};

export type ToolbarItemConfig = 
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'heading'; levels: number[] }
  | { type: 'list'; types: ('bulletList' | 'orderedList' | 'taskList')[] }
  | { type: 'blockquote' }
  | { type: 'codeBlock' }
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'underline' }
  | { type: 'strike' }
  | { type: 'code' }
  | { type: 'superscript' }
  | { type: 'subscript' }
  | { type: 'highlight' }
  | { type: 'link' }
  | { type: 'alignLeft' }
  | { type: 'alignCenter' }
  | { type: 'alignRight' }
  | { type: 'alignJustify' }
  | { type: 'image'; text?: string }
  | { type: 'theme' }
  | { type: 'custom'; component: React.ComponentType<{ editor: Editor }> };

export type ToolbarConfig = (ToolbarGroupConfig | ToolbarSeparatorConfig | ToolbarSpacerConfig)[];

// Editor configuration
export interface TiptapEditorConfig {
  extensions?: any[];
  content?: string;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  toolbar?: {
    enabled?: boolean;
    config?: ToolbarConfig;
    mobile?: {
      enabled?: boolean;
      collapseItems?: boolean;
    };
  };
  plugins?: EditorPlugin[];
}

// Plugin system
export interface EditorPlugin {
  name: string;
  component?: React.ComponentType<{ editor: Editor }>;
  toolbar?: ToolbarItemConfig[];
  extensions?: any[];
}

// Props for the main editor component
export interface TiptapEditorProps {
  config?: TiptapEditorConfig;
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Default toolbar configurations
export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = [
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
      { type: 'superscript' },
      { type: 'subscript' }
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
      { type: 'image', text: 'Add' }
    ]
  },
  { type: 'spacer' },
  {
    type: 'group',
    items: [
      { type: 'theme' }
    ]
  }
];