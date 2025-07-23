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
    message: string;
}

export interface AiChatRequest {
    prompt: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
}

export interface AiChatResponse {
    response: string;
    success: boolean;
    error?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface FileContext {
    id: string;
    name: string;
    path: string;
    type: 'pdf' | 'text' | 'markdown';
    size?: string;
    extractedContent?: string;
    summary?: string;
    addedAt: Date;
}

export interface ChatSession {
    id: string;
    selectedText: string;
    usedFiles: Set<string>; // file IDs that were already used in this conversation
    availableFiles: FileContext[];
    messages: ChatMessage[];
    createdAt: Date;
}

export interface ConnectionTestResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export interface PdfAnalysisResponse {
    page_count: number;
    title: string;
    has_text: boolean;
    file_size: string;
    success: boolean;
    error?: string;
}