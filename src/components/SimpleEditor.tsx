// src/components/SimpleEditor.tsx
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
import { Button } from './ui/Button';
import { Spacer } from './ui/Spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from './ui/Toolbar';

// Toolbar Components
import { HeadingDropdownMenu } from './toolbar/HeadingDropdownMenu';
import { ImageUploadButton } from './toolbar/ImageUploadButton';
import { ListDropdownMenu } from './toolbar/ListDropdownMenu';
import { BlockquoteButton } from './toolbar/BlockquoteButton';
import { CodeBlockButton } from './toolbar/CodeBlockButton';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from './toolbar/ColorHighlightPopover';
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from './toolbar/LinkPopover';
import { MarkButton } from './toolbar/MarkButton';
import { TextAlignButton } from './toolbar/TextAlignButton';
import { UndoRedoButton } from './toolbar/UndoRedoButton';
import { ThemeToggle } from './toolbar/ThemeToggle';

// Icons
import { ArrowLeftIcon, HighlighterIcon, LinkIcon } from './icons';

// Hooks
import { useMobile } from '../hooks/useMobile';
import { useWindowSize } from '../hooks/useWindowSize';
import { useCursorVisibility } from '../hooks/useCursorVisibility';

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

export function SimpleEditor({ content, onChange }: SimpleEditorProps) {
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main");
  const toolbarRef = useRef<HTMLDivElement>(null);

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
      onChange?.(editor.getHTML());
    },
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="simple-editor">
        <Toolbar
          ref={toolbarRef}
          style={
            isMobile
              ? {
                  position: 'fixed',
                  bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
                  left: 0,
                  right: 0,
                  zIndex: 50,
                }
              : {}
          }
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <div className="content-wrapper">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}