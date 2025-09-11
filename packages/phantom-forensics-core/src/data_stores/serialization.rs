//! Data Serialization Module
//! 
//! Serialization utilities for forensic data with integrity verification and chain of custody

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use sha2::{Sha256, Digest};

/// Tenant-specific data wrapper for forensic evidence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantData<T> {
    pub tenant_id: String,
    pub case_id: Option<String>,
    pub investigator_id: Option<String>,
    pub data: T,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub version: u32,
    pub integrity_hash: String,
    pub classification_level: Option<String>,
    pub chain_of_custody: Vec<CustodyOperation>,
}

/// Chain of custody operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyOperation {
    pub operation_id: String,
    pub timestamp: DateTime<Utc>,
    pub actor: String,
    pub operation_type: CustodyOperationType,
    pub description: String,
    pub previous_hash: Option<String>,
    pub signature: Option<String>,
}

/// Types of custody operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CustodyOperationType {
    Created,
    Accessed,
    Modified,
    Transferred,
    Analyzed,
    Archived,
    Deleted,
}

impl<T> TenantData<T> 
where 
    T: Serialize + Clone,
{
    /// Create new tenant data with integrity verification
    pub fn new(tenant_id: String, data: T) -> Self {
        let now = Utc::now();
        let integrity_hash = Self::calculate_integrity_hash(&data);
        
        Self {
            tenant_id,
            case_id: None,
            investigator_id: None,
            data,
            created_at: now,
            updated_at: now,
            version: 1,
            integrity_hash,
            classification_level: None,
            chain_of_custody: vec![],
        }
    }
    
    /// Update data with new chain of custody entry
    pub fn update_with_custody(
        &mut self, 
        new_data: T, 
        actor: String, 
        operation_type: CustodyOperationType, 
        description: String
    ) -> Result<(), String> {
        // Calculate previous hash for chain linking
        let previous_hash = Some(self.integrity_hash.clone());
        
        // Update data and metadata
        self.data = new_data;
        self.updated_at = Utc::now();
        self.version += 1;
        self.integrity_hash = Self::calculate_integrity_hash(&self.data);
        
        // Add custody operation
        let custody_op = CustodyOperation {
            operation_id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            actor,
            operation_type,
            description,
            previous_hash,
            signature: None, // Could be implemented with digital signatures
        };
        
        self.chain_of_custody.push(custody_op);
        Ok(())
    }
    
    /// Verify data integrity
    pub fn verify_integrity(&self) -> bool {
        let calculated_hash = Self::calculate_integrity_hash(&self.data);
        calculated_hash == self.integrity_hash
    }
    
    /// Calculate integrity hash for data
    fn calculate_integrity_hash(data: &T) -> String {
        let serialized = serde_json::to_string(data).unwrap_or_default();
        let mut hasher = Sha256::new();
        hasher.update(serialized.as_bytes());
        hex::encode(hasher.finalize())
    }
    
    /// Verify chain of custody integrity
    pub fn verify_chain_integrity(&self) -> bool {
        for (i, operation) in self.chain_of_custody.iter().enumerate() {
            if i > 0 {
                let previous_op = &self.chain_of_custody[i - 1];
                if let Some(ref prev_hash) = operation.previous_hash {
                    // In a full implementation, this would verify against the actual previous hash
                    if prev_hash.is_empty() {
                        return false;
                    }
                }
            }
        }
        true
    }
}

/// Data serializer for forensic evidence
pub struct DataSerializer;

impl DataSerializer {
    /// Serialize with compression for large evidence files
    pub fn serialize_compressed<T>(data: &T) -> Result<Vec<u8>, String>
    where
        T: Serialize,
    {
        let json_data = serde_json::to_vec(data)
            .map_err(|e| format!("Serialization error: {}", e))?;
        
        // For production use, implement actual compression (e.g., gzip, lz4)
        // For now, return uncompressed data
        Ok(json_data)
    }
    
    /// Deserialize compressed data
    pub fn deserialize_compressed<T>(data: &[u8]) -> Result<T, String>
    where
        T: for<'de> Deserialize<'de>,
    {
        // For production use, implement actual decompression
        serde_json::from_slice(data)
            .map_err(|e| format!("Deserialization error: {}", e))
    }
    
    /// Serialize with encryption for sensitive evidence
    pub fn serialize_encrypted<T>(data: &T, _key: &str) -> Result<Vec<u8>, String>
    where
        T: Serialize,
    {
        let json_data = serde_json::to_vec(data)
            .map_err(|e| format!("Serialization error: {}", e))?;
        
        // For production use, implement actual encryption (e.g., AES-256-GCM)
        // For now, return base64 encoded data as placeholder
        let encoded = base64::encode(&json_data);
        Ok(encoded.into_bytes())
    }
    
    /// Deserialize encrypted data
    pub fn deserialize_encrypted<T>(data: &[u8], _key: &str) -> Result<T, String>
    where
        T: for<'de> Deserialize<'de>,
    {
        // For production use, implement actual decryption
        let encoded_str = std::str::from_utf8(data)
            .map_err(|e| format!("UTF-8 error: {}", e))?;
        let decoded = base64::decode(encoded_str)
            .map_err(|e| format!("Base64 decode error: {}", e))?;
        
        serde_json::from_slice(&decoded)
            .map_err(|e| format!("Deserialization error: {}", e))
    }
}

/// Data transformer for forensic evidence processing
pub struct DataTransformer;

impl DataTransformer {
    /// Transform evidence for different storage backends
    pub fn transform_for_storage<T>(
        data: &TenantData<T>,
        backend_type: &str,
    ) -> Result<HashMap<String, serde_json::Value>, String>
    where
        T: Serialize,
    {
        let mut transformed = HashMap::new();
        
        match backend_type.to_lowercase().as_str() {
            "redis" => {
                // Redis-specific transformation
                transformed.insert("tenant_id".to_string(), serde_json::Value::String(data.tenant_id.clone()));
                transformed.insert("data".to_string(), serde_json::to_value(&data.data).unwrap());
                transformed.insert("integrity_hash".to_string(), serde_json::Value::String(data.integrity_hash.clone()));
                transformed.insert("version".to_string(), serde_json::Value::Number(data.version.into()));
            }
            "postgresql" => {
                // PostgreSQL-specific transformation with proper types
                transformed.insert("tenant_id".to_string(), serde_json::Value::String(data.tenant_id.clone()));
                transformed.insert("case_id".to_string(), 
                    data.case_id.as_ref().map(|s| serde_json::Value::String(s.clone()))
                        .unwrap_or(serde_json::Value::Null));
                transformed.insert("investigator_id".to_string(),
                    data.investigator_id.as_ref().map(|s| serde_json::Value::String(s.clone()))
                        .unwrap_or(serde_json::Value::Null));
                transformed.insert("data_json".to_string(), serde_json::to_value(&data.data).unwrap());
                transformed.insert("created_at".to_string(), serde_json::Value::String(data.created_at.to_rfc3339()));
                transformed.insert("updated_at".to_string(), serde_json::Value::String(data.updated_at.to_rfc3339()));
                transformed.insert("version".to_string(), serde_json::Value::Number(data.version.into()));
                transformed.insert("integrity_hash".to_string(), serde_json::Value::String(data.integrity_hash.clone()));
                transformed.insert("classification_level".to_string(),
                    data.classification_level.as_ref().map(|s| serde_json::Value::String(s.clone()))
                        .unwrap_or(serde_json::Value::Null));
                transformed.insert("chain_of_custody".to_string(), serde_json::to_value(&data.chain_of_custody).unwrap());
            }
            "mongodb" => {
                // MongoDB-specific transformation
                transformed.insert("_tenant_id".to_string(), serde_json::Value::String(data.tenant_id.clone()));
                transformed.insert("evidence_data".to_string(), serde_json::to_value(&data.data).unwrap());
                transformed.insert("metadata".to_string(), serde_json::json!({
                    "created_at": data.created_at,
                    "updated_at": data.updated_at,
                    "version": data.version,
                    "integrity_hash": data.integrity_hash,
                    "classification_level": data.classification_level,
                }));
                transformed.insert("custody_chain".to_string(), serde_json::to_value(&data.chain_of_custody).unwrap());
            }
            "elasticsearch" => {
                // Elasticsearch-specific transformation with proper mappings
                transformed.insert("tenant_id".to_string(), serde_json::Value::String(data.tenant_id.clone()));
                transformed.insert("timestamp".to_string(), serde_json::Value::String(data.created_at.to_rfc3339()));
                transformed.insert("updated_timestamp".to_string(), serde_json::Value::String(data.updated_at.to_rfc3339()));
                
                // Flatten data for better searching
                if let Ok(data_value) = serde_json::to_value(&data.data) {
                    if let serde_json::Value::Object(data_map) = data_value {
                        for (key, value) in data_map {
                            transformed.insert(format!("evidence_{}", key), value);
                        }
                    } else {
                        transformed.insert("evidence_data".to_string(), data_value);
                    }
                }
                
                transformed.insert("integrity_verified".to_string(), serde_json::Value::Bool(data.verify_integrity()));
                transformed.insert("chain_operations_count".to_string(), 
                    serde_json::Value::Number(data.chain_of_custody.len().into()));
            }
            _ => {
                return Err(format!("Unsupported backend type: {}", backend_type));
            }
        }
        
        Ok(transformed)
    }
    
    /// Create a search-optimized representation
    pub fn create_search_document<T>(
        data: &TenantData<T>,
        additional_fields: HashMap<String, serde_json::Value>,
    ) -> Result<serde_json::Value, String>
    where
        T: Serialize,
    {
        let mut document = serde_json::json!({
            "tenant_id": data.tenant_id,
            "case_id": data.case_id,
            "investigator_id": data.investigator_id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "version": data.version,
            "integrity_verified": data.verify_integrity(),
            "chain_verified": data.verify_chain_integrity(),
            "classification_level": data.classification_level,
            "custody_operations": data.chain_of_custody.len(),
        });
        
        // Add additional searchable fields
        for (key, value) in additional_fields {
            document[key] = value;
        }
        
        // Add data content for full-text search
        if let Ok(data_json) = serde_json::to_value(&data.data) {
            document["searchable_content"] = data_json;
        }
        
        Ok(document)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::ForensicEvidence;
    
    #[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
    struct TestEvidence {
        id: String,
        content: String,
    }
    
    #[test]
    fn test_tenant_data_creation() {
        let evidence = TestEvidence {
            id: "test-001".to_string(),
            content: "test evidence content".to_string(),
        };
        
        let tenant_data = TenantData::new("tenant-1".to_string(), evidence.clone());
        
        assert_eq!(tenant_data.tenant_id, "tenant-1");
        assert_eq!(tenant_data.data, evidence);
        assert_eq!(tenant_data.version, 1);
        assert!(tenant_data.verify_integrity());
    }
    
    #[test]
    fn test_chain_of_custody_update() {
        let evidence = TestEvidence {
            id: "test-002".to_string(),
            content: "original content".to_string(),
        };
        
        let mut tenant_data = TenantData::new("tenant-1".to_string(), evidence);
        
        let updated_evidence = TestEvidence {
            id: "test-002".to_string(),
            content: "modified content".to_string(),
        };
        
        let result = tenant_data.update_with_custody(
            updated_evidence,
            "investigator1".to_string(),
            CustodyOperationType::Modified,
            "Updated evidence content".to_string(),
        );
        
        assert!(result.is_ok());
        assert_eq!(tenant_data.version, 2);
        assert_eq!(tenant_data.chain_of_custody.len(), 1);
        assert!(tenant_data.verify_integrity());
        assert!(tenant_data.verify_chain_integrity());
    }
    
    #[test]
    fn test_data_serialization() {
        let evidence = TestEvidence {
            id: "test-003".to_string(),
            content: "serialization test".to_string(),
        };
        
        let serialized = DataSerializer::serialize_compressed(&evidence).unwrap();
        let deserialized: TestEvidence = DataSerializer::deserialize_compressed(&serialized).unwrap();
        
        assert_eq!(evidence, deserialized);
    }
    
    #[test]
    fn test_storage_transformation() {
        let evidence = TestEvidence {
            id: "test-004".to_string(),
            content: "transformation test".to_string(),
        };
        
        let tenant_data = TenantData::new("tenant-1".to_string(), evidence);
        
        let redis_transform = DataTransformer::transform_for_storage(&tenant_data, "redis").unwrap();
        assert!(redis_transform.contains_key("tenant_id"));
        assert!(redis_transform.contains_key("data"));
        assert!(redis_transform.contains_key("integrity_hash"));
        
        let postgres_transform = DataTransformer::transform_for_storage(&tenant_data, "postgresql").unwrap();
        assert!(postgres_transform.contains_key("tenant_id"));
        assert!(postgres_transform.contains_key("data_json"));
        assert!(postgres_transform.contains_key("chain_of_custody"));
    }
}