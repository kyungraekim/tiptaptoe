// src/components/toolbar/TextAlignButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button } from '../ui/Button';
import { 
  AlignLeftIcon, 
  AlignCenterIcon, 
  AlignRightIcon, 
  AlignJustifyIcon 
} from '../icons';

type AlignType = 'left' | 'center' | 'right' | 'justify';

interface TextAlignButtonProps {
  align: AlignType;
}

const alignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

export const TextAlignButton: React.FC<TextAlignButtonProps> = ({ align }) => {
  const { editor } = useCurrentEditor();
  const Icon = alignIcons[align];

  if (!editor) return null;

  const isActive = editor.isActive({ textAlign: align });

  const handleClick = () => {
    editor.chain().focus().setTextAlign(align).run();
  };

  return (
    <Button
      data-style="ghost"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={handleClick}
      title={`Align ${align}`}
    >
      <Icon className="tiptap-button-icon" />
    </Button>
  );
};