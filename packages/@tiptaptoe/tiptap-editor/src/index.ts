// Styles
import './styles.css';

// Main Components
export { TiptapEditor } from './components/TiptapEditor';
export { ConfigurableToolbar } from './components/ConfigurableToolbar';

// Hooks
export { useEditorConfig, MINIMAL_EXTENSIONS, STANDARD_EXTENSIONS, FULL_EXTENSIONS, MINIMAL_TOOLBAR, STANDARD_TOOLBAR } from './hooks/useEditorConfig';

// Types
export type {
  TiptapEditorProps,
  TiptapEditorConfig,
  ToolbarConfig,
  ToolbarItemConfig,
  ToolbarGroupConfig,
  ToolbarSeparatorConfig,
  ToolbarSpacerConfig,
  EditorPlugin
} from './types';

export { DEFAULT_TOOLBAR_CONFIG } from './types';