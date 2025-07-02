import React, { useRef } from 'react';
import { useCurrentEditor } from '@tiptap/react';
import { Button, ImageIcon } from '@tiptaptoe/ui-components';

interface ImageUploadButtonProps {
  text?: string;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ text = 'Image' }) => {
  const { editor } = useCurrentEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        (editor.chain().focus() as any).setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button data-style="ghost" onClick={openFileDialog} title="Add Image">
        <ImageIcon className="tiptap-button-icon" />
        {text && <span>{text}</span>}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </>
  );
};