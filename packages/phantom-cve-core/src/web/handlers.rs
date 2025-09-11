//! HTTP Request Handlers
//! 
//! Shared handler utilities for web frameworks

use crate::{
    core::CVECore,
    models::{CVE, SearchCriteria, VulnerabilityAssessment},
    web::responses::{ApiResponse, ErrorResponse, HealthResponse, HealthCheck, MetricsResponse},
};
use chrono::Utc;
use std::sync::Arc;
use std::time::Instant;

/// CVE handler utilities
pub struct CVEHandlers;

impl CVEHandlers {
    /// Process health check logic
    pub async fn health_check(cve_core: &CVECore) -> Result<HealthResponse, String> {
        let start_time = Instant::now();
        
        // Perform basic health checks
        let mut checks = Vec::new();
        
        // Data store health check
        let ds_start = Instant::now();
        let ds_status = match cve_core.data_store.health_check().await {
            Ok(healthy) => {
                if healthy {
                    ("healthy".to_string(), None)
                } else {
                    ("unhealthy".to_string(), Some("Data store not responding".to_string()))
                }
            },
            Err(e) => ("error".to_string(), Some(e.to_string())),
        };
        
        checks.push(HealthCheck {
            name: "data_store".to_string(),
            status: ds_status.0,
            message: ds_status.1,
            duration_ms: ds_start.elapsed().as_millis() as u64,
        });
        
        // System resource checks (mock implementation)
        checks.push(HealthCheck {
            name: "memory".to_string(),
            status: "healthy".to_string(),
            message: None,
            duration_ms: 1,
        });
        
        checks.push(HealthCheck {
            name: "disk_space".to_string(),
            status: "healthy".to_string(),
            message: None,
            duration_ms: 2,
        });
        
        let overall_status = if checks.iter().all(|c| c.status == "healthy") {
            "healthy"
        } else {
            "unhealthy"
        };
        
        Ok(HealthResponse {
            status: overall_status.to_string(),
            service: "phantom-cve-core".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            uptime: format!("{}ms", start_time.elapsed().as_millis()),
            checks,
        })
    }
    
    /// Validate CVE data before processing
    pub fn validate_cve(cve: &CVE) -> Result<(), String> {
        if cve.id().is_empty() {
            return Err("CVE ID cannot be empty".to_string());
        }
        
        if !cve.id().starts_with("CVE-") {
            return Err("CVE ID must start with 'CVE-'".to_string());
        }
        
        if cve.description().is_empty() {
            return Err("CVE description cannot be empty".to_string());
        }
        
        // Additional validation rules can be added here
        Ok(())
    }
    
    /// Validate search criteria
    pub fn validate_search_criteria(criteria: &SearchCriteria) -> Result<(), String> {
        if let Some(limit) = &criteria.limit {
            if *limit > 1000 {
                return Err("Search limit cannot exceed 1000".to_string());
            }
        }
        
        // Add more validation rules as needed
        Ok(())
    }
    
    /// Transform CVE processing result for API response
    pub fn transform_processing_result(
        result: crate::models::CVEAnalysisResult,
    ) -> serde_json::Value {
        serde_json::json!({
            "cve": result.cve,
            "assessment": result.assessment,
            "processing_timestamp": result.processing_timestamp,
            "related_cves": result.related_cves,
            "threat_actors": result.threat_actors,
            "campaigns": result.campaigns,
        })
    }
    
    /// Generate request ID for tracing
    pub fn generate_request_id() -> String {
        uuid::Uuid::new_v4().to_string()
    }
    
    /// Log request information
    pub fn log_request(method: &str, path: &str, request_id: &str) {
        println!("[{}] {} {} - ID: {}", 
                Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
                method, 
                path, 
                request_id);
    }
    
    /// Extract pagination parameters from query
    pub fn extract_pagination(query: &serde_json::Value) -> (usize, usize) {
        let page = query.get("page")
            .and_then(|v| v.as_u64())
            .map(|v| v as usize)
            .unwrap_or(1);
            
        let per_page = query.get("per_page")
            .and_then(|v| v.as_u64())
            .map(|v| v as usize)
            .unwrap_or(20)
            .min(100); // Cap at 100 items per page
            
        (page, per_page)
    }
}

/// Error handler utilities
pub struct ErrorHandlers;

impl ErrorHandlers {
    /// Handle validation errors
    pub fn handle_validation_error(error: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::validation_error(
            error,
            serde_json::json!({"field_errors": []})
        ))
    }
    
    /// Handle didn't find errors
    pub fn handle_not_found(resource: &str, id: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::not_found(
            &format!("{} with ID '{}' not found", resource, id)
        ))
    }
    
    /// Handle internal server errors
    pub fn handle_internal_error(error: &str) -> ApiResponse<()> {
        // Log the error for debugging (in production, use proper logging)
        eprintln!("Internal error: {}", error);
        
        ApiResponse::error(ErrorResponse::internal_error(
            "An internal server error occurred"
        ))
    }
    
    /// Handle authentication errors
    pub fn handle_auth_error(message: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::auth_error(message))
    }
    
    /// Handle authorization errors
    pub fn handle_authorization_error(message: &str) -> ApiResponse<()> {
        ApiResponse::error(ErrorResponse::authorization_error(message))
    }
}

/// Utility functions for request processing
pub struct RequestUtils;

impl RequestUtils {
    /// Extract tenant context from request headers
    pub fn extract_tenant_from_headers(headers: &std::collections::HashMap<String, String>) -> String {
        headers.get("x-tenant-id")
            .cloned()
            .unwrap_or_else(|| "default".to_string())
    }
    
    /// Extract user context from request headers
    pub fn extract_user_from_headers(headers: &std::collections::HashMap<String, String>) -> Option<String> {
        headers.get("x-user-id").cloned()
    }
    
    /// Validate API key from headers
    pub fn validate_api_key(headers: &std::collections::HashMap<String, String>) -> bool {
        // Mock implementation - in production, validate against a proper auth system
        headers.get("x-api-key").is_some()
    }
    
    /// Rate limiting check (mock implementation)
    pub fn check_rate_limit(client_id: &str) -> bool {
        // In production, implement proper rate limiting with Redis or similar
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{CVE, CVSSMetrics, CVSSSeverity};
    
    #[test]
    fn test_cve_validation() {
        let mut cve = CVE::new(
            "CVE-2024-0001".to_string(),
            "Test vulnerability".to_string(),
            Some(CVSSMetrics {
                base_score: 7.5,
                severity: CVSSSeverity::High,
                attack_vector: crate::models::CVSSAttackVector::Network,
                attack_complexity: crate::models::CVSSAttackComplexity::Low,
                privileges_required: crate::models::CVSSPrivilegesRequired::None,
                user_interaction: crate::models::CVSSUserInteraction::None,
                scope: crate::models::CVSSScope::Unchanged,
                confidentiality_impact: crate::models::CVSSImpact::High,
                integrity_impact: crate::models::CVSSImpact::None,
                availability_impact: crate::models::CVSSImpact::None,
                temporal_score: None,
                environmental_score: None,
            }),
        );
        
        assert!(CVEHandlers::validate_cve(&cve).is_ok());
        
        // Test empty ID
        cve = CVE::new("".to_string(), "Test".to_string(), None);
        assert!(CVEHandlers::validate_cve(&cve).is_err());
    }
    
    #[test]
    fn test_search_criteria_validation() {
        let mut criteria = SearchCriteria::new();
        criteria.limit = Some(500);
        assert!(CVEHandlers::validate_search_criteria(&criteria).is_ok());
        
        criteria.limit = Some(2000);
        assert!(CVEHandlers::validate_search_criteria(&criteria).is_err());
    }
    
    #[test]
    fn test_pagination_extraction() {
        let query = serde_json::json!({
            "page": 2,
            "per_page": 50
        });
        
        let (page, per_page) = CVEHandlers::extract_pagination(&query);
        assert_eq!(page, 2);
        assert_eq!(per_page, 50);
    }
}