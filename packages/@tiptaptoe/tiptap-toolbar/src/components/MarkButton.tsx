// packages/@tiptaptoe/tiptap-toolbar/src/components/MarkButton.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { 
  Button,
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon, 
  StrikeIcon, 
  CodeIcon,
  SuperscriptIcon,
  SubscriptIcon
} from '@tiptaptoe/ui-components';

type MarkType = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'superscript' | 'subscript';

interface MarkButtonProps {
  type: MarkType;
}

const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: CodeIcon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
};

export const MarkButton: React.FC<MarkButtonProps> = ({ type }) => {
  const { editor } = useCurrentEditor();
  const Icon = markIcons[type];

  if (!editor) return null;

  const isActive = editor.isActive(type);

  const handleClick = () => {
    switch (type) {
      case 'bold':
        (editor.chain().focus() as any).toggleBold().run();
        break;
      case 'italic':
        (editor.chain().focus() as any).toggleItalic().run();
        break;
      case 'underline':
        (editor.chain().focus() as any).toggleUnderline().run();
        break;
      case 'strike':
        (editor.chain().focus() as any).toggleStrike().run();
        break;
      case 'code':
        (editor.chain().focus() as any).toggleCode().run();
        break;
      case 'superscript':
        (editor.chain().focus() as any).toggleSuperscript().run();
        break;
      case 'subscript':
        (editor.chain().focus() as any).toggleSubscript().run();
        break;
    }
  };

  return (
    <Button
      data-style="ghost"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={handleClick}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      <Icon className="tiptap-button-icon" />
    </Button>
  );
};