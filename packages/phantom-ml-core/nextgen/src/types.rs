//! Type definitions for Phantom ML Core

use napi_derive::napi;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct MLConfig {
    pub model_type: String,
    pub parameters: String,
    pub features: Option<Vec<String>>,
    pub target: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[napi(object)]
pub struct ModelConfig {
    pub model_type: String,
    pub algorithm: String,
    pub hyperparameters: serde_json::Value,
    pub feature_config: FeatureConfig,
    pub training_config: TrainingConfig,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[napi(object)]
pub struct FeatureConfig {
    pub normalize: bool,
    pub scale: bool,
    pub handle_missing: String,
    pub categorical_encoding: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct TrainingConfig {
    pub epochs: u32,
    pub batch_size: u32,
    pub validation_split: f64,
    pub cross_validation: bool,
    pub cross_validation_folds: u32,
}

impl Default for TrainingConfig {
    fn default() -> Self {
        Self {
            epochs: 100,
            batch_size: 32,
            validation_split: 0.2,
            cross_validation: true,
            cross_validation_folds: 5,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct ModelMetadata {
    pub id: String,
    pub name: String,
    pub model_type: String,
    pub version: String,
    pub created_at: String,
    pub accuracy: Option<f64>,
    pub status: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct TrainingResult {
    pub model_id: String,
    pub status: String,
    pub accuracy: f64,
    pub metrics: String,
    pub training_time_ms: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct PredictionResult {
    pub prediction: f64,
    pub confidence: f64,
    pub model_id: String,
    pub features_used: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub version: String,
    pub target: String,
    pub features: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct PerformanceStats {
    pub total_operations: i64,
    pub average_inference_time_ms: f64,
    pub peak_memory_usage_mb: f64,
    pub active_models: u32,
    pub uptime_seconds: i64,
}