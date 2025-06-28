// src/components/toolbar/CodeBlockButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button } from '../ui/Button';
import { CodeIcon } from '../icons';

export const CodeBlockButton: React.FC = () => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const isActive = editor.isActive('codeBlock');

  const handleClick = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  return (
    <Button
      data-style="ghost"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={handleClick}
      title="Code Block"
    >
      <CodeIcon className="tiptap-button-icon" />
    </Button>
  );
};