//! CorrelationStore trait implementation for Elasticsearch
//!
//! This module implements the CorrelationStore trait for Elasticsearch.

use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

use crate::models::Correlation;
use crate::data_stores::types::{
    CorrelationStore, IOCSearchCriteria, SearchResults, BulkOperationResult,
    DataStoreResult, DataStoreError, TenantContext
};
use super::connection::ElasticsearchDataStore;
use super::conversions::{correlation_to_document, document_to_correlation};

#[async_trait]
impl CorrelationStore for ElasticsearchDataStore {
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let index = self.correlations_index();

        let mut body = Vec::new();

        for correlation in correlations {
            let header = serde_json::json!({
                "index": {
                    "_index": index,
                    "_id": correlation.id.to_string()
                }
            });

            let doc = correlation_to_document(correlation, &context.tenant_id);
            body.push(header);
            body.push(doc);
        }

        let response = self.client
            .bulk(elasticsearch::BulkParts::Index(&index))
            .body(serde_json::to_string(&body).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize bulk body: {}", e)))?)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Bulk store failed: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Bulk operation failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse bulk response: {}", e)))?;

        let errors = body.get("errors")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if errors {
            let error_items = body.get("items")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter(|item| item.get("index").and_then(|i| i.get("error")).is_some()).count())
                .unwrap_or(0);

            Ok(BulkOperationResult {
                total_requested: correlations.len(),
                successful: correlations.len() - error_items,
                failed: error_items,
                failed_ids: vec![],
                processing_time_ms: 0,
            })
        } else {
            Ok(BulkOperationResult {
                total_requested: correlations.len(),
                successful: correlations.len(),
                failed: 0,
                failed_ids: vec![],
                processing_time_ms: 0,
            })
        }
    }

    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>> {
        let index = self.correlations_index();

        let search_body = serde_json::json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "correlated_iocs": ioc_id.to_string() } },
                        { "term": { "tenant_id": context.tenant_id } }
                    ]
                }
            },
            "sort": [{ "timestamp": { "order": "desc" } }],
            "size": 1000
        });

        let response = self.client
            .search(elasticsearch::SearchParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get correlations: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Search failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse response: {}", e)))?;

        let mut results = Vec::new();

        if let Some(hits) = body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
            for hit in hits {
                if let Some(source) = hit.get("_source") {
                    let correlation = document_to_correlation(source)?;
                    results.push(correlation);
                }
            }
        }

        Ok(results)
    }

    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let index = self.correlations_index();

        let delete_query = serde_json::json!({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "correlated_iocs": ioc_id.to_string() } },
                        { "term": { "tenant_id": context.tenant_id } }
                    ]
                }
            }
        });

        let response = self.client
            .delete_by_query(elasticsearch::DeleteByQueryParts::Index(&[&index]))
            .body(delete_query)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete correlations: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to delete correlations: {}", body)));
        }

        Ok(())
    }

    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>> {
        let index = self.correlations_index();

        let mut must_clauses = vec![serde_json::json!({ "term": { "tenant_id": context.tenant_id } })];

        if let Some(correlation_type) = &criteria.ioc_type {
            must_clauses.push(serde_json::json!({ "term": { "correlation_type": correlation_type } }));
        }

        if let Some(strength_min) = criteria.confidence_min {
            must_clauses.push(serde_json::json!({ "range": { "strength": { "gte": strength_min } } }));
        }

        if let Some(created_after) = criteria.created_after {
            must_clauses.push(serde_json::json!({ "range": { "timestamp": { "gte": created_after.to_rfc3339() } } }));
        }

        if let Some(created_before) = criteria.created_before {
            must_clauses.push(serde_json::json!({ "range": { "timestamp": { "lte": created_before.to_rfc3339() } } }));
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
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse response: {}", e)))?;

        let mut results = Vec::new();
        let total = body.get("hits").and_then(|h| h.get("total")).and_then(|t| t.get("value")).and_then(|v| v.as_u64()).unwrap_or(0);

        if let Some(hits) = body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
            for hit in hits {
                if let Some(source) = hit.get("_source") {
                    let correlation = document_to_correlation(source)?;
                    results.push(correlation);
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