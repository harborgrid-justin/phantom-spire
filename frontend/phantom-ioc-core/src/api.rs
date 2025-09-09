// phantom-ioc-core/src/api.rs
// REST API interface for IOC processing

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use warp::Filter;
use serde::{Deserialize, Serialize};
use chrono::Utc;

#[derive(Debug, Deserialize, Serialize)]
pub struct APIResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateIOCRequest {
    pub indicator_type: String,
    pub value: String,
    pub confidence: Option<f64>,
    pub severity: Option<String>,
    pub source: Option<String>,
    pub tags: Option<Vec<String>>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub limit: Option<usize>,
    pub indicator_type: Option<String>,
}

pub struct APIEngine {
    ioc_processor: Arc<crate::IOCProcessor>,
    server_handle: Option<tokio::task::JoinHandle<()>>,
}

impl APIEngine {
    pub async fn new(ioc_processor: Arc<crate::IOCProcessor>) -> Result<Self, IOCError> {
        Ok(Self {
            ioc_processor,
            server_handle: None,
        })
    }

    pub async fn start_server(&mut self, port: u16) -> Result<(), IOCError> {
        let ioc_processor = self.ioc_processor.clone();

        // Health check endpoint
        let health = warp::path("health")
            .and(warp::get())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_health);

        // IOC endpoints
        let create_ioc = warp::path("iocs")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_create_ioc);

        let get_ioc = warp::path!("iocs" / String)
            .and(warp::get())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_get_ioc);

        let search_iocs = warp::path("iocs")
            .and(warp::get())
            .and(warp::query::<SearchRequest>())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_search_iocs);

        // Analysis endpoints
        let analyze_ioc = warp::path!("analyze" / String)
            .and(warp::get())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_analyze_ioc);

        // Feed endpoints
        let get_feeds = warp::path("feeds")
            .and(warp::get())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_get_feeds);

        let update_feeds = warp::path("feeds")
            .and(warp::path("update"))
            .and(warp::post())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_update_feeds);

        // Export endpoints
        let export_iocs = warp::path("export")
            .and(warp::post())
            .and(warp::body::json())
            .and(with_processor(ioc_processor.clone()))
            .and_then(Self::handle_export_iocs);

        let routes = health
            .or(create_ioc)
            .or(get_ioc)
            .or(search_iocs)
            .or(analyze_ioc)
            .or(get_feeds)
            .or(update_feeds)
            .or(export_iocs)
            .with(warp::cors().allow_any_origin())
            .with(warp::log("api"));

        let handle = tokio::spawn(async move {
            warp::serve(routes)
                .run(([127, 0, 0, 1], port))
                .await;
        });

        self.server_handle = Some(handle);
        Ok(())
    }

    pub async fn stop_server(&mut self) -> Result<(), IOCError> {
        if let Some(handle) = self.server_handle.take() {
            handle.abort();
        }
        Ok(())
    }

    async fn handle_health(processor: Arc<crate::IOCProcessor>) -> Result<impl warp::Reply, warp::Rejection> {
        let health = processor.get_health().await;
        let response = APIResponse {
            success: matches!(health.status, HealthStatus::Healthy),
            data: Some(health),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        };
        Ok(warp::reply::json(&response))
    }

    async fn handle_create_ioc(
        request: CreateIOCRequest,
        processor: Arc<crate::IOCProcessor>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        // Convert string indicator type to enum
        let indicator_type = match request.indicator_type.as_str() {
            "IP" | "IPAddress" => IndicatorType::IPAddress,
            "Domain" => IndicatorType::Domain,
            "URL" => IndicatorType::URL,
            "Hash" => IndicatorType::Hash,
            "Email" => IndicatorType::Email,
            "FilePath" => IndicatorType::FilePath,
            "RegistryKey" => IndicatorType::RegistryKey,
            "Mutex" => IndicatorType::Mutex,
            "UserAgent" => IndicatorType::UserAgent,
            "Certificate" => IndicatorType::Certificate,
            "ASN" => IndicatorType::ASN,
            "CVE" => IndicatorType::CVE,
            _ => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some("Invalid indicator type".to_string()),
                    timestamp: Utc::now().to_rfc3339(),
                };
                return Ok(warp::reply::json(&response));
            }
        };

        // Convert string severity to enum
        let severity = match request.severity.as_deref() {
            Some("Critical") => Severity::Critical,
            Some("High") => Severity::High,
            Some("Medium") => Severity::Medium,
            Some("Low") => Severity::Low,
            Some("Info") | None => Severity::Low, // Changed from Info to Low since Info doesn't exist
            _ => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some("Invalid severity level".to_string()),
                    timestamp: Utc::now().to_rfc3339(),
                };
                return Ok(warp::reply::json(&response));
            }
        };

        let ioc = IOC {
            id: uuid::Uuid::new_v4(),
            indicator_type,
            value: request.value,
            confidence: request.confidence.unwrap_or(0.5),
            severity,
            source: request.source.unwrap_or_else(|| "API".to_string()),
            timestamp: Utc::now(),
            tags: request.tags.unwrap_or_default(),
            context: IOCContext {
                geolocation: None,
                asn: None,
                category: None,
                first_seen: None,
                last_seen: None,
                related_indicators: vec![],
                metadata: request.metadata.unwrap_or_default(),
            },
            raw_data: None,
        };

        match processor.process_ioc(ioc).await {
            Ok(result) => {
                let response = APIResponse {
                    success: true,
                    data: Some(result),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to process IOC: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_get_ioc(
        ioc_id: String,
        processor: Arc<crate::IOCProcessor>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        match processor.get_ioc(&ioc_id).await {
            Ok(Some(ioc)) => {
                let response = APIResponse {
                    success: true,
                    data: Some(ioc),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Ok(None) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some("IOC not found".to_string()),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to retrieve IOC: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_search_iocs(
        request: SearchRequest,
        processor: Arc<crate::IOCProcessor>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        match processor.search_iocs(&request.query, request.limit.unwrap_or(100)).await {
            Ok(results) => {
                let response = APIResponse {
                    success: true,
                    data: Some(results),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Search failed: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_analyze_ioc(
        ioc_id: String,
        processor: Arc<crate::IOCProcessor>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        match processor.analyze_ioc(&ioc_id).await {
            Ok(analysis) => {
                let response = APIResponse {
                    success: true,
                    data: Some(analysis),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Analysis failed: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_get_feeds(processor: Arc<crate::IOCProcessor>) -> Result<impl warp::Reply, warp::Rejection> {
        match processor.get_feed_status().await {
            Ok(feeds) => {
                let response = APIResponse {
                    success: true,
                    data: Some(feeds),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to get feeds: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_update_feeds(processor: Arc<crate::IOCProcessor>) -> Result<impl warp::Reply, warp::Rejection> {
        match processor.update_feeds().await {
            Ok(result) => {
                let response = APIResponse {
                    success: true,
                    data: Some(result),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Feed update failed: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_export_iocs(
        request: serde_json::Value,
        processor: Arc<crate::IOCProcessor>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        // Simple export request handling - in production, this would be more sophisticated
        let template = request.get("template").and_then(|v| v.as_str()).unwrap_or("json");
        let output_path = format!("/tmp/ioc_export_{}.json", Utc::now().timestamp());

        match processor.export_iocs(template, std::path::Path::new(&output_path)).await {
            Ok(result) => {
                let response = APIResponse {
                    success: true,
                    data: Some(result),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Export failed: {:?}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    pub async fn get_health(&self) -> ComponentHealth {
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: "API engine operational".to_string(),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("server_running".to_string(), if self.server_handle.is_some() { 1.0 } else { 0.0 });
                metrics
            },
        }
    }
}

fn with_processor(
    processor: Arc<crate::IOCProcessor>
) -> impl Filter<Extract = (Arc<crate::IOCProcessor>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || processor.clone())
}
