// phantom-threat-actor-core/src/storage/mongodb.rs
// MongoDB storage implementation for Threat Actor Core

use super::traits::*;
use crate::models::*;
use async_trait::async_trait;
use chrono::Utc;
use mongodb::{
    bson::{doc, oid::ObjectId, DateTime as BsonDateTime, Document},
    Client, Collection, Database,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
struct MongoThreatActor {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub actor_id: String,
    pub name: String,
    pub aliases: Vec<String>,
    pub actor_type: String,
    pub sophistication_level: String,
    pub motivation: Vec<String>,
    pub origin_country: Option<String>,
    pub first_observed: BsonDateTime,
    pub last_activity: BsonDateTime,
    pub status: String,
    pub confidence_score: f64,
    pub attribution_confidence: f64,
    pub capabilities: Vec<Capability>,
    pub infrastructure: Infrastructure,
    pub tactics: Vec<String>,
    pub techniques: Vec<String>,
    pub procedures: Vec<String>,
    pub targets: Vec<Target>,
    pub campaigns: Vec<String>,
    pub associated_malware: Vec<String>,
    pub iocs: Vec<String>,
    pub relationships: Vec<ActorRelationship>,
    pub metadata: HashMap<String, String>,
    pub created_at: BsonDateTime,
    pub updated_at: BsonDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
struct MongoCampaign {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub campaign_id: String,
    pub name: String,
    pub actor_id: String,
    pub start_date: BsonDateTime,
    pub end_date: Option<BsonDateTime>,
    pub status: String,
    pub objectives: Vec<String>,
    pub targets: Vec<Target>,
    pub ttps: Vec<String>,
    pub malware_families: Vec<String>,
    pub iocs: Vec<String>,
    pub impact_assessment: ImpactAssessment,
    pub created_at: BsonDateTime,
    pub updated_at: BsonDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
struct MongoAttributionAnalysis {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub actor_id: String,
    pub primary_attribution: Option<String>,
    pub alternative_attributions: Vec<AttributionCandidate>,
    pub confidence_score: f64,
    pub evidence_summary: Vec<Evidence>,
    pub analysis_timestamp: BsonDateTime,
    pub created_at: BsonDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
struct MongoBehavioralAnalysis {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    pub actor_id: String,
    pub behavioral_patterns: Vec<BehavioralPattern>,
    pub operational_patterns: Vec<OperationalPattern>,
    pub evolution_analysis: EvolutionAnalysis,
    pub predictive_indicators: Vec<PredictiveIndicator>,
    pub created_at: BsonDateTime,
    pub updated_at: BsonDateTime,
}

pub struct MongoDBStorage {
    database: Database,
    threat_actors: Collection<MongoThreatActor>,
    campaigns: Collection<MongoCampaign>,
    attribution_analyses: Collection<MongoAttributionAnalysis>,
    behavioral_analyses: Collection<MongoBehavioralAnalysis>,
}

impl MongoDBStorage {
    /// Create a new MongoDB storage instance
    pub async fn new(connection_string: &str, database_name: &str) -> Result<Self, StorageError> {
        let client = Client::with_uri_str(connection_string).await.map_err(|e| {
            StorageError::Connection(format!("Failed to create MongoDB client: {}", e))
        })?;

        let database = client.database(database_name);

        // Test connection
        database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to ping MongoDB: {}", e)))?;

        let threat_actors = database.collection::<MongoThreatActor>("threat_actors");
        let campaigns = database.collection::<MongoCampaign>("campaigns");
        let attribution_analyses =
            database.collection::<MongoAttributionAnalysis>("attribution_analyses");
        let behavioral_analyses =
            database.collection::<MongoBehavioralAnalysis>("behavioral_analyses");

        // Create indexes
        threat_actors
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "actor_id": 1 })
                    .build(),
                None,
            )
            .await?;
        threat_actors
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "actor_type": 1 })
                    .build(),
                None,
            )
            .await?;
        threat_actors
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "origin_country": 1 })
                    .build(),
                None,
            )
            .await?;
        threat_actors
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "status": 1 })
                    .build(),
                None,
            )
            .await?;
        threat_actors
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "confidence_score": 1 })
                    .build(),
                None,
            )
            .await?;
        campaigns
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "campaign_id": 1 })
                    .build(),
                None,
            )
            .await?;
        campaigns
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "actor_id": 1 })
                    .build(),
                None,
            )
            .await?;
        campaigns
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "status": 1 })
                    .build(),
                None,
            )
            .await?;
        attribution_analyses
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "actor_id": 1 })
                    .build(),
                None,
            )
            .await?;
        behavioral_analyses
            .create_index(
                mongodb::IndexModel::builder()
                    .keys(doc! { "actor_id": 1 })
                    .build(),
                None,
            )
            .await?;

        Ok(Self {
            database,
            threat_actors,
            campaigns,
            attribution_analyses,
            behavioral_analyses,
        })
    }

    /// Convert ThreatActor to MongoThreatActor
    fn actor_to_mongo(actor: &ThreatActor) -> MongoThreatActor {
        MongoThreatActor {
            id: None,
            actor_id: actor.id.clone(),
            name: actor.name.clone(),
            aliases: actor.aliases.clone(),
            actor_type: serde_json::to_string(&actor.actor_type)
                .unwrap_or_else(|_| "Unknown".to_string()),
            sophistication_level: serde_json::to_string(&actor.sophistication_level)
                .unwrap_or_else(|_| "Unknown".to_string()),
            motivation: actor
                .motivation
                .iter()
                .map(|m| serde_json::to_string(m).unwrap_or_else(|_| "Unknown".to_string()))
                .collect(),
            origin_country: actor.origin_country.clone(),
            first_observed: BsonDateTime::from_chrono(actor.first_observed),
            last_activity: BsonDateTime::from_chrono(actor.last_activity),
            status: serde_json::to_string(&actor.status).unwrap_or_else(|_| "Unknown".to_string()),
            confidence_score: actor.confidence_score,
            attribution_confidence: actor.attribution_confidence,
            capabilities: actor.capabilities.clone(),
            infrastructure: actor.infrastructure.clone(),
            tactics: actor.tactics.clone(),
            techniques: actor.techniques.clone(),
            procedures: actor.procedures.clone(),
            targets: actor.targets.clone(),
            campaigns: actor.campaigns.clone(),
            associated_malware: actor.associated_malware.clone(),
            iocs: actor.iocs.clone(),
            relationships: actor.relationships.clone(),
            metadata: actor.metadata.clone(),
            created_at: BsonDateTime::from_chrono(Utc::now()),
            updated_at: BsonDateTime::from_chrono(Utc::now()),
        }
    }

    /// Convert MongoThreatActor to ThreatActor
    fn mongo_to_actor(mongo: &MongoThreatActor) -> Result<ThreatActor, StorageError> {
        Ok(ThreatActor {
            id: mongo.actor_id.clone(),
            name: mongo.name.clone(),
            aliases: mongo.aliases.clone(),
            actor_type: serde_json::from_str(&mongo.actor_type).map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize actor_type: {}", e))
            })?,
            sophistication_level: serde_json::from_str(&mongo.sophistication_level).map_err(
                |e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize sophistication_level: {}",
                        e
                    ))
                },
            )?,
            motivation: mongo
                .motivation
                .iter()
                .filter_map(|m| serde_json::from_str(m).ok())
                .collect(),
            origin_country: mongo.origin_country.clone(),
            first_observed: mongo.first_observed.to_chrono(),
            last_activity: mongo.last_activity.to_chrono(),
            status: serde_json::from_str(&mongo.status).map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize status: {}", e))
            })?,
            confidence_score: mongo.confidence_score,
            attribution_confidence: mongo.attribution_confidence,
            capabilities: mongo.capabilities.clone(),
            infrastructure: mongo.infrastructure.clone(),
            tactics: mongo.tactics.clone(),
            techniques: mongo.techniques.clone(),
            procedures: mongo.procedures.clone(),
            targets: mongo.targets.clone(),
            campaigns: mongo.campaigns.clone(),
            associated_malware: mongo.associated_malware.clone(),
            iocs: mongo.iocs.clone(),
            relationships: mongo.relationships.clone(),
            metadata: mongo.metadata.clone(),
        })
    }

    /// Convert Campaign to MongoCampaign
    fn campaign_to_mongo(campaign: &Campaign) -> MongoCampaign {
        MongoCampaign {
            id: None,
            campaign_id: campaign.id.clone(),
            name: campaign.name.clone(),
            actor_id: campaign.actor_id.clone(),
            start_date: BsonDateTime::from_chrono(campaign.start_date),
            end_date: campaign.end_date.map(BsonDateTime::from_chrono),
            status: serde_json::to_string(&campaign.status)
                .unwrap_or_else(|_| "Unknown".to_string()),
            objectives: campaign.objectives.clone(),
            targets: campaign.targets.clone(),
            ttps: campaign.ttps.clone(),
            malware_families: campaign.malware_families.clone(),
            iocs: campaign.iocs.clone(),
            impact_assessment: campaign.impact_assessment.clone(),
            created_at: BsonDateTime::from_chrono(Utc::now()),
            updated_at: BsonDateTime::from_chrono(Utc::now()),
        }
    }

    /// Convert MongoCampaign to Campaign
    fn mongo_to_campaign(mongo: &MongoCampaign) -> Result<Campaign, StorageError> {
        Ok(Campaign {
            id: mongo.campaign_id.clone(),
            name: mongo.name.clone(),
            actor_id: mongo.actor_id.clone(),
            start_date: mongo.start_date.to_chrono(),
            end_date: mongo.end_date.map(|dt| dt.to_chrono()),
            status: serde_json::from_str(&mongo.status).map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize status: {}", e))
            })?,
            objectives: mongo.objectives.clone(),
            targets: mongo.targets.clone(),
            ttps: mongo.ttps.clone(),
            malware_families: mongo.malware_families.clone(),
            iocs: mongo.iocs.clone(),
            impact_assessment: mongo.impact_assessment.clone(),
        })
    }
}

#[async_trait]
impl ThreatActorStorage for MongoDBStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Collections and indexes are already created in new()
        Ok(())
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        let start = std::time::Instant::now();

        // Simple health check - count documents
        let count = self
            .threat_actors
            .count_documents(doc! {}, None)
            .await
            .map_err(|e| StorageError::Internal(format!("Health check failed: {}", e)))?;

        let response_time = start.elapsed().as_millis() as u64;

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "mongodb".to_string());
                metadata.insert("threat_actor_count".to_string(), count.to_string());
                metadata
            },
        })
    }

    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError> {
        let mongo_actor = Self::actor_to_mongo(actor);

        // Use upsert to handle both insert and update
        let filter = doc! { "actor_id": &actor.id };
        let update = doc! { "$set": bson::to_document(&mongo_actor).map_err(|e| StorageError::Serialization(format!("Failed to serialize actor: {}", e)))? };
        let options = mongodb::options::UpdateOptions::builder()
            .upsert(true)
            .build();

        self.threat_actors
            .update_one(filter, update, options)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store threat actor: {}", e)))?;

        Ok(())
    }

    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError> {
        if actors.is_empty() {
            return Ok(());
        }

        let mongo_actors: Vec<MongoThreatActor> = actors.iter().map(Self::actor_to_mongo).collect();

        // Convert to documents for bulk write
        let documents: Vec<Document> = mongo_actors
            .into_iter()
            .map(|actor| bson::to_document(&actor))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize actors: {}", e))
            })?;

        let mut operations = Vec::new();
        for doc in documents {
            let filter = doc! { "actor_id": doc.get_str("actor_id").unwrap_or("") };
            operations.push(
                mongodb::options::UpdateOneModel::builder()
                    .filter(filter)
                    .update(doc! { "$set": doc })
                    .upsert(true)
                    .build(),
            );
        }

        let options = mongodb::options::BulkWriteOptions::builder()
            .ordered(false)
            .build();
        self.threat_actors
            .bulk_write(operations, options)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to bulk write threat actors: {}", e))
            })?;

        Ok(())
    }

    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError> {
        let filter = doc! { "actor_id": id };
        let mongo_actor = self
            .threat_actors
            .find_one(filter, None)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get threat actor: {}", e)))?;

        match mongo_actor {
            Some(actor) => Ok(Some(Self::mongo_to_actor(&actor)?)),
            None => Ok(None),
        }
    }

    async fn get_threat_actor_batch(
        &self,
        ids: &[String],
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let filter = doc! { "actor_id": { "$in": ids } };
        let mut cursor = self.threat_actors.find(filter, None).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get threat actors batch: {}", e))
        })?;

        let mut actors = Vec::new();
        while let Ok(Some(mongo_actor)) = cursor.try_next().await {
            actors.push(Self::mongo_to_actor(&mongo_actor)?);
        }

        Ok(actors)
    }

    async fn search_threat_actors(
        &self,
        criteria: &ThreatActorSearchCriteria,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let mut filter = Document::new();

        // Build filter based on criteria
        if let Some(ref actor_types) = criteria.actor_types {
            let types: Vec<String> = actor_types
                .iter()
                .map(|t| serde_json::to_string(t).unwrap_or_default())
                .collect();
            filter.insert("actor_type", doc! { "$in": types });
        }

        if let Some(ref sophistication_levels) = criteria.sophistication_levels {
            let levels: Vec<String> = sophistication_levels
                .iter()
                .map(|l| serde_json::to_string(l).unwrap_or_default())
                .collect();
            filter.insert("sophistication_level", doc! { "$in": levels });
        }

        if let Some(ref origin_countries) = criteria.origin_countries {
            filter.insert("origin_country", doc! { "$in": origin_countries });
        }

        if let Some(ref activity_status) = criteria.activity_status {
            let statuses: Vec<String> = activity_status
                .iter()
                .map(|s| serde_json::to_string(s).unwrap_or_default())
                .collect();
            filter.insert("status", doc! { "$in": statuses });
        }

        if let Some(confidence_min) = criteria.confidence_min {
            filter.insert("confidence_score", doc! { "$gte": confidence_min });
        }

        if let Some(confidence_max) = criteria.confidence_max {
            filter.insert("confidence_score", doc! { "$lte": confidence_max });
        }

        if let Some(after) = criteria.first_observed_after {
            filter.insert(
                "first_observed",
                doc! { "$gte": BsonDateTime::from_chrono(after) },
            );
        }

        if let Some(before) = criteria.first_observed_before {
            filter.insert(
                "first_observed",
                doc! { "$lte": BsonDateTime::from_chrono(before) },
            );
        }

        if let Some(after) = criteria.last_activity_after {
            filter.insert(
                "last_activity",
                doc! { "$gte": BsonDateTime::from_chrono(after) },
            );
        }

        if let Some(before) = criteria.last_activity_before {
            filter.insert(
                "last_activity",
                doc! { "$lte": BsonDateTime::from_chrono(before) },
            );
        }

        let mut options = mongodb::options::FindOptions::builder();

        if let Some(limit) = criteria.limit {
            options.limit(limit as i64);
        }

        if let Some(offset) = criteria.offset {
            options.skip(offset as u64);
        }

        let mut cursor = self
            .threat_actors
            .find(filter, options.build())
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to search threat actors: {}", e))
            })?;

        let mut actors = Vec::new();
        while let Ok(Some(mongo_actor)) = cursor.try_next().await {
            actors.push(Self::mongo_to_actor(&mongo_actor)?);
        }

        Ok(actors)
    }

    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError> {
        let projection = doc! { "actor_id": 1 };
        let options = mongodb::options::FindOptions::builder()
            .projection(projection)
            .build();

        let mut cursor = self
            .threat_actors
            .find(doc! {}, options)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to list threat actor ids: {}", e))
            })?;

        let mut ids = Vec::new();
        while let Ok(Some(doc)) = cursor.try_next().await {
            if let Some(id) = doc.get_str("actor_id").ok() {
                ids.push(id.to_string());
            }
        }

        Ok(ids)
    }

    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError> {
        let filter = doc! { "actor_id": id };
        let result = self
            .threat_actors
            .delete_one(filter, None)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to delete threat actor: {}", e)))?;

        Ok(result.deleted_count > 0)
    }

    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError> {
        let mongo_campaign = Self::campaign_to_mongo(campaign);

        let filter = doc! { "campaign_id": &campaign.id };
        let update = doc! { "$set": bson::to_document(&mongo_campaign).map_err(|e| StorageError::Serialization(format!("Failed to serialize campaign: {}", e)))? };
        let options = mongodb::options::UpdateOptions::builder()
            .upsert(true)
            .build();

        self.campaigns
            .update_one(filter, update, options)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store campaign: {}", e)))?;

        Ok(())
    }

    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError> {
        let filter = doc! { "campaign_id": id };
        let mongo_campaign = self
            .campaigns
            .find_one(filter, None)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign: {}", e)))?;

        match mongo_campaign {
            Some(campaign) => Ok(Some(Self::mongo_to_campaign(&campaign)?)),
            None => Ok(None),
        }
    }

    async fn search_campaigns(
        &self,
        actor_id: Option<&str>,
        status: Option<CampaignStatus>,
    ) -> Result<Vec<Campaign>, StorageError> {
        let mut filter = Document::new();

        if let Some(actor_id) = actor_id {
            filter.insert("actor_id", actor_id);
        }

        if let Some(ref status) = status {
            let status_str = serde_json::to_string(status).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize status: {}", e))
            })?;
            filter.insert("status", status_str);
        }

        let mut cursor =
            self.campaigns.find(filter, None).await.map_err(|e| {
                StorageError::Internal(format!("Failed to search campaigns: {}", e))
            })?;

        let mut campaigns = Vec::new();
        while let Ok(Some(mongo_campaign)) = cursor.try_next().await {
            campaigns.push(Self::mongo_to_campaign(&mongo_campaign)?);
        }

        Ok(campaigns)
    }

    async fn store_attribution_analysis(
        &self,
        analysis: &AttributionAnalysis,
    ) -> Result<(), StorageError> {
        let actor_id = analysis
            .primary_attribution
            .as_ref()
            .unwrap_or(&"unknown".to_string());

        let mongo_analysis = MongoAttributionAnalysis {
            id: None,
            actor_id: actor_id.clone(),
            primary_attribution: analysis.primary_attribution.clone(),
            alternative_attributions: analysis.alternative_attributions.clone(),
            confidence_score: analysis.confidence_score,
            evidence_summary: analysis.evidence_summary.clone(),
            analysis_timestamp: BsonDateTime::from_chrono(analysis.analysis_timestamp),
            created_at: BsonDateTime::from_chrono(Utc::now()),
        };

        self.attribution_analyses
            .insert_one(mongo_analysis, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to store attribution analysis: {}", e))
            })?;

        Ok(())
    }

    async fn get_attribution_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Vec<AttributionAnalysis>, StorageError> {
        let filter = doc! { "actor_id": actor_id };
        let options = mongodb::options::FindOptions::builder()
            .sort(doc! { "analysis_timestamp": -1 })
            .build();

        let mut cursor = self
            .attribution_analyses
            .find(filter, options)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get attribution analysis: {}", e))
            })?;

        let mut analyses = Vec::new();
        while let Ok(Some(mongo_analysis)) = cursor.try_next().await {
            analyses.push(AttributionAnalysis {
                primary_attribution: mongo_analysis.primary_attribution,
                alternative_attributions: mongo_analysis.alternative_attributions,
                confidence_score: mongo_analysis.confidence_score,
                evidence_summary: mongo_analysis.evidence_summary,
                analysis_timestamp: mongo_analysis.analysis_timestamp.to_chrono(),
            });
        }

        Ok(analyses)
    }

    async fn store_behavioral_analysis(
        &self,
        analysis: &BehavioralAnalysis,
    ) -> Result<(), StorageError> {
        let mongo_analysis = MongoBehavioralAnalysis {
            id: None,
            actor_id: analysis.actor_id.clone(),
            behavioral_patterns: analysis.behavioral_patterns.clone(),
            operational_patterns: analysis.operational_patterns.clone(),
            evolution_analysis: analysis.evolution_analysis.clone(),
            predictive_indicators: analysis.predictive_indicators.clone(),
            created_at: BsonDateTime::from_chrono(Utc::now()),
            updated_at: BsonDateTime::from_chrono(Utc::now()),
        };

        let filter = doc! { "actor_id": &analysis.actor_id };
        let update = doc! { "$set": bson::to_document(&mongo_analysis).map_err(|e| StorageError::Serialization(format!("Failed to serialize behavioral analysis: {}", e)))? };
        let options = mongodb::options::UpdateOptions::builder()
            .upsert(true)
            .build();

        self.behavioral_analyses
            .update_one(filter, update, options)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to store behavioral analysis: {}", e))
            })?;

        Ok(())
    }

    async fn get_behavioral_analysis(
        &self,
        actor_id: &str,
    ) -> Result<Option<BehavioralAnalysis>, StorageError> {
        let filter = doc! { "actor_id": actor_id };
        let mongo_analysis = self
            .behavioral_analyses
            .find_one(filter, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get behavioral analysis: {}", e))
            })?;

        match mongo_analysis {
            Some(analysis) => Ok(Some(BehavioralAnalysis {
                actor_id: analysis.actor_id,
                behavioral_patterns: analysis.behavioral_patterns,
                operational_patterns: analysis.operational_patterns,
                evolution_analysis: analysis.evolution_analysis,
                predictive_indicators: analysis.predictive_indicators,
            })),
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
        let filter = doc! { "actor_id": actor_id };
        let update = doc! { "$set": { "confidence_score": confidence, "updated_at": BsonDateTime::from_chrono(Utc::now()) } };

        self.threat_actors
            .update_one(filter, update, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to update actor confidence: {}", e))
            })?;

        Ok(())
    }

    async fn get_actors_by_type(
        &self,
        actor_type: ActorType,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let type_str = serde_json::to_string(&actor_type).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize actor_type: {}", e))
        })?;

        let filter = doc! { "actor_type": type_str };
        let mut cursor =
            self.threat_actors.find(filter, None).await.map_err(|e| {
                StorageError::Internal(format!("Failed to get actors by type: {}", e))
            })?;

        let mut actors = Vec::new();
        while let Ok(Some(mongo_actor)) = cursor.try_next().await {
            actors.push(Self::mongo_to_actor(&mongo_actor)?);
        }

        Ok(actors)
    }

    async fn get_actors_by_sophistication(
        &self,
        level: SophisticationLevel,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let level_str = serde_json::to_string(&level).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e))
        })?;

        let filter = doc! { "sophistication_level": level_str };
        let mut cursor = self.threat_actors.find(filter, None).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get actors by sophistication: {}", e))
        })?;

        let mut actors = Vec::new();
        while let Ok(Some(mongo_actor)) = cursor.try_next().await {
            actors.push(Self::mongo_to_actor(&mongo_actor)?);
        }

        Ok(actors)
    }

    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError> {
        let filter = doc! { "origin_country": country };
        let mut cursor = self.threat_actors.find(filter, None).await.map_err(|e| {
            StorageError::Internal(format!("Failed to get actors by country: {}", e))
        })?;

        let mut actors = Vec::new();
        while let Ok(Some(mongo_actor)) = cursor.try_next().await {
            actors.push(Self::mongo_to_actor(&mongo_actor)?);
        }

        Ok(actors)
    }

    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError> {
        self.search_campaigns(None, Some(CampaignStatus::Active))
            .await
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let threat_actor_count = self
            .threat_actors
            .count_documents(doc! {}, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actor count: {}", e))
            })?;

        let campaign_count = self
            .campaigns
            .count_documents(doc! {}, None)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign count: {}", e)))?;

        let attribution_count = self
            .attribution_analyses
            .count_documents(doc! {}, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get attribution count: {}", e))
            })?;

        let behavioral_count = self
            .behavioral_analyses
            .count_documents(doc! {}, None)
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get behavioral count: {}", e))
            })?;

        Ok(StorageStatistics {
            threat_actor_count,
            campaign_count,
            attribution_analysis_count: attribution_count,
            behavioral_analysis_count: behavioral_count,
            total_size_bytes: 0, // Would need to calculate actual database size
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // MongoDB client will be closed when dropped
        Ok(())
    }
}
