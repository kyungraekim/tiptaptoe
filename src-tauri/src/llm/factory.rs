// src-tauri/src/llm/factory.rs
use crate::errors::AppError;
use crate::llm::claude::client::ClaudeClient;
use crate::llm::openai::client::OpenAIClient;
use crate::llm::LlmClient;

pub fn get_llm_client(
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
    timeout: Option<u64>,
) -> Result<LlmClient, AppError> {
    let url_for_check = base_url
        .clone()
        .unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    if url_for_check.contains("api.openai.com")
        || url_for_check.contains("api.together.xyz")
        || url_for_check.contains("api.deepseek.com")
        || url_for_check.contains("localhost:1234")
        || url_for_check.contains("localhost:11434")
    {
        let client = OpenAIClient::new(api_key, base_url, model, max_tokens, temperature, timeout);
        Ok(LlmClient::OpenAi(client))
    } else if url_for_check.contains("api.anthropic.com") {
        let client = ClaudeClient::new(api_key, base_url, model, max_tokens, temperature, timeout);
        Ok(LlmClient::Claude(client))
    } else {
        Err(AppError::AiError(format!(
            "Unsupported base URL: {}. Please use a known provider.",
            url_for_check
        )))
    }
}
