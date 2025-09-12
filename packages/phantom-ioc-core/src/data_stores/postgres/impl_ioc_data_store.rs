//! IOCDataStore implementation for PostgreSQL
//!
//! This module implements the IOCDataStore trait for PostgreSQL.

use async_trait::async_trait;
use chrono::Utc;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;

#[async_trait]
impl IOCDataStore for PostgreSQLDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        // Schema is already initialized in new()
        Ok(())
    }

    async fn close(&mut self) -> DataStoreResult<()> {
        // Connection pool will be closed when dropped
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        match self.get_connection().await {
            Ok(conn) => {
                match conn.query_one("SELECT 1", &[]).await {
                    Ok(_) => Ok(true),
                    Err(_) => Ok(false)
                }
            }
            Err(_) => Ok(false)
        }
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let conn = self.get_connection().await?;
        let count = self.get_ioc_count(context).await?;

        // Get database size (simplified)
        let size_row = conn.query_opt(
            "SELECT pg_database_size(current_database())",
            &[],
        ).await
        .ok()
        .flatten();

        let storage_size = size_row.map(|row| row.get::<_, i64>(0) as u64);

        Ok(DataStoreMetrics {
            total_operations: count,
            successful_operations: 0,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: storage_size.unwrap_or(0),
            last_health_check: Utc::now(),
        })
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let conn = self.get_connection().await?;

        let row = conn.query_one(
            &format!("SELECT COUNT(*) FROM {}.ioc WHERE tenant_id = $1", self.config.schema),
            &[&context.tenant_id],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC count: {}", e)))?;

        let count: i64 = row.get(0);
        Ok(count as u64)
    }
}