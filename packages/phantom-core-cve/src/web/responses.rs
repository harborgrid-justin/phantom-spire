//! API Response Structures
//! 
//! Standardized response formats for web API endpoints

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Standard API response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ErrorDetails>,
    pub timestamp: DateTime<Utc>,
    pub request_id: Option<String>,
}

impl<T> ApiResponse<T> {
    /// Create a successful response
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: Utc::now(),
            request_id: None,
        }
    }
    
    /// Create a successful response with request ID
    pub fn success_with_id(data: T, request_id: String) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: Utc::now(),
            request_id: Some(request_id),
        }
    }
    
    /// Create an error response
    pub fn error(error: ErrorDetails) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            timestamp: Utc::now(),
            request_id: None,
        }
    }
    
    /// Create an error response with request ID
    pub fn error_with_id(error: ErrorDetails, request_id: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
            timestamp: Utc::now(),
            request_id: Some(request_id),
        }
    }
}

/// Error response details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorDetails {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
    pub trace_id: Option<String>,
}

/// Predefined error responses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorResponse;

impl ErrorResponse {
    /// Bad request error
    pub fn bad_request(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "BAD_REQUEST".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Not found error
    pub fn not_found(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "NOT_FOUND".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Internal server error
    pub fn internal_error(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "INTERNAL_ERROR".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Validation error
    pub fn validation_error(message: &str, details: serde_json::Value) -> ErrorDetails {
        ErrorDetails {
            code: "VALIDATION_ERROR".to_string(),
            message: message.to_string(),
            details: Some(details),
            trace_id: None,
        }
    }
    
    /// Authentication error
    pub fn auth_error(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "AUTH_ERROR".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Authorization error
    pub fn authorization_error(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "AUTHORIZATION_ERROR".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Rate limit error
    pub fn rate_limit_error(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "RATE_LIMIT_EXCEEDED".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
    
    /// Service unavailable error
    pub fn service_unavailable(message: &str) -> ErrorDetails {
        ErrorDetails {
            code: "SERVICE_UNAVAILABLE".to_string(),
            message: message.to_string(),
            details: None,
            trace_id: None,
        }
    }
}

/// Paginated response wrapper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub pagination: PaginationInfo,
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationInfo {
    pub page: usize,
    pub per_page: usize,
    pub total_items: usize,
    pub total_pages: usize,
    pub has_next: bool,
    pub has_prev: bool,
}

impl PaginationInfo {
    /// Create pagination info
    pub fn new(page: usize, per_page: usize, total_items: usize) -> Self {
        let total_pages = if total_items == 0 {
            0
        } else {
            (total_items + per_page - 1) / per_page
        };
        
        Self {
            page,
            per_page,
            total_items,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1,
        }
    }
}

/// Health check response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
    pub uptime: String,
    pub checks: Vec<HealthCheck>,
}

/// Individual health check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub name: String,
    pub status: String,
    pub message: Option<String>,
    pub duration_ms: u64,
}

/// Metrics response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsResponse {
    pub system: SystemMetrics,
    pub application: ApplicationMetrics,
    pub timestamp: DateTime<Utc>,
}

/// System-level metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub disk_usage: f64,
    pub network_io: NetworkStats,
}

/// Network I/O statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkStats {
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub packets_sent: u64,
    pub packets_received: u64,
}

/// Application-specific metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationMetrics {
    pub requests_total: u64,
    pub requests_per_second: f64,
    pub avg_response_time_ms: f64,
    pub error_rate: f64,
    pub active_connections: usize,
    pub cve_processing: CVEMetrics,
}

/// CVE processing metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CVEMetrics {
    pub processed_total: u64,
    pub processed_per_hour: f64,
    pub processing_errors: u64,
    pub avg_processing_time_ms: f64,
    pub queue_size: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    
    #[test]
    fn test_api_response_success() {
        let response = ApiResponse::success("test data");
        assert!(response.success);
        assert_eq!(response.data, Some("test data"));
        assert!(response.error.is_none());
    }
    
    #[test]
    fn test_api_response_error() {
        let error = ErrorResponse::bad_request("Invalid input");
        let response: ApiResponse<()> = ApiResponse::error(error.clone());
        assert!(!response.success);
        assert!(response.data.is_none());
        assert_eq!(response.error.as_ref().unwrap().code, "BAD_REQUEST");
    }
    
    #[test]
    fn test_pagination_info() {
        let pagination = PaginationInfo::new(2, 10, 25);
        assert_eq!(pagination.page, 2);
        assert_eq!(pagination.per_page, 10);
        assert_eq!(pagination.total_items, 25);
        assert_eq!(pagination.total_pages, 3);
        assert!(pagination.has_prev);
        assert!(pagination.has_next);
    }
}