// src-tauri/src/pdf_processor.rs
use crate::errors::AppError;
use crate::pdf::{
    pdf_extractor,
    pdf_info::{self, PdfInfo},
    pdf_validation,
};

pub struct PdfProcessor;

impl PdfProcessor {
    pub fn extract_text(file_path: &str) -> Result<String, AppError> {
        pdf_validation::validate_pdf_file(file_path)?;
        pdf_extractor::extract_text(file_path)
    }

    pub fn validate_file_size(file_path: &str, max_size_mb: u64) -> Result<(), AppError> {
        pdf_validation::validate_file_size(file_path, max_size_mb)
    }

    pub fn get_pdf_info(file_path: &str) -> Result<PdfInfo, AppError> {
        pdf_info::get_pdf_info(file_path)
    }
}
