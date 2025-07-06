// src-tauri/src/commands.rs
use crate::errors::AppError;
use crate::llm::claude::ClaudeClient;
use crate::llm::openai::OpenAIClient;
use crate::llm::{LlmClient, ReasoningResponse, LLMClient};
use crate::pdf_processor::PdfProcessor;
use serde::{Deserialize, Serialize};


// Helper function to create the correct LLM client based on settings
fn get_llm_client(
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    timeout: Option<u64>,
) -> Result<LlmClient, AppError> {
    let url_for_check = base_url.clone().unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    // Determine provider based on the base URL provided in settings
    if url_for_check.contains("api.openai.com")
        || url_for_check.contains("api.together.xyz")
        || url_for_check.contains("api.deepseek.com")
        || url_for_check.contains("localhost:1234") // For LM Studio
        || url_for_check.contains("localhost:11434")
    {
        // All these are OpenAI-compatible
        let client = OpenAIClient::new(api_key, base_url, model, max_tokens, temperature, timeout);
        Ok(LlmClient::OpenAi(client))
    } else if url_for_check.contains("api.anthropic.com") {
        let client = ClaudeClient::new(api_key, base_url, model, max_tokens, temperature, timeout);
        Ok(LlmClient::Claude(client))
    } else {
        Err(AppError::AiError(format!(
            "Unsupported base URL: {}. Please use a known provider.",
            url_for_check
        )))
    }
}

#[derive(Serialize, Deserialize)]
pub struct PdfSummarizationRequest {
    #[serde(rename = "filePath")]
    file_path: String,
    prompt: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    #[serde(rename = "baseUrl")]
    base_url: Option<String>,
    model: Option<String>,
    #[serde(rename = "maxTokens")]
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    timeout: Option<u64>,
}

#[derive(Serialize)]
pub struct PdfSummarizationResponse {
    summary: String,
    success: bool,
    error: Option<String>,
}

#[derive(Serialize)]
pub struct PdfAnalysisResponse {
    #[serde(rename = "pageCount")]
    page_count: usize,
    title: String,
    #[serde(rename = "hasText")]
    has_text: bool,
    #[serde(rename = "fileSize")]
    file_size: String,
    success: bool,
    error: Option<String>,
}

#[derive(Serialize)]
pub struct ConnectionTestResponse {
    success: bool,
    message: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
pub struct AiChatRequest {
    prompt: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    #[serde(rename = "baseUrl")]
    base_url: Option<String>,
    model: Option<String>,
    #[serde(rename = "maxTokens")]
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    timeout: Option<u64>,
}

#[derive(Serialize)]
pub struct AiChatResponse {
    response: Option<ReasoningResponse>,
    success: bool,
    error: Option<String>,
}
#[tauri::command]
pub async fn process_pdf_summarization(
    file_path: String,
    prompt: String,
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    timeout: Option<u64>,
) -> Result<PdfSummarizationResponse, String> {
    // Step 1: Validate inputs
    if api_key.trim().is_empty() || api_key == "your-api-key-here" {
        return Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some("Please configure a valid API key in settings".to_string()),
        });
    }
    
    if prompt.trim().is_empty() {
        return Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some("Prompt cannot be empty".to_string()),
        });
    }

    // Step 2: Validate file size (max 10MB)
    if let Err(e) = PdfProcessor::validate_file_size(&file_path, 10) {
        return Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some(e.to_string()),
        });
    }
    
    // Step 3: Extract text from PDF
    let text = match PdfProcessor::extract_text(&file_path) {
        Ok(text) => text,
        Err(e) => {
            return Ok(PdfSummarizationResponse {
                summary: String::new(),
                success: false,
                error: Some(e.to_string()),
            });
        }
    };
    
    // Step 4: Create AI client using the factory
    let ai_client = match get_llm_client(api_key, base_url, model, max_tokens, temperature, timeout) {
        Ok(client) => client,
        Err(e) => {
            return Ok(PdfSummarizationResponse {
                summary: String::new(),
                success: false,
                error: Some(e.to_string()),
            });
        }
    };

    // Step 5: Call AI service for summarization
    match ai_client.summarize(&text, &prompt).await {
        Ok(summary) => Ok(PdfSummarizationResponse {
            summary,
            success: true,
            error: None,
        }),
        Err(e) => Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
pub async fn test_ai_connection(
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    timeout: Option<u64>,
) -> Result<ConnectionTestResponse, String> {
    // Validate inputs
    if api_key.trim().is_empty() || api_key == "your-api-key-here" {
        return Ok(ConnectionTestResponse {
            success: false,
            message: None,
            error: Some("Please provide a valid API key".to_string()),
        });
    }
    
    // Create AI client for testing
    let ai_client = match get_llm_client(api_key, base_url, model, Some(20), Some(0.1), timeout) {
        Ok(client) => client,
        Err(e) => {
            return Ok(ConnectionTestResponse {
                success: false,
                message: None,
                error: Some(e.to_string()),
            });
        }
    };
    
    // Test the connection
    match ai_client.test_connection().await {
        Ok(response) => Ok(ConnectionTestResponse {
            success: true,
            message: Some(response),
            error: None,
        }),
        Err(e) => Ok(ConnectionTestResponse {
            success: false,
            message: None,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
pub async fn analyze_pdf(file_path: String) -> Result<PdfAnalysisResponse, String> {
    match PdfProcessor::get_pdf_info(&file_path) {
        Ok(info) => {
            let metadata = std::fs::metadata(&file_path)
                .map_err(|e| format!("Failed to get file info: {}", e))?;
            
            let file_size = if metadata.len() < 1024 {
                format!("{} bytes", metadata.len())
            } else if metadata.len() < 1024 * 1024 {
                format!("{:.1} KB", metadata.len() as f64 / 1024.0)
            } else {
                format!("{:.1} MB", metadata.len() as f64 / (1024.0 * 1024.0))
            };

            Ok(PdfAnalysisResponse {
                page_count: info.page_count,
                title: info.title,
                has_text: info.has_text,
                file_size,
                success: true,
                error: None,
            })
        }
        Err(e) => Ok(PdfAnalysisResponse {
            page_count: 0,
            title: "Unknown".to_string(),
            has_text: false,
            file_size: "Unknown".to_string(),
            success: false,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
pub async fn process_ai_chat(
    chat_request: AiChatRequest,
) -> Result<AiChatResponse, String> {
    // Step 1: Validate inputs
    if chat_request.api_key.trim().is_empty() || chat_request.api_key == "your-api-key-here" {
        return Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some("Please configure a valid API key in settings".to_string()),
        });
    }

    if chat_request.prompt.trim().is_empty() {
        return Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some("Prompt cannot be empty".to_string()),
        });
    }

    // Step 2: Create AI client with provided settings
    let ai_client = match get_llm_client(
        chat_request.api_key,
        chat_request.base_url,
        chat_request.model,
        chat_request.max_tokens,
        chat_request.temperature,
        chat_request.timeout,
    ) {
        Ok(client) => client,
        Err(e) => {
            return Ok(AiChatResponse {
                response: None,
                success: false,
                error: Some(e.to_string()),
            });
        }
    };

    // Step 3: Call AI service for chat response
    match ai_client.chat(&chat_request.prompt).await {
        Ok(mut response) => {
            // For now, we don't want to show the reasoning text to the user.
            // It's still parsed for potential future use, but cleared before sending to the frontend.
            response.reasoning = None;

            Ok(AiChatResponse {
                response: Some(response),
                success: true,
                error: None,
            })
        }
        Err(e) => Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some(e.to_string()),
        }),
    }
}