// phantom-ioc-core/src/api.rs
// REST API interface for IOC processing and business modules

use crate::types::*;
use crate::modules::*;
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
    // Business module managers
    alert_manager: Arc<RwLock<AlertManager>>,
    compliance_manager: Arc<RwLock<ComplianceManager>>,
    dashboard_analytics: Arc<RwLock<DashboardAnalytics>>,
    incident_manager: Arc<RwLock<IncidentResponseManager>>,
    threat_hunter: Arc<RwLock<ThreatHunter>>,
    asset_manager: Arc<RwLock<AssetManager>>,
    user_activity_monitor: Arc<RwLock<UserActivityMonitor>>,
    network_security: Arc<RwLock<NetworkSecurityMonitor>>,
    forensics_manager: Arc<RwLock<ForensicsManager>>,
    risk_assessor: Arc<RwLock<RiskAssessor>>,
    report_generator: Arc<RwLock<ReportGenerator>>,
    integration_manager: Arc<RwLock<IntegrationManager>>,
    server_handle: Option<tokio::task::JoinHandle<()>>,
}

impl APIEngine {
    pub async fn new(ioc_processor: Arc<crate::IOCProcessor>) -> Result<Self, IOCError> {
        Ok(Self {
            ioc_processor,
            alert_manager: Arc::new(RwLock::new(AlertManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create alert manager: {}", e)))?)),
            compliance_manager: Arc::new(RwLock::new(ComplianceManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create compliance manager: {}", e)))?)),
            dashboard_analytics: Arc::new(RwLock::new(DashboardAnalytics::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create dashboard analytics: {}", e)))?)),
            incident_manager: Arc::new(RwLock::new(IncidentResponseManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create incident manager: {}", e)))?)),
            threat_hunter: Arc::new(RwLock::new(ThreatHunter::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create threat hunter: {}", e)))?)),
            asset_manager: Arc::new(RwLock::new(AssetManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create asset manager: {}", e)))?)),
            user_activity_monitor: Arc::new(RwLock::new(UserActivityMonitor::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create user activity monitor: {}", e)))?)),
            network_security: Arc::new(RwLock::new(NetworkSecurityMonitor::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create network security monitor: {}", e)))?)),
            forensics_manager: Arc::new(RwLock::new(ForensicsManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create forensics manager: {}", e)))?)),
            risk_assessor: Arc::new(RwLock::new(RiskAssessor::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create risk assessor: {}", e)))?)),
            report_generator: Arc::new(RwLock::new(ReportGenerator::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create report generator: {}", e)))?)),
            integration_manager: Arc::new(RwLock::new(IntegrationManager::new().map_err(|e| IOCError::ProcessingError(format!("Failed to create integration manager: {}", e)))?)),
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

    // Business Module API Endpoints
    
    // Alert Management
    async fn handle_create_alert(
        request: serde_json::Value,
        alert_manager: Arc<RwLock<AlertManager>>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        let mut manager = alert_manager.write().await;
        match manager.create_alert(request.to_string()) {
            Ok(alert_id) => {
                let response = APIResponse {
                    success: true,
                    data: Some(alert_id),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to create alert: {}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    async fn handle_get_alert_metrics(
        alert_manager: Arc<RwLock<AlertManager>>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        let manager = alert_manager.read().await;
        match manager.get_alert_metrics() {
            Ok(metrics_json) => {
                let response = APIResponse {
                    success: true,
                    data: Some(serde_json::from_str::<serde_json::Value>(&metrics_json).unwrap()),
                    error: None,
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let response = APIResponse::<()> {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to get alert metrics: {}", e)),
                    timestamp: Utc::now().to_rfc3339(),
                };
                Ok(warp::reply::json(&response))
            }
        }
    }

    // Comprehensive Health Check for All Business Modules
    async fn handle_comprehensive_health(
        alert_manager: Arc<RwLock<AlertManager>>,
        compliance_manager: Arc<RwLock<ComplianceManager>>,
        dashboard_analytics: Arc<RwLock<DashboardAnalytics>>,
        incident_manager: Arc<RwLock<IncidentResponseManager>>,
        threat_hunter: Arc<RwLock<ThreatHunter>>,
        asset_manager: Arc<RwLock<AssetManager>>,
        user_activity_monitor: Arc<RwLock<UserActivityMonitor>>,
        network_security: Arc<RwLock<NetworkSecurityMonitor>>,
        forensics_manager: Arc<RwLock<ForensicsManager>>,
        risk_assessor: Arc<RwLock<RiskAssessor>>,
        report_generator: Arc<RwLock<ReportGenerator>>,
        integration_manager: Arc<RwLock<IntegrationManager>>
    ) -> Result<impl warp::Reply, warp::Rejection> {
        let mut health_status = HashMap::new();
        
        // Check all 12 business modules
        if let Ok(result) = alert_manager.read().await.health_check() {
            health_status.insert("alert_management".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = compliance_manager.read().await.health_check() {
            health_status.insert("compliance".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = dashboard_analytics.read().await.health_check() {
            health_status.insert("dashboard_analytics".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = incident_manager.read().await.health_check() {
            health_status.insert("incident_response".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = threat_hunter.read().await.health_check() {
            health_status.insert("threat_hunting".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = asset_manager.read().await.health_check() {
            health_status.insert("asset_management".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = user_activity_monitor.read().await.health_check() {
            health_status.insert("user_activity".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = network_security.read().await.health_check() {
            health_status.insert("network_security".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = forensics_manager.read().await.health_check() {
            health_status.insert("forensics".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = risk_assessor.read().await.health_check() {
            health_status.insert("risk_assessment".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = report_generator.read().await.health_check() {
            health_status.insert("reporting".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        if let Ok(result) = integration_manager.read().await.health_check() {
            health_status.insert("integration".to_string(), serde_json::from_str::<serde_json::Value>(&result).unwrap());
        }
        
        let response = APIResponse {
            success: true,
            data: Some(health_status),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        };
        
        Ok(warp::reply::json(&response))
    }
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
