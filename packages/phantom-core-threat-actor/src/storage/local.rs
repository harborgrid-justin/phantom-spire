// phantom-threat-actor-core/src/storage/local.rs
// Local storage implementation for Threat Actor Core

use super::traits::*;
use crate::models::*;
use async_trait::async_trait;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

/// Local in-memory storage implementation
pub struct LocalStorage {
    threat_actors: Arc<RwLock<HashMap<String, ThreatActor>>>,
    campaigns: Arc<RwLock<HashMap<String, Campaign>>>,
    attribution_analyses: Arc<RwLock<HashMap<String, Vec<AttributionAnalysis>>>>,
    behavioral_analyses: Arc<RwLock<HashMap<String, BehavioralAnalysis>>>,
}

impl LocalStorage {
    /// Create a new local storage instance
    pub async fn new() -> Result<Self, StorageError> {
        Ok(Self {
            threat_actors: Arc::new(RwLock::new(HashMap::new())),
            campaigns: Arc::new(RwLock::new(HashMap::new())),
            attribution_analyses: Arc::new(RwLock::new(HashMap::new())),
            behavioral_analyses: Arc::new(RwLock::new(HashMap::new())),
        })
    }
}

#[async_trait]
impl ThreatActorStorage for LocalStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Nothing to initialize for local storage
        Ok(())
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        let start = std::time::Instant::now();

        // Simple health check - try to access the storage
        let _actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let response_time = start.elapsed().as_millis() as u64;

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "local".to_string());
                metadata.insert("memory_usage".to_string(), "unknown".to_string());
                metadata
            },
        })
    }

    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError> {
        let mut actors = self
            .threat_actors
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        actors.insert(actor.id.clone(), actor.clone());
        Ok(())
    }

    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError> {
        let mut storage = self
            .threat_actors
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        for actor in actors {
            storage.insert(actor.id.clone(), actor.clone());
        }

        Ok(())
    }

    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        Ok(actors.get(id).cloned())
    }

    async fn get_threat_actor_batch(
        &self,
        ids: &[String],
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let mut results = Vec::new();
        for id in ids {
            if let Some(actor) = actors.get(id) {
                results.push(actor.clone());
            }
        }

        Ok(results)
    }

    async fn search_threat_actors(
        &self,
        criteria: &ThreatActorSearchCriteria,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let results: Vec<ThreatActor> = actors
            .values()
            .filter(|actor| self.matches_criteria(actor, criteria))
            .cloned()
            .collect();

        // Apply pagination
        let offset = criteria.offset.unwrap_or(0);
        let limit = criteria.limit.unwrap_or(results.len());

        Ok(results.into_iter().skip(offset).take(limit).collect())
    }

    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        Ok(actors.keys().cloned().collect())
    }

    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError> {
        let mut actors = self
            .threat_actors
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        Ok(actors.remove(id).is_some())
    }

    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError> {
        let mut campaigns = self
            .campaigns
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        campaigns.insert(campaign.id.clone(), campaign.clone());
        Ok(())
    }

    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError> {
        let campaigns = self
            .campaigns
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        Ok(campaigns.get(id).cloned())
    }

    async fn search_campaigns(
        &self,
        actor_id: Option<&str>,
        status: Option<CampaignStatus>,
    ) -> Result<Vec<Campaign>, StorageError> {
        let campaigns = self
            .campaigns
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let results: Vec<Campaign> = campaigns
            .values()
            .filter(|campaign| {
                if let Some(actor_id) = actor_id {
                    if campaign.actor_id != actor_id {
                        return false;
                    }
                }

                if let Some(ref status) = status {
                    if std::mem::discriminant(&campaign.status) != std::mem::discriminant(status) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        Ok(results)
    }

    async fn store_attribution_analysis(
        &self,
        analysis: &AttributionAnalysis,
    ) -> Result<(), StorageError> {
        // Use a generic key for analysis storage since we don't have a specific actor_id
        let actor_id = analysis
            .primary_attribution
            .as_ref()
            .unwrap_or(&"unknown".to_string())
            .clone();

        let mut analyses = self
            .attribution_analyses
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        analyses
            .entry(actor_id)
            .or_insert_with(Vec::new)
            .push(analysis.clone());
        Ok(())
    }

    async fn get_attribution_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Vec<AttributionAnalysis>, StorageError> {
        let analyses = self
            .attribution_analyses
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        Ok(analyses.get(actor_id).cloned().unwrap_or_default())
    }

    async fn store_behavioral_analysis(
        &self,
        analysis: &BehavioralAnalysis,
    ) -> Result<(), StorageError> {
        let mut analyses = self
            .behavioral_analyses
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        analyses.insert(analysis.actor_id.clone(), analysis.clone());
        Ok(())
    }

    async fn get_behavioral_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Option<BehavioralAnalysis>, StorageError> {
        let analyses = self
            .behavioral_analyses
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        Ok(analyses.get(actor_id).cloned())
    }

    // Simplified implementations for other methods
    async fn store_relationships(
        &self,
        _actor_id: &str,
        _relationships: &[ActorRelationship],
    ) -> Result<(), StorageError> {
        // TODO: Implement relationship storage
        Ok(())
    }

    async fn get_related_actors(&self, _actor_id: &str) -> Result<Vec<String>, StorageError> {
        // TODO: Implement relationship retrieval
        Ok(vec![])
    }

    async fn store_evidence(
        &self,
        _actor_id: &str,
        _evidence: &[Evidence],
    ) -> Result<(), StorageError> {
        // TODO: Implement evidence storage
        Ok(())
    }

    async fn get_evidence(&self, _actor_id: &str) -> Result<Vec<Evidence>, StorageError> {
        // TODO: Implement evidence retrieval
        Ok(vec![])
    }

    async fn update_actor_confidence(
        &self,
        actor_id: &str,
        confidence: f64,
    ) -> Result<(), StorageError> {
        let mut actors = self
            .threat_actors
            .write()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire write lock: {}", e)))?;

        if let Some(actor) = actors.get_mut(actor_id) {
            actor.confidence_score = confidence;
        }

        Ok(())
    }

    async fn get_actors_by_type(
        &self,
        actor_type: ActorType,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let results: Vec<ThreatActor> = actors
            .values()
            .filter(|actor| {
                std::mem::discriminant(&actor.actor_type) == std::mem::discriminant(&actor_type)
            })
            .cloned()
            .collect();

        Ok(results)
    }

    async fn get_actors_by_sophistication(
        &self,
        level: SophisticationLevel,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let results: Vec<ThreatActor> = actors
            .values()
            .filter(|actor| {
                std::mem::discriminant(&actor.sophistication_level)
                    == std::mem::discriminant(&level)
            })
            .cloned()
            .collect();

        Ok(results)
    }

    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let results: Vec<ThreatActor> = actors
            .values()
            .filter(|actor| {
                actor
                    .origin_country
                    .as_ref()
                    .map_or(false, |c| c == country)
            })
            .cloned()
            .collect();

        Ok(results)
    }

    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError> {
        self.search_campaigns(None, Some(CampaignStatus::Active))
            .await
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let actors = self
            .threat_actors
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;
        let campaigns = self
            .campaigns
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;
        let attribution_analyses = self
            .attribution_analyses
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;
        let behavioral_analyses = self
            .behavioral_analyses
            .read()
            .map_err(|e| StorageError::Internal(format!("Failed to acquire read lock: {}", e)))?;

        let attribution_count = attribution_analyses
            .values()
            .map(|v| v.len())
            .sum::<usize>() as u64;

        Ok(StorageStatistics {
            threat_actor_count: actors.len() as u64,
            campaign_count: campaigns.len() as u64,
            attribution_analysis_count: attribution_count,
            behavioral_analysis_count: behavioral_analyses.len() as u64,
            total_size_bytes: 0, // Would need to calculate actual memory usage
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // Nothing to cleanup for local storage
        Ok(())
    }
}

impl LocalStorage {
    /// Helper method to check if a threat actor matches the search criteria
    fn matches_criteria(&self, actor: &ThreatActor, criteria: &ThreatActorSearchCriteria) -> bool {
        if let Some(ref actor_types) = criteria.actor_types {
            if !actor_types
                .iter()
                .any(|t| std::mem::discriminant(&actor.actor_type) == std::mem::discriminant(t))
            {
                return false;
            }
        }

        if let Some(ref sophistication_levels) = criteria.sophistication_levels {
            if !sophistication_levels.iter().any(|l| {
                std::mem::discriminant(&actor.sophistication_level) == std::mem::discriminant(l)
            }) {
                return false;
            }
        }

        if let Some(ref motivations) = criteria.motivations {
            if !actor.motivation.iter().any(|m| {
                motivations
                    .iter()
                    .any(|cm| std::mem::discriminant(m) == std::mem::discriminant(cm))
            }) {
                return false;
            }
        }

        if let Some(ref origin_countries) = criteria.origin_countries {
            if let Some(ref country) = actor.origin_country {
                if !origin_countries.contains(country) {
                    return false;
                }
            } else {
                return false;
            }
        }

        if let Some(ref activity_status) = criteria.activity_status {
            if !activity_status
                .iter()
                .any(|s| std::mem::discriminant(&actor.status) == std::mem::discriminant(s))
            {
                return false;
            }
        }

        if let Some(confidence_min) = criteria.confidence_min {
            if actor.confidence_score < confidence_min {
                return false;
            }
        }

        if let Some(confidence_max) = criteria.confidence_max {
            if actor.confidence_score > confidence_max {
                return false;
            }
        }

        // Time range checks
        if let Some(after) = criteria.first_observed_after {
            if actor.first_observed < after {
                return false;
            }
        }

        if let Some(before) = criteria.first_observed_before {
            if actor.first_observed > before {
                return false;
            }
        }

        if let Some(after) = criteria.last_activity_after {
            if actor.last_activity < after {
                return false;
            }
        }

        if let Some(before) = criteria.last_activity_before {
            if actor.last_activity > before {
                return false;
            }
        }

        if let Some(ref target_sectors) = criteria.target_sectors {
            if !actor
                .targets
                .iter()
                .any(|target| target_sectors.contains(&target.sector))
            {
                return false;
            }
        }

        true
    }
}
