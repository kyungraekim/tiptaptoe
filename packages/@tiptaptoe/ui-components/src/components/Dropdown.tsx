import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  trigger, 
  children, 
  open: controlledOpen,
  onOpenChange 
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: -9999, left: -9999, shouldPositionAbove: false });
  const [isPositioned, setIsPositioned] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newOpen = !open;
    
    if (newOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const shouldPositionAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
      
      setPosition({
        top: shouldPositionAbove 
          ? rect.top + window.scrollY - 4
          : rect.bottom + window.scrollY + 4,
        left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 200)),
        shouldPositionAbove
      });
      setIsPositioned(true);
    } else if (!newOpen) {
      setIsPositioned(false);
      setPosition({ top: -9999, left: -9999, shouldPositionAbove: false });
    }

    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const updatePosition = () => {
    if (triggerRef.current && open) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const shouldPositionAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
      
      setPosition({
        top: shouldPositionAbove 
          ? rect.top + window.scrollY - 4
          : rect.bottom + window.scrollY + 4,
        left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 200)),
        shouldPositionAbove
      });
      setIsPositioned(true);
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  const dropdownContent = (open && isPositioned) ? createPortal(
    <div 
      ref={dropdownRef}
      className="tiptap-dropdown-content"
      style={{
        position: 'fixed',
        top: position.shouldPositionAbove ? position.top - (dropdownRef.current?.offsetHeight || 0) : position.top,
        left: position.left,
        zIndex: 99999,
        transformOrigin: position.shouldPositionAbove ? 'bottom center' : 'top center',
        opacity: isPositioned ? 1 : 0,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="tiptap-dropdown" ref={triggerRef}>
        <div onClick={handleToggle}>
          {trigger}
        </div>
      </div>
      {dropdownContent}
    </>
  );
};

export const DropdownItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <button className={`tiptap-dropdown-item ${className}`} {...props}>
      {children}
    </button>
  );
};