import React, { useRef, useEffect } from 'react';
import { Button } from '../ui';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder = "Type a message...",
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{
      padding: '16px 20px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          isLoading={isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};