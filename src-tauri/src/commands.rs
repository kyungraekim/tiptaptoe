// 5. Create src-tauri/src/commands.rs
use crate::ai_client::OpenAIClient;
use crate::pdf_processor::PdfProcessor;
use crate::errors::AppError;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PdfSummarizationRequest {
    #[serde(rename = "filePath")]
    file_path: String,
    prompt: String,
    #[serde(rename = "apiKey")]
    api_key: String,
    #[serde(rename = "baseUrl")]
    base_url: Option<String>,
}

#[derive(Serialize)]
pub struct PdfSummarizationResponse {
    summary: String,
    success: bool,
    error: Option<String>,
}

#[tauri::command]
pub async fn process_pdf_summarization(
    file_path: String,
    prompt: String,
    api_key: String,
    base_url: Option<String>,
) -> Result<PdfSummarizationResponse, String> {
    // Step 1: Validate file size (max 10MB)
    if let Err(e) = PdfProcessor::validate_file_size(&file_path, 10) {
        return Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some(e.to_string()),
        });
    }
    
    // Step 2: Extract text from PDF
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
    
    // Step 3: Call AI service for summarization
    let ai_client = OpenAIClient::new(api_key, base_url);
    
    match ai_client.summarize_text(&text, &prompt).await {
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