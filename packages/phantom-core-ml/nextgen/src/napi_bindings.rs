use napi::bindgen_prelude::*;
use napi_derive::napi;
use napi::{Result as NapiResult, Status, Error as NapiError};
use std::sync::Arc;
use std::collections::HashMap;
use crate::core::PhantomMLCore;
use crate::types::MLConfig;
use crate::{TrainingOperations, InferenceOperations, ManagementOperations};

/// Advanced error handling with context and structured error responses
#[derive(Debug, Clone)]
pub struct StructuredError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
    pub context: Option<HashMap<String, String>>,
}

impl StructuredError {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
            details: None,
            context: None,
        }
    }

    pub fn with_details(mut self, details: &str) -> Self {
        self.details = Some(details.to_string());
        self
    }

    pub fn with_context(mut self, key: &str, value: &str) -> Self {
        if self.context.is_none() {
            self.context = Some(HashMap::new());
        }
        self.context.as_mut().unwrap().insert(key.to_string(), value.to_string());
        self
    }
}

/// Convert structured errors to NAPI errors with proper error codes
fn structured_error_to_napi(err: StructuredError) -> NapiError {
    let status = match err.code.as_str() {
        "VALIDATION_ERROR" => Status::InvalidArg,
        "NOT_FOUND" => Status::InvalidArg,
        "INTERNAL_ERROR" => Status::GenericFailure,
        "PERMISSION_DENIED" => Status::InvalidArg,
        "TIMEOUT" => Status::Cancelled,
        _ => Status::GenericFailure,
    };

    let mut message = format!("{}: {}", err.code, err.message);
    if let Some(details) = err.details {
        message.push_str(&format!(" ({})", details));
    }

    NapiError::new(status, message)
}

/// Convert String errors to structured NAPI errors
fn string_to_napi_error(err: String) -> NapiError {
    structured_error_to_napi(StructuredError::new("INTERNAL_ERROR", &err))
}

/// Enhanced result type for NAPI operations
type NapiMlResult<T> = std::result::Result<T, StructuredError>;

/// Convert ML results to NAPI results
fn ml_result_to_napi<T>(result: NapiMlResult<T>) -> NapiResult<T> {
    result.map_err(structured_error_to_napi)
}

/// Validate JSON input with proper error handling
fn validate_json_input(input: &str, context: &str) -> NapiMlResult<()> {
    if input.trim().is_empty() {
        return Err(StructuredError::new("VALIDATION_ERROR", "Input cannot be empty")
            .with_context("input_type", context));
    }

    if !input.trim_start().starts_with('{') && !input.trim_start().starts_with('[') {
        return Err(StructuredError::new("VALIDATION_ERROR", "Input must be valid JSON")
            .with_context("input_type", context)
            .with_details(&format!("Received: {}", input.chars().take(50).collect::<String>())));
    }

    Ok(())
}

/// Thread-safe core instance with proper resource management
#[cfg(feature = "napi")]
static CORE_INSTANCE: once_cell::sync::Lazy<Arc<std::sync::Mutex<Option<PhantomMLCore>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(std::sync::Mutex::new(None)));

/// Enhanced test function with error handling and performance metrics
#[napi]
pub fn test_napi() -> NapiResult<String> {
    let start = std::time::Instant::now();
    let result = "NAPI is working!".to_string();
    let duration = start.elapsed();

    Ok(format!("{} (initialized in {:?})", result, duration))
}

/// Get comprehensive version and build information
#[napi]
pub fn get_version() -> NapiResult<String> {
    let version_info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "build_target": std::env::var("TARGET").unwrap_or_else(|_| "unknown".to_string()),
        "build_profile": if cfg!(debug_assertions) { "debug" } else { "release" },
        "napi_version": "3.3.0",
        "features": {
            "enterprise": cfg!(feature = "enterprise"),
            "napi_optimized": cfg!(feature = "napi"),
            "databases": cfg!(feature = "all-databases")
        }
    });

    Ok(version_info.to_string())
}

/// Initialize global core instance with proper error handling
#[napi]
pub fn initialize_core() -> NapiResult<String> {
    #[cfg(feature = "napi")]
    {
        let mut core_guard = CORE_INSTANCE.lock().map_err(|_| {
            structured_error_to_napi(StructuredError::new("INTERNAL_ERROR", "Failed to acquire core lock"))
        })?;

        if core_guard.is_some() {
            return Ok("Core already initialized".to_string());
        }

        let core = PhantomMLCore::new();
        *core_guard = Some(core);

        Ok("Core initialized successfully".to_string())
    }

    #[cfg(not(feature = "napi"))]
    Err(structured_error_to_napi(StructuredError::new("FEATURE_NOT_ENABLED", "NAPI feature not enabled")))
}

/// Get core instance with proper error handling
#[cfg(feature = "napi")]
fn get_core_instance() -> NapiMlResult<PhantomMLCore> {
    let core_guard = CORE_INSTANCE.lock().map_err(|_| {
        StructuredError::new("INTERNAL_ERROR", "Failed to acquire core lock")
    })?;

    match core_guard.as_ref() {
        Some(core) => Ok(core.clone()),
        None => {
            drop(core_guard);
            // Try to initialize if not already done
            let core = PhantomMLCore::new().map_err(|e| {
                StructuredError::new("INITIALIZATION_ERROR", &format!("Failed to create core: {}", e))
            })?;
            Ok(core)
        }
    }
}

// ==================== MODEL MANAGEMENT (13 endpoints) ====================

/// Create a new ML model with specified configuration and enhanced validation
#[napi]
pub fn create_model(config_json: String) -> NapiResult<String> {
    validate_json_input(&config_json, "model_config")
        .map_err(structured_error_to_napi)?;

    #[cfg(feature = "napi")]
    {
        let core = get_core_instance().map_err(structured_error_to_napi)?;
        core.create_model(config_json).map_err(string_to_napi_error)
    }

    #[cfg(not(feature = "napi"))]
    {
        let core = PhantomMLCore::new();
        core.create_model(config_json).map_err(string_to_napi_error)
    }
}

/// Train a model with provided training data
#[napi]
pub fn train_model(config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    let config: MLConfig = serde_json::from_str(&config_json)
        .map_err(|e| NapiError::from_reason(format!("Failed to parse config: {}", e)))?;
    core.train_model(config).map_err(string_to_napi_error)
}

/// Get detailed information about a specific model
#[napi]
pub fn get_model_info(model_id: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.get_model_info(model_id).map_err(string_to_napi_error)
}

/// List all models with optional filtering
#[napi]
pub fn list_models() -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.list_models().map_err(string_to_napi_error)
}

/// Safely delete a model from the system
#[napi]
pub fn delete_model(model_id: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.delete_model(model_id).map_err(string_to_napi_error)
}

/// Validate model integrity and performance
#[napi]
pub fn validate_model(model_id: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.validate_model(model_id).map_err(string_to_napi_error)
}

/// Export models in multiple formats
#[napi]
pub fn export_model(model_id: String, format: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.export_model(model_id, format).map_err(string_to_napi_error)
}

/// Import models with validation
#[napi]
pub fn import_model(import_data_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.import_model(import_data_json).map_err(string_to_napi_error)
}

/// Clone models for versioning
#[napi]
pub fn clone_model(model_id: String, clone_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.clone_model(model_id, clone_config_json).map_err(string_to_napi_error)
}

/// Archive models for lifecycle management
#[napi]
pub fn archive_model(model_id: String, archive_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.archive_model(model_id, archive_config_json).map_err(string_to_napi_error)
}

/// Restore models from archives
#[napi]
pub fn restore_model(archive_data_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.restore_model(archive_data_json).map_err(string_to_napi_error)
}

/// Compare multiple models
#[napi]
pub fn compare_models(model_ids_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.compare_models(model_ids_json).map_err(string_to_napi_error)
}

/// Optimize model performance
#[napi]
pub fn optimize_model(model_id: String, optimization_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.optimize_model(model_id, optimization_config_json).map_err(string_to_napi_error)
}

// ==================== INFERENCE & PREDICTION (3 endpoints) ====================

/// Performs single inference using a trained model
#[napi]
pub fn predict(model_id: String, features_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.predict(model_id, features_json).map_err(string_to_napi_error)
}

/// Performs batch inference for high-throughput processing
#[napi]
pub fn predict_batch(model_id: String, batch_features_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.predict_batch(model_id, batch_features_json).map_err(string_to_napi_error)
}

/// Detects anomalies in data with configurable sensitivity
#[napi]
pub fn detect_anomalies(data_json: String, sensitivity: f64) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.detect_anomalies(data_json, sensitivity).map_err(string_to_napi_error)
}

// ==================== FEATURE ENGINEERING (1 endpoint) ====================

/// Performs advanced feature engineering on raw data
#[napi]
pub fn engineer_features(raw_data_json: String, feature_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.engineer_features(raw_data_json, feature_config_json).map_err(string_to_napi_error)
}

// ==================== ANALYTICS & INSIGHTS (7 endpoints) ====================

/// Generates comprehensive analytics and insights from data
#[napi]
pub fn generate_insights(analysis_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.generate_insights(analysis_config_json).map_err(string_to_napi_error)
}

/// Performs time series and trend analysis on data
#[napi]
pub fn trend_analysis(data_json: String, trend_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.trend_analysis(data_json, trend_config_json).map_err(string_to_napi_error)
}

/// Performs feature correlation analysis
#[napi]
pub fn correlation_analysis(data_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.correlation_analysis(data_json).map_err(string_to_napi_error)
}

/// Generates comprehensive statistical summaries of data
#[napi]
pub fn statistical_summary(data_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.statistical_summary(data_json).map_err(string_to_napi_error)
}

/// Data quality assessment and scoring
#[napi]
pub fn data_quality_assessment(data_json: String, quality_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.data_quality_assessment(data_json, quality_config_json).map_err(string_to_napi_error)
}

/// Feature importance ranking and analysis
#[napi]
pub fn feature_importance_analysis(model_id: String, analysis_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.feature_importance_analysis(model_id, analysis_config_json).map_err(string_to_napi_error)
}

/// Model decision explanations and interpretability
#[napi]
pub fn model_explainability(model_id: String, prediction_id: String, explain_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.model_explainability(model_id, prediction_id, explain_config_json).map_err(string_to_napi_error)
}

// ==================== STREAMING & BATCH PROCESSING (2 endpoints) ====================

/// Real-time streaming predictions
#[napi]
pub fn stream_predict(model_id: String, stream_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.stream_predict(model_id, stream_config_json).map_err(string_to_napi_error)
}

/// Asynchronous batch processing
#[napi]
pub fn batch_process_async(model_id: String, batch_data_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.batch_process_async(model_id, batch_data_json).map_err(string_to_napi_error)
}

// ==================== MONITORING & HEALTH (3 endpoints) ====================

/// Real-time performance monitoring
#[napi]
pub fn real_time_monitor(monitor_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.real_time_monitor(monitor_config_json).map_err(string_to_napi_error)
}

/// System performance metrics
#[napi]
pub fn get_performance_stats() -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.get_performance_stats().map_err(string_to_napi_error)
}

/// System health diagnostics
#[napi]
pub fn get_system_health() -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.get_system_health().map_err(string_to_napi_error)
}

// ==================== ALERTING & EVENTS (3 endpoints) ====================

/// Automated alert generation
#[napi]
pub fn alert_engine(alert_rules_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.alert_engine(alert_rules_json).map_err(string_to_napi_error)
}

/// Dynamic threshold management
#[napi]
pub fn threshold_management(threshold_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.threshold_management(threshold_config_json).map_err(string_to_napi_error)
}

/// Event-driven processing
#[napi]
pub fn event_processor(event_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.event_processor(event_config_json).map_err(string_to_napi_error)
}

// ==================== COMPLIANCE & SECURITY (3 endpoints) ====================

/// Comprehensive audit logging
#[napi]
pub fn audit_trail(audit_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.audit_trail(audit_config_json).map_err(string_to_napi_error)
}

/// Regulatory compliance reports
#[napi]
pub fn compliance_report(report_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.compliance_report(report_config_json).map_err(string_to_napi_error)
}

/// Security assessment and scanning
#[napi]
pub fn security_scan(scan_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.security_scan(scan_config_json).map_err(string_to_napi_error)
}

// ==================== OPERATIONS & BACKUP (2 endpoints) ====================

/// System backup and data protection
#[napi]
pub fn backup_system(backup_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.backup_system(backup_config_json).map_err(string_to_napi_error)
}

/// Disaster recovery procedures
#[napi]
pub fn disaster_recovery(recovery_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.disaster_recovery(recovery_config_json).map_err(string_to_napi_error)
}

// ==================== BUSINESS INTELLIGENCE (5 endpoints) ====================

/// ROI calculation and business metrics
#[napi]
pub fn roi_calculator(roi_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.roi_calculator(roi_config_json).map_err(string_to_napi_error)
}

/// Cost-benefit analysis
#[napi]
pub fn cost_benefit_analysis(analysis_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.cost_benefit_analysis(analysis_config_json).map_err(string_to_napi_error)
}

/// Performance forecasting
#[napi]
pub fn performance_forecasting(forecast_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.performance_forecasting(forecast_config_json).map_err(string_to_napi_error)
}

/// Resource optimization analytics
#[napi]
pub fn resource_optimization(optimization_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.resource_optimization(optimization_config_json).map_err(string_to_napi_error)
}

/// Business KPI tracking
#[napi]
pub fn business_metrics(metrics_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.business_metrics(metrics_config_json).map_err(string_to_napi_error)
}

// ==================== AUTOML ENDPOINTS (NEW) ====================

/// Automatically train and optimize ML models using AutoML
#[napi]
pub fn auto_train_model(config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.auto_train_model(config_json).map_err(string_to_napi_error)
}

/// Get model leaderboard for AutoML experiments
#[napi]
pub fn get_model_leaderboard(experiment_id: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.get_model_leaderboard(experiment_id).map_err(string_to_napi_error)
}

/// Automatic feature engineering for datasets
#[napi]
pub fn auto_feature_engineering(data_json: String, config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.auto_feature_engineering(data_json, config_json).map_err(string_to_napi_error)
}

/// Explain model predictions with feature importance
#[napi]
pub fn explain_model(model_id: String, instance_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.explain_model(model_id, instance_json).map_err(string_to_napi_error)
}

/// Optimize hyperparameters for a specific model
#[napi]
pub fn optimize_hyperparameters(model_id: String, optimization_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.optimize_hyperparameters(model_id, optimization_config_json).map_err(string_to_napi_error)
}

/// Automated model selection based on data characteristics
#[napi]
pub fn select_best_algorithm(data_json: String, task_type: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.select_best_algorithm(data_json, task_type).map_err(string_to_napi_error)
}

/// Generate automated insights from data
#[napi]
pub fn auto_generate_insights(data_json: String, config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.auto_generate_insights(data_json, config_json).map_err(string_to_napi_error)
}

/// Cross-validate model performance
#[napi]
pub fn cross_validate_model(model_id: String, data_json: String, folds: u32) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.cross_validate_model(model_id, data_json, folds).map_err(string_to_napi_error)
}

/// Ensemble multiple models for improved performance
#[napi]
pub fn create_ensemble(model_ids: Vec<String>, ensemble_config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.create_ensemble(model_ids, ensemble_config_json).map_err(string_to_napi_error)
}

/// Security-specific feature extraction
#[napi]
pub fn extract_security_features(data_json: String, config_json: String) -> NapiResult<String> {
    let core = PhantomMLCore::new();
    core.extract_security_features(data_json, config_json).map_err(string_to_napi_error)
}
