//! Error handling for Phantom ML Core
//!
//! This module provides a comprehensive error type system that integrates
//! well with both Rust error handling and NAPI-RS JavaScript interop.

use napi::{Error as NapiError, Status};
use thiserror::Error;

/// Main error type for Phantom ML Core operations
#[derive(Error, Debug)]
pub enum PhantomMLError {
    /// Initialization-related errors
    #[error("Initialization error: {0}")]
    Initialization(String),

    /// Model-related errors (training, inference, etc.)
    #[error("Model error: {0}")]
    Model(String),

    /// Data processing and validation errors
    #[error("Data processing error: {0}")]
    DataProcessing(String),

    /// Configuration and setup errors
    #[error("Configuration error: {0}")]
    Configuration(String),

    /// Internal system errors
    #[error("Internal error: {0}")]
    Internal(String),

    /// Network and I/O related errors
    #[error("I/O error: {0}")]
    Io(String),

    /// Plugin system errors
    #[error("Plugin error: {0}")]
    Plugin(String),

    /// Authentication and authorization errors
    #[error("Auth error: {0}")]
    Auth(String),
}

impl From<PhantomMLError> for NapiError {
    fn from(err: PhantomMLError) -> Self {
        let status = match err {
            PhantomMLError::Initialization(_) => Status::GenericFailure,
            PhantomMLError::Model(_) => Status::InvalidArg,
            PhantomMLError::DataProcessing(_) => Status::InvalidArg,
            PhantomMLError::Configuration(_) => Status::InvalidArg,
            PhantomMLError::Internal(_) => Status::GenericFailure,
            PhantomMLError::Io(_) => Status::GenericFailure,
            PhantomMLError::Plugin(_) => Status::GenericFailure,
            PhantomMLError::Auth(_) => Status::GenericFailure,
        };
        NapiError::new(status, err.to_string())
    }
}

impl From<serde_json::Error> for PhantomMLError {
    fn from(err: serde_json::Error) -> Self {
        PhantomMLError::DataProcessing(format!("JSON serialization error: {}", err))
    }
}

impl From<std::io::Error> for PhantomMLError {
    fn from(err: std::io::Error) -> Self {
        PhantomMLError::Io(format!("I/O error: {}", err))
    }
}

impl From<std::time::SystemTimeError> for PhantomMLError {
    fn from(err: std::time::SystemTimeError) -> Self {
        PhantomMLError::Internal(format!("System time error: {}", err))
    }
}

/// Result type alias for convenient error handling
pub type Result<T> = std::result::Result<T, PhantomMLError>;