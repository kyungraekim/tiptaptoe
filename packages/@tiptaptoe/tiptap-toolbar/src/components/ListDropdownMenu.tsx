// packages/@tiptaptoe/tiptap-toolbar/src/components/ListDropdownMenu.tsx
import React from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, Dropdown, DropdownItem, ListIcon, NumberedListIcon, ChevronDownIcon } from '@tiptaptoe/ui-components';

type ListType = 'bulletList' | 'orderedList' | 'taskList';

interface ListDropdownMenuProps {
  types: ListType[];
}

export const ListDropdownMenu: React.FC<ListDropdownMenuProps> = ({ types }) => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

  const toggleList = (type: ListType) => {
    switch (type) {
      case 'bulletList':
        (editor.chain().focus() as any).toggleBulletList().run();
        break;
      case 'orderedList':
        (editor.chain().focus() as any).toggleOrderedList().run();
        break;
      case 'taskList':
        (editor.chain().focus() as any).toggleTaskList().run();
        break;
    }
  };

  const getListIcon = (type: ListType) => {
    switch (type) {
      case 'bulletList':
        return ListIcon;
      case 'orderedList':
        return NumberedListIcon;
      case 'taskList':
        return ListIcon; // You can create a specific task list icon
      default:
        return ListIcon;
    }
  };

  return (
    <Dropdown
      trigger={
        <Button data-style="ghost">
          <ListIcon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-icon" />
        </Button>
      }
    >
      {types.map((type) => {
        const Icon = getListIcon(type);
        const isActive = editor.isActive(type);
        return (
          <DropdownItem
            key={type}
            onClick={() => toggleList(type)}
            data-state={isActive ? 'active' : 'inactive'}
          >
            <Icon className="tiptap-button-icon" style={{ marginRight: '0.5rem' }} />
            {type === 'bulletList' && 'Bullet List'}
            {type === 'orderedList' && 'Numbered List'}
            {type === 'taskList' && 'Task List'}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
};