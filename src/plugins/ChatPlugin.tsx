import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDialog } from '../components/ChatDialog';
import { useFileContext } from '../contexts/FileContextProvider';

interface ChatPluginComponentProps {
  editor: Editor;
}

export const ChatPluginComponent: React.FC<ChatPluginComponentProps> = ({ editor }) => {
  const { availableFiles } = useFileContext();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [selectedTextForChat, setSelectedTextForChat] = useState('');

  const handleChatClick = (selectedText: string) => {
    setSelectedTextForChat(selectedText);
    setIsChatDialogOpen(true);
  };

  const handleApplyResponse = (response: string, action: 'append' | 'replace') => {
    if (!editor) return;

    const { state } = editor;
    const { selection } = state;
    const { from, to } = selection;

    if (action === 'replace') {
      // Replace the selected text with parsed HTML content
      editor.chain().focus().deleteRange({ from, to }).insertContent(response).run();
    } else if (action === 'append') {
      // Find the end of the current paragraph/block that contains the selection
      const $pos = state.doc.resolve(to);
      const blockEnd = $pos.end($pos.depth);
      
      // Move to end of the current paragraph and append on the next line
      editor.chain().focus().setTextSelection(blockEnd).insertContent(response).run();
    }
  };

  return (
    <>
      {/* Chat bubble overlay */}
      <ChatBubble 
        editor={editor} 
        onChatClick={handleChatClick}
      />

      {/* Chat dialog */}
      <ChatDialog
        isOpen={isChatDialogOpen}
        onClose={() => setIsChatDialogOpen(false)}
        selectedText={selectedTextForChat}
        onApplyResponse={handleApplyResponse}
        initialFiles={availableFiles}
      />
    </>
  );
};

// Chat plugin definition
export const chatPlugin = {
  name: 'chat',
  component: ChatPluginComponent as any,
};