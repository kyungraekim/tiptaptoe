import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
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
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
            pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 36px' : '10px 12px',
            border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            ...style,
          }}
        />
      </div>
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