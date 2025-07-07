// src-tauri/src/commands/models.rs
use crate::llm::ReasoningResponse;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PdfSummarizationRequest {
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub prompt: String,
    #[serde(rename = "apiKey")]
    pub api_key: String,
    #[serde(rename = "baseUrl")]
    pub base_url: Option<String>,
    pub model: Option<String>,
    #[serde(rename = "maxTokens")]
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub timeout: Option<u64>,
}

#[derive(Serialize)]
pub struct PdfSummarizationResponse {
    pub summary: String,
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct PdfAnalysisResponse {
    #[serde(rename = "pageCount")]
    pub page_count: usize,
    pub title: String,
    #[serde(rename = "hasText")]
    pub has_text: bool,
    #[serde(rename = "fileSize")]
    pub file_size: String,
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct ConnectionTestResponse {
    pub success: bool,
    pub message: Option<String>,
    pub error: Option<String>,
}

#[derive(Deserialize)]
pub struct AiChatRequest {
    pub prompt: String,
    #[serde(rename = "apiKey")]
    pub api_key: String,
    #[serde(rename = "baseUrl")]
    pub base_url: Option<String>,
    pub model: Option<String>,
    #[serde(rename = "maxTokens")]
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub timeout: Option<u64>,
}

#[derive(Serialize)]
pub struct AiChatResponse {
    pub response: Option<ReasoningResponse>,
    pub success: bool,
    pub error: Option<String>,
}
