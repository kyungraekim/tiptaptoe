// src-tauri/src/commands/pdf_commands.rs
use super::models::{PdfAnalysisResponse, PdfSummarizationResponse};
use crate::llm::LLMClient;
use crate::llm::factory::get_llm_client;
use crate::pdf_processor::PdfProcessor;

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

    if let Err(e) = PdfProcessor::validate_file_size(&file_path, 10) {
        return Ok(PdfSummarizationResponse {
            summary: String::new(),
            success: false,
            error: Some(e.to_string()),
        });
    }

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

    let ai_client = match get_llm_client(api_key, base_url, model, max_tokens, temperature, timeout)
    {
        Ok(client) => client,
        Err(e) => {
            return Ok(PdfSummarizationResponse {
                summary: String::new(),
                success: false,
                error: Some(e.to_string()),
            });
        }
    };

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
pub async fn extract_pdf_text(file_path: String) -> Result<serde_json::Value, String> {
    match PdfProcessor::extract_text(&file_path) {
        Ok(text) => Ok(serde_json::json!({
            "content": text,
            "success": true,
            "error": null
        })),
        Err(e) => Ok(serde_json::json!({
            "content": null,
            "success": false,
            "error": e.to_string()
        })),
    }
}
