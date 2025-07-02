import React, { useRef, useEffect } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { useCursorVisibility } from '@tiptaptoe/tiptap-toolbar';
import { ConfigurableToolbar } from './ConfigurableToolbar';
import { TiptapEditorProps, TiptapEditorConfig, DEFAULT_TOOLBAR_CONFIG } from '../types';

const DEFAULT_CONTENT = `
<h1>Welcome to TipTap Editor</h1>
<p>This is a configurable rich text editor built with TipTap and React. You can customize the toolbar, extensions, and features to suit your needs.</p>
<h2>Features:</h2>
<ul>
  <li>Rich text formatting (bold, italic, underline, etc.)</li>
  <li>Multiple heading levels</li>
  <li>Lists (bullet, numbered, task lists)</li>
  <li>Text alignment options</li>
  <li>Highlighting and links</li>
  <li>Images and blockquotes</li>
  <li>Code blocks and inline code</li>
  <li>Configurable toolbar and extensions</li>
</ul>
<p>Start typing to see the editor in action!</p>
`;

export const TiptapEditor = React.forwardRef<any, TiptapEditorProps>(
  ({ config = {}, content, onChange, className = '', style }, ref) => {
    const toolbarRef = useRef<HTMLDivElement>(null);
    
    // Merge config with defaults
    const editorConfig: TiptapEditorConfig = {
      extensions: [], // Extensions should be provided by the consumer
      content: DEFAULT_CONTENT,
      placeholder: 'Start typing...',
      editable: true,
      autofocus: false,
      toolbar: {
        enabled: true,
        config: DEFAULT_TOOLBAR_CONFIG,
        mobile: {
          enabled: true,
          collapseItems: false,
        },
      },
      plugins: [],
      ...config,
    };

    // Combine extensions from config and plugins
    const allExtensions = [
      ...(editorConfig.extensions || []),
      ...(editorConfig.plugins?.flatMap(plugin => plugin.extensions || []) || [])
    ] as any;

    const editor = useEditor({
      immediatelyRender: false,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Rich text editor",
        },
      },
      extensions: allExtensions,
      content: content || editorConfig.content,
      editable: editorConfig.editable,
      autofocus: editorConfig.autofocus,
      onUpdate: ({ editor }) => {
        const newContent = editor.getHTML();
        onChange?.(newContent);
      },
    });

    // Expose the editor instance via ref
    React.useImperativeHandle(ref, () => editor, [editor]);

    // Sync external content changes to the editor
    useEffect(() => {
      if (editor && content !== undefined) {
        const currentContent = editor.getHTML();
        
        // Only update if the content is different to avoid infinite loops
        if (currentContent !== content) {
          setTimeout(() => {
            editor.commands.setContent(content || editorConfig.content || '', false, { 
              preserveWhitespace: 'full' 
            });
          }, 0);
        }
      }
    }, [editor, content, editorConfig.content]);

    // Use cursor visibility hook
    useCursorVisibility({ editor: editor as any });

    if (!editor) {
      return (
        <div 
          className={`tiptap-editor-loading ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#6b7280',
            fontSize: '14px',
            ...style
          }}
        >
          Loading editor...
        </div>
      );
    }

    return (
      <div 
        className={`tiptap-editor ${className}`} 
        style={{ position: 'relative', ...style }}
      >
        <EditorContext.Provider value={{ editor }}>
          {editorConfig.toolbar?.enabled && (
            <ConfigurableToolbar
              editor={editor}
              config={editorConfig.toolbar.config || DEFAULT_TOOLBAR_CONFIG}
            />
          )}

          <div className="tiptap-editor-content-wrapper" style={{ position: 'relative' }}>
            <div className="tiptap-editor-content">
              <EditorContent editor={editor} />
            </div>
            
            {/* Render plugin components */}
            {editorConfig.plugins?.map((plugin, index) => 
              plugin.component ? (
                <plugin.component key={`plugin-${plugin.name}-${index}`} editor={editor} />
              ) : null
            )}
          </div>
        </EditorContext.Provider>
      </div>
    );
  }
);