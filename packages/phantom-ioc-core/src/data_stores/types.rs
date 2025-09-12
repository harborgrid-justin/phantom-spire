//! Common Types for IOC Data Stores
//!
//! Shared type definitions used across all data store implementations
//! Enhanced with phantom-cve-core architectural patterns

use serde::{Serialize, Deserialize};
use std::collections::HashMap;

/// Tenant context for multi-tenancy support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub permissions: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Data store operation result type
pub type DataStoreResult<T> = Result<T, DataStoreError>;

/// Data store error types
#[derive(Debug, thiserror::Error)]
pub enum DataStoreError {
    #[error("Connection error: {0}")]
    Connection(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Search criteria for IOCs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCSearchCriteria {
    pub ioc_type: Option<String>,
    pub value_pattern: Option<String>,
    pub source: Option<String>,
    pub confidence_min: Option<f64>,
    pub tags: Option<Vec<String>>,
    pub created_after: Option<chrono::DateTime<chrono::Utc>>,
    pub created_before: Option<chrono::DateTime<chrono::Utc>>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Search results with pagination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults<T> {
    pub items: Vec<T>,
    pub total_count: usize,
    pub limit: usize,
    pub offset: usize,
    pub has_more: bool,
}

/// Data store performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreMetrics {
    pub total_operations: u64,
    pub successful_operations: u64,
    pub failed_operations: u64,
    pub average_response_time_ms: f64,
    pub connections_active: u32,
    pub connections_idle: u32,
    pub memory_usage_bytes: u64,
    pub last_health_check: chrono::DateTime<chrono::Utc>,
}

/// Bulk operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkOperationResult {
    pub total_requested: usize,
    pub successful: usize,
    pub failed: usize,
    pub failed_ids: Vec<String>,
    pub processing_time_ms: u64,
}