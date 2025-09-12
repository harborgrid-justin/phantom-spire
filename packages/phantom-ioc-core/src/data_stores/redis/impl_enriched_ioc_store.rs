//! EnrichedIOCStore Trait Implementation
//!
//! Implementation of the EnrichedIOCStore trait for Redis.

use async_trait::async_trait;
use redis::AsyncCommands;
use uuid::Uuid;
use serde_json;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::EnrichedIOCStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;
use super::keys::enriched_key;

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl EnrichedIOCStore for RedisDataStore {
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = enriched_key(&self.config.key_prefix, &context.tenant_id, &enriched.base_ioc.id);

        // Serialize enriched IOC to JSON
        let enriched_json = serde_json::to_string(enriched)
            .map_err(|e| DataStoreError::Serialization(format!("Failed to serialize enriched IOC: {}", e)))?;

        // Store enriched IOC with expiration
        let _: () = conn.set_ex(&key, enriched_json, 86400).await // 24 hours
            .map_err(|e| DataStoreError::Internal(format!("Failed to store enriched IOC: {}", e)))?;

        Ok(enriched.base_ioc.id.to_string())
    }

    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = enriched_key(&self.config.key_prefix, &context.tenant_id, ioc_id);

        let enriched_json: Option<String> = conn.get(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get enriched IOC: {}", e)))?;

        match enriched_json {
            Some(json) => {
                let enriched: EnrichedIOC = serde_json::from_str(&json)
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize enriched IOC: {}", e)))?;
                Ok(Some(enriched))
            }
            None => Ok(None)
        }
    }

    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = enriched_key(&self.config.key_prefix, &context.tenant_id, ioc_id);

        // Delete enriched IOC
        let deleted: i32 = conn.del(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete enriched IOC: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("Enriched IOC {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:enriched:*:*", self.config.key_prefix, context.tenant_id);

        // Get all enriched IOC keys for this tenant
        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search enriched IOCs: {}", e)))?;

        let mut results = Vec::new();
        let limit = criteria.limit.unwrap_or(100);
        let offset = criteria.offset.unwrap_or(0);

        for key in keys.iter().skip(offset).take(limit) {
            if let Some(enriched_json) = conn.get::<_, Option<String>>(key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get enriched IOC: {}", e)))? {
                if let Ok(enriched) = serde_json::from_str::<EnrichedIOC>(&enriched_json) {
                    // Apply basic confidence filter if specified
                    if let Some(min_conf) = criteria.confidence_min {
                        if enriched.base_ioc.confidence >= min_conf {
                            results.push(enriched);
                        }
                    } else {
                        results.push(enriched);
                    }
                }
            }
        }

        Ok(SearchResults {
            items: results,
            total_count: keys.len(),
            has_more: (offset + limit) < keys.len(),
        })
    }
}