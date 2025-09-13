//! Rocket server module for phantom-ml-core
//!
//! Provides RESTful HTTP API endpoints using Rocket framework for ML model operations.
//! Alternative to actix-web with different performance characteristics and API design.

use rocket::serde::{Deserialize, Serialize, json::Json};
use rocket::{State, routes, get, post, delete};
use rocket::response::status;
use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{DateTime, Utc};

use crate::{PhantomMLCore, MLModelConfig, InferenceResult, TrainingResult};

/// API request/response types for Rocket
#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct RocketCreateModelRequest {
    pub model_config: MLModelConfig,
    pub database_config: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct RocketPredictRequest {
    pub model_id: String,
    pub features: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct RocketTrainRequest {
    pub model_id: String,
    pub training_data: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct RocketApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl<T> RocketApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: Utc::now(),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
            timestamp: Utc::now(),
        }
    }
}

/// Rocket state for ML core
pub struct MLCoreState {
    pub ml_core: Arc<Mutex<PhantomMLCore>>,
}

/// Create a new ML model
#[post("/models", data = "<req>")]
async fn create_model(
    state: &State<MLCoreState>,
    req: Json<RocketCreateModelRequest>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let mut core = state.ml_core.lock().await;

    // Initialize databases if config provided
    if let Some(db_config) = &req.database_config {
        let db_config_json = serde_json::to_string(db_config)
            .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize DB config: {}", e)))?;

        core.initialize_databases(db_config_json).await
            .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Database initialization failed: {}", e)))?;
    }

    // Create the model
    let config_json = serde_json::to_string(&req.model_config)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize model config: {}", e)))?;

    let result = core.create_model(config_json).await
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Model creation failed: {}", e)))?;

    let model_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse model result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(model_data)))
}

/// List all available models
#[get("/models")]
async fn list_models(
    state: &State<MLCoreState>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.list_models().await
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to list models: {}", e)))?;

    let models_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse models result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(models_data)))
}

/// Get a specific model by ID
#[get("/models/<model_id>")]
async fn get_model(
    state: &State<MLCoreState>,
    model_id: String,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.get_model_info(model_id).await
        .map_err(|e| status::Custom(rocket::http::Status::NotFound, format!("Model not found: {}", e)))?;

    let model_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse model result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(model_data)))
}

/// Delete a model by ID
#[delete("/models/<model_id>")]
async fn delete_model(
    state: &State<MLCoreState>,
    model_id: String,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.delete_model(model_id).await
        .map_err(|e| status::Custom(rocket::http::Status::NotFound, format!("Model not found: {}", e)))?;

    let delete_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse delete result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(delete_data)))
}

/// Perform inference with a model
#[post("/models/<model_id>/predict", data = "<req>")]
async fn predict(
    state: &State<MLCoreState>,
    model_id: String,
    req: Json<RocketPredictRequest>,
) -> Result<Json<RocketApiResponse<InferenceResult>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let features_json = serde_json::to_string(&req.features)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize features: {}", e)))?;

    let result = core.predict(model_id, features_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Prediction failed: {}", e)))?;

    let prediction_data: InferenceResult = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse prediction result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(prediction_data)))
}

/// Train a model
#[post("/models/<model_id>/train", data = "<req>")]
async fn train_model(
    state: &State<MLCoreState>,
    model_id: String,
    req: Json<RocketTrainRequest>,
) -> Result<Json<RocketApiResponse<TrainingResult>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let training_data_json = serde_json::to_string(&req.training_data)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize training data: {}", e)))?;

    let result = core.train_model(model_id, training_data_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Training failed: {}", e)))?;

    let training_data: TrainingResult = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse training result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(training_data)))
}

/// Validate a model
#[post("/models/<model_id>/validate")]
async fn validate_model(
    state: &State<MLCoreState>,
    model_id: String,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.validate_model(model_id).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Validation failed: {}", e)))?;

    let validation_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse validation result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(validation_data)))
}

/// Export a model
#[get("/models/<model_id>/export?<format>")]
async fn export_model(
    state: &State<MLCoreState>,
    model_id: String,
    format: Option<String>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let export_format = format.unwrap_or_else(|| "json".to_string());

    let result = core.export_model(model_id, export_format).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Export failed: {}", e)))?;

    let export_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse export result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(export_data)))
}

/// Generate AI insights
#[get("/analytics/insights?<analysis_type>&<models>")]
async fn generate_insights(
    state: &State<MLCoreState>,
    analysis_type: Option<String>,
    models: Option<String>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let analysis_config = serde_json::json!({
        "type": analysis_type.unwrap_or_else(|| "comprehensive".to_string()),
        "include_models": models.map(|m| m.split(',').map(|s| s.to_string()).collect::<Vec<_>>())
    });

    let config_json = serde_json::to_string(&analysis_config)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize config: {}", e)))?;

    let result = core.generate_insights(config_json).await
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Insights generation failed: {}", e)))?;

    let insights_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse insights result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(insights_data)))
}

/// Perform trend analysis
#[post("/analytics/trend-analysis", data = "<data>")]
async fn trend_analysis(
    state: &State<MLCoreState>,
    data: Json<serde_json::Value>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let data_json = serde_json::to_string(&data)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize data: {}", e)))?;

    let trend_config = serde_json::json!({
        "method": "linear",
        "window_size": 5,
        "forecast_steps": 3
    });

    let config_json = serde_json::to_string(&trend_config)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize config: {}", e)))?;

    let result = core.trend_analysis(data_json, config_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Trend analysis failed: {}", e)))?;

    let trend_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse trend result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(trend_data)))
}

/// Perform correlation analysis
#[post("/analytics/correlation", data = "<data>")]
async fn correlation_analysis(
    state: &State<MLCoreState>,
    data: Json<serde_json::Value>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let data_json = serde_json::to_string(&data)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize data: {}", e)))?;

    let result = core.correlation_analysis(data_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Correlation analysis failed: {}", e)))?;

    let correlation_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse correlation result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(correlation_data)))
}

/// Compare multiple models
#[post("/analytics/compare-models", data = "<model_ids>")]
async fn compare_models(
    state: &State<MLCoreState>,
    model_ids: Json<Vec<String>>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let model_ids_json = serde_json::to_string(&model_ids)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize model IDs: {}", e)))?;

    let result = core.compare_models(model_ids_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Model comparison failed: {}", e)))?;

    let comparison_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse comparison result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(comparison_data)))
}

/// Health check endpoint
#[get("/health")]
async fn health_check(
    state: &State<MLCoreState>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.get_system_health().await
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Health check failed: {}", e)))?;

    let health_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse health result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(health_data)))
}

/// Get system statistics
#[get("/stats")]
async fn system_stats(
    state: &State<MLCoreState>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let result = core.get_performance_stats().await
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Stats retrieval failed: {}", e)))?;

    let stats_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse stats result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(stats_data)))
}

/// Optimize a model
#[post("/optimize/<model_id>?<optimization_type>")]
async fn optimize_model(
    state: &State<MLCoreState>,
    model_id: String,
    optimization_type: Option<String>,
) -> Result<Json<RocketApiResponse<serde_json::Value>>, status::Custom<String>> {
    let core = state.ml_core.lock().await;

    let optimization_config = serde_json::json!({
        "type": optimization_type.unwrap_or_else(|| "performance".to_string())
    });

    let config_json = serde_json::to_string(&optimization_config)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to serialize config: {}", e)))?;

    let result = core.optimize_model(model_id, config_json).await
        .map_err(|e| status::Custom(rocket::http::Status::BadRequest, format!("Optimization failed: {}", e)))?;

    let optimization_data: serde_json::Value = serde_json::from_str(&result)
        .map_err(|e| status::Custom(rocket::http::Status::InternalServerError, format!("Failed to parse optimization result: {}", e)))?;

    Ok(Json(RocketApiResponse::success(optimization_data)))
}

/// Rocket-based ML API server
pub struct RocketMLServer {
    ml_core: Arc<Mutex<PhantomMLCore>>,
}

impl RocketMLServer {
    /// Create a new Rocket ML server
    pub fn new(ml_core: PhantomMLCore) -> Self {
        Self {
            ml_core: Arc::new(Mutex::new(ml_core)),
        }
    }

    /// Build and launch the Rocket server
    pub async fn launch(self) -> Result<(), rocket::Error> {
        let state = MLCoreState {
            ml_core: self.ml_core,
        };

        let _rocket = rocket::build()
            .manage(state)
            .mount("/api/v1", routes![
                create_model,
                list_models,
                get_model,
                delete_model,
                predict,
                train_model,
                validate_model,
                export_model,
                generate_insights,
                trend_analysis,
                correlation_analysis,
                compare_models,
                health_check,
                system_stats,
                optimize_model
            ])
            .launch()
            .await?;

        Ok(())
    }
}

/// Convenience function to create and launch the Rocket server
pub async fn start_rocket_ml_server(ml_core: PhantomMLCore) -> Result<(), rocket::Error> {
    let server = RocketMLServer::new(ml_core);
    server.launch().await
}</content>
<parameter name="filePath">c:\phantom-spire\packages\phantom-ml-core\src\rocket_server.rs