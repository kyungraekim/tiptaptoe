use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("PDF processing error: {0}")]
    PdfError(String),
    
    #[error("AI service error: {0}")]
    AiError(String),
    
    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
}

impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}