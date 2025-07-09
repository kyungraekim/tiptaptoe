import React from 'react';
import { TiptapEditor } from '@tiptaptoe/tiptap-editor';
import '@tiptaptoe/tiptap-editor/dist/styles.css';

// TipTap extensions
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

// Plugins
import { createChatPlugin } from '../plugins/ChatPlugin';
import { CommentMark } from '../extensions/CommentMark';
import { Comment } from '../types/comments';

const DEFAULT_CONTENT = `
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

interface AppEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onCommentsChange?: (comments: Comment[]) => void;
}

export const AppEditor = React.forwardRef<any, AppEditorProps>(
  ({ content, onChange, onCommentsChange }, ref) => {
    const editorConfig = {
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
        CommentMark,
      ],
      content: content || DEFAULT_CONTENT,
      plugins: [createChatPlugin(onCommentsChange)],
    };

    return (
      <TiptapEditor
        ref={ref}
        config={editorConfig}
        content={content}
        onChange={onChange}
        className="simple-editor"
      />
    );
  }
);