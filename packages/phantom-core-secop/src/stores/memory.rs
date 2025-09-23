//! In-memory data store implementation
//! 
//! This provides a fallback in-memory implementation of all data store traits
//! and serves as the default implementation for development and testing.

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use indexmap::IndexMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use anyhow::Result;

/// In-memory data store manager
pub struct MemoryDataStoreManager {
    config: DataStoreConfig,
    incidents: Arc<RwLock<IndexMap<String, SecurityIncident>>>,
    alerts: Arc<RwLock<IndexMap<String, SecurityAlert>>>,
    playbooks: Arc<RwLock<IndexMap<String, SecurityPlaybook>>>,
    executions: Arc<RwLock<IndexMap<String, PlaybookExecution>>>,
    tasks: Arc<RwLock<IndexMap<String, SecurityTask>>>,
    evidence: Arc<RwLock<IndexMap<String, Evidence>>>,
    workflows: Arc<RwLock<IndexMap<String, OrchestrationWorkflow>>>,
    cache: Arc<RwLock<IndexMap<String, (String, Option<u64>)>>>, // (value, expiry_timestamp)
}

impl MemoryDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        Ok(Self {
            config,
            incidents: Arc::new(RwLock::new(IndexMap::new())),
            alerts: Arc::new(RwLock::new(IndexMap::new())),
            playbooks: Arc::new(RwLock::new(IndexMap::new())),
            executions: Arc::new(RwLock::new(IndexMap::new())),
            tasks: Arc::new(RwLock::new(IndexMap::new())),
            evidence: Arc::new(RwLock::new(IndexMap::new())),
            workflows: Arc::new(RwLock::new(IndexMap::new())),
            cache: Arc::new(RwLock::new(IndexMap::new())),
        })
    }
}

#[async_trait]
impl DataStore for MemoryDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing in-memory data store");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        Ok(true)
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing in-memory data store");
        Ok(())
    }
}

#[async_trait]
impl IncidentStore for MemoryDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        let mut incidents = self.incidents.write().await;
        incidents.insert(incident.incident_id.clone(), incident.clone());
        Ok(incident.incident_id.clone())
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        let incidents = self.incidents.read().await;
        Ok(incidents.get(id).cloned())
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        let mut incidents = self.incidents.write().await;
        incidents.insert(incident.incident_id.clone(), incident.clone());
        Ok(())
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        let mut incidents = self.incidents.write().await;
        incidents.remove(id);
        Ok(())
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        let incidents = self.incidents.read().await;
        let mut results: Vec<SecurityIncident> = incidents
            .values()
            .filter(|incident| {
                if criteria.query.is_empty() {
                    return true;
                }
                incident.title.to_lowercase().contains(&criteria.query.to_lowercase()) ||
                incident.description.to_lowercase().contains(&criteria.query.to_lowercase())
            })
            .cloned()
            .collect();
            
        // Apply sorting
        if let Some(sort_by) = &criteria.sort_by {
            match sort_by.as_str() {
                "created_at" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.created_at.cmp(&a.created_at),
                        _ => a.created_at.cmp(&b.created_at),
                    });
                }
                "severity" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.severity.cmp(&a.severity),
                        _ => a.severity.cmp(&b.severity),
                    });
                }
                _ => {}
            }
        }
        
        // Apply pagination
        if let Some(offset) = criteria.offset {
            if offset < results.len() {
                results = results.into_iter().skip(offset).collect();
            } else {
                results.clear();
            }
        }
        
        if let Some(limit) = criteria.limit {
            results.truncate(limit);
        }
        
        Ok(results)
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        let incidents = self.incidents.read().await;
        let results: Vec<SecurityIncident> = incidents
            .values()
            .filter(|incident| {
                let matches_status = status.is_none() || incident.status == *status.as_ref().unwrap();
                let matches_severity = severity.is_none() || incident.severity == *severity.as_ref().unwrap();
                matches_status && matches_severity
            })
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl AlertStore for MemoryDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        let mut alerts = self.alerts.write().await;
        alerts.insert(alert.id.clone(), alert.clone());
        Ok(alert.id.clone())
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        let alerts = self.alerts.read().await;
        Ok(alerts.get(id).cloned())
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        let mut alerts = self.alerts.write().await;
        alerts.insert(alert.id.clone(), alert.clone());
        Ok(())
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        let mut alerts = self.alerts.write().await;
        alerts.remove(id);
        Ok(())
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        let alerts = self.alerts.read().await;
        let mut results: Vec<SecurityAlert> = alerts
            .values()
            .filter(|alert| {
                if criteria.query.is_empty() {
                    return true;
                }
                alert.title.to_lowercase().contains(&criteria.query.to_lowercase()) ||
                alert.description.to_lowercase().contains(&criteria.query.to_lowercase())
            })
            .cloned()
            .collect();
            
        // Apply sorting
        if let Some(sort_by) = &criteria.sort_by {
            match sort_by.as_str() {
                "created_at" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.created_at.cmp(&a.created_at),
                        _ => a.created_at.cmp(&b.created_at),
                    });
                }
                "priority" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.priority.cmp(&a.priority),
                        _ => a.priority.cmp(&b.priority),
                    });
                }
                _ => {}
            }
        }
        
        // Apply pagination
        if let Some(offset) = criteria.offset {
            if offset < results.len() {
                results = results.into_iter().skip(offset).collect();
            } else {
                results.clear();
            }
        }
        
        if let Some(limit) = criteria.limit {
            results.truncate(limit);
        }
        
        Ok(results)
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        let alerts = self.alerts.read().await;
        let results: Vec<SecurityAlert> = alerts
            .values()
            .filter(|alert| matches!(alert.status, AlertStatus::Open | AlertStatus::Acknowledged | AlertStatus::InProgress))
            .cloned()
            .collect();
        Ok(results)
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        let alerts = self.alerts.read().await;
        let results: Vec<SecurityAlert> = alerts
            .values()
            .filter(|alert| alert.priority == priority)
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl PlaybookStore for MemoryDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        let mut playbooks = self.playbooks.write().await;
        playbooks.insert(playbook.id.clone(), playbook.clone());
        Ok(playbook.id.clone())
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
        let playbooks = self.playbooks.read().await;
        Ok(playbooks.get(id).cloned())
    }
    
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()> {
        let mut playbooks = self.playbooks.write().await;
        playbooks.insert(playbook.id.clone(), playbook.clone());
        Ok(())
    }
    
    async fn delete_playbook(&self, id: &str) -> Result<()> {
        let mut playbooks = self.playbooks.write().await;
        playbooks.remove(id);
        Ok(())
    }
    
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>> {
        let playbooks = self.playbooks.read().await;
        let results: Vec<SecurityPlaybook> = playbooks
            .values()
            .filter(|playbook| {
                category.is_none() || playbook.category == *category.unwrap()
            })
            .cloned()
            .collect();
        Ok(results)
    }
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String> {
        let mut executions = self.executions.write().await;
        executions.insert(execution.id.clone(), execution.clone());
        Ok(execution.id.clone())
    }
    
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>> {
        let executions = self.executions.read().await;
        Ok(executions.get(id).cloned())
    }
    
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()> {
        let mut executions = self.executions.write().await;
        executions.insert(execution.id.clone(), execution.clone());
        Ok(())
    }
    
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>> {
        let executions = self.executions.read().await;
        let results: Vec<PlaybookExecution> = executions
            .values()
            .filter(|execution| {
                playbook_id.is_none() || execution.playbook_id == *playbook_id.unwrap()
            })
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl TaskStore for MemoryDataStoreManager {
    async fn create_task(&self, task: &SecurityTask) -> Result<String> {
        let mut tasks = self.tasks.write().await;
        tasks.insert(task.id.clone(), task.clone());
        Ok(task.id.clone())
    }
    
    async fn get_task(&self, id: &str) -> Result<Option<SecurityTask>> {
        let tasks = self.tasks.read().await;
        Ok(tasks.get(id).cloned())
    }
    
    async fn update_task(&self, task: &SecurityTask) -> Result<()> {
        let mut tasks = self.tasks.write().await;
        tasks.insert(task.id.clone(), task.clone());
        Ok(())
    }
    
    async fn delete_task(&self, id: &str) -> Result<()> {
        let mut tasks = self.tasks.write().await;
        tasks.remove(id);
        Ok(())
    }
    
    async fn search_tasks(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityTask>> {
        let tasks = self.tasks.read().await;
        let mut results: Vec<SecurityTask> = tasks
            .values()
            .filter(|task| {
                if criteria.query.is_empty() {
                    return true;
                }
                task.title.to_lowercase().contains(&criteria.query.to_lowercase()) ||
                task.description.to_lowercase().contains(&criteria.query.to_lowercase())
            })
            .cloned()
            .collect();
            
        // Apply sorting
        if let Some(sort_by) = &criteria.sort_by {
            match sort_by.as_str() {
                "created_at" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.created_at.cmp(&a.created_at),
                        _ => a.created_at.cmp(&b.created_at),
                    });
                }
                "priority" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.priority.cmp(&a.priority),
                        _ => a.priority.cmp(&b.priority),
                    });
                }
                _ => {}
            }
        }
        
        // Apply pagination
        if let Some(offset) = criteria.offset {
            if offset < results.len() {
                results = results.into_iter().skip(offset).collect();
            } else {
                results.clear();
            }
        }
        
        if let Some(limit) = criteria.limit {
            results.truncate(limit);
        }
        
        Ok(results)
    }
    
    async fn list_tasks_by_status(&self, status: TaskStatus) -> Result<Vec<SecurityTask>> {
        let tasks = self.tasks.read().await;
        let results: Vec<SecurityTask> = tasks
            .values()
            .filter(|task| task.status == status)
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl EvidenceStore for MemoryDataStoreManager {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String> {
        let mut evidence_store = self.evidence.write().await;
        evidence_store.insert(evidence.id.clone(), evidence.clone());
        Ok(evidence.id.clone())
    }
    
    async fn get_evidence(&self, id: &str) -> Result<Option<Evidence>> {
        let evidence_store = self.evidence.read().await;
        Ok(evidence_store.get(id).cloned())
    }
    
    async fn update_evidence(&self, evidence: &Evidence) -> Result<()> {
        let mut evidence_store = self.evidence.write().await;
        evidence_store.insert(evidence.id.clone(), evidence.clone());
        Ok(())
    }
    
    async fn delete_evidence(&self, id: &str) -> Result<()> {
        let mut evidence_store = self.evidence.write().await;
        evidence_store.remove(id);
        Ok(())
    }
    
    async fn search_evidence(&self, criteria: &SearchCriteria) -> Result<Vec<Evidence>> {
        let evidence_store = self.evidence.read().await;
        let mut results: Vec<Evidence> = evidence_store
            .values()
            .filter(|evidence| {
                if criteria.query.is_empty() {
                    return true;
                }
                evidence.name.to_lowercase().contains(&criteria.query.to_lowercase()) ||
                evidence.description.to_lowercase().contains(&criteria.query.to_lowercase())
            })
            .cloned()
            .collect();
            
        // Apply sorting
        if let Some(sort_by) = &criteria.sort_by {
            match sort_by.as_str() {
                "collected_at" => {
                    results.sort_by(|a, b| match criteria.sort_order {
                        Some(SortOrder::Descending) => b.collected_at.cmp(&a.collected_at),
                        _ => a.collected_at.cmp(&b.collected_at),
                    });
                }
                _ => {}
            }
        }
        
        // Apply pagination
        if let Some(offset) = criteria.offset {
            if offset < results.len() {
                results = results.into_iter().skip(offset).collect();
            } else {
                results.clear();
            }
        }
        
        if let Some(limit) = criteria.limit {
            results.truncate(limit);
        }
        
        Ok(results)
    }
    
    async fn list_evidence_by_type(&self, evidence_type: EvidenceType) -> Result<Vec<Evidence>> {
        let evidence_store = self.evidence.read().await;
        let results: Vec<Evidence> = evidence_store
            .values()
            .filter(|evidence| evidence.evidence_type == evidence_type)
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl WorkflowStore for MemoryDataStoreManager {
    async fn create_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<String> {
        let mut workflows = self.workflows.write().await;
        workflows.insert(workflow.id.clone(), workflow.clone());
        Ok(workflow.id.clone())
    }
    
    async fn get_workflow(&self, id: &str) -> Result<Option<OrchestrationWorkflow>> {
        let workflows = self.workflows.read().await;
        Ok(workflows.get(id).cloned())
    }
    
    async fn update_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<()> {
        let mut workflows = self.workflows.write().await;
        workflows.insert(workflow.id.clone(), workflow.clone());
        Ok(())
    }
    
    async fn delete_workflow(&self, id: &str) -> Result<()> {
        let mut workflows = self.workflows.write().await;
        workflows.remove(id);
        Ok(())
    }
    
    async fn list_workflows(&self, enabled_only: bool) -> Result<Vec<OrchestrationWorkflow>> {
        let workflows = self.workflows.read().await;
        let results: Vec<OrchestrationWorkflow> = workflows
            .values()
            .filter(|workflow| !enabled_only || workflow.enabled)
            .cloned()
            .collect();
        Ok(results)
    }
}

#[async_trait]
impl CacheStore for MemoryDataStoreManager {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()> {
        let mut cache = self.cache.write().await;
        let expiry = ttl_seconds.map(|ttl| chrono::Utc::now().timestamp() as u64 + ttl);
        cache.insert(key.to_string(), (value.to_string(), expiry));
        Ok(())
    }
    
    async fn get(&self, key: &str) -> Result<Option<String>> {
        let mut cache = self.cache.write().await;
        if let Some((value, expiry)) = cache.get(key) {
            if let Some(exp_time) = expiry {
                if chrono::Utc::now().timestamp() as u64 > *exp_time {
                    cache.remove(key);
                    return Ok(None);
                }
            }
            Ok(Some(value.clone()))
        } else {
            Ok(None)
        }
    }
    
    async fn delete(&self, key: &str) -> Result<()> {
        let mut cache = self.cache.write().await;
        cache.remove(key);
        Ok(())
    }
    
    async fn exists(&self, key: &str) -> Result<bool> {
        let cache = self.cache.read().await;
        Ok(cache.contains_key(key))
    }
    
    async fn increment(&self, key: &str) -> Result<i64> {
        let mut cache = self.cache.write().await;
        let current = cache.get(key)
            .and_then(|(value, _)| value.parse::<i64>().ok())
            .unwrap_or(0);
        let new_value = current + 1;
        cache.insert(key.to_string(), (new_value.to_string(), None));
        Ok(new_value)
    }
    
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()> {
        let hash_key = format!("{}:{}", key, field);
        self.set(&hash_key, value, None).await
    }
    
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>> {
        let hash_key = format!("{}:{}", key, field);
        self.get(&hash_key).await
    }
    
    async fn publish(&self, _channel: &str, _message: &str) -> Result<()> {
        // In-memory implementation doesn't support pub/sub
        log::warn!("Pub/sub not supported in memory store");
        Ok(())
    }
}

#[async_trait]
impl SearchStore for MemoryDataStoreManager {
    async fn index_incident(&self, _incident: &SecurityIncident) -> Result<()> {
        // In-memory implementation doesn't need indexing
        Ok(())
    }
    
    async fn index_alert(&self, _alert: &SecurityAlert) -> Result<()> {
        // In-memory implementation doesn't need indexing
        Ok(())
    }
    
    async fn index_evidence(&self, _evidence: &Evidence) -> Result<()> {
        // In-memory implementation doesn't need indexing
        Ok(())
    }
    
    async fn search(&self, _index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        // Simple text search across all stored data
        let mut results = Vec::new();
        
        // Search incidents
        let incidents = self.incidents.read().await;
        for incident in incidents.values() {
            if incident.title.to_lowercase().contains(&query.to_lowercase()) ||
               incident.description.to_lowercase().contains(&query.to_lowercase()) {
                results.push(serde_json::to_value(incident)?);
            }
        }
        
        // Search alerts
        let alerts = self.alerts.read().await;
        for alert in alerts.values() {
            if alert.title.to_lowercase().contains(&query.to_lowercase()) ||
               alert.description.to_lowercase().contains(&query.to_lowercase()) {
                results.push(serde_json::to_value(alert)?);
            }
        }
        
        Ok(results)
    }
    
    async fn aggregate(&self, _index: &str, _aggregation: &str) -> Result<serde_json::Value> {
        // Simple aggregation for memory store
        let incidents = self.incidents.read().await;
        let alerts = self.alerts.read().await;
        
        let result = serde_json::json!({
            "incident_count": incidents.len(),
            "alert_count": alerts.len(),
            "total_items": incidents.len() + alerts.len()
        });
        
        Ok(result)
    }
    
    async fn delete_index(&self, _index: &str) -> Result<()> {
        // No-op for memory store
        Ok(())
    }
    
    async fn create_index(&self, _index: &str, _mapping: &str) -> Result<()> {
        // No-op for memory store
        Ok(())
    }
}

impl DataStoreManager for MemoryDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        DataStoreType::Memory
    }
}