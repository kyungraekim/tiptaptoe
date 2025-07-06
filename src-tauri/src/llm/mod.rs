use crate::errors::AppError;
use crate::llm::claude::ClaudeClient;
use crate::llm::openai::OpenAIClient;
use async_trait::async_trait;

pub mod claude;
pub mod openai;

#[async_trait]
pub trait LLMClient: Send + Sync {
    async fn chat(&self, prompt: &str) -> Result<String, AppError>;
    async fn summarize(&self, text: &str, prompt: &str) -> Result<String, AppError>;
    async fn test_connection(&self) -> Result<String, AppError>;
}

pub enum LlmClient {
    OpenAi(OpenAIClient),
    Claude(ClaudeClient),
}

#[async_trait]
impl LLMClient for LlmClient {
    async fn chat(&self, prompt: &str) -> Result<String, AppError> {
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

