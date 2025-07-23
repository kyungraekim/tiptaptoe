import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
        }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '14px',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
      />
      {error && (
        <span style={{
          fontSize: '12px',
          color: '#ef4444',
        }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{
          fontSize: '12px',
          color: '#6b7280',
        }}>
          {helperText}
        </span>
      )}
    </div>
  );
};