// src-tauri/src/llm/openai/models.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct OpenAIRequest {
    pub model: String,
    pub messages: Vec<OpenAIMessage>,
    pub max_tokens: u32,
    pub temperature: f32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OpenAIMessage {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct OpenAIResponse {
    pub choices: Vec<OpenAIChoice>,
}

#[derive(Deserialize)]
pub struct OpenAIChoice {
    pub message: OpenAIResponseMessage,
}

#[derive(Deserialize)]
pub struct OpenAIResponseMessage {
    pub content: String,
}

#[derive(Deserialize)]
pub struct OpenAIError {
    pub error: OpenAIErrorDetails,
}

#[derive(Deserialize)]
pub struct OpenAIErrorDetails {
    pub message: String,
    #[serde(rename = "type")]
    pub error_type: Option<String>,
}
