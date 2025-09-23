//! Absolutely minimal NAPI-RS module for testing

#![deny(clippy::all)]

use napi_derive::napi;

/// Simple version function
#[napi]
pub fn get_version() -> String {
    "1.0.1-minimal".to_string()
}

/// Simple health check
#[napi]
pub fn health_check() -> String {
    "healthy".to_string()
}

/// NAPI test
#[napi]
pub fn test_napi() -> String {
    "napi working".to_string()
}