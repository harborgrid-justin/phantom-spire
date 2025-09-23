//! Storage Traits
//! 
//! Defines the storage interface for incident response data with multiple backend support

use async_trait::async_trait;
use crate::incident_models::*;
use crate::evidence_models::*;
use crate::playbook_models::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Storage result type
pub type StorageResult<T> = Result<T, StorageError>;

/// Storage error types
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Connection error: {0}")]
    ConnectionError(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
    
    #[error("Configuration error: {0}")]
    ConfigurationError(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("IO error: {0}")]
    IoError(String),
    
    #[error("Authentication error: {0}")]
    AuthenticationError(String),
    
    #[error("Permission error: {0}")]
    PermissionError(String),
}

/// Query parameters for storage operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryParams {
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
    pub filters: HashMap<String, FilterValue>,
}

/// Sort order enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// Filter value types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Array(Vec<String>),
    Range { min: f64, max: f64 },
    DateRange { start: DateTime<Utc>, end: DateTime<Utc> },
}

/// Storage query results with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult<T> {
    pub items: Vec<T>,
    pub total_count: usize,
    pub page: usize,
    pub page_size: usize,
    pub execution_time_ms: u64,
}

/// Main storage trait for incident response data
#[async_trait]
pub trait Storage: Send + Sync {
    /// Initialize the storage backend
    async fn initialize(&mut self) -> StorageResult<()>;
    
    /// Close the storage connection
    async fn close(&mut self) -> StorageResult<()>;
    
    /// Health check
    async fn health_check(&self) -> StorageResult<bool>;
    
    /// Get storage metrics
    async fn get_metrics(&self) -> StorageResult<StorageMetrics>;
}

/// Incident storage operations
#[async_trait]
pub trait IncidentStorage: Storage {
    /// Store an incident
    async fn store_incident(&self, incident: &Incident) -> StorageResult<String>;
    
    /// Get an incident by ID
    async fn get_incident(&self, id: &str) -> StorageResult<Option<Incident>>;
    
    /// Update an incident
    async fn update_incident(&self, incident: &Incident) -> StorageResult<()>;
    
    /// Delete an incident
    async fn delete_incident(&self, id: &str) -> StorageResult<()>;
    
    /// Query incidents with parameters
    async fn query_incidents(&self, params: &QueryParams) -> StorageResult<QueryResult<Incident>>;
    
    /// Search incidents with text query
    async fn search_incidents(&self, query: &str, params: &QueryParams) -> StorageResult<QueryResult<Incident>>;
    
    /// Bulk store incidents
    async fn bulk_store_incidents(&self, incidents: &[Incident]) -> StorageResult<BulkResult>;
    
    /// Get incidents by status
    async fn get_incidents_by_status(&self, status: &IncidentStatus) -> StorageResult<Vec<Incident>>;
    
    /// Get incidents by severity
    async fn get_incidents_by_severity(&self, severity: &IncidentSeverity) -> StorageResult<Vec<Incident>>;
    
    /// Get incidents by date range
    async fn get_incidents_by_date_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> StorageResult<Vec<Incident>>;
}

/// Evidence storage operations
#[async_trait]
pub trait EvidenceStorage: Storage {
    /// Store evidence
    async fn store_evidence(&self, evidence: &Evidence) -> StorageResult<String>;
    
    /// Get evidence by ID
    async fn get_evidence(&self, id: &str) -> StorageResult<Option<Evidence>>;
    
    /// Update evidence
    async fn update_evidence(&self, evidence: &Evidence) -> StorageResult<()>;
    
    /// Delete evidence
    async fn delete_evidence(&self, id: &str) -> StorageResult<()>;
    
    /// Query evidence with parameters
    async fn query_evidence(&self, params: &QueryParams) -> StorageResult<QueryResult<Evidence>>;
    
    /// Search evidence with text query
    async fn search_evidence(&self, query: &str, params: &QueryParams) -> StorageResult<QueryResult<Evidence>>;
    
    /// Get evidence by incident ID
    async fn get_evidence_by_incident(&self, incident_id: &str) -> StorageResult<Vec<Evidence>>;
    
    /// Get evidence by type
    async fn get_evidence_by_type(&self, evidence_type: &EvidenceType) -> StorageResult<Vec<Evidence>>;
    
    /// Bulk store evidence
    async fn bulk_store_evidence(&self, evidence: &[Evidence]) -> StorageResult<BulkResult>;
}

/// Playbook storage operations
#[async_trait]
pub trait PlaybookStorage: Storage {
    /// Store a playbook
    async fn store_playbook(&self, playbook: &ResponsePlaybook) -> StorageResult<String>;
    
    /// Get a playbook by ID
    async fn get_playbook(&self, id: &str) -> StorageResult<Option<ResponsePlaybook>>;
    
    /// Update a playbook
    async fn update_playbook(&self, playbook: &ResponsePlaybook) -> StorageResult<()>;
    
    /// Delete a playbook
    async fn delete_playbook(&self, id: &str) -> StorageResult<()>;
    
    /// Query playbooks with parameters
    async fn query_playbooks(&self, params: &QueryParams) -> StorageResult<QueryResult<ResponsePlaybook>>;
    
    /// Get playbooks by category
    async fn get_playbooks_by_category(&self, category: &IncidentCategory) -> StorageResult<Vec<ResponsePlaybook>>;
    
    /// Get active playbooks
    async fn get_active_playbooks(&self) -> StorageResult<Vec<ResponsePlaybook>>;
}

/// Investigation storage operations
#[async_trait]
pub trait InvestigationStorage: Storage {
    /// Store a forensic investigation
    async fn store_investigation(&self, investigation: &ForensicInvestigation) -> StorageResult<String>;
    
    /// Get an investigation by ID
    async fn get_investigation(&self, id: &str) -> StorageResult<Option<ForensicInvestigation>>;
    
    /// Update an investigation
    async fn update_investigation(&self, investigation: &ForensicInvestigation) -> StorageResult<()>;
    
    /// Delete an investigation
    async fn delete_investigation(&self, id: &str) -> StorageResult<()>;
    
    /// Query investigations with parameters
    async fn query_investigations(&self, params: &QueryParams) -> StorageResult<QueryResult<ForensicInvestigation>>;
    
    /// Get investigations by incident ID
    async fn get_investigations_by_incident(&self, incident_id: &str) -> StorageResult<Vec<ForensicInvestigation>>;
}

/// Comprehensive storage trait combining all operations
#[async_trait]
pub trait ComprehensiveStorage: 
    IncidentStorage + 
    EvidenceStorage + 
    PlaybookStorage + 
    InvestigationStorage 
{
    /// Get the storage type identifier
    fn storage_type(&self) -> &'static str;
    
    /// Check if full-text search is supported
    fn supports_full_text_search(&self) -> bool;
    
    /// Check if transactions are supported
    fn supports_transactions(&self) -> bool;
    
    /// Check if real-time updates are supported
    fn supports_real_time_updates(&self) -> bool;
    
    /// Backup the storage
    async fn backup(&self, path: &str) -> StorageResult<()>;
    
    /// Restore from backup
    async fn restore(&self, path: &str) -> StorageResult<()>;
    
    /// Optimize storage performance
    async fn optimize(&self) -> StorageResult<()>;
}

/// Storage metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageMetrics {
    pub total_incidents: usize,
    pub total_evidence: usize,
    pub total_investigations: usize,
    pub total_playbooks: usize,
    pub storage_size_bytes: u64,
    pub index_size_bytes: u64,
    pub connection_pool_size: usize,
    pub active_connections: usize,
    pub average_query_time_ms: f64,
    pub last_backup: Option<DateTime<Utc>>,
    pub last_optimization: Option<DateTime<Utc>>,
}

/// Bulk operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkResult {
    pub success_count: usize,
    pub error_count: usize,
    pub errors: Vec<BulkError>,
    pub execution_time_ms: u64,
}

/// Bulk operation error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BulkError {
    pub index: usize,
    pub id: Option<String>,
    pub error: String,
}

impl Default for QueryParams {
    fn default() -> Self {
        Self {
            limit: Some(100),
            offset: Some(0),
            sort_by: None,
            sort_order: Some(SortOrder::Desc),
            filters: HashMap::new(),
        }
    }
}

impl QueryParams {
    pub fn new() -> Self {
        Self::default()
    }
    
    pub fn with_limit(mut self, limit: usize) -> Self {
        self.limit = Some(limit);
        self
    }
    
    pub fn with_offset(mut self, offset: usize) -> Self {
        self.offset = Some(offset);
        self
    }
    
    pub fn with_sort(mut self, field: String, order: SortOrder) -> Self {
        self.sort_by = Some(field);
        self.sort_order = Some(order);
        self
    }
    
    pub fn with_filter(mut self, key: String, value: FilterValue) -> Self {
        self.filters.insert(key, value);
        self
    }
}