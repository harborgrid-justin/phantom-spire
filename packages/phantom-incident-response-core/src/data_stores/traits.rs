//! Data Store Traits
//! 
//! Common interface definitions for all incident response data store implementations

use async_trait::async_trait;
use crate::models::{Incident, Evidence, ResponsePlaybook, ForensicInvestigation, Responder, Task};
use super::{DataStoreResult, TenantContext, SearchResults, DataStoreMetrics, BulkOperationResult};

/// Core incident response data store operations trait
#[async_trait]
pub trait IncidentResponseDataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> DataStoreResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> DataStoreResult<()>;
    
    /// Health check for the data store
    async fn health_check(&self) -> DataStoreResult<bool>;
    
    /// Get data store metrics
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics>;
}

/// Incident storage operations
#[async_trait]
pub trait IncidentStore: Send + Sync {
    /// Store an incident
    async fn store_incident(&self, incident: &Incident, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an incident by ID
    async fn get_incident(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<Incident>>;
    
    /// Update an incident
    async fn update_incident(&self, incident: &Incident, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete an incident
    async fn delete_incident(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search incidents
    async fn search_incidents(&self, criteria: &IncidentSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Incident>>;
    
    /// Bulk store incidents
    async fn bulk_store_incidents(&self, incidents: &[Incident], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// List all incident IDs for a tenant
    async fn list_incident_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<String>>;
}

/// Evidence storage operations
#[async_trait]
pub trait EvidenceStore: Send + Sync {
    /// Store evidence
    async fn store_evidence(&self, evidence: &Evidence, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get evidence by ID
    async fn get_evidence(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<Evidence>>;
    
    /// Delete evidence
    async fn delete_evidence(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search evidence
    async fn search_evidence(&self, criteria: &EvidenceSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Evidence>>;
    
    /// Get evidence by incident ID
    async fn get_evidence_by_incident(&self, incident_id: &str, context: &TenantContext) -> DataStoreResult<Vec<Evidence>>;
}

/// Playbook storage operations
#[async_trait]
pub trait PlaybookStore: Send + Sync {
    /// Store a response playbook
    async fn store_playbook(&self, playbook: &ResponsePlaybook, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a playbook by ID
    async fn get_playbook(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<ResponsePlaybook>>;
    
    /// Delete a playbook
    async fn delete_playbook(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search playbooks
    async fn search_playbooks(&self, criteria: &PlaybookSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<ResponsePlaybook>>;
}

/// Investigation storage operations
#[async_trait]
pub trait InvestigationStore: Send + Sync {
    /// Store a forensic investigation
    async fn store_investigation(&self, investigation: &ForensicInvestigation, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an investigation by ID
    async fn get_investigation(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<ForensicInvestigation>>;
    
    /// Delete an investigation
    async fn delete_investigation(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search investigations
    async fn search_investigations(&self, criteria: &InvestigationSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<ForensicInvestigation>>;
}

/// Responder storage operations
#[async_trait]
pub trait ResponderStore: Send + Sync {
    /// Store a responder
    async fn store_responder(&self, responder: &Responder, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a responder by ID
    async fn get_responder(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<Responder>>;
    
    /// Update a responder
    async fn update_responder(&self, responder: &Responder, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a responder
    async fn delete_responder(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search responders
    async fn search_responders(&self, criteria: &ResponderSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Responder>>;
}

/// Task storage operations
#[async_trait]
pub trait TaskStore: Send + Sync {
    /// Store a task
    async fn store_task(&self, task: &Task, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a task by ID
    async fn get_task(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<Task>>;
    
    /// Update a task
    async fn update_task(&self, task: &Task, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a task
    async fn delete_task(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Get tasks by incident ID
    async fn get_tasks_by_incident(&self, incident_id: &str, context: &TenantContext) -> DataStoreResult<Vec<Task>>;
}

/// Comprehensive incident response data store trait combining all operations
#[async_trait]
pub trait ComprehensiveIncidentResponseStore: 
    IncidentResponseDataStore + 
    IncidentStore + 
    EvidenceStore + 
    PlaybookStore + 
    InvestigationStore + 
    ResponderStore + 
    TaskStore
{
    /// Get the data store type identifier
    fn store_type(&self) -> &'static str;
    
    /// Check if multi-tenancy is supported
    fn supports_multi_tenancy(&self) -> bool;
    
    /// Check if full-text search is supported
    fn supports_full_text_search(&self) -> bool;
    
    /// Check if transactions are supported
    fn supports_transactions(&self) -> bool;
}

/// Search criteria for incidents
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IncidentSearchCriteria {
    pub status: Option<String>,
    pub severity: Option<String>,
    pub category: Option<String>,
    pub assigned_to: Option<String>,
    pub created_after: Option<chrono::DateTime<chrono::Utc>>,
    pub created_before: Option<chrono::DateTime<chrono::Utc>>,
    pub tags: Vec<String>,
    pub title_contains: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Search criteria for evidence
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct EvidenceSearchCriteria {
    pub evidence_type: Option<String>,
    pub incident_id: Option<String>,
    pub collected_by: Option<String>,
    pub collected_after: Option<chrono::DateTime<chrono::Utc>>,
    pub collected_before: Option<chrono::DateTime<chrono::Utc>>,
    pub hash: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Search criteria for playbooks
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlaybookSearchCriteria {
    pub name_contains: Option<String>,
    pub category: Option<String>,
    pub severity: Option<String>,
    pub created_by: Option<String>,
    pub active_only: bool,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Search criteria for investigations
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct InvestigationSearchCriteria {
    pub incident_id: Option<String>,
    pub investigator: Option<String>,
    pub status: Option<String>,
    pub started_after: Option<chrono::DateTime<chrono::Utc>>,
    pub started_before: Option<chrono::DateTime<chrono::Utc>>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Search criteria for responders
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResponderSearchCriteria {
    pub role: Option<String>,
    pub department: Option<String>,
    pub availability: Option<String>,
    pub skills: Vec<String>,
    pub active_only: bool,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}