//! CorrelationStore Trait Implementation
//!
//! Implementation of the CorrelationStore trait for Redis.

use async_trait::async_trait;
use redis::AsyncCommands;
use uuid::Uuid;
use serde_json;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::CorrelationStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;
use super::keys::correlations_key;

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl CorrelationStore for RedisDataStore {
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let mut conn = self.connection_manager.get_connection().await?;

        let mut success_count = 0;
        let mut errors = Vec::new();

        for correlation in correlations {
            let key = correlations_key(&self.config.key_prefix, &context.tenant_id, &correlation.id);

            match serde_json::to_string(correlation) {
                Ok(correlation_json) => {
                    if let Err(e) = conn.set_ex::<_, _, ()>(&key, correlation_json, 86400).await {
                        errors.push(format!("Failed to store correlation for IOC {}: {}", correlation.id, e));
                    } else {
                        success_count += 1;
                    }
                }
                Err(e) => {
                    errors.push(format!("Failed to serialize correlation for IOC {}: {}", correlation.id, e));
                }
            }
        }

        Ok(BulkOperationResult {
            total_requested: correlations.len(),
            successful: success_count,
            failed: errors.len(),
            failed_ids: vec![],
            processing_time_ms: 0,
        })
    }

    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:correlations:*:*", self.config.key_prefix, context.tenant_id);

        // Get all correlation keys for this tenant
        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get correlations: {}", e)))?;

        let mut results = Vec::new();

        for key in keys {
            if let Some(correlation_json) = conn.get::<_, Option<String>>(&key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get correlation: {}", e)))? {
                if let Ok(correlation) = serde_json::from_str::<Correlation>(&correlation_json) {
                    // Check if this correlation involves the requested IOC
                    if correlation.correlated_iocs.contains(ioc_id) {
                        results.push(correlation);
                    }
                }
            }
        }

        Ok(results)
    }

    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:correlations:*:*", self.config.key_prefix, context.tenant_id);

        // Get all correlation keys for this tenant
        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to find correlations: {}", e)))?;

        let mut deleted_count = 0;

        for key in keys {
            if let Some(correlation_json) = conn.get::<_, Option<String>>(&key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get correlation: {}", e)))? {
                if let Ok(correlation) = serde_json::from_str::<Correlation>(&correlation_json) {
                    // Check if this correlation involves the requested IOC
                    if correlation.correlated_iocs.contains(ioc_id) {
                        let _: () = conn.del(&key).await
                            .map_err(|e| DataStoreError::Internal(format!("Failed to delete correlation: {}", e)))?;
                        deleted_count += 1;
                    }
                }
            }
        }

        if deleted_count == 0 {
            return Err(DataStoreError::NotFound(format!("No correlations found for IOC {}", ioc_id)));
        }

        Ok(())
    }

    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>> {
        let mut conn = self.connection_manager.get_connection().await?;
        let pattern = format!("{}{}:correlations:*:*", self.config.key_prefix, context.tenant_id);

        // Get all correlation keys for this tenant
        let keys: Vec<String> = conn.keys(&pattern).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search correlations: {}", e)))?;

        let mut results = Vec::new();
        let limit = criteria.limit.unwrap_or(100);
        let offset = criteria.offset.unwrap_or(0);

        for key in keys.iter().skip(offset).take(limit) {
            if let Some(correlation_json) = conn.get::<_, Option<String>>(key).await
                .map_err(|e| DataStoreError::Internal(format!("Failed to get correlation: {}", e)))? {
                if let Ok(correlation) = serde_json::from_str::<Correlation>(&correlation_json) {
                    // Apply basic strength filter if specified
                    if let Some(min_conf) = criteria.confidence_min {
                        if correlation.strength >= min_conf {
                            results.push(correlation);
                        }
                    } else {
                        results.push(correlation);
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