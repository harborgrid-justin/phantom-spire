//! CorrelationStore implementation for PostgreSQL
//!
//! This module implements the CorrelationStore trait for PostgreSQL.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;
use crate::data_stores::postgres::schema::PostgreSQLDataStoreSchema;

#[async_trait]
impl CorrelationStore for PostgreSQLDataStore {
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        self.ensure_tenant(&context.tenant_id).await?;
        let conn = self.get_connection().await?;
        let mut successful = 0;
        let mut failed = 0;
        let mut failed_ids = Vec::new();

        let transaction = conn.transaction().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to start transaction: {}", e)))?;

        for correlation in correlations {
            match transaction.execute(
                &format!(r#"
                    INSERT INTO {}.correlation (tenant_id, id, correlated_iocs, correlation_type, strength, evidence, timestamp)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                "#, self.config.schema),
                &[
                    &context.tenant_id,
                    &correlation.id.to_string(),
                    &serde_json::to_string(&correlation.correlated_iocs).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize correlated_iocs: {}", e)))?,
                    &correlation.correlation_type,
                    &(correlation.strength as f32),
                    &serde_json::to_string(&correlation.evidence).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize evidence: {}", e)))?,
                    &correlation.timestamp,
                ],
            ).await {
                Ok(_) => successful += 1,
                Err(e) => {
                    failed += 1;
                    failed_ids.push(correlation.id.to_string());
                    log::warn!("Failed to store correlation {}: {}", correlation.id, e);
                }
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
            total_requested: correlations.len(),
            successful,
            failed,
            failed_ids,
            processing_time_ms: 0,
        })
    }

    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>> {
        let conn = self.get_connection().await?;

        let rows = conn.query(
            &format!("SELECT id, correlated_iocs, correlation_type, strength, evidence, timestamp FROM {}.correlation WHERE tenant_id = $1 AND correlated_iocs::text LIKE $2 ORDER BY timestamp DESC", self.config.schema),
            &[&context.tenant_id, &format!("%{}%", ioc_id.to_string())],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to get correlations: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let correlation = Correlation {
                id: row.get(0),
                correlated_iocs: serde_json::from_str(&row.get::<_, String>(1))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlated_iocs: {}", e)))?,
                correlation_type: row.get(2),
                strength: row.get::<_, f32>(3) as f64,
                evidence: serde_json::from_str(&row.get::<_, String>(4))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize evidence: {}", e)))?,
                timestamp: row.get(5),
            };
            results.push(correlation);
        }

        Ok(results)
    }

    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        conn.execute(
            &format!("DELETE FROM {}.correlation WHERE tenant_id = $1 AND ioc_id = $2", self.config.schema),
            &[&context.tenant_id, &ioc_id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to delete correlations: {}", e)))?;

        Ok(())
    }

    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>> {
        let conn = self.get_connection().await?;

        let mut query = format!("SELECT id, correlated_iocs, correlation_type, strength, evidence, timestamp FROM {}.correlation WHERE tenant_id = $1", self.config.schema);
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let mut param_count = 1;

        // Add strength filters
        if let Some(min_conf) = criteria.confidence_min {
            param_count += 1;
            query.push_str(&format!(" AND strength >= ${}", param_count));
            params.push(&min_conf);
        }

        query.push_str(" ORDER BY strength DESC");

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
            .map_err(|e| DataStoreError::Internal(format!("Failed to search correlations: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let correlation = Correlation {
                id: row.get(0),
                correlated_iocs: serde_json::from_str(&row.get::<_, String>(1))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlated_iocs: {}", e)))?,
                correlation_type: row.get(2),
                strength: row.get::<_, f32>(3) as f64,
                evidence: serde_json::from_str(&row.get::<_, String>(4))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize evidence: {}", e)))?,
                timestamp: row.get(5),
            };
            results.push(correlation);
        }

        // Get total count
        let count_query = format!("SELECT COUNT(*) FROM {}.correlation WHERE tenant_id = $1", self.config.schema);
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
}