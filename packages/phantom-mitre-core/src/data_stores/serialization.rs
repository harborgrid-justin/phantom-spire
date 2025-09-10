//! Data Serialization and Transformation
//! 
//! Handles serialization/deserialization of MITRE ATT&CK data for different data stores
//! Enhanced with high-performance binary serialization and precision decimal support

use crate::{MitreTechnique, MitreGroup, MitreSoftware, Mitigation, DetectionRule, ThreatAnalysis};
use super::{DataStoreError, DataStoreResult, TenantContext};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use time::OffsetDateTime;

/// High-precision financial calculation result using rust_decimal
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrecisionRiskScore {
    pub risk_score: Decimal,
    pub confidence_interval: (Decimal, Decimal),
    pub calculation_timestamp: i64, // Nanosecond precision
    pub factors: HashMap<String, Decimal>,
}

/// Enhanced serializable wrapper for MITRE data with tenant context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantData<T> {
    pub tenant_id: String,
    pub data: T,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub precise_timestamp: i64, // Nanosecond precision with time crate
    pub version: u32,
    pub metadata: HashMap<String, Value>,
    pub risk_score: Option<PrecisionRiskScore>,
}

impl<T> TenantData<T> {
    pub fn new(data: T, context: &TenantContext) -> Self {
        let now = Utc::now();
        let precise_now = OffsetDateTime::now_utc();
        Self {
            tenant_id: context.tenant_id.clone(),
            data,
            created_at: now,
            updated_at: now,
            precise_timestamp: precise_now.unix_timestamp_nanos() as i64,
            version: 1,
            metadata: HashMap::new(),
            risk_score: None,
        }
    }
    
    pub fn with_metadata(mut self, key: String, value: Value) -> Self {
        self.metadata.insert(key, value);
        self
    }
    
    pub fn with_precision_risk_score(mut self, risk_score: PrecisionRiskScore) -> Self {
        self.risk_score = Some(risk_score);
        self
    }
    
    pub fn update_data(mut self, data: T) -> Self {
        self.data = data;
        self.updated_at = Utc::now();
        self.precise_timestamp = OffsetDateTime::now_utc().unix_timestamp_nanos() as i64;
        self.version += 1;
        self
    }
}

/// Enhanced serialization utility for different data store formats with binary optimization
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
    
    /// Ultra-fast binary serialization using bincode for high-performance scenarios
    pub fn to_binary<T: Serialize>(data: &T) -> DataStoreResult<Vec<u8>> {
        bincode::serialize(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Ultra-fast binary deserialization using bincode
    pub fn from_binary<T: for<'de> Deserialize<'de>>(bytes: &[u8]) -> DataStoreResult<T> {
        bincode::deserialize(bytes)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// MessagePack serialization for efficient binary protocols
    pub fn to_messagepack<T: Serialize>(data: &T) -> DataStoreResult<Vec<u8>> {
        rmp_serde::to_vec(data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// MessagePack deserialization
    pub fn from_messagepack<T: for<'de> Deserialize<'de>>(bytes: &[u8]) -> DataStoreResult<T> {
        rmp_serde::from_slice(bytes)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))
    }
    
    /// Serialize for Redis with binary optimization option
    pub fn to_redis_value<T: Serialize>(data: &T, use_binary: bool) -> DataStoreResult<Vec<u8>> {
        if use_binary {
            Self::to_binary(data)
        } else {
            let json = Self::to_json(data)?;
            Ok(json.into_bytes())
        }
    }
    
    /// Deserialize from Redis value with binary format detection
    pub fn from_redis_value<T: for<'de> Deserialize<'de>>(bytes: &[u8], is_binary: bool) -> DataStoreResult<T> {
        if is_binary {
            Self::from_binary(bytes)
        } else {
            let json = String::from_utf8(bytes.to_vec())
                .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
            Self::from_json(&json)
        }
    }
    
    /// Calculate high-precision risk score using rust_decimal for financial-grade accuracy
    pub fn calculate_precision_risk_score(
        base_score: f64,
        factors: &HashMap<String, f64>,
        confidence_level: f64,
    ) -> PrecisionRiskScore {
        use rust_decimal::prelude::*;
        
        let base_decimal = Decimal::from_f64(base_score).unwrap_or(Decimal::ZERO);
        let confidence_decimal = Decimal::from_f64(confidence_level).unwrap_or(Decimal::from(95));
        
        // Convert factors to high-precision decimals
        let decimal_factors: HashMap<String, Decimal> = factors
            .iter()
            .map(|(k, v)| (k.clone(), Decimal::from_f64(*v).unwrap_or(Decimal::ZERO)))
            .collect();
        
        // Calculate weighted risk score with high precision
        let mut weighted_score = base_decimal;
        for (_, factor_value) in &decimal_factors {
            weighted_score += *factor_value;
        }
        
        // Normalize to 0-100 scale
        weighted_score = weighted_score.min(Decimal::from(100)).max(Decimal::ZERO);
        
        // Calculate confidence interval (±5% for demonstration)
        let margin = weighted_score * Decimal::from_str("0.05").unwrap();
        let confidence_interval = (
            (weighted_score - margin).max(Decimal::ZERO),
            (weighted_score + margin).min(Decimal::from(100)),
        );
        
        PrecisionRiskScore {
            risk_score: weighted_score,
            confidence_interval,
            calculation_timestamp: OffsetDateTime::now_utc().unix_timestamp_nanos() as i64,
            factors: decimal_factors,
        }
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
    
    /// Convert MITRE technique to search-optimized format
    pub fn technique_to_search_doc(technique: &MitreTechnique, context: &TenantContext) -> DataStoreResult<Value> {
        let tenant_data = TenantData::new(technique.clone(), context);
        
        let mut doc = serde_json::to_value(&tenant_data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        
        // Add search-optimized fields
        if let Value::Object(ref mut map) = doc {
            // Flatten tactics for easier searching
            map.insert("tactic_name".to_string(), Value::String(format!("{:?}", technique.tactic)));
            
            // Platform names for filtering
            let platform_names: Vec<String> = technique.platforms.iter()
                .map(|p| format!("{:?}", p))
                .collect();
            map.insert("platform_names".to_string(), Value::Array(
                platform_names.iter().map(|s| Value::String(s.clone())).collect()
            ));
            
            // Data source names for filtering
            let data_source_names: Vec<String> = technique.data_sources.iter()
                .map(|ds| format!("{:?}", ds))
                .collect();
            map.insert("data_source_names".to_string(), Value::Array(
                data_source_names.iter().map(|s| Value::String(s.clone())).collect()
            ));
            
            // Full-text search content
            let search_content = format!(
                "{} {} {} {} {}",
                technique.name,
                technique.description,
                technique.id,
                platform_names.join(" "),
                data_source_names.join(" ")
            );
            map.insert("search_content".to_string(), Value::String(search_content));
            
            // Searchable technique ID variants
            let id_variants = vec![
                technique.id.clone(),
                technique.id.replace(".", "_"),
                technique.id.replace("T", "technique_"),
            ];
            map.insert("id_variants".to_string(), Value::Array(
                id_variants.into_iter().map(Value::String).collect()
            ));
        }
        
        Ok(doc)
    }
    
    /// Convert MITRE group to search-optimized format
    pub fn group_to_search_doc(group: &MitreGroup, context: &TenantContext) -> DataStoreResult<Value> {
        let tenant_data = TenantData::new(group.clone(), context);
        
        let mut doc = serde_json::to_value(&tenant_data)
            .map_err(|e| DataStoreError::Serialization(e.to_string()))?;
        
        // Add search-optimized fields
        if let Value::Object(ref mut map) = doc {
            // All names and aliases for searching
            let mut all_names = vec![group.name.clone()];
            all_names.extend(group.aliases.clone());
            map.insert("all_names".to_string(), Value::Array(
                all_names.into_iter().map(Value::String).collect()
            ));
            
            // Full-text search content
            let search_content = format!(
                "{} {} {} {} {}",
                group.name,
                group.aliases.join(" "),
                group.description,
                group.techniques_used.join(" "),
                group.targets.join(" ")
            );
            map.insert("search_content".to_string(), Value::String(search_content));
            
            // Activity indicators
            map.insert("is_active".to_string(), Value::Bool(
                group.last_seen > Utc::now() - chrono::Duration::days(365)
            ));
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
    /// Convert between different MITRE data versions
    pub fn migrate_technique_version(technique: &mut MitreTechnique, target_version: &str) -> DataStoreResult<()> {
        // Simple version migration logic
        match target_version {
            "1.0" => {
                // No changes needed for base version
            }
            "1.1" => {
                // Add any new fields or transform existing ones
                if technique.version == "1.0" {
                    technique.version = "1.1".to_string();
                }
            }
            _ => {
                return Err(DataStoreError::Serialization(
                    format!("Unsupported technique version: {}", target_version)
                ));
            }
        }
        
        Ok(())
    }
    
    /// Normalize data for consistent storage
    pub fn normalize_technique_id(id: &str) -> String {
        // Ensure consistent technique ID format
        if id.starts_with('T') {
            id.to_uppercase()
        } else {
            format!("T{}", id.to_uppercase())
        }
    }
    
    /// Extract searchable keywords from MITRE data
    pub fn extract_keywords(text: &str) -> Vec<String> {
        text.split_whitespace()
            .filter(|word| word.len() > 2)
            .map(|word| word.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string())
            .filter(|word| !word.is_empty())
            .collect()
    }
    
    /// Generate tags for categorization
    pub fn generate_tags(technique: &MitreTechnique) -> Vec<String> {
        let mut tags = vec![
            format!("tactic:{:?}", technique.tactic).to_lowercase(),
            format!("difficulty:{:?}", technique.detection_difficulty).to_lowercase(),
        ];
        
        // Add platform tags
        for platform in &technique.platforms {
            tags.push(format!("platform:{:?}", platform).to_lowercase());
        }
        
        // Add data source tags
        for data_source in &technique.data_sources {
            tags.push(format!("data_source:{:?}", data_source).to_lowercase());
        }
        
        // Add permission tags
        for permission in &technique.permissions_required {
            tags.push(format!("permission:{}", permission).to_lowercase());
        }
        
        tags.sort();
        tags.dedup();
        tags
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{MitreTactic, MitrePlatform, DataSource, DetectionDifficulty};
    
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
        
        let key = DataSerializer::redis_key("techniques:T1001", &context);
        assert_eq!(key, "tenant:test_tenant:techniques:T1001");
    }
    
    #[test]
    fn test_normalize_technique_id() {
        assert_eq!(DataTransformer::normalize_technique_id("t1001"), "T1001");
        assert_eq!(DataTransformer::normalize_technique_id("T1001"), "T1001");
        assert_eq!(DataTransformer::normalize_technique_id("1001"), "T1001");
    }
}