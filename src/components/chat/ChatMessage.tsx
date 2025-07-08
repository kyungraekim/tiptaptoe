import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/ai';
import { Button } from '../ui';

interface ChatMessageProps {
  message: ChatMessageType;
  onApplyResponse?: (message: ChatMessageType, action: 'append' | 'replace') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onApplyResponse }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
    }}>
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: '12px',
        backgroundColor: message.role === 'user' ? '#3b82f6' : '#f3f4f6',
        color: message.role === 'user' ? 'white' : '#374151',
        fontSize: '14px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap'
      }}>
        {message.content}
      </div>
      
      {message.role === 'assistant' && onApplyResponse && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px'
        }}>
          <Button
            size="sm"
            variant="success"
            onClick={() => onApplyResponse(message, 'replace')}
          >
            Replace
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onApplyResponse(message, 'append')}
          >
            Append
          </Button>
        </div>
      )}
      
      <div style={{
        fontSize: '11px',
        color: '#9ca3af',
        marginTop: '4px'
      }}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
};