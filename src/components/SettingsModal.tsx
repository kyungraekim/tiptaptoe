// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { AISettings, DEFAULT_AI_SETTINGS, SUGGESTED_MODELS, COMMON_BASE_URLS } from '../types/settings';
import { saveAISettings, loadAISettings, testAIConnection } from '../utils/settingsStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedSettings = loadAISettings();
      setSettings(savedSettings);
      setConnectionStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof AISettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey.trim()) {
      setErrorMessage('Please enter an API key');
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const result = await testAIConnection(settings);
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Connection test failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveAISettings(settings);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      setIsSaving(false);
      setErrorMessage('Failed to save settings');
      setConnectionStatus('error');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_AI_SETTINGS);
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827'
          }}>
            AI Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* API Key */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              API Key *
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="Enter your API key"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              Your API key will be stored locally and never shared
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Base URL
            </label>
            <select
              value={settings.baseUrl}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                boxSizing: 'border-box'
              }}
            >
              {COMMON_BASE_URLS.map(url => (
                <option key={url.value} value={url.value}>
                  {url.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              placeholder="Or enter custom URL"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px',
                marginTop: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Model */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Model
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Enter model name (e.g., gpt-3.5-turbo)"
              list="model-suggestions"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <datalist id="model-suggestions">
              {SUGGESTED_MODELS.map(model => (
                <option key={model} value={model} />
              ))}
            </datalist>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              Popular models: {SUGGESTED_MODELS.slice(0, 3).join(', ')}, etc.
            </p>
          </div>

          {/* Advanced Settings */}
          <details style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
            <summary style={{
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}>
              Advanced Settings
            </summary>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', paddingRight: '8px' }}>
              {/* Max Tokens */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Max Tokens: {settings.maxTokens}
                </label>
                <div style={{ paddingRight: '4px' }}>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={settings.maxTokens}
                    onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  <span>100</span>
                  <span>2000</span>
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Temperature: {settings.temperature}
                </label>
                <div style={{ paddingRight: '4px' }}>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  <span>0.0 (focused)</span>
                  <span>2.0 (creative)</span>
                </div>
              </div>

              {/* Timeout */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={settings.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  How long to wait for AI response (30-300 seconds)
                </p>
              </div>
            </div>
          </details>

          {/* Custom Prompt */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Custom Prompt
            </label>
            <textarea
              value={settings.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Enter your custom summarization prompt"
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: connectionStatus === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${connectionStatus === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{
                fontSize: '14px',
                color: connectionStatus === 'success' ? '#166534' : '#dc2626',
                fontWeight: '500'
              }}>
                {connectionStatus === 'success' ? '✓ Connection successful!' : '✗ Connection failed'}
              </div>
              {errorMessage && (
                <div style={{
                  fontSize: '13px',
                  color: '#dc2626',
                  marginTop: '4px'
                }}>
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection || !settings.apiKey.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: isTestingConnection ? '#9ca3af' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isTestingConnection ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '8px 20px',
                backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
