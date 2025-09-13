//! Common type definitions and aliases for Phantom ML Core
//!
//! This module contains type aliases and common types used throughout
//! the ML system to improve code readability and maintainability.

use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;
use dashmap::DashMap;
use chrono::{DateTime, Utc};

use crate::models::{MLModel, PerformanceStats};
use crate::config::MLCoreConfig;

/// Type alias for model weights storage
pub type ModelWeights = Vec<f64>;

/// Type alias for the model cache using DashMap for concurrent access
pub type ModelCache = Arc<DashMap<String, Arc<RwLock<ModelWeights>>>>;

/// Type alias for the models storage using DashMap for concurrent access
pub type ModelStorage = Arc<DashMap<String, MLModel>>;

/// Type alias for performance statistics with thread-safe access
pub type PerformanceStatsStorage = Arc<RwLock<PerformanceStats>>;

/// Type alias for feature importance mapping
pub type FeatureImportance = HashMap<String, f64>;

/// Type alias for hyperparameters mapping
pub type Hyperparameters = HashMap<String, serde_json::Value>;

/// Type alias for performance metrics mapping
pub type PerformanceMetrics = HashMap<String, f64>;

/// Feature configuration for feature engineering
#[derive(serde::Deserialize, Clone)]
pub struct FeatureConfig {
    pub normalization: bool,
    pub scaling_method: String,
    pub feature_selection: bool,
}

/// Simple filter for model searches
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ModelFilters {
    pub model_type: Option<String>,
    pub algorithm: Option<String>,
    pub min_accuracy: Option<f64>,
    pub max_accuracy: Option<f64>,
    pub status: Option<String>,
}

/// Simple filter for analytics queries
#[derive(Debug, Clone, serde::Deserialize)]
pub struct AnalyticsFilters {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub model_id: Option<String>,
    pub min_confidence: Option<f64>,
}

/// Simple analytics result structure
#[derive(Debug, Clone, serde::Serialize)]
pub struct InferenceAnalytics {
    pub total_inferences: u64,
    pub average_confidence: f64,
    pub average_inference_time_ms: f64,
    pub error_rate: f64,
    pub timestamp: DateTime<Utc>,
}

/// Result type for ML operations
pub type MLResult<T> = Result<T, String>;

/// Type alias for database manager with thread-safe access
pub type DatabaseManagerRef = Option<Arc<RwLock<crate::database::DatabaseManager>>>;

/// Common constants used throughout the system
pub mod constants {
    /// Default model version
    pub const DEFAULT_MODEL_VERSION: &str = "1.0.0";

    /// Default model status
    pub const DEFAULT_MODEL_STATUS: &str = "created";

    /// Maximum allowed model name length
    pub const MAX_MODEL_NAME_LENGTH: usize = 255;

    /// Maximum allowed feature count
    pub const MAX_FEATURE_COUNT: u32 = 10000;

    /// Default batch size for processing
    pub const DEFAULT_BATCH_SIZE: u32 = 32;

    /// Default learning rate
    pub const DEFAULT_LEARNING_RATE: f64 = 0.01;

    /// Default validation split ratio
    pub const DEFAULT_VALIDATION_SPLIT: f64 = 0.2;

    /// Default confidence threshold
    pub const DEFAULT_CONFIDENCE_THRESHOLD: f64 = 0.5;

    /// Maximum cache size for predictions
    pub const MAX_CACHE_SIZE: usize = 10000;

    /// Default anomaly detection sensitivity
    pub const DEFAULT_ANOMALY_SENSITIVITY: f64 = 2.0;
}