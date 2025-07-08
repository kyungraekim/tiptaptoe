// src/components/SettingsIcon.tsx
import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { SettingsIcon as SettingsIconSvg } from '@tiptaptoe/ui-components';

interface SettingsIconProps {
  className?: string;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
        style={{
          padding: "8px",
          backgroundColor: "transparent",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f9fafb";
          e.currentTarget.style.borderColor = "#9ca3af";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
        title="AI Settings"
      >
        <SettingsIconSvg width="16" height="16" />
      </button>

      <SettingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
