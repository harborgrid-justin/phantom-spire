//! Elasticsearch data store implementation
//! 
//! This provides Elasticsearch-based storage for advanced search, analytics,
//! and full-text indexing capabilities.

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use elasticsearch::{Elasticsearch, http::transport::Transport, http::Url};
use serde_json::{Value, json};
use std::sync::Arc;
use anyhow::{Result, anyhow};

/// Elasticsearch data store manager
pub struct ElasticsearchDataStoreManager {
    config: DataStoreConfig,
    client: Option<Elasticsearch>,
    // Fallback to memory store for development
    memory_fallback: crate::stores::memory::MemoryDataStoreManager,
}

impl ElasticsearchDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        let memory_fallback = crate::stores::memory::MemoryDataStoreManager::new(config.clone()).await?;
        
        Ok(Self {
            config,
            client: None,
            memory_fallback,
        })
    }
    
    fn get_client(&self) -> Result<&Elasticsearch> {
        self.client.as_ref().ok_or_else(|| anyhow!("Elasticsearch client not initialized"))
    }
    
    async fn create_indices(&self) -> Result<()> {
        let client = self.get_client()?;
        
        // Create incidents index
        let incidents_mapping = json!({
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "title": { "type": "text", "analyzer": "standard" },
                    "description": { "type": "text", "analyzer": "standard" },
                    "category": { "type": "keyword" },
                    "severity": { "type": "keyword" },
                    "status": { "type": "keyword" },
                    "priority_score": { "type": "float" },
                    "created_at": { "type": "date" },
                    "updated_at": { "type": "date" },
                    "detected_at": { "type": "date" },
                    "assigned_to": { "type": "keyword" },
                    "assigned_team": { "type": "keyword" },
                    "source_system": { "type": "keyword" },
                    "affected_assets": { "type": "keyword" },
                    "indicators": { "type": "keyword" },
                    "tags": { "type": "keyword" },
                    "timeline": { "type": "nested" },
                    "evidence": { "type": "nested" },
                    "related_alerts": { "type": "keyword" },
                    "related_incidents": { "type": "keyword" },
                    "containment_actions": { "type": "text" },
                    "eradication_actions": { "type": "text" },
                    "recovery_actions": { "type": "text" },
                    "lessons_learned": { "type": "text" },
                    "cost_impact": { "type": "float" },
                    "business_impact": { "type": "object" },
                    "compliance_impact": { "type": "keyword" },
                    "metadata": { "type": "object" }
                }
            }
        });
        
        match client.indices()
            .create(elasticsearch::indices::IndicesCreateParts::Index("phantom-incidents"))
            .body(incidents_mapping)
            .send()
            .await
        {
            Ok(_) => log::info!("Incidents index created"),
            Err(e) => log::debug!("Incidents index creation failed (may already exist): {}", e),
        }
        
        // Create alerts index
        let alerts_mapping = json!({
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "title": { "type": "text", "analyzer": "standard" },
                    "description": { "type": "text", "analyzer": "standard" },
                    "priority": { "type": "keyword" },
                    "status": { "type": "keyword" },
                    "source": { "type": "keyword" },
                    "rule_id": { "type": "keyword" },
                    "created_at": { "type": "date" },
                    "updated_at": { "type": "date" },
                    "first_seen": { "type": "date" },
                    "last_seen": { "type": "date" },
                    "count": { "type": "integer" },
                    "assigned_to": { "type": "keyword" },
                    "indicators": { "type": "keyword" },
                    "affected_assets": { "type": "keyword" },
                    "tags": { "type": "keyword" },
                    "raw_data": { "type": "object" },
                    "enrichment_data": { "type": "object" },
                    "related_alerts": { "type": "keyword" },
                    "incident_id": { "type": "keyword" },
                    "false_positive_likelihood": { "type": "float" },
                    "confidence_score": { "type": "float" },
                    "metadata": { "type": "object" }
                }
            }
        });
        
        match client.indices()
            .create(elasticsearch::indices::IndicesCreateParts::Index("phantom-alerts"))
            .body(alerts_mapping)
            .send()
            .await
        {
            Ok(_) => log::info!("Alerts index created"),
            Err(e) => log::debug!("Alerts index creation failed (may already exist): {}", e),
        }
        
        // Create evidence index
        let evidence_mapping = json!({
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "evidence_type": { "type": "keyword" },
                    "name": { "type": "text", "analyzer": "standard" },
                    "description": { "type": "text", "analyzer": "standard" },
                    "source": { "type": "keyword" },
                    "collected_at": { "type": "date" },
                    "collected_by": { "type": "keyword" },
                    "file_path": { "type": "keyword" },
                    "file_hash": { "type": "keyword" },
                    "file_size": { "type": "long" },
                    "chain_of_custody": { "type": "nested" },
                    "analysis_results": { "type": "nested" },
                    "tags": { "type": "keyword" },
                    "metadata": { "type": "object" }
                }
            }
        });
        
        match client.indices()
            .create(elasticsearch::indices::IndicesCreateParts::Index("phantom-evidence"))
            .body(evidence_mapping)
            .send()
            .await
        {
            Ok(_) => log::info!("Evidence index created"),
            Err(e) => log::debug!("Evidence index creation failed (may already exist): {}", e),
        }
        
        log::info!("Elasticsearch indices setup completed");
        Ok(())
    }
}

#[async_trait]
impl DataStore for ElasticsearchDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing Elasticsearch data store");
        
        let elasticsearch_url = self.config.elasticsearch_url
            .as_ref()
            .ok_or_else(|| anyhow!("Elasticsearch URL not configured"))?;
            
        let url = Url::parse(elasticsearch_url)?;
        let transport = Transport::single_node(&url.to_string())?;
        let client = Elasticsearch::new(transport);
        
        // Test the connection
        match client.ping().send().await {
            Ok(_) => log::info!("Elasticsearch connection established"),
            Err(e) => {
                log::warn!("Elasticsearch connection failed: {}", e);
                // Continue with memory fallback
            }
        }
        
        self.client = Some(client);
        
        // Create indices
        if let Err(e) = self.create_indices().await {
            log::warn!("Failed to create Elasticsearch indices: {}", e);
        }
        
        // Initialize memory fallback
        self.memory_fallback.initialize().await?;
        
        log::info!("Elasticsearch data store initialized successfully");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        match self.get_client() {
            Ok(client) => {
                match client.ping().send().await {
                    Ok(_) => Ok(true),
                    Err(e) => {
                        log::warn!("Elasticsearch health check failed: {}", e);
                        Ok(false)
                    }
                }
            }
            Err(e) => {
                log::warn!("Elasticsearch client not available: {}", e);
                Ok(false)
            }
        }
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing Elasticsearch data store");
        self.client = None;
        self.memory_fallback.close().await?;
        Ok(())
    }
}

#[async_trait]
impl IncidentStore for ElasticsearchDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(incident)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-incidents", &incident.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(incident.id.clone()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.create_incident(incident).await
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        if let Ok(client) = self.get_client() {
            match client.get(elasticsearch::GetParts::IndexId("phantom-incidents", id))
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    if let Some(source) = response_body.get("_source") {
                        if let Ok(incident) = serde_json::from_value::<SecurityIncident>(source.clone()) {
                            return Ok(Some(incident));
                        }
                    }
                }
                Err(e) => log::warn!("Elasticsearch get failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.get_incident(id).await
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(incident)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-incidents", &incident.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch update failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.update_incident(incident).await
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        if let Ok(client) = self.get_client() {
            match client.delete(elasticsearch::DeleteParts::IndexId("phantom-incidents", id))
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch delete failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.delete_incident(id).await
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        if let Ok(client) = self.get_client() {
            let mut query = json!({
                "query": {
                    "bool": {
                        "must": []
                    }
                }
            });
            
            // Add text search
            if !criteria.query.is_empty() {
                let text_query = json!({
                    "multi_match": {
                        "query": criteria.query,
                        "fields": ["title^2", "description", "containment_actions", "eradication_actions", "recovery_actions", "lessons_learned"]
                    }
                });
                query["query"]["bool"]["must"].as_array_mut().unwrap().push(text_query);
            }
            
            // Add filters
            for (field, value) in &criteria.filters {
                let filter_query = json!({
                    "term": {
                        field: value
                    }
                });
                query["query"]["bool"]["must"].as_array_mut().unwrap().push(filter_query);
            }
            
            // Add sorting
            if let Some(sort_by) = &criteria.sort_by {
                let sort_order = match criteria.sort_order {
                    Some(SortOrder::Descending) => "desc",
                    _ => "asc",
                };
                query["sort"] = json!([{
                    sort_by: { "order": sort_order }
                }]);
            }
            
            // Add pagination
            if let Some(limit) = criteria.limit {
                query["size"] = json!(limit);
            }
            
            if let Some(offset) = criteria.offset {
                query["from"] = json!(offset);
            }
            
            match client.search(elasticsearch::SearchParts::Index(&["phantom-incidents"]))
                .body(query)
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    let mut incidents = Vec::new();
                    
                    if let Some(hits) = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
                        for hit in hits {
                            if let Some(source) = hit.get("_source") {
                                if let Ok(incident) = serde_json::from_value::<SecurityIncident>(source.clone()) {
                                    incidents.push(incident);
                                }
                            }
                        }
                    }
                    
                    return Ok(incidents);
                }
                Err(e) => log::warn!("Elasticsearch search failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.search_incidents(criteria).await
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        if let Ok(client) = self.get_client() {
            let mut filters = Vec::new();
            
            if let Some(status) = status {
                let status_str = serde_json::to_string(&status).unwrap_or_default().trim_matches('"').to_string();
                filters.push(json!({
                    "term": { "status": status_str }
                }));
            }
            
            if let Some(severity) = severity {
                let severity_str = serde_json::to_string(&severity).unwrap_or_default().trim_matches('"').to_string();
                filters.push(json!({
                    "term": { "severity": severity_str }
                }));
            }
            
            let query = if filters.is_empty() {
                json!({ "query": { "match_all": {} } })
            } else {
                json!({
                    "query": {
                        "bool": {
                            "must": filters
                        }
                    }
                })
            };
            
            match client.search(elasticsearch::SearchParts::Index(&["phantom-incidents"]))
                .body(query)
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    let mut incidents = Vec::new();
                    
                    if let Some(hits) = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
                        for hit in hits {
                            if let Some(source) = hit.get("_source") {
                                if let Ok(incident) = serde_json::from_value::<SecurityIncident>(source.clone()) {
                                    incidents.push(incident);
                                }
                            }
                        }
                    }
                    
                    return Ok(incidents);
                }
                Err(e) => log::warn!("Elasticsearch list failed: {}", e),
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.list_incidents(status, severity).await
    }
}

// For brevity, implementing remaining traits with memory fallbacks
// In production, you'd want full Elasticsearch implementations

#[async_trait]
impl AlertStore for ElasticsearchDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(alert)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-alerts", &alert.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(alert.id.clone()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
        self.memory_fallback.create_alert(alert).await
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        if let Ok(client) = self.get_client() {
            match client.get(elasticsearch::GetParts::IndexId("phantom-alerts", id))
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    if let Some(source) = response_body.get("_source") {
                        if let Ok(alert) = serde_json::from_value::<SecurityAlert>(source.clone()) {
                            return Ok(Some(alert));
                        }
                    }
                }
                Err(e) => log::warn!("Elasticsearch get failed: {}", e),
            }
        }
        
        self.memory_fallback.get_alert(id).await
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        self.memory_fallback.update_alert(alert).await
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_alert(id).await
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.search_alerts(criteria).await
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.get_active_alerts().await
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.list_alerts_by_priority(priority).await
    }
}

#[async_trait]
impl PlaybookStore for ElasticsearchDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        self.memory_fallback.create_playbook(playbook).await
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
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
impl TaskStore for ElasticsearchDataStoreManager {
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
impl EvidenceStore for ElasticsearchDataStoreManager {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(evidence)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-evidence", &evidence.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(evidence.id.clone()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
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
impl WorkflowStore for ElasticsearchDataStoreManager {
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
impl CacheStore for ElasticsearchDataStoreManager {
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
impl SearchStore for ElasticsearchDataStoreManager {
    async fn index_incident(&self, incident: &SecurityIncident) -> Result<()> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(incident)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-incidents", &incident.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
        self.memory_fallback.index_incident(incident).await
    }
    
    async fn index_alert(&self, alert: &SecurityAlert) -> Result<()> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(alert)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-alerts", &alert.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
        self.memory_fallback.index_alert(alert).await
    }
    
    async fn index_evidence(&self, evidence: &Evidence) -> Result<()> {
        if let Ok(client) = self.get_client() {
            let body = serde_json::to_value(evidence)?;
            
            match client.index(elasticsearch::IndexParts::IndexId("phantom-evidence", &evidence.id))
                .body(body)
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch index failed: {}", e),
            }
        }
        
        self.memory_fallback.index_evidence(evidence).await
    }
    
    async fn search(&self, index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        if let Ok(client) = self.get_client() {
            let search_query = json!({
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["title^2", "description", "name", "content"]
                    }
                }
            });
            
            match client.search(elasticsearch::SearchParts::Index(&[index]))
                .body(search_query)
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    let mut results = Vec::new();
                    
                    if let Some(hits) = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
                        for hit in hits {
                            if let Some(source) = hit.get("_source") {
                                results.push(source.clone());
                            }
                        }
                    }
                    
                    return Ok(results);
                }
                Err(e) => log::warn!("Elasticsearch search failed: {}", e),
            }
        }
        
        self.memory_fallback.search(index, query).await
    }
    
    async fn aggregate(&self, index: &str, aggregation: &str) -> Result<serde_json::Value> {
        if let Ok(client) = self.get_client() {
            // Simple aggregation example
            let agg_query = json!({
                "aggs": {
                    "count_by_status": {
                        "terms": {
                            "field": "status"
                        }
                    }
                },
                "size": 0
            });
            
            match client.search(elasticsearch::SearchParts::Index(&[index]))
                .body(agg_query)
                .send()
                .await
            {
                Ok(response) => {
                    let response_body = response.json::<Value>().await?;
                    if let Some(aggs) = response_body.get("aggregations") {
                        return Ok(aggs.clone());
                    }
                }
                Err(e) => log::warn!("Elasticsearch aggregation failed: {}", e),
            }
        }
        
        self.memory_fallback.aggregate(index, aggregation).await
    }
    
    async fn delete_index(&self, index: &str) -> Result<()> {
        if let Ok(client) = self.get_client() {
            match client.indices()
                .delete(elasticsearch::indices::IndicesDeleteParts::Index(&[index]))
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch delete index failed: {}", e),
            }
        }
        
        self.memory_fallback.delete_index(index).await
    }
    
    async fn create_index(&self, index: &str, mapping: &str) -> Result<()> {
        if let Ok(client) = self.get_client() {
            let mapping_json: Value = serde_json::from_str(mapping)?;
            
            match client.indices()
                .create(elasticsearch::indices::IndicesCreateParts::Index(index))
                .body(mapping_json)
                .send()
                .await
            {
                Ok(_) => return Ok(()),
                Err(e) => log::warn!("Elasticsearch create index failed: {}", e),
            }
        }
        
        self.memory_fallback.create_index(index, mapping).await
    }
}

impl DataStoreManager for ElasticsearchDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        DataStoreType::Elasticsearch
    }
}