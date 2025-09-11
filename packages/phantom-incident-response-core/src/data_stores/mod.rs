//! Data Store Module
//! 
//! Comprehensive data storage abstraction layer for incident response data
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
            DataStoreError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for DataStoreError {}

/// Tenant context for multi-tenancy support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantContext {
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub organization_id: Option<String>,
    pub permissions: Vec<String>,
}

impl TenantContext {
    pub fn new(tenant_id: String) -> Self {
        Self {
            tenant_id,
            user_id: None,
            organization_id: None,
            permissions: vec![],
        }
    }
    
    pub fn with_user(mut self, user_id: String) -> Self {
        self.user_id = Some(user_id);
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
}

/// Search results with pagination
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults<T> {
    pub items: Vec<T>,
    pub pagination: Pagination,
    pub took_ms: u64,
}

/// Pagination information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pagination {
    pub page: usize,
    pub size: usize,
    pub total: usize,
    pub total_pages: usize,
}

/// Data store metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreMetrics {
    pub total_incidents: usize,
    pub total_evidence: usize,
    pub total_investigations: usize,
    pub total_playbooks: usize,
    pub total_responders: usize,
    pub total_tasks: usize,
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

/// Sort order for search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// Data store factory for creating appropriate store instances
pub struct DataStoreFactory;

impl DataStoreFactory {
    /// Create a data store instance based on configuration
    pub fn create_store(config: &DataStoreConfig) -> DataStoreResult<Box<dyn ComprehensiveIncidentResponseStore + Send + Sync>> {
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
    pub fn from_env() -> DataStoreResult<Box<dyn ComprehensiveIncidentResponseStore + Send + Sync>> {
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
        let context = TenantContext::new("test_tenant".to_string())
            .with_user("user1".to_string())
            .with_permissions(vec!["read".to_string(), "write".to_string()]);
        
        assert_eq!(context.tenant_id, "test_tenant");
        assert_eq!(context.user_id, Some("user1".to_string()));
        assert_eq!(context.permissions, vec!["read".to_string(), "write".to_string()]);
    }
    
    #[test]
    fn test_data_store_error_display() {
        let error = DataStoreError::Connection("Failed to connect".to_string());
        assert_eq!(error.to_string(), "Connection error: Failed to connect");
    }
}