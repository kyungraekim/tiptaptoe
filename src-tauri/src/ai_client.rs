// src-tauri/src/ai_client.rs
use crate::errors::AppError;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    max_tokens: u32,
    temperature: f32,
}

#[derive(Serialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Deserialize)]
struct OpenAIChoice {
    message: OpenAIResponseMessage,
}

#[derive(Deserialize)]
struct OpenAIResponseMessage {
    content: String,
}

#[derive(Deserialize)]
struct OpenAIError {
    error: OpenAIErrorDetails,
}

#[derive(Deserialize)]
struct OpenAIErrorDetails {
    message: String,
    #[serde(rename = "type")]
    error_type: Option<String>,
    code: Option<String>,
}

pub struct OpenAIClient {
    client: Client,
    api_key: String,
    base_url: String,
    model: String,
    max_tokens: u32,
    temperature: f32,
}

impl OpenAIClient {
    pub fn new(
        api_key: String, 
        base_url: Option<String>,
        model: Option<String>,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
        timeout: Option<u64>,
    ) -> Self {
        let timeout_duration = Duration::from_secs(timeout.unwrap_or(120));
        
        let client = Client::builder()
            .timeout(timeout_duration)
            .build()
            .expect("Failed to create HTTP client");
            
        Self {
            client,
            api_key,
            base_url: base_url.unwrap_or_else(|| "https://api.openai.com/v1".to_string()),
            model: model.unwrap_or_else(|| "gpt-3.5-turbo".to_string()),
            max_tokens: max_tokens.unwrap_or(500),
            temperature: temperature.unwrap_or(0.7),
        }
    }
    
    pub async fn summarize_text(&self, text: &str, prompt: &str) -> Result<String, AppError> {
        // Validate inputs
        if text.trim().is_empty() {
            return Err(AppError::AiError("No text provided for summarization".to_string()));
        }
        
        if prompt.trim().is_empty() {
            return Err(AppError::AiError("No prompt provided".to_string()));
        }

        // Truncate text if too long (estimate token usage)
        let max_chars = self.estimate_max_chars();
        let truncated_text = if text.len() > max_chars {
            format!("{}...[truncated for length]", &text[..max_chars])
        } else {
            text.to_string()
        };
        
        let full_prompt = format!("{}\n\nDocument content:\n{}", prompt, truncated_text);
        
        let request = OpenAIRequest {
            model: self.model.clone(),
            messages: vec![
                OpenAIMessage {
                    role: "user".to_string(),
                    content: full_prompt,
                }
            ],
            max_tokens: self.max_tokens,
            temperature: self.temperature,
        };
        
        let response = self.client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    AppError::AiError("Request timed out. Try increasing the timeout in settings.".to_string())
                } else if e.is_connect() {
                    AppError::AiError("Failed to connect to AI service. Check your base URL and internet connection.".to_string())
                } else {
                    AppError::AiError(format!("Network error: {}", e))
                }
            })?;
            
        let status = response.status();
        let response_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        
        if !status.is_success() {
            // Try to parse as OpenAI error format
            if let Ok(error_response) = serde_json::from_str::<OpenAIError>(&response_text) {
                let error_msg = match error_response.error.error_type.as_deref() {
                    Some("invalid_api_key") => "Invalid API key. Please check your API key in settings.",
                    Some("insufficient_quota") => "API quota exceeded. Please check your account billing.",
                    Some("model_not_found") => "Model not found. Please check your model selection in settings.",
                    Some("rate_limit_exceeded") => "Rate limit exceeded. Please try again in a moment.",
                    _ => &error_response.error.message,
                };
                return Err(AppError::AiError(format!("API Error: {}", error_msg)));
            }
            
            // Fallback error handling
            let error_msg = match status.as_u16() {
                401 => "Unauthorized: Invalid API key",
                403 => "Forbidden: Check your API key permissions",
                404 => "Not found: Check your base URL and model",
                429 => "Rate limited: Too many requests",
                500..=599 => "Server error: AI service is temporarily unavailable",
                _ => "Unknown API error",
            };
            
            return Err(AppError::AiError(format!("{}: {}", error_msg, response_text)));
        }
        
        let api_response: OpenAIResponse = serde_json::from_str(&response_text)
            .map_err(|e| AppError::AiError(format!("Failed to parse API response: {}", e)))?;
        
        if api_response.choices.is_empty() {
            return Err(AppError::AiError("No response from AI service".to_string()));
        }
        
        let summary = api_response.choices[0].message.content.trim().to_string();
        
        if summary.is_empty() {
            return Err(AppError::AiError("AI service returned empty response".to_string()));
        }
        
        Ok(summary)
    }
    
    /// Test the AI connection with minimal request
    pub async fn test_connection(&self) -> Result<String, AppError> {
        let test_request = OpenAIRequest {
            model: self.model.clone(),
            messages: vec![
                OpenAIMessage {
                    role: "user".to_string(),
                    content: "Say 'Connection test successful' if you can hear me.".to_string(),
                }
            ],
            max_tokens: 20,
            temperature: 0.1,
        };
        
        let response = self.client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&test_request)
            .send()
            .await
            .map_err(|e| AppError::AiError(format!("Connection test failed: {}", e)))?;
            
        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AppError::AiError(format!("Connection test failed: {}", error_text)));
        }
        
        let api_response: OpenAIResponse = response.json().await
            .map_err(|e| AppError::AiError(format!("Failed to parse test response: {}", e)))?;
        
        if api_response.choices.is_empty() {
            return Err(AppError::AiError("No response from AI service".to_string()));
        }
        
        Ok(api_response.choices[0].message.content.clone())
    }
    
    /// Estimate maximum characters based on model and max_tokens
    fn estimate_max_chars(&self) -> usize {
        // Rough estimation: 1 token ≈ 4 characters for English text
        // Leave some buffer for the prompt itself
        let available_tokens = if self.max_tokens > 200 { self.max_tokens - 200 } else { self.max_tokens / 2 };
        (available_tokens as usize) * 4
    }
}
