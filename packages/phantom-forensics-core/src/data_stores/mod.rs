//! Data Store Module
//! 
//! Comprehensive data storage abstraction layer for forensic evidence and investigation data
//! Supports Redis, PostgreSQL, MongoDB, and Elasticsearch

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::fmt;
use chrono::{DateTime, Utc};

// Re-export all data store implementations and utilities
pub mod config;
pub mod traits;
pub mod serialization;
pub mod redis_store;

// Re-export commonly used types
pub use config::*;
pub use traits::*;
pub use serialization::{TenantData, DataSerializer, DataTransformer};
pub use redis_store::RedisDataStore;

/// Result type for data store operations
pub type DataStoreResult<T> = Result<T, DataStoreError>;

/// Data store error types
#[derive(Debug, Clone)]
pub enum DataStoreError {
    /// Connection errors
    Connection(String),
    /// Database operation errors
    Database(String),
    /// Serialization/deserialization errors
    Serialization(String),
    /// Configuration errors
    Configuration(String),
    /// Authentication/authorization errors
    Authentication(String),
    /// Tenant-specific errors
    TenantError(String),
    /// Chain of custody errors
    ChainOfCustody(String),
    /// Evidence integrity errors
    EvidenceIntegrity(String),
    /// Generic internal errors
    Internal(String),
}

impl fmt::Display for DataStoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DataStoreError::Connection(msg) => write!(f, "Connection error: {}", msg),
            DataStoreError::Database(msg) => write!(f, "Database error: {}", msg),
            DataStoreError::Serialization(msg) => write!(f, "Serialization error: {}", msg),
            DataStoreError::Configuration(msg) => write!(f, "Configuration error: {}", msg),
            DataStoreError::Authentication(msg) => write!(f, "Authentication error: {}", msg),
            DataStoreError::TenantError(msg) => write!(f, "Tenant error: {}", msg),
            DataStoreError::ChainOfCustody(msg) => write!(f, "Chain of custody error: {}", msg),
            DataStoreError::EvidenceIntegrity(msg) => write!(f, "Evidence integrity error: {}", msg),
            DataStoreError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for DataStoreError {}

/// Tenant context for multi-tenancy support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: String,
    pub investigator_id: Option<String>,
    pub case_id: Option<String>,
    pub organization_id: Option<String>,
    pub permissions: Vec<String>,
    pub clearance_level: Option<String>,
}

impl TenantContext {
    pub fn new(tenant_id: String) -> Self {
        Self {
            tenant_id,
            investigator_id: None,
            case_id: None,
            organization_id: None,
            permissions: vec![],
            clearance_level: None,
        }
    }
    
    pub fn with_investigator(mut self, investigator_id: String) -> Self {
        self.investigator_id = Some(investigator_id);
        self
    }
    
    pub fn with_case(mut self, case_id: String) -> Self {
        self.case_id = Some(case_id);
        self
    }
    
    pub fn with_organization(mut self, org_id: String) -> Self {
        self.organization_id = Some(org_id);
        self
    }
    
    pub fn with_permissions(mut self, permissions: Vec<String>) -> Self {
        self.permissions = permissions;
        self
    }
    
    pub fn with_clearance(mut self, clearance_level: String) -> Self {
        self.clearance_level = Some(clearance_level);
        self
    }
}

/// Search results with pagination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults<T> {
    pub items: Vec<T>,
    pub pagination: Pagination,
    pub took_ms: u64,
    pub total_evidence_count: Option<usize>,
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: usize,
    pub size: usize,
    pub total: usize,
    pub total_pages: usize,
}

/// Data store metrics for forensic investigations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreMetrics {
    pub total_evidence: usize,
    pub total_timelines: usize,
    pub total_cases: usize,
    pub storage_size_bytes: u64,
    pub integrity_checks_passed: usize,
    pub integrity_checks_failed: usize,
    pub last_updated: DateTime<Utc>,
}

/// Bulk operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkOperationResult {
    pub success_count: usize,
    pub error_count: usize,
    pub errors: Vec<String>,
    pub processed_ids: Vec<String>,
    pub integrity_verified: usize,
}

/// Sort order for search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// Evidence search criteria
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceSearchCriteria {
    pub evidence_types: Vec<String>,
    pub case_id: Option<String>,
    pub date_from: Option<DateTime<Utc>>,
    pub date_to: Option<DateTime<Utc>>,
    pub hash: Option<String>,
    pub source_contains: Option<String>,
    pub metadata_filters: std::collections::HashMap<String, String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_field: Option<String>,
    pub sort_order: Option<SortOrder>,
}

impl Default for EvidenceSearchCriteria {
    fn default() -> Self {
        Self {
            evidence_types: vec![],
            case_id: None,
            date_from: None,
            date_to: None,
            hash: None,
            source_contains: None,
            metadata_filters: std::collections::HashMap::new(),
            limit: Some(100),
            offset: Some(0),
            sort_field: Some("timestamp".to_string()),
            sort_order: Some(SortOrder::Desc),
        }
    }
}

/// Data store factory for creating appropriate store instances
pub struct DataStoreFactory;

impl DataStoreFactory {
    /// Create a data store instance based on configuration
    pub fn create_store(config: &DataStoreConfig) -> DataStoreResult<Box<dyn ComprehensiveForensicStore + Send + Sync>> {
        match config.default_store {
            DataStoreType::Redis => {
                let redis_config = config.redis.as_ref()
                    .ok_or_else(|| DataStoreError::Configuration("Redis configuration not found".to_string()))?;
                Ok(Box::new(RedisDataStore::new(redis_config.clone())))
            }
            DataStoreType::PostgreSQL => {
                Err(DataStoreError::Configuration("PostgreSQL store not implemented yet".to_string()))
            }
            DataStoreType::MongoDB => {
                Err(DataStoreError::Configuration("MongoDB store not implemented yet".to_string()))
            }
            DataStoreType::Elasticsearch => {
                Err(DataStoreError::Configuration("Elasticsearch store not implemented yet".to_string()))
            }
        }
    }
    
    /// Create store from environment variables
    pub fn from_env() -> DataStoreResult<Box<dyn ComprehensiveForensicStore + Send + Sync>> {
        let config = DataStoreConfig::from_env();
        config.validate().map_err(|e| DataStoreError::Configuration(e))?;
        Self::create_store(&config)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_tenant_context_creation() {
        let context = TenantContext::new("test_case".to_string())
            .with_investigator("investigator1".to_string())
            .with_case("case123".to_string())
            .with_permissions(vec!["read_evidence".to_string(), "write_timeline".to_string()])
            .with_clearance("SECRET".to_string());
        
        assert_eq!(context.tenant_id, "test_case");
        assert_eq!(context.investigator_id, Some("investigator1".to_string()));
        assert_eq!(context.case_id, Some("case123".to_string()));
        assert_eq!(context.clearance_level, Some("SECRET".to_string()));
        assert_eq!(context.permissions, vec!["read_evidence".to_string(), "write_timeline".to_string()]);
    }
    
    #[test]
    fn test_data_store_error_display() {
        let error = DataStoreError::ChainOfCustody("Evidence chain broken".to_string());
        assert_eq!(error.to_string(), "Chain of custody error: Evidence chain broken");
    }
    
    #[test]
    fn test_evidence_search_criteria_default() {
        let criteria = EvidenceSearchCriteria::default();
        assert_eq!(criteria.limit, Some(100));
        assert_eq!(criteria.sort_field, Some("timestamp".to_string()));
    }
}