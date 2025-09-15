// Management operations for Phantom ML Core
// Modernized for NAPI-RS v3.x with enterprise features

use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use anyhow::{Result, anyhow};

/// Management operations extension trait for PhantomMLCore
pub trait ManagementOperations {
    /// Create a new model with a specified configuration
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

    /// Import a model from an external format
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

/// Model configuration structure for management operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLModelConfig {
    pub model_type: String,
    pub algorithm: String,
    pub feature_config: FeatureConfig,
    pub training_config: TrainingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureConfig {
    pub input_features: Vec<String>,
    pub target_feature: String,
    pub feature_types: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingConfig {
    pub epochs: u32,
    pub batch_size: u32,
    pub learning_rate: f64,
    pub validation_split: f64,
    pub cross_validation: bool,
    pub cross_validation_folds: u32,
}

impl Default for TrainingConfig {
    fn default() -> Self {
        Self {
            epochs: 100,
            batch_size: 32,
            learning_rate: 0.001,
            validation_split: 0.2,
            cross_validation: false,
            cross_validation_folds: 5,
        }
    }
}

/// ML Model representation for management
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

/// Performance statistics for the ML system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub models_created: u64,
    pub models_active: u64,
    pub total_predictions: u64,
    pub total_training_time_seconds: u64,
    pub average_accuracy: f64,
    pub last_updated: DateTime<Utc>,
}

impl Default for PerformanceStats {
    fn default() -> Self {
        Self {
            models_created: 0,
            models_active: 0,
            total_predictions: 0,
            total_training_time_seconds: 0,
            average_accuracy: 0.0,
            last_updated: Utc::now(),
        }
    }
}

/// Base64 encoding/decoding utilities
pub struct Base64Utils;

impl Base64Utils {
    pub fn encode(data: &[u8]) -> String {
        use base64::{engine::general_purpose::STANDARD, Engine};
        STANDARD.encode(data)
    }

    pub fn decode(data: &str) -> Result<Vec<u8>, String> {
        use base64::{engine::general_purpose::STANDARD, Engine};
        STANDARD.decode(data).map_err(|e| format!("Base64 decode error: {}", e))
    }
}

/// Model validation utilities
pub struct ModelValidator;

impl ModelValidator {
    /// Validate model configuration
    pub fn validate_config(config: &MLModelConfig) -> Result<(), String> {
        if config.model_type.is_empty() {
            return Err("Model type cannot be empty".to_string());
        }

        if config.algorithm.is_empty() {
            return Err("Algorithm cannot be empty".to_string());
        }

        if config.feature_config.input_features.is_empty() {
            return Err("Input features cannot be empty".to_string());
        }

        if config.feature_config.target_feature.is_empty() {
            return Err("Target feature cannot be empty".to_string());
        }

        if config.training_config.epochs == 0 {
            return Err("Epochs must be greater than 0".to_string());
        }

        if config.training_config.batch_size == 0 {
            return Err("Batch size must be greater than 0".to_string());
        }

        if config.training_config.learning_rate <= 0.0 {
            return Err("Learning rate must be positive".to_string());
        }

        Ok(())
    }

    /// Validate model performance metrics
    pub fn validate_performance(model: &MLModel) -> Result<ValidationResult, String> {
        let mut issues = Vec::new();
        let mut score = 100.0;

        // Check accuracy range
        if model.accuracy < 0.0 || model.accuracy > 1.0 {
            issues.push("Accuracy out of valid range [0.0, 1.0]".to_string());
            score -= 20.0;
        }

        // Check precision range
        if model.precision < 0.0 || model.precision > 1.0 {
            issues.push("Precision out of valid range [0.0, 1.0]".to_string());
            score -= 20.0;
        }

        // Check recall range
        if model.recall < 0.0 || model.recall > 1.0 {
            issues.push("Recall out of valid range [0.0, 1.0]".to_string());
            score -= 20.0;
        }

        // Check F1 score consistency
        if model.precision > 0.0 && model.recall > 0.0 {
            let expected_f1 = 2.0 * (model.precision * model.recall) / (model.precision + model.recall);
            let f1_diff = (model.f1_score - expected_f1).abs();
            if f1_diff > 0.01 {
                issues.push("F1 score inconsistent with precision and recall".to_string());
                score -= 10.0;
            }
        }

        // Check feature count
        if model.feature_count == 0 {
            issues.push("Model has no features".to_string());
            score -= 15.0;
        }

        // Check training samples
        if model.training_samples == 0 {
            issues.push("Model has no training samples".to_string());
            score -= 15.0;
        }

        Ok(ValidationResult {
            valid: issues.is_empty(),
            score: score.max(0.0),
            issues,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub score: f64,
    pub issues: Vec<String>,
}

/// Model comparison utilities
pub struct ModelComparator;

impl ModelComparator {
    /// Compare two models and return detailed comparison
    pub fn compare_models(model_a: &MLModel, model_b: &MLModel) -> ModelComparison {
        let accuracy_diff = model_a.accuracy - model_b.accuracy;
        let precision_diff = model_a.precision - model_b.precision;
        let recall_diff = model_a.recall - model_b.recall;
        let f1_diff = model_a.f1_score - model_b.f1_score;

        let better_model_id = if model_a.f1_score > model_b.f1_score {
            model_a.id.clone()
        } else {
            model_b.id.clone()
        };

        let significance_threshold = 0.05;
        let significant_difference = f1_diff.abs() > significance_threshold;

        ModelComparison {
            model_a_id: model_a.id.clone(),
            model_a_name: model_a.name.clone(),
            model_b_id: model_b.id.clone(),
            model_b_name: model_b.name.clone(),
            accuracy_diff,
            precision_diff,
            recall_diff,
            f1_diff,
            better_model_id,
            significant_difference,
            comparison_timestamp: Utc::now(),
        }
    }

    /// Generate aggregate statistics for multiple models
    pub fn aggregate_stats(models: &[MLModel]) -> AggregateStats {
        if models.is_empty() {
            return AggregateStats::default();
        }

        let accuracies: Vec<f64> = models.iter().map(|m| m.accuracy).collect();
        let best_accuracy = accuracies.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let worst_accuracy = accuracies.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let avg_accuracy = accuracies.iter().sum::<f64>() / accuracies.len() as f64;

        let variance = accuracies.iter()
            .map(|a| (a - avg_accuracy).powi(2))
            .sum::<f64>() / accuracies.len() as f64;

        let best_model = models.iter()
            .max_by(|a, b| a.f1_score.partial_cmp(&b.f1_score).unwrap_or(std::cmp::Ordering::Equal))
            .cloned();

        let worst_model = models.iter()
            .min_by(|a, b| a.f1_score.partial_cmp(&b.f1_score).unwrap_or(std::cmp::Ordering::Equal))
            .cloned();

        AggregateStats {
            total_models: models.len(),
            best_accuracy,
            worst_accuracy,
            avg_accuracy,
            accuracy_variance: variance,
            best_model,
            worst_model,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelComparison {
    pub model_a_id: String,
    pub model_a_name: String,
    pub model_b_id: String,
    pub model_b_name: String,
    pub accuracy_diff: f64,
    pub precision_diff: f64,
    pub recall_diff: f64,
    pub f1_diff: f64,
    pub better_model_id: String,
    pub significant_difference: bool,
    pub comparison_timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregateStats {
    pub total_models: usize,
    pub best_accuracy: f64,
    pub worst_accuracy: f64,
    pub avg_accuracy: f64,
    pub accuracy_variance: f64,
    pub best_model: Option<MLModel>,
    pub worst_model: Option<MLModel>,
}

impl Default for AggregateStats {
    fn default() -> Self {
        Self {
            total_models: 0,
            best_accuracy: 0.0,
            worst_accuracy: 0.0,
            avg_accuracy: 0.0,
            accuracy_variance: 0.0,
            best_model: None,
            worst_model: None,
        }
    }
}

/// Model optimization utilities
pub struct ModelOptimizer;

impl ModelOptimizer {
    /// Apply performance optimization to a model
    pub fn optimize_performance(
        model: &mut MLModel,
        learning_rate: f64,
    ) -> OptimizationResult {
        let original_performance = model.f1_score;

        // Simulate performance optimization
        model.accuracy = (model.accuracy + 0.02).min(1.0);
        model.precision = (model.precision + 0.015).min(1.0);
        model.recall = (model.recall + 0.01).min(1.0);
        model.f1_score = if model.precision + model.recall > 0.0 {
            2.0 * (model.precision * model.recall) / (model.precision + model.recall)
        } else {
            0.0
        };

        model.last_trained = Utc::now();
        model.status = "optimized_performance".to_string();

        OptimizationResult {
            optimization_type: "performance".to_string(),
            original_performance,
            optimized_performance: model.f1_score,
            improvement: model.f1_score - original_performance,
            optimization_timestamp: Utc::now(),
        }
    }

    /// Apply compression optimization to a model
    pub fn optimize_compression(
        model: &mut MLModel,
        compression_ratio: f64,
    ) -> OptimizationResult {
        let original_performance = model.f1_score;

        // Simulate compression with minor performance loss
        let performance_loss = compression_ratio * 0.02;
        model.accuracy = (model.accuracy - performance_loss).max(0.0);
        model.precision = (model.precision - performance_loss).max(0.0);
        model.recall = (model.recall - performance_loss).max(0.0);
        model.f1_score = if model.precision + model.recall > 0.0 {
            2.0 * (model.precision * model.recall) / (model.precision + model.recall)
        } else {
            0.0
        };

        model.last_trained = Utc::now();
        model.status = format!("optimized_compression_{:.1}x", 1.0 / compression_ratio);

        OptimizationResult {
            optimization_type: "compression".to_string(),
            original_performance,
            optimized_performance: model.f1_score,
            improvement: model.f1_score - original_performance,
            optimization_timestamp: Utc::now(),
        }
    }

    /// Apply speed optimization to a model
    pub fn optimize_speed(
        model: &mut MLModel,
        pruning_threshold: f64,
    ) -> OptimizationResult {
        let original_performance = model.f1_score;

        // Simulate speed optimization with pruning
        let performance_impact = pruning_threshold * 0.01;
        model.accuracy = (model.accuracy - performance_impact).max(0.0);
        model.f1_score = (model.f1_score - performance_impact).max(0.0);

        model.last_trained = Utc::now();
        model.status = "optimized_speed".to_string();

        OptimizationResult {
            optimization_type: "speed".to_string(),
            original_performance,
            optimized_performance: model.f1_score,
            improvement: model.f1_score - original_performance,
            optimization_timestamp: Utc::now(),
        }
    }

    /// Apply memory optimization to a model
    pub fn optimize_memory(model: &mut MLModel) -> OptimizationResult {
        let original_performance = model.f1_score;

        // Simulate memory optimization with minimal impact
        model.last_trained = Utc::now();
        model.status = "optimized_memory".to_string();

        OptimizationResult {
            optimization_type: "memory".to_string(),
            original_performance,
            optimized_performance: model.f1_score,
            improvement: 0.0, // No performance change for memory optimization
            optimization_timestamp: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationResult {
    pub optimization_type: String,
    pub original_performance: f64,
    pub optimized_performance: f64,
    pub improvement: f64,
    pub optimization_timestamp: DateTime<Utc>,
}

/// Enterprise-grade model management utilities
pub struct EnterpriseModelManager;

impl EnterpriseModelManager {
    /// Generate comprehensive model report
    pub fn generate_model_report(models: &[MLModel]) -> ModelReport {
        let stats = ModelComparator::aggregate_stats(models);
        let total_training_time: u64 = models.iter().map(|m| {
            // Estimate training time based on samples and complexity
            (m.training_samples / 1000).max(1)
        }).sum();

        let avg_feature_count = if models.is_empty() {
            0.0
        } else {
            models.iter().map(|m| m.feature_count as f64).sum::<f64>() / models.len() as f64
        };

        ModelReport {
            report_id: Uuid::new_v4().to_string(),
            generated_at: Utc::now(),
            total_models: stats.total_models,
            active_models: models.iter().filter(|m| m.status == "trained" || m.status.starts_with("optimized")).count(),
            performance_stats: stats,
            total_training_time_hours: total_training_time as f64 / 3600.0,
            avg_feature_count,
            status_distribution: Self::calculate_status_distribution(models),
        }
    }

    fn calculate_status_distribution(models: &[MLModel]) -> HashMap<String, u32> {
        let mut distribution = HashMap::new();
        for model in models {
            *distribution.entry(model.status.clone()).or_insert(0) += 1;
        }
        distribution
    }

    /// Generate security-focused model assessment
    pub fn security_assessment(models: &[MLModel]) -> SecurityAssessment {
        let high_accuracy_models = models.iter().filter(|m| m.accuracy > 0.9).count();
        let recent_models = models.iter().filter(|m| {
            let days_old = (Utc::now() - m.created_at).num_days();
            days_old <= 30
        }).count();

        let avg_accuracy = if models.is_empty() {
            0.0
        } else {
            models.iter().map(|m| m.accuracy).sum::<f64>() / models.len() as f64
        };

        let security_score = if avg_accuracy > 0.95 && high_accuracy_models > models.len() / 2 {
            95.0
        } else if avg_accuracy > 0.90 && high_accuracy_models > models.len() / 3 {
            85.0
        } else if avg_accuracy > 0.80 {
            75.0
        } else {
            60.0
        };

        SecurityAssessment {
            assessment_id: Uuid::new_v4().to_string(),
            assessment_date: Utc::now(),
            security_score,
            high_accuracy_models,
            recent_models,
            avg_accuracy,
            recommendations: Self::generate_security_recommendations(avg_accuracy, models.len()),
        }
    }

    fn generate_security_recommendations(avg_accuracy: f64, model_count: usize) -> Vec<String> {
        let mut recommendations = Vec::new();

        if avg_accuracy < 0.8 {
            recommendations.push("Consider retraining models with more data".to_string());
            recommendations.push("Review feature engineering processes".to_string());
        }

        if model_count < 5 {
            recommendations.push("Increase model diversity for better coverage".to_string());
        }

        if avg_accuracy > 0.95 {
            recommendations.push("Excellent model performance - maintain current processes".to_string());
        }

        recommendations.push("Regular model validation and monitoring recommended".to_string());
        recommendations.push("Implement automated model retraining pipelines".to_string());

        recommendations
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelReport {
    pub report_id: String,
    pub generated_at: DateTime<Utc>,
    pub total_models: usize,
    pub active_models: usize,
    pub performance_stats: AggregateStats,
    pub total_training_time_hours: f64,
    pub avg_feature_count: f64,
    pub status_distribution: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAssessment {
    pub assessment_id: String,
    pub assessment_date: DateTime<Utc>,
    pub security_score: f64,
    pub high_accuracy_models: usize,
    pub recent_models: usize,
    pub avg_accuracy: f64,
    pub recommendations: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_model_validator() {
        let config = MLModelConfig {
            model_type: "classification".to_string(),
            algorithm: "random_forest".to_string(),
            feature_config: FeatureConfig {
                input_features: vec!["feature1".to_string(), "feature2".to_string()],
                target_feature: "target".to_string(),
                feature_types: HashMap::new(),
            },
            training_config: TrainingConfig::default(),
        };

        assert!(ModelValidator::validate_config(&config).is_ok());
    }

    #[test]
    fn test_model_comparison() {
        let model_a = MLModel {
            id: "model_a".to_string(),
            name: "Model A".to_string(),
            model_type: "classification".to_string(),
            algorithm: "random_forest".to_string(),
            version: "1.0.0".to_string(),
            accuracy: 0.95,
            precision: 0.93,
            recall: 0.91,
            f1_score: 0.92,
            created_at: Utc::now(),
            last_trained: Utc::now(),
            last_used: Utc::now(),
            training_samples: 10000,
            feature_count: 20,
            status: "trained".to_string(),
            performance_metrics: HashMap::new(),
        };

        let model_b = MLModel {
            id: "model_b".to_string(),
            name: "Model B".to_string(),
            model_type: "classification".to_string(),
            algorithm: "xgboost".to_string(),
            version: "1.0.0".to_string(),
            accuracy: 0.88,
            precision: 0.86,
            recall: 0.84,
            f1_score: 0.85,
            created_at: Utc::now(),
            last_trained: Utc::now(),
            last_used: Utc::now(),
            training_samples: 8000,
            feature_count: 20,
            status: "trained".to_string(),
            performance_metrics: HashMap::new(),
        };

        let comparison = ModelComparator::compare_models(&model_a, &model_b);
        assert_eq!(comparison.better_model_id, "model_a");
        assert!(comparison.f1_diff > 0.0);
        assert!(comparison.significant_difference);
    }

    #[test]
    fn test_model_optimization() {
        let mut model = MLModel {
            id: "test_model".to_string(),
            name: "Test Model".to_string(),
            model_type: "classification".to_string(),
            algorithm: "random_forest".to_string(),
            version: "1.0.0".to_string(),
            accuracy: 0.80,
            precision: 0.78,
            recall: 0.76,
            f1_score: 0.77,
            created_at: Utc::now(),
            last_trained: Utc::now(),
            last_used: Utc::now(),
            training_samples: 5000,
            feature_count: 15,
            status: "trained".to_string(),
            performance_metrics: HashMap::new(),
        };

        let original_f1 = model.f1_score;
        let result = ModelOptimizer::optimize_performance(&mut model, 0.001);
        
        assert_eq!(result.optimization_type, "performance");
        assert!(model.f1_score >= original_f1);
        assert_eq!(model.status, "optimized_performance");
    }

    #[test]
    fn test_enterprise_model_report() {
        let models = vec![
            MLModel {
                id: "model_1".to_string(),
                name: "Model 1".to_string(),
                model_type: "classification".to_string(),
                algorithm: "random_forest".to_string(),
                version: "1.0.0".to_string(),
                accuracy: 0.92,
                precision: 0.90,
                recall: 0.88,
                f1_score: 0.89,
                created_at: Utc::now(),
                last_trained: Utc::now(),
                last_used: Utc::now(),
                training_samples: 10000,
                feature_count: 20,
                status: "trained".to_string(),
                performance_metrics: HashMap::new(),
            }
        ];

        let report = EnterpriseModelManager::generate_model_report(&models);
        assert_eq!(report.total_models, 1);
        assert!(!report.report_id.is_empty());
    }
}