// phantom-threat-actor-core/src/storage/redis.rs
// Redis storage implementation for Threat Actor Core

use super::traits::*;
use crate::models::*;
use async_trait::async_trait;
use chrono::Utc;
use redis::{aio::MultiplexedConnection, AsyncCommands, Client, Commands};
use serde_json;
use std::collections::HashMap;

pub struct RedisStorage {
    client: Client,
    connection: MultiplexedConnection,
}

impl RedisStorage {
    /// Create a new Redis storage instance
    pub async fn new(connection_string: &str) -> Result<Self, StorageError> {
        let client = Client::open(connection_string).map_err(|e| {
            StorageError::Connection(format!("Failed to create Redis client: {}", e))
        })?;

        let connection = client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to connect to Redis: {}", e)))?;

        Ok(Self { client, connection })
    }

    /// Generate Redis key for threat actor
    fn actor_key(id: &str) -> String {
        format!("threat_actor:{}", id)
    }

    /// Generate Redis key for campaign
    fn campaign_key(id: &str) -> String {
        format!("campaign:{}", id)
    }

    /// Generate Redis key for attribution analysis
    fn attribution_key(actor_id: &str, timestamp: &chrono::DateTime<Utc>) -> String {
        format!("attribution:{}:{}", actor_id, timestamp.timestamp())
    }

    /// Generate Redis key for behavioral analysis
    fn behavioral_key(actor_id: &str) -> String {
        format!("behavioral:{}", actor_id)
    }

    /// Generate Redis key for index
    fn index_key(index_type: &str) -> String {
        format!("index:{}", index_type)
    }

    /// Store actor in index
    async fn add_to_index(
        &mut self,
        index_key: &str,
        value: &str,
        member: &str,
    ) -> Result<(), StorageError> {
        self.connection.sadd(index_key, member).await.map_err(|e| {
            StorageError::Internal(format!("Failed to add to index {}: {}", index_key, e))
        })?;
        Ok(())
    }

    /// Remove actor from index
    async fn remove_from_index(
        &mut self,
        index_key: &str,
        member: &str,
    ) -> Result<(), StorageError> {
        self.connection.srem(index_key, member).await.map_err(|e| {
            StorageError::Internal(format!("Failed to remove from index {}: {}", index_key, e))
        })?;
        Ok(())
    }

    /// Get members from index
    async fn get_from_index(&mut self, index_key: &str) -> Result<Vec<String>, StorageError> {
        let members: Vec<String> = self.connection.smembers(index_key).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get from index {}: {}", index_key, e))
        })?;
        Ok(members)
    }
}

#[async_trait]
impl ThreatActorStorage for RedisStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Redis doesn't need explicit initialization
        Ok(())
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        let start = std::time::Instant::now();

        // Simple health check - ping Redis
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let _: String = redis::cmd("PING")
            .query(&mut conn)
            .map_err(|e| StorageError::Internal(format!("Redis ping failed: {}", e)))?;

        let response_time = start.elapsed().as_millis() as u64;

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "redis".to_string());
                metadata
            },
        })
    }

    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::actor_key(&actor.id);
        let data = serde_json::to_string(actor).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize threat actor: {}", e))
        })?;

        // Store the actor data
        conn.set(&key, &data)
            .map_err(|e| StorageError::Internal(format!("Failed to store threat actor: {}", e)))?;

        // Update indexes
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        // Index by type
        let type_index = Self::index_key(&format!(
            "actor_type:{}",
            serde_json::to_string(&actor.actor_type).unwrap_or_else(|_| "Unknown".to_string())
        ));
        async_conn
            .sadd(&type_index, &actor.id)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to index actor by type: {}", e)))?;

        // Index by country
        if let Some(ref country) = actor.origin_country {
            let country_index = Self::index_key(&format!("country:{}", country));
            async_conn
                .sadd(&country_index, &actor.id)
                .await
                .map_err(|e| {
                    StorageError::Internal(format!("Failed to index actor by country: {}", e))
                })?;
        }

        // Index by status
        let status_index = Self::index_key(&format!(
            "status:{}",
            serde_json::to_string(&actor.status).unwrap_or_else(|_| "Unknown".to_string())
        ));
        async_conn
            .sadd(&status_index, &actor.id)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to index actor by status: {}", e))
            })?;

        // Add to all actors index
        let all_index = Self::index_key("all_actors");
        async_conn.sadd(&all_index, &actor.id).await.map_err(|e| {
            StorageError::Internal(format!("Failed to add to all actors index: {}", e))
        })?;

        Ok(())
    }

    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        for actor in actors {
            let key = Self::actor_key(&actor.id);
            let data = serde_json::to_string(actor).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize threat actor: {}", e))
            })?;

            conn.set(&key, &data).map_err(|e| {
                StorageError::Internal(format!("Failed to store threat actor: {}", e))
            })?;

            // Update indexes
            let type_index = Self::index_key(&format!(
                "actor_type:{}",
                serde_json::to_string(&actor.actor_type).unwrap_or_else(|_| "Unknown".to_string())
            ));
            async_conn.sadd(&type_index, &actor.id).await.map_err(|e| {
                StorageError::Internal(format!("Failed to index actor by type: {}", e))
            })?;

            if let Some(ref country) = actor.origin_country {
                let country_index = Self::index_key(&format!("country:{}", country));
                async_conn
                    .sadd(&country_index, &actor.id)
                    .await
                    .map_err(|e| {
                        StorageError::Internal(format!("Failed to index actor by country: {}", e))
                    })?;
            }

            let status_index = Self::index_key(&format!(
                "status:{}",
                serde_json::to_string(&actor.status).unwrap_or_else(|_| "Unknown".to_string())
            ));
            async_conn
                .sadd(&status_index, &actor.id)
                .await
                .map_err(|e| {
                    StorageError::Internal(format!("Failed to index actor by status: {}", e))
                })?;

            let all_index = Self::index_key("all_actors");
            async_conn.sadd(&all_index, &actor.id).await.map_err(|e| {
                StorageError::Internal(format!("Failed to add to all actors index: {}", e))
            })?;
        }

        Ok(())
    }

    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::actor_key(id);
        let data: Option<String> = conn
            .get(&key)
            .map_err(|e| StorageError::Internal(format!("Failed to get threat actor: {}", e)))?;

        match data {
            Some(json) => {
                let actor: ThreatActor = serde_json::from_str(&json).map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize threat actor: {}",
                        e
                    ))
                })?;
                Ok(Some(actor))
            }
            None => Ok(None),
        }
    }

    async fn get_threat_actor_batch(
        &self,
        ids: &[String],
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let mut actors = Vec::new();
        for id in ids {
            let key = Self::actor_key(id);
            if let Some(data) = conn.get::<_, Option<String>>(&key).map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actor {}: {}", id, e))
            })? {
                let actor: ThreatActor = serde_json::from_str(&data).map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize threat actor {}: {}",
                        id, e
                    ))
                })?;
                actors.push(actor);
            }
        }

        Ok(actors)
    }

    async fn search_threat_actors(
        &self,
        criteria: &ThreatActorSearchCriteria,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let mut candidate_ids = Vec::new();

        // Start with all actors if no specific criteria
        if criteria.actor_types.is_none()
            && criteria.origin_countries.is_none()
            && criteria.activity_status.is_none()
        {
            let all_index = Self::index_key("all_actors");
            candidate_ids = async_conn
                .smembers(&all_index)
                .await
                .map_err(|e| StorageError::Internal(format!("Failed to get all actors: {}", e)))?;
        } else {
            // Collect candidates from relevant indexes
            let mut candidate_sets = Vec::new();

            if let Some(ref actor_types) = criteria.actor_types {
                for actor_type in actor_types {
                    let type_str =
                        serde_json::to_string(actor_type).unwrap_or_else(|_| "Unknown".to_string());
                    let type_index = Self::index_key(&format!("actor_type:{}", type_str));
                    let ids: Vec<String> = async_conn.smembers(&type_index).await.map_err(|e| {
                        StorageError::Internal(format!("Failed to get actors by type: {}", e))
                    })?;
                    candidate_sets.push(ids);
                }
            }

            if let Some(ref countries) = criteria.origin_countries {
                for country in countries {
                    let country_index = Self::index_key(&format!("country:{}", country));
                    let ids: Vec<String> =
                        async_conn.smembers(&country_index).await.map_err(|e| {
                            StorageError::Internal(format!(
                                "Failed to get actors by country: {}",
                                e
                            ))
                        })?;
                    candidate_sets.push(ids);
                }
            }

            if let Some(ref statuses) = criteria.activity_status {
                for status in statuses {
                    let status_str =
                        serde_json::to_string(status).unwrap_or_else(|_| "Unknown".to_string());
                    let status_index = Self::index_key(&format!("status:{}", status_str));
                    let ids: Vec<String> =
                        async_conn.smembers(&status_index).await.map_err(|e| {
                            StorageError::Internal(format!("Failed to get actors by status: {}", e))
                        })?;
                    candidate_sets.push(ids);
                }
            }

            // Intersect all candidate sets
            if !candidate_sets.is_empty() {
                candidate_ids = candidate_sets[0].clone();
                for set in candidate_sets.iter().skip(1) {
                    candidate_ids.retain(|id| set.contains(id));
                }
            }
        }

        // Filter by other criteria and get full actor data
        let mut actors = Vec::new();
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        for id in candidate_ids {
            let key = Self::actor_key(&id);
            if let Some(data) = conn.get::<_, Option<String>>(&key).map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actor {}: {}", id, e))
            })? {
                let actor: ThreatActor = serde_json::from_str(&data).map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize threat actor {}: {}",
                        id, e
                    ))
                })?;

                // Apply additional filters
                if Self::matches_criteria(&actor, criteria) {
                    actors.push(actor);
                }
            }
        }

        // Apply pagination
        let offset = criteria.offset.unwrap_or(0);
        let limit = criteria.limit.unwrap_or(actors.len());

        Ok(actors.into_iter().skip(offset).take(limit).collect())
    }

    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError> {
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let all_index = Self::index_key("all_actors");
        let ids: Vec<String> = async_conn.smembers(&all_index).await.map_err(|e| {
            StorageError::Internal(format!("Failed to list threat actor ids: {}", e))
        })?;

        Ok(ids)
    }

    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::actor_key(id);
        let exists: bool = conn.exists(&key).map_err(|e| {
            StorageError::Internal(format!("Failed to check if threat actor exists: {}", e))
        })?;

        if exists {
            // Get actor data to clean up indexes
            let data: String = conn.get(&key).map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actor for deletion: {}", e))
            })?;

            let actor: ThreatActor = serde_json::from_str(&data).map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize threat actor for deletion: {}",
                    e
                ))
            })?;

            // Remove from indexes
            let mut async_conn = self
                .client
                .get_multiplexed_async_connection()
                .await
                .map_err(|e| {
                    StorageError::Connection(format!("Failed to get async connection: {}", e))
                })?;

            let type_index = Self::index_key(&format!(
                "actor_type:{}",
                serde_json::to_string(&actor.actor_type).unwrap_or_else(|_| "Unknown".to_string())
            ));
            async_conn.srem(&type_index, id).await.map_err(|e| {
                StorageError::Internal(format!("Failed to remove from type index: {}", e))
            })?;

            if let Some(ref country) = actor.origin_country {
                let country_index = Self::index_key(&format!("country:{}", country));
                async_conn.srem(&country_index, id).await.map_err(|e| {
                    StorageError::Internal(format!("Failed to remove from country index: {}", e))
                })?;
            }

            let status_index = Self::index_key(&format!(
                "status:{}",
                serde_json::to_string(&actor.status).unwrap_or_else(|_| "Unknown".to_string())
            ));
            async_conn.srem(&status_index, id).await.map_err(|e| {
                StorageError::Internal(format!("Failed to remove from status index: {}", e))
            })?;

            let all_index = Self::index_key("all_actors");
            async_conn.srem(&all_index, id).await.map_err(|e| {
                StorageError::Internal(format!("Failed to remove from all actors index: {}", e))
            })?;

            // Delete the actor data
            conn.del(&key).map_err(|e| {
                StorageError::Internal(format!("Failed to delete threat actor: {}", e))
            })?;
        }

        Ok(exists)
    }

    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::campaign_key(&campaign.id);
        let data = serde_json::to_string(campaign).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize campaign: {}", e))
        })?;

        conn.set(&key, &data)
            .map_err(|e| StorageError::Internal(format!("Failed to store campaign: {}", e)))?;

        // Index by actor
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let actor_index = Self::index_key(&format!("campaigns_by_actor:{}", campaign.actor_id));
        async_conn
            .sadd(&actor_index, &campaign.id)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to index campaign by actor: {}", e))
            })?;

        // Index by status
        let status_index = Self::index_key(&format!(
            "campaigns_by_status:{}",
            serde_json::to_string(&campaign.status).unwrap_or_else(|_| "Unknown".to_string())
        ));
        async_conn
            .sadd(&status_index, &campaign.id)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to index campaign by status: {}", e))
            })?;

        Ok(())
    }

    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::campaign_key(id);
        let data: Option<String> = conn
            .get(&key)
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign: {}", e)))?;

        match data {
            Some(json) => {
                let campaign: Campaign = serde_json::from_str(&json).map_err(|e| {
                    StorageError::Serialization(format!("Failed to deserialize campaign: {}", e))
                })?;
                Ok(Some(campaign))
            }
            None => Ok(None),
        }
    }

    async fn search_campaigns(
        &self,
        actor_id: Option<&str>,
        status: Option<CampaignStatus>,
    ) -> Result<Vec<Campaign>, StorageError> {
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let mut campaign_ids = Vec::new();

        if let Some(actor_id) = actor_id {
            let actor_index = Self::index_key(&format!("campaigns_by_actor:{}", actor_id));
            campaign_ids = async_conn.smembers(&actor_index).await.map_err(|e| {
                StorageError::Internal(format!("Failed to get campaigns by actor: {}", e))
            })?;
        } else if let Some(ref status) = status {
            let status_str =
                serde_json::to_string(status).unwrap_or_else(|_| "Unknown".to_string());
            let status_index = Self::index_key(&format!("campaigns_by_status:{}", status_str));
            campaign_ids = async_conn.smembers(&status_index).await.map_err(|e| {
                StorageError::Internal(format!("Failed to get campaigns by status: {}", e))
            })?;
        } else {
            // Get all campaigns - this would require maintaining a separate index
            // For now, return empty as we don't have a global campaign index
            return Ok(vec![]);
        }

        // Get full campaign data
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let mut campaigns = Vec::new();
        for id in campaign_ids {
            let key = Self::campaign_key(&id);
            if let Some(data) = conn.get::<_, Option<String>>(&key).map_err(|e| {
                StorageError::Internal(format!("Failed to get campaign {}: {}", id, e))
            })? {
                let campaign: Campaign = serde_json::from_str(&data).map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize campaign {}: {}",
                        id, e
                    ))
                })?;
                campaigns.push(campaign);
            }
        }

        Ok(campaigns)
    }

    async fn store_attribution_analysis(
        &self,
        analysis: &AttributionAnalysis,
    ) -> Result<(), StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let actor_id = analysis
            .primary_attribution
            .as_ref()
            .unwrap_or(&"unknown".to_string());
        let key = Self::attribution_key(actor_id, &analysis.analysis_timestamp);
        let data = serde_json::to_string(analysis).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize attribution analysis: {}", e))
        })?;

        conn.set(&key, &data).map_err(|e| {
            StorageError::Internal(format!("Failed to store attribution analysis: {}", e))
        })?;

        Ok(())
    }

    async fn get_attribution_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Vec<AttributionAnalysis>, StorageError> {
        // Redis doesn't support easy querying by pattern for complex searches
        // This is a simplified implementation
        // In a real implementation, you'd need to maintain indexes or use Redis search capabilities
        Ok(vec![])
    }

    async fn store_behavioral_analysis(
        &self,
        analysis: &BehavioralAnalysis,
    ) -> Result<(), StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::behavioral_key(&analysis.actor_id);
        let data = serde_json::to_string(analysis).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize behavioral analysis: {}", e))
        })?;

        conn.set(&key, &data).map_err(|e| {
            StorageError::Internal(format!("Failed to store behavioral analysis: {}", e))
        })?;

        Ok(())
    }

    async fn get_behavioral_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Option<BehavioralAnalysis>, StorageError> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::behavioral_key(actor_id);
        let data: Option<String> = conn.get(&key).map_err(|e| {
            StorageError::Internal(format!("Failed to get behavioral analysis: {}", e))
        })?;

        match data {
            Some(json) => {
                let analysis: BehavioralAnalysis = serde_json::from_str(&json).map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize behavioral analysis: {}",
                        e
                    ))
                })?;
                Ok(Some(analysis))
            }
            None => Ok(None),
        }
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
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| StorageError::Connection(format!("Failed to get connection: {}", e)))?;

        let key = Self::actor_key(actor_id);
        let data: Option<String> = conn.get(&key).map_err(|e| {
            StorageError::Internal(format!("Failed to get threat actor for update: {}", e))
        })?;

        if let Some(json) = data {
            let mut actor: ThreatActor = serde_json::from_str(&json).map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize threat actor for update: {}",
                    e
                ))
            })?;

            actor.confidence_score = confidence;
            let updated_data = serde_json::to_string(&actor).map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to serialize updated threat actor: {}",
                    e
                ))
            })?;

            conn.set(&key, &updated_data).map_err(|e| {
                StorageError::Internal(format!("Failed to update threat actor confidence: {}", e))
            })?;
        }

        Ok(())
    }

    async fn get_actors_by_type(
        &self,
        actor_type: ActorType,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let type_str = serde_json::to_string(&actor_type).unwrap_or_else(|_| "Unknown".to_string());
        let index_key = Self::index_key(&format!("actor_type:{}", type_str));

        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let ids: Vec<String> = async_conn
            .smembers(&index_key)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get actors by type: {}", e)))?;

        self.get_threat_actor_batch(&ids).await
    }

    async fn get_actors_by_sophistication(
        &self,
        level: SophisticationLevel,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        // Redis doesn't have easy querying by sophistication level without an index
        // This would require maintaining additional indexes
        Ok(vec![])
    }

    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError> {
        let index_key = Self::index_key(&format!("country:{}", country));

        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let ids: Vec<String> = async_conn.smembers(&index_key).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get actors by country: {}", e))
        })?;

        self.get_threat_actor_batch(&ids).await
    }

    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError> {
        self.search_campaigns(None, Some(CampaignStatus::Active))
            .await
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let mut async_conn = self
            .client
            .get_multiplexed_async_connection()
            .await
            .map_err(|e| {
                StorageError::Connection(format!("Failed to get async connection: {}", e))
            })?;

        let all_index = Self::index_key("all_actors");
        let threat_actor_count = async_conn.scard(&all_index).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get threat actor count: {}", e))
        })?;

        // For campaigns and analyses, we'd need to maintain separate counters
        // This is a simplified implementation
        Ok(StorageStatistics {
            threat_actor_count,
            campaign_count: 0,             // Would need to maintain a counter
            attribution_analysis_count: 0, // Would need to maintain a counter
            behavioral_analysis_count: 0,  // Would need to maintain a counter
            total_size_bytes: 0,           // Would need to calculate actual memory usage
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // Redis connection will be closed when dropped
        Ok(())
    }
}

impl RedisStorage {
    /// Helper method to check if a threat actor matches the search criteria
    fn matches_criteria(actor: &ThreatActor, criteria: &ThreatActorSearchCriteria) -> bool {
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

        // Note: Other criteria are handled by the index-based filtering above
        true
    }
}
