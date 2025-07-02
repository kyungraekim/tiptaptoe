// src/components/SimpleEditor.tsx - Updated version with chat integration
import React, { useRef, useEffect, useState } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

// UI Components
import { Button, Spacer, Toolbar, ToolbarGroup, ToolbarSeparator } from '@tiptaptoe/ui-components';

// Toolbar Components
import {
  HeadingDropdownMenu,
  ImageUploadButton,
  ListDropdownMenu,
  BlockquoteButton,
  CodeBlockButton,
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
  LinkPopover,
  LinkContent,
  LinkButton,
  MarkButton,
  TextAlignButton,
  UndoRedoButton,
  ThemeToggle,
  useCursorVisibility,
} from '@tiptaptoe/tiptap-toolbar';

// New chat components
import { ChatBubble } from './ChatBubble';
import { ChatDialog } from './ChatDialog';

// Icons
import { ArrowLeftIcon, HighlighterIcon, LinkIcon } from '@tiptaptoe/ui-components';

// Hooks
import { useMobile } from '@tiptaptoe/ui-components';

// Styles
import './simple-editor.css';

const defaultContent = `
<h1>Welcome to Tiptap Simple Editor</h1>
<p>This is a comprehensive rich text editor built with Tiptap and React. You can use it to create beautiful documents with various formatting options.</p>
<h2>Features:</h2>
<ul>
  <li>Rich text formatting (bold, italic, underline, etc.)</li>
  <li>Multiple heading levels</li>
  <li>Lists (bullet, numbered, task lists)</li>
  <li>Text alignment options</li>
  <li>Highlighting and links</li>
  <li>Images and blockquotes</li>
  <li>Code blocks and inline code</li>
  <li><strong>NEW: AI Chat Assistant</strong> - Select text and click the chat icon to get AI help!</li>
</ul>
<p>Start typing to see the editor in action!</p>
`;

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

interface SimpleEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

export const SimpleEditor = React.forwardRef<any, SimpleEditorProps>(
  ({ content, onChange }, ref) => {
  const isMobile = useMobile();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main");
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedTextForChat, setSelectedTextForChat] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Link.configure({ openOnClick: false }),
    ],
    content: content || defaultContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log("Editor content updated:", newContent.substring(0, 100) + "...");
      onChange?.(newContent);
    },
  });

  // Expose the editor instance via ref
  React.useImperativeHandle(ref, () => editor, [editor]);

  // Critical fix: Sync external content changes to the editor
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      
      console.log("Content prop changed:", content ? content.substring(0, 100) + "..." : "empty");
      console.log("Current editor content:", currentContent ? currentContent.substring(0, 100) + "..." : "empty");
      
      // Only update if the content is different to avoid infinite loops
      if (currentContent !== content) {
        console.log("Updating editor content to match prop");
        // Use setTimeout to avoid potential race conditions
        // Set addToHistory to false to prevent adding to undo stack when updating from external source
        setTimeout(() => {
          editor.commands.setContent(content || defaultContent, false, { preserveWhitespace: 'full' });
        }, 0);
      }
    }
  }, [editor, content]);

  useCursorVisibility({
    editor,
  });

  // Chat handlers
  const handleChatClick = (selectedText: string) => {
    setSelectedTextForChat(selectedText);
    setIsChatDialogOpen(true);
  };

  const handleApplyResponse = (response: string, action: 'append' | 'replace') => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;

    if (action === 'replace') {
      // Replace the selected text with parsed HTML content
      editor.chain().focus().deleteRange({ from, to }).insertContent(response).run();
    } else if (action === 'append') {
      // Find the end of the current paragraph/block that contains the selection
      const $pos = state.doc.resolve(to);
      const blockEnd = $pos.end($pos.depth);
      
      // Move to end of the current paragraph and append on the next line
      editor.chain().focus().setTextSelection(blockEnd).insertContent(response).run();
    }
  };

  if (!editor) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Loading editor...
      </div>
    );
  }

  return (
    <div className="simple-editor" style={{ position: 'relative' }}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef}>
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <div className="content-wrapper" style={{ position: 'relative' }}>
          <div className="simple-editor-content">
            <EditorContent editor={editor} />
          </div>
          
          {/* Chat bubble overlay */}
          <ChatBubble 
            editor={editor} 
            onChatClick={handleChatClick}
          />
        </div>

        {/* Chat dialog */}
        <ChatDialog
          isOpen={isChatDialogOpen}
          onClose={() => setIsChatDialogOpen(false)}
          selectedText={selectedTextForChat}
          onApplyResponse={handleApplyResponse}
        />
      </EditorContext.Provider>
    </div>
  );
});
