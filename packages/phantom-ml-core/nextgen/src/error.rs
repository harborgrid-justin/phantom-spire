//! Error handling for Phantom ML Core

use napi::Error as NapiError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PhantomMLError {
    #[error("Initialization error: {0}")]
    Initialization(String),

    #[error("Model error: {0}")]
    Model(String),

    #[error("Data processing error: {0}")]
    DataProcessing(String),

    #[error("Data error: {0}")]
    DataError(String),

    #[error("Configuration error: {0}")]
    Configuration(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<PhantomMLError> for NapiError {
    fn from(err: PhantomMLError) -> Self {
        NapiError::from_reason(err.to_string())
    }
}

impl From<serde_json::Error> for PhantomMLError {
    fn from(err: serde_json::Error) -> Self {
        PhantomMLError::DataProcessing(format!("JSON error: {}", err))
    }
}

pub type Result<T> = std::result::Result<T, PhantomMLError>;