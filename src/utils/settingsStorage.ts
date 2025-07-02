// src/utils/settingsStorage.ts
import { AISettings, DEFAULT_AI_SETTINGS } from '../types/settings';
import { invoke } from '@tauri-apps/api/core';

const SETTINGS_KEY = 'ai_settings';

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log('AI settings saved successfully');
  } catch (error) {
    console.error('Failed to save AI settings:', error);
    throw new Error('Failed to save settings');
  }
}

export function loadAISettings(): AISettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AISettings>;
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Failed to load AI settings:', error);
  }
  
  return DEFAULT_AI_SETTINGS;
}

export function clearAISettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    console.log('AI settings cleared');
  } catch (error) {
    console.error('Failed to clear AI settings:', error);
  }
}

export async function testAIConnection(settings: AISettings): Promise<{ success: boolean; error?: string }> {
  try {
    // Test the AI connection by making a simple request
    const testPrompt = "Say 'Hello' if you can hear me.";
    
    const response = await invoke('process_pdf_summarization', {
      filePath: '', // Empty for test
      prompt: testPrompt,
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl,
      model: settings.model,
      maxTokens: 50,
      temperature: 0.1,
      timeout: settings.timeout
    });

    // We expect this to fail since we're not providing a real PDF,
    // but if the API key and base URL are valid, we should get a specific error
    if (response && typeof response === 'object') {
      const res = response as any;
      if (res.success === false && res.error) {
        // If it's a PDF-related error, the API connection is working
        if (res.error.includes('File does not exist') || 
            res.error.includes('not a PDF') ||
            res.error.includes('PDF')) {
          return { success: true };
        }
        // If it's an API error, return that
        return { success: false, error: res.error };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('AI connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection test failed' 
    };
  }
}

// Helper function to validate settings
export function validateAISettings(settings: Partial<AISettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!settings.apiKey || settings.apiKey.trim() === '') {
    errors.push('API key is required');
  }

  if (!settings.baseUrl || settings.baseUrl.trim() === '') {
    errors.push('Base URL is required');
  } else {
    try {
      new URL(settings.baseUrl);
    } catch {
      errors.push('Base URL must be a valid URL');
    }
  }

  if (!settings.model || settings.model.trim() === '') {
    errors.push('Model is required');
  }

  if (!settings.prompt || settings.prompt.trim() === '') {
    errors.push('Prompt is required');
  }

  if (settings.maxTokens !== undefined && (settings.maxTokens < 1 || settings.maxTokens > 10000)) {
    errors.push('Max tokens must be between 1 and 10000');
  }

  if (settings.temperature !== undefined && (settings.temperature < 0 || settings.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (settings.timeout !== undefined && (settings.timeout < 10 || settings.timeout > 600)) {
    errors.push('Timeout must be between 10 and 600 seconds');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Migration function for existing localStorage keys
export function migrateOldSettings(): void {
  try {
    // Check for old openai_api_key
    const oldApiKey = localStorage.getItem('openai_api_key');
    if (oldApiKey && oldApiKey !== 'your-api-key-here') {
      const currentSettings = loadAISettings();
      if (!currentSettings.apiKey) {
        const updatedSettings = {
          ...currentSettings,
          apiKey: oldApiKey
        };
        saveAISettings(updatedSettings);
        console.log('Migrated old API key to new settings format');
      }
    }
  } catch (error) {
    console.error('Failed to migrate old settings:', error);
  }
}
