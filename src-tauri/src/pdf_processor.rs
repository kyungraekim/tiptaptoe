use crate::errors::AppError;
use std::path::Path;

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

        // Extract text from PDF
        match pdf_extract::extract_text(file_path) {
            Ok(text) => {
                if text.trim().is_empty() {
                    Err(AppError::PdfError("No text found in PDF".to_string()))
                } else {
                    Ok(text)
                }
            }
            Err(e) => Err(AppError::PdfError(format!("Failed to extract text: {}", e)))
        }
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
}