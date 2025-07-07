// src-tauri/src/lib.rs
use std::fs;
use std::path::Path;

mod errors;
mod pdf;
mod pdf_processor;
pub mod llm;
mod commands;

use commands::ai_commands::{process_ai_chat, test_ai_connection};
use commands::pdf_commands::{analyze_pdf, process_pdf_summarization};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_document(content: String, file_path: Option<String>) -> Result<String, String> {
    let path = file_path.unwrap_or_else(|| "document.html".to_string());
    
    match fs::write(&path, content) {
        Ok(_) => Ok(format!("Document saved to {}", path)),
        Err(e) => Err(format!("Failed to save document: {}", e)),
    }
}

#[tauri::command]
fn load_document(file_path: Option<String>) -> Result<String, String> {
    let path = file_path.unwrap_or_else(|| "document.html".to_string());
    
    if !Path::new(&path).exists() {
        return Err("File does not exist".to_string());
    }
    
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to load document: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            save_document, 
            load_document,
            process_pdf_summarization,
            analyze_pdf,
            test_ai_connection,
            process_ai_chat
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
