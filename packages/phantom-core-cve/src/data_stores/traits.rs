//! Data Store Traits
//! 
//! Common interface definitions for all CVE data store implementations

use async_trait::async_trait;
use crate::models::{CVE, ExploitTimeline, RemediationStrategy, SearchCriteria as CVESearchCriteria};
use super::{DataStoreResult, TenantContext, SearchResults, DataStoreMetrics, BulkOperationResult};

/// Core CVE data store operations trait
#[async_trait]
pub trait CVEDataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> DataStoreResult<()>;
    
    /// Close the data store connection
    async fn close(&mut self) -> DataStoreResult<()>;
    
    /// Health check for the data store
    async fn health_check(&self) -> DataStoreResult<bool>;
    
    /// Get data store metrics
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics>;
}

/// CVE storage operations
#[async_trait]
pub trait CVEStore: Send + Sync {
    /// Store a CVE
    async fn store_cve(&self, cve: &CVE, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a CVE by ID
    async fn get_cve(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<CVE>>;
    
    /// Update a CVE
    async fn update_cve(&self, cve: &CVE, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Delete a CVE
    async fn delete_cve(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search CVEs
    async fn search_cves(&self, criteria: &CVESearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<CVE>>;
    
    /// Bulk store CVEs
    async fn bulk_store_cves(&self, cves: &[CVE], context: &TenantContext) -> DataStoreResult<BulkOperationResult>;
    
    /// List all CVE IDs for a tenant
    async fn list_cve_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<String>>;
}

/// Exploit timeline storage operations
#[async_trait]
pub trait ExploitStore: Send + Sync {
    /// Store an exploit timeline
    async fn store_exploit(&self, exploit: &ExploitTimeline, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get an exploit timeline by CVE ID
    async fn get_exploit(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<ExploitTimeline>>;
    
    /// Delete an exploit timeline
    async fn delete_exploit(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search exploit timelines
    async fn search_exploits(&self, criteria: &CVESearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<ExploitTimeline>>;
}

/// Remediation strategy storage operations
#[async_trait]
pub trait RemediationStore: Send + Sync {
    /// Store a remediation strategy
    async fn store_remediation(&self, remediation: &RemediationStrategy, context: &TenantContext) -> DataStoreResult<String>;
    
    /// Get a remediation strategy by CVE ID
    async fn get_remediation(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<RemediationStrategy>>;
    
    /// Delete a remediation strategy
    async fn delete_remediation(&self, id: &str, context: &TenantContext) -> DataStoreResult<()>;
    
    /// Search remediation strategies
    async fn search_remediations(&self, criteria: &CVESearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<RemediationStrategy>>;
}

/// Comprehensive CVE data store trait combining all operations
#[async_trait]
pub trait ComprehensiveCVEStore: 
    CVEDataStore + 
    CVEStore + 
    ExploitStore + 
    RemediationStore 
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