// src-tauri/src/pdf/pdf_validation.rs
use crate::errors::AppError;
use std::path::Path;

pub fn validate_pdf_file(file_path: &str) -> Result<(), AppError> {
    let path = Path::new(file_path);
    if !path.exists() {
        return Err(AppError::PdfError("File does not exist".to_string()));
    }

    if !file_path.to_lowercase().ends_with(".pdf") {
        return Err(AppError::PdfError("File is not a PDF".to_string()));
    }

    Ok(())
}

pub fn validate_file_size(file_path: &str, max_size_mb: u64) -> Result<(), AppError> {
    let metadata = std::fs::metadata(file_path)?;
    let size_mb = metadata.len() / (1024 * 1024);

    if size_mb > max_size_mb {
        return Err(AppError::PdfError(format!(
            "File size {}MB exceeds limit of {}MB",
            size_mb, max_size_mb
        )));
    }

    Ok(())
}
