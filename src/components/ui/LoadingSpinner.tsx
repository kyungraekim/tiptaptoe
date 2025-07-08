import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 16, 
  color = '#3b82f6',
  message 
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#6b7280',
      fontSize: '14px'
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      {message && <span>{message}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};