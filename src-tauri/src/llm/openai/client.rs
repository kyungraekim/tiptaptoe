// src-tauri/src/llm/openai/client.rs
use super::models::{OpenAIMessage, OpenAIRequest};
use super::services::post_chat_completion;
use crate::errors::AppError;
use crate::llm::{reasoning::extract_reasoning_and_output, LLMClient, ReasoningResponse};
use async_trait::async_trait;
use reqwest::Client;
use std::time::Duration;

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

        let api_response =
            post_chat_completion(&self.client, &self.base_url, &self.api_key, &request).await?;

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
