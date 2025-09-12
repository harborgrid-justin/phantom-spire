//! IOCDataStore Trait Implementation
//!
//! Implementation of the IOCDataStore trait for Redis.

use async_trait::async_trait;
use redis::AsyncCommands;
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCDataStore;
use super::config::RedisConfig;
use super::connection::RedisConnectionManager;
use super::keys::ioc_count_key;

pub struct RedisDataStore {
    pub config: RedisConfig,
    pub connection_manager: RedisConnectionManager,
}

#[async_trait]
impl IOCDataStore for RedisDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        // Redis doesn't require explicit initialization
        Ok(())
    }

    async fn close(&mut self) -> DataStoreResult<()> {
        // Redis connections are managed automatically
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        let mut conn = self.connection_manager.get_connection().await?;
        let result: RedisResult<String> = redis::cmd("PING").query_async(&mut conn).await;
        match result {
            Ok(response) if response == "PONG" => Ok(true),
            _ => Ok(false)
        }
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let ioc_count = self.get_ioc_count(context).await?;

        Ok(DataStoreMetrics {
            total_operations: ioc_count as u64,
            successful_operations: ioc_count as u64,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: 0, // Redis doesn't provide this info easily
            last_health_check: Utc::now(),
        })
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let mut conn = self.connection_manager.get_connection().await?;
        let count_key = ioc_count_key(&self.config.key_prefix, &context.tenant_id);

        let count: u64 = conn.get(&count_key).await
            .unwrap_or(0);

        Ok(count)
    }
}