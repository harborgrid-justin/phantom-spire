//! Data Store Traits
//! 
//! Common interface definitions for all forensic data store implementations

use async_trait::async_trait;
use crate::models::{ForensicEvidence, ForensicTimeline, TimelineEvent, CaseInvestigation, EvidenceType};
use super::{DataStoreResult, TenantContext, SearchResults, DataStoreMetrics, BulkOperationResult, EvidenceSearchCriteria};

/// Core forensic data store operations trait
#[async_trait]
pub trait ForensicDataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> DataStoreResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> DataStoreResult<()>;
    
    /// Health check for the data store
    async fn health_check(&self) -> DataStoreResult<bool>;
    
    /// Get data store metrics
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics>;
    
    /// Verify data integrity across all evidence
    async fn verify_integrity(&self, context: &TenantContext) -> DataStoreResult<bool>;
}

/// Evidence storage operations
#[async_trait]
pub trait EvidenceStore: Send + Sync {
    /// Store forensic evidence with a chain of custody
    async fn store_evidence(&self, evidence: &ForensicEvidence, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get evidence by ID with integrity verification
    async fn get_evidence(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<ForensicEvidence>>;
    
    /// Update evidence (creates new chain of custody entry)
    async fn update_evidence(&self, evidence: &ForensicEvidence, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete evidence (marks as deleted, preserves for audit)
    async fn delete_evidence(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search evidence with advanced filtering
    async fn search_evidence(&self, criteria: &EvidenceSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<ForensicEvidence>>;
    
    /// Bulk store evidence with integrity checks
    async fn bulk_store_evidence(&self, evidence_list: &[ForensicEvidence], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// List all evidence IDs for a case
    async fn list_evidence_ids(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<Vec<String>>;
    
    /// Get evidence by hash for deduplication
    async fn get_evidence_by_hash(&self, hash: &str, context: &TenantContext) -> DataStoreResult<Vec<ForensicEvidence>>;
    
    /// Verify evidence chain of custody
    async fn verify_chain_of_custody(&self, evidence_id: &str, context: &TenantContext) -> DataStoreResult<bool>;
    
    /// Get evidence by type
    async fn get_evidence_by_type(&self, evidence_type: &EvidenceType, context: &TenantContext) -> DataStoreResult<Vec<ForensicEvidence>>;
}

/// Timeline storage operations
#[async_trait]
pub trait TimelineStore: Send + Sync {
    /// Store forensic timeline
    async fn store_timeline(&self, timeline: &ForensicTimeline, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get timeline by case ID
    async fn get_timeline(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<Option<ForensicTimeline>>;
    
    /// Add event to the existing timeline
    async fn add_timeline_event(&self, case_id: &str, event: &TimelineEvent, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Update timeline
    async fn update_timeline(&self, timeline: &ForensicTimeline, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete timeline
    async fn delete_timeline(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search timeline events
    async fn search_timeline_events(&self, criteria: &EvidenceSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<TimelineEvent>>;
    
    /// Get timeline events by time range
    async fn get_timeline_events_by_timerange(&self, 
        case_id: &str, 
        start: chrono::DateTime<chrono::Utc>, 
        end: chrono::DateTime<chrono::Utc>, 
        context: &TenantContext
    ) -> DataStoreResult<Vec<TimelineEvent>>;
    
    /// Correlate events across multiple cases
    async fn correlate_events(&self, artifact_hash: &str, context: &TenantContext) -> DataStoreResult<Vec<TimelineEvent>>;
}

/// Case management operations
#[async_trait]
pub trait CaseStore: Send + Sync {
    /// Create a new case investigation
    async fn create_case(&self, case: &CaseInvestigation, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get case by ID
    async fn get_case(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<Option<CaseInvestigation>>;
    
    /// Update case
    async fn update_case(&self, case: &CaseInvestigation, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Close case
    async fn close_case(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// List cases by investigator
    async fn list_cases_by_investigator(&self, investigator_id: &str, context: &TenantContext) -> DataStoreResult<Vec<CaseInvestigation>>;
    
    /// List active cases
    async fn list_active_cases(&self, context: &TenantContext) -> DataStoreResult<Vec<CaseInvestigation>>;
    
    /// Search cases
    async fn search_cases(&self, query: &str, context: &TenantContext) -> DataStoreResult<SearchResults<CaseInvestigation>>;
    
    /// Get case statistics
    async fn get_case_statistics(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<CaseStatistics>;
}

/// Case statistics
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CaseStatistics {
    pub total_evidence: usize,
    pub evidence_by_type: std::collections::HashMap<String, usize>,
    pub timeline_events: usize,
    pub investigators_count: usize,
    pub case_duration_days: Option<i64>,
    pub integrity_score: f64,
}

/// Audit trail operations for forensic accountability
#[async_trait]
pub trait AuditStore: Send + Sync {
    /// Log audit event
    async fn log_audit_event(&self, event: &AuditEvent, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Get audit trail for evidence
    async fn get_evidence_audit_trail(&self, evidence_id: &str, context: &TenantContext) -> DataStoreResult<Vec<AuditEvent>>;
    
    /// Get audit trail for a case
    async fn get_case_audit_trail(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<Vec<AuditEvent>>;
    
    /// Search audit events
    async fn search_audit_events(&self, criteria: &AuditSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<AuditEvent>>;
    
    /// Generate compliance report
    async fn generate_compliance_report(&self, case_id: &str, context: &TenantContext) -> DataStoreResult<ComplianceReport>;
}

/// Audit event for forensic operations
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub actor: String,
    pub action: String,
    pub resource_type: String,
    pub resource_id: String,
    pub details: std::collections::HashMap<String, String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

/// Audit search criteria
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AuditSearchCriteria {
    pub actor: Option<String>,
    pub action: Option<String>,
    pub resource_type: Option<String>,
    pub resource_id: Option<String>,
    pub date_from: Option<chrono::DateTime<chrono::Utc>>,
    pub date_to: Option<chrono::DateTime<chrono::Utc>>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

/// Compliance report
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ComplianceReport {
    pub case_id: String,
    pub generated_at: chrono::DateTime<chrono::Utc>,
    pub generated_by: String,
    pub evidence_integrity_verified: bool,
    pub chain_of_custody_intact: bool,
    pub audit_trail_complete: bool,
    pub compliance_standards: Vec<String>,
    pub violations: Vec<String>,
    pub recommendations: Vec<String>,
}

/// Comprehensive forensic data store trait combining all operations
#[async_trait]
pub trait ComprehensiveForensicStore: 
    ForensicDataStore + 
    EvidenceStore + 
    TimelineStore + 
    CaseStore + 
    AuditStore 
{
    /// Get the data store type identifier
    fn store_type(&self) -> &'static str;
    
    /// Check if multi-tenancy is supported
    fn supports_multi_tenancy(&self) -> bool;
    
    /// Check if full-text search is supported
    fn supports_full_text_search(&self) -> bool;
    
    /// Check if transactions are supported
    fn supports_transactions(&self) -> bool;
    
    /// Check if evidence integrity verification is supported
    fn supports_integrity_verification(&self) -> bool;
    
    /// Check if chain of custody tracking is supported
    fn supports_chain_of_custody(&self) -> bool;
    
    /// Check if audit logging is supported
    fn supports_audit_logging(&self) -> bool;
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_case_statistics_creation() {
        let stats = CaseStatistics {
            total_evidence: 25,
            evidence_by_type: std::collections::HashMap::new(),
            timeline_events: 150,
            investigators_count: 3,
            case_duration_days: Some(45),
            integrity_score: 0.98,
        };
        
        assert_eq!(stats.total_evidence, 25);
        assert_eq!(stats.integrity_score, 0.98);
    }
    
    #[test]
    fn test_audit_event_creation() {
        let event = AuditEvent {
            id: "audit-001".to_string(),
            timestamp: chrono::Utc::now(),
            actor: "investigator1".to_string(),
            action: "evidence_accessed".to_string(),
            resource_type: "ForensicEvidence".to_string(),
            resource_id: "evidence-123".to_string(),
            details: std::collections::HashMap::new(),
            ip_address: Some("192.168.1.100".to_string()),
            user_agent: Some("ForensicsApp/1.0".to_string()),
        };
        
        assert_eq!(event.actor, "investigator1");
        assert_eq!(event.action, "evidence_accessed");
    }
}