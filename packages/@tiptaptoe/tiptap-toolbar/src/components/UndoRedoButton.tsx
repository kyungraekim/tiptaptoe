// packages/@tiptaptoe/tiptap-toolbar/src/components/UndoRedoButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, UndoIcon, RedoIcon } from '@tiptaptoe/ui-components';

interface UndoRedoButtonProps {
  action: 'undo' | 'redo';
}

export const UndoRedoButton: React.FC<UndoRedoButtonProps> = ({ action }) => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const canPerform = action === 'undo' ? (editor.can() as any).undo() : (editor.can() as any).redo();
  const Icon = action === 'undo' ? UndoIcon : RedoIcon;

  const handleClick = () => {
    if (action === 'undo') {
      (editor.chain().focus() as any).undo().run();
    } else {
      (editor.chain().focus() as any).redo().run();
    }
  };

  return (
    <Button
      data-style="ghost"
      onClick={handleClick}
      disabled={!canPerform}
      title={action.charAt(0).toUpperCase() + action.slice(1)}
    >
      <Icon className="tiptap-button-icon" />
    </Button>
  );
};