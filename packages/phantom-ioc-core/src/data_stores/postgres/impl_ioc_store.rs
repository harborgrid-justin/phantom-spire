//! IOCStore implementation for PostgreSQL
//!
//! This module implements the IOCStore trait for PostgreSQL.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;
use crate::data_stores::postgres::schema::PostgreSQLDataStoreSchema;
use crate::data_stores::postgres::conversions::PostgreSQLDataStoreConversions;

#[async_trait]
impl IOCStore for PostgreSQLDataStore {
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String> {
        self.ensure_tenant(&context.tenant_id).await?;
        let conn = self.get_connection().await?;
        let (id, indicator_type, value, confidence, source, tags, metadata, raw_data) = self.ioc_to_row(ioc)?;

        conn.execute(
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
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC: {}", e)))?;

        Ok(ioc.id.to_string())
    }

    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>> {
        let conn = self.get_connection().await?;

        let row = conn.query_opt(
            &format!("SELECT id, indicator_type, value, confidence, source, tags, metadata, created_at, updated_at FROM {}.ioc WHERE tenant_id = $1 AND id = $2", self.config.schema),
            &[&context.tenant_id, &id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC: {}", e)))?;

        match row {
            Some(row) => {
                let ioc = IOC {
                    id: row.get(0),
                    indicator_type: serde_json::from_str(&row.get::<_, String>(1))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize indicator_type: {}", e)))?,
                    value: row.get(2),
                    confidence: row.get::<_, f32>(3) as f64,
                    severity: Severity::Medium, // Default since not stored
                    source: row.get(4),
                    timestamp: Utc::now(), // Default since not stored
                    tags: row.get(5),
                    context: IOCContext {
                        geolocation: None,
                        asn: None,
                        category: None,
                        first_seen: None,
                        last_seen: None,
                        related_indicators: Vec::new(),
                        metadata: row.get(6),
                    },
                    raw_data: None,
                };
                Ok(Some(ioc))
            }
            None => Ok(None)
        }
    }

    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()> {
        // PostgreSQL ON CONFLICT handles updates
        self.store_ioc(ioc, context).await?;
        Ok(())
    }

    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        let deleted = conn.execute(
            &format!("DELETE FROM {}.ioc WHERE tenant_id = $1 AND id = $2", self.config.schema),
            &[&context.tenant_id, &id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("IOC {} not found", id)));
        }

        Ok(())
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let conn = self.get_connection().await?;

        let mut query = format!("SELECT id, indicator_type, value, confidence, severity, source, timestamp, tags, metadata, raw_data FROM {}.ioc WHERE tenant_id = $1", self.config.schema);
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let mut param_count = 1;

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            param_count += 1;
            query.push_str(&format!(" AND confidence >= ${}", param_count));
            params.push(&min_conf);
        }

        // Add sorting (simplified - sort by timestamp)
        query.push_str(" ORDER BY timestamp DESC");

        // Add pagination
        if let Some(limit) = criteria.limit {
            param_count += 1;
            query.push_str(&format!(" LIMIT ${}", param_count));
            params.push(&(limit as i64));
        }

        if let Some(offset) = criteria.offset {
            param_count += 1;
            query.push_str(&format!(" OFFSET ${}", param_count));
            params.push(&(offset as i64));
        }

        let rows = conn.query(&query, &params).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOCs: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let ioc = IOC {
                id: row.get(0),
                indicator_type: serde_json::from_str(&row.get::<_, String>(1))
                    .unwrap_or(IOCType::Domain),
                value: row.get(2),
                confidence: row.get::<_, f32>(3) as f64,
                severity: serde_json::from_str(&row.get::<_, String>(4)).unwrap_or(Severity::Low),
                source: row.get(5),
                timestamp: row.get(6),
                tags: row.get(7),
                context: IOCContext {
                    metadata: row.get(8),
                    geolocation: None,
                    asn: None,
                    category: None,
                    first_seen: None,
                    last_seen: None,
                    related_indicators: Vec::new(),
                },
                raw_data: row.get(9),
            };
            results.push(ioc);
        }

        // Get total count for pagination
        let count_query = format!("SELECT COUNT(*) FROM {}.ioc WHERE tenant_id = $1", self.config.schema);
        let count_params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let count_row = conn.query_one(&count_query, &count_params).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get total count: {}", e)))?;
        let total_count: i64 = count_row.get(0);

        Ok(SearchResults {
            items: results,
            total_count: total_count as usize,
            limit: criteria.limit.unwrap_or(100),
            offset: criteria.offset.unwrap_or(0),
            has_more: criteria.offset.map_or(false, |offset| criteria.limit.map_or(false, |limit| (offset + limit) < total_count as usize)),
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

    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>> {
        let conn = self.get_connection().await?;

        let rows = conn.query(
            &format!("SELECT id FROM {}.ioc WHERE tenant_id = $1 ORDER BY timestamp DESC", self.config.schema),
            &[&context.tenant_id],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to list IOC IDs: {}", e)))?;

        let mut ids = Vec::new();
        for row in rows {
            ids.push(row.get(0));
        }

        Ok(ids)
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