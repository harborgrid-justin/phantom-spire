//! Native Unified Data Store Implementation for Security Operations Data
//! 
//! This module implements the UnifiedDataStore trait directly for Security Operations data,
//! providing native integration with the unified data layer interface.

use crate::unified::*;
use crate::{SecurityIncident, SecurityAlert, PlaybookExecution};
use async_trait::async_trait;
use std::collections::HashMap;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};

/// Native SecOp Data Store implementing UnifiedDataStore interface
#[derive(Debug)]
pub struct SecOpUnifiedDataStore {
    store_id: String,
    incidents: RwLock<HashMap<String, SecurityIncident>>,
    alerts: RwLock<HashMap<String, SecurityAlert>>,
    playbook_executions: RwLock<HashMap<String, PlaybookExecution>>,
    relationships: RwLock<HashMap<String, DataRelationship>>,
    initialized: RwLock<bool>,
}

impl SecOpUnifiedDataStore {
    pub fn new() -> Self {
        Self {
            store_id: "phantom-secop-core".to_string(),
            incidents: RwLock::new(HashMap::new()),
            alerts: RwLock::new(HashMap::new()),
            playbook_executions: RwLock::new(HashMap::new()),
            relationships: RwLock::new(HashMap::new()),
            initialized: RwLock::new(false),
        }
    }

    /// Convert SecurityIncident to UniversalDataRecord
    fn incident_to_universal(&self, incident: &SecurityIncident) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("severity".to_string(), serde_json::Value::String(format!("{:?}", incident.severity)));
        metadata.insert("status".to_string(), serde_json::Value::String(format!("{:?}", incident.status)));
        metadata.insert("category".to_string(), serde_json::Value::String(format!("{:?}", incident.category)));
        metadata.insert("priority_score".to_string(), serde_json::Value::Number(
            serde_json::Number::from_f64(incident.priority_score).unwrap_or_else(|| serde_json::Number::from(0))
        ));

        UniversalDataRecord {
            id: incident.id.clone(),
            record_type: "security_incident".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(incident).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: incident.indicators.clone(), // Use indicators as tags
            created_at: incident.created_at,
            updated_at: incident.updated_at,
            tenant_id: None,
        }
    }

    /// Convert SecurityAlert to UniversalDataRecord
    fn alert_to_universal(&self, alert: &SecurityAlert) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("priority".to_string(), serde_json::Value::String(format!("{:?}", alert.priority)));
        metadata.insert("source".to_string(), serde_json::Value::String(alert.source.clone()));
        metadata.insert("count".to_string(), serde_json::Value::Number(serde_json::Number::from(alert.count)));

        UniversalDataRecord {
            id: alert.id.clone(),
            record_type: "security_alert".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(alert).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: alert.indicators.clone(), // Use indicators as tags
            created_at: alert.created_at,
            updated_at: alert.updated_at,
            tenant_id: None,
        }
    }

    /// Convert PlaybookExecution to UniversalDataRecord  
    fn playbook_to_universal(&self, playbook: &PlaybookExecution) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("status".to_string(), serde_json::Value::String(format!("{:?}", playbook.status)));
        metadata.insert("playbook_id".to_string(), serde_json::Value::String(playbook.playbook_id.clone()));
        metadata.insert("success_count".to_string(), serde_json::Value::Number(serde_json::Number::from(playbook.success_count)));
        metadata.insert("failure_count".to_string(), serde_json::Value::Number(serde_json::Number::from(playbook.failure_count)));

        let updated_at = playbook.completed_at.unwrap_or(playbook.started_at);

        UniversalDataRecord {
            id: playbook.id.clone(),
            record_type: "playbook_execution".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(playbook).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: vec![playbook.playbook_id.clone()], // Use playbook ID as tag
            created_at: playbook.started_at,
            updated_at,
            tenant_id: None,
        }
    }

    /// Convert UniversalDataRecord back to SecurityIncident
    fn universal_to_incident(&self, record: &UniversalDataRecord) -> UnifiedResult<SecurityIncident> {
        if record.record_type != "security_incident" {
            return Err(UnifiedDataError::Query(
                format!("Expected security_incident record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }

    /// Convert UniversalDataRecord back to SecurityAlert
    fn universal_to_alert(&self, record: &UniversalDataRecord) -> UnifiedResult<SecurityAlert> {
        if record.record_type != "security_alert" {
            return Err(UnifiedDataError::Query(
                format!("Expected security_alert record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }

    /// Convert UniversalDataRecord back to PlaybookExecution
    fn universal_to_playbook(&self, record: &UniversalDataRecord) -> UnifiedResult<PlaybookExecution> {
        if record.record_type != "playbook_execution" {
            return Err(UnifiedDataError::Query(
                format!("Expected playbook_execution record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }
}

#[async_trait]
impl UnifiedDataStore for SecOpUnifiedDataStore {
    fn store_id(&self) -> &str {
        &self.store_id
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "security_incidents".to_string(),
            "security_alerts".to_string(),
            "playbook_execution".to_string(),
            "incident_response".to_string(),
            "relationship_mapping".to_string(),
            "full_text_search".to_string(),
            "priority_filtering".to_string(),
            "bulk_operations".to_string(),
        ]
    }

    async fn initialize(&mut self) -> UnifiedResult<()> {
        // Initialize the data store
        let mut initialized = self.initialized.write().await;
        *initialized = true;
        Ok(())
    }

    async fn close(&mut self) -> UnifiedResult<()> {
        // Clean shutdown
        let mut initialized = self.initialized.write().await;
        *initialized = false;
        Ok(())
    }

    async fn health_check(&self) -> UnifiedResult<UnifiedHealthStatus> {
        let initialized = *self.initialized.read().await;
        let incident_count = self.incidents.read().await.len();
        let alert_count = self.alerts.read().await.len();
        let playbook_count = self.playbook_executions.read().await.len();
        let relationship_count = self.relationships.read().await.len();

        let mut metrics = HashMap::new();
        metrics.insert("incident_count".to_string(), serde_json::Value::Number(serde_json::Number::from(incident_count)));
        metrics.insert("alert_count".to_string(), serde_json::Value::Number(serde_json::Number::from(alert_count)));
        metrics.insert("playbook_count".to_string(), serde_json::Value::Number(serde_json::Number::from(playbook_count)));
        metrics.insert("relationship_count".to_string(), serde_json::Value::Number(serde_json::Number::from(relationship_count)));

        Ok(UnifiedHealthStatus {
            healthy: initialized,
            response_time_ms: 12, // Mock response time
            message: if initialized { None } else { Some("Store not initialized".to_string()) },
            capabilities: self.capabilities(),
            metrics,
            last_check: Utc::now(),
        })
    }

    async fn store_record(&self, record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        match record.record_type.as_str() {
            "security_incident" => {
                let incident = self.universal_to_incident(record)?;
                let mut incidents = self.incidents.write().await;
                incidents.insert(incident.id.clone(), incident.clone());
                Ok(incident.id)
            }
            "security_alert" => {
                let alert = self.universal_to_alert(record)?;
                let mut alerts = self.alerts.write().await;
                alerts.insert(alert.id.clone(), alert.clone());
                Ok(alert.id)
            }
            "playbook_execution" => {
                let playbook = self.universal_to_playbook(record)?;
                let mut playbooks = self.playbook_executions.write().await;
                playbooks.insert(playbook.id.clone(), playbook.clone());
                Ok(playbook.id)
            }
            _ => Err(UnifiedDataError::Query(
                format!("Unsupported record type: {}", record.record_type)
            ))
        }
    }

    async fn get_record(&self, id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>> {
        // Check incidents first
        let incidents = self.incidents.read().await;
        if let Some(incident) = incidents.get(id) {
            return Ok(Some(self.incident_to_universal(incident)));
        }

        // Check alerts
        let alerts = self.alerts.read().await;
        if let Some(alert) = alerts.get(id) {
            return Ok(Some(self.alert_to_universal(alert)));
        }

        // Check playbook executions
        let playbooks = self.playbook_executions.read().await;
        if let Some(playbook) = playbooks.get(id) {
            return Ok(Some(self.playbook_to_universal(playbook)));
        }

        Ok(None)
    }

    async fn update_record(&self, record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        match record.record_type.as_str() {
            "security_incident" => {
                let incident = self.universal_to_incident(record)?;
                let mut incidents = self.incidents.write().await;
                incidents.insert(incident.id.clone(), incident);
                Ok(())
            }
            "security_alert" => {
                let alert = self.universal_to_alert(record)?;
                let mut alerts = self.alerts.write().await;
                alerts.insert(alert.id.clone(), alert);
                Ok(())
            }
            "playbook_execution" => {
                let playbook = self.universal_to_playbook(record)?;
                let mut playbooks = self.playbook_executions.write().await;
                playbooks.insert(playbook.id.clone(), playbook);
                Ok(())
            }
            _ => Err(UnifiedDataError::Query(
                format!("Unsupported record type: {}", record.record_type)
            ))
        }
    }

    async fn delete_record(&self, id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        let mut incidents = self.incidents.write().await;
        let mut alerts = self.alerts.write().await;
        let mut playbooks = self.playbook_executions.write().await;
        
        if incidents.remove(id).is_some() || 
           alerts.remove(id).is_some() || 
           playbooks.remove(id).is_some() {
            Ok(())
        } else {
            Err(UnifiedDataError::NotFound(format!("Record with id {} not found", id)))
        }
    }

    async fn query_records(&self, query: &UnifiedQuery, _context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult> {
        let start_time = std::time::Instant::now();
        let mut results = Vec::new();
        let mut relationships = Vec::new();

        // Filter by record types if specified
        let should_include_incidents = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"security_incident".to_string()));
        let should_include_alerts = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"security_alert".to_string()));
        let should_include_playbooks = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"playbook_execution".to_string()));

        // Query incidents
        if should_include_incidents {
            let incidents = self.incidents.read().await;
            for incident in incidents.values() {
                let universal = self.incident_to_universal(incident);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    if !incident.title.contains(text_query) && 
                       !incident.description.contains(text_query) {
                        continue;
                    }
                }

                results.push(universal);
            }
        }

        // Query alerts  
        if should_include_alerts {
            let alerts = self.alerts.read().await;
            for alert in alerts.values() {
                let universal = self.alert_to_universal(alert);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    if !alert.title.contains(text_query) && 
                       !alert.description.contains(text_query) {
                        continue;
                    }
                }

                results.push(universal);
            }
        }

        // Query playbook executions
        if should_include_playbooks {
            let playbooks = self.playbook_executions.read().await;
            for playbook in playbooks.values() {
                let universal = self.playbook_to_universal(playbook);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    if !playbook.playbook_id.contains(text_query) {
                        continue;
                    }
                }

                results.push(universal);
            }
        }

        // Get relationships for the records
        let rel_map = self.relationships.read().await;
        for record in &results {
            for relationship in rel_map.values() {
                if relationship.source_id == record.id || relationship.target_id == record.id {
                    relationships.push(relationship.clone());
                }
            }
        }

        // Apply limit
        if let Some(limit) = query.limit {
            results.truncate(limit);
        }

        let total_count = results.len();
        let query_time = start_time.elapsed().as_millis() as u64;

        Ok(UnifiedQueryResult {
            records: results,
            relationships,
            total_count: Some(total_count),
            query_time_ms: query_time,
            pagination: None, // TODO: Implement pagination
        })
    }

    async fn store_relationship(&self, relationship: &DataRelationship, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        let mut relationships = self.relationships.write().await;
        relationships.insert(relationship.id.clone(), relationship.clone());
        Ok(relationship.id.clone())
    }

    async fn get_relationships(&self, record_id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>> {
        let relationships = self.relationships.read().await;
        let related = relationships.values()
            .filter(|rel| rel.source_id == record_id || rel.target_id == record_id)
            .cloned()
            .collect();
        Ok(related)
    }

    async fn bulk_store_records(&self, records: &[UniversalDataRecord], context: &UnifiedQueryContext) -> UnifiedResult<BulkOperationResult> {
        let start_time = std::time::Instant::now();
        let mut success_count = 0;
        let mut error_count = 0;
        let mut errors = Vec::new();
        let mut processed_ids = Vec::new();

        for record in records {
            match self.store_record(record, context).await {
                Ok(id) => {
                    success_count += 1;
                    processed_ids.push(id);
                }
                Err(e) => {
                    error_count += 1;
                    errors.push(e.to_string());
                }
            }
        }

        let operation_time = start_time.elapsed().as_millis() as u64;

        Ok(BulkOperationResult {
            success_count,
            error_count,
            errors,
            processed_ids,
            operation_time_ms: operation_time,
        })
    }
}