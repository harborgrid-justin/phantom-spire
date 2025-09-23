//! IOCDataStore trait implementation for Elasticsearch
//!
//! This module implements the IOCDataStore trait for Elasticsearch.

use async_trait::async_trait;
use serde_json::Value;
use chrono::Utc;

use crate::data_stores::types::{
    IOCDataStore, DataStoreResult, DataStoreError, DataStoreMetrics, TenantContext
};
use super::connection::ElasticsearchDataStore;

#[async_trait]
impl IOCDataStore for ElasticsearchDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        // Indexes are already created in new()
        Ok(())
    }

    async fn close(&mut self) -> DataStoreResult<()> {
        // Elasticsearch client handles connection management
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        let response = self.client
            .cluster()
            .health(elasticsearch::cluster::ClusterHealthParts::None)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Health check failed: {}", e)))?;

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse health response: {}", e)))?;

        let status = body.get("status")
            .and_then(|v| v.as_str())
            .unwrap_or("red");

        Ok(status == "green" || status == "yellow")
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let ioc_count = self.get_ioc_count(context).await?;

        // Get cluster stats (simplified)
        let response = self.client
            .cluster()
            .stats(elasticsearch::cluster::ClusterStatsParts::None)
            .send()
            .await
            .ok();

        let storage_size = if let Some(resp) = response {
            if let Ok(body) = resp.json::<Value>().await {
                body.get("indices")
                    .and_then(|i| i.get("store"))
                    .and_then(|s| s.get("size_in_bytes"))
                    .and_then(|v| v.as_u64())
            } else {
                None
            }
        } else {
            None
        };

        Ok(DataStoreMetrics {
            total_operations: ioc_count,
            successful_operations: ioc_count,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: storage_size.unwrap_or(0),
            last_health_check: Utc::now(),
        })
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let index = self.ioc_index();

        let search_body = serde_json::json!({
            "query": {
                "term": { "tenant_id": context.tenant_id }
            }
        });

        let response = self.client
            .count(elasticsearch::CountParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC count: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Count failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse count response: {}", e)))?;

        let count = body.get("count")
            .and_then(|v| v.as_u64())
            .unwrap_or(0);

        Ok(count)
    }
}