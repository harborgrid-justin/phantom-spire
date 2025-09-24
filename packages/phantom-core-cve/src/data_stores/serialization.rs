//! Data Serialization and Transformation
//! 
//! Handles serialization/deserialization of CVE data for different data stores

use crate::models::CVE;
use super::{DataStoreError, DataStoreResult, TenantContext};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Serializable wrapper for CVE data with tenant context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantData<T> {
    pub tenant_id: String,
    pub data: T,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: u32,
    pub metadata: HashMap<String, Value>,
}

impl<T> TenantData<T> {
    pub fn new(data: T, context: &TenantContext) -> Self {
        let now = Utc::now();
        Self {
            tenant_id: context.tenant_id.clone(),
            data,
            created_at: now,
            updated_at: now,
            version: 1,
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
        self.version += 1;
        self
    }
}

/// Serialization utility for different data store formats
pub struct DataSerializer;

impl DataSerializer {
    /// Serialize for JSON-based stores (MongoDB, Elasticsearch)
    pub fn to_json<T: Serialize>(data: &T) -> DataStoreResult<String> {
        serde_json::to_string(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Deserialize from JSON
    pub fn from_json<T: for<'de> Deserialize<'de>>(json: &str) -> DataStoreResult<T> {
        serde_json::from_str(json)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Binary serialization using bincode
    pub fn to_binary<T: Serialize>(data: &T) -> DataStoreResult<Vec<u8>> {
        bincode::serialize(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Binary deserialization using bincode
    pub fn from_binary<T: for<'de> Deserialize<'de>>(bytes: &[u8]) -> DataStoreResult<T> {
        bincode::deserialize(bytes)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Serialize for Redis with default JSON format
    pub fn to_redis_value<T: Serialize>(data: &T) -> DataStoreResult<Vec<u8>> {
        let json = Self::to_json(data)?;
        Ok(json.into_bytes())
    }
    
    /// Deserialize from Redis value
    pub fn from_redis_value<T: for<'de> Deserialize<'de>>(bytes: &[u8]) -> DataStoreResult<T> {
        let json = String::from_utf8(bytes.to_vec())
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        Self::from_json(&json)
    }
    
    /// Convert to Elasticsearch document format
    pub fn to_elasticsearch_doc<T: Serialize>(data: &T, id: &str, index: &str) -> DataStoreResult<Value> {
        let mut doc = serde_json::to_value(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        
        // Add Elasticsearch metadata
        if let Value::Object(ref mut map) = doc {
            map.insert("_id".to_string(), Value::String(id.to_string()));
            map.insert("_index".to_string(), Value::String(index.to_string()));
            map.insert("_timestamp".to_string(), Value::String(Utc::now().to_rfc3339()));
        }
        
        Ok(doc)
    }
    
    /// Convert CVE to search-optimized format
    pub fn cve_to_search_doc(cve: &CVE, context: &TenantContext) -> DataStoreResult<Value> {
        let tenant_data = TenantData::new(cve.clone(), context);
        
        let mut doc = serde_json::to_value(&tenant_data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        
        // Add search-optimized fields
        if let Value::Object(ref mut map) = doc {
            // CVE ID for easy searching
            map.insert("cve_id".to_string(), Value::String(cve.cve_metadata.cve_id.clone()));
            
            // Extract affected products for filtering
            if let Some(containers) = cve.containers.cna.as_ref() {
                if let Some(affected) = containers.affected.as_ref() {
                    let vendors: Vec<String> = affected.iter()
                        .map(|a| a.vendor.clone())
                        .collect();
                    map.insert("vendors".to_string(), Value::Array(
                        vendors.iter().map(|v| Value::String(v.clone())).collect()
                    ));
                    
                    let products: Vec<String> = affected.iter()
                        .map(|a| a.product.clone())
                        .collect();
                    map.insert("products".to_string(), Value::Array(
                        products.iter().map(|p| Value::String(p.clone())).collect()
                    ));
                }
                
                // CVSS score for filtering
                if let Some(metrics) = containers.metrics.as_ref() {
                    for metric in metrics {
                        if let Some(cvss_v3) = &metric.cvss_v3_1 {
                            map.insert("cvss_base_score".to_string(), 
                                     Value::Number(serde_json::Number::from_f64(cvss_v3.base_score).unwrap_or(serde_json::Number::from(0))));
                            map.insert("cvss_severity".to_string(), 
                                     Value::String(format!("{:?}", cvss_v3.base_severity)));
                            break; // Use the first available CVSS v3.1 score
                        }
                    }
                }
            }
        }
        
        Ok(doc)
    }
    
    /// Generate tenant-specific key for Redis
    pub fn redis_key(base_key: &str, context: &TenantContext) -> String {
        format!("tenant:{}:{}", context.tenant_id, base_key)
    }
    
    /// Generate tenant-specific table name for PostgreSQL
    pub fn postgres_table(base_table: &str, context: &TenantContext) -> String {
        if context.tenant_id == "default" {
            base_table.to_string()
        } else {
            format!("{}_{}", base_table, context.tenant_id.replace("-", "_"))
        }
    }
    
    /// Generate tenant-specific collection name for MongoDB
    pub fn mongo_collection(base_collection: &str, context: &TenantContext) -> String {
        if context.tenant_id == "default" {
            base_collection.to_string()
        } else {
            format!("{}_{}", base_collection, context.tenant_id.replace("-", "_"))
        }
    }
    
    /// Generate tenant-specific index name for Elasticsearch
    pub fn elasticsearch_index(base_index: &str, context: &TenantContext) -> String {
        if context.tenant_id == "default" {
            base_index.to_string()
        } else {
            format!("{}_{}", base_index, context.tenant_id.replace("-", "_").to_lowercase())
        }
    }
}

/// Data transformation utilities
pub struct DataTransformer;

impl DataTransformer {
    /// Normalize CVE ID format
    pub fn normalize_cve_id(id: &str) -> String {
        if id.to_uppercase().starts_with("CVE-") {
            id.to_uppercase()
        } else {
            format!("CVE-{}", id.to_uppercase())
        }
    }
    
    /// Extract searchable keywords from CVE data
    pub fn extract_keywords(text: &str) -> Vec<String> {
        text.split_whitespace()
            .filter(|word| word.len() > 2)
            .map(|word| word.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string())
            .filter(|word| !word.is_empty())
            .collect()
    }
    
    /// Generate tags for CVE categorization
    pub fn generate_cve_tags(cve: &CVE) -> Vec<String> {
        let mut tags = vec![];
        
        // Add CVE year tag
        if let Some(year) = cve.cve_metadata.cve_id.split('-').nth(1) {
            tags.push(format!("year:{}", year));
        }
        
        // Add state tag
        tags.push(format!("state:{}", cve.cve_metadata.state));
        
        // Add CVSS-based tags if available
        if let Some(containers) = cve.containers.cna.as_ref() {
            if let Some(metrics) = containers.metrics.as_ref() {
                for metric in metrics {
                    if let Some(cvss_v3) = metric.cvss_v3_1.as_ref() {
                        tags.push(format!("severity:{:?}", cvss_v3.base_severity).to_lowercase());
                        tags.push(format!("attack_vector:{:?}", cvss_v3.attack_vector).to_lowercase());
                        break; // Use first CVSS metric found
                    }
                }
            }
        }
        
        tags.sort();
        tags.dedup();
        tags
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_tenant_data_creation() {
        let context = TenantContext {
            tenant_id: "test_tenant".to_string(),
            user_id: Some("user1".to_string()),
            organization_id: None,
            permissions: vec!["read".to_string()],
        };
        
        let data = "test data";
        let tenant_data = TenantData::new(data, &context);
        
        assert_eq!(tenant_data.tenant_id, "test_tenant");
        assert_eq!(tenant_data.data, "test data");
        assert_eq!(tenant_data.version, 1);
    }
    
    #[test]
    fn test_redis_key_generation() {
        let context = TenantContext {
            tenant_id: "test_tenant".to_string(),
            user_id: None,
            organization_id: None,
            permissions: vec![],
        };
        
        let key = DataSerializer::redis_key("cves:CVE-2023-1001", &context);
        assert_eq!(key, "tenant:test_tenant:cves:CVE-2023-1001");
    }
    
    #[test]
    fn test_normalize_cve_id() {
        assert_eq!(DataTransformer::normalize_cve_id("cve-2023-1001"), "CVE-2023-1001");
        assert_eq!(DataTransformer::normalize_cve_id("CVE-2023-1001"), "CVE-2023-1001");
        assert_eq!(DataTransformer::normalize_cve_id("2023-1001"), "CVE-2023-1001");
    }
}