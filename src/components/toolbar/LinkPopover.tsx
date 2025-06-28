// src/components/toolbar/LinkPopover.tsx
import React, { useState } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { LinkIcon } from '../icons';

export const LinkPopover: React.FC = () => {
  const { editor } = useCurrentEditor();
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  if (!editor) return null;

  const isActive = editor.isActive('link');

  const setLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      setUrl('');
      setIsOpen(false);
    }
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
    setIsOpen(false);
  };

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          data-style="ghost"
          data-state={isActive ? 'active' : 'inactive'}
          title="Link"
        >
          <LinkIcon className="tiptap-button-icon" />
        </Button>
      }
    >
      <LinkContent url={url} setUrl={setUrl} onSetLink={setLink} onUnsetLink={unsetLink} isActive={isActive} />
    </Dropdown>
  );
};

export const LinkContent: React.FC<{
  url?: string;
  setUrl?: (url: string) => void;
  onSetLink?: () => void;
  onUnsetLink?: () => void;
  isActive?: boolean;
}> = ({ url = '', setUrl, onSetLink, onUnsetLink, isActive }) => {
  return (
    <div style={{ padding: '0.5rem', minWidth: '200px' }}>
      <input
        type="url"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSetLink?.();
          }
        }}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid hsl(214.3 31.8% 91.4%)',
          borderRadius: '0.375rem',
          marginBottom: '0.5rem',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button data-style="default" onClick={onSetLink} disabled={!url}>
          {isActive ? 'Update' : 'Set'} Link
        </Button>
        {isActive && (
          <Button data-style="outline" onClick={onUnsetLink}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export const LinkButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { editor } = useEditorState();

  if (!editor) return null;

  const isActive = editor.isActive('link');

  return (
    <Button
      data-style="ghost"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={onClick}
      title="Link"
    >
      <LinkIcon className="tiptap-button-icon" />
    </Button>
  );
};
