// src/components/ui/Toolbar.tsx
import React from 'react';
import './toolbar.css';

export const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`tiptap-toolbar ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export const ToolbarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <div className={`tiptap-toolbar-group ${className}`} {...props}>
      {children}
    </div>
  );
};

export const ToolbarSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`tiptap-toolbar-separator ${className}`} {...props} />
  );
};
