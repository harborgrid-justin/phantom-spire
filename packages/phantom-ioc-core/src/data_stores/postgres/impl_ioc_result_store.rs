//! IOCResultStore implementation for PostgreSQL
//!
//! This module implements the IOCResultStore trait for PostgreSQL.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;
use crate::data_stores::postgres::schema::PostgreSQLDataStoreSchema;

#[async_trait]
impl IOCResultStore for PostgreSQLDataStore {
    async fn store_result(&self, result: &IOCResult, context: &TenantContext) -> DataStoreResult<String> {
        self.ensure_tenant(&context.tenant_id).await?;
        let conn = self.get_connection().await?;

        conn.execute(
            &format!(r#"
                INSERT INTO {}.ioc_result (tenant_id, ioc_id, ioc, detection_result, intelligence, correlations, analysis, processing_timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (tenant_id, ioc_id) DO UPDATE SET
                    ioc = EXCLUDED.ioc,
                    detection_result = EXCLUDED.detection_result,
                    intelligence = EXCLUDED.intelligence,
                    correlations = EXCLUDED.correlations,
                    analysis = EXCLUDED.analysis,
                    processing_timestamp = EXCLUDED.processing_timestamp
            "#, self.config.schema),
            &[
                &context.tenant_id,
                &result.ioc.id.to_string(),
                &serde_json::to_string(&result.ioc).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize IOC: {}", e)))?,
                &serde_json::to_string(&result.detection_result).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize detection_result: {}", e)))?,
                &serde_json::to_string(&result.intelligence).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize intelligence: {}", e)))?,
                &serde_json::to_string(&result.correlations).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize correlations: {}", e)))?,
                &serde_json::to_string(&result.analysis).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize analysis: {}", e)))?,
                &result.processing_timestamp,
            ],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC result: {}", e)))?;

        Ok(result.ioc.id.to_string())
    }

    async fn get_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOCResult>> {
        let conn = self.get_connection().await?;

        let row = conn.query_opt(
            &format!("SELECT ioc, detection_result, intelligence, correlations, analysis, processing_timestamp FROM {}.ioc_result WHERE tenant_id = $1 AND ioc_id = $2", self.config.schema),
            &[&context.tenant_id, &ioc_id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC result: {}", e)))?;

        match row {
            Some(row) => {
                let result = IOCResult {
                    ioc: serde_json::from_str(&row.get::<_, String>(0))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize IOC: {}", e)))?,
                    detection_result: serde_json::from_str(&row.get::<_, String>(1))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize detection_result: {}", e)))?,
                    intelligence: serde_json::from_str(&row.get::<_, String>(2))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize intelligence: {}", e)))?,
                    correlations: serde_json::from_str(&row.get::<_, String>(3))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlations: {}", e)))?,
                    analysis: serde_json::from_str(&row.get::<_, String>(4))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize analysis: {}", e)))?,
                    processing_timestamp: row.get(5),
                };
                Ok(Some(result))
            }
            None => Ok(None)
        }
    }

    async fn delete_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        let deleted = conn.execute(
            &format!("DELETE FROM {}.ioc_result WHERE tenant_id = $1 AND ioc_id = $2", self.config.schema),
            &[&context.tenant_id, &ioc_id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC result: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("IOC result for {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_results(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOCResult>> {
        let conn = self.get_connection().await?;

        let mut query = format!("SELECT ioc, detection_result, intelligence, correlations, analysis, processing_timestamp FROM {}.ioc_result WHERE tenant_id = $1", self.config.schema);
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let mut param_count = 1;

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            param_count += 1;
            query.push_str(&format!(" AND (intelligence->>'confidence')::float >= ${}", param_count));
            params.push(&min_conf);
        }

        query.push_str(" ORDER BY processing_timestamp DESC");

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
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOC results: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let result = IOCResult {
                ioc: serde_json::from_str(&row.get::<_, String>(0))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize IOC: {}", e)))?,
                detection_result: serde_json::from_str(&row.get::<_, String>(1))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize detection_result: {}", e)))?,
                intelligence: serde_json::from_str(&row.get::<_, String>(2))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize intelligence: {}", e)))?,
                correlations: serde_json::from_str(&row.get::<_, String>(3))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlations: {}", e)))?,
                analysis: serde_json::from_str(&row.get::<_, String>(4))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize analysis: {}", e)))?,
                processing_timestamp: row.get(5),
            };
            results.push(result);
        }

        // Get total count
        let count_query = format!("SELECT COUNT(*) FROM {}.ioc_result WHERE tenant_id = $1", self.config.schema);
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