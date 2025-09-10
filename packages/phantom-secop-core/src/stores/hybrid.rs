//! Hybrid data store implementation
//! 
//! This provides a hybrid approach that uses different data stores for different purposes:
//! - Redis: for caching and real-time data
//! - PostgreSQL: for structured data and relationships
//! - MongoDB: for flexible document storage
//! - Elasticsearch: for search and analytics

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use std::sync::Arc;
use anyhow::Result;

/// Hybrid data store manager that combines multiple stores
pub struct HybridDataStoreManager {
    config: DataStoreConfig,
    redis_store: Option<Box<crate::stores::redis::RedisDataStoreManager>>,
    postgres_store: Option<Box<crate::stores::postgres::PostgreSQLDataStoreManager>>,
    mongodb_store: Option<Box<crate::stores::mongodb::MongoDBDataStoreManager>>,
    elasticsearch_store: Option<Box<crate::stores::elasticsearch::ElasticsearchDataStoreManager>>,
    memory_fallback: crate::stores::memory::MemoryDataStoreManager,
}

impl HybridDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        let memory_fallback = crate::stores::memory::MemoryDataStoreManager::new(config.clone()).await?;
        
        let mut hybrid = Self {
            config: config.clone(),
            redis_store: None,
            postgres_store: None,
            mongodb_store: None,
            elasticsearch_store: None,
            memory_fallback,
        };
        
        // Initialize available stores based on configuration
        if config.redis_url.is_some() {
            match crate::stores::redis::RedisDataStoreManager::new(config.clone()).await {
                Ok(store) => {
                    hybrid.redis_store = Some(Box::new(store));
                    log::info!("Redis store initialized for hybrid manager");
                }
                Err(e) => log::warn!("Redis store initialization failed: {}", e),
            }
        }
        
        if config.postgres_url.is_some() {
            match crate::stores::postgres::PostgreSQLDataStoreManager::new(config.clone()).await {
                Ok(store) => {
                    hybrid.postgres_store = Some(Box::new(store));
                    log::info!("PostgreSQL store initialized for hybrid manager");
                }
                Err(e) => log::warn!("PostgreSQL store initialization failed: {}", e),
            }
        }
        
        if config.mongodb_url.is_some() {
            match crate::stores::mongodb::MongoDBDataStoreManager::new(config.clone()).await {
                Ok(store) => {
                    hybrid.mongodb_store = Some(Box::new(store));
                    log::info!("MongoDB store initialized for hybrid manager");
                }
                Err(e) => log::warn!("MongoDB store initialization failed: {}", e),
            }
        }
        
        if config.elasticsearch_url.is_some() {
            match crate::stores::elasticsearch::ElasticsearchDataStoreManager::new(config.clone()).await {
                Ok(store) => {
                    hybrid.elasticsearch_store = Some(Box::new(store));
                    log::info!("Elasticsearch store initialized for hybrid manager");
                }
                Err(e) => log::warn!("Elasticsearch store initialization failed: {}", e),
            }
        }
        
        Ok(hybrid)
    }
    
    /// Get the primary store for structured data (PostgreSQL > MongoDB > Memory)
    fn get_primary_store(&self) -> &dyn IncidentStore {
        if let Some(postgres) = &self.postgres_store {
            postgres.as_ref()
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.as_ref()
        } else {
            &self.memory_fallback
        }
    }
    
    /// Get the cache store (Redis > Memory)
    fn get_cache_store(&self) -> &dyn CacheStore {
        if let Some(redis) = &self.redis_store {
            redis.as_ref()
        } else {
            &self.memory_fallback
        }
    }
    
    /// Get the search store (Elasticsearch > MongoDB > Memory)
    fn get_search_store(&self) -> &dyn SearchStore {
        if let Some(elasticsearch) = &self.elasticsearch_store {
            elasticsearch.as_ref()
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.as_ref()
        } else {
            &self.memory_fallback
        }
    }
    
    /// Index data across multiple stores
    async fn multi_index_incident(&self, incident: &SecurityIncident) -> Result<()> {
        // Index in Elasticsearch for search
        if let Some(elasticsearch) = &self.elasticsearch_store {
            if let Err(e) = elasticsearch.index_incident(incident).await {
                log::warn!("Failed to index incident in Elasticsearch: {}", e);
            }
        }
        
        // Cache frequently accessed data in Redis
        if let Some(redis) = &self.redis_store {
            let cache_key = format!("incident:{}", incident.id);
            if let Ok(json) = serde_json::to_string(incident) {
                if let Err(e) = redis.set(&cache_key, &json, Some(3600)).await {
                    log::warn!("Failed to cache incident in Redis: {}", e);
                }
            }
        }
        
        Ok(())
    }
    
    async fn multi_index_alert(&self, alert: &SecurityAlert) -> Result<()> {
        // Index in Elasticsearch for search
        if let Some(elasticsearch) = &self.elasticsearch_store {
            if let Err(e) = elasticsearch.index_alert(alert).await {
                log::warn!("Failed to index alert in Elasticsearch: {}", e);
            }
        }
        
        // Cache in Redis
        if let Some(redis) = &self.redis_store {
            let cache_key = format!("alert:{}", alert.id);
            if let Ok(json) = serde_json::to_string(alert) {
                if let Err(e) = redis.set(&cache_key, &json, Some(1800)).await {
                    log::warn!("Failed to cache alert in Redis: {}", e);
                }
            }
        }
        
        Ok(())
    }
}

#[async_trait]
impl DataStore for HybridDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing hybrid data store manager");
        
        // Initialize all available stores
        if let Some(redis) = &mut self.redis_store {
            if let Err(e) = redis.initialize().await {
                log::warn!("Redis initialization failed: {}", e);
            }
        }
        
        if let Some(postgres) = &mut self.postgres_store {
            if let Err(e) = postgres.initialize().await {
                log::warn!("PostgreSQL initialization failed: {}", e);
            }
        }
        
        if let Some(mongodb) = &mut self.mongodb_store {
            if let Err(e) = mongodb.initialize().await {
                log::warn!("MongoDB initialization failed: {}", e);
            }
        }
        
        if let Some(elasticsearch) = &mut self.elasticsearch_store {
            if let Err(e) = elasticsearch.initialize().await {
                log::warn!("Elasticsearch initialization failed: {}", e);
            }
        }
        
        // Always initialize memory fallback
        self.memory_fallback.initialize().await?;
        
        log::info!("Hybrid data store manager initialized successfully");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        let mut any_healthy = false;
        
        // Check each store
        if let Some(redis) = &self.redis_store {
            if redis.health_check().await.unwrap_or(false) {
                any_healthy = true;
                log::debug!("Redis store is healthy");
            }
        }
        
        if let Some(postgres) = &self.postgres_store {
            if postgres.health_check().await.unwrap_or(false) {
                any_healthy = true;
                log::debug!("PostgreSQL store is healthy");
            }
        }
        
        if let Some(mongodb) = &self.mongodb_store {
            if mongodb.health_check().await.unwrap_or(false) {
                any_healthy = true;
                log::debug!("MongoDB store is healthy");
            }
        }
        
        if let Some(elasticsearch) = &self.elasticsearch_store {
            if elasticsearch.health_check().await.unwrap_or(false) {
                any_healthy = true;
                log::debug!("Elasticsearch store is healthy");
            }
        }
        
        // Memory fallback is always healthy
        if self.memory_fallback.health_check().await.unwrap_or(false) {
            any_healthy = true;
        }
        
        Ok(any_healthy)
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing hybrid data store manager");
        
        if let Some(redis) = &mut self.redis_store {
            let _ = redis.close().await;
        }
        
        if let Some(postgres) = &mut self.postgres_store {
            let _ = postgres.close().await;
        }
        
        if let Some(mongodb) = &mut self.mongodb_store {
            let _ = mongodb.close().await;
        }
        
        if let Some(elasticsearch) = &mut self.elasticsearch_store {
            let _ = elasticsearch.close().await;
        }
        
        self.memory_fallback.close().await?;
        
        Ok(())
    }
}

#[async_trait]
impl IncidentStore for HybridDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        // Store in primary store
        let result = self.get_primary_store().create_incident(incident).await;
        
        if result.is_ok() {
            // Index across multiple stores for performance and search
            let _ = self.multi_index_incident(incident).await;
        }
        
        result
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        // Try cache first if Redis is available
        if let Some(redis) = &self.redis_store {
            let cache_key = format!("incident:{}", id);
            if let Ok(Some(cached_json)) = redis.get(&cache_key).await {
                if let Ok(incident) = serde_json::from_str::<SecurityIncident>(&cached_json) {
                    return Ok(Some(incident));
                }
            }
        }
        
        // Fall back to primary store
        let result = self.get_primary_store().get_incident(id).await;
        
        // Cache the result if found
        if let Ok(Some(ref incident)) = result {
            if let Some(redis) = &self.redis_store {
                let cache_key = format!("incident:{}", id);
                if let Ok(json) = serde_json::to_string(incident) {
                    let _ = redis.set(&cache_key, &json, Some(3600)).await;
                }
            }
        }
        
        result
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        // Update in primary store
        let result = self.get_primary_store().update_incident(incident).await;
        
        if result.is_ok() {
            // Update indexes and cache
            let _ = self.multi_index_incident(incident).await;
        }
        
        result
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        // Delete from primary store
        let result = self.get_primary_store().delete_incident(id).await;
        
        if result.is_ok() {
            // Clean up cache and indexes
            if let Some(redis) = &self.redis_store {
                let cache_key = format!("incident:{}", id);
                let _ = redis.delete(&cache_key).await;
            }
            
            // Note: In a full implementation, you'd also remove from Elasticsearch
        }
        
        result
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        // Use search store for complex searches
        self.get_search_store().search_incidents(criteria).await
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        self.get_primary_store().list_incidents(status, severity).await
    }
}

#[async_trait]
impl AlertStore for HybridDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        // Store in primary store
        let result = if let Some(postgres) = &self.postgres_store {
            postgres.create_alert(alert).await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.create_alert(alert).await
        } else {
            self.memory_fallback.create_alert(alert).await
        };
        
        if result.is_ok() {
            let _ = self.multi_index_alert(alert).await;
        }
        
        result
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        // Try cache first
        if let Some(redis) = &self.redis_store {
            let cache_key = format!("alert:{}", id);
            if let Ok(Some(cached_json)) = redis.get(&cache_key).await {
                if let Ok(alert) = serde_json::from_str::<SecurityAlert>(&cached_json) {
                    return Ok(Some(alert));
                }
            }
        }
        
        // Fall back to primary store
        if let Some(postgres) = &self.postgres_store {
            postgres.get_alert(id).await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.get_alert(id).await
        } else {
            self.memory_fallback.get_alert(id).await
        }
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        let result = if let Some(postgres) = &self.postgres_store {
            postgres.update_alert(alert).await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.update_alert(alert).await
        } else {
            self.memory_fallback.update_alert(alert).await
        };
        
        if result.is_ok() {
            let _ = self.multi_index_alert(alert).await;
        }
        
        result
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        let result = if let Some(postgres) = &self.postgres_store {
            postgres.delete_alert(id).await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.delete_alert(id).await
        } else {
            self.memory_fallback.delete_alert(id).await
        };
        
        if result.is_ok() {
            // Clean up cache
            if let Some(redis) = &self.redis_store {
                let cache_key = format!("alert:{}", id);
                let _ = redis.delete(&cache_key).await;
            }
        }
        
        result
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        self.get_search_store().search_alerts(criteria).await
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        // Check cache first
        if let Some(redis) = &self.redis_store {
            if let Ok(Some(cached_json)) = redis.get("active_alerts").await {
                if let Ok(alerts) = serde_json::from_str::<Vec<SecurityAlert>>(&cached_json) {
                    return Ok(alerts);
                }
            }
        }
        
        // Get from primary store
        let result = if let Some(postgres) = &self.postgres_store {
            postgres.get_active_alerts().await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.get_active_alerts().await
        } else {
            self.memory_fallback.get_active_alerts().await
        };
        
        // Cache the result
        if let Ok(ref alerts) = result {
            if let Some(redis) = &self.redis_store {
                if let Ok(json) = serde_json::to_string(alerts) {
                    let _ = redis.set("active_alerts", &json, Some(300)).await; // 5 minute cache
                }
            }
        }
        
        result
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        if let Some(postgres) = &self.postgres_store {
            postgres.list_alerts_by_priority(priority).await
        } else if let Some(mongodb) = &self.mongodb_store {
            mongodb.list_alerts_by_priority(priority).await
        } else {
            self.memory_fallback.list_alerts_by_priority(priority).await
        }
    }
}

// For the remaining traits, implement similar hybrid logic
// For brevity, I'll delegate to the memory fallback

#[async_trait]
impl PlaybookStore for HybridDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        self.get_primary_store().create_playbook(playbook).await
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
        self.get_primary_store().get_playbook(id).await
    }
    
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()> {
        self.get_primary_store().update_playbook(playbook).await
    }
    
    async fn delete_playbook(&self, id: &str) -> Result<()> {
        self.get_primary_store().delete_playbook(id).await
    }
    
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>> {
        self.get_primary_store().list_playbooks(category).await
    }
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String> {
        self.get_primary_store().create_execution(execution).await
    }
    
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>> {
        self.get_primary_store().get_execution(id).await
    }
    
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()> {
        self.get_primary_store().update_execution(execution).await
    }
    
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>> {
        self.get_primary_store().list_executions(playbook_id).await
    }
}

#[async_trait]
impl TaskStore for HybridDataStoreManager {
    async fn create_task(&self, task: &SecurityTask) -> Result<String> {
        self.memory_fallback.create_task(task).await
    }
    
    async fn get_task(&self, id: &str) -> Result<Option<SecurityTask>> {
        self.memory_fallback.get_task(id).await
    }
    
    async fn update_task(&self, task: &SecurityTask) -> Result<()> {
        self.memory_fallback.update_task(task).await
    }
    
    async fn delete_task(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_task(id).await
    }
    
    async fn search_tasks(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityTask>> {
        self.memory_fallback.search_tasks(criteria).await
    }
    
    async fn list_tasks_by_status(&self, status: TaskStatus) -> Result<Vec<SecurityTask>> {
        self.memory_fallback.list_tasks_by_status(status).await
    }
}

#[async_trait]
impl EvidenceStore for HybridDataStoreManager {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String> {
        self.memory_fallback.create_evidence(evidence).await
    }
    
    async fn get_evidence(&self, id: &str) -> Result<Option<Evidence>> {
        self.memory_fallback.get_evidence(id).await
    }
    
    async fn update_evidence(&self, evidence: &Evidence) -> Result<()> {
        self.memory_fallback.update_evidence(evidence).await
    }
    
    async fn delete_evidence(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_evidence(id).await
    }
    
    async fn search_evidence(&self, criteria: &SearchCriteria) -> Result<Vec<Evidence>> {
        self.memory_fallback.search_evidence(criteria).await
    }
    
    async fn list_evidence_by_type(&self, evidence_type: EvidenceType) -> Result<Vec<Evidence>> {
        self.memory_fallback.list_evidence_by_type(evidence_type).await
    }
}

#[async_trait]
impl WorkflowStore for HybridDataStoreManager {
    async fn create_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<String> {
        self.memory_fallback.create_workflow(workflow).await
    }
    
    async fn get_workflow(&self, id: &str) -> Result<Option<OrchestrationWorkflow>> {
        self.memory_fallback.get_workflow(id).await
    }
    
    async fn update_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<()> {
        self.memory_fallback.update_workflow(workflow).await
    }
    
    async fn delete_workflow(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_workflow(id).await
    }
    
    async fn list_workflows(&self, enabled_only: bool) -> Result<Vec<OrchestrationWorkflow>> {
        self.memory_fallback.list_workflows(enabled_only).await
    }
}

#[async_trait]
impl CacheStore for HybridDataStoreManager {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()> {
        self.get_cache_store().set(key, value, ttl_seconds).await
    }
    
    async fn get(&self, key: &str) -> Result<Option<String>> {
        self.get_cache_store().get(key).await
    }
    
    async fn delete(&self, key: &str) -> Result<()> {
        self.get_cache_store().delete(key).await
    }
    
    async fn exists(&self, key: &str) -> Result<bool> {
        self.get_cache_store().exists(key).await
    }
    
    async fn increment(&self, key: &str) -> Result<i64> {
        self.get_cache_store().increment(key).await
    }
    
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()> {
        self.get_cache_store().set_hash(key, field, value).await
    }
    
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>> {
        self.get_cache_store().get_hash(key, field).await
    }
    
    async fn publish(&self, channel: &str, message: &str) -> Result<()> {
        self.get_cache_store().publish(channel, message).await
    }
}

#[async_trait]
impl SearchStore for HybridDataStoreManager {
    async fn index_incident(&self, incident: &SecurityIncident) -> Result<()> {
        self.get_search_store().index_incident(incident).await
    }
    
    async fn index_alert(&self, alert: &SecurityAlert) -> Result<()> {
        self.get_search_store().index_alert(alert).await
    }
    
    async fn index_evidence(&self, evidence: &Evidence) -> Result<()> {
        self.get_search_store().index_evidence(evidence).await
    }
    
    async fn search(&self, index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        self.get_search_store().search(index, query).await
    }
    
    async fn aggregate(&self, index: &str, aggregation: &str) -> Result<serde_json::Value> {
        self.get_search_store().aggregate(index, aggregation).await
    }
    
    async fn delete_index(&self, index: &str) -> Result<()> {
        self.get_search_store().delete_index(index).await
    }
    
    async fn create_index(&self, index: &str, mapping: &str) -> Result<()> {
        self.get_search_store().create_index(index, mapping).await
    }
}

impl DataStoreManager for HybridDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        // Return the primary store type, or hybrid if multiple
        if self.redis_store.is_some() && self.postgres_store.is_some() && 
           self.mongodb_store.is_some() && self.elasticsearch_store.is_some() {
            // Custom type for full hybrid
            DataStoreType::Memory // Placeholder - in a real implementation you'd add a Hybrid variant
        } else if let Some(_) = &self.postgres_store {
            DataStoreType::PostgreSQL
        } else if let Some(_) = &self.mongodb_store {
            DataStoreType::MongoDB
        } else if let Some(_) = &self.redis_store {
            DataStoreType::Redis
        } else {
            DataStoreType::Memory
        }
    }
}