import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const buttonStyles = {
  primary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: '1px solid #3b82f6',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  success: {
    backgroundColor: '#10b981',
    color: 'white',
    border: '1px solid #10b981',
  },
  danger: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: '1px solid #ef4444',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: 'none',
  },
};

const sizeStyles = {
  sm: {
    padding: '4px 8px',
    fontSize: '12px',
  },
  md: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  lg: {
    padding: '12px 24px',
    fontSize: '16px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const baseStyle = {
    borderRadius: '6px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: disabled || isLoading ? 0.6 : 1,
    ...buttonStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      {...props}
      style={baseStyle}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <div style={{
          width: '14px',
          height: '14px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};