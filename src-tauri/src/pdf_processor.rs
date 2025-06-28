use crate::errors::AppError;
use std::path::Path;
use lopdf::Document;

pub struct PdfProcessor;

impl PdfProcessor {
    pub fn extract_text(file_path: &str) -> Result<String, AppError> {
        // Validate file exists and is a PDF
        let path = Path::new(file_path);
        if !path.exists() {
            return Err(AppError::PdfError("File does not exist".to_string()));
        }
        
        if !file_path.to_lowercase().ends_with(".pdf") {
            return Err(AppError::PdfError("File is not a PDF".to_string()));
        }

        // Extract text using lopdf
        Self::extract_with_lopdf(file_path)
    }

    fn extract_with_lopdf(file_path: &str) -> Result<String, AppError> {
        // Load the PDF document
        let doc = Document::load(file_path)
            .map_err(|e| AppError::PdfError(format!("Failed to load PDF: {}", e)))?;
        
        let mut extracted_text = String::new();
        
        // Get all page IDs
        let pages = doc.get_pages();
        
        if pages.is_empty() {
            return Err(AppError::PdfError("PDF contains no pages".to_string()));
        }
        
        // Extract text from each page
        for (page_num, _page_id) in pages {
            match doc.extract_text(&[page_num]) {
                Ok(page_text) => {
                    if !page_text.trim().is_empty() {
                        extracted_text.push_str(&page_text);
                        extracted_text.push('\n');
                    }
                }
                Err(e) => {
                    // Log the error but continue with other pages
                    eprintln!("Warning: Failed to extract text from page {}: {}", page_num, e);
                    continue;
                }
            }
        }
        
        // Clean and validate the extracted text
        let cleaned_text = Self::clean_text(&extracted_text);
        
        if cleaned_text.trim().is_empty() {
            return Err(AppError::PdfError(
                "No readable text found in PDF. This might be an image-based PDF or contain only graphics.".to_string()
            ));
        }
        
        Ok(cleaned_text)
    }

    fn clean_text(text: &str) -> String {
        // Clean up the extracted text
        text.lines()
            .map(|line| line.trim())
            .filter(|line| !line.is_empty())
            .collect::<Vec<_>>()
            .join(" ")
            .chars()
            .filter(|c| {
                // Keep ASCII characters, common Unicode characters, and whitespace
                c.is_ascii_graphic() 
                || c.is_whitespace() 
                || (*c as u32) > 127 && c.is_alphabetic()
                || matches!(*c, '\u{2014}' | '\u{2013}' | '\u{201C}' | '\u{201D}' | '\u{2018}' | '\u{2019}')
            })
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    pub fn validate_file_size(file_path: &str, max_size_mb: u64) -> Result<(), AppError> {
        let metadata = std::fs::metadata(file_path)?;
        let size_mb = metadata.len() / (1024 * 1024);
        
        if size_mb > max_size_mb {
            return Err(AppError::PdfError(
                format!("File size {}MB exceeds limit of {}MB", size_mb, max_size_mb)
            ));
        }
        
        Ok(())
    }

    // Helper method to get PDF information
    // Simplified PDF info method
    pub fn get_pdf_info(file_path: &str) -> Result<PdfInfo, AppError> {
        let doc = Document::load(file_path)
            .map_err(|e| AppError::PdfError(format!("Failed to load PDF: {}", e)))?;
        
        let pages = doc.get_pages();
        let page_count = pages.len();
        
        // Simple title extraction - just use filename if we can't get PDF title
        let title = Path::new(file_path)
            .file_stem()
            .and_then(|name| name.to_str())
            .unwrap_or("Unknown")
            .to_string();

        let has_text = Self::check_if_has_extractable_text(&doc);

        Ok(PdfInfo {
            page_count,
            title,
            has_text,
        })
    }

    fn check_if_has_extractable_text(doc: &Document) -> bool {
        let pages = doc.get_pages();
        
        // Check first few pages for extractable text
        for (page_num, _) in pages.iter().take(3) {
            if let Ok(text) = doc.extract_text(&[*page_num]) {
                if !text.trim().is_empty() {
                    return true;
                }
            }
        }
        
        false
    }
}

#[derive(Debug)]
pub struct PdfInfo {
    pub page_count: usize,
    pub title: String,
    pub has_text: bool,
}