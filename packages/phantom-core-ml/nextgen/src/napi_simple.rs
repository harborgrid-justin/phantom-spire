//! Simplified NAPI bindings for napi-rs compliance testing

use napi_derive::napi;
use napi::{Result as NapiResult};
use std::collections::HashMap;

/// Test function to verify NAPI is working
#[napi]
pub fn test_napi() -> NapiResult<String> {
    Ok("NAPI is working correctly!".to_string())
}

/// Get version information
#[napi]
pub fn get_version() -> NapiResult<String> {
    let version_info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "napi_version": "3.0.0",
        "rust_version": "stable"
    });
    Ok(version_info.to_string())
}

/// Simple ML Core class for testing
#[napi(js_name = "PhantomMLCore")]
pub struct PhantomMLCore {
    version: String,
    initialized: bool,
}

#[napi]
impl PhantomMLCore {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            version: env!("CARGO_PKG_VERSION").to_string(),
            initialized: false,
        }
    }

    #[napi(js_name = "getVersion")]
    pub fn get_version(&self) -> String {
        self.version.clone()
    }

    #[napi(js_name = "initialize")]
    pub fn initialize(&mut self) -> bool {
        self.initialized = true;
        true
    }

    #[napi(js_name = "isInitialized")]
    pub fn is_initialized(&self) -> bool {
        self.initialized
    }
}

/// Simple model configuration
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[napi(object)]
pub struct SimpleMLConfig {
    pub model_type: String,
    pub parameters: String,
}

/// Simple training function
#[napi]
pub fn train_simple_model(config: SimpleMLConfig) -> NapiResult<String> {
    let result = serde_json::json!({
        "model_id": "simple_model_001",
        "model_type": config.model_type,
        "status": "trained",
        "accuracy": 0.95
    });
    Ok(result.to_string())
}

/// Simple prediction function
#[napi]
pub async fn predict_simple(model_id: String, features: Vec<f64>) -> NapiResult<String> {
    let prediction = features.iter().sum::<f64>() / features.len() as f64;
    let result = serde_json::json!({
        "model_id": model_id,
        "prediction": prediction,
        "confidence": 0.85
    });
    Ok(result.to_string())
}

/// Get system information
#[napi]
pub fn get_system_info() -> NapiResult<String> {
    let mut info = HashMap::new();
    info.insert("platform".to_string(), std::env::consts::OS.to_string());
    info.insert("arch".to_string(), std::env::consts::ARCH.to_string());
    info.insert("version".to_string(), env!("CARGO_PKG_VERSION").to_string());

    Ok(serde_json::to_string(&info).unwrap())
}