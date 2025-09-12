//! Web API module for phantom-threat-actor-core
//!
//! This module provides REST API endpoints for threat actor analysis
//! using the actix-web framework.

#[cfg(feature = "web-api")]
use actix_web::{web, App, HttpServer, HttpResponse, Result as ActixResult};
#[cfg(feature = "web-api")]
use actix_cors::Cors;
#[cfg(feature = "web-api")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "web-api")]
use std::sync::Arc;
#[cfg(feature = "web-api")]
use tokio::sync::Mutex;

#[cfg(feature = "web-api")]
use crate::behavioral_patterns::BehavioralPatternsModule;
#[cfg(feature = "web-api")]
use crate::geographic_analysis::GeographicAnalysisModule;
#[cfg(feature = "web-api")]
use crate::incident_response::IncidentResponseModule;
#[cfg(feature = "web-api")]
use crate::intelligence_sharing::IntelligenceSharingModule;
#[cfg(feature = "web-api")]
use crate::realtime_alerts::RealtimeAlertsModule;
#[cfg(feature = "web-api")]
use crate::risk_assessment::RiskAssessmentModule;
#[cfg(feature = "web-api")]
use crate::threat_hunting::ThreatHuntingModule;

/// API request/response types
#[cfg(feature = "web-api")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[cfg(feature = "web-api")]
impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: chrono::Utc::now(),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
            timestamp: chrono::Utc::now(),
        }
    }
}

/// Threat actor analysis request
#[cfg(feature = "web-api")]
#[derive(Debug, Serialize, Deserialize)]
pub struct ThreatAnalysisRequest {
    pub target: String,
    pub analysis_type: String,
    pub parameters: Option<serde_json::Value>,
}

/// Web API server state
#[cfg(feature = "web-api")]
pub struct ApiState {
    pub behavioral_module: Arc<Mutex<BehavioralPatternsModule>>,
    pub geographic_module: Arc<Mutex<GeographicAnalysisModule>>,
    pub incident_module: Arc<Mutex<IncidentResponseModule>>,
    pub intelligence_module: Arc<Mutex<IntelligenceSharingModule>>,
    pub alerts_module: Arc<Mutex<RealtimeAlertsModule>>,
    pub risk_module: Arc<Mutex<RiskAssessmentModule>>,
    pub hunting_module: Arc<Mutex<ThreatHuntingModule>>,
}

/// Create API state with initialized modules
#[cfg(feature = "web-api")]
pub async fn create_api_state() -> Result<ApiState, Box<dyn std::error::Error>> {
    Ok(ApiState {
        behavioral_module: Arc::new(Mutex::new(BehavioralPatternsModule::new().await?)),
        geographic_module: Arc::new(Mutex::new(GeographicAnalysisModule::new().await?)),
        incident_module: Arc::new(Mutex::new(IncidentResponseModule::new().await?)),
        intelligence_module: Arc::new(Mutex::new(IntelligenceSharingModule::new().await?)),
        alerts_module: Arc::new(Mutex::new(RealtimeAlertsModule::new().await?)),
        risk_module: Arc::new(Mutex::new(RiskAssessmentModule::new().await?)),
        hunting_module: Arc::new(Mutex::new(ThreatHuntingModule::new().await?)),
    })
}

/// Health check endpoint
#[cfg(feature = "web-api")]
async fn health_check() -> ActixResult<HttpResponse> {
    let response = ApiResponse::<String>::success("API is healthy".to_string());
    Ok(HttpResponse::Ok().json(response))
}

/// Analyze threat endpoint
#[cfg(feature = "web-api")]
async fn analyze_threat(
    request: web::Json<ThreatAnalysisRequest>,
    state: web::Data<ApiState>,
) -> ActixResult<HttpResponse> {
    let result = match request.analysis_type.as_str() {
        "behavioral" => {
            let mut module = state.behavioral_module.lock().await;
            match module.analyze_behavioral_patterns(&request.target).await {
                Ok(patterns) => ApiResponse::success(serde_json::json!({
                    "analysis_type": "behavioral",
                    "target": request.target,
                    "patterns_found": patterns.len(),
                    "patterns": patterns
                })),
                Err(e) => ApiResponse::error(format!("Behavioral analysis failed: {}", e)),
            }
        },
        "geographic" => {
            let mut module = state.geographic_module.lock().await;
            match module.analyze_geographic_distribution(&request.target).await {
                Ok(analysis) => ApiResponse::success(serde_json::json!({
                    "analysis_type": "geographic",
                    "target": request.target,
                    "analysis": analysis
                })),
                Err(e) => ApiResponse::error(format!("Geographic analysis failed: {}", e)),
            }
        },
        "risk" => {
            let mut module = state.risk_module.lock().await;
            match module.assess_risk(&request.target).await {
                Ok(assessment) => ApiResponse::success(serde_json::json!({
                    "analysis_type": "risk",
                    "target": request.target,
                    "assessment": assessment
                })),
                Err(e) => ApiResponse::error(format!("Risk assessment failed: {}", e)),
            }
        },
        "intelligence" => {
            let mut module = state.intelligence_module.lock().await;
            match module.search_intelligence(&request.target).await {
                Ok(reports) => ApiResponse::success(serde_json::json!({
                    "analysis_type": "intelligence",
                    "target": request.target,
                    "reports_found": reports.len(),
                    "reports": reports
                })),
                Err(e) => ApiResponse::error(format!("Intelligence search failed: {}", e)),
            }
        },
        _ => ApiResponse::error(format!("Unknown analysis type: {}", request.analysis_type)),
    };

    Ok(HttpResponse::Ok().json(result))
}

/// Get alerts endpoint
#[cfg(feature = "web-api")]
async fn get_alerts(state: web::Data<ApiState>) -> ActixResult<HttpResponse> {
    let mut module = state.alerts_module.lock().await;
    match module.get_active_alerts().await {
        Ok(alerts) => {
            let response = ApiResponse::success(serde_json::json!({
                "alerts_count": alerts.len(),
                "alerts": alerts
            }));
            Ok(HttpResponse::Ok().json(response))
        },
        Err(e) => {
            let response = ApiResponse::<()>::error(format!("Failed to get alerts: {}", e));
            Ok(HttpResponse::InternalServerError().json(response))
        },
    }
}

/// Get incidents endpoint
#[cfg(feature = "web-api")]
async fn get_incidents(state: web::Data<ApiState>) -> ActixResult<HttpResponse> {
    let mut module = state.incident_module.lock().await;
    match module.get_active_incidents().await {
        Ok(incidents) => {
            let response = ApiResponse::success(serde_json::json!({
                "incidents_count": incidents.len(),
                "incidents": incidents
            }));
            Ok(HttpResponse::Ok().json(response))
        },
        Err(e) => {
            let response = ApiResponse::<()>::error(format!("Failed to get incidents: {}", e));
            Ok(HttpResponse::InternalServerError().json(response))
        },
    }
}

/// Threat hunting endpoint
#[cfg(feature = "web-api")]
async fn threat_hunt(
    query: web::Query<std::collections::HashMap<String, String>>,
    state: web::Data<ApiState>,
) -> ActixResult<HttpResponse> {
    let hunt_type = query.get("type").unwrap_or(&"comprehensive".to_string()).clone();

    let mut module = state.hunting_module.lock().await;
    match module.perform_threat_hunt(&hunt_type).await {
        Ok(results) => {
            let response = ApiResponse::success(serde_json::json!({
                "hunt_type": hunt_type,
                "results_count": results.len(),
                "results": results
            }));
            Ok(HttpResponse::Ok().json(response))
        },
        Err(e) => {
            let response = ApiResponse::<()>::error(format!("Threat hunt failed: {}", e));
            Ok(HttpResponse::InternalServerError().json(response))
        },
    }
}

/// Configure API routes
#[cfg(feature = "web-api")]
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route("/health", web::get().to(health_check))
            .route("/analyze", web::post().to(analyze_threat))
            .route("/alerts", web::get().to(get_alerts))
            .route("/incidents", web::get().to(get_incidents))
            .route("/threat-hunt", web::get().to(threat_hunt))
    );
}

/// Start the web API server
#[cfg(feature = "web-api")]
pub async fn start_server(
    host: &str,
    port: u16,
    state: web::Data<ApiState>,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("Starting Phantom Threat Actor API server on {}:{}", host, port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(state.clone())
            .configure(configure_routes)
            .service(
                web::scope("/api")
                    .route("/status", web::get().to(|| async {
                        HttpResponse::Ok().json(serde_json::json!({
                            "service": "Phantom Threat Actor Core API",
                            "version": env!("CARGO_PKG_VERSION"),
                            "status": "running"
                        }))
                    }))
            )
    })
    .bind((host, port))?
    .run()
    .await?;

    Ok(())
}

/// API client for interacting with the threat actor analysis API
#[cfg(feature = "web-api")]
pub struct ApiClient {
    client: reqwest::Client,
    base_url: String,
}

#[cfg(feature = "web-api")]
impl ApiClient {
    /// Create a new API client
    pub fn new(base_url: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url,
        }
    }

    /// Health check
    pub async fn health_check(&self) -> Result<ApiResponse<String>, Box<dyn std::error::Error>> {
        let url = format!("{}/api/v1/health", self.base_url);
        let response = self.client.get(&url).send().await?;
        let result: ApiResponse<String> = response.json().await?;
        Ok(result)
    }

    /// Analyze threat
    pub async fn analyze_threat(
        &self,
        target: &str,
        analysis_type: &str,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn std::error::Error>> {
        let url = format!("{}/api/v1/analyze", self.base_url);
        let request = ThreatAnalysisRequest {
            target: target.to_string(),
            analysis_type: analysis_type.to_string(),
            parameters: None,
        };

        let response = self.client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        let result: ApiResponse<serde_json::Value> = response.json().await?;
        Ok(result)
    }

    /// Get alerts
    pub async fn get_alerts(&self) -> Result<ApiResponse<serde_json::Value>, Box<dyn std::error::Error>> {
        let url = format!("{}/api/v1/alerts", self.base_url);
        let response = self.client.get(&url).send().await?;
        let result: ApiResponse<serde_json::Value> = response.json().await?;
        Ok(result)
    }
}

#[cfg(not(feature = "web-api"))]
/// Stub implementation when web-api feature is not enabled
pub async fn start_server(
    _host: &str,
    _port: u16,
    _state: (),
) -> Result<(), Box<dyn std::error::Error>> {
    Err("Web API feature not enabled. Use --features web-api to enable.".into())
}

#[cfg(not(feature = "web-api"))]
/// Stub implementation when web-api feature is not enabled
pub async fn create_api_state() -> Result<(), Box<dyn std::error::Error>> {
    Err("Web API feature not enabled. Use --features web-api to enable.".into())
}