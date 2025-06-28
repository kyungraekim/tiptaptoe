import { useCurrentEditor } from '@tiptap/react';
import React, { useState } from 'react';
import { HighlighterIcon } from '../icons';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';

const highlightColors = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#ddd6fe' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Red', value: '#fecaca' },
    { name: 'Gray', value: '#e5e7eb' },
];

export const ColorHighlightPopover: React.FC = () => {
    const { editor } = useCurrentEditor();
    const [isOpen, setIsOpen] = useState(false);

    if (!editor) return null;

    const isActive = editor.isActive('highlight');

    return (
        <Dropdown
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={<Button
                data-style="ghost"
                data-state={isActive ? 'active' : 'inactive'}
                title="Highlight"
            >
                <HighlighterIcon className="tiptap-button-icon" />
            </Button>}
        >
            <ColorHighlightPopoverContent />
        </Dropdown>
    );
};

export const ColorHighlightPopoverContent: React.FC = () => {
    const { editor } = useEditorState();

    if (!editor) return null;

    const setHighlight = (color: string) => {
        editor.chain().focus().setHighlight({ color }).run();
    };

    const unsetHighlight = () => {
        editor.chain().focus().unsetHighlight().run();
    };

    return (
        <div style={{ padding: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {highlightColors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => setHighlight(color.value)}
                        style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color.value,
                            border: '1px solid hsl(214.3 31.8% 91.4%)',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                        }}
                        title={color.name} />
                ))}
            </div>
            <Button data-style="outline" onClick={unsetHighlight} style={{ width: '100%' }}>
                Remove Highlight
            </Button>
        </div>
    );
};

export const ColorHighlightPopoverButton: React.FC<{ onClick: () => void; }> = ({ onClick }) => {
    const { editor } = useEditorState();

    if (!editor) return null;

    const isActive = editor.isActive('highlight');

    return (
        <Button
            data-style="ghost"
            data-state={isActive ? 'active' : 'inactive'}
            onClick={onClick}
            title="Highlight"
        >
            <HighlighterIcon className="tiptap-button-icon" />
        </Button>
    );
};
