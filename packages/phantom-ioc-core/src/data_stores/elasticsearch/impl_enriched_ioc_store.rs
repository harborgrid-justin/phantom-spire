//! EnrichedIOCStore trait implementation for Elasticsearch
//!
//! This module implements the EnrichedIOCStore trait for Elasticsearch.

use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

use crate::models::EnrichedIOC;
use crate::data_stores::types::{
    EnrichedIOCStore, IOCSearchCriteria, SearchResults, DataStoreResult, DataStoreError, TenantContext
};
use super::connection::ElasticsearchDataStore;
use super::conversions::{enriched_to_document, document_to_enriched};

#[async_trait]
impl EnrichedIOCStore for ElasticsearchDataStore {
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String> {
        let index = self.enriched_index();

        let doc = enriched_to_document(enriched, &context.tenant_id);

        let response = self.client
            .index(elasticsearch::IndexParts::IndexId(&index, &enriched.base_ioc.id.to_string()))
            .body(doc)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to store enriched IOC: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to index enriched IOC: {}", body)));
        }

        Ok(enriched.base_ioc.id.to_string())
    }

    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>> {
        let index = self.enriched_index();

        let response = self.client
            .get(elasticsearch::GetParts::IndexId(&index, &ioc_id.to_string()))
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get enriched IOC: {}", e)))?;

        if response.status_code() == elasticsearch::http::StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to get enriched IOC: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse response: {}", e)))?;

        let found = body.get("found")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if !found {
            return Ok(None);
        }

        if let Some(source) = body.get("_source") {
            // Check tenant isolation
            if source.get("tenant_id").and_then(|v| v.as_str()) != Some(&context.tenant_id) {
                return Ok(None);
            }

            let enriched = document_to_enriched(source)?;
            Ok(Some(enriched))
        } else {
            Ok(None)
        }
    }

    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let index = self.enriched_index();

        let response = self.client
            .delete(elasticsearch::DeleteParts::IndexId(&index, &ioc_id.to_string()))
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete enriched IOC: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to delete enriched IOC: {}", body)));
        }

        Ok(())
    }

    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>> {
        let index = self.enriched_index();

        let mut must_clauses = vec![serde_json::json!({ "term": { "tenant_id": context.tenant_id } })];

        if let Some(ioc_type) = &criteria.ioc_type {
            must_clauses.push(serde_json::json!({ "term": { "base_ioc.indicator_type": ioc_type } }));
        }

        if let Some(value_pattern) = &criteria.value_pattern {
            must_clauses.push(serde_json::json!({ "wildcard": { "base_ioc.value": format!("*{}*", value_pattern) } }));
        }

        if let Some(source) = &criteria.source {
            must_clauses.push(serde_json::json!({ "term": { "base_ioc.source": source } }));
        }

        if let Some(confidence_min) = criteria.confidence_min {
            must_clauses.push(serde_json::json!({ "range": { "base_ioc.confidence": { "gte": confidence_min } } }));
        }

        if let Some(created_after) = criteria.created_after {
            must_clauses.push(serde_json::json!({ "range": { "enrichment_timestamp": { "gte": created_after.to_rfc3339() } } }));
        }

        if let Some(created_before) = criteria.created_before {
            must_clauses.push(serde_json::json!({ "range": { "enrichment_timestamp": { "lte": created_before.to_rfc3339() } } }));
        }

        let search_body = serde_json::json!({
            "query": {
                "bool": {
                    "must": must_clauses
                }
            },
            "size": criteria.limit.unwrap_or(100),
            "from": criteria.offset.unwrap_or(0)
        });

        let response = self.client
            .search(elasticsearch::SearchParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Search failed: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Search failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse search response: {}", e)))?;

        let mut results = Vec::new();
        let total = body.get("hits").and_then(|h| h.get("total")).and_then(|t| t.get("value")).and_then(|v| v.as_u64()).unwrap_or(0);

        if let Some(hits) = body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
            for hit in hits {
                if let Some(source) = hit.get("_source") {
                    if let Ok(Some(enriched)) = self.get_enriched(&Uuid::parse_str(source.get("base_ioc").and_then(|i| i.get("id")).and_then(|id| id.as_str()).unwrap_or("")).unwrap_or(Uuid::nil()), context).await {
                        results.push(enriched);
                    }
                }
            }
        }

        Ok(SearchResults {
            items: results,
            total_count: total as usize,
            limit: criteria.limit.unwrap_or(100),
            offset: criteria.offset.unwrap_or(0),
            has_more: total > (criteria.offset.unwrap_or(0) + criteria.limit.unwrap_or(100)) as u64,
        })
    }
}