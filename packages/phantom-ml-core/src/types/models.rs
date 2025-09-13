//! Machine Learning model types and traits
//!
//! This module contains type definitions and traits for ML models,
//! including model configurations, parameters, and metadata.

use std::collections::HashMap;
use serde::{Serialize, Deserialize};

/// Represents the configuration for an ML model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    /// Unique identifier for the model
    pub id: String,
    /// Model type/architecture
    pub model_type: String,
    /// Model-specific parameters
    pub parameters: HashMap<String, String>,
}

/// Trait that must be implemented by all ML models
pub trait Model {
    /// Initialize a new model instance
    fn new(config: ModelConfig) -> Self
    where
        Self: Sized;
    /// Get model configuration
    fn get_config(&self) -> &ModelConfig;
}

/// Represents the current state of a model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelState {
    /// Model configuration
    pub config: ModelConfig,
    /// Training progress (0.0 - 1.0)
    pub training_progress: f32,
    /// Current model version
    pub version: String,
}

/// Model metadata and metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelMetadata {
    /// When the model was created
    pub created_at: String,
    /// Last update timestamp
    pub updated_at: String,
    /// Training metrics
    pub metrics: HashMap<String, f64>,
}