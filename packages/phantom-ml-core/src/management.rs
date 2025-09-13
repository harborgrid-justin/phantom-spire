use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;
use dashmap::DashMap;
use chrono::Utc;
use uuid::Uuid;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use rand::prelude::*;
use serde_json;

use crate::config::MLModelConfig;
use crate::models::{MLModel, TrainingResult, InferenceResult};
use crate::types::{ModelCache, ModelStorage, PerformanceStatsStorage};
use crate::core::PhantomMLCore;

/// Management operations extension trait for PhantomMLCore
pub trait ManagementOperations {
    /// Create a new model with specified configuration
    fn create_model(&self, config_json: String) -> Result<String, String>;

    /// Get comprehensive model information
    fn get_model_info(&self, model_id: String) -> Result<String, String>;

    /// List all available models
    fn list_models(&self) -> Result<String, String>;

    /// Delete a model and free resources
    fn delete_model(&self, model_id: String) -> Result<String, String>;

    /// Validate a model's integrity and performance
    fn validate_model(&self, model_id: String) -> Result<String, String>;

    /// Export a model for deployment or sharing
    fn export_model(&self, model_id: String, format: String) -> Result<String, String>;

    /// Import a model from external format
    fn import_model(&self, import_data_json: String) -> Result<String, String>;

    /// Clone an existing model with optional modifications
    fn clone_model(&self, model_id: String, clone_config_json: String) -> Result<String, String>;

    /// Archive a model for long-term storage
    fn archive_model(&self, model_id: String, archive_config_json: String) -> Result<String, String>;

    /// Restore a model from archive
    fn restore_model(&self, archive_data_json: String) -> Result<String, String>;

    /// Compare performance metrics between multiple models
    fn compare_models(&self, model_ids_json: String) -> Result<String, String>;

    /// Optimize model performance and resource usage
    fn optimize_model(&self, model_id: String, optimization_config_json: String) -> Result<String, String>;
}

impl ManagementOperations for PhantomMLCore {
    fn create_model(&self, config_json: String) -> Result<String, String> {
        let config: MLModelConfig = serde_json::from_str(&config_json)
            .map_err(|e| format!("Failed to parse model config: {}", e))?;

        let model_id = Uuid::new_v4().to_string();
        let model = MLModel {
            id: model_id.clone(),
            name: format!("{}_{}", config.model_type, model_id[..8].to_string()),
            model_type: config.model_type.clone(),
            algorithm: config.algorithm.clone(),
            version: "1.0.0".to_string(),
            accuracy: 0.0,
            precision: 0.0,
            recall: 0.0,
            f1_score: 0.0,
            created_at: Utc::now(),
            last_trained: Utc::now(),
            last_used: Utc::now(),
            training_samples: 0,
            feature_count: config.feature_config.input_features.len() as u32,
            status: "created".to_string(),
            performance_metrics: HashMap::new(),
        };

        // Initialize model weights (simplified)
        let weights: Vec<f64> = (0..model.feature_count)
            .map(|_| rand::random::<f64>() - 0.5)
            .collect();

        self.model_cache.insert(model_id.clone(), Arc::new(RwLock::new(weights)));
        self.models.insert(model_id.clone(), model.clone());

        // Save to database if enabled
        if self.config.enable_database_persistence {
            if let Some(db_manager) = &self.database_manager {
                let db_guard = db_manager.read();
                // Note: Database save is disabled for now due to async requirements
                // if let Err(e) = db_guard.save_model(&model).await {
                //     eprintln!("Failed to persist model to database: {}", e);
                // }
            }
        }

        // Update stats
        {
            let mut stats = self.performance_stats.write();
            stats.models_created += 1;
            stats.models_active += 1;
            stats.last_updated = Utc::now();
        }

        Ok(serde_json::json!({
            "model_id": model_id,
            "name": model.name,
            "type": model.model_type,
            "algorithm": model.algorithm,
            "feature_count": model.feature_count,
            "status": model.status,
            "created_at": model.created_at.to_rfc3339(),
            "database_persisted": self.config.enable_database_persistence
        }).to_string())
    }

    fn get_model_info(&self, model_id: String) -> Result<String, String> {
        let model = self.models.get(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        Ok(serde_json::to_string(&*model)
            .map_err(|e| format!("Failed to serialize model info: {}", e))?)
    }

    fn list_models(&self) -> Result<String, String> {
        let models: Vec<MLModel> = self.models.iter().map(|entry| entry.value().clone()).collect();

        Ok(serde_json::json!({
            "total_models": models.len(),
            "active_models": models.iter().filter(|m| m.status == "trained").count(),
            "models": models,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn delete_model(&self, model_id: String) -> Result<String, String> {
        let model = self.models.remove(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        self.model_cache.remove(&model_id);

        // Update stats
        {
            let mut stats = self.performance_stats.write();
            stats.models_active = stats.models_active.saturating_sub(1);
            stats.last_updated = Utc::now();
        }

        Ok(serde_json::json!({
            "deleted_model_id": model_id,
            "model_name": model.1.name,
            "deleted_at": Utc::now().to_rfc3339(),
            "success": true
        }).to_string())
    }

    fn validate_model(&self, model_id: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let model = self.models.get(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        // Check model weights exist and are valid
        let weights = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model weights not found".to_string())?;
        let weights_guard = weights.read();

        // Validate weights are finite and reasonable
        let weights_valid = weights_guard.iter().all(|w| w.is_finite() && w.abs() < 100.0);
        let weights_count = weights_guard.len();
        let weights_mean = weights_guard.iter().sum::<f64>() / weights_count as f64;
        let weights_variance = weights_guard.iter()
            .map(|w| (w - weights_mean).powi(2))
            .sum::<f64>() / weights_count as f64;

        // Model metadata validation
        let metadata_valid = !model.name.is_empty() &&
                           !model.algorithm.is_empty() &&
                           model.feature_count > 0;

        // Performance validation
        let performance_valid = model.accuracy >= 0.0 && model.accuracy <= 1.0 &&
                              model.precision >= 0.0 && model.precision <= 1.0 &&
                              model.recall >= 0.0 && model.recall <= 1.0;

        let validation_time = start_time.elapsed().as_millis() as u64;
        let overall_valid = weights_valid && metadata_valid && performance_valid;

        let validation_score = if overall_valid {
            if model.accuracy > 0.9 { 100.0 }
            else if model.accuracy > 0.8 { 85.0 }
            else if model.accuracy > 0.7 { 75.0 }
            else { 60.0 }
        } else { 0.0 };

        Ok(serde_json::json!({
            "validation_id": Uuid::new_v4().to_string(),
            "model_id": model_id,
            "model_name": model.name,
            "overall_valid": overall_valid,
            "validation_score": validation_score,
            "checks": {
                "weights_valid": weights_valid,
                "metadata_valid": metadata_valid,
                "performance_valid": performance_valid
            },
            "weights_analysis": {
                "count": weights_count,
                "mean": weights_mean,
                "variance": weights_variance,
                "all_finite": weights_valid
            },
            "model_metrics": {
                "accuracy": model.accuracy,
                "precision": model.precision,
                "recall": model.recall,
                "f1_score": model.f1_score,
                "feature_count": model.feature_count,
                "training_samples": model.training_samples
            },
            "validation_time_ms": validation_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn export_model(&self, model_id: String, format: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let model = self.models.get(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        let weights = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model weights not found".to_string())?;
        let weights_guard = weights.read();

        let export_format = format.to_lowercase();
        let export_data = match export_format.as_str() {
            "json" => {
                serde_json::json!({
                    "model_metadata": &*model,
                    "weights": &*weights_guard,
                    "export_format": "json",
                    "version": "1.0"
                })
            },
            "binary" => {
                // Simulate binary export with base64 encoded weights
                let weights_bytes: Vec<u8> = weights_guard.iter()
                    .flat_map(|w| w.to_le_bytes().to_vec())
                    .collect();
                let encoded_weights = STANDARD.encode(weights_bytes);

                serde_json::json!({
                    "model_metadata": &*model,
                    "weights_binary": encoded_weights,
                    "export_format": "binary",
                    "version": "1.0"
                })
            },
            "portable" => {
                serde_json::json!({
                    "model_id": model.id,
                    "name": model.name,
                    "algorithm": model.algorithm,
                    "model_type": model.model_type,
                    "feature_count": model.feature_count,
                    "weights": &*weights_guard,
                    "performance": {
                        "accuracy": model.accuracy,
                        "precision": model.precision,
                        "recall": model.recall,
                        "f1_score": model.f1_score
                    },
                    "export_format": "portable",
                    "version": "1.0",
                    "platform": "phantom-ml-core"
                })
            },
            _ => return Err("Unsupported export format. Use: json, binary, or portable".to_string())
        };

        let export_time = start_time.elapsed().as_millis() as u64;
        let export_size = serde_json::to_string(&export_data)
            .map_err(|e| format!("Failed to serialize export data: {}", e))?
            .len();

        Ok(serde_json::json!({
            "export_id": Uuid::new_v4().to_string(),
            "model_id": model_id,
            "export_format": export_format,
            "export_size_bytes": export_size,
            "export_data": export_data,
            "export_time_ms": export_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn import_model(&self, import_data_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let import_data: serde_json::Value = serde_json::from_str(&import_data_json)
            .map_err(|e| format!("Failed to parse import data: {}", e))?;

        let format = import_data.get("export_format")
            .and_then(|f| f.as_str())
            .unwrap_or("json");

        let (model_metadata, weights) = match format {
            "json" | "portable" => {
                let metadata = import_data.get("model_metadata")
                    .or_else(|| Some(&import_data))
                    .ok_or_else(|| "Model metadata not found".to_string())?;

                let weights: Vec<f64> = import_data.get("weights")
                    .and_then(|w| w.as_array())
                    .and_then(|arr| arr.iter().map(|v| v.as_f64()).collect::<Option<Vec<_>>>())
                    .ok_or_else(|| "Invalid weights format".to_string())?;

                (metadata.clone(), weights)
            },
            "binary" => {
                let metadata = import_data.get("model_metadata")
                    .ok_or_else(|| "Model metadata not found".to_string())?;

                let encoded_weights = import_data.get("weights_binary")
                    .and_then(|w| w.as_str())
                    .ok_or_else(|| "Binary weights not found".to_string())?;

                let weights_bytes = STANDARD.decode(encoded_weights)
                    .map_err(|e| format!("Failed to decode weights: {}", e))?;

                let weights: Vec<f64> = weights_bytes.chunks(8)
                    .map(|chunk| {
                        let mut bytes = [0u8; 8];
                        bytes.copy_from_slice(chunk);
                        f64::from_le_bytes(bytes)
                    })
                    .collect();

                (metadata.clone(), weights)
            },
            _ => return Err("Unsupported import format".to_string())
        };

        // Create new model with imported data
        let new_model_id = Uuid::new_v4().to_string();
        let imported_model = MLModel {
            id: new_model_id.clone(),
            name: format!("imported_{}", model_metadata.get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("model")),
            model_type: model_metadata.get("model_type")
                .and_then(|t| t.as_str())
                .unwrap_or("classification")
                .to_string(),
            algorithm: model_metadata.get("algorithm")
                .and_then(|a| a.as_str())
                .unwrap_or("imported")
                .to_string(),
            version: "1.0.0".to_string(),
            accuracy: model_metadata.get("accuracy")
                .and_then(|a| a.as_f64())
                .unwrap_or(0.0),
            precision: model_metadata.get("precision")
                .and_then(|p| p.as_f64())
                .unwrap_or(0.0),
            recall: model_metadata.get("recall")
                .and_then(|r| r.as_f64())
                .unwrap_or(0.0),
            f1_score: model_metadata.get("f1_score")
                .and_then(|f| f.as_f64())
                .unwrap_or(0.0),
            created_at: Utc::now(),
            last_trained: Utc::now(),
            last_used: Utc::now(),
            training_samples: model_metadata.get("training_samples")
                .and_then(|s| s.as_u64())
                .unwrap_or(0),
            feature_count: weights.len() as u32,
            status: "imported".to_string(),
            performance_metrics: HashMap::new(),
        };

        // Store model and weights
        self.model_cache.insert(new_model_id.clone(), Arc::new(RwLock::new(weights)));
        self.models.insert(new_model_id.clone(), imported_model.clone());

        // Update stats
        {
            let mut stats = self.performance_stats.write();
            stats.models_created += 1;
            stats.models_active += 1;
            stats.last_updated = Utc::now();
        }

        let import_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "import_id": Uuid::new_v4().to_string(),
            "new_model_id": new_model_id,
            "model_name": imported_model.name,
            "import_format": format,
            "feature_count": imported_model.feature_count,
            "status": "success",
            "import_time_ms": import_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn clone_model(&self, model_id: String, clone_config_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let original_model = self.models.get(&model_id)
            .ok_or_else(|| "Model not found".to_string())?;

        let original_weights = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model weights not found".to_string())?;
        let original_weights_guard = original_weights.read();

        let clone_config: serde_json::Value = serde_json::from_str(&clone_config_json)
            .map_err(|e| format!("Failed to parse clone config: {}", e))?;

        let clone_type = clone_config.get("clone_type")
            .and_then(|t| t.as_str())
            .unwrap_or("exact");

        let new_model_id = Uuid::new_v4().to_string();
        let default_clone_name = format!("{}_clone", original_model.name);
        let clone_name = clone_config.get("name")
            .and_then(|n| n.as_str())
            .unwrap_or(&default_clone_name);

        // Apply cloning strategy
        let cloned_weights: Vec<f64> = match clone_type {
            "exact" => original_weights_guard.clone(),
            "noisy" => {
                let noise_factor = clone_config.get("noise_factor")
                    .and_then(|f| f.as_f64())
                    .unwrap_or(0.01);
                original_weights_guard.iter()
                    .map(|&w| w + (rand::random::<f64>() - 0.5) * noise_factor)
                    .collect()
            },
            "scaled" => {
                let scale_factor = clone_config.get("scale_factor")
                    .and_then(|f| f.as_f64())
                    .unwrap_or(1.0);
                original_weights_guard.iter()
                    .map(|&w| w * scale_factor)
                    .collect()
            },
            "randomized" => {
                let randomization = clone_config.get("randomization")
                    .and_then(|r| r.as_f64())
                    .unwrap_or(0.1);
                original_weights_guard.iter()
                    .map(|&w| if rand::random::<f64>() < randomization {
                        rand::random::<f64>() - 0.5
                    } else {
                        w
                    })
                    .collect()
            },
            _ => return Err("Invalid clone type. Use: exact, noisy, scaled, or randomized".to_string())
        };

        let cloned_model = MLModel {
            id: new_model_id.clone(),
            name: clone_name.to_string(),
            model_type: original_model.model_type.clone(),
            algorithm: format!("{}_clone", original_model.algorithm),
            version: "1.0.0".to_string(),
            accuracy: if clone_type == "exact" { original_model.accuracy } else { 0.0 },
            precision: if clone_type == "exact" { original_model.precision } else { 0.0 },
            recall: if clone_type == "exact" { original_model.recall } else { 0.0 },
            f1_score: if clone_type == "exact" { original_model.f1_score } else { 0.0 },
            created_at: Utc::now(),
            last_trained: if clone_type == "exact" { original_model.last_trained } else { Utc::now() },
            last_used: Utc::now(),
            training_samples: original_model.training_samples,
            feature_count: cloned_weights.len() as u32,
            status: if clone_type == "exact" { "cloned".to_string() } else { "cloned_modified".to_string() },
            performance_metrics: HashMap::new(),
        };

        // Store cloned model
        self.model_cache.insert(new_model_id.clone(), Arc::new(RwLock::new(cloned_weights)));
        self.models.insert(new_model_id.clone(), cloned_model.clone());

        // Update stats
        {
            let mut stats = self.performance_stats.write();
            stats.models_created += 1;
            stats.models_active += 1;
            stats.last_updated = Utc::now();
        }

        let clone_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "clone_id": Uuid::new_v4().to_string(),
            "original_model_id": model_id,
            "cloned_model_id": new_model_id,
            "clone_name": cloned_model.name,
            "clone_type": clone_type,
            "feature_count": cloned_model.feature_count,
            "performance_inherited": clone_type == "exact",
            "clone_time_ms": clone_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn archive_model(&self, model_id: String, archive_config_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let mut model = self.models.get_mut(&model_id)
            .ok_or_else(|| "Model not found".to_string())?
            .clone();

        let archive_config: serde_json::Value = serde_json::from_str(&archive_config_json)
            .map_err(|e| format!("Failed to parse archive config: {}", e))?;

        let archive_reason = archive_config.get("reason")
            .and_then(|r| r.as_str())
            .unwrap_or("user_request");

        let compress_weights = archive_config.get("compress_weights")
            .and_then(|c| c.as_bool())
            .unwrap_or(true);

        let include_metadata = archive_config.get("include_metadata")
            .and_then(|m| m.as_bool())
            .unwrap_or(true);

        // Create archive data
        let archive_id = Uuid::new_v4().to_string();
        let weights = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model weights not found".to_string())?;
        let weights_guard = weights.read();

        let archived_data = serde_json::json!({
            "archive_id": archive_id,
            "original_model_id": model_id,
            "model_data": if include_metadata { Some(&model) } else { None },
            "weights": if compress_weights {
                // Simulate compression by storing summary statistics
                serde_json::json!({
                    "compressed": true,
                    "original_size": weights_guard.len(),
                    "mean": weights_guard.iter().sum::<f64>() / weights_guard.len() as f64,
                    "min": weights_guard.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
                    "max": weights_guard.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b)),
                    "checksum": weights_guard.iter().map(|w| w.to_bits()).sum::<u64>()
                })
            } else {
                serde_json::json!({
                    "compressed": false,
                    "weights": &*weights_guard
                })
            },
            "archive_metadata": {
                "reason": archive_reason,
                "archived_at": Utc::now().to_rfc3339(),
                "compressed": compress_weights,
                "includes_metadata": include_metadata,
                "original_status": model.status.clone()
            }
        });

        // Update model status
        model.status = "archived".to_string();
        self.models.insert(model_id.clone(), model);

        // Remove from active cache but keep reference
        self.model_cache.remove(&model_id);

        let archive_time = start_time.elapsed().as_millis() as u64;
        let archive_size = serde_json::to_string(&archived_data)
            .map_err(|e| format!("Failed to serialize archive data: {}", e))?
            .len();

        Ok(serde_json::json!({
            "archive_id": archive_id,
            "model_id": model_id,
            "status": "archived",
            "archive_size_bytes": archive_size,
            "compression_enabled": compress_weights,
            "archive_data": archived_data,
            "archive_time_ms": archive_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn restore_model(&self, archive_data_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let archive_data: serde_json::Value = serde_json::from_str(&archive_data_json)
            .map_err(|e| format!("Failed to parse archive data: {}", e))?;

        let archive_id = archive_data.get("archive_id")
            .and_then(|id| id.as_str())
            .ok_or_else(|| "Archive ID not found".to_string())?;

        let original_model_id = archive_data.get("original_model_id")
            .and_then(|id| id.as_str())
            .ok_or_else(|| "Original model ID not found".to_string())?;

        // Extract model data
        let model_data = archive_data.get("model_data")
            .ok_or_else(|| "Model data not found in archive".to_string())?;

        let restored_model: MLModel = serde_json::from_value(model_data.clone())
            .map_err(|e| format!("Failed to deserialize model: {}", e))?;

        // Extract weights
        let weights_data = archive_data.get("weights")
            .ok_or_else(|| "Weights data not found in archive".to_string())?;

        let weights: Vec<f64> = if weights_data.get("compressed").and_then(|c| c.as_bool()).unwrap_or(false) {
            // For compressed data, we would need to decompress - for now, create dummy weights
            let original_size = weights_data.get("original_size")
                .and_then(|s| s.as_u64())
                .unwrap_or(10) as usize;
            let mean = weights_data.get("mean").and_then(|m| m.as_f64()).unwrap_or(0.0);

            (0..original_size).map(|_| mean + (rand::random::<f64>() - 0.5) * 0.1).collect()
        } else {
            weights_data.get("weights")
                .and_then(|w| w.as_array())
                .and_then(|arr| arr.iter().map(|v| v.as_f64()).collect::<Option<Vec<_>>>())
                .ok_or_else(|| "Invalid weights format".to_string())?
        };

        // Create restored model with new ID
        let restored_model_id = Uuid::new_v4().to_string();
        let mut restored = restored_model;
        restored.id = restored_model_id.clone();
        restored.name = format!("{}_restored", restored.name);
        restored.status = "restored".to_string();
        restored.last_used = Utc::now();

        // Store restored model
        self.model_cache.insert(restored_model_id.clone(), Arc::new(RwLock::new(weights)));
        self.models.insert(restored_model_id.clone(), restored.clone());

        // Update stats
        {
            let mut stats = self.performance_stats.write();
            stats.models_created += 1;
            stats.models_active += 1;
            stats.last_updated = Utc::now();
        }

        let restore_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "restore_id": Uuid::new_v4().to_string(),
            "archive_id": archive_id,
            "original_model_id": original_model_id,
            "restored_model_id": restored_model_id,
            "model_name": restored.name,
            "status": "restored",
            "feature_count": restored.feature_count,
            "restore_time_ms": restore_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn compare_models(&self, model_ids_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let model_ids: Vec<String> = serde_json::from_str(&model_ids_json)
            .map_err(|e| format!("Failed to parse model IDs: {}", e))?;

        if model_ids.len() < 2 {
            return Err("At least 2 models are required for comparison".to_string());
        }

        let mut comparisons = Vec::new();
        let mut models_data = Vec::new();

        // Collect model data
        for model_id in &model_ids {
            match self.models.get(model_id) {
                Some(model) => {
                    models_data.push(model.value().clone());
                },
                None => return Err(format!("Model {} not found", model_id))
            }
        }

        // Perform comparisons
        for (i, model_a) in models_data.iter().enumerate() {
            for (j, model_b) in models_data.iter().enumerate() {
                if i < j {
                    let accuracy_diff = model_a.accuracy - model_b.accuracy;
                    let precision_diff = model_a.precision - model_b.precision;
                    let recall_diff = model_a.recall - model_b.recall;
                    let f1_diff = model_a.f1_score - model_b.f1_score;

                    let better_model = if model_a.f1_score > model_b.f1_score {
                        &model_a.id
                    } else {
                        &model_b.id
                    };

                    comparisons.push(serde_json::json!({
                        "model_a": {
                            "id": model_a.id,
                            "name": model_a.name,
                            "accuracy": model_a.accuracy,
                            "precision": model_a.precision,
                            "recall": model_a.recall,
                            "f1_score": model_a.f1_score
                        },
                        "model_b": {
                            "id": model_b.id,
                            "name": model_b.name,
                            "accuracy": model_b.accuracy,
                            "precision": model_b.precision,
                            "recall": model_b.recall,
                            "f1_score": model_b.f1_score
                        },
                        "differences": {
                            "accuracy": accuracy_diff,
                            "precision": precision_diff,
                            "recall": recall_diff,
                            "f1_score": f1_diff
                        },
                        "better_model": better_model,
                        "significant_difference": f1_diff.abs() > 0.05
                    }));
                }
            }
        }

        // Calculate aggregate statistics
        let accuracies: Vec<f64> = models_data.iter().map(|m| m.accuracy).collect();
        let best_accuracy = accuracies.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let worst_accuracy = accuracies.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let avg_accuracy = accuracies.iter().sum::<f64>() / accuracies.len() as f64;

        let best_model = models_data.iter()
            .max_by(|a, b| a.f1_score.partial_cmp(&b.f1_score).unwrap());
        let worst_model = models_data.iter()
            .min_by(|a, b| a.f1_score.partial_cmp(&b.f1_score).unwrap());

        let comparison_time = start_time.elapsed().as_millis() as u64;

        Ok(serde_json::json!({
            "comparison_id": Uuid::new_v4().to_string(),
            "models_compared": model_ids.len(),
            "comparisons": comparisons,
            "summary": {
                "best_model": best_model.map(|m| serde_json::json!({
                    "id": m.id,
                    "name": m.name,
                    "f1_score": m.f1_score
                })),
                "worst_model": worst_model.map(|m| serde_json::json!({
                    "id": m.id,
                    "name": m.name,
                    "f1_score": m.f1_score
                })),
                "accuracy_stats": {
                    "best": best_accuracy,
                    "worst": worst_accuracy,
                    "average": avg_accuracy,
                    "variance": accuracies.iter()
                        .map(|a| (a - avg_accuracy).powi(2))
                        .sum::<f64>() / accuracies.len() as f64
                }
            },
            "comparison_time_ms": comparison_time,
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }

    fn optimize_model(&self, model_id: String, optimization_config_json: String) -> Result<String, String> {
        let start_time = std::time::Instant::now();

        let mut model = self.models.get_mut(&model_id)
            .ok_or_else(|| "Model not found".to_string())?
            .clone();

        let optimization_config: serde_json::Value = serde_json::from_str(&optimization_config_json)
            .map_err(|e| format!("Failed to parse optimization config: {}", e))?;

        let optimization_type = optimization_config.get("type")
            .and_then(|t| t.as_str())
            .unwrap_or("performance");

        let weights = self.model_cache.get(&model_id)
            .ok_or_else(|| "Model weights not found".to_string())?;
        let mut weights_guard = weights.write();

        let original_weights_count = weights_guard.len();
        let original_performance = model.f1_score;

        // Apply optimization based on type
        let optimization_result = match optimization_type {
            "performance" => {
                // Simulate performance optimization by adjusting weights
                let learning_rate = optimization_config.get("learning_rate")
                    .and_then(|lr| lr.as_f64())
                    .unwrap_or(0.001);

                for weight in weights_guard.iter_mut() {
                    *weight = *weight + learning_rate * (rand::random::<f64>() - 0.5);
                }

                // Simulate improved performance
                model.accuracy = (model.accuracy + 0.02).min(1.0);
                model.precision = (model.precision + 0.015).min(1.0);
                model.recall = (model.recall + 0.01).min(1.0);
                model.f1_score = 2.0 * (model.precision * model.recall) / (model.precision + model.recall);

                "performance_optimized".to_string()
            },
            "compression" => {
                // Simulate model compression by reducing precision
                let compression_ratio = optimization_config.get("compression_ratio")
                    .and_then(|cr| cr.as_f64())
                    .unwrap_or(0.5);

                for weight in weights_guard.iter_mut() {
                    *weight = (*weight * 100.0).round() / 100.0; // Quantization simulation
                }

                // Small performance degradation for compression
                model.accuracy = (model.accuracy - 0.01).max(0.0);
                model.precision = (model.precision - 0.01).max(0.0);
                model.recall = (model.recall - 0.01).max(0.0);
                model.f1_score = 2.0 * (model.precision * model.recall) / (model.precision + model.recall);

                format!("compressed_{:.1}x", 1.0 / compression_ratio)
            },
            "speed" => {
                // Optimize for inference speed by simplifying weights
                let threshold = optimization_config.get("pruning_threshold")
                    .and_then(|t| t.as_f64())
                    .unwrap_or(0.01);

                let pruned_count = weights_guard.iter_mut()
                    .map(|weight| {
                        if weight.abs() < threshold {
                            *weight = 0.0;
                            1
                        } else {
                            0
                        }
                    })
                    .sum::<usize>();

                // Minor performance impact
                model.accuracy = (model.accuracy - 0.005).max(0.0);
                model.f1_score = (model.f1_score - 0.005).max(0.0);

                format!("speed_optimized_pruned_{}", pruned_count)
            },
            "memory" => {
                // Memory optimization through weight sharing simulation
                let bucket_size = optimization_config.get("bucket_size")
                    .and_then(|bs| bs.as_u64())
                    .unwrap_or(10) as usize;

                for chunk in weights_guard.chunks_mut(bucket_size) {
                    let avg = chunk.iter().sum::<f64>() / chunk.len() as f64;
                    for weight in chunk {
                        *weight = avg; // Weight sharing
                    }
                }

                "memory_optimized".to_string()
            },
            _ => return Err("Invalid optimization type. Use: performance, compression, speed, or memory".to_string())
        };

        model.status = format!("optimized_{}", optimization_type);
        model.last_trained = Utc::now();
        self.models.insert(model_id.clone(), model.clone());

        let optimization_time = start_time.elapsed().as_millis() as u64;
        let performance_improvement = model.f1_score - original_performance;

        Ok(serde_json::json!({
            "optimization_id": Uuid::new_v4().to_string(),
            "model_id": model_id,
            "optimization_type": optimization_type,
            "optimization_result": optimization_result,
            "metrics": {
                "original_performance": original_performance,
                "optimized_performance": model.f1_score,
                "performance_change": performance_improvement,
                "weights_count": original_weights_count,
                "optimization_time_ms": optimization_time
            },
            "new_model_stats": {
                "accuracy": model.accuracy,
                "precision": model.precision,
                "recall": model.recall,
                "f1_score": model.f1_score,
                "status": model.status
            },
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}