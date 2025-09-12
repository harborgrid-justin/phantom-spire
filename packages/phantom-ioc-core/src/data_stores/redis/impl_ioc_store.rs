//! IOCStore Trait Implementation
//!
//! Implementation of the IOCStore trait for Redis.

use async_trait::async_trait;
use redis::AsyncCommands;
use uuid::Uuid;
use serde_json;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;
use super::keys::{ioc_key, ioc_count_key, ioc_search_key};

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl IOCStore for RedisDataStore {
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = ioc_key(&self.config.key_prefix, &context.tenant_id, &ioc.id);
        let count_key = ioc_count_key(&self.config.key_prefix, &context.tenant_id);

        // Serialize IOC to JSON
        let ioc_json = serde_json::to_string(ioc)
            .map_err(|e| DataStoreError::Serialization(format!("Failed to serialize IOC: {}", e)))?;

        // Store IOC with expiration
        let _: () = conn.set_ex(&key, ioc_json, 86400).await // 24 hours
            .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC: {}", e)))?;

        // Update count
        let _: () = conn.incr(&count_key, 1).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC count: {}", e)))?;

        Ok(ioc.id.to_string())
    }

    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = ioc_key(&self.config.key_prefix, &context.tenant_id, id);

        let ioc_json: Option<String> = conn.get(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC: {}", e)))?;

        match ioc_json {
            Some(json) => {
                let ioc: IOC = serde_json::from_str(&json)
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize IOC: {}", e)))?;
                Ok(Some(ioc))
            }
            None => Ok(None)
        }
    }

    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = ioc_key(&self.config.key_prefix, &context.tenant_id, &ioc.id);

        // Serialize IOC to JSON
        let ioc_json = serde_json::to_string(ioc)
            .map_err(|e| DataStoreError::Serialization(format!("Failed to serialize IOC: {}", e)))?;

        // Update IOC with expiration
        let _: () = conn.set_ex(&key, ioc_json, 86400).await // 24 hours
            .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC: {}", e)))?;

        Ok(())
    }

    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let mut conn = self.connection_manager.get_connection().await?;
        let key = ioc_key(&self.config.key_prefix, &context.tenant_id, id);
        let count_key = ioc_count_key(&self.config.key_prefix, &context.tenant_id);

        // Delete IOC
        let deleted: i32 = conn.del(&key).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("IOC {} not found", id)));
        }

        // Update count
        let _: () = conn.decr(&count_key, 1).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC count: {}", e)))?;

        Ok(())
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        // Redis doesn't support complex queries like MongoDB
        // This is a simplified implementation
        let mut conn = self.connection_manager.get_connection().await?;
        let search_key = ioc_search_key(&self.config.key_prefix, &context.tenant_id);

        // Get all IOC keys for this tenant (simplified approach)
        let keys: Vec<String> = conn.keys(&format!("{}*", search_key)).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOCs: {}", e)))?;

        let mut results = Vec::new();
        let limit = criteria.limit.unwrap_or(100);
        let offset = criteria.offset.unwrap_or(0);

        for key in keys.iter().skip(offset).take(limit) {
            if let Some(ioc_json) = conn.get::<_, Option<String>>(key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC: {}", e)))? {
                if let Ok(ioc) = serde_json::from_str::<IOC>(&ioc_json) {
                    // Apply basic confidence filter if specified
                    if let Some(min_conf) = criteria.confidence_min {
                        if ioc.confidence >= min_conf {
                            results.push(ioc);
                        }
                    } else {
                        results.push(ioc);
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

    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let mut conn = self.connection_manager.get_connection().await?;
        let count_key = ioc_count_key(&self.config.key_prefix, &context.tenant_id);

        let mut success_count = 0;
        let mut errors = Vec::new();

        for ioc in iocs {
            let key = ioc_key(&self.config.key_prefix, &context.tenant_id, &ioc.id);

            match serde_json::to_string(ioc) {
                Ok(ioc_json) => {
                    if let Err(e) = conn.set_ex::<_, _, ()>(&key, ioc_json, 86400).await {
                        errors.push(format!("Failed to store IOC {}: {}", ioc.id, e));
                    } else {
                        success_count += 1;
                    }
                }
                Err(e) => {
                    errors.push(format!("Failed to serialize IOC {}: {}", ioc.id, e));
                }
            }
        }

        // Update count
        if success_count > 0 {
            let _: () = conn.incr(&count_key, success_count as i64).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC count: {}", e)))?;
        }

        Ok(BulkOperationResult {
            total_requested: iocs.len(),
            successful: success_count,
            failed: errors.len(),
            failed_ids: vec![],
            processing_time_ms: 0,
        })
    }

    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:ioc:*:*", self.config.key_prefix, context.tenant_id);

        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to list IOC IDs: {}", e)))?;

        let mut ids = Vec::new();
        for key in keys {
            // Extract UUID from key (simplified parsing)
            if let Some(uuid_str) = key.split(':').last() {
                if let Ok(id) = Uuid::parse_str(uuid_str) {
                    ids.push(id);
                }
            }
        }

        Ok(ids)
    }
}