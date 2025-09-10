//! Unified Data Layer Interface - Native Implementation for phantom-secop-core
//! 
//! Common interface for all phantom-*-core plugins to enable interoperability
//! This module provides a unified interface that all data store implementations can adopt

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Unified result type for all data operations
pub type UnifiedResult<T> = Result<T, UnifiedDataError>;

/// Common error types across all data stores
#[derive(Debug, thiserror::Error)]
pub enum UnifiedDataError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Query error: {0}")]
    Query(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Configuration error: {0}")]
    Configuration(String),
}

/// Universal data record that can represent any type of threat intelligence data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniversalDataRecord {
    pub id: String,
    pub record_type: String, // "ioc", "technique", "incident", etc.
    pub source_plugin: String, // "phantom-ioc-core", "phantom-mitre-core", etc.
    pub data: serde_json::Value, // Raw data in JSON format
    pub metadata: HashMap<String, serde_json::Value>,
    pub relationships: Vec<DataRelationship>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tenant_id: Option<String>,
}

/// Represents relationships between data records
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRelationship {
    pub id: String,
    pub relationship_type: String, // "uses", "targets", "mitigates", etc.
    pub source_id: String,
    pub target_id: String,
    pub confidence: Option<f64>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

/// Query context for multi-tenant and permission-aware operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQueryContext {
    pub tenant_id: Option<String>,
    pub user_id: Option<String>,
    pub permissions: Vec<String>,
    pub filters: HashMap<String, serde_json::Value>,
    pub include_relationships: bool,
}

/// Search query for unified data operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQuery {
    pub record_types: Option<Vec<String>>, // Filter by record types
    pub source_plugins: Option<Vec<String>>, // Filter by source plugins
    pub text_query: Option<String>, // Full-text search
    pub filters: HashMap<String, serde_json::Value>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_by: Option<String>,
    pub sort_desc: bool,
    pub time_range: Option<TimeRange>,
}

/// Time range for temporal queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Query result with pagination and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQueryResult {
    pub records: Vec<UniversalDataRecord>,
    pub relationships: Vec<DataRelationship>,
    pub total_count: Option<usize>,
    pub query_time_ms: u64,
    pub pagination: Option<PaginationInfo>,
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationInfo {
    pub page: usize,
    pub size: usize,
    pub total_pages: usize,
}

/// Health status for unified data stores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedHealthStatus {
    pub healthy: bool,
    pub response_time_ms: u64,
    pub message: Option<String>,
    pub capabilities: Vec<String>,
    pub metrics: HashMap<String, serde_json::Value>,
    pub last_check: DateTime<Utc>,
}

/// Unified data store trait that all plugins can implement
#[async_trait]
pub trait UnifiedDataStore: Send + Sync {
    /// Get the store identifier
    fn store_id(&self) -> &str;
    
    /// Get supported capabilities
    fn capabilities(&self) -> Vec<String>;
    
    /// Initialize the data store
    async fn initialize(&mut self) -> UnifiedResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> UnifiedResult<()>;
    
    /// Health check
    async fn health_check(&self) -> UnifiedResult<UnifiedHealthStatus>;
    
    /// Store a universal data record
    async fn store_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<String>;
    
    /// Get a record by ID
    async fn get_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>>;
    
    /// Update an existing record
    async fn update_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<()>;
    
    /// Delete a record
    async fn delete_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<()>;
    
    /// Query records
    async fn query_records(&self, query: &UnifiedQuery, context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult>;
    
    /// Store a relationship between records
    async fn store_relationship(&self, relationship: &DataRelationship, context: &UnifiedQueryContext) -> UnifiedResult<String>;
    
    /// Get relationships for a record
    async fn get_relationships(&self, record_id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>>;
    
    /// Bulk operations for efficiency
    async fn bulk_store_records(&self, records: &[UniversalDataRecord], context: &UnifiedQueryContext) -> UnifiedResult<BulkOperationResult>;
}

/// Result of bulk operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkOperationResult {
    pub success_count: usize,
    pub error_count: usize,
    pub errors: Vec<String>,
    pub processed_ids: Vec<String>,
    pub operation_time_ms: u64,
}