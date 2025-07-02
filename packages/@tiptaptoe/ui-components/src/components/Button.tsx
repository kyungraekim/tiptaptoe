import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'data-style'?: 'default' | 'ghost' | 'outline';
  'data-size'?: 'sm' | 'md' | 'lg';
  'data-state'?: 'active' | 'inactive';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  'data-style': style = 'default',
  'data-size': size = 'md',
  'data-state': state,
  className = '',
  children,
  ...props 
}) => {
  return (
    <button
      className={`tiptap-button ${className}`}
      data-style={style}
      data-size={size}
      data-state={state}
      {...props}
    >
      {children}
    </button>
  );
};