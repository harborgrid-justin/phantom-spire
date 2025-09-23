//! IOCStore trait implementation for Elasticsearch
//!
//! This module implements the IOCStore trait for Elasticsearch.

use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

use crate::models::IOC;
use crate::data_stores::types::{
    IOCStore, IOCSearchCriteria, SearchResults, BulkOperationResult,
    DataStoreResult, DataStoreError, TenantContext
};
use super::connection::ElasticsearchDataStore;
use super::conversions::{ioc_to_document, document_to_ioc};

#[async_trait]
impl IOCStore for ElasticsearchDataStore {
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String> {
        let index = self.ioc_index();

        let doc = ioc_to_document(ioc, &context.tenant_id);

        let response = self.client
            .index(elasticsearch::IndexParts::IndexId(&index, &ioc.id.to_string()))
            .body(doc)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to index IOC: {}", body)));
        }

        Ok(ioc.id.to_string())
    }

    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>> {
        let index = self.ioc_index();

        let response = self.client
            .get(elasticsearch::GetParts::IndexId(&index, &id.to_string()))
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC: {}", e)))?;

        if response.status_code() == elasticsearch::http::StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to get IOC: {}", body)));
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

            let ioc = document_to_ioc(source)?;
            Ok(Some(ioc))
        } else {
            Ok(None)
        }
    }

    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()> {
        let index = self.ioc_index();

        let doc = serde_json::json!({
            "doc": ioc_to_document(ioc, &context.tenant_id)
        });

        let response = self.client
            .update(elasticsearch::UpdateParts::IndexId(&index, &ioc.id.to_string()))
            .body(doc)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to update IOC: {}", body)));
        }

        Ok(())
    }

    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let index = self.ioc_index();

        let response = self.client
            .delete(elasticsearch::DeleteParts::IndexId(&index, &id.to_string()))
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Failed to delete IOC: {}", body)));
        }

        Ok(())
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let index = self.ioc_index();

        let mut must_clauses = vec![serde_json::json!({ "term": { "tenant_id": context.tenant_id } })];

        if let Some(ioc_type) = &criteria.ioc_type {
            must_clauses.push(serde_json::json!({ "term": { "indicator_type": ioc_type } }));
        }

        if let Some(value_pattern) = &criteria.value_pattern {
            must_clauses.push(serde_json::json!({ "wildcard": { "value": format!("*{}*", value_pattern) } }));
        }

        if let Some(source) = &criteria.source {
            must_clauses.push(serde_json::json!({ "term": { "source": source } }));
        }

        if let Some(confidence_min) = criteria.confidence_min {
            must_clauses.push(serde_json::json!({ "range": { "confidence": { "gte": confidence_min } } }));
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
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse search response: {}", e)))?;

        let mut iocs = Vec::new();
        let total = body.get("hits").and_then(|h| h.get("total")).and_then(|t| t.get("value")).and_then(|v| v.as_u64()).unwrap_or(0);

        if let Some(hits) = body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
            for hit in hits {
                if let Some(source) = hit.get("_source") {
                    match document_to_ioc(source) {
                        Ok(ioc) => iocs.push(ioc),
                        Err(e) => log::warn!("Failed to deserialize IOC: {}", e),
                    }
                }
            }
        }

        Ok(SearchResults {
            items: iocs,
            total_count: total as usize,
            limit: criteria.limit.unwrap_or(100),
            offset: criteria.offset.unwrap_or(0),
            has_more: total > (criteria.offset.unwrap_or(0) + criteria.limit.unwrap_or(100)) as u64,
        })
    }

    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let index = self.ioc_index();

        let mut body = Vec::new();

        for ioc in iocs {
            let header = serde_json::json!({
                "index": {
                    "_index": index,
                    "_id": ioc.id.to_string()
                }
            });

            let doc = ioc_to_document(ioc, &context.tenant_id);
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
                total_requested: iocs.len(),
                successful: iocs.len() - error_items,
                failed: error_items,
                failed_ids: vec![],
                processing_time_ms: 0,
            })
        } else {
            Ok(BulkOperationResult {
                total_requested: iocs.len(),
                successful: iocs.len(),
                failed: 0,
                failed_ids: vec![],
                processing_time_ms: 0,
            })
        }
    }

    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>> {
        let index = self.ioc_index();

        let search_body = serde_json::json!({
            "query": {
                "term": { "tenant_id": context.tenant_id }
            },
            "_source": ["id"],
            "size": 10000
        });

        let response = self.client
            .search(elasticsearch::SearchParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to list IOC IDs: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Search failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse response: {}", e)))?;

        let mut ids = Vec::new();

        if let Some(hits) = body.get("hits").and_then(|h| h.get("hits")).and_then(|h| h.as_array()) {
            for hit in hits {
                if let Some(source) = hit.get("_source") {
                    if let Some(id_str) = source.get("id").and_then(|v| v.as_str()) {
                        if let Ok(id) = Uuid::parse_str(id_str) {
                            ids.push(id);
                        }
                    }
                }
            }
        }

        Ok(ids)
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let index = self.ioc_index();

        let search_body = serde_json::json!({
            "query": {
                "term": { "tenant_id": context.tenant_id }
            }
        });

        let response = self.client
            .count(elasticsearch::CountParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC count: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Count failed: {}", body)));
        }

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse count response: {}", e)))?;

        let count = body.get("count")
            .and_then(|v| v.as_u64())
            .unwrap_or(0);

        Ok(count)
    }
}