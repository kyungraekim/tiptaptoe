// src/components/ChatUI.tsx
import React from 'react';
import { ChatMessage } from '../types/ai';
import { marked } from 'marked';

export const ChatDialogOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="chat-dialog-overlay">{children}</div>
);

export const ChatDialogContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="chat-dialog">{children}</div>
);

export const ChatHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="chat-header">
    <h3>AI Chat Assistant</h3>
    <button onClick={onClose} className="chat-close-button">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export const SelectedTextPreview: React.FC<{ text: string }> = ({ text }) => (
  <div className="selected-text-preview">
    <strong>Selected text:</strong> "{text.length > 100 ? text.substring(0, 100) + '...' : text}"
  </div>
);

export const MessageList: React.FC<{
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onApplyResponse: (response: string, action: 'append' | 'replace') => void;
}> = ({ messages, isLoading, error, messagesEndRef, onApplyResponse }) => (
  <div className="chat-messages">
    {messages.map((message) => (
      <div key={message.id} className={`message-container ${message.role}`}>
        <div className="message-content">
          {message.content}
        </div>
        {message.role === 'assistant' && (
          <div className="message-actions">
            <button onClick={() => handleApplyResponse(message, 'replace', onApplyResponse)}>Replace</button>
            <button onClick={() => handleApplyResponse(message, 'append', onApplyResponse)}>Append</button>
          </div>
        )}
        <div className="message-timestamp">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    ))}
    {isLoading && (
      <div className="loading-indicator">
        <div className="loading-spinner" />
        AI is thinking...
      </div>
    )}
    {error && (
      <div className="error-message">
        {error}
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

const handleApplyResponse = async (
  message: ChatMessage,
  action: 'append' | 'replace',
  onApplyResponse: (response: string, action: 'append' | 'replace') => void
) => {
  const parsedContent = await marked.parse(message.content);
  onApplyResponse(parsedContent, action);
};

export const ChatInput: React.FC<{
  inputValue: string;
  setInputValue: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}> = ({ inputValue, setInputValue, sendMessage, isLoading, inputRef }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about the selected text..."
          disabled={isLoading}
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="chat-send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};
