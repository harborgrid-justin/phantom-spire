//! EnrichedIOCStore implementation for PostgreSQL
//!
//! This module implements the EnrichedIOCStore trait for PostgreSQL.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;
use crate::data_stores::postgres::schema::PostgreSQLDataStoreSchema;

#[async_trait]
impl EnrichedIOCStore for PostgreSQLDataStore {
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String> {
        self.ensure_tenant(&context.tenant_id).await?;
        let conn = self.get_connection().await?;

        conn.execute(
            &format!(r#"
                INSERT INTO {}.enriched_ioc (tenant_id, ioc_id, base_ioc, enrichment_data, sources, enrichment_timestamp)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (tenant_id, ioc_id) DO UPDATE SET
                    base_ioc = EXCLUDED.base_ioc,
                    enrichment_data = EXCLUDED.enrichment_data,
                    sources = EXCLUDED.sources,
                    enrichment_timestamp = EXCLUDED.enrichment_timestamp
            "#, self.config.schema),
            &[
                &context.tenant_id,
                &enriched.base_ioc.id.to_string(),
                &serde_json::to_string(&enriched.base_ioc).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize base_ioc: {}", e)))?,
                &serde_json::to_string(&enriched.enrichment_data).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize enrichment_data: {}", e)))?,
                &serde_json::to_string(&enriched.sources).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize sources: {}", e)))?,
                &enriched.enrichment_timestamp,
            ],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to store enriched IOC: {}", e)))?;

        Ok(enriched.base_ioc.id.to_string())
    }

    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>> {
        let conn = self.get_connection().await?;

        let row = conn.query_opt(
            &format!("SELECT base_ioc, enrichment_data, sources, enrichment_timestamp FROM {}.enriched_ioc WHERE tenant_id = $1 AND ioc_id = $2", self.config.schema),
            &[&context.tenant_id, &ioc_id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to get enriched IOC: {}", e)))?;

        match row {
            Some(row) => {
                let enriched = EnrichedIOC {
                    base_ioc: serde_json::from_str(&row.get::<_, String>(0))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize base_ioc: {}", e)))?,
                    enrichment_data: serde_json::from_str(&row.get::<_, String>(1))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize enrichment_data: {}", e)))?,
                    sources: serde_json::from_str(&row.get::<_, String>(2))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize sources: {}", e)))?,
                    enrichment_timestamp: row.get(3),
                };
                Ok(Some(enriched))
            }
            None => Ok(None)
        }
    }

    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let conn = self.get_connection().await?;

        let deleted = conn.execute(
            &format!("DELETE FROM {}.enriched_ioc WHERE tenant_id = $1 AND ioc_id = $2", self.config.schema),
            &[&context.tenant_id, &ioc_id.to_string()],
        ).await
        .map_err(|e| DataStoreError::Internal(format!("Failed to delete enriched IOC: {}", e)))?;

        if deleted == 0 {
            return Err(DataStoreError::NotFound(format!("Enriched IOC {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>> {
        let conn = self.get_connection().await?;

        let mut query = format!("SELECT base_ioc, enrichment_data, sources, enrichment_timestamp FROM {}.enriched_ioc WHERE tenant_id = $1", self.config.schema);
        let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = vec![&context.tenant_id];
        let mut param_count = 1;

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            param_count += 1;
            query.push_str(&format!(" AND (base_ioc->>'confidence')::float >= ${}", param_count));
            params.push(&min_conf);
        }

        query.push_str(" ORDER BY enrichment_timestamp DESC");

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
            .map_err(|e| DataStoreError::Internal(format!("Failed to search enriched IOCs: {}", e)))?;

        let mut results = Vec::new();
        for row in rows {
            let enriched = EnrichedIOC {
                base_ioc: serde_json::from_str(&row.get::<_, String>(0))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize base_ioc: {}", e)))?,
                enrichment_data: serde_json::from_str(&row.get::<_, String>(1))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize enrichment_data: {}", e)))?,
                sources: serde_json::from_str(&row.get::<_, String>(2))
                    .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize sources: {}", e)))?,
                enrichment_timestamp: row.get(3),
            };
            results.push(enriched);
        }

        // Get total count
        let count_query = format!("SELECT COUNT(*) FROM {}.enriched_ioc WHERE tenant_id = $1", self.config.schema);
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