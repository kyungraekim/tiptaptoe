// src/editor/extensions.ts
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

export const editorExtensions = [
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
];
