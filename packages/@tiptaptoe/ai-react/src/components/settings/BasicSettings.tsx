import React from 'react';
import { AISettings, COMMON_BASE_URLS, SUGGESTED_MODELS } from '@tiptaptoe/ai-core';
import { Input, Select, Textarea } from '../../ui';

interface BasicSettingsProps {
  settings: AISettings;
  onSettingsChange: (field: keyof AISettings, value: string | number) => void;
}

export const BasicSettings: React.FC<BasicSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const baseUrlOptions = COMMON_BASE_URLS.map(url => ({
    value: url.value,
    label: url.label,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Input
        label="API Key *"
        type="password"
        value={settings.apiKey}
        onChange={(e) => onSettingsChange('apiKey', e.target.value)}
        placeholder="Enter your API key"
        helperText="Your API key will be stored locally and never shared"
      />

      <div>
        <Select
          label="Base URL"
          value={settings.baseUrl}
          onChange={(e) => onSettingsChange('baseUrl', e.target.value)}
          options={baseUrlOptions}
        />
        <Input
          value={settings.baseUrl}
          onChange={(e) => onSettingsChange('baseUrl', e.target.value)}
          placeholder="Or enter custom URL"
          style={{
            fontSize: '12px',
            marginTop: '6px',
            border: '1px solid #e5e7eb',
          }}
        />
      </div>

      <div>
        <Input
          label="Model"
          value={settings.model}
          onChange={(e) => onSettingsChange('model', e.target.value)}
          placeholder="Enter model name (e.g., gpt-3.5-turbo)"
          list="model-suggestions"
          helperText={`Popular models: ${SUGGESTED_MODELS.slice(0, 3).join(', ')}, etc.`}
        />
        <datalist id="model-suggestions">
          {SUGGESTED_MODELS.map(model => (
            <option key={model} value={model} />
          ))}
        </datalist>
      </div>

      <Textarea
        label="Custom Prompt"
        value={settings.prompt}
        onChange={(e) => onSettingsChange('prompt', e.target.value)}
        placeholder="Enter your custom summarization prompt"
        rows={4}
      />
    </div>
  );
};