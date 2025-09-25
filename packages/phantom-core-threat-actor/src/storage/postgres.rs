// phantom-threat-actor-core/src/storage/postgres.rs
// PostgreSQL storage implementation for Threat Actor Core

use super::traits::*;
use crate::models::*;
use async_trait::async_trait;
use chrono::Utc;
use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod};
use std::collections::HashMap;
use tokio_postgres::{NoTls, Row};

pub struct PostgresStorage {
    pool: Pool,
}

impl PostgresStorage {
    /// Create a new PostgreSQL storage instance
    pub async fn new(connection_string: &str) -> Result<Self, StorageError> {
        let mut cfg = Config::new();
        cfg.url = Some(connection_string.to_string());
        cfg.manager = Some(ManagerConfig {
            recycling_method: RecyclingMethod::Fast,
        });

        let pool = cfg
            .create_pool(None, NoTls)
            .map_err(|e| StorageError::Connection(format!("Failed to create pool: {}", e)))?;

        let storage = Self { pool };
        storage.initialize_database().await?;
        Ok(storage)
    }

    /// Initialize database schema
    async fn initialize_database(&self) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        // Create threat_actors table
        client
            .execute(
                "
            CREATE TABLE IF NOT EXISTS threat_actors (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                aliases JSONB,
                actor_type TEXT NOT NULL,
                sophistication_level TEXT NOT NULL,
                motivation JSONB,
                origin_country TEXT,
                first_observed TIMESTAMPTZ NOT NULL,
                last_activity TIMESTAMPTZ NOT NULL,
                status TEXT NOT NULL,
                confidence_score DOUBLE PRECISION NOT NULL,
                attribution_confidence DOUBLE PRECISION NOT NULL,
                capabilities JSONB,
                infrastructure JSONB,
                tactics JSONB,
                techniques JSONB,
                procedures JSONB,
                targets JSONB,
                campaigns JSONB,
                associated_malware JSONB,
                iocs JSONB,
                relationships JSONB,
                metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ",
                &[],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to create threat_actors table: {}", e))
            })?;

        // Create campaigns table
        client
            .execute(
                "
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                actor_id TEXT NOT NULL REFERENCES threat_actors(id) ON DELETE CASCADE,
                start_date TIMESTAMPTZ NOT NULL,
                end_date TIMESTAMPTZ,
                status TEXT NOT NULL,
                objectives JSONB,
                targets JSONB,
                ttps JSONB,
                malware_families JSONB,
                iocs JSONB,
                impact_assessment JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ",
                &[],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to create campaigns table: {}", e))
            })?;

        // Create attribution_analyses table
        client
            .execute(
                "
            CREATE TABLE IF NOT EXISTS attribution_analyses (
                id SERIAL PRIMARY KEY,
                actor_id TEXT NOT NULL REFERENCES threat_actors(id) ON DELETE CASCADE,
                primary_attribution TEXT,
                alternative_attributions JSONB,
                confidence_score DOUBLE PRECISION NOT NULL,
                evidence_summary JSONB,
                analysis_timestamp TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        ",
                &[],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!(
                    "Failed to create attribution_analyses table: {}",
                    e
                ))
            })?;

        // Create behavioral_analyses table
        client
            .execute(
                "
            CREATE TABLE IF NOT EXISTS behavioral_analyses (
                actor_id TEXT PRIMARY KEY REFERENCES threat_actors(id) ON DELETE CASCADE,
                behavioral_patterns JSONB,
                operational_patterns JSONB,
                evolution_analysis JSONB,
                predictive_indicators JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        ",
                &[],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to create behavioral_analyses table: {}", e))
            })?;

        // Create indexes for better performance
        client
            .execute(
                "CREATE INDEX IF NOT EXISTS idx_threat_actors_type ON threat_actors(actor_type)",
                &[],
            )
            .await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_threat_actors_country ON threat_actors(origin_country)", &[]).await?;
        client
            .execute(
                "CREATE INDEX IF NOT EXISTS idx_threat_actors_status ON threat_actors(status)",
                &[],
            )
            .await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_threat_actors_confidence ON threat_actors(confidence_score)", &[]).await?;
        client
            .execute(
                "CREATE INDEX IF NOT EXISTS idx_campaigns_actor_id ON campaigns(actor_id)",
                &[],
            )
            .await?;
        client
            .execute(
                "CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)",
                &[],
            )
            .await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_attribution_analyses_actor_id ON attribution_analyses(actor_id)", &[]).await?;

        Ok(())
    }

    /// Convert database row to ThreatActor
    fn row_to_threat_actor(row: &Row) -> Result<ThreatActor, StorageError> {
        Ok(ThreatActor {
            id: row
                .try_get("id")
                .map_err(|e| StorageError::Serialization(format!("Failed to get id: {}", e)))?,
            name: row
                .try_get("name")
                .map_err(|e| StorageError::Serialization(format!("Failed to get name: {}", e)))?,
            aliases: serde_json::from_value(row.try_get("aliases").map_err(|e| {
                StorageError::Serialization(format!("Failed to get aliases: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize aliases: {}", e))
            })?,
            actor_type: serde_json::from_value(row.try_get("actor_type").map_err(|e| {
                StorageError::Serialization(format!("Failed to get actor_type: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize actor_type: {}", e))
            })?,
            sophistication_level: serde_json::from_value(
                row.try_get("sophistication_level").map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to get sophistication_level: {}",
                        e
                    ))
                })?,
            )
            .map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize sophistication_level: {}",
                    e
                ))
            })?,
            motivation: serde_json::from_value(row.try_get("motivation").map_err(|e| {
                StorageError::Serialization(format!("Failed to get motivation: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize motivation: {}", e))
            })?,
            origin_country: row.try_get("origin_country").map_err(|e| {
                StorageError::Serialization(format!("Failed to get origin_country: {}", e))
            })?,
            first_observed: row.try_get("first_observed").map_err(|e| {
                StorageError::Serialization(format!("Failed to get first_observed: {}", e))
            })?,
            last_activity: row.try_get("last_activity").map_err(|e| {
                StorageError::Serialization(format!("Failed to get last_activity: {}", e))
            })?,
            status: serde_json::from_value(row.try_get("status").map_err(|e| {
                StorageError::Serialization(format!("Failed to get status: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize status: {}", e))
            })?,
            confidence_score: row.try_get("confidence_score").map_err(|e| {
                StorageError::Serialization(format!("Failed to get confidence_score: {}", e))
            })?,
            attribution_confidence: row.try_get("attribution_confidence").map_err(|e| {
                StorageError::Serialization(format!("Failed to get attribution_confidence: {}", e))
            })?,
            capabilities: serde_json::from_value(row.try_get("capabilities").map_err(|e| {
                StorageError::Serialization(format!("Failed to get capabilities: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize capabilities: {}", e))
            })?,
            infrastructure: serde_json::from_value(row.try_get("infrastructure").map_err(|e| {
                StorageError::Serialization(format!("Failed to get infrastructure: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize infrastructure: {}", e))
            })?,
            tactics: serde_json::from_value(row.try_get("tactics").map_err(|e| {
                StorageError::Serialization(format!("Failed to get tactics: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize tactics: {}", e))
            })?,
            techniques: serde_json::from_value(row.try_get("techniques").map_err(|e| {
                StorageError::Serialization(format!("Failed to get techniques: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize techniques: {}", e))
            })?,
            procedures: serde_json::from_value(row.try_get("procedures").map_err(|e| {
                StorageError::Serialization(format!("Failed to get procedures: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize procedures: {}", e))
            })?,
            targets: serde_json::from_value(row.try_get("targets").map_err(|e| {
                StorageError::Serialization(format!("Failed to get targets: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize targets: {}", e))
            })?,
            campaigns: serde_json::from_value(row.try_get("campaigns").map_err(|e| {
                StorageError::Serialization(format!("Failed to get campaigns: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize campaigns: {}", e))
            })?,
            associated_malware: serde_json::from_value(row.try_get("associated_malware").map_err(
                |e| StorageError::Serialization(format!("Failed to get associated_malware: {}", e)),
            )?)
            .map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize associated_malware: {}",
                    e
                ))
            })?,
            iocs: serde_json::from_value(
                row.try_get("iocs").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get iocs: {}", e))
                })?,
            )
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize iocs: {}", e))
            })?,
            relationships: serde_json::from_value(row.try_get("relationships").map_err(|e| {
                StorageError::Serialization(format!("Failed to get relationships: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize relationships: {}", e))
            })?,
            metadata: serde_json::from_value(row.try_get("metadata").map_err(|e| {
                StorageError::Serialization(format!("Failed to get metadata: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize metadata: {}", e))
            })?,
        })
    }

    /// Convert database row to Campaign
    fn row_to_campaign(row: &Row) -> Result<Campaign, StorageError> {
        Ok(Campaign {
            id: row
                .try_get("id")
                .map_err(|e| StorageError::Serialization(format!("Failed to get id: {}", e)))?,
            name: row
                .try_get("name")
                .map_err(|e| StorageError::Serialization(format!("Failed to get name: {}", e)))?,
            actor_id: row.try_get("actor_id").map_err(|e| {
                StorageError::Serialization(format!("Failed to get actor_id: {}", e))
            })?,
            start_date: row.try_get("start_date").map_err(|e| {
                StorageError::Serialization(format!("Failed to get start_date: {}", e))
            })?,
            end_date: row.try_get("end_date").map_err(|e| {
                StorageError::Serialization(format!("Failed to get end_date: {}", e))
            })?,
            status: serde_json::from_value(row.try_get("status").map_err(|e| {
                StorageError::Serialization(format!("Failed to get status: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize status: {}", e))
            })?,
            objectives: serde_json::from_value(row.try_get("objectives").map_err(|e| {
                StorageError::Serialization(format!("Failed to get objectives: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize objectives: {}", e))
            })?,
            targets: serde_json::from_value(row.try_get("targets").map_err(|e| {
                StorageError::Serialization(format!("Failed to get targets: {}", e))
            })?)
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize targets: {}", e))
            })?,
            ttps: serde_json::from_value(
                row.try_get("ttps").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get ttps: {}", e))
                })?,
            )
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize ttps: {}", e))
            })?,
            malware_families: serde_json::from_value(row.try_get("malware_families").map_err(
                |e| StorageError::Serialization(format!("Failed to get malware_families: {}", e)),
            )?)
            .map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize malware_families: {}",
                    e
                ))
            })?,
            iocs: serde_json::from_value(
                row.try_get("iocs").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get iocs: {}", e))
                })?,
            )
            .map_err(|e| {
                StorageError::Serialization(format!("Failed to deserialize iocs: {}", e))
            })?,
            impact_assessment: serde_json::from_value(row.try_get("impact_assessment").map_err(
                |e| StorageError::Serialization(format!("Failed to get impact_assessment: {}", e)),
            )?)
            .map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to deserialize impact_assessment: {}",
                    e
                ))
            })?,
        })
    }
}

#[async_trait]
impl ThreatActorStorage for PostgresStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Database schema is already initialized in new()
        Ok(())
    }

    async fn health_check(&self) -> Result<HealthStatus, StorageError> {
        let start = std::time::Instant::now();

        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        // Simple health check query
        let row = client
            .query_one("SELECT COUNT(*) as count FROM threat_actors", &[])
            .await
            .map_err(|e| StorageError::Internal(format!("Health check query failed: {}", e)))?;

        let count: i64 = row
            .try_get("count")
            .map_err(|e| StorageError::Internal(format!("Failed to get count: {}", e)))?;

        let response_time = start.elapsed().as_millis() as u64;

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "postgresql".to_string());
                metadata.insert("threat_actor_count".to_string(), count.to_string());
                metadata
            },
        })
    }

    async fn store_threat_actor(&self, actor: &ThreatActor) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        client.execute("
            INSERT INTO threat_actors (
                id, name, aliases, actor_type, sophistication_level, motivation,
                origin_country, first_observed, last_activity, status,
                confidence_score, attribution_confidence, capabilities,
                infrastructure, tactics, techniques, procedures, targets,
                campaigns, associated_malware, iocs, relationships, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                aliases = EXCLUDED.aliases,
                actor_type = EXCLUDED.actor_type,
                sophistication_level = EXCLUDED.sophistication_level,
                motivation = EXCLUDED.motivation,
                origin_country = EXCLUDED.origin_country,
                last_activity = EXCLUDED.last_activity,
                status = EXCLUDED.status,
                confidence_score = EXCLUDED.confidence_score,
                attribution_confidence = EXCLUDED.attribution_confidence,
                capabilities = EXCLUDED.capabilities,
                infrastructure = EXCLUDED.infrastructure,
                tactics = EXCLUDED.tactics,
                techniques = EXCLUDED.techniques,
                procedures = EXCLUDED.procedures,
                targets = EXCLUDED.targets,
                campaigns = EXCLUDED.campaigns,
                associated_malware = EXCLUDED.associated_malware,
                iocs = EXCLUDED.iocs,
                relationships = EXCLUDED.relationships,
                metadata = EXCLUDED.metadata,
                updated_at = NOW()
        ", &[
            &actor.id,
            &actor.name,
            &serde_json::to_value(&actor.aliases).map_err(|e| StorageError::Serialization(format!("Failed to serialize aliases: {}", e)))?,
            &serde_json::to_value(&actor.actor_type).map_err(|e| StorageError::Serialization(format!("Failed to serialize actor_type: {}", e)))?,
            &serde_json::to_value(&actor.sophistication_level).map_err(|e| StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e)))?,
            &serde_json::to_value(&actor.motivation).map_err(|e| StorageError::Serialization(format!("Failed to serialize motivation: {}", e)))?,
            &actor.origin_country,
            &actor.first_observed,
            &actor.last_activity,
            &serde_json::to_value(&actor.status).map_err(|e| StorageError::Serialization(format!("Failed to serialize status: {}", e)))?,
            &actor.confidence_score,
            &actor.attribution_confidence,
            &serde_json::to_value(&actor.capabilities).map_err(|e| StorageError::Serialization(format!("Failed to serialize capabilities: {}", e)))?,
            &serde_json::to_value(&actor.infrastructure).map_err(|e| StorageError::Serialization(format!("Failed to serialize infrastructure: {}", e)))?,
            &serde_json::to_value(&actor.tactics).map_err(|e| StorageError::Serialization(format!("Failed to serialize tactics: {}", e)))?,
            &serde_json::to_value(&actor.techniques).map_err(|e| StorageError::Serialization(format!("Failed to serialize techniques: {}", e)))?,
            &serde_json::to_value(&actor.procedures).map_err(|e| StorageError::Serialization(format!("Failed to serialize procedures: {}", e)))?,
            &serde_json::to_value(&actor.targets).map_err(|e| StorageError::Serialization(format!("Failed to serialize targets: {}", e)))?,
            &serde_json::to_value(&actor.campaigns).map_err(|e| StorageError::Serialization(format!("Failed to serialize campaigns: {}", e)))?,
            &serde_json::to_value(&actor.associated_malware).map_err(|e| StorageError::Serialization(format!("Failed to serialize associated_malware: {}", e)))?,
            &serde_json::to_value(&actor.iocs).map_err(|e| StorageError::Serialization(format!("Failed to serialize iocs: {}", e)))?,
            &serde_json::to_value(&actor.relationships).map_err(|e| StorageError::Serialization(format!("Failed to serialize relationships: {}", e)))?,
            &serde_json::to_value(&actor.metadata).map_err(|e| StorageError::Serialization(format!("Failed to serialize metadata: {}", e)))?,
        ]).await.map_err(|e| StorageError::Internal(format!("Failed to store threat actor: {}", e)))?;

        Ok(())
    }

    async fn store_threat_actor_batch(&self, actors: &[ThreatActor]) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let transaction = client
            .transaction()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to start transaction: {}", e)))?;

        for actor in actors {
            transaction.execute("
                INSERT INTO threat_actors (
                    id, name, aliases, actor_type, sophistication_level, motivation,
                    origin_country, first_observed, last_activity, status,
                    confidence_score, attribution_confidence, capabilities,
                    infrastructure, tactics, techniques, procedures, targets,
                    campaigns, associated_malware, iocs, relationships, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    aliases = EXCLUDED.aliases,
                    actor_type = EXCLUDED.actor_type,
                    sophistication_level = EXCLUDED.sophistication_level,
                    motivation = EXCLUDED.motivation,
                    origin_country = EXCLUDED.origin_country,
                    last_activity = EXCLUDED.last_activity,
                    status = EXCLUDED.status,
                    confidence_score = EXCLUDED.confidence_score,
                    attribution_confidence = EXCLUDED.attribution_confidence,
                    capabilities = EXCLUDED.capabilities,
                    infrastructure = EXCLUDED.infrastructure,
                    tactics = EXCLUDED.tactics,
                    techniques = EXCLUDED.techniques,
                    procedures = EXCLUDED.procedures,
                    targets = EXCLUDED.targets,
                    campaigns = EXCLUDED.campaigns,
                    associated_malware = EXCLUDED.associated_malware,
                    iocs = EXCLUDED.iocs,
                    relationships = EXCLUDED.relationships,
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
            ", &[
                &actor.id,
                &actor.name,
                &serde_json::to_value(&actor.aliases).map_err(|e| StorageError::Serialization(format!("Failed to serialize aliases: {}", e)))?,
                &serde_json::to_value(&actor.actor_type).map_err(|e| StorageError::Serialization(format!("Failed to serialize actor_type: {}", e)))?,
                &serde_json::to_value(&actor.sophistication_level).map_err(|e| StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e)))?,
                &serde_json::to_value(&actor.motivation).map_err(|e| StorageError::Serialization(format!("Failed to serialize motivation: {}", e)))?,
                &actor.origin_country,
                &actor.first_observed,
                &actor.last_activity,
                &serde_json::to_value(&actor.status).map_err(|e| StorageError::Serialization(format!("Failed to serialize status: {}", e)))?,
                &actor.confidence_score,
                &actor.attribution_confidence,
                &serde_json::to_value(&actor.capabilities).map_err(|e| StorageError::Serialization(format!("Failed to serialize capabilities: {}", e)))?,
                &serde_json::to_value(&actor.infrastructure).map_err(|e| StorageError::Serialization(format!("Failed to serialize infrastructure: {}", e)))?,
                &serde_json::to_value(&actor.tactics).map_err(|e| StorageError::Serialization(format!("Failed to serialize tactics: {}", e)))?,
                &serde_json::to_value(&actor.techniques).map_err(|e| StorageError::Serialization(format!("Failed to serialize techniques: {}", e)))?,
                &serde_json::to_value(&actor.procedures).map_err(|e| StorageError::Serialization(format!("Failed to serialize procedures: {}", e)))?,
                &serde_json::to_value(&actor.targets).map_err(|e| StorageError::Serialization(format!("Failed to serialize targets: {}", e)))?,
                &serde_json::to_value(&actor.campaigns).map_err(|e| StorageError::Serialization(format!("Failed to serialize campaigns: {}", e)))?,
                &serde_json::to_value(&actor.associated_malware).map_err(|e| StorageError::Serialization(format!("Failed to serialize associated_malware: {}", e)))?,
                &serde_json::to_value(&actor.iocs).map_err(|e| StorageError::Serialization(format!("Failed to serialize iocs: {}", e)))?,
                &serde_json::to_value(&actor.relationships).map_err(|e| StorageError::Serialization(format!("Failed to serialize relationships: {}", e)))?,
                &serde_json::to_value(&actor.metadata).map_err(|e| StorageError::Serialization(format!("Failed to serialize metadata: {}", e)))?,
            ]).await.map_err(|e| StorageError::Internal(format!("Failed to store threat actor in batch: {}", e)))?;
        }

        transaction
            .commit()
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to commit transaction: {}", e)))?;

        Ok(())
    }

    async fn get_threat_actor(&self, id: &str) -> Result<Option<ThreatActor>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let row = client
            .query_opt(
                "
            SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                   origin_country, first_observed, last_activity, status,
                   confidence_score, attribution_confidence, capabilities,
                   infrastructure, tactics, techniques, procedures, targets,
                   campaigns, associated_malware, iocs, relationships, metadata
            FROM threat_actors WHERE id = $1
        ",
                &[&id],
            )
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get threat actor: {}", e)))?;

        match row {
            Some(row) => Ok(Some(Self::row_to_threat_actor(&row)?)),
            None => Ok(None),
        }
    }

    async fn get_threat_actor_batch(
        &self,
        ids: &[String],
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let ids_json = serde_json::to_value(ids)
            .map_err(|e| StorageError::Serialization(format!("Failed to serialize ids: {}", e)))?;

        let rows = client
            .query(
                "
            SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                   origin_country, first_observed, last_activity, status,
                   confidence_score, attribution_confidence, capabilities,
                   infrastructure, tactics, techniques, procedures, targets,
                   campaigns, associated_malware, iocs, relationships, metadata
            FROM threat_actors WHERE id = ANY($1)
        ",
                &[&ids_json],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actors batch: {}", e))
            })?;

        let mut actors = Vec::new();
        for row in rows {
            actors.push(Self::row_to_threat_actor(&row)?);
        }

        Ok(actors)
    }

    async fn search_threat_actors(
        &self,
        criteria: &ThreatActorSearchCriteria,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let mut query = "SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                                origin_country, first_observed, last_activity, status,
                                confidence_score, attribution_confidence, capabilities,
                                infrastructure, tactics, techniques, procedures, targets,
                                campaigns, associated_malware, iocs, relationships, metadata
                         FROM threat_actors WHERE 1=1"
            .to_string();
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = Vec::new();
        let mut param_count = 0;

        // Build WHERE clause based on criteria
        if let Some(ref actor_types) = criteria.actor_types {
            param_count += 1;
            query.push_str(&format!(" AND actor_type = ANY(${})", param_count));
            let types_json = serde_json::to_value(actor_types).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize actor_types: {}", e))
            })?;
            params.push(&types_json);
        }

        if let Some(ref sophistication_levels) = criteria.sophistication_levels {
            param_count += 1;
            query.push_str(&format!(
                " AND sophistication_level = ANY(${})",
                param_count
            ));
            let levels_json = serde_json::to_value(sophistication_levels).map_err(|e| {
                StorageError::Serialization(format!(
                    "Failed to serialize sophistication_levels: {}",
                    e
                ))
            })?;
            params.push(&levels_json);
        }

        if let Some(ref origin_countries) = criteria.origin_countries {
            param_count += 1;
            query.push_str(&format!(" AND origin_country = ANY(${})", param_count));
            let countries_json = serde_json::to_value(origin_countries).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize origin_countries: {}", e))
            })?;
            params.push(&countries_json);
        }

        if let Some(ref activity_status) = criteria.activity_status {
            param_count += 1;
            query.push_str(&format!(" AND status = ANY(${})", param_count));
            let status_json = serde_json::to_value(activity_status).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize activity_status: {}", e))
            })?;
            params.push(&status_json);
        }

        if let Some(confidence_min) = criteria.confidence_min {
            param_count += 1;
            query.push_str(&format!(" AND confidence_score >= ${}", param_count));
            params.push(&confidence_min);
        }

        if let Some(confidence_max) = criteria.confidence_max {
            param_count += 1;
            query.push_str(&format!(" AND confidence_score <= ${}", param_count));
            params.push(&confidence_max);
        }

        if let Some(after) = criteria.first_observed_after {
            param_count += 1;
            query.push_str(&format!(" AND first_observed >= ${}", param_count));
            params.push(&after);
        }

        if let Some(before) = criteria.first_observed_before {
            param_count += 1;
            query.push_str(&format!(" AND first_observed <= ${}", param_count));
            params.push(&before);
        }

        if let Some(after) = criteria.last_activity_after {
            param_count += 1;
            query.push_str(&format!(" AND last_activity >= ${}", param_count));
            params.push(&after);
        }

        if let Some(before) = criteria.last_activity_before {
            param_count += 1;
            query.push_str(&format!(" AND last_activity <= ${}", param_count));
            params.push(&before);
        }

        // Add LIMIT and OFFSET
        if let Some(limit) = criteria.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        if let Some(offset) = criteria.offset {
            query.push_str(&format!(" OFFSET {}", offset));
        }

        let rows = client.query(&query, &params).await.map_err(|e| {
            StorageError::Internal(format!("Failed to search threat actors: {}", e))
        })?;

        let mut actors = Vec::new();
        for row in rows {
            actors.push(Self::row_to_threat_actor(&row)?);
        }

        Ok(actors)
    }

    async fn list_threat_actor_ids(&self) -> Result<Vec<String>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let rows = client
            .query("SELECT id FROM threat_actors ORDER BY id", &[])
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to list threat actor ids: {}", e))
            })?;

        let mut ids = Vec::new();
        for row in rows {
            ids.push(
                row.try_get("id")
                    .map_err(|e| StorageError::Serialization(format!("Failed to get id: {}", e)))?,
            );
        }

        Ok(ids)
    }

    async fn delete_threat_actor(&self, id: &str) -> Result<bool, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let result = client
            .execute("DELETE FROM threat_actors WHERE id = $1", &[&id])
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to delete threat actor: {}", e)))?;

        Ok(result > 0)
    }

    async fn store_campaign(&self, campaign: &Campaign) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        client
            .execute(
                "
            INSERT INTO campaigns (
                id, name, actor_id, start_date, end_date, status,
                objectives, targets, ttps, malware_families, iocs, impact_assessment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                end_date = EXCLUDED.end_date,
                status = EXCLUDED.status,
                objectives = EXCLUDED.objectives,
                targets = EXCLUDED.targets,
                ttps = EXCLUDED.ttps,
                malware_families = EXCLUDED.malware_families,
                iocs = EXCLUDED.iocs,
                impact_assessment = EXCLUDED.impact_assessment,
                updated_at = NOW()
        ",
                &[
                    &campaign.id,
                    &campaign.name,
                    &campaign.actor_id,
                    &campaign.start_date,
                    &campaign.end_date,
                    &serde_json::to_value(&campaign.status).map_err(|e| {
                        StorageError::Serialization(format!("Failed to serialize status: {}", e))
                    })?,
                    &serde_json::to_value(&campaign.objectives).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize objectives: {}",
                            e
                        ))
                    })?,
                    &serde_json::to_value(&campaign.targets).map_err(|e| {
                        StorageError::Serialization(format!("Failed to serialize targets: {}", e))
                    })?,
                    &serde_json::to_value(&campaign.ttps).map_err(|e| {
                        StorageError::Serialization(format!("Failed to serialize ttps: {}", e))
                    })?,
                    &serde_json::to_value(&campaign.malware_families).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize malware_families: {}",
                            e
                        ))
                    })?,
                    &serde_json::to_value(&campaign.iocs).map_err(|e| {
                        StorageError::Serialization(format!("Failed to serialize iocs: {}", e))
                    })?,
                    &serde_json::to_value(&campaign.impact_assessment).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize impact_assessment: {}",
                            e
                        ))
                    })?,
                ],
            )
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to store campaign: {}", e)))?;

        Ok(())
    }

    async fn get_campaign(&self, id: &str) -> Result<Option<Campaign>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let row = client
            .query_opt(
                "
            SELECT id, name, actor_id, start_date, end_date, status,
                   objectives, targets, ttps, malware_families, iocs, impact_assessment
            FROM campaigns WHERE id = $1
        ",
                &[&id],
            )
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign: {}", e)))?;

        match row {
            Some(row) => Ok(Some(Self::row_to_campaign(&row)?)),
            None => Ok(None),
        }
    }

    async fn search_campaigns(
        &self,
        actor_id: Option<&str>,
        status: Option<CampaignStatus>,
    ) -> Result<Vec<Campaign>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let mut query = "SELECT id, name, actor_id, start_date, end_date, status,
                                objectives, targets, ttps, malware_families, iocs, impact_assessment
                         FROM campaigns WHERE 1=1"
            .to_string();
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = Vec::new();

        if let Some(actor_id) = actor_id {
            query.push_str(" AND actor_id = $1");
            params.push(&actor_id);
        }

        if let Some(ref status) = status {
            query.push_str(" AND status = $2");
            let status_json = serde_json::to_value(status).map_err(|e| {
                StorageError::Serialization(format!("Failed to serialize status: {}", e))
            })?;
            params.push(&status_json);
        }

        let rows = client
            .query(&query, &params)
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to search campaigns: {}", e)))?;

        let mut campaigns = Vec::new();
        for row in rows {
            campaigns.push(Self::row_to_campaign(&row)?);
        }

        Ok(campaigns)
    }

    async fn store_attribution_analysis(
        &self,
        analysis: &AttributionAnalysis,
    ) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let actor_id = analysis
            .primary_attribution
            .as_ref()
            .unwrap_or(&"unknown".to_string());

        client
            .execute(
                "
            INSERT INTO attribution_analyses (
                actor_id, primary_attribution, alternative_attributions,
                confidence_score, evidence_summary, analysis_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6)
        ",
                &[
                    &actor_id,
                    &analysis.primary_attribution,
                    &serde_json::to_value(&analysis.alternative_attributions).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize alternative_attributions: {}",
                            e
                        ))
                    })?,
                    &analysis.confidence_score,
                    &serde_json::to_value(&analysis.evidence_summary).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize evidence_summary: {}",
                            e
                        ))
                    })?,
                    &analysis.analysis_timestamp,
                ],
            )
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
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let rows = client
            .query(
                "
            SELECT primary_attribution, alternative_attributions, confidence_score,
                   evidence_summary, analysis_timestamp
            FROM attribution_analyses WHERE actor_id = $1 ORDER BY analysis_timestamp DESC
        ",
                &[&actor_id],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get attribution analysis: {}", e))
            })?;

        let mut analyses = Vec::new();
        for row in rows {
            analyses.push(AttributionAnalysis {
                primary_attribution: row.try_get("primary_attribution").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get primary_attribution: {}", e))
                })?,
                alternative_attributions: serde_json::from_value(
                    row.try_get("alternative_attributions").map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to get alternative_attributions: {}",
                            e
                        ))
                    })?,
                )
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize alternative_attributions: {}",
                        e
                    ))
                })?,
                confidence_score: row.try_get("confidence_score").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get confidence_score: {}", e))
                })?,
                evidence_summary: serde_json::from_value(row.try_get("evidence_summary").map_err(
                    |e| {
                        StorageError::Serialization(format!(
                            "Failed to get evidence_summary: {}",
                            e
                        ))
                    },
                )?)
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize evidence_summary: {}",
                        e
                    ))
                })?,
                analysis_timestamp: row.try_get("analysis_timestamp").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get analysis_timestamp: {}", e))
                })?,
            });
        }

        Ok(analyses)
    }

    async fn store_behavioral_analysis(
        &self,
        analysis: &BehavioralAnalysis,
    ) -> Result<(), StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        client
            .execute(
                "
            INSERT INTO behavioral_analyses (
                actor_id, behavioral_patterns, operational_patterns,
                evolution_analysis, predictive_indicators
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (actor_id) DO UPDATE SET
                behavioral_patterns = EXCLUDED.behavioral_patterns,
                operational_patterns = EXCLUDED.operational_patterns,
                evolution_analysis = EXCLUDED.evolution_analysis,
                predictive_indicators = EXCLUDED.predictive_indicators,
                updated_at = NOW()
        ",
                &[
                    &analysis.actor_id,
                    &serde_json::to_value(&analysis.behavioral_patterns).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize behavioral_patterns: {}",
                            e
                        ))
                    })?,
                    &serde_json::to_value(&analysis.operational_patterns).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize operational_patterns: {}",
                            e
                        ))
                    })?,
                    &serde_json::to_value(&analysis.evolution_analysis).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize evolution_analysis: {}",
                            e
                        ))
                    })?,
                    &serde_json::to_value(&analysis.predictive_indicators).map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to serialize predictive_indicators: {}",
                            e
                        ))
                    })?,
                ],
            )
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
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let row = client
            .query_opt(
                "
            SELECT actor_id, behavioral_patterns, operational_patterns,
                   evolution_analysis, predictive_indicators
            FROM behavioral_analyses WHERE actor_id = $1
        ",
                &[&actor_id],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get behavioral analysis: {}", e))
            })?;

        match row {
            Some(row) => Ok(Some(BehavioralAnalysis {
                actor_id: row.try_get("actor_id").map_err(|e| {
                    StorageError::Serialization(format!("Failed to get actor_id: {}", e))
                })?,
                behavioral_patterns: serde_json::from_value(
                    row.try_get("behavioral_patterns").map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to get behavioral_patterns: {}",
                            e
                        ))
                    })?,
                )
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize behavioral_patterns: {}",
                        e
                    ))
                })?,
                operational_patterns: serde_json::from_value(
                    row.try_get("operational_patterns").map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to get operational_patterns: {}",
                            e
                        ))
                    })?,
                )
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize operational_patterns: {}",
                        e
                    ))
                })?,
                evolution_analysis: serde_json::from_value(
                    row.try_get("evolution_analysis").map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to get evolution_analysis: {}",
                            e
                        ))
                    })?,
                )
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize evolution_analysis: {}",
                        e
                    ))
                })?,
                predictive_indicators: serde_json::from_value(
                    row.try_get("predictive_indicators").map_err(|e| {
                        StorageError::Serialization(format!(
                            "Failed to get predictive_indicators: {}",
                            e
                        ))
                    })?,
                )
                .map_err(|e| {
                    StorageError::Serialization(format!(
                        "Failed to deserialize predictive_indicators: {}",
                        e
                    ))
                })?,
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
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        client
            .execute(
                "UPDATE threat_actors SET confidence_score = $1, updated_at = NOW() WHERE id = $2",
                &[&confidence, &actor_id],
            )
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
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let type_json = serde_json::to_value(&actor_type).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize actor_type: {}", e))
        })?;

        let rows = client
            .query(
                "
            SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                   origin_country, first_observed, last_activity, status,
                   confidence_score, attribution_confidence, capabilities,
                   infrastructure, tactics, techniques, procedures, targets,
                   campaigns, associated_malware, iocs, relationships, metadata
            FROM threat_actors WHERE actor_type = $1
        ",
                &[&type_json],
            )
            .await
            .map_err(|e| StorageError::Internal(format!("Failed to get actors by type: {}", e)))?;

        let mut actors = Vec::new();
        for row in rows {
            actors.push(Self::row_to_threat_actor(&row)?);
        }

        Ok(actors)
    }

    async fn get_actors_by_sophistication(
        &self,
        level: SophisticationLevel,
    ) -> Result<Vec<ThreatActor>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let level_json = serde_json::to_value(&level).map_err(|e| {
            StorageError::Serialization(format!("Failed to serialize sophistication_level: {}", e))
        })?;

        let rows = client
            .query(
                "
            SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                   origin_country, first_observed, last_activity, status,
                   confidence_score, attribution_confidence, capabilities,
                   infrastructure, tactics, techniques, procedures, targets,
                   campaigns, associated_malware, iocs, relationships, metadata
            FROM threat_actors WHERE sophistication_level = $1
        ",
                &[&level_json],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get actors by sophistication: {}", e))
            })?;

        let mut actors = Vec::new();
        for row in rows {
            actors.push(Self::row_to_threat_actor(&row)?);
        }

        Ok(actors)
    }

    async fn get_actors_by_country(&self, country: &str) -> Result<Vec<ThreatActor>, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let rows = client
            .query(
                "
            SELECT id, name, aliases, actor_type, sophistication_level, motivation,
                   origin_country, first_observed, last_activity, status,
                   confidence_score, attribution_confidence, capabilities,
                   infrastructure, tactics, techniques, procedures, targets,
                   campaigns, associated_malware, iocs, relationships, metadata
            FROM threat_actors WHERE origin_country = $1
        ",
                &[&country],
            )
            .await
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get actors by country: {}", e))
            })?;

        let mut actors = Vec::new();
        for row in rows {
            actors.push(Self::row_to_threat_actor(&row)?);
        }

        Ok(actors)
    }

    async fn get_active_campaigns(&self) -> Result<Vec<Campaign>, StorageError> {
        self.search_campaigns(None, Some(CampaignStatus::Active))
            .await
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let client = self
            .pool
            .get()
            .await
            .map_err(|e| StorageError::Connection(format!("Failed to get client: {}", e)))?;

        let threat_actor_count: i64 = client
            .query_one("SELECT COUNT(*) FROM threat_actors", &[])
            .await?
            .try_get(0)
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get threat actor count: {}", e))
            })?;

        let campaign_count: i64 = client
            .query_one("SELECT COUNT(*) FROM campaigns", &[])
            .await?
            .try_get(0)
            .map_err(|e| StorageError::Internal(format!("Failed to get campaign count: {}", e)))?;

        let attribution_count: i64 = client
            .query_one("SELECT COUNT(*) FROM attribution_analyses", &[])
            .await?
            .try_get(0)
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get attribution count: {}", e))
            })?;

        let behavioral_count: i64 = client
            .query_one("SELECT COUNT(*) FROM behavioral_analyses", &[])
            .await?
            .try_get(0)
            .map_err(|e| {
                StorageError::Internal(format!("Failed to get behavioral count: {}", e))
            })?;

        Ok(StorageStatistics {
            threat_actor_count: threat_actor_count as u64,
            campaign_count: campaign_count as u64,
            attribution_analysis_count: attribution_count as u64,
            behavioral_analysis_count: behavioral_count as u64,
            total_size_bytes: 0, // Would need to calculate actual database size
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // Connection pool will be closed when dropped
        Ok(())
    }
}
