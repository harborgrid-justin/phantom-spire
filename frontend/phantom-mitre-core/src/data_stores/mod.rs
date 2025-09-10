//! Data Store Modules for MITRE ATT&CK Data Persistence
//! 
//! This module provides comprehensive data store implementations for Redis, PostgreSQL, 
//! MongoDB, and Elasticsearch to support enterprise SaaS deployment of MITRE ATT&CK data.

pub mod redis_store;
pub mod postgres_store;
pub mod mongo_store;
pub mod elasticsearch_store;
pub mod traits;
pub mod config;
pub mod serialization;

// Re-export for convenience
pub use redis_store::*;
pub use postgres_store::*;
pub use mongo_store::*;
pub use elasticsearch_store::*;
pub use traits::*;
pub use config::*;
pub use serialization::*;

use crate::{MitreTechnique, MitreGroup, MitreSoftware, Mitigation, DetectionRule, ThreatAnalysis};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Data store operation result
pub type DataStoreResult<T> = Result<T, DataStoreError>;

/// Data store errors
#[derive(Debug, thiserror::Error)]
pub enum DataStoreError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Query error: {0}")]
    Query(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
    
    #[error("Database error: {0}")]
    Database(String),
}

/// Multi-tenant data context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub organization_id: Option<String>,
    pub permissions: Vec<String>,
}

/// Search criteria for data stores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub query: Option<String>,
    pub filters: HashMap<String, String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
}

/// Sort order enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Ascending,
    Descending,
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: usize,
    pub size: usize,
    pub total: usize,
    pub total_pages: usize,
}

/// Search results with pagination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults<T> {
    pub items: Vec<T>,
    pub pagination: Pagination,
    pub took_ms: u64,
}

/// Data store metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreMetrics {
    pub total_techniques: usize,
    pub total_groups: usize,
    pub total_software: usize,
    pub total_mitigations: usize,
    pub total_detection_rules: usize,
    pub total_analyses: usize,
    pub storage_size_bytes: u64,
    pub last_updated: DateTime<Utc>,
}

/// Bulk operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkOperationResult {
    pub success_count: usize,
    pub error_count: usize,
    pub errors: Vec<String>,
    pub processed_ids: Vec<String>,
}