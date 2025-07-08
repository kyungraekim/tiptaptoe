import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner, Alert } from '../ui';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onApplyResponse?: (message: ChatMessageType, action: 'append' | 'replace') => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  error,
  messagesEndRef,
  onApplyResponse,
}) => {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onApplyResponse={onApplyResponse}
        />
      ))}
      
      {isLoading && (
        <LoadingSpinner
          message="AI is thinking..."
          color="#3b82f6"
        />
      )}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};