// packages/@tiptaptoe/tiptap-toolbar/src/components/HeadingDropdownMenu.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, Dropdown, DropdownItem, ChevronDownIcon } from '@tiptaptoe/ui-components';

interface HeadingDropdownMenuProps {
  levels: number[];
}

export const HeadingDropdownMenu: React.FC<HeadingDropdownMenuProps> = ({ levels }) => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const getCurrentHeading = () => {
    for (const level of levels) {
      if (editor.isActive('heading', { level })) {
        return `H${level}`;
      }
    }
    if (editor.isActive('paragraph')) {
      return 'P';
    }
    return 'Text';
  };

  const setHeading = (level: number | null) => {
    if (level === null) {
      (editor.chain().focus() as any).setParagraph().run();
    } else {
      (editor.chain().focus() as any).toggleHeading({ level: level as any }).run();
    }
  };

  return (
    <Dropdown
      trigger={
        <Button data-style="ghost">
          {getCurrentHeading()}
          <ChevronDownIcon className="tiptap-button-icon" />
        </Button>
      }
    >
      <DropdownItem
        onClick={() => setHeading(null)}
        data-state={editor.isActive('paragraph') ? 'active' : 'inactive'}
      >
        Paragraph
      </DropdownItem>
      {levels.map((level) => (
        <DropdownItem
          key={level}
          onClick={() => setHeading(level)}
          data-state={editor.isActive('heading', { level }) ? 'active' : 'inactive'}
        >
          Heading {level}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};