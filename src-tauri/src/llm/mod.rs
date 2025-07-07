use crate::errors::AppError;
use crate::llm::claude::client::ClaudeClient;
use crate::llm::openai::client::OpenAIClient;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

pub mod claude;
pub mod factory;
pub mod openai;
pub mod reasoning;

#[derive(Serialize, Deserialize, Debug)]
pub struct ReasoningResponse {
    pub reasoning: Option<String>,
    pub output: String,
}

#[async_trait]
pub trait LLMClient: Send + Sync {
    async fn chat(&self, prompt: &str) -> Result<ReasoningResponse, AppError>;
    async fn summarize(&self, text: &str, prompt: &str) -> Result<String, AppError>;
    async fn test_connection(&self) -> Result<String, AppError>;
}

pub enum LlmClient {
    OpenAi(OpenAIClient),
    Claude(ClaudeClient),
}

#[async_trait]
impl LLMClient for LlmClient {
    async fn chat(&self, prompt: &str) -> Result<ReasoningResponse, AppError> {
        match self {
            LlmClient::OpenAi(client) => client.chat(prompt).await,
            LlmClient::Claude(client) => client.chat(prompt).await,
        }
    }

    async fn summarize(&self, text: &str, prompt: &str) -> Result<String, AppError> {
        match self {
            LlmClient::OpenAi(client) => client.summarize(text, prompt).await,
            LlmClient::Claude(client) => client.summarize(text, prompt).await,
        }
    }

    async fn test_connection(&self) -> Result<String, AppError> {
        match self {
            LlmClient::OpenAi(client) => client.test_connection().await,
            LlmClient::Claude(client) => client.test_connection().await,
        }
    }
}

