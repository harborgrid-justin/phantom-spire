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
    pub hyperparameters: String, // JSON string instead of Value for NAPI compatibility
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

#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct DatasetMetadata {
    pub id: String,
    pub name: String,
    pub description: String,
    pub dataset_type: String,
    pub size: i64,
    pub created_at: String,
    pub last_modified: String,
    pub status: String,
    pub feature_count: u32,
    pub sample_count: i64,
}

/// Enhanced model structure with additional metadata for studio compatibility
#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct Model {
    pub id: String,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub version: String,
    pub status: String,
    pub accuracy: Option<f64>,
    pub precision: Option<f64>,
    pub recall: Option<f64>,
    pub f1_score: Option<f64>,
    pub created_at: String,
    pub last_trained: Option<String>,
    pub training_time_ms: Option<i64>,
    pub dataset_id: Option<String>,
    pub feature_count: u32,
    pub model_size_mb: f64,
    pub inference_time_avg_ms: f64,
    pub tags: Vec<String>,
}

/// Enhanced dataset structure for studio compatibility
#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct Dataset {
    pub id: String,
    pub name: String,
    pub description: String,
    pub dataset_type: String,
    pub format: String,
    pub size_bytes: i64,
    pub size_human: String,
    pub created_at: String,
    pub last_modified: String,
    pub status: String,
    pub feature_count: u32,
    pub sample_count: i64,
    pub target_column: Option<String>,
    pub missing_values_percent: f64,
    pub data_quality_score: f64,
    pub tags: Vec<String>,
    pub source: String,
}

/// Training job structure for async training operations
#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct TrainingJob {
    pub job_id: String,
    pub model_id: String,
    pub status: String,
    pub progress_percent: f64,
    pub current_epoch: u32,
    pub total_epochs: u32,
    pub current_loss: Option<f64>,
    pub best_accuracy: Option<f64>,
    pub started_at: String,
    pub estimated_completion: Option<String>,
    pub error_message: Option<String>,
    pub metrics: TrainingMetrics,
}

/// Comprehensive training metrics
#[derive(Serialize, Deserialize, Clone, Debug)]
#[napi(object)]
pub struct TrainingMetrics {
    pub train_loss: Vec<f64>,
    pub val_loss: Vec<f64>,
    pub train_accuracy: Vec<f64>,
    pub val_accuracy: Vec<f64>,
    pub learning_rate: f64,
    pub batch_size: u32,
    pub total_parameters: i64,
    pub training_samples: i64,
    pub validation_samples: i64,
}

impl Default for TrainingMetrics {
    fn default() -> Self {
        Self {
            train_loss: Vec::new(),
            val_loss: Vec::new(),
            train_accuracy: Vec::new(),
            val_accuracy: Vec::new(),
            learning_rate: 0.001,
            batch_size: 32,
            total_parameters: 0,
            training_samples: 0,
            validation_samples: 0,
        }
    }
}