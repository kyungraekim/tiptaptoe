// src-tauri/src/pdf/pdf_extractor.rs
use crate::errors::AppError;
use lopdf::Document;

pub fn extract_text(file_path: &str) -> Result<String, AppError> {
    let doc = Document::load(file_path)
        .map_err(|e| AppError::PdfError(format!("Failed to load PDF: {}", e)))?;

    let mut extracted_text = String::new();
    let pages = doc.get_pages();

    if pages.is_empty() {
        return Err(AppError::PdfError("PDF contains no pages".to_string()));
    }

    for (page_num, _) in pages {
        match doc.extract_text(&[page_num]) {
            Ok(page_text) => {
                if !page_text.trim().is_empty() {
                    extracted_text.push_str(&page_text);
                    extracted_text.push('\n');
                }
            }
            Err(e) => {
                eprintln!(
                    "Warning: Failed to extract text from page {}: {}",
                    page_num, e
                );
                continue;
            }
        }
    }

    let cleaned_text = clean_text(&extracted_text);

    if cleaned_text.trim().is_empty() {
        return Err(AppError::PdfError(
            "No readable text found in PDF. This might be an image-based PDF or contain only graphics."
                .to_string(),
        ));
    }

    Ok(cleaned_text)
}

fn clean_text(text: &str) -> String {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
        .chars()
        .filter(|c| {
            c.is_ascii_graphic()
                || c.is_whitespace()
                || (*c as u32) > 127 && c.is_alphabetic()
                || matches!(
                    *c,
                    '\u{2014}' | '\u{2013}' | '\u{201C}' | '\u{201D}' | '\u{2018}' | '\u{2019}'
                )
        })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}