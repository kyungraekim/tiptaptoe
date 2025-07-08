import React from 'react';
import { Button } from '../ui';

interface SettingsActionsProps {
  onReset: () => void;
  onTestConnection: () => void;
  onSave: () => void;
  isTestingConnection: boolean;
  isSaving: boolean;
  hasApiKey: boolean;
}

export const SettingsActions: React.FC<SettingsActionsProps> = ({
  onReset,
  onTestConnection,
  onSave,
  isTestingConnection,
  isSaving,
  hasApiKey,
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    }}>
      <Button
        variant="secondary"
        onClick={onReset}
      >
        Reset to Defaults
      </Button>
      
      <Button
        variant="primary"
        onClick={onTestConnection}
        disabled={isTestingConnection || !hasApiKey}
        isLoading={isTestingConnection}
      >
        {isTestingConnection ? 'Testing...' : 'Test Connection'}
      </Button>
      
      <Button
        variant="success"
        onClick={onSave}
        disabled={isSaving}
        isLoading={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};