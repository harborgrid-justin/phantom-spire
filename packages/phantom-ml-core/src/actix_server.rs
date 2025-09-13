//! Actix-web server module for phantom-ml-core
//!
//! Provides RESTful HTTP API endpoints for ML model operations including:
//! - Model management (create, list, delete)
//! - Inference and prediction
//! - Training operations
//! - Analytics and monitoring
//! - Health checks and system status

use actix_web::{web, App, HttpServer, HttpResponse, Result as ActixResult};
use actix_web::middleware::Logger;
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use chrono::{DateTime, Utc};

use crate::{PhantomMLCore, MLModelConfig, InferenceResult, TrainingResult};

/// API request/response types
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateModelRequest {
    pub model_config: MLModelConfig,
    pub database_config: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PredictRequest {
    pub model_id: String,
    pub features: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TrainRequest {
    pub model_id: String,
    pub training_data: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
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

/// Actix-web server for ML operations
pub struct MLApiServer {
    ml_core: Arc<Mutex<PhantomMLCore>>,
    host: String,
    port: u16,
}

impl MLApiServer {
    /// Create a new ML API server
    pub fn new(ml_core: PhantomMLCore, host: String, port: u16) -> Self {
        Self {
            ml_core: Arc::new(Mutex::new(ml_core)),
            host,
            port,
        }
    }

    /// Start the HTTP server
    pub async fn start(self) -> std::io::Result<()> {
        let ml_core = self.ml_core.clone();

        println!("Starting ML API server on {}:{}", self.host, self.port);

        HttpServer::new(move || {
            let cors = Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header()
                .max_age(3600);

            App::new()
                .app_data(web::Data::new(ml_core.clone()))
                .wrap(cors)
                .wrap(Logger::default())
                .service(
                    web::scope("/api/v1")
                        .service(
                            web::scope("/models")
                                .route("", web::post().to(create_model))
                                .route("", web::get().to(list_models))
                                .route("/{id}", web::get().to(get_model))
                                .route("/{id}", web::delete().to(delete_model))
                                .route("/{id}/predict", web::post().to(predict))
                                .route("/{id}/train", web::post().to(train_model))
                                .route("/{id}/validate", web::post().to(validate_model))
                                .route("/{id}/export", web::post().to(export_model))
                        )
                        .service(
                            web::scope("/analytics")
                                .route("/insights", web::get().to(generate_insights))
                                .route("/trend-analysis", web::post().to(trend_analysis))
                                .route("/correlation", web::post().to(correlation_analysis))
                                .route("/compare-models", web::post().to(compare_models))
                        )
                        .service(
                            web::scope("/system")
                                .route("/health", web::get().to(health_check))
                                .route("/stats", web::get().to(system_stats))
                                .route("/optimize/{id}", web::post().to(optimize_model))
                        )
                )
        })
        .bind((self.host.as_str(), self.port))?
        .run()
        .await
    }
}

/// Create a new ML model
async fn create_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    req: web::Json<CreateModelRequest>,
) -> ActixResult<HttpResponse> {
    let mut core = ml_core.lock().await;

    // Initialize databases if config provided
    if let Some(db_config) = &req.database_config {
        let db_config_json = serde_json::to_string(db_config)
            .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize DB config: {}", e)))?;

        match core.initialize_databases(db_config_json).await {
            Ok(_) => {},
            Err(e) => return Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Database initialization failed: {}", e)))),
        }
    }

    // Create the model
    let config_json = serde_json::to_string(&req.model_config)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize model config: {}", e)))?;

    match core.create_model(config_json).await {
        Ok(result) => {
            let model_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse model result: {}", e)))?;

            Ok(HttpResponse::Created().json(ApiResponse::success(model_data)))
        },
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Model creation failed: {}", e)))),
    }
}

/// List all available models
async fn list_models(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    match core.list_models().await {
        Ok(result) => {
            let models_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse models result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(models_data)))
        },
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Failed to list models: {}", e)))),
    }
}

/// Get a specific model by ID
async fn get_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    match core.get_model_info(model_id).await {
        Ok(result) => {
            let model_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse model result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(model_data)))
        },
        Err(e) => Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(format!("Model not found: {}", e)))),
    }
}

/// Delete a model by ID
async fn delete_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    match core.delete_model(model_id).await {
        Ok(result) => {
            let delete_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse delete result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(delete_data)))
        },
        Err(e) => Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(format!("Model not found: {}", e)))),
    }
}

/// Perform inference with a model
async fn predict(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
    req: web::Json<PredictRequest>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    let features_json = serde_json::to_string(&req.features)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize features: {}", e)))?;

    match core.predict(model_id, features_json).await {
        Ok(result) => {
            let prediction_data: InferenceResult = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse prediction result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(prediction_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Prediction failed: {}", e)))),
    }
}

/// Train a model
async fn train_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
    req: web::Json<TrainRequest>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    let training_data_json = serde_json::to_string(&req.training_data)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize training data: {}", e)))?;

    match core.train_model(model_id, training_data_json).await {
        Ok(result) => {
            let training_data: TrainingResult = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse training result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(training_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Training failed: {}", e)))),
    }
}

/// Validate a model
async fn validate_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    match core.validate_model(model_id).await {
        Ok(result) => {
            let validation_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse validation result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(validation_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Validation failed: {}", e)))),
    }
}

/// Export a model
async fn export_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    let format = query.get("format").unwrap_or(&"json".to_string()).clone();

    match core.export_model(model_id, format).await {
        Ok(result) => {
            let export_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse export result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(export_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Export failed: {}", e)))),
    }
}

/// Generate AI insights
async fn generate_insights(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    let analysis_config = serde_json::json!({
        "type": query.get("type").unwrap_or(&"comprehensive".to_string()),
        "include_models": query.get("models").map(|m| m.split(',').map(|s| s.to_string()).collect::<Vec<_>>())
    });

    let config_json = serde_json::to_string(&analysis_config)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize config: {}", e)))?;

    match core.generate_insights(config_json).await {
        Ok(result) => {
            let insights_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse insights result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(insights_data)))
        },
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Insights generation failed: {}", e)))),
    }
}

/// Perform trend analysis
async fn trend_analysis(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    req: web::Json<serde_json::Value>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    let data_json = serde_json::to_string(&req)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize data: {}", e)))?;

    let trend_config = serde_json::json!({
        "method": "linear",
        "window_size": 5,
        "forecast_steps": 3
    });

    let config_json = serde_json::to_string(&trend_config)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize config: {}", e)))?;

    match core.trend_analysis(data_json, config_json).await {
        Ok(result) => {
            let trend_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse trend result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(trend_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Trend analysis failed: {}", e)))),
    }
}

/// Perform correlation analysis
async fn correlation_analysis(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    req: web::Json<serde_json::Value>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    let data_json = serde_json::to_string(&req)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize data: {}", e)))?;

    match core.correlation_analysis(data_json).await {
        Ok(result) => {
            let correlation_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse correlation result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(correlation_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Correlation analysis failed: {}", e)))),
    }
}

/// Compare multiple models
async fn compare_models(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    req: web::Json<Vec<String>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    let model_ids_json = serde_json::to_string(&req)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize model IDs: {}", e)))?;

    match core.compare_models(model_ids_json).await {
        Ok(result) => {
            let comparison_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse comparison result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(comparison_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Model comparison failed: {}", e)))),
    }
}

/// Health check endpoint
async fn health_check(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    match core.get_system_health().await {
        Ok(result) => {
            let health_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse health result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(health_data)))
        },
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Health check failed: {}", e)))),
    }
}

/// Get system statistics
async fn system_stats(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;

    match core.get_performance_stats().await {
        Ok(result) => {
            let stats_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse stats result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(stats_data)))
        },
        Err(e) => Ok(HttpResponse::InternalServerError().json(ApiResponse::<()>::error(format!("Stats retrieval failed: {}", e)))),
    }
}

/// Optimize a model
async fn optimize_model(
    ml_core: web::Data<Arc<Mutex<PhantomMLCore>>>,
    path: web::Path<String>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> ActixResult<HttpResponse> {
    let core = ml_core.lock().await;
    let model_id = path.into_inner();

    let optimization_config = serde_json::json!({
        "type": query.get("type").unwrap_or(&"performance".to_string())
    });

    let config_json = serde_json::to_string(&optimization_config)
        .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to serialize config: {}", e)))?;

    match core.optimize_model(model_id, config_json).await {
        Ok(result) => {
            let optimization_data: serde_json::Value = serde_json::from_str(&result)
                .map_err(|e| actix_web::error::ErrorInternalServerError(format!("Failed to parse optimization result: {}", e)))?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(optimization_data)))
        },
        Err(e) => Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(format!("Optimization failed: {}", e)))),
    }
}

/// Convenience function to create and start the server
pub async fn start_ml_api_server(
    ml_core: PhantomMLCore,
    host: Option<String>,
    port: Option<u16>,
) -> std::io::Result<()> {
    let server = MLApiServer::new(
        ml_core,
        host.unwrap_or_else(|| "127.0.0.1".to_string()),
        port.unwrap_or(8080),
    );

    server.start().await
}</content>
<parameter name="filePath">c:\phantom-spire\packages\phantom-ml-core\src\actix_server.rs