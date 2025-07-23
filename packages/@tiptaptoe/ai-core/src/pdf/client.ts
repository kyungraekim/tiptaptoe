import { invoke } from '@tauri-apps/api/core';
import type { PdfAnalysisResponse } from '../types';

export interface PdfTextExtractionResponse {
  content: string | null;
  success: boolean;
  error?: string;
}

export class PDFClient {
  async analyzePdf(filePath: string): Promise<PdfAnalysisResponse> {
    return invoke('analyze_pdf', { filePath });
  }

  async extractText(filePath: string): Promise<PdfTextExtractionResponse> {
    return invoke('extract_pdf_text', { filePath });
  }

  async summarizePdf(
    filePath: string,
    prompt: string,
    apiKey: string,
    baseUrl?: string,
    model?: string,
    maxTokens?: number,
    temperature?: number,
    timeout?: number
  ): Promise<any> {
    return invoke('process_pdf_summarization', {
      filePath,
      prompt,
      apiKey,
      baseUrl,
      model,
      maxTokens,
      temperature,
      timeout,
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  validateFileSize(fileSizeMB: number, maxSizeMB: number = 10): boolean {
    return fileSizeMB <= maxSizeMB;
  }
}