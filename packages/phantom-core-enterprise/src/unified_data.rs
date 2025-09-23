//! Unified Data Layer Integration
//!
//! Common data structures and interfaces for all phantom-*-core modules
//! enabling seamless data exchange and unified querying capabilities.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

/// Universal data record for cross-module compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniversalDataRecord {
    pub id: String,
    pub record_type: String,
    pub source_plugin: String,
    pub data: serde_json::Value,
    pub metadata: HashMap<String, serde_json::Value>,
    pub relationships: Vec<DataRelationship>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tenant_id: Option<String>,
}

/// Relationship between data records
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRelationship {
    pub id: String,
    pub relationship_type: String,
    pub source_id: String,
    pub target_id: String,
    pub confidence: f32,
    pub metadata: HashMap<String, serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

/// Unified data store interface
#[async_trait]
pub trait UnifiedDataStore: Send + Sync {
    /// Store a universal data record
    async fn store(&self, record: &UniversalDataRecord) -> Result<String, UnifiedDataError>;
    
    /// Retrieve a record by ID
    async fn get(&self, id: &str) -> Result<Option<UniversalDataRecord>, UnifiedDataError>;
    
    /// Query records with filters
    async fn query(&self, query: &UnifiedQuery) -> Result<Vec<UniversalDataRecord>, UnifiedDataError>;
    
    /// Update a record
    async fn update(&self, id: &str, updates: &HashMap<String, serde_json::Value>) -> Result<(), UnifiedDataError>;
    
    /// Delete a record
    async fn delete(&self, id: &str) -> Result<(), UnifiedDataError>;
    
    /// Create relationship between records
    async fn create_relationship(&self, relationship: &DataRelationship) -> Result<String, UnifiedDataError>;
    
    /// Get relationships for a record
    async fn get_relationships(&self, record_id: &str) -> Result<Vec<DataRelationship>, UnifiedDataError>;
}

/// Unified query interface
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQuery {
    pub record_types: Vec<String>,
    pub filters: HashMap<String, serde_json::Value>,
    pub text_query: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    pub sort_by: Option<String>,
    pub sort_desc: Option<bool>,
    pub include_relationships: bool,
    pub time_range: Option<TimeRange>,
}

/// Time range for queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Unified data errors
#[derive(Debug, thiserror::Error)]
pub enum UnifiedDataError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Serialization error: {0}")]
    Serialization(String),
    
    #[error("Query error: {0}")]
    Query(String),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

/// Query context with tenant and permissions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedQueryContext {
    pub tenant_id: String,
    pub user_id: String,
    pub permissions: Vec<String>,
    pub filters: HashMap<String, serde_json::Value>,
    pub include_relationships: bool,
}