#![deny(clippy::all)]
#![warn(
    missing_docs,
    clippy::doc_markdown,
    clippy::unwrap_used,
    clippy::expect_used
)]

//! # Phantom ML Core
//!
//! Enterprise machine learning services for threat detection and security analytics.
//! This crate provides high-performance ML operations through NAPI-RS bindings.

// pub mod agents; // Temporarily disabled for minimal build
// pub mod plugins; // Temporarily disabled for minimal build
pub mod core;
// pub mod core_enhanced; // Temporarily disabled for minimal build
pub mod error;
pub mod types;
// pub mod ml; // Temporarily disabled for minimal build
// pub mod enterprise; // Temporarily disabled for minimal build
// pub mod database; // Temporarily disabled for minimal build

use napi_derive::napi;
use parking_lot::Mutex;
use std::collections::HashMap;
use std::sync::LazyLock;
use std::time::{SystemTime, UNIX_EPOCH};

// Global thread-safe state for models and datasets
static GLOBAL_MODELS: LazyLock<Mutex<HashMap<String, types::Model>>> = LazyLock::new(|| {
    let mut models = HashMap::new();

    // Initialize with sample models
    let sample_models = vec![
        types::Model {
            id: "model_security_threat_detection".to_string(),
            name: "Security Threat Detection".to_string(),
            model_type: "classification".to_string(),
            algorithm: "random_forest".to_string(),
            version: "1.2.0".to_string(),
            status: "trained".to_string(),
            accuracy: Some(0.94),
            precision: Some(0.92),
            recall: Some(0.96),
            f1_score: Some(0.94),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_trained: Some(chrono::Utc::now().to_rfc3339()),
            training_time_ms: Some(145000),
            dataset_id: Some("ds_security_logs".to_string()),
            feature_count: 15,
            model_size_mb: 12.5,
            inference_time_avg_ms: 2.3,
            tags: vec!["security".to_string(), "production".to_string()],
        },
        types::Model {
            id: "model_anomaly_detection".to_string(),
            name: "Network Anomaly Detection".to_string(),
            model_type: "anomaly_detection".to_string(),
            algorithm: "isolation_forest".to_string(),
            version: "1.0.3".to_string(),
            status: "trained".to_string(),
            accuracy: Some(0.89),
            precision: Some(0.87),
            recall: Some(0.91),
            f1_score: Some(0.89),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_trained: Some(chrono::Utc::now().to_rfc3339()),
            training_time_ms: Some(98000),
            dataset_id: Some("ds_network_traffic".to_string()),
            feature_count: 20,
            model_size_mb: 8.7,
            inference_time_avg_ms: 1.8,
            tags: vec!["network".to_string(), "anomaly".to_string()],
        },
        types::Model {
            id: "model_user_behavior".to_string(),
            name: "User Behavior Analytics".to_string(),
            model_type: "clustering".to_string(),
            algorithm: "kmeans".to_string(),
            version: "2.1.0".to_string(),
            status: "training".to_string(),
            accuracy: Some(0.82),
            precision: Some(0.79),
            recall: Some(0.85),
            f1_score: Some(0.82),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_trained: None,
            training_time_ms: None,
            dataset_id: Some("ds_user_behavior".to_string()),
            feature_count: 8,
            model_size_mb: 5.2,
            inference_time_avg_ms: 3.1,
            tags: vec!["behavior".to_string(), "clustering".to_string()],
        },
    ];

    for model in sample_models {
        models.insert(model.id.clone(), model);
    }

    Mutex::new(models)
});

static GLOBAL_DATASETS: LazyLock<Mutex<HashMap<String, types::Dataset>>> = LazyLock::new(|| {
    let mut datasets = HashMap::new();

    // Initialize with sample datasets
    let sample_datasets = vec![
        types::Dataset {
            id: "ds_security_logs".to_string(),
            name: "Security Event Logs".to_string(),
            description: "Network security event logs for threat detection training".to_string(),
            dataset_type: "security".to_string(),
            format: "parquet".to_string(),
            size_bytes: 524288000,
            size_human: "500 MB".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_modified: chrono::Utc::now().to_rfc3339(),
            status: "ready".to_string(),
            feature_count: 15,
            sample_count: 100000,
            target_column: Some("is_threat".to_string()),
            missing_values_percent: 2.1,
            data_quality_score: 92.5,
            tags: vec!["security".to_string(), "logs".to_string(), "production".to_string()],
            source: "enterprise_siem".to_string(),
        },
        types::Dataset {
            id: "ds_user_behavior".to_string(),
            name: "User Behavior Analytics".to_string(),
            description: "User behavior patterns for anomaly detection".to_string(),
            dataset_type: "behavioral".to_string(),
            format: "csv".to_string(),
            size_bytes: 134217728,
            size_human: "128 MB".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_modified: chrono::Utc::now().to_rfc3339(),
            status: "ready".to_string(),
            feature_count: 8,
            sample_count: 50000,
            target_column: None,
            missing_values_percent: 1.3,
            data_quality_score: 96.8,
            tags: vec!["behavior".to_string(), "analytics".to_string()],
            source: "user_activity_monitoring".to_string(),
        },
        types::Dataset {
            id: "ds_network_traffic".to_string(),
            name: "Network Traffic Analysis".to_string(),
            description: "Network traffic patterns for intrusion detection".to_string(),
            dataset_type: "network".to_string(),
            format: "parquet".to_string(),
            size_bytes: 1073741824,
            size_human: "1 GB".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            last_modified: chrono::Utc::now().to_rfc3339(),
            status: "ready".to_string(),
            feature_count: 20,
            sample_count: 250000,
            target_column: Some("is_intrusion".to_string()),
            missing_values_percent: 0.5,
            data_quality_score: 98.2,
            tags: vec!["network".to_string(), "traffic".to_string(), "security".to_string()],
            source: "network_monitoring".to_string(),
        },
    ];

    for dataset in sample_datasets {
        datasets.insert(dataset.id.clone(), dataset);
    }

    Mutex::new(datasets)
});

static GLOBAL_TRAINING_JOBS: LazyLock<Mutex<HashMap<String, types::TrainingJob>>> = LazyLock::new(|| {
    Mutex::new(HashMap::new())
});

static GLOBAL_PERFORMANCE_STATS: LazyLock<Mutex<types::PerformanceStats>> = LazyLock::new(|| {
    Mutex::new(types::PerformanceStats {
        total_operations: 47532,
        average_inference_time_ms: 2.1,
        peak_memory_usage_mb: 1024.5,
        active_models: 3,
        uptime_seconds: 86400, // 24 hours
    })
});

/// Simple health check function
#[napi]
pub fn hello() -> &'static str {
    "Phantom ML Core v1.0.1"
}

/// Utility function for testing NAPI bindings
#[napi]
pub fn plus100(input: u32) -> u32 {
    input.saturating_add(100) // Use saturating_add to prevent overflow
}

// Temporarily disabled exports for minimal build
// pub use agents::registry::{AgentRegistry, AgentInfo, ExecutionRecord, AgentStats};
// pub use agents::security_audit::{SecurityAuditAgent, SecurityIssue, ScanReport};

// Core ML functionality exports
pub use core::PhantomMLCore;
// pub use core_enhanced::PhantomMLCoreEnhanced;
pub use error::{PhantomMLError, Result};
pub use types::*;
// pub use ml::*;

// Plugin system exports - temporarily disabled
// pub use plugins::napi::{
//     PluginSystemApi, PluginInfoJs, AgentContextJs, AgentResultJs,
//     MarketplaceEntryJs, InstallationResultJs, PluginHealthJs,
//     create_plugin_system, get_plugin_system_version,
//     create_sample_plugin_config, validate_plugin_manifest, create_sample_data,
// };

// Temporarily disabled functions
// #[napi]
// pub fn create_agent_registry() -> AgentRegistry {
//     AgentRegistry::new()
// }

// #[napi]
// pub fn create_security_agent() -> SecurityAuditAgent {
//     SecurityAuditAgent::new()
// }

// ================================
// NEW ML API FUNCTIONS FOR STUDIO
// ================================

/// Get all available ML models with comprehensive metadata
#[napi(js_name = "getModels")]
pub fn get_models() -> napi::Result<Vec<types::Model>> {
    let models = GLOBAL_MODELS.lock();
    Ok(models.values().cloned().collect())
}

/// Get current system performance statistics
#[napi(js_name = "getPerformanceStats")]
pub fn get_performance_stats() -> napi::Result<types::PerformanceStats> {
    let mut stats = GLOBAL_PERFORMANCE_STATS.lock();

    // Update uptime and other dynamic metrics
    let start_time = std::time::Instant::now() - std::time::Duration::from_secs(stats.uptime_seconds as u64);
    stats.uptime_seconds = start_time.elapsed().as_secs() as i64;

    // Update active models count based on current state
    let models = GLOBAL_MODELS.lock();
    stats.active_models = models.values().filter(|m| m.status == "trained").count() as u32;

    Ok(stats.clone())
}

/// Initiate model training with comprehensive configuration
#[napi(js_name = "trainModel")]
pub fn train_model(config: types::TrainingConfig) -> napi::Result<types::TrainingJob> {
    use error::PhantomMLError;

    // Generate unique job and model IDs
    let job_id = format!(
        "job_{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| PhantomMLError::Internal(format!("System time error: {}", e)))?
            .as_millis()
    );

    let model_id = format!(
        "model_{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| PhantomMLError::Internal(format!("System time error: {}", e)))?
            .as_secs()
    );

    // Create training job with realistic mock data
    let training_job = types::TrainingJob {
        job_id: job_id.clone(),
        model_id: model_id.clone(),
        status: "running".to_string(),
        progress_percent: 15.0,
        current_epoch: 15,
        total_epochs: config.epochs,
        current_loss: Some(0.342),
        best_accuracy: Some(0.847),
        started_at: chrono::Utc::now().to_rfc3339(),
        estimated_completion: Some(
            (chrono::Utc::now() + chrono::Duration::minutes(45)).to_rfc3339()
        ),
        error_message: None,
        metrics: types::TrainingMetrics {
            train_loss: vec![0.693, 0.521, 0.432, 0.378, 0.342],
            val_loss: vec![0.701, 0.534, 0.445, 0.391, 0.356],
            train_accuracy: vec![0.512, 0.673, 0.751, 0.823, 0.847],
            val_accuracy: vec![0.498, 0.661, 0.742, 0.814, 0.832],
            learning_rate: 0.001,
            batch_size: config.batch_size,
            total_parameters: 1247832,
            training_samples: 80000,
            validation_samples: 20000,
        },
    };

    // Store the training job
    {
        let mut jobs = GLOBAL_TRAINING_JOBS.lock();
        jobs.insert(job_id.clone(), training_job.clone());
    }

    // Create a corresponding model entry
    let new_model = types::Model {
        id: model_id.clone(),
        name: "New Training Model".to_string(),
        model_type: "classification".to_string(),
        algorithm: "neural_network".to_string(),
        version: "1.0.0".to_string(),
        status: "training".to_string(),
        accuracy: Some(0.847),
        precision: Some(0.832),
        recall: Some(0.861),
        f1_score: Some(0.846),
        created_at: chrono::Utc::now().to_rfc3339(),
        last_trained: None,
        training_time_ms: None,
        dataset_id: None,
        feature_count: 12,
        model_size_mb: 15.2,
        inference_time_avg_ms: 2.8,
        tags: vec!["training".to_string(), "new".to_string()],
    };

    {
        let mut models = GLOBAL_MODELS.lock();
        models.insert(model_id, new_model);
    }

    // Update performance stats
    {
        let mut stats = GLOBAL_PERFORMANCE_STATS.lock();
        stats.total_operations += 1;
    }

    Ok(training_job)
}

/// Get predictions from a specific model
#[napi(js_name = "getPredictions")]
pub fn get_predictions(model_id: String, data: String) -> napi::Result<types::PredictionResult> {
    use error::PhantomMLError;

    // Verify model exists
    let models = GLOBAL_MODELS.lock();
    let model = models.get(&model_id)
        .ok_or_else(|| PhantomMLError::Model(format!("Model {} not found", model_id)))?;

    if model.status != "trained" {
        return Err(PhantomMLError::Model(format!("Model {} is not trained", model_id)).into());
    }

    // Parse input data (expecting JSON array of features)
    let features: Vec<f64> = serde_json::from_str(&data)
        .map_err(|e| PhantomMLError::DataProcessing(format!("Invalid input data format: {}", e)))?;

    if features.is_empty() {
        return Err(PhantomMLError::DataProcessing("Features cannot be empty".to_string()).into());
    }

    // Simulate prediction based on model type
    let prediction = match model.model_type.as_str() {
        "classification" => {
            let score = features.iter().sum::<f64>() / features.len() as f64;
            if score > 0.5 { 1.0 } else { 0.0 }
        },
        "regression" => {
            features.iter().enumerate()
                .map(|(i, &f)| f * (0.1 + i as f64 * 0.05))
                .sum::<f64>()
        },
        "anomaly_detection" => {
            let mean = features.iter().sum::<f64>() / features.len() as f64;
            let variance = features.iter()
                .map(|x| (x - mean).powi(2))
                .sum::<f64>() / features.len() as f64;
            if variance > 0.5 { 1.0 } else { 0.0 } // 1 = anomaly, 0 = normal
        },
        _ => features.iter().sum::<f64>() / features.len() as f64,
    };

    let confidence = 0.82 + (rand::random::<f64>() * 0.18); // Random confidence between 0.82-1.0

    let result = types::PredictionResult {
        prediction,
        confidence,
        model_id: model_id.clone(),
        features_used: (0..features.len()).map(|i| format!("feature_{}", i)).collect(),
    };

    // Update performance stats
    {
        let mut stats = GLOBAL_PERFORMANCE_STATS.lock();
        stats.total_operations += 1;

        // Update rolling average inference time
        let new_inference_time = model.inference_time_avg_ms;
        stats.average_inference_time_ms =
            (stats.average_inference_time_ms * (stats.total_operations - 1) as f64 + new_inference_time)
            / stats.total_operations as f64;
    }

    Ok(result)
}

/// Get all available datasets with comprehensive metadata
#[napi(js_name = "getDatasets")]
pub fn get_datasets() -> napi::Result<Vec<types::Dataset>> {
    let datasets = GLOBAL_DATASETS.lock();
    Ok(datasets.values().cloned().collect())
}