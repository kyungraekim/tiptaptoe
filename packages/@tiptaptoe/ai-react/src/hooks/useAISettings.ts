import { useState, useEffect } from 'react';
import { 
  AISettings, 
  DEFAULT_AI_SETTINGS,
  loadAISettings, 
  saveAISettings, 
  validateAISettings, 
  testAIConnection 
} from '@tiptaptoe/ai-core';

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = loadAISettings();
    setSettings(loadedSettings);
  }, []);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setError(null);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_AI_SETTINGS);
    setError(null);
  };

  const saveSettings = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const validation = validateAISettings(settings);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return false;
      }

      saveAISettings(settings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const validation = validateAISettings(settings);
      if (!validation.isValid) {
        const errorMsg = validation.errors.join(', ');
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const result = await testAIConnection(settings);
      if (!result.success) {
        setError(result.error || 'Connection test failed');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentSettings = () => {
    return validateAISettings(settings);
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    saveSettings,
    testConnection,
    validateCurrentSettings,
  };
};