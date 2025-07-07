// src-tauri/src/pdf/pdf_info.rs
use crate::errors::AppError;
use lopdf::Document;
use std::path::Path;

#[derive(Debug)]
pub struct PdfInfo {
    pub page_count: usize,
    pub title: String,
    pub has_text: bool,
}

pub fn get_pdf_info(file_path: &str) -> Result<PdfInfo, AppError> {
    let doc = Document::load(file_path)
        .map_err(|e| AppError::PdfError(format!("Failed to load PDF: {}", e)))?;

    let page_count = doc.get_pages().len();

    let title = Path::new(file_path)
        .file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let has_text = check_if_has_extractable_text(&doc);

    Ok(PdfInfo {
        page_count,
        title,
        has_text,
    })
}

fn check_if_has_extractable_text(doc: &Document) -> bool {
    let pages = doc.get_pages();

    for (page_num, _) in pages.iter().take(3) {
        if let Ok(text) = doc.extract_text(&[*page_num]) {
            if !text.trim().is_empty() {
                return true;
            }
        }
    }

    false
}
