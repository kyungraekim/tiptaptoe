// packages/@tiptaptoe/tiptap-toolbar/src/components/BlockQuoteButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, QuoteIcon } from '@tiptaptoe/ui-components';

export const BlockquoteButton: React.FC = () => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const isActive = editor.isActive('blockquote');

  const handleClick = () => {
    (editor.chain().focus() as any).toggleBlockquote().run();
  };

  return (
    <Button
      data-style="ghost"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={handleClick}
      title="Blockquote"
    >
      <QuoteIcon className="tiptap-button-icon" />
    </Button>
  );
};