export interface PdfSummarizationRequest {
    filePath: string;
    prompt: string;
    apiKey: string;
    baseUrl?: string;
}

export interface PdfSummarizationResponse {
    summary: string;
    success: boolean;
    error?: string;
}

export interface ProcessingStatus {
    isProcessing: boolean;
    progress: number;
    message: string;
}
