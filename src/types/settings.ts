// src/types/settings.ts
export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  prompt: 'Please provide a concise summary of this PDF document, highlighting the main points and key insights.',
  maxTokens: 500,
  temperature: 0.7,
  timeout: 120,
};

export const SUGGESTED_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-sonnet',
  'claude-3-opus',
  'llama-2-7b-chat',
  'llama-2-13b-chat',
  'mistral-7b-instruct',
  'codellama-34b-instruct',
];

export const COMMON_BASE_URLS = [
  { value: 'https://api.openai.com/v1', label: 'OpenAI Official' },
  { value: 'https://api.anthropic.com/v1', label: 'Anthropic Claude' },
  { value: 'https://api.together.xyz/v1', label: 'Together AI' },
  { value: 'https://api.deepseek.com/v1', label: 'DeepSeek' },
  { value: 'http://localhost:1234/v1', label: 'Local LM Studio' },
  { value: 'http://localhost:11434/v1', label: 'Local Ollama' },
];
