//! Data models and structures for Phantom ML Core
//!
//! This module contains all the core data structures used throughout
//! the ML system including models, results, and performance metrics.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// ML Model metadata and state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModel {
    pub id: String,
    pub name: String,
    pub model_type: String,
    pub algorithm: String,
    pub version: String,
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub created_at: DateTime<Utc>,
    pub last_trained: DateTime<Utc>,
    pub last_used: DateTime<Utc>,
    pub training_samples: u64,
    pub feature_count: u32,
    pub status: String,
    pub performance_metrics: HashMap<String, f64>,
}

/// Inference result with confidence and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InferenceResult {
    pub model_id: String,
    pub prediction: serde_json::Value,
    pub confidence: f64,
    pub probability_distribution: Vec<f64>,
    pub feature_importance: HashMap<String, f64>,
    pub inference_time_ms: u64,
    pub timestamp: DateTime<Utc>,
}

/// Training result with performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingResult {
    pub model_id: String,
    pub training_accuracy: f64,
    pub validation_accuracy: f64,
    pub training_loss: f64,
    pub validation_loss: f64,
    pub epochs_completed: u32,
    pub training_time_ms: u64,
    pub convergence_achieved: bool,
}

/// Performance statistics for monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub total_inferences: u64,
    pub total_trainings: u64,
    pub average_inference_time_ms: f64,
    pub average_training_time_ms: f64,
    pub models_created: u64,
    pub models_active: u64,
    pub uptime_seconds: u64,
    pub last_updated: DateTime<Utc>,
}