// src-tauri/src/llm/claude/services.rs
use super::models::{ClaudeErrorResponse, ClaudeRequest, ClaudeResponse};
use crate::errors::AppError;
use reqwest::Client;

pub async fn post_chat_completion(
    client: &Client,
    base_url: &str,
    api_key: &str,
    request: &ClaudeRequest,
) -> Result<ClaudeResponse, AppError> {
    let response = client
        .post(&format!("{}/messages", base_url))
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(request)
        .send()
        .await
        .map_err(|e| AppError::AiError(format!("Network error: {}", e)))?;

    let status = response.status();
    let response_text = response
        .text()
        .await
        .unwrap_or_else(|_| "Unknown error".to_string());

    if !status.is_success() {
        if let Ok(error_response) = serde_json::from_str::<ClaudeErrorResponse>(&response_text) {
            return Err(AppError::AiError(format!(
                "API Error: {}",
                error_response.error.message
            )));
        }
        return Err(AppError::AiError(format!(
            "API Error ({}): {}",
            status, response_text
        )));
    }

    serde_json::from_str(&response_text)
        .map_err(|e| AppError::AiError(format!("Failed to parse API response: {}", e)))
}
