//! MITRE Core Data Store Adapter
//! 
//! Adapter that allows phantom-mitre-core to work with the unified data layer interface

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

/// Adapter for MITRE Core data stores to implement the unified interface
pub struct MITRECoreAdapter {
    store: Box<dyn crate::data_stores::ComprehensiveMitreStore>,
    store_id: String,
}

impl MITRECoreAdapter {
    pub fn new(store: Box<dyn crate::data_stores::ComprehensiveMitreStore>, store_id: String) -> Self {
        Self {
            store,
            store_id,
        }
    }
    
    /// Convert MitreTechnique to UniversalDataRecord
    fn technique_to_universal(&self, technique: &crate::MitreTechnique, tenant_id: Option<String>) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("tactic".to_string(), json!(technique.tactic));
        metadata.insert("kill_chain_phases".to_string(), json!(technique.kill_chain_phases));
        metadata.insert("platforms".to_string(), json!(technique.platforms));
        metadata.insert("data_sources".to_string(), json!(technique.data_sources));
        metadata.insert("detection".to_string(), json!(technique.detection));
        metadata.insert("mitigation".to_string(), json!(technique.mitigation));
        
        UniversalDataRecord {
            id: technique.id.clone(),
            record_type: "mitre_technique".to_string(),
            source_plugin: "phantom-mitre-core".to_string(),
            data: json!({
                "name": technique.name,
                "description": technique.description,
                "tactic": technique.tactic,
                "kill_chain_phases": technique.kill_chain_phases,
                "platforms": technique.platforms,
                "data_sources": technique.data_sources,
                "detection": technique.detection,
                "mitigation": technique.mitigation
            }),
            metadata,
            relationships: Vec::new(), // Relationships will be built separately
            tags: Vec::new(), // MITRE techniques don't have explicit tags
            created_at: technique.created_at.unwrap_or_else(Utc::now),
            updated_at: technique.modified.unwrap_or_else(Utc::now),
            tenant_id,
        }
    }
    
    /// Convert MitreGroup to UniversalDataRecord
    fn group_to_universal(&self, group: &crate::MitreGroup, tenant_id: Option<String>) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("aliases".to_string(), json!(group.aliases));
        
        UniversalDataRecord {
            id: group.id.clone(),
            record_type: "mitre_group".to_string(),
            source_plugin: "phantom-mitre-core".to_string(),
            data: json!({
                "name": group.name,
                "description": group.description,
                "aliases": group.aliases
            }),
            metadata,
            relationships: Vec::new(),
            tags: Vec::new(),
            created_at: group.created_at.unwrap_or_else(Utc::now),
            updated_at: group.modified.unwrap_or_else(Utc::now),
            tenant_id,
        }
    }
    
    /// Convert ThreatAnalysis to UniversalDataRecord
    fn analysis_to_universal(&self, analysis: &crate::ThreatAnalysis, tenant_id: Option<String>) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("analysis_type".to_string(), json!(analysis.analysis_type));
        metadata.insert("confidence_score".to_string(), json!(analysis.confidence_score));
        metadata.insert("risk_level".to_string(), json!(analysis.risk_level));
        metadata.insert("affected_systems".to_string(), json!(analysis.affected_systems));
        metadata.insert("indicators".to_string(), json!(analysis.indicators));
        
        // Build relationships from analysis
        let mut relationships = Vec::new();
        
        // Techniques used in this analysis
        for technique_id in &analysis.techniques_used {
            relationships.push(DataRelationship {
                id: format!("{}-uses-{}", analysis.id, technique_id),
                relationship_type: "uses".to_string(),
                source_id: analysis.id.clone(),
                target_id: technique_id.clone(),
                confidence: Some(analysis.confidence_score as f64),
                metadata: HashMap::new(),
                created_at: analysis.created_at,
            });
        }
        
        // Groups attributed in this analysis
        for group_id in &analysis.attributed_groups {
            relationships.push(DataRelationship {
                id: format!("{}-attributes-{}", analysis.id, group_id),
                relationship_type: "attributes_to".to_string(),
                source_id: analysis.id.clone(),
                target_id: group_id.clone(),
                confidence: Some(analysis.confidence_score as f64),
                metadata: HashMap::new(),
                created_at: analysis.created_at,
            });
        }
        
        UniversalDataRecord {
            id: analysis.id.clone(),
            record_type: "threat_analysis".to_string(),
            source_plugin: "phantom-mitre-core".to_string(),
            data: json!({
                "analysis_type": analysis.analysis_type,
                "target": analysis.target,
                "description": analysis.description,
                "techniques_used": analysis.techniques_used,
                "attributed_groups": analysis.attributed_groups,
                "confidence_score": analysis.confidence_score,
                "risk_level": analysis.risk_level,
                "affected_systems": analysis.affected_systems,
                "recommendations": analysis.recommendations,
                "indicators": analysis.indicators
            }),
            metadata,
            relationships,
            tags: Vec::new(),
            created_at: analysis.created_at,
            updated_at: analysis.created_at, // Analysis doesn't have updated_at
            tenant_id,
        }
    }
    
    /// Create tenant context from unified context
    fn create_tenant_context(&self, context: &UnifiedQueryContext) -> crate::data_stores::TenantContext {
        crate::data_stores::TenantContext {
            tenant_id: context.tenant_id.clone().unwrap_or_else(|| "default".to_string()),
            user_id: context.user_id.clone(),
            organization_id: None,
            permissions: context.permissions.clone(),
        }
    }
    
    /// Convert unified query to MITRE search criteria
    fn create_search_criteria(&self, query: &UnifiedQuery) -> crate::data_stores::SearchCriteria {
        crate::data_stores::SearchCriteria {
            query: query.text_query.clone(),
            filters: query.filters.iter().map(|(k, v)| (k.clone(), v.to_string())).collect(),
            limit: query.limit,
            offset: query.offset,
            sort_by: query.sort_by.clone(),
            sort_order: if query.sort_desc {
                Some(crate::data_stores::SortOrder::Descending)
            } else {
                Some(crate::data_stores::SortOrder::Ascending)
            },
        }
    }
}

#[async_trait]
impl UnifiedDataStore for MITRECoreAdapter {
    fn store_id(&self) -> &str {
        &self.store_id
    }
    
    fn capabilities(&self) -> Vec<String> {
        vec![
            "mitre_techniques".to_string(),
            "mitre_groups".to_string(),
            "mitre_software".to_string(),
            "mitigations".to_string(),
            "detection_rules".to_string(),
            "threat_analysis".to_string(),
            "multi_tenancy".to_string(),
            "full_text_search".to_string(),
            "relationships".to_string(),
        ]
    }
    
    async fn initialize(&mut self) -> UnifiedResult<()> {
        self.store.initialize().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))
    }
    
    async fn close(&mut self) -> UnifiedResult<()> {
        self.store.close().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))
    }
    
    async fn health_check(&self) -> UnifiedResult<UnifiedHealthStatus> {
        let start_time = std::time::Instant::now();
        
        let healthy = self.store.health_check().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))?;
        
        let response_time = start_time.elapsed().as_millis() as u64;
        
        let mut metrics = HashMap::new();
        
        // Get metrics if available
        let tenant_context = crate::data_stores::TenantContext {
            tenant_id: "system".to_string(),
            user_id: None,
            organization_id: None,
            permissions: vec!["read".to_string()],
        };
        
        if let Ok(store_metrics) = self.store.get_metrics(&tenant_context).await {
            metrics.insert("total_techniques".to_string(), json!(store_metrics.total_techniques));
            metrics.insert("total_groups".to_string(), json!(store_metrics.total_groups));
            metrics.insert("total_software".to_string(), json!(store_metrics.total_software));
            metrics.insert("total_mitigations".to_string(), json!(store_metrics.total_mitigations));
            metrics.insert("total_detection_rules".to_string(), json!(store_metrics.total_detection_rules));
            metrics.insert("total_analyses".to_string(), json!(store_metrics.total_analyses));
            metrics.insert("storage_size_bytes".to_string(), json!(store_metrics.storage_size_bytes));
        }
        
        Ok(UnifiedHealthStatus {
            healthy,
            response_time_ms: response_time,
            message: if healthy { 
                Some("MITRE Core adapter is healthy".to_string()) 
            } else { 
                Some("MITRE Core adapter is not responding".to_string()) 
            },
            capabilities: self.capabilities(),
            metrics,
            last_check: Utc::now(),
        })
    }
    
    async fn store_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<String> {
        let tenant_context = self.create_tenant_context(context);
        
        match record.record_type.as_str() {
            "mitre_technique" => {
                // Convert back to MitreTechnique - this is complex, so for now return error
                Err(UnifiedDataError::Query("MITRE Core adapter does not support storing techniques via unified interface yet".to_string()))
            }
            "mitre_group" => {
                Err(UnifiedDataError::Query("MITRE Core adapter does not support storing groups via unified interface yet".to_string()))
            }
            "threat_analysis" => {
                Err(UnifiedDataError::Query("MITRE Core adapter does not support storing analyses via unified interface yet".to_string()))
            }
            _ => Err(UnifiedDataError::Query(
                format!("MITRE Core does not support record type: {}", record.record_type)
            ))
        }
    }
    
    async fn get_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>> {
        let tenant_context = self.create_tenant_context(context);
        
        // Try to get as technique
        if let Ok(Some(technique)) = self.store.get_technique(id, &tenant_context).await {
            return Ok(Some(self.technique_to_universal(&technique, context.tenant_id.clone())));
        }
        
        // Try to get as group
        if let Ok(Some(group)) = self.store.get_group(id, &tenant_context).await {
            return Ok(Some(self.group_to_universal(&group, context.tenant_id.clone())));
        }
        
        // Try to get as analysis
        if let Ok(Some(analysis)) = self.store.get_analysis(id, &tenant_context).await {
            return Ok(Some(self.analysis_to_universal(&analysis, context.tenant_id.clone())));
        }
        
        Ok(None)
    }
    
    async fn update_record(&self, _record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        Err(UnifiedDataError::Query("MITRE Core adapter does not support updating records via unified interface yet".to_string()))
    }
    
    async fn delete_record(&self, id: &str, context: &UnifiedQueryContext) -> UnifiedResult<()> {
        let tenant_context = self.create_tenant_context(context);
        
        // Try to delete as technique
        if self.store.delete_technique(id, &tenant_context).await.is_ok() {
            return Ok(());
        }
        
        // Try to delete as group
        if self.store.delete_group(id, &tenant_context).await.is_ok() {
            return Ok(());
        }
        
        // Try to delete as analysis
        if self.store.delete_analysis(id, &tenant_context).await.is_ok() {
            return Ok(());
        }
        
        Err(UnifiedDataError::NotFound(format!("Record {} not found", id)))
    }
    
    async fn query_records(&self, query: &UnifiedQuery, context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult> {
        let start_time = std::time::Instant::now();
        let tenant_context = self.create_tenant_context(context);
        let search_criteria = self.create_search_criteria(query);
        
        let mut all_records = Vec::new();
        let mut all_relationships = Vec::new();
        
        // Query based on record types or query all if not specified
        let record_types = query.record_types.as_ref().map(|v| v.as_slice()).unwrap_or(&[
            "mitre_technique".to_string(),
            "mitre_group".to_string(), 
            "threat_analysis".to_string()
        ]);
        
        for record_type in record_types {
            match record_type.as_str() {
                "mitre_technique" => {
                    if let Ok(results) = self.store.search_techniques(&search_criteria, &tenant_context).await {
                        for technique in results.items {
                            all_records.push(self.technique_to_universal(&technique, context.tenant_id.clone()));
                        }
                    }
                }
                "mitre_group" => {
                    if let Ok(results) = self.store.search_groups(&search_criteria, &tenant_context).await {
                        for group in results.items {
                            all_records.push(self.group_to_universal(&group, context.tenant_id.clone()));
                        }
                    }
                }
                "threat_analysis" => {
                    if let Ok(results) = self.store.search_analyses(&search_criteria, &tenant_context).await {
                        for analysis in results.items {
                            let record = self.analysis_to_universal(&analysis, context.tenant_id.clone());
                            all_relationships.extend(record.relationships.clone());
                            all_records.push(record);
                        }
                    }
                }
                _ => {} // Skip unknown types
            }
        }
        
        let query_time = start_time.elapsed().as_millis() as u64;
        
        Ok(UnifiedQueryResult {
            records: all_records,
            relationships: all_relationships,
            total_count: None, // Would need to aggregate from all searches
            query_time_ms: query_time,
            pagination: None,
        })
    }
    
    async fn store_relationship(&self, _relationship: &DataRelationship, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        // MITRE Core stores relationships implicitly in analyses
        Err(UnifiedDataError::Query("MITRE Core handles relationships implicitly through analyses".to_string()))
    }
    
    async fn get_relationships(&self, record_id: &str, context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>> {
        let tenant_context = self.create_tenant_context(context);
        let mut relationships = Vec::new();
        
        // Look for analyses that reference this record
        let search_criteria = crate::data_stores::SearchCriteria {
            query: None,
            filters: HashMap::new(),
            limit: Some(100),
            offset: None,
            sort_by: None,
            sort_order: None,
        };
        
        if let Ok(analyses_results) = self.store.search_analyses(&search_criteria, &tenant_context).await {
            for analysis in analyses_results.items {
                // Check if this analysis references the record
                if analysis.techniques_used.contains(&record_id.to_string()) {
                    relationships.push(DataRelationship {
                        id: format!("{}-uses-{}", analysis.id, record_id),
                        relationship_type: "uses".to_string(),
                        source_id: analysis.id.clone(),
                        target_id: record_id.to_string(),
                        confidence: Some(analysis.confidence_score as f64),
                        metadata: HashMap::new(),
                        created_at: analysis.created_at,
                    });
                }
                
                if analysis.attributed_groups.contains(&record_id.to_string()) {
                    relationships.push(DataRelationship {
                        id: format!("{}-attributes-{}", analysis.id, record_id),
                        relationship_type: "attributes_to".to_string(),
                        source_id: analysis.id.clone(),
                        target_id: record_id.to_string(),
                        confidence: Some(analysis.confidence_score as f64),
                        metadata: HashMap::new(),
                        created_at: analysis.created_at,
                    });
                }
            }
        }
        
        Ok(relationships)
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