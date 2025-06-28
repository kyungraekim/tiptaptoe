// src/components/toolbar/UndoRedoButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button } from '../ui/Button';
import { UndoIcon, RedoIcon } from '../icons';

interface UndoRedoButtonProps {
  action: 'undo' | 'redo';
}

export const UndoRedoButton: React.FC<UndoRedoButtonProps> = ({ action }) => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const canPerform = action === 'undo' ? editor.can().undo() : editor.can().redo();
  const Icon = action === 'undo' ? UndoIcon : RedoIcon;

  const handleClick = () => {
    if (action === 'undo') {
      editor.chain().focus().undo().run();
    } else {
      editor.chain().focus().redo().run();
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