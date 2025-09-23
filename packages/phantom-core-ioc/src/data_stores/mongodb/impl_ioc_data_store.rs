//! IOCDataStore Trait Implementation
//!
//! Implementation of the IOCDataStore trait for MongoDB.

use async_trait::async_trait;
use mongodb::{Client, Database, bson::doc};
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCDataStore;
use super::config::MongoDBConfig;

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: Client,
    pub database: Database,
}

#[async_trait]
impl IOCDataStore for MongoDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        // Indexes are already created in new()
        Ok(())
    }

    async fn close(&mut self) -> DataStoreResult<()> {
        // MongoDB client handles connection management
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        match self.database.run_command(doc! { "ping": 1 }, None).await {
            Ok(_) => Ok(true),
            Err(_) => Ok(false)
        }
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let ioc_count = self.get_ioc_count(context).await?;

        // Get database stats (simplified)
        let stats = match self.database.run_command(doc! { "dbStats": 1 }, None).await {
            Ok(stats_doc) => {
                if let Some(size) = stats_doc.get_i64("dataSize").ok() {
                    Some(size as u64)
                } else {
                    None
                }
            }
            Err(_) => None
        };

        Ok(DataStoreMetrics {
            total_operations: ioc_count as u64,
            successful_operations: ioc_count as u64,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: stats.unwrap_or(0),
            last_health_check: Utc::now(),
        })
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let collection = self.database.collection(&format!("{}iocs", self.config.collection_prefix));

        let count = collection.count_documents(doc! { "tenant_id": &context.tenant_id }, None).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC count: {}", e)))?;

        Ok(count)
    }
}