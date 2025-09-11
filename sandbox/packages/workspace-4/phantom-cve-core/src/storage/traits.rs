// Storage traits for database-agnostic operations
use async_trait::async_trait;
use crate::models::{CVE, CVEAnalysisResult, SearchCriteria};
use super::StorageError;

/// Main storage trait that all database backends must implement
#[async_trait]
pub trait Storage: Send + Sync {
    /// Store a single CVE analysis result
    async fn store_analysis(&self, result: &CVEAnalysisResult) -> Result<(), StorageError>;
    
    /// Store multiple CVE analysis results in a batch
    async fn store_analysis_batch(&self, results: &[CVEAnalysisResult]) -> Result<(), StorageError>;
    
    /// Retrieve a CVE analysis result by CVE ID
    async fn get_analysis(&self, cve_id: &str) -> Result<Option<CVEAnalysisResult>, StorageError>;
    
    /// Retrieve multiple CVE analysis results by CVE IDs
    async fn get_analysis_batch(&self, cve_ids: &[String]) -> Result<Vec<CVEAnalysisResult>, StorageError>;
    
    /// Search for CVE analysis results based on criteria
    async fn search_analyses(&self, criteria: &SearchCriteria) -> Result<Vec<CVEAnalysisResult>, StorageError>;
    
    /// Store a raw CVE record
    async fn store_cve(&self, cve: &CVE) -> Result<(), StorageError>;
    
    /// Store multiple raw CVE records in a batch
    async fn store_cve_batch(&self, cves: &[CVE]) -> Result<(), StorageError>;
    
    /// Retrieve a CVE record by ID
    async fn get_cve(&self, cve_id: &str) -> Result<Option<CVE>, StorageError>;
    
    /// Retrieve multiple CVE records by IDs
    async fn get_cve_batch(&self, cve_ids: &[String]) -> Result<Vec<CVE>, StorageError>;
    
    /// Search for CVE records based on criteria
    async fn search_cves(&self, criteria: &SearchCriteria) -> Result<Vec<CVE>, StorageError>;
    
    /// List all CVE IDs in storage
    async fn list_cve_ids(&self) -> Result<Vec<String>, StorageError>;
    
    /// List all analysis result IDs in storage
    async fn list_analysis_ids(&self) -> Result<Vec<String>, StorageError>;
    
    /// Delete a CVE analysis result by ID
    async fn delete_analysis(&self, cve_id: &str) -> Result<bool, StorageError>;
    
    /// Delete a CVE record by ID
    async fn delete_cve(&self, cve_id: &str) -> Result<bool, StorageError>;
    
    /// Get storage statistics (count of records, etc.)
    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError>;
    
    /// Health check for the storage backend
    async fn health_check(&self) -> Result<HealthStatus, StorageError>;
    
    /// Initialize/set up the storage backend (create tables, indices, etc.)
    async fn initialize(&self) -> Result<(), StorageError>;
    
    /// Close/cleanup the storage backend
    async fn close(&self) -> Result<(), StorageError>;
}

/// Storage statistics information
#[derive(Debug, Clone)]
pub struct StorageStatistics {
    pub total_cves: u64,
    pub total_analyses: u64,
    pub storage_size_bytes: u64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Health status of storage backend
#[derive(Debug, Clone, PartialEq)]
pub enum HealthStatus {
    Healthy,
    Degraded { reason: String },
    Unhealthy { reason: String },
}

/// Trait for storage backends that support transactions
#[async_trait]
pub trait TransactionalStorage: Storage {
    type Transaction: Send + Sync;
    
    /// Begin a new transaction
    async fn begin_transaction(&self) -> Result<Self::Transaction, StorageError>;
    
    /// Commit a transaction
    async fn commit_transaction(&self, tx: Self::Transaction) -> Result<(), StorageError>;
    
    /// Roll back a transaction
    async fn rollback_transaction(&self, tx: Self::Transaction) -> Result<(), StorageError>;
}

/// Trait for storage backends that support indexing
#[async_trait]
pub trait IndexableStorage: Storage {
    /// Create an index on specified fields
    async fn create_index(&self, fields: &[String]) -> Result<(), StorageError>;
    
    /// Drop an index
    async fn drop_index(&self, index_name: &str) -> Result<(), StorageError>;
    
    /// List all indices
    async fn list_indices(&self) -> Result<Vec<String>, StorageError>;
}

/// Trait for storage backends that support full-text search
#[async_trait]
pub trait SearchableStorage: Storage {
    /// Perform full-text search on CVE descriptions and other text fields
    async fn full_text_search(&self, query: &str) -> Result<Vec<CVEAnalysisResult>, StorageError>;
    
    /// Create or update the search index
    async fn update_search_index(&self) -> Result<(), StorageError>;
}