//! Common type definitions and aliases for ML operations
//!
//! This module contains the core type aliases and structures used
//! throughout the ML system for improved type safety and readability.

use std::collections::HashMap;
use std::sync::Arc;
use dashmap::DashMap;
use parking_lot::RwLock;
use serde::Deserialize;

use crate::models::{MLModel, PerformanceStats};
use crate::database::DatabaseManager;

/// Type alias for feature importance mapping
pub type FeatureImportance = HashMap<String, f64>;

/// Type alias for hyperparameter mapping
pub type Hyperparameters = HashMap<String, serde_json::Value>;

/// Type alias for performance metrics mapping
pub type PerformanceMetrics = HashMap<String, f64>;

/// Result type for ML operations
pub type MLResult<T> = Result<T, String>;

/// Feature configuration for feature engineering
#[derive(Deserialize, Clone)]
pub struct FeatureConfig {
    pub normalization: bool,
    pub scaling_method: String,
    pub feature_selection: bool,
}

// Core ML system type aliases
/// Type alias for model storage (thread-safe HashMap of models)
pub type ModelStorage = Arc<DashMap<String, MLModel>>;

/// Type alias for model cache (thread-safe HashMap of model weights)
pub type ModelCache = Arc<DashMap<String, Arc<RwLock<Vec<f64>>>>>;

/// Type alias for performance statistics storage (thread-safe read-write lock)
pub type PerformanceStatsStorage = Arc<RwLock<PerformanceStats>>;

/// Type alias for optional database manager reference
pub type DatabaseManagerRef = Option<Arc<RwLock<DatabaseManager>>>;