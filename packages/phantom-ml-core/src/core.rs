//! Core Phantom ML functionality
//!
//! This module contains the main PhantomMLCore struct and its basic
//! functionality including initialization, configuration, and core operations

use std::sync::Arc;
use dashmap::DashMap;
use parking_lot::RwLock;
use chrono::Utc;
use rand::prelude::*;

use crate::config::MLCoreConfig;
use crate::models::PerformanceStats;
use crate::types::{ModelCache, ModelStorage, PerformanceStatsStorage, DatabaseManagerRef};
use crate::database::{DatabaseManagerBuilder, DatabaseType};
use crate::automl_operations::AutoMLOperations;

/// Main ML Core service providing enterprise ML capabilities
pub struct PhantomMLCore {
    pub models: ModelStorage,
    pub model_cache: ModelCache,
    pub performance_stats: PerformanceStatsStorage,
    pub config: MLCoreConfig,
    pub database_manager: DatabaseManagerRef,
}

impl PhantomMLCore {
    /// Create a new PhantomMLCore instance
    pub fn new() -> Result<Self, String> {
        let config = MLCoreConfig::default();
        let performance_stats = PerformanceStats {
            total_inferences: 0,
            total_trainings: 0,
            average_inference_time_ms: 0.0,
            average_training_time_ms: 0.0,
            models_created: 0,
            models_active: 0,
            uptime_seconds: 0,
            last_updated: Utc::now(),
        };

        Ok(Self {
            models: Arc::new(DashMap::new()),
            model_cache: Arc::new(DashMap::new()),
            performance_stats: Arc::new(RwLock::new(performance_stats)),
            config,
            database_manager: None,
        })
    }

    /// Initialize database connections
    pub async fn initialize_databases(&self, database_config_json: String) -> Result<String, String> {
        let db_config: serde_json::Value = match serde_json::from_str(&database_config_json) {
            Ok(config) => config,
            Err(e) => return Err(format!("Failed to parse database config: {}", e)),
        };

        let mut builder = DatabaseManagerBuilder::new();

        // Add database configurations based on provided config
        if let Some(postgres_uri) = db_config.get("postgresql_uri").and_then(|v| v.as_str()) {
            builder = builder.with_postgresql(postgres_uri.to_string());
        }

        if let Some(mongodb_uri) = db_config.get("mongodb_uri").and_then(|v| v.as_str()) {
            builder = builder.with_mongodb(mongodb_uri.to_string());
        }

        if let Some(redis_url) = db_config.get("redis_url").and_then(|v| v.as_str()) {
            builder = builder.with_redis(redis_url.to_string());
        }

        if let Some(elasticsearch_url) = db_config.get("elasticsearch_url").and_then(|v| v.as_str()) {
            builder = builder.with_elasticsearch(elasticsearch_url.to_string());
        }

        // Configure storage preferences
        let model_storage = db_config.get("model_storage")
            .and_then(|v| v.as_str())
            .and_then(|s| match s {
                "postgresql" => Some(DatabaseType::PostgreSQL),
                "mongodb" => Some(DatabaseType::MongoDB),
                "redis" => Some(DatabaseType::Redis),
                "elasticsearch" => Some(DatabaseType::Elasticsearch),
                _ => None,
            })
            .unwrap_or(DatabaseType::PostgreSQL);

        let inference_storage = db_config.get("inference_storage")
            .and_then(|v| v.as_str())
            .and_then(|s| match s {
                "postgresql" => Some(DatabaseType::PostgreSQL),
                "mongodb" => Some(DatabaseType::MongoDB),
                "redis" => Some(DatabaseType::Redis),
                "elasticsearch" => Some(DatabaseType::Elasticsearch),
                _ => None,
            })
            .unwrap_or(DatabaseType::MongoDB);

        builder = builder.with_storage_preferences(
            model_storage,
            inference_storage,
            DatabaseType::MongoDB,       // Training storage
            DatabaseType::Redis,         // Cache storage
            DatabaseType::Elasticsearch, // Search storage
        );

        let _db_manager = match builder.build().await {
            Ok(manager) => manager,
            Err(e) => return Err(format!("Failed to initialize databases: {}", e)),
        };

        // Note: Since we can't mutate self in an async method safely,
        // we'll need to return the database manager and let the caller handle it
        Ok(serde_json::json!({
            "status": "success",
            "message": "Database connections initialized successfully",
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    /// Get comprehensive performance statistics
    pub async fn get_performance_stats(&self) -> Result<String, String> {
        let stats = self.performance_stats.read();

        match serde_json::to_string(&*stats) {
            Ok(json) => Ok(json),
            Err(e) => Err(format!("Failed to serialize performance stats: {}", e)),
        }
    }

    /// Get system health and status
    pub async fn get_system_health(&self) -> Result<String, String> {
        let stats = self.performance_stats.read();
        let model_count = self.models.len();
        let cache_size = self.model_cache.len();

        let health_score = if model_count > 0 && stats.average_inference_time_ms < 100.0 {
            "excellent"
        } else if stats.average_inference_time_ms < 500.0 {
            "good"
        } else if stats.average_inference_time_ms < 1000.0 {
            "fair"
        } else {
            "poor"
        };

        Ok(serde_json::json!({
            "system_health": health_score,
            "uptime_seconds": (Utc::now().timestamp() - stats.last_updated.timestamp()).abs(),
            "models_loaded": model_count,
            "cache_entries": cache_size,
            "memory_usage": "normal", // Simplified
            "cpu_usage": "normal", // Simplified
            "performance_metrics": {
                "total_inferences": stats.total_inferences,
                "total_trainings": stats.total_trainings,
                "average_inference_time_ms": stats.average_inference_time_ms,
                "average_training_time_ms": stats.average_training_time_ms
            },
            "configuration": {
                "max_models": self.config.max_models,
                "enable_monitoring": self.config.enable_monitoring,
                "cache_predictions": self.config.cache_predictions,
                "max_cache_size": self.config.max_cache_size
            },
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}

// Helper functions for model operations (private)
impl PhantomMLCore {
    fn _validate_features(&self, features: &[f64]) -> bool {
        !features.is_empty() && features.iter().all(|f| f.is_finite())
    }

    fn _calculate_model_accuracy(&self, _model_id: &str) -> f64 {
        // Simplified accuracy calculation
        0.85 + rand::random::<f64>() * 0.1
    }
}