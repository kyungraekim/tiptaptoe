import React, { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  title?: string;
  onClose?: () => void;
}

const alertStyles = {
  info: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    color: '#0c4a6e',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    color: '#166534',
  },
  warning: {
    backgroundColor: '#fefce8',
    borderColor: '#fde047',
    color: '#854d0e',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    color: '#dc2626',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  children,
  title,
  onClose,
}) => {
  const styles = alertStyles[variant];

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: styles.backgroundColor,
      border: `1px solid ${styles.borderColor}`,
      borderRadius: '6px',
      color: styles.color,
      fontSize: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '8px',
    }}>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontWeight: '500',
            marginBottom: '4px',
          }}>
            {title}
          </div>
        )}
        <div>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};