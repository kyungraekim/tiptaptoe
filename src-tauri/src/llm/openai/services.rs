// src-tauri/src/llm/openai/services.rs
use super::models::{OpenAIError, OpenAIRequest, OpenAIResponse};
use crate::errors::AppError;
use reqwest::Client;

pub async fn post_chat_completion(
    client: &Client,
    base_url: &str,
    api_key: &str,
    request: &OpenAIRequest,
) -> Result<OpenAIResponse, AppError> {
    let response = client
        .post(&format!("{}/chat/completions", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(request)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                AppError::AiError(
                    "Request timed out. Try increasing the timeout in settings.".to_string(),
                )
            } else if e.is_connect() {
                AppError::AiError(
                    "Failed to connect to AI service. Check your base URL and internet connection."
                        .to_string(),
                )
            } else {
                AppError::AiError(format!("Network error: {}", e))
            }
        })?;

    let status = response.status();
    let response_text = response
        .text()
        .await
        .unwrap_or_else(|_| "Unknown error".to_string());

    if !status.is_success() {
        if let Ok(error_response) = serde_json::from_str::<OpenAIError>(&response_text) {
            let error_msg = match error_response.error.error_type.as_deref() {
                Some("invalid_api_key") => {
                    "Invalid API key. Please check your API key in settings."
                }
                Some("insufficient_quota") => {
                    "API quota exceeded. Please check your account billing."
                }
                Some("model_not_found") => {
                    "Model not found. Please check your model selection in settings."
                }
                Some("rate_limit_exceeded") => {
                    "Rate limit exceeded. Please try again in a moment."
                }
                _ => &error_response.error.message,
            };
            return Err(AppError::AiError(format!("API Error: {}", error_msg)));
        }

        let error_msg = match status.as_u16() {
            401 => "Unauthorized: Invalid API key",
            403 => "Forbidden: Check your API key permissions",
            404 => "Not found: Check your base URL and model",
            429 => "Rate limited: Too many requests",
            500..=599 => "Server error: AI service is temporarily unavailable",
            _ => "Unknown API error",
        };

        return Err(AppError::AiError(format!(
            "{} ({})",
            error_msg, response_text
        )));
    }

    serde_json::from_str(&response_text)
        .map_err(|e| AppError::AiError(format!("Failed to parse API response: {}", e)))
}
