// src/components/AppHeader.tsx
import React from 'react';
import { GenerateButton } from './GenerateButton';
import { SettingsIcon } from './SettingsIcon';

interface AppHeaderProps {
  newDocument: () => void;
  loadDocument: () => void;
  saveDocument: () => void;
  handleSummaryGenerated: (summary: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  newDocument,
  loadDocument,
  saveDocument,
  handleSummaryGenerated,
}) => (
  <header className="app-header">
    <div className="app-title-group">
      <h1>Tiptap Rich Text Editor</h1>
      <p>A powerful rich text editor with AI-powered PDF summarization</p>
    </div>

    <div className="app-header-actions">
      <button onClick={newDocument} className="app-button">
        New
      </button>
      <button onClick={loadDocument} className="app-button">
        Load
      </button>
      <button onClick={saveDocument} className="app-button app-button-primary">
        Save
      </button>
      <GenerateButton onSummaryGenerated={handleSummaryGenerated} />
      <SettingsIcon />
    </div>
  </header>
);
