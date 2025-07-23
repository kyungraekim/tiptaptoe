import React from 'react';
import { AISettings } from '@tiptaptoe/ai-core';
import { Input } from '../../ui';

interface AdvancedSettingsProps {
  settings: AISettings;
  onSettingsChange: (field: keyof AISettings, value: string | number) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <details style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '6px', 
      padding: '12px' 
    }}>
      <summary style={{
        fontWeight: '500',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#374151'
      }}>
        Advanced Settings
      </summary>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        marginTop: '12px', 
        paddingRight: '8px' 
      }}>
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
              onChange={(e) => onSettingsChange('maxTokens', parseInt(e.target.value))}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '2px' 
          }}>
            <span>100</span>
            <span>2000</span>
          </div>
        </div>

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
              onChange={(e) => onSettingsChange('temperature', parseFloat(e.target.value))}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '2px' 
          }}>
            <span>0.0 (focused)</span>
            <span>2.0 (creative)</span>
          </div>
        </div>

        <Input
          label="Timeout (seconds)"
          type="number"
          min="30"
          max="300"
          value={settings.timeout}
          onChange={(e) => onSettingsChange('timeout', parseInt(e.target.value))}
          helperText="How long to wait for AI response (30-300 seconds)"
          style={{ fontSize: '13px' }}
        />
      </div>
    </details>
  );
};