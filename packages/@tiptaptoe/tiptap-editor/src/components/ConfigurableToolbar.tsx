import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Toolbar, 
  ToolbarGroup, 
  ToolbarSeparator, 
  Spacer,
  useMobile
} from '@tiptaptoe/ui-components';
import {
  UndoRedoButton,
  HeadingDropdownMenu,
  ListDropdownMenu,
  BlockquoteButton,
  CodeBlockButton,
  MarkButton,
  ColorHighlightPopover,
  LinkPopover,
  TextAlignButton,
  ImageUploadButton,
  ThemeToggle
} from '@tiptaptoe/tiptap-toolbar';
import { ToolbarConfig, ToolbarItemConfig, ToolbarGroupConfig } from '../types';

interface ConfigurableToolbarProps {
  editor: Editor;
  config: ToolbarConfig;
  className?: string;
}

const renderToolbarItem = (item: ToolbarItemConfig, editor: Editor): React.ReactNode => {
  switch (item.type) {
    case 'undo':
      return <UndoRedoButton key="undo" action="undo" />;
    case 'redo':
      return <UndoRedoButton key="redo" action="redo" />;
    case 'heading':
      return <HeadingDropdownMenu key="heading" levels={item.levels} />;
    case 'list':
      return <ListDropdownMenu key="list" types={item.types} />;
    case 'blockquote':
      return <BlockquoteButton key="blockquote" />;
    case 'codeBlock':
      return <CodeBlockButton key="codeBlock" />;
    case 'bold':
      return <MarkButton key="bold" type="bold" />;
    case 'italic':
      return <MarkButton key="italic" type="italic" />;
    case 'underline':
      return <MarkButton key="underline" type="underline" />;
    case 'strike':
      return <MarkButton key="strike" type="strike" />;
    case 'code':
      return <MarkButton key="code" type="code" />;
    case 'superscript':
      return <MarkButton key="superscript" type="superscript" />;
    case 'subscript':
      return <MarkButton key="subscript" type="subscript" />;
    case 'highlight':
      return <ColorHighlightPopover key="highlight" />;
    case 'link':
      return <LinkPopover key="link" />;
    case 'alignLeft':
      return <TextAlignButton key="alignLeft" align="left" />;
    case 'alignCenter':
      return <TextAlignButton key="alignCenter" align="center" />;
    case 'alignRight':
      return <TextAlignButton key="alignRight" align="right" />;
    case 'alignJustify':
      return <TextAlignButton key="alignJustify" align="justify" />;
    case 'image':
      return <ImageUploadButton key="image" text={item.text || 'Add'} />;
    case 'theme':
      return <ThemeToggle key="theme" />;
    case 'custom':
      return <item.component key="custom" editor={editor} />;
    default:
      return null;
  }
};

const renderToolbarGroup = (group: ToolbarGroupConfig, editor: Editor, index: number): React.ReactNode => {
  return (
    <ToolbarGroup key={`group-${index}`}>
      {group.items.map((item, itemIndex) => renderToolbarItem(item, editor))}
    </ToolbarGroup>
  );
};

export const ConfigurableToolbar: React.FC<ConfigurableToolbarProps> = ({
  editor,
  config,
  className = ''
}) => {
  const isMobile = useMobile();

  return (
    <Toolbar className={className}>
      {config.map((item, index) => {
        switch (item.type) {
          case 'group':
            return renderToolbarGroup(item, editor, index);
          case 'separator':
            return <ToolbarSeparator key={`separator-${index}`} />;
          case 'spacer':
            return <Spacer key={`spacer-${index}`} />;
          default:
            return null;
        }
      })}
    </Toolbar>
  );
};