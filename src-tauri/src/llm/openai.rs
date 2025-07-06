// src-tauri/src/llm/openai.rs
use crate::errors::AppError;
use super::reasoning::extract_reasoning_and_output;
use crate::llm::{LLMClient, ReasoningResponse};
use async_trait::async_trait;
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

    fn estimate_max_chars(&self) -> usize {
        let available_tokens = if self.max_tokens > 200 {
            self.max_tokens - 200
        } else {
            self.max_tokens / 2
        };
        (available_tokens as usize) * 4
    }
}

#[async_trait]
impl LLMClient for OpenAIClient {
    async fn chat(&self, prompt: &str) -> Result<ReasoningResponse, AppError> {
        if prompt.trim().is_empty() {
            return Err(AppError::AiError("No prompt provided for chat".to_string()));
        }

        let request = OpenAIRequest {
            model: self.model.clone(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens: self.max_tokens,
            temperature: self.temperature,
        };

        let response = self
            .client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
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
                error_msg,
                response_text
            )));
        }

        let api_response: OpenAIResponse = serde_json::from_str(&response_text)
            .map_err(|e| AppError::AiError(format!("Failed to parse API response: {}", e)))?;

        if api_response.choices.is_empty() {
            return Err(AppError::AiError("No response from AI service".to_string()));
        }

        if let Some(choice) = api_response.choices.into_iter().next() {
            let chat_response = choice.message.content.trim().to_string();
            if chat_response.is_empty() {
                return Err(AppError::AiError(
                    "AI service returned empty response".to_string(),
                ));
            }
            let (reasoning, output) = extract_reasoning_and_output(&chat_response);
            Ok(ReasoningResponse {
                reasoning,
                output,
            })
        } else {
            Err(AppError::AiError("No response from AI service".to_string()))
        }
    }

    async fn summarize(&self, text: &str, prompt: &str) -> Result<String, AppError> {
        if text.trim().is_empty() {
            return Err(AppError::AiError(
                "No text provided for summarization".to_string(),
            ));
        }

        if prompt.trim().is_empty() {
            return Err(AppError::AiError("No prompt provided".to_string()));
        }

        let max_chars = self.estimate_max_chars();
        let truncated_text = if text.len() > max_chars {
            format!("{}...[truncated for length]", &text[..max_chars])
        } else {
            text.to_string()
        };

        let full_prompt = format!("{}\n\nDocument content:\n{}", prompt, truncated_text);

        self.chat(&full_prompt).await.map(|r| r.output)
    }

    async fn test_connection(&self) -> Result<String, AppError> {
        let test_prompt = "Say 'Connection test successful' if you can hear me.";
        self.chat(test_prompt).await.map(|r| r.output)
    }
}
