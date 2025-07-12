import React, { useEffect, useRef } from 'react';
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

// Plugins and utilities
import { createChatPlugin } from '../plugins/ChatPlugin';
import { CommentsKit } from '@tiptaptoe/extension-comments';
import { Comment } from '../types/comments';
import { CommentSynchronizer } from '../utils/commentSynchronizer';

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
  onCommentSync?: () => void;
}

export const AppEditor = React.forwardRef<any, AppEditorProps>(
  ({ content, onChange, onCommentsChange, onCommentSync }, ref) => {
    const synchronizerRef = useRef<CommentSynchronizer | null>(null);

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
        CommentsKit.configure({
          user: {
            id: 'default-user',
            name: 'User',
            color: '#3b82f6'
          },
          onClickThread: (threadId: any) => {
            console.log('Thread clicked:', threadId);
          },
          onCreateThread: (threadId: any) => {
            console.log('Thread created:', threadId);
          },
          onDeleteThread: (threadId: any) => {
            console.log('Thread deleted:', threadId);
          },
          onResolveThread: (threadId: any) => {
            console.log('Thread resolved:', threadId);
          },
          onUpdateComment: (threadId: any, commentId: any, content: any, data: any) => {
            console.log('Comment updated:', { threadId, commentId, content, data });
          }
        }),
      ],
      content: content || DEFAULT_CONTENT,
      plugins: [createChatPlugin(onCommentsChange, onCommentSync)],
    };

    // Set up synchronizer when editor is ready
    const setupSynchronizer = (editor: any) => {
      console.log('Setting up CommentSynchronizer with editor:', editor);
      
      if (editor && !synchronizerRef.current) {
        synchronizerRef.current = new CommentSynchronizer(editor, onCommentSync);
        
        // Expose synchronizer globally for debugging
        if (typeof window !== 'undefined') {
          (window as any).commentSynchronizer = synchronizerRef.current;
          console.log('CommentSynchronizer exposed as window.commentSynchronizer');
        }
        
        // Add document change listener
        const handleUpdate = ({ transaction }: any) => {
          // Only sync if the content actually changed (not just selection changes)
          if (transaction.docChanged) {
            console.log('Document content changed! Triggering synchronization...');
            synchronizerRef.current?.debouncedSynchronize();
          }
        };
        
        editor.on('update', handleUpdate);
        console.log('Update listener attached to editor');
        
        // Initial synchronization
        console.log('Running initial synchronization...');
        synchronizerRef.current.synchronize();
        
        // Store cleanup function
        return () => {
          console.log('Cleaning up editor listeners...');
          editor.off('update', handleUpdate);
          synchronizerRef.current?.destroy();
          synchronizerRef.current = null;
          
          // Clean up global reference
          if (typeof window !== 'undefined') {
            delete (window as any).commentSynchronizer;
          }
        };
      }
    };

    // Set up document change listeners when ref becomes available
    useEffect(() => {
      console.log('AppEditor useEffect triggered, checking ref...');
      
      let cleanup: (() => void) | undefined;
      
      // Poll for editor availability
      const checkEditor = () => {
        if (ref && 'current' in ref && ref.current) {
          console.log('Editor found, setting up synchronizer...');
          cleanup = setupSynchronizer(ref.current);
          return true;
        }
        return false;
      };
      
      // Try immediately
      if (!checkEditor()) {
        // If not available, poll every 100ms for up to 5 seconds
        const interval = setInterval(() => {
          if (checkEditor()) {
            clearInterval(interval);
          }
        }, 100);
        
        // Cleanup interval after 5 seconds
        setTimeout(() => {
          clearInterval(interval);
        }, 5000);
        
        return () => {
          clearInterval(interval);
          cleanup?.();
        };
      }
      
      return cleanup;
    }, [ref, onCommentSync]);

    // Enhanced onChange handler
    const handleChange = (newContent: string) => {
      onChange?.(newContent);
      
      // Trigger comment sync after content changes
      if (synchronizerRef.current) {
        synchronizerRef.current.debouncedSynchronize();
      }
    };

    return (
      <TiptapEditor
        ref={ref}
        config={editorConfig}
        content={content}
        onChange={handleChange}
        className="simple-editor"
      />
    );
  }
);