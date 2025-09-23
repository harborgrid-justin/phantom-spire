//! IOCResultStore Trait Implementation
//!
//! Implementation of the IOCResultStore trait for Redis.

use async_trait::async_trait;
use redis::AsyncCommands;
use uuid::Uuid;
use serde_json;
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCResultStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;
use super::keys::result_key;

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl IOCResultStore for RedisDataStore {
    async fn store_result(&self, result: &IOCResult, context: &TenantContext) -> DataStoreResult<String> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = result_key(&self.config.key_prefix, &context.tenant_id, &result.ioc.id);

        // Serialize IOC result to JSON
        let result_json = serde_json::to_string(result)
            .map_err(|e| DataStoreError::Serialization(format!("Failed to serialize IOC result: {}", e)))?;

        // Store result with expiration
        let _: () = conn.set_ex(&key, result_json, 86400).await // 24 hours
            .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC result: {}", e)))?;

        Ok(result.ioc.id.to_string())
    }

    async fn get_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOCResult>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = result_key(&self.config.key_prefix, &context.tenant_id, ioc_id);

        let result_json: Option<String> = conn.get(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC result: {}", e)))?;

        match result_json {
            Some(json) => {
                let result: IOCResult = serde_json::from_str(&json)
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize IOC result: {}", e)))?;
                Ok(Some(result))
            }
            None => Ok(None)
        }
    }

    async fn delete_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = result_key(&self.config.key_prefix, &context.tenant_id, ioc_id);

        // Delete result
        let deleted: i32 = conn.del(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC result: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("IOC result for {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_results(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOCResult>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:result:*:*", self.config.key_prefix, context.tenant_id);

        // Get all result keys for this tenant
        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOC results: {}", e)))?;

        let mut results = Vec::new();
        let limit = criteria.limit.unwrap_or(100);
        let offset = criteria.offset.unwrap_or(0);

        for key in keys.iter().skip(offset).take(limit) {
            if let Some(result_json) = conn.get::<_, Option<String>>(key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC result: {}", e)))? {
                if let Ok(result) = serde_json::from_str::<IOCResult>(&result_json) {
                    // Apply basic confidence filter if specified
                    if let Some(min_conf) = criteria.confidence_min {
                        if result.ioc.confidence >= min_conf {
                            results.push(result);
                        }
                    } else {
                        results.push(result);
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