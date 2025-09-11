//! Serialization and Data Transformation Module
//! 
//! Advanced data serialization, transformation, and tenant isolation for incident response data

use crate::models::*;
use crate::incident_models::*;
use crate::evidence_models::*;
use crate::playbook_models::*;
use super::{DataStoreError, DataStoreResult, TenantContext};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Tenant-isolated data container with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantData<T> {
    pub data: T,
    pub tenant_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: HashMap<String, Value>,
}

impl<T> TenantData<T> 
where 
    T: Serialize + for<'de> Deserialize<'de>
{
    pub fn new(data: T, context: &TenantContext) -> Self {
        Self {
            data,
            tenant_id: context.tenant_id.clone(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            metadata: HashMap::new(),
        }
    }
    
    pub fn with_metadata(mut self, key: String, value: Value) -> Self {
        self.metadata.insert(key, value);
        self
    }
    
    pub fn update_data(mut self, data: T) -> Self {
        self.data = data;
        self.updated_at = Utc::now();
        self
    }
}

/// Data serialization utilities
pub struct DataSerializer;

impl DataSerializer {
    pub fn to_json<T>(data: &T) -> DataStoreResult<String>
    where
        T: Serialize,
    {
        serde_json::to_string(data).map_err(|e| DataStoreError::Serialization(e.to_string()))
    }

    pub fn from_json<T>(json: &str) -> DataStoreResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        serde_json::from_str(json).map_err(|e| DataStoreError::Serialization(e.to_string()))
    }

    pub fn to_binary<T>(data: &T) -> DataStoreResult<Vec<u8>>
    where
        T: Serialize,
    {
        bincode::serialize(data).map_err(|e| DataStoreError::Serialization(e.to_string()))
    }

    pub fn from_binary<T>(bytes: &[u8]) -> DataStoreResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        bincode::deserialize(bytes).map_err(|e| DataStoreError::Serialization(e.to_string()))
    }

    pub fn to_redis_value<T>(data: &T) -> DataStoreResult<Vec<u8>>
    where
        T: Serialize,
    {
        Self::to_binary(data)
    }

    pub fn from_redis_value<T>(bytes: &[u8]) -> DataStoreResult<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        Self::from_binary(bytes)
    }

    pub fn to_elasticsearch_doc<T>(data: &T, id: &str, index: &str) -> DataStoreResult<Value>
    where
        T: Serialize,
    {
        let mut doc = serde_json::to_value(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        
        if let Value::Object(ref mut map) = doc {
            map.insert("_id".to_string(), Value::String(id.to_string()));
            map.insert("_index".to_string(), Value::String(index.to_string()));
            map.insert("_timestamp".to_string(), Value::String(Utc::now().to_rfc3339()));
        }
        
        Ok(doc)
    }

    /// Transform incident to searchable document
    pub fn incident_to_search_doc(incident: &Incident, context: &TenantContext) -> DataStoreResult<Value> {
        let mut doc = serde_json::json!({
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "category": incident.category,
            "severity": incident.severity,
            "status": incident.status,
            "priority": incident.priority,
            "created_at": incident.created_at,
            "updated_at": incident.updated_at,
            "detected_at": incident.detected_at,
            "reported_by": incident.reported_by,
            "assigned_to": incident.assigned_to,
            "incident_commander": incident.incident_commander,
            "affected_systems": incident.affected_systems,
            "affected_users": incident.affected_users,
            "indicators": incident.indicators,
            "tags": incident.tags,
            "tenant_id": context.tenant_id,
            "searchable_text": format!("{} {} {} {}", 
                incident.title, 
                incident.description,
                incident.affected_systems.join(" "),
                incident.tags.join(" ")
            ),
            "keywords": DataTransformer::extract_keywords(&format!("{} {}", incident.title, incident.description)),
        });

        if let Some(user_id) = &context.user_id {
            doc["user_id"] = Value::String(user_id.clone());
        }

        Ok(doc)
    }

    /// Transform evidence to searchable document
    pub fn evidence_to_search_doc(evidence: &Evidence, context: &TenantContext) -> DataStoreResult<Value> {
        let mut doc = serde_json::json!({
            "id": evidence.id,
            "name": evidence.name,
            "evidence_type": evidence.evidence_type,
            "description": evidence.description,
            "source_system": evidence.source_system,
            "collected_by": evidence.collected_by,
            "collected_at": evidence.collected_at,
            "file_path": evidence.file_path,
            "file_size": evidence.file_size,
            "hash_md5": evidence.hash_md5,
            "hash_sha256": evidence.hash_sha256,
            "tags": evidence.tags,
            "tenant_id": context.tenant_id,
            "searchable_text": format!("{} {} {} {}", 
                evidence.name, 
                evidence.description,
                evidence.source_system,
                evidence.tags.join(" ")
            ),
            "keywords": DataTransformer::extract_keywords(&format!("{} {}", evidence.name, evidence.description)),
        });

        if let Some(user_id) = &context.user_id {
            doc["user_id"] = Value::String(user_id.clone());
        }

        Ok(doc)
    }

    /// Generate tenant-aware Redis key
    pub fn redis_key(base_key: &str, context: &TenantContext) -> String {
        format!("tenant:{}:{}", context.tenant_id, base_key)
    }

    /// Generate tenant-aware PostgreSQL table name
    pub fn postgres_table(base_table: &str, context: &TenantContext) -> String {
        // PostgreSQL table names can't contain colons, use underscore
        if context.tenant_id == "default" {
            base_table.to_string()
        } else {
            format!("{}_tenant_{}", base_table, context.tenant_id.replace('-', '_'))
        }
    }

    /// Generate tenant-aware MongoDB collection name
    pub fn mongo_collection(base_collection: &str, context: &TenantContext) -> String {
        if context.tenant_id == "default" {
            base_collection.to_string()
        } else {
            format!("{}_tenant_{}", base_collection, context.tenant_id)
        }
    }

    /// Generate tenant-aware Elasticsearch index name
    pub fn elasticsearch_index(base_index: &str, context: &TenantContext) -> String {
        if context.tenant_id == "default" {
            base_index.to_string()
        } else {
            format!("{}-tenant-{}", base_index, context.tenant_id)
        }
    }
}

/// Data transformation utilities
pub struct DataTransformer;

impl DataTransformer {
    /// Normalize incident ID format
    pub fn normalize_incident_id(id: &str) -> String {
        id.to_uppercase()
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '-')
            .collect()
    }

    /// Extract keywords from text for search indexing
    pub fn extract_keywords(text: &str) -> Vec<String> {
        text.to_lowercase()
            .split_whitespace()
            .filter(|word| word.len() > 2)
            .map(|word| word.trim_matches(|c: char| !c.is_alphanumeric()))
            .filter(|word| !word.is_empty())
            .map(String::from)
            .collect()
    }

    /// Generate tags for incident based on content
    pub fn generate_incident_tags(incident: &Incident) -> Vec<String> {
        let mut tags = Vec::new();
        
        // Add category-based tags
        tags.push(format!("category:{:?}", incident.category).to_lowercase());
        
        // Add severity-based tags
        tags.push(format!("severity:{:?}", incident.severity).to_lowercase());
        
        // Add status-based tags
        tags.push(format!("status:{:?}", incident.status).to_lowercase());
        
        // Add priority-based tags
        if incident.priority >= 8 {
            tags.push("priority:critical".to_string());
        } else if incident.priority >= 6 {
            tags.push("priority:high".to_string());
        } else if incident.priority >= 4 {
            tags.push("priority:medium".to_string());
        } else {
            tags.push("priority:low".to_string());
        }
        
        // Add system-based tags
        for system in &incident.affected_systems {
            tags.push(format!("system:{}", system.to_lowercase()));
        }
        
        // Add existing tags
        tags.extend(incident.tags.clone());
        
        tags
    }

    /// Generate tags for evidence based on content
    pub fn generate_evidence_tags(evidence: &Evidence) -> Vec<String> {
        let mut tags = Vec::new();
        
        // Add type-based tags
        tags.push(format!("type:{:?}", evidence.evidence_type).to_lowercase());
        
        // Add source-based tags
        tags.push(format!("source:{}", evidence.source_system.to_lowercase()));
        
        // Add size-based tags
        if evidence.file_size > 1024 * 1024 * 1024 {
            tags.push("size:large".to_string());
        } else if evidence.file_size > 1024 * 1024 {
            tags.push("size:medium".to_string());
        } else {
            tags.push("size:small".to_string());
        }
        
        // Add existing tags
        tags.extend(evidence.tags.clone());
        
        tags
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::incident_models::{IncidentCategory, IncidentSeverity, IncidentStatus};
    
    #[test]
    fn test_tenant_data_creation() {
        let context = TenantContext::new("test_tenant".to_string());
        let data = "test_data".to_string();
        
        let tenant_data = TenantData::new(data.clone(), &context);
        
        assert_eq!(tenant_data.data, data);
        assert_eq!(tenant_data.tenant_id, "test_tenant");
        assert!(tenant_data.metadata.is_empty());
    }
    
    #[test]
    fn test_redis_key_generation() {
        let context = TenantContext::new("test_tenant".to_string());
        let key = DataSerializer::redis_key("incidents", &context);
        
        assert_eq!(key, "tenant:test_tenant:incidents");
    }
    
    #[test]
    fn test_normalize_incident_id() {
        let id = DataTransformer::normalize_incident_id("inc-2023-001");
        assert_eq!(id, "INC-2023-001");
        
        let id = DataTransformer::normalize_incident_id("inc@2023!001");
        assert_eq!(id, "INC2023001");
    }
    
    #[test]
    fn test_extract_keywords() {
        let keywords = DataTransformer::extract_keywords("This is a test incident with malware");
        assert!(keywords.contains(&"test".to_string()));
        assert!(keywords.contains(&"incident".to_string()));
        assert!(keywords.contains(&"malware".to_string()));
        assert!(!keywords.contains(&"is".to_string())); // Should filter short words
    }
}