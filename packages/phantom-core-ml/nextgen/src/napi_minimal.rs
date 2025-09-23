//! Minimal NAPI exports for testing basic functionality
//! This module provides a simplified interface for testing without complex initialization

use napi::bindgen_prelude::*;
use napi_derive::napi;

/// Simple version information
#[napi]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Simple build information
#[napi]
pub fn get_build_info() -> String {
    serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "target": std::env::consts::ARCH,
        "profile": if cfg!(debug_assertions) { "debug" } else { "release" },
        "features": ["napi"],
        "timestamp": chrono::Utc::now().to_rfc3339()
    }).to_string()
}

/// Simple health check
#[napi]
pub fn health_check() -> String {
    serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "version": env!("CARGO_PKG_VERSION")
    }).to_string()
}

/// Simple NAPI test
#[napi]
pub fn test_napi() -> String {
    "NAPI binding working successfully".to_string()
}

/// Simple system information
#[napi]
pub fn get_system_info() -> String {
    serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "features": ["minimal", "napi"],
        "node_version": std::env::var("NODE_VERSION").unwrap_or_else(|_| "unknown".to_string())
    }).to_string()
}

/// Test text classification (placeholder)
#[napi]
pub fn classify_text(text: String, classification_type: String) -> String {
    serde_json::json!({
        "text": text,
        "type": classification_type,
        "result": "positive",
        "confidence": 0.85,
        "status": "placeholder_implementation"
    }).to_string()
}

/// List models (placeholder)
#[napi]
pub fn list_all_models() -> String {
    serde_json::json!({
        "models": [
            {"id": "model_001", "name": "test_model", "type": "classification"},
            {"id": "model_002", "name": "sentiment_model", "type": "nlp"}
        ],
        "count": 2,
        "status": "placeholder_implementation"
    }).to_string()
}

/// Get API capabilities
#[napi]
pub fn get_api_capabilities() -> String {
    serde_json::json!({
        "features": [
            "text_classification",
            "model_management",
            "health_monitoring",
            "basic_ml_operations"
        ],
        "version": env!("CARGO_PKG_VERSION"),
        "status": "minimal_implementation"
    }).to_string()
}

/// Simple prediction
#[napi]
pub fn predict_simple(data: String) -> String {
    serde_json::json!({
        "input": data,
        "prediction": 0.75,
        "confidence": 0.90,
        "model": "default_model",
        "status": "placeholder_implementation"
    }).to_string()
}

/// Get real-time analytics (placeholder)
#[napi]
pub fn get_realtime_analytics() -> String {
    serde_json::json!({
        "active_models": 2,
        "predictions_per_minute": 150,
        "cpu_usage": 15.5,
        "memory_usage": 256.7,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "status": "placeholder_implementation"
    }).to_string()
}