//! Redis data store implementation
//! 
//! This provides Redis-based storage for caching, real-time data, and high-performance
//! operations with support for pub/sub messaging.

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use redis::{Client, AsyncCommands};
use redis::aio::ConnectionManager;
use std::sync::Arc;
use tokio::sync::RwLock;
use anyhow::{Result, anyhow};
use serde_json;

/// Redis data store manager
pub struct RedisDataStoreManager {
    config: DataStoreConfig,
    connection: Arc<RwLock<Option<ConnectionManager>>>,
    // Fallback to memory store for complex data operations
    memory_fallback: crate::stores::memory::MemoryDataStoreManager,
}

impl RedisDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        let memory_fallback = crate::stores::memory::MemoryDataStoreManager::new(config.clone()).await?;
        
        Ok(Self {
            config,
            connection: Arc::new(RwLock::new(None)),
            memory_fallback,
        })
    }
    
    async fn get_connection(&self) -> Result<ConnectionManager> {
        let mut conn_guard = self.connection.write().await;
        
        if conn_guard.is_none() {
            let redis_url = self.config.redis_url
                .as_ref()
                .ok_or_else(|| anyhow!("Redis URL not configured"))?;
                
            log::info!("Connecting to Redis at: {}", redis_url);
            
            let client = Client::open(redis_url.as_str())?;
            let connection_manager = ConnectionManager::new(client).await?;
            *conn_guard = Some(connection_manager.clone());
            
            log::info!("Redis connection established");
            Ok(connection_manager)
        } else {
            Ok(conn_guard.as_ref().unwrap().clone())
        }
    }
    
    async fn serialize_and_store<T: serde::Serialize>(&self, key: &str, value: &T, ttl_seconds: Option<u64>) -> Result<()> {
        let json_value = serde_json::to_string(value)?;
        self.set(key, &json_value, ttl_seconds).await
    }
    
    async fn get_and_deserialize<T: serde::de::DeserializeOwned>(&self, key: &str) -> Result<Option<T>> {
        if let Some(json_str) = self.get(key).await? {
            let value: T = serde_json::from_str(&json_str)?;
            Ok(Some(value))
        } else {
            Ok(None)
        }
    }
    
    fn get_key(&self, prefix: &str, id: &str) -> String {
        format!("phantom:secop:{}:{}", prefix, id)
    }
}

#[async_trait]
impl DataStore for RedisDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing Redis data store");
        
        // Test the connection
        let _conn = self.get_connection().await?;
        
        // Initialize the memory fallback
        self.memory_fallback.initialize().await?;
        
        log::info!("Redis data store initialized successfully");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        match self.get_connection().await {
            Ok(mut conn) => {
                match conn.ping::<String>().await {
                    Ok(_) => Ok(true),
                    Err(e) => {
                        log::warn!("Redis health check failed: {}", e);
                        Ok(false)
                    }
                }
            }
            Err(e) => {
                log::warn!("Redis connection failed: {}", e);
                Ok(false)
            }
        }
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing Redis data store");
        let mut conn_guard = self.connection.write().await;
        *conn_guard = None;
        self.memory_fallback.close().await?;
        Ok(())
    }
}

// For Redis, we'll primarily use it for caching and real-time data
// Complex operations will fall back to the memory store
#[async_trait]
impl IncidentStore for RedisDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        // Store in Redis with TTL for caching
        let key = self.get_key("incident", &incident.id);
        self.serialize_and_store(&key, incident, Some(3600)).await?; // 1 hour TTL
        
        // Also store in memory fallback for complex queries
        self.memory_fallback.create_incident(incident).await
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        let key = self.get_key("incident", id);
        
        // Try Redis first
        if let Some(incident) = self.get_and_deserialize::<SecurityIncident>(&key).await? {
            return Ok(Some(incident));
        }
        
        // Fallback to memory store
        if let Some(incident) = self.memory_fallback.get_incident(id).await? {
            // Cache it in Redis for future requests
            self.serialize_and_store(&key, &incident, Some(3600)).await?;
            return Ok(Some(incident));
        }
        
        Ok(None)
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        let key = self.get_key("incident", &incident.id);
        self.serialize_and_store(&key, incident, Some(3600)).await?;
        self.memory_fallback.update_incident(incident).await
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        let key = self.get_key("incident", id);
        self.delete(&key).await?;
        self.memory_fallback.delete_incident(id).await
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        // For complex searches, use memory fallback
        self.memory_fallback.search_incidents(criteria).await
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        self.memory_fallback.list_incidents(status, severity).await
    }
}

#[async_trait]
impl AlertStore for RedisDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        let key = self.get_key("alert", &alert.id);
        self.serialize_and_store(&key, alert, Some(7200)).await?; // 2 hour TTL
        self.memory_fallback.create_alert(alert).await
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        let key = self.get_key("alert", id);
        
        if let Some(alert) = self.get_and_deserialize::<SecurityAlert>(&key).await? {
            return Ok(Some(alert));
        }
        
        if let Some(alert) = self.memory_fallback.get_alert(id).await? {
            self.serialize_and_store(&key, &alert, Some(7200)).await?;
            return Ok(Some(alert));
        }
        
        Ok(None)
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        let key = self.get_key("alert", &alert.id);
        self.serialize_and_store(&key, alert, Some(7200)).await?;
        self.memory_fallback.update_alert(alert).await
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        let key = self.get_key("alert", id);
        self.delete(&key).await?;
        self.memory_fallback.delete_alert(id).await
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.search_alerts(criteria).await
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        // Check Redis cache first
        let cache_key = "phantom:secop:active_alerts";
        
        if let Some(alerts_json) = self.get(cache_key).await? {
            if let Ok(alerts) = serde_json::from_str::<Vec<SecurityAlert>>(&alerts_json) {
                return Ok(alerts);
            }
        }
        
        // Get from memory store and cache
        let alerts = self.memory_fallback.get_active_alerts().await?;
        let alerts_json = serde_json::to_string(&alerts)?;
        self.set(cache_key, &alerts_json, Some(300)).await?; // 5 minute cache
        
        Ok(alerts)
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.list_alerts_by_priority(priority).await
    }
}

#[async_trait]
impl PlaybookStore for RedisDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        let key = self.get_key("playbook", &playbook.id);
        self.serialize_and_store(&key, playbook, Some(86400)).await?; // 24 hour TTL
        self.memory_fallback.create_playbook(playbook).await
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
        let key = self.get_key("playbook", id);
        
        if let Some(playbook) = self.get_and_deserialize::<SecurityPlaybook>(&key).await? {
            return Ok(Some(playbook));
        }
        
        if let Some(playbook) = self.memory_fallback.get_playbook(id).await? {
            self.serialize_and_store(&key, &playbook, Some(86400)).await?;
            return Ok(Some(playbook));
        }
        
        Ok(None)
    }
    
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()> {
        let key = self.get_key("playbook", &playbook.id);
        self.serialize_and_store(&key, playbook, Some(86400)).await?;
        self.memory_fallback.update_playbook(playbook).await
    }
    
    async fn delete_playbook(&self, id: &str) -> Result<()> {
        let key = self.get_key("playbook", id);
        self.delete(&key).await?;
        self.memory_fallback.delete_playbook(id).await
    }
    
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>> {
        self.memory_fallback.list_playbooks(category).await
    }
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String> {
        let key = self.get_key("execution", &execution.id);
        self.serialize_and_store(&key, execution, Some(3600)).await?; // 1 hour TTL
        self.memory_fallback.create_execution(execution).await
    }
    
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>> {
        let key = self.get_key("execution", id);
        
        if let Some(execution) = self.get_and_deserialize::<PlaybookExecution>(&key).await? {
            return Ok(Some(execution));
        }
        
        if let Some(execution) = self.memory_fallback.get_execution(id).await? {
            self.serialize_and_store(&key, &execution, Some(3600)).await?;
            return Ok(Some(execution));
        }
        
        Ok(None)
    }
    
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()> {
        let key = self.get_key("execution", &execution.id);
        self.serialize_and_store(&key, execution, Some(3600)).await?;
        self.memory_fallback.update_execution(execution).await
    }
    
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>> {
        self.memory_fallback.list_executions(playbook_id).await
    }
}

#[async_trait]
impl TaskStore for RedisDataStoreManager {
    async fn create_task(&self, task: &SecurityTask) -> Result<String> {
        let key = self.get_key("task", &task.id);
        self.serialize_and_store(&key, task, Some(3600)).await?;
        self.memory_fallback.create_task(task).await
    }
    
    async fn get_task(&self, id: &str) -> Result<Option<SecurityTask>> {
        let key = self.get_key("task", id);
        
        if let Some(task) = self.get_and_deserialize::<SecurityTask>(&key).await? {
            return Ok(Some(task));
        }
        
        if let Some(task) = self.memory_fallback.get_task(id).await? {
            self.serialize_and_store(&key, &task, Some(3600)).await?;
            return Ok(Some(task));
        }
        
        Ok(None)
    }
    
    async fn update_task(&self, task: &SecurityTask) -> Result<()> {
        let key = self.get_key("task", &task.id);
        self.serialize_and_store(&key, task, Some(3600)).await?;
        self.memory_fallback.update_task(task).await
    }
    
    async fn delete_task(&self, id: &str) -> Result<()> {
        let key = self.get_key("task", id);
        self.delete(&key).await?;
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
impl EvidenceStore for RedisDataStoreManager {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String> {
        let key = self.get_key("evidence", &evidence.id);
        self.serialize_and_store(&key, evidence, Some(86400)).await?; // 24 hour TTL
        self.memory_fallback.create_evidence(evidence).await
    }
    
    async fn get_evidence(&self, id: &str) -> Result<Option<Evidence>> {
        let key = self.get_key("evidence", id);
        
        if let Some(evidence) = self.get_and_deserialize::<Evidence>(&key).await? {
            return Ok(Some(evidence));
        }
        
        if let Some(evidence) = self.memory_fallback.get_evidence(id).await? {
            self.serialize_and_store(&key, &evidence, Some(86400)).await?;
            return Ok(Some(evidence));
        }
        
        Ok(None)
    }
    
    async fn update_evidence(&self, evidence: &Evidence) -> Result<()> {
        let key = self.get_key("evidence", &evidence.id);
        self.serialize_and_store(&key, evidence, Some(86400)).await?;
        self.memory_fallback.update_evidence(evidence).await
    }
    
    async fn delete_evidence(&self, id: &str) -> Result<()> {
        let key = self.get_key("evidence", id);
        self.delete(&key).await?;
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
impl WorkflowStore for RedisDataStoreManager {
    async fn create_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<String> {
        let key = self.get_key("workflow", &workflow.id);
        self.serialize_and_store(&key, workflow, Some(86400)).await?;
        self.memory_fallback.create_workflow(workflow).await
    }
    
    async fn get_workflow(&self, id: &str) -> Result<Option<OrchestrationWorkflow>> {
        let key = self.get_key("workflow", id);
        
        if let Some(workflow) = self.get_and_deserialize::<OrchestrationWorkflow>(&key).await? {
            return Ok(Some(workflow));
        }
        
        if let Some(workflow) = self.memory_fallback.get_workflow(id).await? {
            self.serialize_and_store(&key, &workflow, Some(86400)).await?;
            return Ok(Some(workflow));
        }
        
        Ok(None)
    }
    
    async fn update_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<()> {
        let key = self.get_key("workflow", &workflow.id);
        self.serialize_and_store(&key, workflow, Some(86400)).await?;
        self.memory_fallback.update_workflow(workflow).await
    }
    
    async fn delete_workflow(&self, id: &str) -> Result<()> {
        let key = self.get_key("workflow", id);
        self.delete(&key).await?;
        self.memory_fallback.delete_workflow(id).await
    }
    
    async fn list_workflows(&self, enabled_only: bool) -> Result<Vec<OrchestrationWorkflow>> {
        self.memory_fallback.list_workflows(enabled_only).await
    }
}

#[async_trait]
impl CacheStore for RedisDataStoreManager {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()> {
        let mut conn = self.get_connection().await?;
        
        if let Some(ttl) = ttl_seconds {
            conn.set_ex(key, value, ttl).await?;
        } else {
            conn.set(key, value).await?;
        }
        
        Ok(())
    }
    
    async fn get(&self, key: &str) -> Result<Option<String>> {
        let mut conn = self.get_connection().await?;
        let value: Option<String> = conn.get(key).await?;
        Ok(value)
    }
    
    async fn delete(&self, key: &str) -> Result<()> {
        let mut conn = self.get_connection().await?;
        conn.del(key).await?;
        Ok(())
    }
    
    async fn exists(&self, key: &str) -> Result<bool> {
        let mut conn = self.get_connection().await?;
        let exists: bool = conn.exists(key).await?;
        Ok(exists)
    }
    
    async fn increment(&self, key: &str) -> Result<i64> {
        let mut conn = self.get_connection().await?;
        let value: i64 = conn.incr(key, 1).await?;
        Ok(value)
    }
    
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()> {
        let mut conn = self.get_connection().await?;
        conn.hset(key, field, value).await?;
        Ok(())
    }
    
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>> {
        let mut conn = self.get_connection().await?;
        let value: Option<String> = conn.hget(key, field).await?;
        Ok(value)
    }
    
    async fn publish(&self, channel: &str, message: &str) -> Result<()> {
        let mut conn = self.get_connection().await?;
        conn.publish(channel, message).await?;
        Ok(())
    }
}

#[async_trait]
impl SearchStore for RedisDataStoreManager {
    async fn index_incident(&self, _incident: &SecurityIncident) -> Result<()> {
        // Redis doesn't provide advanced search indexing
        // This could be implemented with Redis Search module if available
        Ok(())
    }
    
    async fn index_alert(&self, _alert: &SecurityAlert) -> Result<()> {
        Ok(())
    }
    
    async fn index_evidence(&self, _evidence: &Evidence) -> Result<()> {
        Ok(())
    }
    
    async fn search(&self, _index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        // Use memory fallback for complex search
        self.memory_fallback.search(_index, query).await
    }
    
    async fn aggregate(&self, _index: &str, _aggregation: &str) -> Result<serde_json::Value> {
        // Use memory fallback for aggregations
        self.memory_fallback.aggregate(_index, _aggregation).await
    }
    
    async fn delete_index(&self, _index: &str) -> Result<()> {
        Ok(())
    }
    
    async fn create_index(&self, _index: &str, _mapping: &str) -> Result<()> {
        Ok(())
    }
}

impl DataStoreManager for RedisDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        DataStoreType::Redis
    }
}