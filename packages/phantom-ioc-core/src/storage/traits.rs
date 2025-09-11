// phantom-ioc-core/src/storage/traits.rs
// Storage traits and interfaces for IOC Core

use async_trait::async_trait;
use serde::{Serialize, Deserialize};
use crate::models::*;
use std::collections::HashMap;

/// Storage error types
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Connection error: {0}")]
    Connection(String),
    #[error("Configuration error: {0}")]
    Configuration(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Constraint violation: {0}")]
    ConstraintViolation(String),
    #[error("Timeout error: {0}")]
    Timeout(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Storage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageStatistics {
    pub ioc_count: u64,
    pub result_count: u64,
    pub correlation_count: u64,
    pub total_size_bytes: u64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Health status for storage backend
#[derive(Debug, Clone)]
pub struct HealthStatus {
    pub status: String,
    pub response_time_ms: u64,
    pub error_message: Option<String>,
    pub metadata: HashMap<String, String>,
}

/// Search criteria for IOCs
#[derive(Debug, Clone)]
pub struct IOCSearchCriteria {
    pub ioc_types: Option<Vec<IOCType>>,
    pub severity: Option<Vec<Severity>>,
    pub sources: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub confidence_min: Option<f64>,
    pub confidence_max: Option<f64>,
    pub time_range: Option<(chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
}

/// Sort order
#[derive(Debug, Clone)]
pub enum SortOrder {
    Ascending,
    Descending,
}

/// Main storage trait that all IOC storage backends must implement
#[async_trait]
pub trait IOCStorage: Send + Sync {
    /// Initialize the storage backend
    async fn initialize(&self) -> Result<(), StorageError>;

    /// Health check for the storage backend
    async fn health_check(&self) -> Result<HealthStatus, StorageError>;

    /// Store a single IOC
    async fn store_ioc(&self, ioc: &IOC) -> Result<(), StorageError>;

    /// Store multiple IOCs in a batch
    async fn store_ioc_batch(&self, iocs: &[IOC]) -> Result<(), StorageError>;

    /// Retrieve an IOC by ID
    async fn get_ioc(&self, id: &uuid::Uuid) -> Result<Option<IOC>, StorageError>;

    /// Retrieve multiple IOCs by IDs
    async fn get_ioc_batch(&self, ids: &[uuid::Uuid]) -> Result<Vec<IOC>, StorageError>;

    /// Search for IOCs based on criteria
    async fn search_iocs(&self, criteria: &IOCSearchCriteria) -> Result<Vec<IOC>, StorageError>;

    /// List all IOC IDs
    async fn list_ioc_ids(&self) -> Result<Vec<uuid::Uuid>, StorageError>;

    /// Delete an IOC by ID
    async fn delete_ioc(&self, id: &uuid::Uuid) -> Result<bool, StorageError>;

    /// Store an IOC processing result
    async fn store_result(&self, result: &IOCResult) -> Result<(), StorageError>;

    /// Store multiple IOC processing results in a batch
    async fn store_result_batch(&self, results: &[IOCResult]) -> Result<(), StorageError>;

    /// Retrieve an IOC processing result by IOC ID
    async fn get_result(&self, ioc_id: &uuid::Uuid) -> Result<Option<IOCResult>, StorageError>;

    /// Retrieve multiple IOC processing results by IOC IDs
    async fn get_result_batch(&self, ioc_ids: &[uuid::Uuid]) -> Result<Vec<IOCResult>, StorageError>;

    /// Search for IOC processing results
    async fn search_results(&self, criteria: &IOCSearchCriteria) -> Result<Vec<IOCResult>, StorageError>;

    /// List all result IDs
    async fn list_result_ids(&self) -> Result<Vec<uuid::Uuid>, StorageError>;

    /// Delete an IOC processing result by IOC ID
    async fn delete_result(&self, ioc_id: &uuid::Uuid) -> Result<bool, StorageError>;

    /// Store a correlation between IOCs
    async fn store_correlation(&self, correlation: &Correlation) -> Result<(), StorageError>;

    /// Retrieve correlations for an IOC
    async fn get_correlations(&self, ioc_id: &uuid::Uuid) -> Result<Vec<Correlation>, StorageError>;

    /// Store enriched IOC data
    async fn store_enriched_ioc(&self, enriched_ioc: &EnrichedIOC) -> Result<(), StorageError>;

    /// Retrieve enriched IOC data
    async fn get_enriched_ioc(&self, ioc_id: &uuid::Uuid) -> Result<Option<EnrichedIOC>, StorageError>;

    /// Get storage statistics
    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError>;

    /// Close/cleanup the storage backend
    async fn close(&self) -> Result<(), StorageError>;
}

impl Default for IOCSearchCriteria {
    fn default() -> Self {
        Self {
            ioc_types: None,
            severity: None,
            sources: None,
            tags: None,
            confidence_min: None,
            confidence_max: None,
            time_range: None,
            limit: Some(100),
            offset: None,
            sort_by: Some("timestamp".to_string()),
            sort_order: Some(SortOrder::Descending),
        }
    }
}

impl IOCSearchCriteria {
    /// Create a new search criteria builder
    pub fn builder() -> IOCSearchCriteriaBuilder {
        IOCSearchCriteriaBuilder::default()
    }
}

/// Builder pattern for IOC search criteria
#[derive(Default)]
pub struct IOCSearchCriteriaBuilder {
    criteria: IOCSearchCriteria,
}

impl IOCSearchCriteriaBuilder {
    pub fn ioc_types(mut self, types: Vec<IOCType>) -> Self {
        self.criteria.ioc_types = Some(types);
        self
    }

    pub fn severity(mut self, severity: Vec<Severity>) -> Self {
        self.criteria.severity = Some(severity);
        self
    }

    pub fn sources(mut self, sources: Vec<String>) -> Self {
        self.criteria.sources = Some(sources);
        self
    }

    pub fn tags(mut self, tags: Vec<String>) -> Self {
        self.criteria.tags = Some(tags);
        self
    }

    pub fn confidence_range(mut self, min: f64, max: f64) -> Self {
        self.criteria.confidence_min = Some(min);
        self.criteria.confidence_max = Some(max);
        self
    }

    pub fn time_range(
        mut self, 
        start: chrono::DateTime<chrono::Utc>, 
        end: chrono::DateTime<chrono::Utc>
    ) -> Self {
        self.criteria.time_range = Some((start, end));
        self
    }

    pub fn limit(mut self, limit: usize) -> Self {
        self.criteria.limit = Some(limit);
        self
    }

    pub fn offset(mut self, offset: usize) -> Self {
        self.criteria.offset = Some(offset);
        self
    }

    pub fn sort_by(mut self, field: String, order: SortOrder) -> Self {
        self.criteria.sort_by = Some(field);
        self.criteria.sort_order = Some(order);
        self
    }

    pub fn build(self) -> IOCSearchCriteria {
        self.criteria
    }
}