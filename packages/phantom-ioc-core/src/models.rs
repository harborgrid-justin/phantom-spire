// phantom-ioc-core/src/models.rs
// Data models and structures for IOC processing

// Re-export all types from the types module for backward compatibility
pub use crate::types::*;

// Additional model structures specific to IOC processing
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// IOC processing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCProcessingConfig {
    pub max_batch_size: usize,
    pub timeout_seconds: u64,
    pub enable_ml_detection: bool,
    pub enable_correlation: bool,
    pub confidence_threshold: f64,
}

impl Default for IOCProcessingConfig {
    fn default() -> Self {
        Self {
            max_batch_size: 1000,
            timeout_seconds: 30,
            enable_ml_detection: true,
            enable_correlation: true,
            confidence_threshold: 0.7,
        }
    }
}

/// IOC processing statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCProcessingStats {
    pub total_processed: u64,
    pub successful_processes: u64,
    pub failed_processes: u64,
    pub average_processing_time: f64,
    pub last_processed: Option<DateTime<Utc>>,
}

impl Default for IOCProcessingStats {
    fn default() -> Self {
        Self {
            total_processed: 0,
            successful_processes: 0,
            failed_processes: 0,
            average_processing_time: 0.0,
            last_processed: None,
        }
    }
}

/// IOC enrichment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichmentConfig {
    pub enabled_sources: Vec<String>,
    pub timeout_seconds: u64,
    pub max_concurrent_requests: usize,
    pub cache_ttl: u64,
}

impl Default for EnrichmentConfig {
    fn default() -> Self {
        Self {
            enabled_sources: vec![
                "virustotal".to_string(),
                "threatfox".to_string(),
                "alienvault".to_string(),
            ],
            timeout_seconds: 10,
            max_concurrent_requests: 5,
            cache_ttl: 3600,
        }
    }
}

/// Machine learning model configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLConfig {
    pub model_path: String,
    pub confidence_threshold: f64,
    pub enable_auto_retrain: bool,
    pub feature_extraction_config: FeatureExtractionConfig,
}

/// Feature extraction configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureExtractionConfig {
    pub enable_domain_features: bool,
    pub enable_ip_features: bool,
    pub enable_hash_features: bool,
    pub enable_temporal_features: bool,
}

impl Default for FeatureExtractionConfig {
    fn default() -> Self {
        Self {
            enable_domain_features: true,
            enable_ip_features: true,
            enable_hash_features: true,
            enable_temporal_features: true,
        }
    }
}

/// Correlation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationConfig {
    pub time_window_hours: u64,
    pub minimum_correlation_strength: f64,
    pub max_correlations_per_ioc: usize,
    pub enable_clustering: bool,
}

impl Default for CorrelationConfig {
    fn default() -> Self {
        Self {
            time_window_hours: 24,
            minimum_correlation_strength: 0.5,
            max_correlations_per_ioc: 10,
            enable_clustering: true,
        }
    }
}