// 4. Create src-tauri/src/ai_client.rs
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

pub struct OpenAIClient {
    client: Client,
    api_key: String,
    base_url: String,
}

impl OpenAIClient {
    pub fn new(api_key: String, base_url: Option<String>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .expect("Failed to create HTTP client");
            
        Self {
            client,
            api_key,
            base_url: base_url.unwrap_or_else(|| "https://api.openai.com/v1".to_string()),
        }
    }
    
    pub async fn summarize_text(&self, text: &str, prompt: &str) -> Result<String, AppError> {
        // Truncate text if too long (OpenAI has token limits)
        let max_chars = 12000; // Roughly 3000 tokens
        let truncated_text = if text.len() > max_chars {
            format!("{}...[truncated]", &text[..max_chars])
        } else {
            text.to_string()
        };
        
        let full_prompt = format!("{}\n\nDocument content:\n{}", prompt, truncated_text);
        
        let request = OpenAIRequest {
            model: "gpt-3.5-turbo".to_string(),
            messages: vec![
                OpenAIMessage {
                    role: "user".to_string(),
                    content: full_prompt,
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        };
        
        let response = self.client
            .post(&format!("{}/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
            
        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AppError::AiError(format!("API request failed: {}", error_text)));
        }
        
        let api_response: OpenAIResponse = response.json().await?;
        
        if api_response.choices.is_empty() {
            return Err(AppError::AiError("No response from AI service".to_string()));
        }
        
        Ok(api_response.choices[0].message.content.clone())
    }
}