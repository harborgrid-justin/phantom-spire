//! Data Store Traits
//! 
//! Common interface definitions for all data store implementations

use async_trait::async_trait;
use crate::{MitreTechnique, MitreGroup, MitreSoftware, Mitigation, DetectionRule, ThreatAnalysis};
use super::{DataStoreResult, TenantContext, SearchCriteria, SearchResults, DataStoreMetrics, BulkOperationResult};

/// Core data store operations trait
#[async_trait]
pub trait MitreDataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> DataStoreResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> DataStoreResult<()>;
    
    /// Health check for the data store
    async fn health_check(&self) -> DataStoreResult<bool>;
    
    /// Get data store metrics
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics>;
}

/// Technique storage operations
#[async_trait]
pub trait TechniqueStore: Send + Sync {
    /// Store a technique
    async fn store_technique(&self, technique: &MitreTechnique, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a technique by ID
    async fn get_technique(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<MitreTechnique>>;
    
    /// Update a technique
    async fn update_technique(&self, technique: &MitreTechnique, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a technique
    async fn delete_technique(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search techniques
    async fn search_techniques(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<MitreTechnique>>;
    
    /// Bulk store techniques
    async fn bulk_store_techniques(&self, techniques: &[MitreTechnique], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// List all technique IDs for a tenant
    async fn list_technique_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<String>>;
}

/// Group storage operations
#[async_trait]
pub trait GroupStore: Send + Sync {
    /// Store a group
    async fn store_group(&self, group: &MitreGroup, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a group by ID
    async fn get_group(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<MitreGroup>>;
    
    /// Update a group
    async fn update_group(&self, group: &MitreGroup, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a group
    async fn delete_group(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search groups
    async fn search_groups(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<MitreGroup>>;
    
    /// Bulk store groups
    async fn bulk_store_groups(&self, groups: &[MitreGroup], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
}

/// Software storage operations
#[async_trait]
pub trait SoftwareStore: Send + Sync {
    /// Store software
    async fn store_software(&self, software: &MitreSoftware, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get software by ID
    async fn get_software(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<MitreSoftware>>;
    
    /// Update software
    async fn update_software(&self, software: &MitreSoftware, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete software
    async fn delete_software(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search software
    async fn search_software(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<MitreSoftware>>;
    
    /// Bulk store software
    async fn bulk_store_software(&self, software: &[MitreSoftware], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
}

/// Mitigation storage operations
#[async_trait]
pub trait MitigationStore: Send + Sync {
    /// Store a mitigation
    async fn store_mitigation(&self, mitigation: &Mitigation, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a mitigation by ID
    async fn get_mitigation(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<Mitigation>>;
    
    /// Update a mitigation
    async fn update_mitigation(&self, mitigation: &Mitigation, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a mitigation
    async fn delete_mitigation(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search mitigations
    async fn search_mitigations(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Mitigation>>;
    
    /// Bulk store mitigations
    async fn bulk_store_mitigations(&self, mitigations: &[Mitigation], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
}

/// Detection rule storage operations
#[async_trait]
pub trait DetectionRuleStore: Send + Sync {
    /// Store a detection rule
    async fn store_detection_rule(&self, rule: &DetectionRule, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a detection rule by ID
    async fn get_detection_rule(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<DetectionRule>>;
    
    /// Update a detection rule
    async fn update_detection_rule(&self, rule: &DetectionRule, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a detection rule
    async fn delete_detection_rule(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search detection rules
    async fn search_detection_rules(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<DetectionRule>>;
    
    /// Bulk store detection rules
    async fn bulk_store_detection_rules(&self, rules: &[DetectionRule], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
}

/// Analysis storage operations
#[async_trait]
pub trait AnalysisStore: Send + Sync {
    /// Store a threat analysis
    async fn store_analysis(&self, analysis: &ThreatAnalysis, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an analysis by ID
    async fn get_analysis(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<ThreatAnalysis>>;
    
    /// Delete an analysis
    async fn delete_analysis(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search analyses
    async fn search_analyses(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<ThreatAnalysis>>;
    
    /// Get recent analyses for a tenant
    async fn get_recent_analyses(&self, limit: usize, context: &TenantContext) -> DataStoreResult<Vec<ThreatAnalysis>>;
}

/// Comprehensive data store trait combining all operations
#[async_trait]
pub trait ComprehensiveMitreStore: 
    MitreDataStore + 
    TechniqueStore + 
    GroupStore + 
    SoftwareStore + 
    MitigationStore + 
    DetectionRuleStore + 
    AnalysisStore 
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