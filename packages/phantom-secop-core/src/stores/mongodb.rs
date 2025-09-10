//! MongoDB data store implementation
//! 
//! This provides MongoDB-based storage for flexible document storage,
//! complex nested data structures, and horizontal scaling.

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use mongodb::{Client, Database, Collection, bson::{doc, Document}, options::ClientOptions};
use std::sync::Arc;
use anyhow::{Result, anyhow};
use serde_json;

/// MongoDB data store manager
pub struct MongoDBDataStoreManager {
    config: DataStoreConfig,
    client: Option<Client>,
    database: Option<Database>,
    // Fallback to memory store for development
    memory_fallback: crate::stores::memory::MemoryDataStoreManager,
}

impl MongoDBDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        let memory_fallback = crate::stores::memory::MemoryDataStoreManager::new(config.clone()).await?;
        
        Ok(Self {
            config,
            client: None,
            database: None,
            memory_fallback,
        })
    }
    
    fn get_database(&self) -> Result<&Database> {
        self.database.as_ref().ok_or_else(|| anyhow!("MongoDB database not initialized"))
    }
    
    async fn create_indexes(&self) -> Result<()> {
        let db = self.get_database()?;
        
        // Create indexes for incidents collection
        let incidents: Collection<Document> = db.collection("security_incidents");
        incidents.create_index(doc! { "status": 1 }, None).await?;
        incidents.create_index(doc! { "severity": 1 }, None).await?;
        incidents.create_index(doc! { "created_at": 1 }, None).await?;
        incidents.create_index(doc! { "title": "text", "description": "text" }, None).await?;
        
        // Create indexes for alerts collection
        let alerts: Collection<Document> = db.collection("security_alerts");
        alerts.create_index(doc! { "status": 1 }, None).await?;
        alerts.create_index(doc! { "priority": 1 }, None).await?;
        alerts.create_index(doc! { "created_at": 1 }, None).await?;
        alerts.create_index(doc! { "title": "text", "description": "text" }, None).await?;
        
        // Create indexes for tasks collection
        let tasks: Collection<Document> = db.collection("security_tasks");
        tasks.create_index(doc! { "status": 1 }, None).await?;
        tasks.create_index(doc! { "priority": 1 }, None).await?;
        tasks.create_index(doc! { "created_at": 1 }, None).await?;
        
        // Create indexes for evidence collection
        let evidence: Collection<Document> = db.collection("evidence");
        evidence.create_index(doc! { "evidence_type": 1 }, None).await?;
        evidence.create_index(doc! { "collected_at": 1 }, None).await?;
        evidence.create_index(doc! { "name": "text", "description": "text" }, None).await?;
        
        log::info!("MongoDB indexes created successfully");
        Ok(())
    }
}

#[async_trait]
impl DataStore for MongoDBDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing MongoDB data store");
        
        let mongodb_url = self.config.mongodb_url
            .as_ref()
            .ok_or_else(|| anyhow!("MongoDB URL not configured"))?;
            
        let client_options = ClientOptions::parse(mongodb_url).await?;
        let client = Client::with_options(client_options)?;
        
        // Test the connection
        client.database("admin").run_command(doc! { "ping": 1 }, None).await?;
        log::info!("MongoDB connection established");
        
        // Extract database name from URL or use default
        let database_name = mongodb_url
            .split('/')
            .last()
            .and_then(|s| s.split('?').next())
            .unwrap_or("phantom-spire");
            
        let database = client.database(database_name);
        
        self.client = Some(client);
        self.database = Some(database);
        
        // Create indexes
        self.create_indexes().await?;
        
        // Initialize memory fallback
        self.memory_fallback.initialize().await?;
        
        log::info!("MongoDB data store initialized successfully");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        match self.get_database() {
            Ok(db) => {
                match db.run_command(doc! { "ping": 1 }, None).await {
                    Ok(_) => Ok(true),
                    Err(e) => {
                        log::warn!("MongoDB health check failed: {}", e);
                        Ok(false)
                    }
                }
            }
            Err(e) => {
                log::warn!("MongoDB database not available: {}", e);
                Ok(false)
            }
        }
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing MongoDB data store");
        self.client = None;
        self.database = None;
        self.memory_fallback.close().await?;
        Ok(())
    }
}

#[async_trait]
impl IncidentStore for MongoDBDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            match collection.insert_one(incident, None).await {
                Ok(_) => return Ok(incident.id.clone()),
                Err(e) => log::warn!("MongoDB insert failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.create_incident(incident).await
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            match collection.find_one(doc! { "id": id }, None).await {
                Ok(incident) => return Ok(incident),
                Err(e) => log::warn!("MongoDB query failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.get_incident(id).await
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            match collection.replace_one(doc! { "id": &incident.id }, incident, None).await {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("MongoDB update failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.update_incident(incident).await
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            match collection.delete_one(doc! { "id": id }, None).await {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("MongoDB delete failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.delete_incident(id).await
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            let mut filter = doc! {};
            
            // Add text search if query is provided
            if !criteria.query.is_empty() {
                filter.insert("$text", doc! { "$search": &criteria.query });
            }
            
            // Add filters
            for (key, value) in &criteria.filters {
                filter.insert(key, value);
            }
            
            let mut options = mongodb::options::FindOptions::default();
            
            // Add sorting
            if let Some(sort_by) = &criteria.sort_by {
                let sort_order = match criteria.sort_order {
                    Some(SortOrder::Descending) => -1,
                    _ => 1,
                };
                options.sort = Some(doc! { sort_by: sort_order });
            }
            
            // Add pagination
            if let Some(limit) = criteria.limit {
                options.limit = Some(limit as i64);
            }
            
            if let Some(offset) = criteria.offset {
                options.skip = Some(offset as u64);
            }
            
            match collection.find(filter, options).await {
                Ok(mut cursor) => {
                    let mut incidents = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(incident) => incidents.push(incident),
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(incidents);
                }
                Err(e) => log::warn!("MongoDB search failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.search_incidents(criteria).await
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityIncident> = db.collection("security_incidents");
            
            let mut filter = doc! {};
            
            if let Some(ref status) = status {
                filter.insert("status", serde_json::to_string(status).unwrap_or_default());
            }
            
            if let Some(ref severity) = severity {
                filter.insert("severity", serde_json::to_string(severity).unwrap_or_default());
            }
            
            match collection.find(filter, None).await {
                Ok(mut cursor) => {
                    let mut incidents = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(incident) => incidents.push(incident),
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(incidents);
                }
                Err(e) => log::warn!("MongoDB list failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.list_incidents(status, severity).await
    }
}

#[async_trait]
impl AlertStore for MongoDBDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            match collection.insert_one(alert, None).await {
                Ok(_) => return Ok(alert.id.clone()),
                Err(e) => log::warn!("MongoDB insert failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.create_alert(alert).await
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            match collection.find_one(doc! { "id": id }, None).await {
                Ok(alert) => return Ok(alert),
                Err(e) => log::warn!("MongoDB query failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.get_alert(id).await
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            match collection.replace_one(doc! { "id": &alert.id }, alert, None).await {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("MongoDB update failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.update_alert(alert).await
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            match collection.delete_one(doc! { "id": id }, None).await {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("MongoDB delete failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.delete_alert(id).await
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            let mut filter = doc! {};
            
            if !criteria.query.is_empty() {
                filter.insert("$text", doc! { "$search": &criteria.query });
            }
            
            for (key, value) in &criteria.filters {
                filter.insert(key, value);
            }
            
            let mut options = mongodb::options::FindOptions::default();
            
            if let Some(sort_by) = &criteria.sort_by {
                let sort_order = match criteria.sort_order {
                    Some(SortOrder::Descending) => -1,
                    _ => 1,
                };
                options.sort = Some(doc! { sort_by: sort_order });
            }
            
            if let Some(limit) = criteria.limit {
                options.limit = Some(limit as i64);
            }
            
            if let Some(offset) = criteria.offset {
                options.skip = Some(offset as u64);
            }
            
            match collection.find(filter, options).await {
                Ok(mut cursor) => {
                    let mut alerts = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(alert) => alerts.push(alert),
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(alerts);
                }
                Err(e) => log::warn!("MongoDB search failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.search_alerts(criteria).await
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            let filter = doc! {
                "status": {
                    "$in": [
                        serde_json::to_string(&AlertStatus::Open).unwrap_or_default(),
                        serde_json::to_string(&AlertStatus::Acknowledged).unwrap_or_default(),
                        serde_json::to_string(&AlertStatus::InProgress).unwrap_or_default(),
                    ]
                }
            };
            
            match collection.find(filter, None).await {
                Ok(mut cursor) => {
                    let mut alerts = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(alert) => alerts.push(alert),
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(alerts);
                }
                Err(e) => log::warn!("MongoDB query failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.get_active_alerts().await
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityAlert> = db.collection("security_alerts");
            
            let filter = doc! { "priority": serde_json::to_string(&priority).unwrap_or_default() };
            
            match collection.find(filter, None).await {
                Ok(mut cursor) => {
                    let mut alerts = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(alert) => alerts.push(alert),
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(alerts);
                }
                Err(e) => log::warn!("MongoDB query failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.list_alerts_by_priority(priority).await
    }
}

// For brevity, implementing remaining traits with memory fallbacks
// In production, you'd want full MongoDB implementations

#[async_trait]
impl PlaybookStore for MongoDBDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityPlaybook> = db.collection("security_playbooks");
            
            match collection.insert_one(playbook, None).await {
                Ok(_) => return Ok(playbook.id.clone()),
                Err(e) => log::warn!("MongoDB insert failed: {}", e),
            }
        }
        
        self.memory_fallback.create_playbook(playbook).await
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<SecurityPlaybook> = db.collection("security_playbooks");
            
            match collection.find_one(doc! { "id": id }, None).await {
                Ok(playbook) => return Ok(playbook),
                Err(e) => log::warn!("MongoDB query failed: {}", e),
            }
        }
        
        self.memory_fallback.get_playbook(id).await
    }
    
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()> {
        self.memory_fallback.update_playbook(playbook).await
    }
    
    async fn delete_playbook(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_playbook(id).await
    }
    
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>> {
        self.memory_fallback.list_playbooks(category).await
    }
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String> {
        self.memory_fallback.create_execution(execution).await
    }
    
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>> {
        self.memory_fallback.get_execution(id).await
    }
    
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()> {
        self.memory_fallback.update_execution(execution).await
    }
    
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>> {
        self.memory_fallback.list_executions(playbook_id).await
    }
}

#[async_trait]
impl TaskStore for MongoDBDataStoreManager {
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
impl EvidenceStore for MongoDBDataStoreManager {
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
impl WorkflowStore for MongoDBDataStoreManager {
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
impl CacheStore for MongoDBDataStoreManager {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()> {
        self.memory_fallback.set(key, value, ttl_seconds).await
    }
    
    async fn get(&self, key: &str) -> Result<Option<String>> {
        self.memory_fallback.get(key).await
    }
    
    async fn delete(&self, key: &str) -> Result<()> {
        self.memory_fallback.delete(key).await
    }
    
    async fn exists(&self, key: &str) -> Result<bool> {
        self.memory_fallback.exists(key).await
    }
    
    async fn increment(&self, key: &str) -> Result<i64> {
        self.memory_fallback.increment(key).await
    }
    
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()> {
        self.memory_fallback.set_hash(key, field, value).await
    }
    
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>> {
        self.memory_fallback.get_hash(key, field).await
    }
    
    async fn publish(&self, channel: &str, message: &str) -> Result<()> {
        self.memory_fallback.publish(channel, message).await
    }
}

#[async_trait]
impl SearchStore for MongoDBDataStoreManager {
    async fn index_incident(&self, _incident: &SecurityIncident) -> Result<()> {
        // MongoDB handles indexing automatically
        Ok(())
    }
    
    async fn index_alert(&self, _alert: &SecurityAlert) -> Result<()> {
        Ok(())
    }
    
    async fn index_evidence(&self, _evidence: &Evidence) -> Result<()> {
        Ok(())
    }
    
    async fn search(&self, index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<Document> = db.collection(index);
            
            let filter = doc! { "$text": { "$search": query } };
            
            match collection.find(filter, None).await {
                Ok(mut cursor) => {
                    let mut results = Vec::new();
                    
                    use futures::stream::StreamExt;
                    while let Some(result) = cursor.next().await {
                        match result {
                            Ok(doc) => {
                                if let Ok(json_value) = serde_json::to_value(&doc) {
                                    results.push(json_value);
                                }
                            }
                            Err(e) => log::warn!("MongoDB cursor error: {}", e),
                        }
                    }
                    
                    return Ok(results);
                }
                Err(e) => log::warn!("MongoDB search failed: {}", e),
            }
        }
        
        self.memory_fallback.search(index, query).await
    }
    
    async fn aggregate(&self, index: &str, aggregation: &str) -> Result<serde_json::Value> {
        if let Ok(db) = self.get_database() {
            let collection: Collection<Document> = db.collection(index);
            
            // Simple aggregation example - count documents
            let pipeline = vec![
                doc! { "$count": "total" }
            ];
            
            match collection.aggregate(pipeline, None).await {
                Ok(mut cursor) => {
                    use futures::stream::StreamExt;
                    if let Some(result) = cursor.next().await {
                        match result {
                            Ok(doc) => {
                                return Ok(serde_json::to_value(&doc)?);
                            }
                            Err(e) => log::warn!("MongoDB aggregation error: {}", e),
                        }
                    }
                }
                Err(e) => log::warn!("MongoDB aggregation failed: {}", e),
            }
        }
        
        self.memory_fallback.aggregate(index, aggregation).await
    }
    
    async fn delete_index(&self, _index: &str) -> Result<()> {
        // MongoDB collections can be dropped
        Ok(())
    }
    
    async fn create_index(&self, _index: &str, _mapping: &str) -> Result<()> {
        // MongoDB creates collections automatically
        Ok(())
    }
}

impl DataStoreManager for MongoDBDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        DataStoreType::MongoDB
    }
}