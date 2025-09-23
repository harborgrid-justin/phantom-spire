// phantom-threat-actor-core/src/storage/traits.rs
// Storage traits and interfaces for Threat Actor Core

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

/// Storage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageStatistics {
    pub threat_actor_count: u64,
    pub campaign_count: u64,
    pub attribution_analysis_count: u64,
    pub behavioral_analysis_count: u64,
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

/// Sort order
#[derive(Debug, Clone)]
pub enum SortOrder {
    Ascending,
    Descending,
}

/// Main storage trait that all threat actor storage backends must implement
#[async_trait]
pub trait ThreatActorStorage: Send + Sync {
    /// Initialize the storage backend
    async fn initialize(&self) -> Result<(), StorageError>;

    /// Health check for the storage backend
    async fn health_check(&self) -> Result<HealthStatus, StorageError>;

    /// Store a threat actor
    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError>;

    /// Store multiple threat actors in a batch
    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError>;

    /// Retrieve a threat actor by ID
    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError>;

    /// Retrieve multiple threat actors by IDs
    async fn get_threat_actor_batch(&self, ids: &[String]) -> Result<Vec<ThreatActor>, StorageError>;

    /// Search for threat actors based on criteria
    async fn search_threat_actors(&self, criteria: &ThreatActorSearchCriteria) -> Result<Vec<ThreatActor>, StorageError>;

    /// List all threat actor IDs
    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError>;

    /// Delete a threat actor by ID
    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError>;

    /// Store a campaign
    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError>;

    /// Retrieve a campaign by ID
    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError>;

    /// Search for campaigns
    async fn search_campaigns(&self, actor_id: Option<&str>, status: Option<CampaignStatus>) -> Result<Vec<Campaign>, StorageError>;

    /// Store attribution analysis
    async fn store_attribution_analysis(&self, analysis: &AttributionAnalysis) -> Result<(), StorageError>;

    /// Retrieve attribution analysis
    async fn get_attribution_analysis(&self, actor_id: &str) -> Result<Vec<AttributionAnalysis>, StorageError>;

    /// Store behavioral analysis
    async fn store_behavioral_analysis(&self, analysis: &BehavioralAnalysis) -> Result<(), StorageError>;

    /// Retrieve behavioral analysis
    async fn get_behavioral_analysis(&self, actor_id: &str) -> Result<Option<BehavioralAnalysis>, StorageError>;

    /// Store actor relationships
    async fn store_relationships(&self, actor_id: &str, relationships: &[ActorRelationship]) -> Result<(), StorageError>;

    /// Get related actors
    async fn get_related_actors(&self, actor_id: &str) -> Result<Vec<String>, StorageError>;

    /// Store evidence
    async fn store_evidence(&self, actor_id: &str, evidence: &[Evidence]) -> Result<(), StorageError>;

    /// Get evidence for an actor
    async fn get_evidence(&self, actor_id: &str) -> Result<Vec<Evidence>, StorageError>;

    /// Update actor confidence score
    async fn update_actor_confidence(&self, actor_id: &str, confidence: f64) -> Result<(), StorageError>;

    /// Get actors by type
    async fn get_actors_by_type(&self, actor_type: ActorType) -> Result<Vec<ThreatActor>, StorageError>;

    /// Get actors by sophistication level
    async fn get_actors_by_sophistication(&self, level: SophisticationLevel) -> Result<Vec<ThreatActor>, StorageError>;

    /// Get actors by country
    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError>;

    /// Get active campaigns
    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError>;

    /// Get storage statistics
    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError>;

    /// Close/cleanup the storage backend
    async fn close(&self) -> Result<(), StorageError>;
}

// Remove duplicate Default implementation

impl ThreatActorSearchCriteria {
    /// Create a new search criteria builder
    pub fn builder() -> ThreatActorSearchCriteriaBuilder {
        ThreatActorSearchCriteriaBuilder::default()
    }
}

/// Builder pattern for threat actor search criteria
#[derive(Default)]
pub struct ThreatActorSearchCriteriaBuilder {
    criteria: ThreatActorSearchCriteria,
}

impl ThreatActorSearchCriteriaBuilder {
    pub fn actor_types(mut self, types: Vec<ActorType>) -> Self {
        self.criteria.actor_types = Some(types);
        self
    }

    pub fn sophistication_levels(mut self, levels: Vec<SophisticationLevel>) -> Self {
        self.criteria.sophistication_levels = Some(levels);
        self
    }

    pub fn motivations(mut self, motivations: Vec<Motivation>) -> Self {
        self.criteria.motivations = Some(motivations);
        self
    }

    pub fn origin_countries(mut self, countries: Vec<String>) -> Self {
        self.criteria.origin_countries = Some(countries);
        self
    }

    pub fn activity_status(mut self, statuses: Vec<ActorStatus>) -> Self {
        self.criteria.activity_status = Some(statuses);
        self
    }

    pub fn confidence_range(mut self, min: f64, max: f64) -> Self {
        self.criteria.confidence_min = Some(min);
        self.criteria.confidence_max = Some(max);
        self
    }

    pub fn first_observed_range(
        mut self, 
        after: chrono::DateTime<chrono::Utc>, 
        before: chrono::DateTime<chrono::Utc>
    ) -> Self {
        self.criteria.first_observed_after = Some(after);
        self.criteria.first_observed_before = Some(before);
        self
    }

    pub fn last_activity_range(
        mut self, 
        after: chrono::DateTime<chrono::Utc>, 
        before: chrono::DateTime<chrono::Utc>
    ) -> Self {
        self.criteria.last_activity_after = Some(after);
        self.criteria.last_activity_before = Some(before);
        self
    }

    pub fn target_sectors(mut self, sectors: Vec<String>) -> Self {
        self.criteria.target_sectors = Some(sectors);
        self
    }

    pub fn limit(mut self, limit: usize) -> Self {
        self.criteria.limit = Some(limit);
        self
    }

    pub fn offset(mut self, offset: usize) -> Self {
        self.criteria.offset = Some(offset);
        self
    }

    pub fn build(self) -> ThreatActorSearchCriteria {
        self.criteria
    }
}