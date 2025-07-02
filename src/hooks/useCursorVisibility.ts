// src/hooks/useCursorVisibility.ts
import { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';

interface UseCursorVisibilityProps {
  editor: Editor | null;
}

export const useCursorVisibility = ({ editor }: UseCursorVisibilityProps) => {
  const [bodyRect, setBodyRect] = useState({ y: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateBodyRect = () => {
      const selection = editor.state.selection;
      const { from } = selection;
      const coords = editor.view.coordsAtPos(from);
      
      setBodyRect({ y: coords.top });
    };

    editor.on('selectionUpdate', updateBodyRect);
    editor.on('update', updateBodyRect);

    return () => {
      editor.off('selectionUpdate', updateBodyRect);
      editor.off('update', updateBodyRect);
    };
  }, [editor]);

  return bodyRect;
};