import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { useAISettings } from '../../hooks/useAISettings';
import { BasicSettings } from './BasicSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { ConnectionStatus } from './ConnectionStatus';
import { SettingsActions } from './SettingsActions';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    saveSettings,
    testConnection,
  } = useAISettings();

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset connection status when modal opens
  useEffect(() => {
    if (isOpen) {
      setConnectionStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleSettingsChange = (field: keyof typeof settings, value: string | number) => {
    updateSettings({ [field]: value });
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  const handleTestConnection = async () => {
    const result = await testConnection();
    setConnectionStatus(result.success ? 'success' : 'error');
    setErrorMessage(result.error || '');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveSettings();
      if (success) {
        setTimeout(() => {
          setIsSaving(false);
          onClose();
        }, 500);
      } else {
        setIsSaving(false);
        setConnectionStatus('error');
        setErrorMessage(error || 'Failed to save settings');
      }
    } catch (err) {
      setIsSaving(false);
      setConnectionStatus('error');
      setErrorMessage('Failed to save settings');
    }
  };

  const handleReset = () => {
    resetSettings();
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Settings"
      maxWidth="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <BasicSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

        <AdvancedSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />

        <ConnectionStatus
          status={connectionStatus}
          errorMessage={errorMessage}
        />

        <SettingsActions
          onReset={handleReset}
          onTestConnection={handleTestConnection}
          onSave={handleSave}
          isTestingConnection={isLoading}
          isSaving={isSaving}
          hasApiKey={!!settings.apiKey.trim()}
        />
      </div>
    </Modal>
  );
};