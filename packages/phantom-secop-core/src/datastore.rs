//! Data store abstractions for phantom-secop-core
//! 
//! This module provides traits and implementations for different data stores
//! including Redis, PostgreSQL, MongoDB, and Elasticsearch to enable
//! business SaaS readiness with persistent data storage.

use crate::{
    SecurityIncident, SecurityAlert, SecurityPlaybook, PlaybookExecution,
    SecurityTask, Evidence, OrchestrationWorkflow, ThreatIntelFeed,
    IncidentStatus, IncidentSeverity, IncidentCategory,
    AlertStatus, AlertPriority, TaskStatus, EvidenceType,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use anyhow::Result;

/// Configuration for data store connections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreConfig {
    pub redis_url: Option<String>,
    pub postgres_url: Option<String>,
    pub mongodb_url: Option<String>,
    pub elasticsearch_url: Option<String>,
    pub default_store: DataStoreType,
    pub cache_enabled: bool,
    pub connection_pool_size: u32,
}

impl Default for DataStoreConfig {
    fn default() -> Self {
        Self {
            redis_url: Some("redis://localhost:6379".to_string()),
            postgres_url: Some("postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire".to_string()),
            mongodb_url: Some("mongodb://admin:phantom_secure_pass@localhost:27017/phantom-spire?authSource=admin".to_string()),
            elasticsearch_url: Some("http://localhost:9200".to_string()),
            default_store: DataStoreType::Memory,
            cache_enabled: true,
            connection_pool_size: 10,
        }
    }
}

/// Available data store types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataStoreType {
    Memory,
    Redis,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
}

/// Search criteria for data stores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub query: String,
    pub filters: HashMap<String, String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<SortOrder>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Ascending,
    Descending,
}

/// Generic trait for data store operations
#[async_trait]
pub trait DataStore: Send + Sync {
    /// Initialize the data store connection
    async fn initialize(&mut self) -> Result<()>;
    
    /// Check if the data store is healthy
    async fn health_check(&self) -> Result<bool>;
    
    /// Close the data store connection
    async fn close(&mut self) -> Result<()>;
}

/// Trait for incident data operations
#[async_trait]
pub trait IncidentStore: DataStore {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String>;
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>>;
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()>;
    async fn delete_incident(&self, id: &str) -> Result<()>;
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>>;
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>>;
}

/// Trait for alert data operations
#[async_trait]
pub trait AlertStore: DataStore {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String>;
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>>;
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()>;
    async fn delete_alert(&self, id: &str) -> Result<()>;
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>>;
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>>;
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>>;
}

/// Trait for playbook data operations
#[async_trait]
pub trait PlaybookStore: DataStore {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String>;
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>>;
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()>;
    async fn delete_playbook(&self, id: &str) -> Result<()>;
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>>;
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String>;
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>>;
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()>;
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>>;
}

/// Trait for task data operations
#[async_trait]
pub trait TaskStore: DataStore {
    async fn create_task(&self, task: &SecurityTask) -> Result<String>;
    async fn get_task(&self, id: &str) -> Result<Option<SecurityTask>>;
    async fn update_task(&self, task: &SecurityTask) -> Result<()>;
    async fn delete_task(&self, id: &str) -> Result<()>;
    async fn search_tasks(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityTask>>;
    async fn list_tasks_by_status(&self, status: TaskStatus) -> Result<Vec<SecurityTask>>;
}

/// Trait for evidence data operations
#[async_trait]
pub trait EvidenceStore: DataStore {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String>;
    async fn get_evidence(&self, id: &str) -> Result<Option<Evidence>>;
    async fn update_evidence(&self, evidence: &Evidence) -> Result<()>;
    async fn delete_evidence(&self, id: &str) -> Result<()>;
    async fn search_evidence(&self, criteria: &SearchCriteria) -> Result<Vec<Evidence>>;
    async fn list_evidence_by_type(&self, evidence_type: EvidenceType) -> Result<Vec<Evidence>>;
}

/// Trait for workflow data operations
#[async_trait]
pub trait WorkflowStore: DataStore {
    async fn create_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<String>;
    async fn get_workflow(&self, id: &str) -> Result<Option<OrchestrationWorkflow>>;
    async fn update_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<()>;
    async fn delete_workflow(&self, id: &str) -> Result<()>;
    async fn list_workflows(&self, enabled_only: bool) -> Result<Vec<OrchestrationWorkflow>>;
}

/// Trait for caching operations (primarily Redis)
#[async_trait]
pub trait CacheStore: DataStore {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()>;
    async fn get(&self, key: &str) -> Result<Option<String>>;
    async fn delete(&self, key: &str) -> Result<()>;
    async fn exists(&self, key: &str) -> Result<bool>;
    async fn increment(&self, key: &str) -> Result<i64>;
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()>;
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>>;
    async fn publish(&self, channel: &str, message: &str) -> Result<()>;
}

/// Trait for search and analytics operations (primarily Elasticsearch)
#[async_trait]
pub trait SearchStore: DataStore {
    async fn index_incident(&self, incident: &SecurityIncident) -> Result<()>;
    async fn index_alert(&self, alert: &SecurityAlert) -> Result<()>;
    async fn index_evidence(&self, evidence: &Evidence) -> Result<()>;
    async fn search(&self, index: &str, query: &str) -> Result<Vec<serde_json::Value>>;
    async fn aggregate(&self, index: &str, aggregation: &str) -> Result<serde_json::Value>;
    async fn delete_index(&self, index: &str) -> Result<()>;
    async fn create_index(&self, index: &str, mapping: &str) -> Result<()>;
}

/// Combined trait for all data store operations
pub trait DataStoreManager: 
    IncidentStore + 
    AlertStore + 
    PlaybookStore + 
    TaskStore + 
    EvidenceStore + 
    WorkflowStore + 
    CacheStore + 
    SearchStore +
    Send + 
    Sync 
{
    fn get_config(&self) -> &DataStoreConfig;
    fn get_store_type(&self) -> DataStoreType;
}

/// Factory for creating data store instances
pub struct DataStoreFactory;

impl DataStoreFactory {
    pub async fn create_manager(config: DataStoreConfig) -> Result<Box<dyn DataStoreManager>> {
        match config.default_store {
            DataStoreType::Memory => {
                let manager = crate::stores::memory::MemoryDataStoreManager::new(config).await?;
                Ok(Box::new(manager))
            }
            DataStoreType::Redis => {
                let manager = crate::stores::redis::RedisDataStoreManager::new(config).await?;
                Ok(Box::new(manager))
            }
            DataStoreType::PostgreSQL => {
                let manager = crate::stores::postgres::PostgreSQLDataStoreManager::new(config).await?;
                Ok(Box::new(manager))
            }
            DataStoreType::MongoDB => {
                let manager = crate::stores::mongodb::MongoDBDataStoreManager::new(config).await?;
                Ok(Box::new(manager))
            }
            DataStoreType::Elasticsearch => {
                let manager = crate::stores::elasticsearch::ElasticsearchDataStoreManager::new(config).await?;
                Ok(Box::new(manager))
            }
        }
    }
    
    pub async fn create_hybrid_manager(config: DataStoreConfig) -> Result<Box<dyn DataStoreManager>> {
        // Create a hybrid manager that uses multiple stores for different purposes
        let manager = crate::stores::hybrid::HybridDataStoreManager::new(config).await?;
        Ok(Box::new(manager))
    }
}