//! Phantom MITRE Core - Storage Traits
//! 
//! This module defines the storage traits and interfaces for MITRE ATT&CK data persistence
//! and retrieval operations.

use async_trait::async_trait;
use serde::{Serialize, Deserialize};
use crate::models::*;
use std::collections::HashMap;

/// Storage error types
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Connection error: {0}")]
    Connection(String),
    #[error("Configuration error: {0}")]
    Configuration(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Constraint violation: {0}")]
    ConstraintViolation(String),
    #[error("Timeout error: {0}")]
    Timeout(String),
    #[error("Internal error: {0}")]
    Internal(String),
}

/// Storage result type
pub type StorageResult<T> = Result<T, StorageError>;

/// Storage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageStatistics {
    pub technique_count: u64,
    pub sub_technique_count: u64,
    pub group_count: u64,
    pub software_count: u64,
    pub mitigation_count: u64,
    pub detection_rule_count: u64,
    pub analysis_count: u64,
    pub total_size_bytes: u64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Health status for storage backend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub response_time_ms: u64,
    pub error_message: Option<String>,
    pub metadata: HashMap<String, String>,
}

/// Sort order for queries
#[derive(Debug, Clone)]
pub enum SortOrder {
    Ascending,
    Descending,
}

/// Sort field for techniques
#[derive(Debug, Clone)]
pub enum TechniqueSortField {
    Id,
    Name,
    Created,
    Modified,
    Tactic,
}

/// Sort field for groups
#[derive(Debug, Clone)]
pub enum GroupSortField {
    Id,
    Name,
    FirstSeen,
    LastSeen,
}

/// Sort field for software
#[derive(Debug, Clone)]
pub enum SoftwareSortField {
    Id,
    Name,
    FirstSeen,
    LastSeen,
    SoftwareType,
}

/// Pagination parameters
#[derive(Debug, Clone)]
pub struct Pagination {
    pub offset: usize,
    pub limit: usize,
}

/// Query filters for techniques
#[derive(Debug, Clone)]
pub struct TechniqueFilter {
    pub tactics: Option<Vec<MitreTactic>>,
    pub platforms: Option<Vec<MitrePlatform>>,
    pub data_sources: Option<Vec<DataSource>>,
    pub detection_difficulty: Option<DetectionDifficulty>,
    pub revoked: Option<bool>,
    pub deprecated: Option<bool>,
    pub text_search: Option<String>,
}

/// Query filters for groups
#[derive(Debug, Clone)]
pub struct GroupFilter {
    pub origin_country: Option<String>,
    pub sophistication_level: Option<String>,
    pub motivation: Option<Vec<String>>,
    pub targets: Option<Vec<String>>,
    pub text_search: Option<String>,
}

/// Query filters for software
#[derive(Debug, Clone)]
pub struct SoftwareFilter {
    pub software_type: Option<SoftwareType>,
    pub platforms: Option<Vec<MitrePlatform>>,
    pub groups_using: Option<Vec<String>>,
    pub text_search: Option<String>,
}

/// Main storage trait for MITRE ATT&CK data
#[async_trait]
pub trait MitreStorage: Send + Sync {
    /// Initialize the storage backend
    async fn initialize(&mut self) -> StorageResult<()>;

    /// Check if the storage backend is healthy
    async fn health_check(&self) -> StorageResult<HealthStatus>;

    /// Get storage statistics
    async fn get_statistics(&self) -> StorageResult<StorageStatistics>;

    /// Clear all data from storage
    async fn clear_all(&mut self) -> StorageResult<()>;

    // Technique operations
    async fn store_technique(&mut self, technique: MitreTechnique) -> StorageResult<String>;
    async fn get_technique(&self, id: &str) -> StorageResult<Option<MitreTechnique>>;
    async fn update_technique(&mut self, technique: MitreTechnique) -> StorageResult<()>;
    async fn delete_technique(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_techniques(
        &self,
        filter: Option<TechniqueFilter>,
        sort_field: Option<TechniqueSortField>,
        sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreTechnique>>;
    async fn count_techniques(&self, filter: Option<TechniqueFilter>) -> StorageResult<u64>;

    // Sub-technique operations
    async fn store_sub_technique(&mut self, sub_technique: SubTechnique) -> StorageResult<String>;
    async fn get_sub_technique(&self, id: &str) -> StorageResult<Option<SubTechnique>>;
    async fn update_sub_technique(&mut self, sub_technique: SubTechnique) -> StorageResult<()>;
    async fn delete_sub_technique(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_sub_techniques_for_technique(&self, technique_id: &str) -> StorageResult<Vec<SubTechnique>>;

    // Group operations
    async fn store_group(&mut self, group: MitreGroup) -> StorageResult<String>;
    async fn get_group(&self, id: &str) -> StorageResult<Option<MitreGroup>>;
    async fn update_group(&mut self, group: MitreGroup) -> StorageResult<()>;
    async fn delete_group(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_groups(
        &self,
        filter: Option<GroupFilter>,
        sort_field: Option<GroupSortField>,
        sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreGroup>>;
    async fn count_groups(&self, filter: Option<GroupFilter>) -> StorageResult<u64>;

    // Software operations
    async fn store_software(&mut self, software: MitreSoftware) -> StorageResult<String>;
    async fn get_software(&self, id: &str) -> StorageResult<Option<MitreSoftware>>;
    async fn update_software(&mut self, software: MitreSoftware) -> StorageResult<()>;
    async fn delete_software(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_software(
        &self,
        filter: Option<SoftwareFilter>,
        sort_field: Option<SoftwareSortField>,
        sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreSoftware>>;
    async fn count_software(&self, filter: Option<SoftwareFilter>) -> StorageResult<u64>;

    // Mitigation operations
    async fn store_mitigation(&mut self, mitigation: Mitigation) -> StorageResult<String>;
    async fn get_mitigation(&self, id: &str) -> StorageResult<Option<Mitigation>>;
    async fn update_mitigation(&mut self, mitigation: Mitigation) -> StorageResult<()>;
    async fn delete_mitigation(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_mitigations(&self) -> StorageResult<Vec<Mitigation>>;
    async fn get_mitigations_for_technique(&self, technique_id: &str) -> StorageResult<Vec<Mitigation>>;

    // Detection rule operations
    async fn store_detection_rule(&mut self, rule: DetectionRule) -> StorageResult<String>;
    async fn get_detection_rule(&self, id: &str) -> StorageResult<Option<DetectionRule>>;
    async fn update_detection_rule(&mut self, rule: DetectionRule) -> StorageResult<()>;
    async fn delete_detection_rule(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_detection_rules(&self) -> StorageResult<Vec<DetectionRule>>;
    async fn get_detection_rules_for_technique(&self, technique_id: &str) -> StorageResult<Vec<DetectionRule>>;

    // Analysis operations
    async fn store_analysis(&mut self, analysis: ThreatAnalysis) -> StorageResult<String>;
    async fn get_analysis(&self, id: &str) -> StorageResult<Option<ThreatAnalysis>>;
    async fn delete_analysis(&mut self, id: &str) -> StorageResult<bool>;
    async fn list_analyses(&self, limit: Option<usize>) -> StorageResult<Vec<ThreatAnalysis>>;

    // Bulk operations
    async fn bulk_store_techniques(&mut self, techniques: Vec<MitreTechnique>) -> StorageResult<Vec<String>>;
    async fn bulk_store_groups(&mut self, groups: Vec<MitreGroup>) -> StorageResult<Vec<String>>;
    async fn bulk_store_software(&mut self, software: Vec<MitreSoftware>) -> StorageResult<Vec<String>>;
    async fn bulk_store_mitigations(&mut self, mitigations: Vec<Mitigation>) -> StorageResult<Vec<String>>;

    // Search operations
    async fn search_techniques(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreTechnique>>;
    async fn search_groups(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreGroup>>;
    async fn search_software(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreSoftware>>;

    // Relationship operations
    async fn get_techniques_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreTechnique>>;
    async fn get_software_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreSoftware>>;
    async fn get_groups_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreGroup>>;
    async fn get_software_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreSoftware>>;

    // Cache operations (optional)
    async fn invalidate_cache(&mut self) -> StorageResult<()> {
        Ok(())
    }
    async fn warm_cache(&mut self) -> StorageResult<()> {
        Ok(())
    }

    // Backup and restore operations
    async fn create_backup(&self, path: &str) -> StorageResult<()>;
    async fn restore_backup(&mut self, path: &str) -> StorageResult<()>;

    // Transaction support (optional)
    async fn begin_transaction(&mut self) -> StorageResult<()> {
        Ok(())
    }
    async fn commit_transaction(&mut self) -> StorageResult<()> {
        Ok(())
    }
    async fn rollback_transaction(&mut self) -> StorageResult<()> {
        Ok(())
    }
}

/// Factory trait for creating storage implementations
pub trait StorageFactory {
    type Storage: MitreStorage;

    /// Create a new storage instance with the given configuration
    fn create_storage(&self, config: &crate::config::StorageConfig) -> StorageResult<Self::Storage>;
}

impl Default for TechniqueFilter {
    fn default() -> Self {
        Self {
            tactics: None,
            platforms: None,
            data_sources: None,
            detection_difficulty: None,
            revoked: Some(false),
            deprecated: Some(false),
            text_search: None,
        }
    }
}

impl Default for GroupFilter {
    fn default() -> Self {
        Self {
            origin_country: None,
            sophistication_level: None,
            motivation: None,
            targets: None,
            text_search: None,
        }
    }
}

impl Default for SoftwareFilter {
    fn default() -> Self {
        Self {
            software_type: None,
            platforms: None,
            groups_using: None,
            text_search: None,
        }
    }
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            offset: 0,
            limit: 100,
        }
    }
}