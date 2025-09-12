//! ComprehensiveIOCStore implementation for PostgreSQL
//!
//! This module implements the ComprehensiveIOCStore trait for PostgreSQL.

use async_trait::async_trait;
use uuid::Uuid;
use std::collections::HashMap;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;

#[async_trait]
impl ComprehensiveIOCStore for PostgreSQLDataStore {
    fn store_type(&self) -> &'static str {
        "postgresql"
    }

    fn supports_multi_tenancy(&self) -> bool {
        true
    }

    fn supports_full_text_search(&self) -> bool {
        true
    }

    fn supports_transactions(&self) -> bool {
        true
    }

    fn supports_bulk_operations(&self) -> bool {
        true
    }

    fn max_batch_size(&self) -> usize {
        1000
    }

    async fn initialize(&self) -> DataStoreResult<()> {
        // Schema is already initialized in new()
        Ok(())
    }

    async fn close(&self) -> DataStoreResult<()> {
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
            successful_operations: count,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: storage_size.unwrap_or(0),
            last_health_check: Utc::now(),
        })
    }

    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        self.ensure_tenant(&context.tenant_id).await?;
        let conn = self.get_connection().await?;
        let mut success_count = 0;
        let mut errors = Vec::new();

        // Use a transaction for bulk operations
        let transaction = conn.transaction().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to start transaction: {}", e)))?;

        for ioc in iocs {
            let (id, indicator_type, value, confidence, source, tags, metadata, raw_data) = self.ioc_to_row(ioc)?;
            match transaction.execute(
                &format!(r#"
                    INSERT INTO {}.ioc (tenant_id, id, indicator_type, value, confidence, source, tags, metadata, raw_data, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    ON CONFLICT (tenant_id, id) DO UPDATE SET
                        indicator_type = EXCLUDED.indicator_type,
                        value = EXCLUDED.value,
                        confidence = EXCLUDED.confidence,
                        source = EXCLUDED.source,
                        tags = EXCLUDED.tags,
                        metadata = EXCLUDED.metadata,
                        raw_data = EXCLUDED.raw_data,
                        updated_at = NOW()
                "#, self.config.schema),
                &[&context.tenant_id, &id, &indicator_type, &value, &confidence, &source, &tags, &metadata, &raw_data],
            ).await {
                Ok(_) => success_count += 1,
                Err(e) => errors.push(format!("Failed to store IOC {}: {}", ioc.id, e)),
            }
        }

        if errors.is_empty() {
            transaction.commit().await
                .map_err(|e| DataStoreError::Internal(format!("Failed to commit transaction: {}", e)))?;
        } else {
            transaction.rollback().await
                .map_err(|e| DataStoreError::Internal(format!("Failed to rollback transaction: {}", e)))?;
        }

        Ok(BulkOperationResult {
            total_requested: iocs.len(),
            successful: success_count,
            failed: errors.len(),
            failed_ids: errors,
            processing_time_ms: 0,
        })
    }

    async fn bulk_delete_iocs(&self, ids: &[Uuid], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let conn = self.get_connection().await?;
        let mut successful = 0;
        let mut failed = 0;

        let transaction = conn.transaction().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to start transaction: {}", e)))?;

        for id in ids {
            match transaction.execute(
                &format!("DELETE FROM {}.ioc WHERE tenant_id = $1 AND id = $2", self.config.schema),
                &[&context.tenant_id, &id.to_string()],
            ).await {
                Ok(deleted) => {
                    if deleted > 0 {
                        successful += 1;
                    } else {
                        failed += 1;
                    }
                }
                Err(_) => failed += 1,
            }
        }

        if failed == 0 {
            transaction.commit().await
                .map_err(|e| DataStoreError::Internal(format!("Failed to commit transaction: {}", e)))?;
        } else {
            transaction.rollback().await
                .map_err(|e| DataStoreError::Internal(format!("Failed to rollback transaction: {}", e)))?;
        }

        Ok(BulkOperationResult {
            total_requested: ids.len(),
            successful,
            failed,
            failed_ids: vec![],
            processing_time_ms: 0,
        })
    }

    async fn search_iocs_advanced(&self, query: &str, filters: Option<HashMap<String, String>>, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let conn = self.get_connection().await?;

        let mut search_query = format!("SELECT id, indicator_type, value, confidence, source, tags, metadata, created_at FROM {}.ioc WHERE tenant_id = $1", self.config.schema);
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let mut param_count = 1;

        // Add text search
        if !query.is_empty() {
            param_count += 1;
            search_query.push_str(&format!(" AND (value ILIKE ${} OR source ILIKE ${})", param_count, param_count));
            params.push(&format!("%{}%", query));
        }

        // Add additional filters
        if let Some(filters) = filters {
            if let Some(indicator_type) = filters.get("indicator_type") {
                param_count += 1;
                search_query.push_str(&format!(" AND indicator_type::text = ${}", param_count));
                params.push(indicator_type);
            }

            if let Some(source) = filters.get("source") {
                param_count += 1;
                search_query.push_str(&format!(" AND source = ${}", param_count));
                params.push(source);
            }
        }

        search_query.push_str(" ORDER BY confidence DESC LIMIT 100");

        let rows = conn.query(&search_query, &params).await
            .map_err(|e| DataStoreError::Internal(format!("Advanced search failed: {}", e)))?;

        let mut iocs = Vec::new();
        for row in rows {
            let ioc = IOC {
                id: row.get(0),
                indicator_type: serde_json::from_str(&row.get::<_, String>(1))
                    .unwrap_or(IOCType::Domain),
                value: row.get(2),
                confidence: row.get::<_, f32>(3) as f64,
                severity: Severity::Medium,
                source: row.get(4),
                timestamp: Utc::now(),
                tags: row.get(5),
                context: IOCContext {
                    metadata: row.get(6),
                    geolocation: None,
                    asn: None,
                    category: None,
                    first_seen: None,
                    last_seen: None,
                    related_indicators: Vec::new(),
                },
                raw_data: None,
            };
            iocs.push(ioc);
        }

        Ok(SearchResults {
            items: iocs,
            total_count: iocs.len(),
            limit: 100,
            offset: 0,
            has_more: false,
        })
    }
}