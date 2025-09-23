// phantom-threat-actor-core/src/storage/elasticsearch.rs
// Elasticsearch storage implementation for Threat Actor Core

use async_trait::async_trait;
use elasticsearch::{Elasticsearch, IndexParts, SearchParts, DeleteParts, BulkParts, BulkOperation, BulkOperations};
use serde_json::{json, Value};
use std::collections::HashMap;
use chrono::Utc;
use crate::models::*;
use super::traits::*;

pub struct ElasticsearchStorage {
    client: Elasticsearch,
    index_name: String,
}

impl ElasticsearchStorage {
    /// Create a new Elasticsearch storage instance
    pub async fn new(connection_string: &str, index_name: &str) -> Result<Self, StorageError> {
        let transport = elasticsearch::http::transport::Transport::single_node(connection_string)
            .map_err(|e| StorageError::Connection(format!("Failed to create transport: {}", e)))?;

        let client = Elasticsearch::new(transport);

        // Test connection
        let response = client
            .info()
            .send()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to connect to Elasticsearch: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Connection("Elasticsearch connection failed".to_string()));
        }

        // Create index if it doesn't exist
        Self::create_index_if_not_exists(&client, index_name).await?;

        Ok(Self {
            client,
            index_name: index_name.to_string(),
        })
    }

    /// Create index with proper mappings
    async fn create_index_if_not_exists(client: &Elasticsearch, index_name: &str) -> Result<(), StorageError> {
        let mapping = json!({
            "mappings": {
                "properties": {
                    "actor_id": { "type": "keyword" },
                    "name": { "type": "text" },
                    "aliases": { "type": "keyword" },
                    "actor_type": { "type": "keyword" },
                    "sophistication_level": { "type": "keyword" },
                    "motivation": { "type": "keyword" },
                    "origin_country": { "type": "keyword" },
                    "first_observed": { "type": "date" },
                    "last_activity": { "type": "date" },
                    "status": { "type": "keyword" },
                    "confidence_score": { "type": "float" },
                    "attribution_confidence": { "type": "float" },
                    "capabilities": { "type": "nested" },
                    "infrastructure": { "type": "object" },
                    "tactics": { "type": "keyword" },
                    "techniques": { "type": "keyword" },
                    "procedures": { "type": "keyword" },
                    "targets": { "type": "nested" },
                    "campaigns": { "type": "keyword" },
                    "associated_malware": { "type": "keyword" },
                    "iocs": { "type": "keyword" },
                    "relationships": { "type": "nested" },
                    "metadata": { "type": "object" },
                    "document_type": { "type": "keyword" },
                    "campaign_id": { "type": "keyword" },
                    "actor_id_ref": { "type": "keyword" },
                    "start_date": { "type": "date" },
                    "end_date": { "type": "date" },
                    "campaign_status": { "type": "keyword" },
                    "analysis_timestamp": { "type": "date" }
                }
            }
        });

        let response = client
            .indices()
            .create(elasticsearch::indices::IndicesCreateParts::Index(index_name))
            .body(mapping)
            .send()
            .await;

        match response {
            Ok(resp) => {
                if !resp.status_code().is_success() && resp.status_code() != elasticsearch::http::StatusCode::BAD_REQUEST {
                    return Err(StorageError::Internal(format!("Failed to create index: {}", resp.status_code())));
                }
            }
            Err(e) => {
                // Index might already exist, which is fine
                if !e.to_string().contains("resource_already_exists") {
                    return Err(StorageError::Internal(format!("Failed to create index: {}", e)));
                }
            }
        }

        Ok(())
    }

    /// Convert ThreatActor to Elasticsearch document
    fn actor_to_document(actor: &ThreatActor) -> Result<Value, StorageError> {
        let doc = json!({
            "actor_id": actor.id,
            "name": actor.name,
            "aliases": actor.aliases,
            "actor_type": serde_json::to_string(&actor.actor_type).map_err(|e| StorageError::Serialization(format!("Failed to serialize actor_type: {}", e)))?,
            "sophistication_level": serde_json::to_string(&actor.sophistication_level).map_err(|e| StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e)))?,
            "motivation": actor.motivation.iter().map(|m| serde_json::to_string(m).unwrap_or_else(|_| "Unknown".to_string())).collect::<Vec<_>>(),
            "origin_country": actor.origin_country,
            "first_observed": actor.first_observed.to_rfc3339(),
            "last_activity": actor.last_activity.to_rfc3339(),
            "status": serde_json::to_string(&actor.status).map_err(|e| StorageError::Serialization(format!("Failed to serialize status: {}", e)))?,
            "confidence_score": actor.confidence_score,
            "attribution_confidence": actor.attribution_confidence,
            "capabilities": actor.capabilities,
            "infrastructure": actor.infrastructure,
            "tactics": actor.tactics,
            "techniques": actor.techniques,
            "procedures": actor.procedures,
            "targets": actor.targets,
            "campaigns": actor.campaigns,
            "associated_malware": actor.associated_malware,
            "iocs": actor.iocs,
            "relationships": actor.relationships,
            "metadata": actor.metadata,
            "document_type": "threat_actor"
        });

        Ok(doc)
    }

    /// Convert Elasticsearch document to ThreatActor
    fn document_to_actor(doc: &Value) -> Result<ThreatActor, StorageError> {
        let source = doc.get("_source").ok_or_else(|| StorageError::Serialization("Missing _source in document".to_string()))?;

        Ok(ThreatActor {
            id: source.get("actor_id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            name: source.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            aliases: source.get("aliases").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            actor_type: serde_json::from_str(
                source.get("actor_type").and_then(|v| v.as_str()).unwrap_or("\"Unknown\"")
            ).map_err(|e| StorageError::Serialization(format!("Failed to deserialize actor_type: {}", e)))?,
            sophistication_level: serde_json::from_str(
                source.get("sophistication_level").and_then(|v| v.as_str()).unwrap_or("\"Unknown\"")
            ).map_err(|e| StorageError::Serialization(format!("Failed to deserialize sophistication_level: {}", e)))?,
            motivation: source.get("motivation").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str())
                .filter_map(|s| serde_json::from_str(s).ok())
                .collect(),
            origin_country: source.get("origin_country").and_then(|v| v.as_str()).map(|s| s.to_string()),
            first_observed: chrono::DateTime::parse_from_rfc3339(
                source.get("first_observed").and_then(|v| v.as_str()).unwrap_or("")
            ).map_err(|e| StorageError::Serialization(format!("Failed to parse first_observed: {}", e)))?.with_timezone(&Utc),
            last_activity: chrono::DateTime::parse_from_rfc3339(
                source.get("last_activity").and_then(|v| v.as_str()).unwrap_or("")
            ).map_err(|e| StorageError::Serialization(format!("Failed to parse last_activity: {}", e)))?.with_timezone(&Utc),
            status: serde_json::from_str(
                source.get("status").and_then(|v| v.as_str()).unwrap_or("\"Unknown\"")
            ).map_err(|e| StorageError::Serialization(format!("Failed to deserialize status: {}", e)))?,
            confidence_score: source.get("confidence_score").and_then(|v| v.as_f64()).unwrap_or(0.0),
            attribution_confidence: source.get("attribution_confidence").and_then(|v| v.as_f64()).unwrap_or(0.0),
            capabilities: serde_json::from_value(source.get("capabilities").cloned().unwrap_or(json!([])))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize capabilities: {}", e)))?,
            infrastructure: serde_json::from_value(source.get("infrastructure").cloned().unwrap_or(json!({})))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize infrastructure: {}", e)))?,
            tactics: source.get("tactics").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            techniques: source.get("techniques").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            procedures: source.get("procedures").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            targets: serde_json::from_value(source.get("targets").cloned().unwrap_or(json!([])))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize targets: {}", e)))?,
            campaigns: source.get("campaigns").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            associated_malware: source.get("associated_malware").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            iocs: source.get("iocs").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            relationships: serde_json::from_value(source.get("relationships").cloned().unwrap_or(json!([])))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize relationships: {}", e)))?,
            metadata: source.get("metadata").and_then(|v| v.as_object()).unwrap_or(&serde_json::Map::new()).iter()
                .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                .collect(),
        })
    }

    /// Convert Campaign to Elasticsearch document
    fn campaign_to_document(campaign: &Campaign) -> Result<Value, StorageError> {
        let doc = json!({
            "campaign_id": campaign.id,
            "name": campaign.name,
            "actor_id": campaign.actor_id,
            "actor_id_ref": campaign.actor_id,
            "start_date": campaign.start_date.to_rfc3339(),
            "end_date": campaign.end_date.map(|dt| dt.to_rfc3339()),
            "campaign_status": serde_json::to_string(&campaign.status).map_err(|e| StorageError::Serialization(format!("Failed to serialize status: {}", e)))?,
            "objectives": campaign.objectives,
            "targets": campaign.targets,
            "ttps": campaign.ttps,
            "malware_families": campaign.malware_families,
            "iocs": campaign.iocs,
            "impact_assessment": campaign.impact_assessment,
            "document_type": "campaign"
        });

        Ok(doc)
    }

    /// Convert Elasticsearch document to Campaign
    fn document_to_campaign(doc: &Value) -> Result<Campaign, StorageError> {
        let source = doc.get("_source").ok_or_else(|| StorageError::Serialization("Missing _source in document".to_string()))?;

        Ok(Campaign {
            id: source.get("campaign_id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            name: source.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            actor_id: source.get("actor_id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            start_date: chrono::DateTime::parse_from_rfc3339(
                source.get("start_date").and_then(|v| v.as_str()).unwrap_or("")
            ).map_err(|e| StorageError::Serialization(format!("Failed to parse start_date: {}", e)))?.with_timezone(&Utc),
            end_date: source.get("end_date").and_then(|v| v.as_str())
                .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
                .map(|dt| dt.with_timezone(&Utc)),
            status: serde_json::from_str(
                source.get("campaign_status").and_then(|v| v.as_str()).unwrap_or("\"Unknown\"")
            ).map_err(|e| StorageError::Serialization(format!("Failed to deserialize status: {}", e)))?,
            objectives: source.get("objectives").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            targets: serde_json::from_value(source.get("targets").cloned().unwrap_or(json!([])))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize targets: {}", e)))?,
            ttps: source.get("ttps").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            malware_families: source.get("malware_families").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            iocs: source.get("iocs").and_then(|v| v.as_array()).unwrap_or(&vec![]).iter()
                .filter_map(|v| v.as_str()).map(|s| s.to_string()).collect(),
            impact_assessment: serde_json::from_value(source.get("impact_assessment").cloned().unwrap_or(json!({})))
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize impact_assessment: {}", e)))?,
        })
    }
}

#[async_trait]
impl ThreatActorStorage for ElasticsearchStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Index is already created in new()
        Ok(())
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        let start = std::time::Instant::now();

        // Simple health check - count documents
        let query = json!({
            "query": { "match_all": {} },
            "size": 0
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Health check failed: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal("Elasticsearch health check failed".to_string()));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse health check response: {}", e)))?;

        let count = response_body.get("hits").and_then(|h| h.get("total")).and_then(|t| t.get("value")).and_then(|v| v.as_u64()).unwrap_or(0);

        let response_time = start.elapsed().as_millis() as u64;

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "elasticsearch".to_string());
                metadata.insert("document_count".to_string(), count.to_string());
                metadata
            },
        })
    }

    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError> {
        let doc = Self::actor_to_document(actor)?;

        let response = self.client
            .index(IndexParts::IndexId(&self.index_name, &actor.id))
            .body(doc)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store threat actor: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to index threat actor: {}", response.status_code())));
        }

        Ok(())
    }

    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError> {
        if actors.is_empty() {
            return Ok(());
        }

        let mut operations = BulkOperations::new();

        for actor in actors {
            let doc = Self::actor_to_document(actor)?;
            operations.push(BulkOperation::index(doc).id(&actor.id)).map_err(|e| StorageError::Internal(format!("Failed to create bulk operation: {}", e)))?;
        }

        let response = self.client
            .bulk(BulkParts::Index(&self.index_name))
            .body(vec![operations])
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to bulk store threat actors: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Bulk store failed: {}", response.status_code())));
        }

        Ok(())
    }

    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError> {
        let response = self.client
            .get(elasticsearch::GetParts::IndexId(&self.index_name, id))
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get threat actor: {}", e)))?;

        if response.status_code() == elasticsearch::http::StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to get threat actor: {}", response.status_code())));
        }

        let doc: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse response: {}", e)))?;

        let found = doc.get("found").and_then(|v| v.as_bool()).unwrap_or(false);
        if !found {
            return Ok(None);
        }

        let actor = Self::document_to_actor(&doc)?;
        Ok(Some(actor))
    }

    async fn get_threat_actor_batch(&self, ids: &[String]) -> Result<Vec<ThreatActor>, StorageError> {
        let query = json!({
            "query": {
                "terms": {
                    "actor_id": ids
                }
            },
            "size": ids.len()
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get threat actors batch: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Batch get failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse batch response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]).clone();

        let mut actors = Vec::new();
        for hit in hits {
            let actor = Self::document_to_actor(hit)?;
            actors.push(actor);
        }

        Ok(actors)
    }

    async fn search_threat_actors(&self, criteria: &ThreatActorSearchCriteria) -> Result<Vec<ThreatActor>, StorageError> {
        let mut query_parts = Vec::new();

        // Build query based on criteria
        if let Some(ref actor_types) = criteria.actor_types {
            let types: Vec<String> = actor_types.iter().map(|t| serde_json::to_string(t).unwrap_or_else(|_| "Unknown".to_string())).collect();
            query_parts.push(json!({ "terms": { "actor_type": types } }));
        }

        if let Some(ref sophistication_levels) = criteria.sophistication_levels {
            let levels: Vec<String> = sophistication_levels.iter().map(|l| serde_json::to_string(l).unwrap_or_else(|_| "Unknown".to_string())).collect();
            query_parts.push(json!({ "terms": { "sophistication_level": levels } }));
        }

        if let Some(ref origin_countries) = criteria.origin_countries {
            query_parts.push(json!({ "terms": { "origin_country": origin_countries } }));
        }

        if let Some(ref activity_status) = criteria.activity_status {
            let statuses: Vec<String> = activity_status.iter().map(|s| serde_json::to_string(s).unwrap_or_else(|_| "Unknown".to_string())).collect();
            query_parts.push(json!({ "terms": { "status": statuses } }));
        }

        if let Some(confidence_min) = criteria.confidence_min {
            query_parts.push(json!({ "range": { "confidence_score": { "gte": confidence_min } } }));
        }

        if let Some(confidence_max) = criteria.confidence_max {
            query_parts.push(json!({ "range": { "confidence_score": { "lte": confidence_max } } }));
        }

        if let Some(after) = criteria.first_observed_after {
            query_parts.push(json!({ "range": { "first_observed": { "gte": after.to_rfc3339() } } }));
        }

        if let Some(before) = criteria.first_observed_before {
            query_parts.push(json!({ "range": { "first_observed": { "lte": before.to_rfc3339() } } }));
        }

        if let Some(after) = criteria.last_activity_after {
            query_parts.push(json!({ "range": { "last_activity": { "gte": after.to_rfc3339() } } }));
        }

        if let Some(before) = criteria.last_activity_before {
            query_parts.push(json!({ "range": { "last_activity": { "lte": before.to_rfc3339() } } }));
        }

        let query = if query_parts.is_empty() {
            json!({ "match_all": {} })
        } else {
            json!({ "bool": { "must": query_parts } })
        };

        let mut search_body = json!({
            "query": query,
            "sort": [{ "confidence_score": { "order": "desc" } }]
        });

        if let Some(limit) = criteria.limit {
            search_body["size"] = json!(limit);
        }

        if let Some(offset) = criteria.offset {
            search_body["from"] = json!(offset);
        }

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to search threat actors: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Search failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse search response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]).clone();

        let mut actors = Vec::new();
        for hit in hits {
            let actor = Self::document_to_actor(hit)?;
            actors.push(actor);
        }

        Ok(actors)
    }

    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError> {
        let query = json!({
            "query": {
                "term": {
                    "document_type": "threat_actor"
                }
            },
            "_source": ["actor_id"],
            "size": 10000
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to list threat actor ids: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("List ids failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse list response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]).clone();

        let mut ids = Vec::new();
        for hit in hits {
            if let Some(source) = hit.get("_source") {
                if let Some(id) = source.get("actor_id").and_then(|v| v.as_str()) {
                    ids.push(id.to_string());
                }
            }
        }

        Ok(ids)
    }

    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError> {
        let response = self.client
            .delete(DeleteParts::IndexId(&self.index_name, id))
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to delete threat actor: {}", e)))?;

        let success = response.status_code().is_success();
        Ok(success)
    }

    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError> {
        let doc = Self::campaign_to_document(campaign)?;

        let response = self.client
            .index(IndexParts::IndexId(&self.index_name, &campaign.id))
            .body(doc)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store campaign: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to index campaign: {}", response.status_code())));
        }

        Ok(())
    }

    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError> {
        let response = self.client
            .get(elasticsearch::GetParts::IndexId(&self.index_name, id))
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign: {}", e)))?;

        if response.status_code() == elasticsearch::http::StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to get campaign: {}", response.status_code())));
        }

        let doc: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse response: {}", e)))?;

        let found = doc.get("found").and_then(|v| v.as_bool()).unwrap_or(false);
        if !found {
            return Ok(None);
        }

        let campaign = Self::document_to_campaign(&doc)?;
        Ok(Some(campaign))
    }

    async fn search_campaigns(&self, actor_id: Option<&str>, status: Option<CampaignStatus>) -> Result<Vec<Campaign>, StorageError> {
        let mut query_parts = vec![json!({ "term": { "document_type": "campaign" } })];

        if let Some(actor_id) = actor_id {
            query_parts.push(json!({ "term": { "actor_id": actor_id } }));
        }

        if let Some(ref status) = status {
            let status_str = serde_json::to_string(status).map_err(|e| StorageError::Serialization(format!("Failed to serialize status: {}", e)))?;
            query_parts.push(json!({ "term": { "campaign_status": status_str } }));
        }

        let query = json!({ "bool": { "must": query_parts } });

        let search_body = json!({
            "query": query,
            "size": 1000
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to search campaigns: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Search campaigns failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse search campaigns response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        let mut campaigns = Vec::new();
        for hit in hits {
            let campaign = Self::document_to_campaign(hit)?;
            campaigns.push(campaign);
        }

        Ok(campaigns)
    }

    async fn store_attribution_analysis(&self, analysis: &AttributionAnalysis) -> Result<(), StorageError> {
        let doc = json!({
            "actor_id": analysis.primary_attribution.as_ref().unwrap_or(&"unknown".to_string()),
            "primary_attribution": analysis.primary_attribution,
            "alternative_attributions": analysis.alternative_attributions,
            "confidence_score": analysis.confidence_score,
            "evidence_summary": analysis.evidence_summary,
            "analysis_timestamp": analysis.analysis_timestamp.to_rfc3339(),
            "document_type": "attribution_analysis"
        });

        let id = format!("{}_{}", analysis.primary_attribution.as_ref().unwrap_or(&"unknown".to_string()), analysis.analysis_timestamp.timestamp());

        let response = self.client
            .index(IndexParts::IndexId(&self.index_name, &id))
            .body(doc)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store attribution analysis: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to index attribution analysis: {}", response.status_code())));
        }

        Ok(())
    }

    async fn get_attribution_analysis(&self, actor_id: &str) -> Result<Vec<AttributionAnalysis>, StorageError> {
        let query = json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "document_type": "attribution_analysis" } },
                        { "term": { "actor_id": actor_id } }
                    ]
                }
            },
            "sort": [{ "analysis_timestamp": { "order": "desc" } }],
            "size": 100
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get attribution analysis: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Get attribution analysis failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse attribution analysis response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        let mut analyses = Vec::new();
        for hit in hits {
            if let Some(source) = hit.get("_source") {
                analyses.push(AttributionAnalysis {
                    primary_attribution: source.get("primary_attribution").and_then(|v| v.as_str()).map(|s| s.to_string()),
                    alternative_attributions: serde_json::from_value(source.get("alternative_attributions").cloned().unwrap_or(json!([])))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize alternative_attributions: {}", e)))?,
                    confidence_score: source.get("confidence_score").and_then(|v| v.as_f64()).unwrap_or(0.0),
                    evidence_summary: serde_json::from_value(source.get("evidence_summary").cloned().unwrap_or(json!([])))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize evidence_summary: {}", e)))?,
                    analysis_timestamp: chrono::DateTime::parse_from_rfc3339(
                        source.get("analysis_timestamp").and_then(|v| v.as_str()).unwrap_or("")
                    ).map_err(|e| StorageError::Serialization(format!("Failed to parse analysis_timestamp: {}", e)))?.with_timezone(&Utc),
                });
            }
        }

        Ok(analyses)
    }

    async fn store_behavioral_analysis(&self, analysis: &BehavioralAnalysis) -> Result<(), StorageError> {
        let doc = json!({
            "actor_id": analysis.actor_id,
            "behavioral_patterns": analysis.behavioral_patterns,
            "operational_patterns": analysis.operational_patterns,
            "evolution_analysis": analysis.evolution_analysis,
            "predictive_indicators": analysis.predictive_indicators,
            "document_type": "behavioral_analysis"
        });

        let id = format!("behavioral_{}", analysis.actor_id);

        let response = self.client
            .index(IndexParts::IndexId(&self.index_name, &id))
            .body(doc)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store behavioral analysis: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to index behavioral analysis: {}", response.status_code())));
        }

        Ok(())
    }

    async fn get_behavioral_analysis(&self, actor_id: &str) -> Result<Option<BehavioralAnalysis>, StorageError> {
        let query = json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "document_type": "behavioral_analysis" } },
                        { "term": { "actor_id": actor_id } }
                    ]
                }
            }
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get behavioral analysis: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Get behavioral analysis failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse behavioral analysis response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        if let Some(hit) = hits.first() {
            if let Some(source) = hit.get("_source") {
                return Ok(Some(BehavioralAnalysis {
                    actor_id: source.get("actor_id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    behavioral_patterns: serde_json::from_value(source.get("behavioral_patterns").cloned().unwrap_or(json!([])))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize behavioral_patterns: {}", e)))?,
                    operational_patterns: serde_json::from_value(source.get("operational_patterns").cloned().unwrap_or(json!([])))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize operational_patterns: {}", e)))?,
                    evolution_analysis: serde_json::from_value(source.get("evolution_analysis").cloned().unwrap_or(json!({})))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize evolution_analysis: {}", e)))?,
                    predictive_indicators: serde_json::from_value(source.get("predictive_indicators").cloned().unwrap_or(json!([])))
                        .map_err(|e| StorageError::Serialization(format!("Failed to deserialize predictive_indicators: {}", e)))?,
                }));
            }
        }

        Ok(None)
    }

    // Simplified implementations for other methods
    async fn store_relationships(&self, _actor_id: &str, _relationships: &[ActorRelationship]) -> Result<(), StorageError> {
        // TODO: Implement relationship storage
        Ok(())
    }

    async fn get_related_actors(&self, _actor_id: &str) -> Result<Vec<String>, StorageError> {
        // TODO: Implement relationship retrieval
        Ok(vec![])
    }

    async fn store_evidence(&self, _actor_id: &str, _evidence: &[Evidence]) -> Result<(), StorageError> {
        // TODO: Implement evidence storage
        Ok(())
    }

    async fn get_evidence(&self, _actor_id: &str) -> Result<Vec<Evidence>, StorageError> {
        // TODO: Implement evidence retrieval
        Ok(vec![])
    }

    async fn update_actor_confidence(&self, actor_id: &str, confidence: f64) -> Result<(), StorageError> {
        let script = json!({
            "script": {
                "source": "ctx._source.confidence_score = params.confidence",
                "params": {
                    "confidence": confidence
                }
            }
        });

        let response = self.client
            .update(elasticsearch::UpdateParts::IndexId(&self.index_name, actor_id))
            .body(script)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to update actor confidence: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Failed to update actor confidence: {}", response.status_code())));
        }

        Ok(())
    }

    async fn get_actors_by_type(&self, actor_type: ActorType) -> Result<Vec<ThreatActor>, StorageError> {
        let type_str = serde_json::to_string(&actor_type)
            .map_err(|e| StorageError::Serialization(format!("Failed to serialize actor_type: {}", e)))?;

        let query = json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "document_type": "threat_actor" } },
                        { "term": { "actor_type": type_str } }
                    ]
                }
            },
            "size": 1000
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get actors by type: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Get actors by type failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse actors by type response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        let mut actors = Vec::new();
        for hit in hits {
            let actor = Self::document_to_actor(hit)?;
            actors.push(actor);
        }

        Ok(actors)
    }

    async fn get_actors_by_sophistication(&self, level: SophisticationLevel) -> Result<Vec<ThreatActor>, StorageError> {
        let level_str = serde_json::to_string(&level)
            .map_err(|e| StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e)))?;

        let query = json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "document_type": "threat_actor" } },
                        { "term": { "sophistication_level": level_str } }
                    ]
                }
            },
            "size": 1000
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get actors by sophistication: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Get actors by sophistication failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse actors by sophistication response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        let mut actors = Vec::new();
        for hit in hits {
            let actor = Self::document_to_actor(hit)?;
            actors.push(actor);
        }

        Ok(actors)
    }

    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError> {
        let query = json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "document_type": "threat_actor" } },
                        { "term": { "origin_country": country } }
                    ]
                }
            },
            "size": 1000
        });

        let response = self.client
            .search(SearchParts::Index(&[&self.index_name]))
            .body(query)
            .send()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get actors by country: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(StorageError::Internal(format!("Get actors by country failed: {}", response.status_code())));
        }

        let response_body: Value = response.json().await
            .map_err(|e| StorageError::Internal(format!("Failed to parse actors by country response: {}", e)))?;

        let hits = response_body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()).unwrap_or(&vec![]);

        let mut actors = Vec::new();
        for hit in hits {
            let actor = Self::document_to_actor(hit)?;
            actors.push(actor);
        }

        Ok(actors)
    }

    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError> {
        self.search_campaigns(None, Some(CampaignStatus::Active)).await
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let threat_actor_query = json!({
            "query": { "term": { "document_type": "threat_actor" } },
            "size": 0
        });

        let campaign_query = json!({
            "query": { "term": { "document_type": "campaign" } },
            "size": 0
        });

        let attribution_query = json!({
            "query": { "term": { "document_type": "attribution_analysis" } },
            "size": 0
        });

        let behavioral_query = json!({
            "query": { "term": { "document_type": "behavioral_analysis" } },
            "size": 0
        });

        let queries = vec![
            ("threat_actors", threat_actor_query),
            ("campaigns", campaign_query),
            ("attribution_analyses", attribution_query),
            ("behavioral_analyses", behavioral_query),
        ];

        let mut threat_actor_count = 0u64;
        let mut campaign_count = 0u64;
        let mut attribution_count = 0u64;
        let mut behavioral_count = 0u64;

        for (doc_type, query) in queries {
            let response = self.client
                .search(SearchParts::Index(&[&self.index_name]))
                .body(query)
                .send()
                .await
                .map_err(|e| StorageError::Internal(format!("Failed to get {} count: {}", doc_type, e)))?;

            if response.status_code().is_success() {
                let response_body: Value = response.json().await
                    .map_err(|e| StorageError::Internal(format!("Failed to parse {} count response: {}", doc_type, e)))?;

                let count = response_body.get("hits").and_then(|h| h.get("total")).and_then(|t| t.get("value")).and_then(|v| v.as_u64()).unwrap_or(0);

                match doc_type {
                    "threat_actors" => threat_actor_count = count,
                    "campaigns" => campaign_count = count,
                    "attribution_analyses" => attribution_count = count,
                    "behavioral_analyses" => behavioral_count = count,
                    _ => {}
                }
            }
        }

        Ok(StorageStatistics {
            threat_actor_count,
            campaign_count,
            attribution_analysis_count: attribution_count,
            behavioral_analysis_count: behavioral_count,
            total_size_bytes: 0, // Would need to calculate actual index size
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // Elasticsearch client will be closed when dropped
        Ok(())
    }
}