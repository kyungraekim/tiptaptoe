import { invoke } from '@tauri-apps/api/core';
import type {
  AiChatRequest,
  AiChatResponse, 
  ConnectionTestResponse,
  PdfSummarizationResponse,
} from '../types';

export interface LLMClientOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export class LLMClient {
  private options: LLMClientOptions;

  constructor(options: LLMClientOptions) {
    this.options = options;
  }

  async testConnection(): Promise<ConnectionTestResponse> {
    return invoke('test_ai_connection', {
      apiKey: this.options.apiKey,
      baseUrl: this.options.baseUrl,
      model: this.options.model,
      timeout: this.options.timeout,
    });
  }

  async chat(prompt: string): Promise<AiChatResponse> {
    const request: AiChatRequest = {
      prompt,
      apiKey: this.options.apiKey,
      baseUrl: this.options.baseUrl,
      model: this.options.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
      timeout: this.options.timeout,
    };

    return invoke('process_ai_chat', { chatRequest: request });
  }

  async summarizePdf(filePath: string, prompt: string): Promise<PdfSummarizationResponse> {
    return invoke('process_pdf_summarization', {
      filePath,
      prompt,
      apiKey: this.options.apiKey,
      baseUrl: this.options.baseUrl,
      model: this.options.model,
      maxTokens: this.options.maxTokens,
      temperature: this.options.temperature,
      timeout: this.options.timeout,
    });
  }

  updateOptions(newOptions: Partial<LLMClientOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  getOptions(): LLMClientOptions {
    return { ...this.options };
  }
}