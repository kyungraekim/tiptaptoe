// src-tauri/src/commands/ai_commands.rs
use super::models::{AiChatRequest, AiChatResponse, ConnectionTestResponse};
use crate::llm::LLMClient;
use crate::llm::factory::get_llm_client;

#[tauri::command]
pub async fn test_ai_connection(
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    timeout: Option<u64>,
) -> Result<ConnectionTestResponse, String> {
    if api_key.trim().is_empty() || api_key == "your-api-key-here" {
        return Ok(ConnectionTestResponse {
            success: false,
            message: None,
            error: Some("Please provide a valid API key".to_string()),
        });
    }

    let ai_client = match get_llm_client(api_key, base_url, model, Some(20), Some(0.1), timeout) {
        Ok(client) => client,
        Err(e) => {
            return Ok(ConnectionTestResponse {
                success: false,
                message: None,
                error: Some(e.to_string()),
            });
        }
    };

    match ai_client.test_connection().await {
        Ok(response) => Ok(ConnectionTestResponse {
            success: true,
            message: Some(response),
            error: None,
        }),
        Err(e) => Ok(ConnectionTestResponse {
            success: false,
            message: None,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
pub async fn process_ai_chat(chat_request: AiChatRequest) -> Result<AiChatResponse, String> {
    if chat_request.api_key.trim().is_empty() || chat_request.api_key == "your-api-key-here" {
        return Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some("Please configure a valid API key in settings".to_string()),
        });
    }

    if chat_request.prompt.trim().is_empty() {
        return Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some("Prompt cannot be empty".to_string()),
        });
    }

    let ai_client = match get_llm_client(
        chat_request.api_key,
        chat_request.base_url,
        chat_request.model,
        chat_request.max_tokens,
        chat_request.temperature,
        chat_request.timeout,
    ) {
        Ok(client) => client,
        Err(e) => {
            return Ok(AiChatResponse {
                response: None,
                success: false,
                error: Some(e.to_string()),
            });
        }
    };

    match ai_client.chat(&chat_request.prompt).await {
        Ok(mut response) => {
            response.reasoning = None;
            Ok(AiChatResponse {
                response: Some(response),
                success: true,
                error: None,
            })
        }
        Err(e) => Ok(AiChatResponse {
            response: None,
            success: false,
            error: Some(e.to_string()),
        }),
    }
}
