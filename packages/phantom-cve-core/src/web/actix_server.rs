//! Actix-web Server Implementation
//! 
//! High-performance async web server for CVE processing APIs

#[cfg(feature = "actix-web")]
use actix_web::{
    web, App, HttpServer, HttpResponse, Result as ActixResult,
    middleware::Logger, HttpRequest, Error as ActixError,
};

#[cfg(feature = "actix-web")]
use serde_json::json;

#[cfg(feature = "actix-web")]
use crate::{
    core::CVECore,
    models::{CVE, SearchCriteria},
    web::responses::{ApiResponse, ErrorResponse},
};

#[cfg(feature = "actix-web")]
use std::sync::Arc;

/// Application state shared across handlers
#[cfg(feature = "actix-web")]
pub struct AppState {
    pub cve_core: Arc<CVECore>,
}

/// Start the Actix-web server
#[cfg(feature = "actix-web")]
pub async fn start_server(cve_core: CVECore, bind_address: &str) -> std::io::Result<()> {
    let app_state = web::Data::new(AppState {
        cve_core: Arc::new(cve_core),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(Logger::default())
            .service(
                web::scope("/api/v1")
                    .route("/health", web::get().to(health_check))
                    .route("/cve/{id}", web::get().to(get_cve))
                    .route("/cve", web::post().to(process_cve))
                    .route("/cve/batch", web::post().to(batch_process_cves))
                    .route("/cve/search", web::post().to(search_cves))
                    .route("/exploit/{cve_id}", web::get().to(get_exploit_timeline))
                    .route("/remediation/{cve_id}", web::get().to(get_remediation_strategy))
                    .route("/metrics", web::get().to(get_metrics))
            )
    })
    .bind(bind_address)?
    .run()
    .await
}

/// Health check endpoint
#[cfg(feature = "actix-web")]
async fn health_check() -> ActixResult<HttpResponse> {
    Ok(HttpResponse::Ok().json(ApiResponse::success(json!({
        "status": "healthy",
        "service": "phantom-cve-core",
        "timestamp": chrono::Utc::now()
    }))))
}

/// Get CVE by ID
#[cfg(feature = "actix-web")]
async fn get_cve(
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    let cve_id = path.into_inner();
    
    // For demonstration, we'll return a placeholder response
    // In a real implementation, this would query the data store
    match data.cve_core.data_store.get_cve(&cve_id, &data.cve_core.tenant_context).await {
        Ok(Some(cve)) => Ok(HttpResponse::Ok().json(ApiResponse::success(cve))),
        Ok(None) => Ok(HttpResponse::NotFound().json(ErrorResponse::not_found(&format!("CVE {} not found", cve_id)))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e.to_string()))),
    }
}

/// Process a single CVE
#[cfg(feature = "actix-web")]
async fn process_cve(
    cve: web::Json<CVE>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match data.cve_core.process_cve(cve.into_inner()).await {
        Ok(result) => Ok(HttpResponse::Ok().json(ApiResponse::success(result))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e))),
    }
}

/// Batch process multiple CVEs
#[cfg(feature = "actix-web")]
async fn batch_process_cves(
    cves: web::Json<Vec<CVE>>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match data.cve_core.batch_process_cves(cves.into_inner()).await {
        Ok(results) => Ok(HttpResponse::Ok().json(ApiResponse::success(results))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e))),
    }
}

/// Search CVEs with criteria
#[cfg(feature = "actix-web")]
async fn search_cves(
    criteria: web::Json<SearchCriteria>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match data.cve_core.search_vulnerabilities(criteria.into_inner()).await {
        Ok(results) => Ok(HttpResponse::Ok().json(ApiResponse::success(results))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e))),
    }
}

/// Get exploit timeline for CVE
#[cfg(feature = "actix-web")]
async fn get_exploit_timeline(
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    let cve_id = path.into_inner();
    
    match data.cve_core.get_exploit_timeline(&cve_id).await {
        Ok(timeline) => Ok(HttpResponse::Ok().json(ApiResponse::success(timeline))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e))),
    }
}

/// Get remediation strategy for CVE
#[cfg(feature = "actix-web")]
async fn get_remediation_strategy(
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    let cve_id = path.into_inner();
    
    // First get the CVE, then generate remediation strategy
    match data.cve_core.data_store.get_cve(&cve_id, &data.cve_core.tenant_context).await {
        Ok(Some(cve)) => {
            match data.cve_core.get_remediation_strategy(&cve).await {
                Ok(strategy) => Ok(HttpResponse::Ok().json(ApiResponse::success(strategy))),
                Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e))),
            }
        },
        Ok(None) => Ok(HttpResponse::NotFound().json(ErrorResponse::not_found(&format!("CVE {} not found", cve_id)))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e.to_string()))),
    }
}

/// Get system metrics
#[cfg(feature = "actix-web")]
async fn get_metrics(
    data: web::Data<AppState>,
) -> ActixResult<HttpResponse> {
    match data.cve_core.data_store.get_metrics(&data.cve_core.tenant_context).await {
        Ok(metrics) => Ok(HttpResponse::Ok().json(ApiResponse::success(metrics))),
        Err(e) => Ok(HttpResponse::InternalServerError().json(ErrorResponse::internal_error(&e.to_string()))),
    }
}

/// Configuration for the Actix server
#[cfg(feature = "actix-web")]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActixConfig {
    pub bind_address: String,
    pub workers: usize,
    pub max_connections: usize,
    pub keep_alive: usize,
    pub client_timeout: usize,
    pub client_shutdown: usize,
}

#[cfg(feature = "actix-web")]
impl Default for ActixConfig {
    fn default() -> Self {
        Self {
            bind_address: "127.0.0.1:8080".to_string(),
            workers: num_cpus::get(),
            max_connections: 25000,
            keep_alive: 75,
            client_timeout: 5000,
            client_shutdown: 5000,
        }
    }
}