//! IOC Core Data Store Adapter
//! 
//! Adapter that allows phantom-ioc-core to work with the unified data layer interface

use super::mod::*;
use crate::data_layer::unified::{
    UnifiedDataStore, UniversalDataRecord, DataRelationship, UnifiedQueryContext,
    UnifiedQuery, UnifiedQueryResult, UnifiedHealthStatus, UnifiedResult, UnifiedDataError,
    BulkOperationResult, TimeRange,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::{json, Value};
use std::collections::HashMap;

/// Adapter for IOC Core data stores to implement the unified interface
pub struct IOCCoreAdapter {
    store_provider: Box<dyn crate::data_stores::DataStoreProvider>,
    store_id: String,
}

impl IOCCoreAdapter {
    pub fn new(store_provider: Box<dyn crate::data_stores::DataStoreProvider>, store_id: String) -> Self {
        Self {
            store_provider,
            store_id,
        }
    }
    
    /// Convert IOCRecord to UniversalDataRecord
    fn ioc_to_universal(&self, ioc: &crate::data_stores::IOCRecord) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("confidence".to_string(), json!(ioc.confidence));
        metadata.insert("threat_score".to_string(), json!(ioc.threat_score));
        metadata.insert("source".to_string(), json!(ioc.source));
        
        // Add custom metadata
        for (key, value) in &ioc.metadata {
            metadata.insert(key.clone(), value.clone());
        }
        
        UniversalDataRecord {
            id: ioc.id.clone(),
            record_type: "ioc".to_string(),
            source_plugin: "phantom-ioc-core".to_string(),
            data: json!({
                "ioc_type": ioc.ioc_type,
                "value": ioc.value,
                "confidence": ioc.confidence,
                "threat_score": ioc.threat_score,
                "source": ioc.source
            }),
            metadata,
            relationships: Vec::new(), // IOC core doesn't have built-in relationships
            tags: ioc.tags.clone(),
            created_at: ioc.created_at,
            updated_at: ioc.updated_at,
            tenant_id: None, // IOC core doesn't have multi-tenancy built-in
        }
    }
    
    /// Convert ThreatIntelligence to UniversalDataRecord
    fn intel_to_universal(&self, intel: &crate::data_stores::ThreatIntelligence) -> UniversalDataRecord {
        let mut metadata = HashMap::new();
        metadata.insert("ioc_id".to_string(), json!(intel.ioc_id));
        metadata.insert("intel_type".to_string(), json!(intel.intel_type));
        metadata.insert("attribution".to_string(), json!(intel.attribution));
        metadata.insert("techniques".to_string(), json!(intel.techniques));
        metadata.insert("mitre_tactics".to_string(), json!(intel.mitre_tactics));
        
        // Add analysis data
        for (key, value) in &intel.analysis_data {
            metadata.insert(format!("analysis_{}", key), value.clone());
        }
        
        UniversalDataRecord {
            id: intel.id.clone(),
            record_type: "threat_intelligence".to_string(),
            source_plugin: "phantom-ioc-core".to_string(),
            data: json!({
                "ioc_id": intel.ioc_id,
                "intel_type": intel.intel_type,
                "attribution": intel.attribution,
                "techniques": intel.techniques,
                "mitre_tactics": intel.mitre_tactics,
                "analysis_data": intel.analysis_data
            }),
            metadata,
            relationships: vec![
                DataRelationship {
                    id: format!("{}-to-{}", intel.id, intel.ioc_id),
                    relationship_type: "analyzes".to_string(),
                    source_id: intel.id.clone(),
                    target_id: intel.ioc_id.clone(),
                    confidence: Some(1.0),
                    metadata: HashMap::new(),
                    created_at: intel.created_at,
                }
            ],
            tags: Vec::new(),
            created_at: intel.created_at,
            updated_at: intel.created_at, // No updated_at in ThreatIntelligence
            tenant_id: None,
        }
    }
    
    /// Convert UniversalDataRecord to IOCRecord (if applicable)
    fn universal_to_ioc(&self, record: &UniversalDataRecord) -> Result<crate::data_stores::IOCRecord, UnifiedDataError> {
        if record.record_type != "ioc" {
            return Err(UnifiedDataError::Serialization(
                format!("Cannot convert {} to IOCRecord", record.record_type)
            ));
        }
        
        let data = &record.data;
        let ioc_type = data["ioc_type"].as_str().unwrap_or("unknown").to_string();
        let value = data["value"].as_str().unwrap_or("").to_string();
        let confidence = data["confidence"].as_f64().unwrap_or(0.0) as f32;
        let threat_score = data["threat_score"].as_f64().unwrap_or(0.0) as f32;
        let source = data["source"].as_str().unwrap_or("unknown").to_string();
        
        // Extract metadata
        let mut metadata = HashMap::new();
        for (key, value) in &record.metadata {
            if !["confidence", "threat_score", "source"].contains(&key.as_str()) {
                metadata.insert(key.clone(), value.clone());
            }
        }
        
        Ok(crate::data_stores::IOCRecord {
            id: record.id.clone(),
            ioc_type,
            value,
            source,
            confidence,
            threat_score,
            tags: record.tags.clone(),
            metadata,
            created_at: record.created_at,
            updated_at: record.updated_at,
        })
    }
}

#[async_trait]
impl UnifiedDataStore for IOCCoreAdapter {
    fn store_id(&self) -> &str {
        &self.store_id
    }
    
    fn capabilities(&self) -> Vec<String> {
        vec![
            "ioc_storage".to_string(),
            "threat_intelligence".to_string(),
            "search".to_string(),
            "analytics".to_string(),
        ]
    }
    
    async fn initialize(&mut self) -> UnifiedResult<()> {
        self.store_provider.connect().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))?;
        
        self.store_provider.create_indexes().await
            .map_err(|e| UnifiedDataError::Configuration(e.to_string()))?;
        
        Ok(())
    }
    
    async fn close(&mut self) -> UnifiedResult<()> {
        self.store_provider.disconnect().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))
    }
    
    async fn health_check(&self) -> UnifiedResult<UnifiedHealthStatus> {
        let start_time = std::time::Instant::now();
        
        let healthy = self.store_provider.health_check().await
            .map_err(|e| UnifiedDataError::Connection(e.to_string()))?;
        
        let response_time = start_time.elapsed().as_millis() as u64;
        
        let mut metrics = HashMap::new();
        
        // Get analytics for basic metrics
        if let Ok(analytics) = self.store_provider.get_analytics("day").await {
            for (key, value) in analytics {
                metrics.insert(key, value);
            }
        }
        
        Ok(UnifiedHealthStatus {
            healthy,
            response_time_ms: response_time,
            message: if healthy { 
                Some("IOC Core adapter is healthy".to_string()) 
            } else { 
                Some("IOC Core adapter is not responding".to_string()) 
            },
            capabilities: self.capabilities(),
            metrics,
            last_check: Utc::now(),
        })
    }
    
    async fn store_record(&self, record: &UniversalDataRecord, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        match record.record_type.as_str() {
            "ioc" => {
                let ioc = self.universal_to_ioc(record)?;
                self.store_provider.store_ioc(&ioc).await
                    .map_err(|e| UnifiedDataError::Query(e.to_string()))
            }
            _ => Err(UnifiedDataError::Query(
                format!("IOC Core does not support record type: {}", record.record_type)
            ))
        }
    }
    
    async fn get_record(&self, id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Option<UniversalDataRecord>> {
        // Try to get as IOC first
        if let Ok(Some(ioc)) = self.store_provider.get_ioc(id).await {
            return Ok(Some(self.ioc_to_universal(&ioc)));
        }
        
        // Try to get threat intelligence
        if let Ok(intel_list) = self.store_provider.get_threat_intel_by_ioc(id).await {
            if let Some(intel) = intel_list.first() {
                return Ok(Some(self.intel_to_universal(intel)));
            }
        }
        
        Ok(None)
    }
    
    async fn update_record(&self, record: &UniversalDataRecord, context: &UnifiedQueryContext) -> UnifiedResult<()> {
        // IOC Core doesn't have explicit update methods, so we store as new
        self.store_record(record, context).await.map(|_| ())
    }
    
    async fn delete_record(&self, _id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<()> {
        // IOC Core doesn't have delete methods
        Err(UnifiedDataError::Query("IOC Core does not support record deletion".to_string()))
    }
    
    async fn query_records(&self, query: &UnifiedQuery, _context: &UnifiedQueryContext) -> UnifiedResult<UnifiedQueryResult> {
        let start_time = std::time::Instant::now();
        let mut records = Vec::new();
        
        // Handle text search for IOCs
        if let Some(text_query) = &query.text_query {
            let limit = query.limit.map(|l| l as u32);
            
            let iocs = self.store_provider.search_iocs(text_query, limit).await
                .map_err(|e| UnifiedDataError::Query(e.to_string()))?;
            
            for ioc in iocs {
                records.push(self.ioc_to_universal(&ioc));
            }
        }
        
        // Apply filters if no text query
        if query.text_query.is_none() && query.record_types.is_some() {
            if let Some(types) = &query.record_types {
                if types.contains(&"ioc".to_string()) {
                    // For now, we can't list all IOCs without a query
                    // This would require extending the IOC Core interface
                }
            }
        }
        
        let query_time = start_time.elapsed().as_millis() as u64;
        
        Ok(UnifiedQueryResult {
            records,
            relationships: Vec::new(),
            total_count: None, // IOC Core doesn't provide total counts
            query_time_ms: query_time,
            pagination: None,
        })
    }
    
    async fn store_relationship(&self, _relationship: &DataRelationship, _context: &UnifiedQueryContext) -> UnifiedResult<String> {
        // IOC Core doesn't have explicit relationship storage
        Err(UnifiedDataError::Query("IOC Core does not support explicit relationships".to_string()))
    }
    
    async fn get_relationships(&self, record_id: &str, _context: &UnifiedQueryContext) -> UnifiedResult<Vec<DataRelationship>> {
        // Get threat intelligence for this IOC, which creates implicit relationships
        let intel_list = self.store_provider.get_threat_intel_by_ioc(record_id).await
            .map_err(|e| UnifiedDataError::Query(e.to_string()))?;
        
        let mut relationships = Vec::new();
        
        for intel in intel_list {
            relationships.push(DataRelationship {
                id: format!("{}-analyzes-{}", intel.id, intel.ioc_id),
                relationship_type: "analyzes".to_string(),
                source_id: intel.id,
                target_id: intel.ioc_id,
                confidence: Some(1.0),
                metadata: HashMap::new(),
                created_at: intel.created_at,
            });
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