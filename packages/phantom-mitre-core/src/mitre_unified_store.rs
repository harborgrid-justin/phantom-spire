//! Native Unified Data Store Implementation for MITRE ATT&CK Data
//! 
//! This module implements the UnifiedDataStore trait directly for MITRE data,
//! providing native integration with the unified data layer interface.

use crate::unified::*;
use crate::{MitreTechnique, MitreGroup, ThreatAnalysis};
use crate::data_stores::{DataStoreConfig, TenantContext};
use async_trait::async_trait;
use std::collections::HashMap;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc};

/// Native MITRE Data Store implementing UnifiedDataStore interface
#[derive(Debug)]
pub struct MitreUnifiedDataStore {
    store_id: String,
    techniques: RwLock<HashMap<String, MitreTechnique>>,
    groups: RwLock<HashMap<String, MitreGroup>>,
    analyses: RwLock<HashMap<String, ThreatAnalysis>>,
    relationships: RwLock<HashMap<String, DataRelationship>>,
    config: DataStoreConfig,
    initialized: RwLock<bool>,
}

impl MitreUnifiedDataStore {
    pub fn new(config: DataStoreConfig) -> Self {
        Self {
            store_id: "phantom-mitre-core".to_string(),
            techniques: RwLock::new(HashMap::new()),
            groups: RwLock::new(HashMap::new()),
            analyses: RwLock::new(HashMap::new()),
            relationships: RwLock::new(HashMap::new()),
            config,
            initialized: RwLock::new(false),
        }
    }

    /// Convert MitreTechnique to UniversalDataRecord
    fn technique_to_universal(&self, technique: &MitreTechnique) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("version".to_string(), serde_json::Value::String(technique.version.clone()));
        metadata.insert("revoked".to_string(), serde_json::Value::Bool(technique.revoked));
        metadata.insert("deprecated".to_string(), serde_json::Value::Bool(technique.deprecated));
        metadata.insert("remote_support".to_string(), serde_json::Value::Bool(technique.remote_support));

        UniversalDataRecord {
            id: technique.id.clone(),
            record_type: "mitre_technique".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(technique).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: vec![format!("{:?}", technique.tactic)], // Use tactic as tag
            created_at: technique.created,
            updated_at: technique.modified,
            tenant_id: None,
        }
    }

    /// Convert MitreGroup to UniversalDataRecord
    fn group_to_universal(&self, group: &MitreGroup) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("sophistication_level".to_string(), serde_json::Value::String(group.sophistication_level.clone()));
        if let Some(origin) = &group.origin_country {
            metadata.insert("origin_country".to_string(), serde_json::Value::String(origin.clone()));
        }

        UniversalDataRecord {
            id: group.id.clone(),
            record_type: "mitre_group".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(group).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: group.aliases.clone(),
            created_at: group.first_seen,
            updated_at: group.last_seen,
            tenant_id: None,
        }
    }

    /// Convert ThreatAnalysis to UniversalDataRecord
    fn analysis_to_universal(&self, analysis: &ThreatAnalysis) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("risk_score".to_string(), serde_json::Value::Number(
            serde_json::Number::from_f64(analysis.risk_score).unwrap_or_else(|| serde_json::Number::from(0))
        ));
        metadata.insert("confidence_score".to_string(), serde_json::Value::Number(
            serde_json::Number::from_f64(analysis.confidence_score).unwrap_or_else(|| serde_json::Number::from(0))
        ));

        UniversalDataRecord {
            id: analysis.analysis_id.clone(),
            record_type: "threat_analysis".to_string(),
            source_plugin: self.store_id.clone(),
            data: serde_json::to_value(analysis).unwrap_or_default(),
            metadata,
            relationships: vec![], // Will be populated separately
            tags: analysis.recommended_mitigations.clone(), // Use mitigations as tags
            created_at: analysis.timestamp,
            updated_at: analysis.timestamp, // No separate updated_at in ThreatAnalysis
            tenant_id: None,
        }
    }

    /// Convert UniversalDataRecord back to MitreTechnique
    fn universal_to_technique(&self, record: &UniversalDataRecord) -> UnifiedResult<MitreTechnique> {
        if record.record_type != "mitre_technique" {
            return Err(UnifiedDataError::Query(
                format!("Expected mitre_technique record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }

    /// Convert UniversalDataRecord back to MitreGroup
    fn universal_to_group(&self, record: &UniversalDataRecord) -> UnifiedResult<MitreGroup> {
        if record.record_type != "mitre_group" {
            return Err(UnifiedDataError::Query(
                format!("Expected mitre_group record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }

    /// Convert UniversalDataRecord back to ThreatAnalysis
    fn universal_to_analysis(&self, record: &UniversalDataRecord) -> UnifiedResult<ThreatAnalysis> {
        if record.record_type != "threat_analysis" {
            return Err(UnifiedDataError::Query(
                format!("Expected threat_analysis record type, got {}", record.record_type)
            ));
        }

        serde_json::from_value(record.data.clone())
            .map_err(|e| UnifiedDataError::Serialization(e.to_string()))
    }
}

#[async_trait]
impl UnifiedDataStore for MitreUnifiedDataStore {
    fn store_id(&self) -> &str {
        &self.store_id
    }

    fn capabilities(&self) -> Vec<String> {
        vec![
            "mitre_techniques".to_string(),
            "mitre_groups".to_string(),
            "threat_analysis".to_string(),
            "technique_mapping".to_string(),
            "relationship_mapping".to_string(),
            "full_text_search".to_string(),
            "tactic_filtering".to_string(),
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
        let technique_count = self.techniques.read().await.len();
        let group_count = self.groups.read().await.len();
        let analysis_count = self.analyses.read().await.len();
        let relationship_count = self.relationships.read().await.len();

        let mut metrics = HashMap::new();
        metrics.insert("technique_count".to_string(), serde_json::Value::Number(serde_json::Number::from(technique_count)));
        metrics.insert("group_count".to_string(), serde_json::Value::Number(serde_json::Number::from(group_count)));
        metrics.insert("analysis_count".to_string(), serde_json::Value::Number(serde_json::Number::from(analysis_count)));
        metrics.insert("relationship_count".to_string(), serde_json::Value::Number(serde_json::Number::from(relationship_count)));

        Ok(UnifiedHealthStatus {
            healthy: initialized,
            response_time_ms: 15, // Mock response time
            message: if initialized { None } else { Some("Store not initialized".to_string()) },
            capabilities: self.capabilities(),
            metrics,
            last_check: Utc::now(),
        })
    }

    async fn store_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<String> {
        match record.record_type.as_str() {
            "mitre_technique" => {
                let technique = self.universal_to_technique(record)?;
                let mut techniques = self.techniques.write().await;
                techniques.insert(technique.id.clone(), technique.clone());
                Ok(technique.id)
            }
            "mitre_group" => {
                let group = self.universal_to_group(record)?;
                let mut groups = self.groups.write().await;
                groups.insert(group.id.clone(), group.clone());
                Ok(group.id)
            }
            "threat_analysis" => {
                let analysis = self.universal_to_analysis(record)?;
                let mut analyses = self.analyses.write().await;
                analyses.insert(analysis.analysis_id.clone(), analysis.clone());
                Ok(analysis.analysis_id)
            }
            _ => Err(UnifiedDataError::Query(
                format!("Unsupported record type: {}", record.record_type)
            ))
        }
    }

    async fn get_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>> {
        // Check techniques first
        let techniques = self.techniques.read().await;
        if let Some(technique) = techniques.get(id) {
            return Ok(Some(self.technique_to_universal(technique)));
        }

        // Check groups
        let groups = self.groups.read().await;
        if let Some(group) = groups.get(id) {
            return Ok(Some(self.group_to_universal(group)));
        }

        // Check analyses
        let analyses = self.analyses.read().await;
        if let Some(analysis) = analyses.get(id) {
            return Ok(Some(self.analysis_to_universal(analysis)));
        }

        Ok(None)
    }

    async fn update_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<()> {
        match record.record_type.as_str() {
            "mitre_technique" => {
                let technique = self.universal_to_technique(record)?;
                let mut techniques = self.techniques.write().await;
                techniques.insert(technique.id.clone(), technique);
                Ok(())
            }
            "mitre_group" => {
                let group = self.universal_to_group(record)?;
                let mut groups = self.groups.write().await;
                groups.insert(group.id.clone(), group);
                Ok(())
            }
            "threat_analysis" => {
                let analysis = self.universal_to_analysis(record)?;
                let mut analyses = self.analyses.write().await;
                analyses.insert(analysis.analysis_id.clone(), analysis);
                Ok(())
            }
            _ => Err(UnifiedDataError::Query(
                format!("Unsupported record type: {}", record.record_type)
            ))
        }
    }

    async fn delete_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<()> {
        let mut techniques = self.techniques.write().await;
        let mut groups = self.groups.write().await;
        let mut analyses = self.analyses.write().await;
        
        if techniques.remove(id).is_some() || 
           groups.remove(id).is_some() || 
           analyses.remove(id).is_some() {
            Ok(())
        } else {
            Err(UnifiedDataError::NotFound(format!("Record with id {} not found", id)))
        }
    }

    async fn query_records(&self, query: &UnifiedQuery, context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult> {
        let start_time = std::time::Instant::now();
        let mut results = Vec::new();
        let mut relationships = Vec::new();

        // Filter by record types if specified
        let should_include_techniques = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"mitre_technique".to_string()));
        let should_include_groups = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"mitre_group".to_string()));
        let should_include_analyses = query.record_types.as_ref()
            .map_or(true, |types| types.contains(&"threat_analysis".to_string()));

        // Query techniques
        if should_include_techniques {
            let techniques = self.techniques.read().await;
            for technique in techniques.values() {
                let universal = self.technique_to_universal(technique);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    if !technique.name.contains(text_query) && 
                       !technique.description.contains(text_query) {
                        continue;
                    }
                }

                results.push(universal);
            }
        }

        // Query groups
        if should_include_groups {
            let groups = self.groups.read().await;
            for group in groups.values() {
                let universal = self.group_to_universal(group);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    if !group.name.contains(text_query) && 
                       !group.description.contains(text_query) &&
                       !group.aliases.iter().any(|alias| alias.contains(text_query)) {
                        continue;
                    }
                }

                results.push(universal);
            }
        }

        // Query analyses
        if should_include_analyses {
            let analyses = self.analyses.read().await;
            for analysis in analyses.values() {
                let universal = self.analysis_to_universal(analysis);
                
                // Apply filters
                if let Some(text_query) = &query.text_query {
                    let mut technique_name = String::new();
                    let mut technique_description = String::new();
                    
                    // Get the name and description from the analysis's techniques
                    if !analysis.techniques_identified.is_empty() {
                        technique_name = analysis.techniques_identified[0].technique_name.clone();
                    }
                    
                    // For now, check if the analysis_id contains the text
                    if !analysis.analysis_id.contains(text_query) {
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

    async fn store_relationship(&self, relationship: &DataRelationship, context: &UnifiedQueryContext) -> UnifiedResult<String> {
        let mut relationships = self.relationships.write().await;
        relationships.insert(relationship.id.clone(), relationship.clone());
        Ok(relationship.id.clone())
    }

    async fn get_relationships(&self, record_id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>> {
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