use crate::ai_client::OpenAIClient;
use crate::pdf_processor::{PdfProcessor, PdfInfo};
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