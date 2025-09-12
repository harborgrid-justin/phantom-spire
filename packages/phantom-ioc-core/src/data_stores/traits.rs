//! Data Store Traits for IOC Core
//! 
//! Common interface definitions for all IOC data store implementations
//! Enhanced architecture based on phantom-cve-core patterns

use async_trait::async_trait;
use crate::models::{IOC, IOCResult, EnrichedIOC, Correlation};
use uuid::Uuid;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

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

/// Core IOC data store operations trait
#[async_trait]
pub trait IOCDataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> DataStoreResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> DataStoreResult<()>;
    
    /// Health check for the data store
    async fn health_check(&self) -> DataStoreResult<bool>;
    
    /// Get data store metrics
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics>;
}

/// IOC storage operations
#[async_trait]
pub trait IOCStore: Send + Sync {
    /// Store an IOC
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an IOC by ID
    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>>;
    
    /// Update an IOC
    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete an IOC
    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search IOCs
    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>>;
    
    /// Bulk store IOCs
    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// List all IOC IDs for a tenant
    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>>;
}

/// IOC result storage operations
#[async_trait]
pub trait IOCResultStore: Send + Sync {
    /// Store an IOC processing result
    async fn store_result(&self, result: &IOCResult, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an IOC result by IOC ID
    async fn get_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOCResult>>;
    
    /// Delete an IOC result
    async fn delete_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search IOC results
    async fn search_results(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOCResult>>;
}

/// Enriched IOC storage operations
#[async_trait]
pub trait EnrichedIOCStore: Send + Sync {
    /// Store an enriched IOC
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an enriched IOC by IOC ID
    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>>;
    
    /// Delete an enriched IOC
    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search enriched IOCs
    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>>;
}

/// Correlation storage operations
#[async_trait]
pub trait CorrelationStore: Send + Sync {
    /// Store correlations
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// Get correlations by IOC ID
    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>>;
    
    /// Delete correlations by IOC ID
    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search correlations
    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>>;
}

/// Comprehensive IOC data store trait combining all operations
#[async_trait]
pub trait ComprehensiveIOCStore: 
    IOCDataStore + 
    IOCStore + 
    IOCResultStore + 
    EnrichedIOCStore + 
    CorrelationStore 
{
    /// Get the data store type identifier
    fn store_type(&self) -> &'static str;
    
    /// Check if multi-tenancy is supported
    fn supports_multi_tenancy(&self) -> bool;
    
    /// Check if full-text search is supported
    fn supports_full_text_search(&self) -> bool;
    
    /// Check if transactions are supported
    fn supports_transactions(&self) -> bool;
    
    /// Check if bulk operations are supported
    fn supports_bulk_operations(&self) -> bool;
    
    /// Get maximum batch size for bulk operations
    fn max_batch_size(&self) -> usize;
}

/// Data store factory trait for creating store instances
#[async_trait]
pub trait IOCDataStoreFactory: Send + Sync {
    type Store: ComprehensiveIOCStore;
    
    /// Create a new data store instance
    async fn create_store(&self, config: &HashMap<String, String>) -> DataStoreResult<Self::Store>;
    
    /// Validate configuration
    fn validate_config(&self, config: &HashMap<String, String>) -> DataStoreResult<()>;
    
    /// Get required configuration keys
    fn required_config_keys(&self) -> Vec<&'static str>;
}