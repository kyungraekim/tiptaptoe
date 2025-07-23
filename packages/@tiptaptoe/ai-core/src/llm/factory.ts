import { LLMClient, type LLMClientOptions } from './client';
import type { AISettings } from '../types';

export function createLLMClient(options: LLMClientOptions): LLMClient {
  return new LLMClient(options);
}

export function createLLMClientFromSettings(settings: AISettings): LLMClient {
  return new LLMClient({
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model,
    maxTokens: settings.maxTokens,
    temperature: settings.temperature,
    timeout: settings.timeout,
  });
}

export function detectProviderFromBaseUrl(baseUrl: string): string {
  const url = baseUrl.toLowerCase();
  
  if (url.includes('openai.com')) return 'openai';
  if (url.includes('anthropic.com')) return 'claude';
  if (url.includes('together.xyz')) return 'together';
  if (url.includes('deepseek.com')) return 'deepseek';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  
  return 'unknown';
}