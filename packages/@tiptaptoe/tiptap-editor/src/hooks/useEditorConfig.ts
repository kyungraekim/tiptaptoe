import { useMemo } from 'react';
import { Extension } from '@tiptap/core';
import { TiptapEditorConfig, EditorPlugin, ToolbarConfig, DEFAULT_TOOLBAR_CONFIG } from '../types';

// Standard extension sets
export const MINIMAL_EXTENSIONS = ['StarterKit'];
export const STANDARD_EXTENSIONS = ['StarterKit', 'TextAlign', 'Underline', 'Highlight', 'Link'];
export const FULL_EXTENSIONS = [
  'StarterKit', 'TextAlign', 'Underline', 'TaskList', 'TaskItem', 
  'Highlight', 'Image', 'Typography', 'Superscript', 'Subscript', 'Link'
];

// Preset toolbar configurations
export const MINIMAL_TOOLBAR: ToolbarConfig = [
  { type: 'spacer' },
  {
    type: 'group',
    items: [
      { type: 'bold' },
      { type: 'italic' },
      { type: 'underline' }
    ]
  },
  { type: 'spacer' }
];

export const STANDARD_TOOLBAR: ToolbarConfig = [
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
      { type: 'heading', levels: [1, 2, 3] },
      { type: 'list', types: ['bulletList', 'orderedList'] }
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
      { type: 'highlight' },
      { type: 'link' }
    ]
  },
  { type: 'spacer' }
];

export interface UseEditorConfigProps {
  config?: TiptapEditorConfig;
  plugins?: EditorPlugin[];
}

export const useEditorConfig = ({ config = {}, plugins = [] }: UseEditorConfigProps = {}) => {
  return useMemo(() => {
    // Merge toolbar configurations from plugins
    const pluginToolbarItems = plugins.flatMap(plugin => plugin.toolbar || []);
    
    let toolbarConfig = config.toolbar?.config || DEFAULT_TOOLBAR_CONFIG;
    
    // If there are plugin toolbar items, add them to the toolbar
    if (pluginToolbarItems.length > 0) {
      toolbarConfig = [
        ...toolbarConfig,
        { type: 'separator' },
        {
          type: 'group',
          items: pluginToolbarItems
        }
      ];
    }

    // Merge extensions from plugins
    const pluginExtensions = plugins.flatMap(plugin => plugin.extensions || []);
    
    const mergedConfig: TiptapEditorConfig = {
      ...config,
      toolbar: {
        enabled: true,
        mobile: {
          enabled: true,
          collapseItems: false,
        },
        ...config.toolbar,
        config: toolbarConfig,
      },
      extensions: [
        ...(config.extensions || []),
        ...pluginExtensions
      ],
      plugins: [
        ...(config.plugins || []),
        ...plugins
      ]
    };

    return mergedConfig;
  }, [config, plugins]);
};