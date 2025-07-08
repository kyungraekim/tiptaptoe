import React from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { createOverlayStyle } from '../../styles/utilities';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onApplyResponse: (response: string, action: 'append' | 'replace') => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({
  isOpen,
  onClose,
  selectedText,
  onApplyResponse
}) => {
  const {
    messages,
    inputValue,
    isLoading,
    error,
    messagesEndRef,
    setInputValue,
    sendMessage,
    applyResponse,
  } = useChat({ selectedText, onApplyResponse });

  const handleApplyResponse = async (message: any, action: 'append' | 'replace') => {
    await applyResponse(message, action);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="chat-dialog-overlay" style={createOverlayStyle('modal')}>
      <div className="chat-dialog" style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        height: '80%',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <ChatHeader
          title="AI Chat Assistant"
          selectedText={selectedText}
          onClose={onClose}
        />

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          messagesEndRef={messagesEndRef}
          onApplyResponse={handleApplyResponse}
        />

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          isLoading={isLoading}
          placeholder="Ask about the selected text..."
          autoFocus={true}
        />
      </div>
    </div>
  );
};