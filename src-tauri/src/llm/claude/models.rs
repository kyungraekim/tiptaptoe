// src-tauri/src/llm/claude/models.rs
use serde::{Deserialize, Serialize};

// --- Request Structs ---
#[derive(Serialize)]
pub struct ClaudeRequest {
    pub model: String,
    pub messages: Vec<ClaudeMessage>,
    pub max_tokens: u32,
    pub temperature: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct ClaudeMessage {
    pub role: String,
    pub content: String,
}

// --- Response Structs ---
#[derive(Deserialize)]
pub struct ClaudeResponse {
    pub content: Vec<ClaudeContent>,
    pub stop_reason: String,
}

#[derive(Deserialize)]
pub struct ClaudeContent {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: String,
}

// --- Error Structs ---
#[derive(Deserialize)]
pub struct ClaudeErrorResponse {
    #[serde(rename = "type")]
    pub error_type: String,
    pub error: ClaudeErrorDetails,
}

#[derive(Deserialize)]
pub struct ClaudeErrorDetails {
    #[serde(rename = "type")]
    pub _type: String,
    pub message: String,
}
