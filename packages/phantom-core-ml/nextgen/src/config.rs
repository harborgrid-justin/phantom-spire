//! Configuration structures for Phantom ML Core
//!
//! This module contains all configuration-related structs and types
//! used throughout the ML system.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for ML models
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModelConfig {
    pub model_type: String,
    pub algorithm: String,
    pub hyperparameters: HashMap<String, serde_json::Value>,
    pub feature_config: FeatureConfig,
    pub training_config: TrainingConfig,
    pub database_config: Option<MLDatabaseConfig>,
}

/// Feature extraction and engineering configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureConfig {
    pub input_features: Vec<String>,
    pub engineered_features: Vec<String>,
    pub normalization: bool,
    pub scaling_method: String,
    pub feature_selection: bool,
}

/// Training configuration parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingConfig {
    pub epochs: u32,
    pub batch_size: u32,
    pub learning_rate: f64,
    pub validation_split: f64,
    pub early_stopping: bool,
    pub cross_validation: bool,
}

/// Database configuration for ML operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLDatabaseConfig {
    pub enabled: bool,
    pub persistence_backend: String, // "postgresql", "mongodb", "redis", "elasticsearch", "all"
    pub cache_enabled: bool,
    pub search_enabled: bool,
    pub analytics_enabled: bool,
}

/// Core configuration for ML services
#[derive(Debug, Clone)]
pub struct MLCoreConfig {
    pub max_models: usize,
    pub default_model_type: String,
    pub enable_monitoring: bool,
    pub enable_auto_retrain: bool,
    pub cache_predictions: bool,
    pub max_cache_size: usize,
    pub enable_database_persistence: bool,
    pub database_auto_init: bool,
}

impl Default for MLCoreConfig {
    fn default() -> Self {
        Self {
            max_models: 100,
            default_model_type: "classification".to_string(),
            enable_monitoring: true,
            enable_auto_retrain: false,
            cache_predictions: true,
            max_cache_size: 10000,
            enable_database_persistence: false,
            database_auto_init: true,
        }
    }
}