import React from 'react';
import { CloseIcon } from '@tiptaptoe/ui-components';

interface ChatHeaderProps {
  title: string;
  selectedText: string;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, selectedText, onClose }) => {
  return (
    <>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          {title}
        </h3>
        <button
          onClick={onClose}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <CloseIcon width="20" height="20" />
        </button>
      </div>

      {selectedText && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#f0f9ff',
          borderBottom: '1px solid #e0e7ff',
          fontSize: '14px'
        }}>
          <strong>Selected text:</strong> "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
        </div>
      )}
    </>
  );
};