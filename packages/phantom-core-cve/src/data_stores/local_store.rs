use crate::models::{CVE, CVEAnalysisResult, ExploitTimeline, RemediationStrategy, SearchCriteria as CVESearchCriteria};
use crate::data_stores::{
    traits::{CVEDataStore, CVEStore, ExploitStore, RemediationStore, ComprehensiveCVEStore},
    DataStoreResult, TenantContext, SearchResults, DataStoreMetrics, BulkOperationResult,
    DataStoreError, Pagination
};
use std::collections::HashMap;
use tokio::sync::RwLock;
use chrono::Utc;
use async_trait::async_trait;

#[derive(Debug)]
pub struct LocalDataStore {
    cves: RwLock<HashMap<String, CVE>>,
    analyses: RwLock<HashMap<String, CVEAnalysisResult>>,
    exploits: RwLock<HashMap<String, ExploitTimeline>>,
    remediations: RwLock<HashMap<String, RemediationStrategy>>,
}

impl LocalDataStore {
    pub fn new() -> Self {
        Self {
            cves: RwLock::new(HashMap::new()),
            analyses: RwLock::new(HashMap::new()),
            exploits: RwLock::new(HashMap::new()),
            remediations: RwLock::new(HashMap::new()),
        }
    }

    pub async fn add_analysis_result(&self, result: &CVEAnalysisResult) {
        let mut analyses = self.analyses.write().await;
        analyses.insert(result.cve.cve_metadata.cve_id.clone(), result.clone());
    }

    pub async fn add_analysis_results(&self, results: &[CVEAnalysisResult]) {
        let mut analyses = self.analyses.write().await;
        for result in results {
            analyses.insert(result.cve.cve_metadata.cve_id.clone(), result.clone());
        }
    }
}

#[async_trait]
impl CVEDataStore for LocalDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        Ok(())
    }
    
    async fn close(&mut self) -> DataStoreResult<()> {
        Ok(())
    }
    
    async fn health_check(&self) -> DataStoreResult<bool> {
        Ok(true)
    }
    
    async fn get_metrics(&self, _context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let cves = self.cves.read().await;
        let exploits = self.exploits.read().await;
        let remediations = self.remediations.read().await;
        
        Ok(DataStoreMetrics {
            total_cves: cves.len(),
            total_exploits: exploits.len(),
            total_remediations: remediations.len(),
            storage_size_bytes: 0,
            last_updated: Utc::now(),
        })
    }
}

#[async_trait]
impl CVEStore for LocalDataStore {
    async fn store_cve(&self, cve: &CVE, _context: &TenantContext) -> DataStoreResult<String> {
        let mut cves = self.cves.write().await;
        let cve_id = cve.cve_metadata.cve_id.clone();
        cves.insert(cve_id.clone(), cve.clone());
        Ok(cve_id)
    }
    
    async fn get_cve(&self, id: &str, _context: &TenantContext) -> DataStoreResult<Option<CVE>> {
        let cves = self.cves.read().await;
        Ok(cves.get(id).cloned())
    }
    
    async fn update_cve(&self, cve: &CVE, _context: &TenantContext) -> DataStoreResult<()> {
        let mut cves = self.cves.write().await;
        cves.insert(cve.cve_metadata.cve_id.clone(), cve.clone());
        Ok(())
    }
    
    async fn delete_cve(&self, id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        let mut cves = self.cves.write().await;
        cves.remove(id);
        Ok(())
    }
    
    async fn search_cves(&self, _criteria: &CVESearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<CVE>> {
        let cves = self.cves.read().await;
        let items: Vec<CVE> = cves.values().cloned().collect();
        let total = items.len();
        
        Ok(SearchResults {
            items,
            pagination: Pagination {
                page: 1,
                size: total,
                total,
                total_pages: 1,
            },
            took_ms: 0,
        })
    }
    
    async fn bulk_store_cves(&self, cves: &[CVE], _context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let mut store_cves = self.cves.write().await;
        let mut processed_ids = Vec::new();
        
        for cve in cves {
            let cve_id = cve.cve_metadata.cve_id.clone();
            store_cves.insert(cve_id.clone(), cve.clone());
            processed_ids.push(cve_id);
        }
        
        Ok(BulkOperationResult {
            success_count: cves.len(),
            error_count: 0,
            errors: Vec::new(),
            processed_ids,
        })
    }
    
    async fn list_cve_ids(&self, _context: &TenantContext) -> DataStoreResult<Vec<String>> {
        let cves = self.cves.read().await;
        Ok(cves.keys().cloned().collect())
    }
}

#[async_trait]
impl ExploitStore for LocalDataStore {
    async fn store_exploit(&self, exploit: &ExploitTimeline, _context: &TenantContext) -> DataStoreResult<String> {
        let mut exploits = self.exploits.write().await;
        let exploit_id = exploit.cve_id.clone();
        exploits.insert(exploit_id.clone(), exploit.clone());
        Ok(exploit_id)
    }
    
    async fn get_exploit(&self, id: &str, _context: &TenantContext) -> DataStoreResult<Option<ExploitTimeline>> {
        let exploits = self.exploits.read().await;
        Ok(exploits.get(id).cloned())
    }
    
    async fn delete_exploit(&self, id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        let mut exploits = self.exploits.write().await;
        exploits.remove(id);
        Ok(())
    }
    
    async fn search_exploits(&self, _criteria: &CVESearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<ExploitTimeline>> {
        let exploits = self.exploits.read().await;
        let items: Vec<ExploitTimeline> = exploits.values().cloned().collect();
        let total = items.len();
        
        Ok(SearchResults {
            items,
            pagination: Pagination {
                page: 1,
                size: total,
                total,
                total_pages: 1,
            },
            took_ms: 0,
        })
    }
}

#[async_trait]
impl RemediationStore for LocalDataStore {
    async fn store_remediation(&self, remediation: &RemediationStrategy, _context: &TenantContext) -> DataStoreResult<String> {
        let mut remediations = self.remediations.write().await;
        let remediation_id = remediation.cve_id.clone();
        remediations.insert(remediation_id.clone(), remediation.clone());
        Ok(remediation_id)
    }
    
    async fn get_remediation(&self, id: &str, _context: &TenantContext) -> DataStoreResult<Option<RemediationStrategy>> {
        let remediations = self.remediations.read().await;
        Ok(remediations.get(id).cloned())
    }
    
    async fn delete_remediation(&self, id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        let mut remediations = self.remediations.write().await;
        remediations.remove(id);
        Ok(())
    }
    
    async fn search_remediations(&self, _criteria: &CVESearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<RemediationStrategy>> {
        let remediations = self.remediations.read().await;
        let items: Vec<RemediationStrategy> = remediations.values().cloned().collect();
        let total = items.len();
        
        Ok(SearchResults {
            items,
            pagination: Pagination {
                page: 1,
                size: total,
                total,
                total_pages: 1,
            },
            took_ms: 0,
        })
    }
}

#[async_trait]
impl ComprehensiveCVEStore for LocalDataStore {
    fn store_type(&self) -> &'static str {
        "local"
    }
    
    fn supports_multi_tenancy(&self) -> bool {
        false
    }
    
    fn supports_full_text_search(&self) -> bool {
        false
    }
    
    fn supports_transactions(&self) -> bool {
        false
    }
}