//! SecOp Core Data Store Adapter
//! 
//! Adapter that allows phantom-secop-core to work with the unified data layer interface

use super::mod::*;
use crate::data_layer::unified::{
    UnifiedDataStore, UniversalDataRecord, DataRelationship, UnifiedQueryContext,
    UnifiedQuery, UnifiedQueryResult, UnifiedHealthStatus, UnifiedResult, UnifiedDataError,
    BulkOperationResult,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::{json, Value};
use std::collections::HashMap;

/// Adapter for SecOp Core data stores to implement the unified interface
pub struct SecOpCoreAdapter {
    store: Box<dyn crate::stores::IncidentStore>,
    data_store: Box<dyn crate::stores::DataStore>,
    store_id: String,
}

impl SecOpCoreAdapter {
    pub fn new(
        store: Box<dyn crate::stores::IncidentStore>, 
        data_store: Box<dyn crate::stores::DataStore>,
        store_id: String
    ) -> Self {
        Self {
            store,
            data_store,
            store_id,
        }
    }
    
    /// Convert SecurityIncident to UniversalDataRecord
    fn incident_to_universal(&self, incident: &crate::SecurityIncident) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("severity".to_string(), json!(incident.severity));
        metadata.insert("status".to_string(), json!(incident.status));
        metadata.insert("incident_type".to_string(), json!(incident.incident_type));
        metadata.insert("affected_systems".to_string(), json!(incident.affected_systems));
        metadata.insert("assigned_to".to_string(), json!(incident.assigned_to));
        metadata.insert("priority".to_string(), json!(incident.priority));
        
        // Build relationships from incident
        let mut relationships = Vec::new();
        
        // Artifacts related to this incident
        for artifact in &incident.artifacts {
            relationships.push(DataRelationship {
                id: format!("{}-has-artifact-{}", incident.id, artifact.id),
                relationship_type: "has_artifact".to_string(),
                source_id: incident.id.clone(),
                target_id: artifact.id.clone(),
                confidence: Some(1.0),
                metadata: {
                    let mut meta = HashMap::new();
                    meta.insert("artifact_type".to_string(), json!(artifact.artifact_type));
                    meta.insert("value".to_string(), json!(artifact.value));
                    meta
                },
                created_at: incident.created_at,
            });
        }
        
        // Tags as relationships to tag entities
        for tag in &incident.tags {
            relationships.push(DataRelationship {
                id: format!("{}-tagged-{}", incident.id, tag),
                relationship_type: "tagged_with".to_string(),
                source_id: incident.id.clone(),
                target_id: format!("tag:{}", tag),
                confidence: Some(1.0),
                metadata: HashMap::new(),
                created_at: incident.created_at,
            });
        }
        
        UniversalDataRecord {
            id: incident.id.clone(),
            record_type: "security_incident".to_string(),
            source_plugin: "phantom-secop-core".to_string(),
            data: json!({
                "title": incident.title,
                "description": incident.description,
                "severity": incident.severity,
                "status": incident.status,
                "incident_type": incident.incident_type,
                "affected_systems": incident.affected_systems,
                "assigned_to": incident.assigned_to,
                "priority": incident.priority,
                "source": incident.source,
                "artifacts": incident.artifacts,
                "timeline": incident.timeline,
                "containment_actions": incident.containment_actions,
                "eradication_actions": incident.eradication_actions,
                "recovery_actions": incident.recovery_actions,
                "lessons_learned": incident.lessons_learned
            }),
            metadata,
            relationships,
            tags: incident.tags.clone(),
            created_at: incident.created_at,
            updated_at: incident.updated_at,
            tenant_id: None, // SecOp core doesn't have built-in multi-tenancy
        }
    }
    
    /// Convert UniversalDataRecord to SecurityIncident (if applicable)
    fn universal_to_incident(&self, record: &UniversalDataRecord) -> Result<crate::SecurityIncident, UnifiedDataError> {
        if record.record_type != "security_incident" {
            return Err(UnifiedDataError::Serialization(
                format!("Cannot convert {} to SecurityIncident", record.record_type)
            ));
        }
        
        let data = &record.data;
        
        // Extract basic fields
        let title = data["title"].as_str().unwrap_or("").to_string();
        let description = data["description"].as_str().unwrap_or("").to_string();
        let severity = data["severity"].as_str()
            .and_then(|s| match s {
                "Low" => Some(crate::IncidentSeverity::Low),
                "Medium" => Some(crate::IncidentSeverity::Medium),
                "High" => Some(crate::IncidentSeverity::High),
                "Critical" => Some(crate::IncidentSeverity::Critical),
                _ => None,
            })
            .unwrap_or(crate::IncidentSeverity::Medium);
        
        let status = data["status"].as_str()
            .and_then(|s| match s {
                "Open" => Some(crate::IncidentStatus::Open),
                "InProgress" => Some(crate::IncidentStatus::InProgress),
                "Resolved" => Some(crate::IncidentStatus::Resolved),
                "Closed" => Some(crate::IncidentStatus::Closed),
                _ => None,
            })
            .unwrap_or(crate::IncidentStatus::Open);
        
        let incident_type = data["incident_type"].as_str().unwrap_or("Unknown").to_string();
        let affected_systems = data["affected_systems"].as_array()
            .map(|arr| arr.iter().filter_map(|v| v.as_str()).map(|s| s.to_string()).collect())
            .unwrap_or_default();
        
        let assigned_to = data["assigned_to"].as_str().map(|s| s.to_string());
        let priority = data["priority"].as_str()
            .and_then(|s| match s {
                "Low" => Some(crate::Priority::Low),
                "Medium" => Some(crate::Priority::Medium),
                "High" => Some(crate::Priority::High),
                "Critical" => Some(crate::Priority::Critical),
                _ => None,
            })
            .unwrap_or(crate::Priority::Medium);
        
        let source = data["source"].as_str().unwrap_or("Manual").to_string();
        
        // Extract artifacts - this is complex, so we'll create basic ones
        let artifacts = Vec::new(); // TODO: Implement artifact extraction
        
        // Extract timeline, actions, and lessons learned
        let timeline = Vec::new(); // TODO: Implement timeline extraction
        let containment_actions = Vec::new(); // TODO: Implement actions extraction
        let eradication_actions = Vec::new();
        let recovery_actions = Vec::new();
        let lessons_learned = data["lessons_learned"].as_str().map(|s| s.to_string());
        
        Ok(crate::SecurityIncident {
            id: record.id.clone(),
            title,
            description,
            severity,
            status,
            incident_type,
            affected_systems,
            assigned_to,
            priority,
            source,
            artifacts,
            timeline,
            containment_actions,
            eradication_actions,
            recovery_actions,
            lessons_learned,
            tags: record.tags.clone(),
            created_at: record.created_at,
            updated_at: record.updated_at,
        })
    }
}

#[async_trait]
impl UnifiedDataStore for SecOpCoreAdapter {
    fn store_id(&self) -> &str {
        &self.store_id
    }
    
    fn capabilities(&self) -> Vec<String> {
        vec![
            "security_incidents".to_string(),
            "incident_management".to_string(),
            "artifacts".to_string(),
            "timelines".to_string(),
            "containment".to_string(),
            "recovery".to_string(),
            "lessons_learned".to_string(),
        ]
    }
    
    async fn initialize(&mut self) -> UnifiedResult<()> {
        self.data_store.initialize().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))?;
        
        Ok(())
    }
    
    async fn close(&mut self) -> UnifiedResult<()> {
        self.data_store.close().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))
    }
    
    async fn health_check(&self) -> UnifiedResult<UnifiedHealthStatus> {
        let start_time = std::time::Instant::now();
        
        let healthy = self.data_store.health_check().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))?;
        
        let response_time = start_time.elapsed().as_millis() as u64;
        
        let mut metrics = HashMap::new();
        
        // Get basic metrics - count incidents by status
        // This would require additional methods on the store
        metrics.insert("store_type".to_string(), json!("secop_core"));
        
        Ok(UnifiedHealthStatus {
            healthy,
            response_time_ms: response_time,
            message: if healthy { 
                Some("SecOp Core adapter is healthy".to_string()) 
            } else { 
                Some("SecOp Core adapter is not responding".to_string()) 
            },
            capabilities: self.capabilities(),
            metrics,
            last_check: Utc::now(),
        })
    }
    
    async fn store_record(&self, record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        match record.record_type.as_str() {
            "security_incident" => {
                let incident = self.universal_to_incident(record)?;
                self.store.create_incident(&incident).await
                    .map_err(|e| UnifiedDataError::Query(e.to_string()))
            }
            _ => Err(UnifiedDataError::Query(
                format!("SecOp Core does not support record type: {}", record.record_type)
            ))
        }
    }
    
    async fn get_record(&self, id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>> {
        match self.store.get_incident(id).await {
            Ok(Some(incident)) => Ok(Some(self.incident_to_universal(&incident))),
            Ok(None) => Ok(None),
            Err(e) => Err(UnifiedDataError::Query(e.to_string())),
        }
    }
    
    async fn update_record(&self, record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        if record.record_type == "security_incident" {
            let incident = self.universal_to_incident(record)?;
            self.store.update_incident(&incident).await
                .map_err(|e| UnifiedDataError::Query(e.to_string()))
        } else {
            Err(UnifiedDataError::Query(
                format!("SecOp Core does not support updating record type: {}", record.record_type)
            ))
        }
    }
    
    async fn delete_record(&self, id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        self.store.delete_incident(id).await
            .map_err(|e| UnifiedDataError::Query(e.to_string()))
    }
    
    async fn query_records(&self, query: &UnifiedQuery, _context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult> {
        let start_time = std::time::Instant::now();
        let mut records = Vec::new();
        let mut relationships = Vec::new();
        
        // SecOp core doesn't have comprehensive search, so we'll implement basic filtering
        if query.record_types.as_ref().map_or(true, |types| types.contains(&"security_incident".to_string())) {
            // This would require implementing a search method on the incident store
            // For now, we'll return an empty result since the interface doesn't have search
            
            // If we had a search method, it would look like:
            // let incidents = self.store.search_incidents(search_criteria).await?;
            // for incident in incidents {
            //     let record = self.incident_to_universal(&incident);
            //     relationships.extend(record.relationships.clone());
            //     records.push(record);
            // }
        }
        
        let query_time = start_time.elapsed().as_millis() as u64;
        
        Ok(UnifiedQueryResult {
            records,
            relationships,
            total_count: None,
            query_time_ms: query_time,
            pagination: None,
        })
    }
    
    async fn store_relationship(&self, _relationship: &DataRelationship, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        // SecOp Core stores relationships implicitly in incidents
        Err(UnifiedDataError::Query("SecOp Core handles relationships implicitly through incidents".to_string()))
    }
    
    async fn get_relationships(&self, record_id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>> {
        // Get incident and extract its relationships
        if let Some(record) = self.get_record(record_id, &UnifiedQueryContext {
            tenant_id: None,
            user_id: None,
            permissions: Vec::new(),
            filters: HashMap::new(),
            include_relationships: true,
        }).await? {
            Ok(record.relationships)
        } else {
            Ok(Vec::new())
        }
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
                    errors.push(format!("Record {}: {}", record.id, e));
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