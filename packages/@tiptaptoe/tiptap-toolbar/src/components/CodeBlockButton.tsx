// packages/@tiptaptoe/tiptap-toolbar/src/components/CodeBlockButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, CodeIcon } from '@tiptaptoe/ui-components';

export const CodeBlockButton: React.FC = () => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const isActive = editor.isActive('codeBlock');

  const handleClick = () => {
    (editor.chain().focus() as any).toggleCodeBlock().run();
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