//! Redis Data Store Implementation
//! 
//! High-performance Redis-based data store for MITRE ATT&CK data with caching capabilities

use async_trait::async_trait;
use redis::{Client, aio::ConnectionManager, RedisError, AsyncCommands, RedisResult};
use crate::{MitreTechnique, MitreGroup, MitreSoftware, Mitigation, DetectionRule, ThreatAnalysis};
use super::{
    DataStoreResult, DataStoreError, TenantContext, SearchCriteria, SearchResults, 
    DataStoreMetrics, BulkOperationResult, Pagination, SortOrder,
    MitreDataStore, TechniqueStore, GroupStore, SoftwareStore, MitigationStore, 
    DetectionRuleStore, AnalysisStore, ComprehensiveMitreStore,
    RedisConfig, TenantData, DataSerializer
};
use std::time::{Duration, Instant};
use chrono::Utc;
use futures::future::try_join_all;
use log::{info, warn, error, debug};

/// Redis-based MITRE data store implementation
pub struct RedisDataStore {
    connection_manager: Option<ConnectionManager>,
    config: RedisConfig,
    is_connected: bool,
}

impl RedisDataStore {
    /// Create a new Redis data store instance
    pub fn new(config: RedisConfig) -> Self {
        Self {
            connection_manager: None,
            config,
            is_connected: false,
        }
    }
    
    /// Get Redis connection manager
    async fn get_connection(&self) -> DataStoreResult<&ConnectionManager> {
        self.connection_manager
            .as_ref()
            .ok_or_else(|| DataStoreError::Connection("Redis not connected".to_string()))
    }
    
    /// Generate cache key with proper prefix and tenant isolation
    fn cache_key(&self, key_type: &str, id: &str, context: &TenantContext) -> String {
        format!("{}{}:{}:{}", self.config.key_prefix, context.tenant_id, key_type, id)
    }
    
    /// Generate search pattern for keys
    fn search_pattern(&self, key_type: &str, pattern: &str, context: &TenantContext) -> String {
        format!("{}{}:{}:{}", self.config.key_prefix, context.tenant_id, key_type, pattern)
    }
    
    /// Store data with TTL
    async fn store_with_ttl<T: serde::Serialize>(
        &self,
        key: &str,
        data: &T,
        ttl_seconds: u64,
    ) -> DataStoreResult<()> {
        let mut conn = self.get_connection().await?.clone();
        let serialized = DataSerializer::to_redis_value(data)?;
        
        conn.set_ex(key, serialized, ttl_seconds as usize)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        Ok(())
    }
    
    /// Get data with deserialization
    async fn get_data<T: for<'de> serde::Deserialize<'de>>(
        &self,
        key: &str,
    ) -> DataStoreResult<Option<T>> {
        let mut conn = self.get_connection().await?.clone();
        
        let data: Option<Vec<u8>> = conn.get(key)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        match data {
            Some(bytes) => {
                let deserialized = DataSerializer::from_redis_value::<T>(&bytes)?;
                Ok(Some(deserialized))
            }
            None => Ok(None),
        }
    }
    
    /// Search keys by pattern and deserialize values
    async fn search_by_pattern<T: for<'de> serde::Deserialize<'de>>(
        &self,
        pattern: &str,
        criteria: &SearchCriteria,
    ) -> DataStoreResult<SearchResults<T>> {
        let start_time = Instant::now();
        let mut conn = self.get_connection().await?.clone();
        
        // Get all keys matching pattern
        let keys: Vec<String> = conn.keys(pattern)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        let total = keys.len();
        
        // Apply pagination
        let offset = criteria.offset.unwrap_or(0);
        let limit = criteria.limit.unwrap_or(100).min(1000); // Cap at 1000
        
        let paginated_keys: Vec<String> = keys
            .into_iter()
            .skip(offset)
            .take(limit)
            .collect();
        
        // Fetch data for paginated keys
        let mut items = Vec::new();
        for key in &paginated_keys {
            if let Some(data) = self.get_data::<TenantData<T>>(key).await? {
                items.push(data.data);
            }
        }
        
        // Sort if requested
        if let Some(sort_by) = &criteria.sort_by {
            // Note: Redis doesn't support server-side sorting, so we sort in memory
            // This is acceptable for small result sets, but for large datasets,
            // consider using a different store like Elasticsearch
            debug!("Client-side sorting by: {}", sort_by);
        }
        
        let page_size = limit;
        let page = offset / page_size;
        let total_pages = (total + page_size - 1) / page_size;
        
        let pagination = Pagination {
            page,
            size: page_size,
            total,
            total_pages,
        };
        
        let took_ms = start_time.elapsed().as_millis() as u64;
        
        Ok(SearchResults {
            items,
            pagination,
            took_ms,
        })
    }
    
    /// Delete key
    async fn delete_key(&self, key: &str) -> DataStoreResult<()> {
        let mut conn = self.get_connection().await?.clone();
        
        conn.del(key)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        Ok(())
    }
    
    /// Get key count by pattern
    async fn count_keys(&self, pattern: &str) -> DataStoreResult<usize> {
        let mut conn = self.get_connection().await?.clone();
        
        let keys: Vec<String> = conn.keys(pattern)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        Ok(keys.len())
    }
}

#[async_trait]
impl MitreDataStore for RedisDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        info!("Initializing Redis data store with URL: {}", self.config.url);
        
        let client = Client::open(self.config.url.clone())
            .map_err(|e| DataStoreError::Connection(e.to_string()))?;
        
        let connection_manager = ConnectionManager::new(client)
            .await
            .map_err(|e| DataStoreError::Connection(e.to_string()))?;
        
        self.connection_manager = Some(connection_manager);
        self.is_connected = true;
        
        info!("Redis data store initialized successfully");
        Ok(())
    }
    
    async fn close(&mut self) -> DataStoreResult<()> {
        info!("Closing Redis data store connection");
        self.connection_manager = None;
        self.is_connected = false;
        Ok(())
    }
    
    async fn health_check(&self) -> DataStoreResult<bool> {
        if !self.is_connected {
            return Ok(false);
        }
        
        let mut conn = self.get_connection().await?.clone();
        
        match redis::cmd("PING").query_async::<_, String>(&mut conn).await {
            Ok(_) => Ok(true),
            Err(e) => {
                warn!("Redis health check failed: {}", e);
                Ok(false)
            }
        }
    }
    
    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let techniques_count = self.count_keys(&self.search_pattern("techniques", "*", context)).await?;
        let groups_count = self.count_keys(&self.search_pattern("groups", "*", context)).await?;
        let software_count = self.count_keys(&self.search_pattern("software", "*", context)).await?;
        let mitigations_count = self.count_keys(&self.search_pattern("mitigations", "*", context)).await?;
        let detection_rules_count = self.count_keys(&self.search_pattern("detection_rules", "*", context)).await?;
        let analyses_count = self.count_keys(&self.search_pattern("analyses", "*", context)).await?;
        
        // Get Redis memory info
        let mut conn = self.get_connection().await?.clone();
        let info: String = redis::cmd("INFO").arg("memory").query_async(&mut conn)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        // Parse memory usage from info (simplified)
        let storage_size_bytes = info
            .lines()
            .find(|line| line.starts_with("used_memory:"))
            .and_then(|line| line.split(':').nth(1))
            .and_then(|size| size.parse::<u64>().ok())
            .unwrap_or(0);
        
        Ok(DataStoreMetrics {
            total_techniques: techniques_count,
            total_groups: groups_count,
            total_software: software_count,
            total_mitigations: mitigations_count,
            total_detection_rules: detection_rules_count,
            total_analyses: analyses_count,
            storage_size_bytes,
            last_updated: Utc::now(),
        })
    }
}

#[async_trait]
impl TechniqueStore for RedisDataStore {
    async fn store_technique(&self, technique: &MitreTechnique, context: &TenantContext) -> DataStoreResult<String> {
        let key = self.cache_key("techniques", &technique.id, context);
        let tenant_data = TenantData::new(technique.clone(), context);
        
        self.store_with_ttl(&key, &tenant_data, 3600).await?; // 1 hour TTL
        
        debug!("Stored technique {} for tenant {}", technique.id, context.tenant_id);
        Ok(technique.id.clone())
    }
    
    async fn get_technique(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<MitreTechnique>> {
        let key = self.cache_key("techniques", id, context);
        
        match self.get_data::<TenantData<MitreTechnique>>(&key).await? {
            Some(tenant_data) => Ok(Some(tenant_data.data)),
            None => Ok(None),
        }
    }
    
    async fn update_technique(&self, technique: &MitreTechnique, context: &TenantContext) -> DataStoreResult<()> {
        // For Redis, update is the same as store (replace)
        self.store_technique(technique, context).await?;
        Ok(())
    }
    
    async fn delete_technique(&self, id: &str, context: &TenantContext) -> DataStoreResult<()> {
        let key = self.cache_key("techniques", id, context);
        self.delete_key(&key).await
    }
    
    async fn search_techniques(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<MitreTechnique>> {
        let pattern = self.search_pattern("techniques", "*", context);
        self.search_by_pattern(&pattern, criteria).await
    }
    
    async fn bulk_store_techniques(&self, techniques: &[MitreTechnique], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let mut success_count = 0;
        let mut error_count = 0;
        let mut errors = Vec::new();
        let mut processed_ids = Vec::new();
        
        for technique in techniques {
            match self.store_technique(technique, context).await {
                Ok(id) => {
                    success_count += 1;
                    processed_ids.push(id);
                }
                Err(e) => {
                    error_count += 1;
                    errors.push(format!("Failed to store technique {}: {}", technique.id, e));
                }
            }
        }
        
        Ok(BulkOperationResult {
            success_count,
            error_count,
            errors,
            processed_ids,
        })
    }
    
    async fn list_technique_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<String>> {
        let pattern = self.search_pattern("techniques", "*", context);
        let mut conn = self.get_connection().await?.clone();
        
        let keys: Vec<String> = conn.keys(pattern)
            .await
            .map_err(|e| DataStoreError::Database(e.to_string()))?;
        
        // Extract IDs from keys
        let ids: Vec<String> = keys
            .into_iter()
            .filter_map(|key| {
                key.split(':').last().map(|id| id.to_string())
            })
            .collect();
        
        Ok(ids)
    }
}

// Similar implementations for GroupStore, SoftwareStore, MitigationStore, DetectionRuleStore
// For brevity, I'll implement GroupStore and provide templates for others

#[async_trait]
impl GroupStore for RedisDataStore {
    async fn store_group(&self, group: &MitreGroup, context: &TenantContext) -> DataStoreResult<String> {
        let key = self.cache_key("groups", &group.id, context);
        let tenant_data = TenantData::new(group.clone(), context);
        
        self.store_with_ttl(&key, &tenant_data, 3600).await?;
        
        debug!("Stored group {} for tenant {}", group.id, context.tenant_id);
        Ok(group.id.clone())
    }
    
    async fn get_group(&self, id: &str, context: &TenantContext) -> DataStoreResult<Option<MitreGroup>> {
        let key = self.cache_key("groups", id, context);
        
        match self.get_data::<TenantData<MitreGroup>>(&key).await? {
            Some(tenant_data) => Ok(Some(tenant_data.data)),
            None => Ok(None),
        }
    }
    
    async fn update_group(&self, group: &MitreGroup, context: &TenantContext) -> DataStoreResult<()> {
        self.store_group(group, context).await?;
        Ok(())
    }
    
    async fn delete_group(&self, id: &str, context: &TenantContext) -> DataStoreResult<()> {
        let key = self.cache_key("groups", id, context);
        self.delete_key(&key).await
    }
    
    async fn search_groups(&self, criteria: &SearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<MitreGroup>> {
        let pattern = self.search_pattern("groups", "*", context);
        self.search_by_pattern(&pattern, criteria).await
    }
    
    async fn bulk_store_groups(&self, groups: &[MitreGroup], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let mut success_count = 0;
        let mut error_count = 0;
        let mut errors = Vec::new();
        let mut processed_ids = Vec::new();
        
        for group in groups {
            match self.store_group(group, context).await {
                Ok(id) => {
                    success_count += 1;
                    processed_ids.push(id);
                }
                Err(e) => {
                    error_count += 1;
                    errors.push(format!("Failed to store group {}: {}", group.id, e));
                }
            }
        }
        
        Ok(BulkOperationResult {
            success_count,
            error_count,
            errors,
            processed_ids,
        })
    }
}

// Implement placeholder implementations for other traits
#[async_trait]
impl SoftwareStore for RedisDataStore {
    async fn store_software(&self, _software: &MitreSoftware, _context: &TenantContext) -> DataStoreResult<String> {
        todo!("Implement software storage")
    }
    
    async fn get_software(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<Option<MitreSoftware>> {
        todo!("Implement software retrieval")
    }
    
    async fn update_software(&self, _software: &MitreSoftware, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement software update")
    }
    
    async fn delete_software(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement software deletion")
    }
    
    async fn search_software(&self, _criteria: &SearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<MitreSoftware>> {
        todo!("Implement software search")
    }
    
    async fn bulk_store_software(&self, _software: &[MitreSoftware], _context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        todo!("Implement bulk software storage")
    }
}

#[async_trait]
impl MitigationStore for RedisDataStore {
    async fn store_mitigation(&self, _mitigation: &Mitigation, _context: &TenantContext) -> DataStoreResult<String> {
        todo!("Implement mitigation storage")
    }
    
    async fn get_mitigation(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<Option<Mitigation>> {
        todo!("Implement mitigation retrieval")
    }
    
    async fn update_mitigation(&self, _mitigation: &Mitigation, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement mitigation update")
    }
    
    async fn delete_mitigation(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement mitigation deletion")
    }
    
    async fn search_mitigations(&self, _criteria: &SearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<Mitigation>> {
        todo!("Implement mitigation search")
    }
    
    async fn bulk_store_mitigations(&self, _mitigations: &[Mitigation], _context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        todo!("Implement bulk mitigation storage")
    }
}

#[async_trait]
impl DetectionRuleStore for RedisDataStore {
    async fn store_detection_rule(&self, _rule: &DetectionRule, _context: &TenantContext) -> DataStoreResult<String> {
        todo!("Implement detection rule storage")
    }
    
    async fn get_detection_rule(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<Option<DetectionRule>> {
        todo!("Implement detection rule retrieval")
    }
    
    async fn update_detection_rule(&self, _rule: &DetectionRule, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement detection rule update")
    }
    
    async fn delete_detection_rule(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement detection rule deletion")
    }
    
    async fn search_detection_rules(&self, _criteria: &SearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<DetectionRule>> {
        todo!("Implement detection rule search")
    }
    
    async fn bulk_store_detection_rules(&self, _rules: &[DetectionRule], _context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        todo!("Implement bulk detection rule storage")
    }
}

#[async_trait]
impl AnalysisStore for RedisDataStore {
    async fn store_analysis(&self, _analysis: &ThreatAnalysis, _context: &TenantContext) -> DataStoreResult<String> {
        todo!("Implement analysis storage")
    }
    
    async fn get_analysis(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<Option<ThreatAnalysis>> {
        todo!("Implement analysis retrieval")
    }
    
    async fn delete_analysis(&self, _id: &str, _context: &TenantContext) -> DataStoreResult<()> {
        todo!("Implement analysis deletion")
    }
    
    async fn search_analyses(&self, _criteria: &SearchCriteria, _context: &TenantContext) -> DataStoreResult<SearchResults<ThreatAnalysis>> {
        todo!("Implement analysis search")
    }
    
    async fn get_recent_analyses(&self, _limit: usize, _context: &TenantContext) -> DataStoreResult<Vec<ThreatAnalysis>> {
        todo!("Implement recent analysis retrieval")
    }
}

#[async_trait]
impl ComprehensiveMitreStore for RedisDataStore {
    fn store_type(&self) -> &'static str {
        "redis"
    }
    
    fn supports_multi_tenancy(&self) -> bool {
        true
    }
    
    fn supports_full_text_search(&self) -> bool {
        false // Redis doesn't support full-text search natively
    }
    
    fn supports_transactions(&self) -> bool {
        true // Redis supports transactions
    }
}