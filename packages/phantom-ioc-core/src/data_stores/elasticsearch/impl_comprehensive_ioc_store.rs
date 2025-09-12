//! ComprehensiveIOCStore trait implementation for Elasticsearch
//!
//! This module implements the ComprehensiveIOCStore trait for Elasticsearch.

use async_trait::async_trait;
use std::collections::HashMap;
use serde_json::Value;
use uuid::Uuid;

use crate::models::IOC;
use crate::data_stores::types::{
    ComprehensiveIOCStore, SearchResults, BulkOperationResult,
    DataStoreResult, DataStoreError, TenantContext
};
use super::connection::ElasticsearchDataStore;
use super::conversions::document_to_ioc;

#[async_trait]
impl ComprehensiveIOCStore for ElasticsearchDataStore {
    fn store_type(&self) -> &'static str {
        "elasticsearch"
    }

    fn supports_multi_tenancy(&self) -> bool {
        true
    }

    fn supports_full_text_search(&self) -> bool {
        true
    }

    fn supports_transactions(&self) -> bool {
        false
    }

    fn supports_bulk_operations(&self) -> bool {
        true
    }

    fn max_batch_size(&self) -> usize {
        1000
    }

    async fn initialize(&self) -> DataStoreResult<()> {
        // Indexes are already created in new()
        Ok(())
    }

    async fn close(&self) -> DataStoreResult<()> {
        // Elasticsearch client handles connection management
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        let response = self.client
            .cluster()
            .health(elasticsearch::cluster::ClusterHealthParts::None)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Health check failed: {}", e)))?;

        let body: Value = response.json().await
            .map_err(|e| DataStoreError::Serialization(format!("Failed to parse health response: {}", e)))?;

        let status = body.get("status")
            .and_then(|v| v.as_str())
            .unwrap_or("red");

        Ok(status == "green" || status == "yellow")
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<crate::data_stores::types::DataStoreMetrics> {
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

        let count = if response.status_code().is_success() {
            let body: Value = response.json().await
                .map_err(|e| DataStoreError::Serialization(format!("Failed to parse count response: {}", e)))?;
            body.get("count")
                .and_then(|v| v.as_u64())
                .unwrap_or(0)
        } else {
            0
        };

        // Get cluster stats (simplified)
        let response = self.client
            .cluster()
            .stats(elasticsearch::cluster::ClusterStatsParts::None)
            .send()
            .await
            .ok();

        let storage_size = if let Some(resp) = response {
            if let Ok(body) = resp.json::<Value>().await {
                body.get("indices")
                    .and_then(|i| i.get("store"))
                    .and_then(|s| s.get("size_in_bytes"))
                    .and_then(|v| v.as_u64())
            } else {
                None
            }
        } else {
            None
        };

        Ok(crate::data_stores::types::DataStoreMetrics {
            total_operations: count as u64,
            successful_operations: count as u64,
            failed_operations: 0,
            average_response_time_ms: 0.0,
            connections_active: 1,
            connections_idle: 0,
            memory_usage_bytes: storage_size.unwrap_or(0),
            last_health_check: chrono::Utc::now(),
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

            let doc = super::conversions::ioc_to_document(ioc, &context.tenant_id);
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

    async fn bulk_delete_iocs(&self, ids: &[Uuid], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let index = self.ioc_index();

        let mut body = Vec::new();

        for id in ids {
            let delete_op = serde_json::json!({
                "delete": {
                    "_index": index,
                    "_id": id.to_string()
                }
            });

            body.push(delete_op);
        }

        let response = self.client
            .bulk(elasticsearch::BulkParts::Index(&index))
            .body(serde_json::to_string(&body).map_err(|e| DataStoreError::Serialization(format!("Failed to serialize bulk body: {}", e)))?)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Bulk delete failed: {}", e)))?;

        if !response.status_code().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(DataStoreError::Internal(format!("Bulk delete failed: {}", body)));
        }

        Ok(BulkOperationResult {
            total_requested: ids.len(),
            successful: ids.len(),
            failed: 0,
            failed_ids: vec![],
            processing_time_ms: 0,
        })
    }

    async fn search_iocs_advanced(&self, query: &str, filters: Option<HashMap<String, String>>, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let index = self.ioc_index();

        let mut search_body = serde_json::json!({
            "query": {
                "bool": {
                    "must": [
                        { "query_string": { "query": query, "default_field": "value" } },
                        { "term": { "tenant_id": context.tenant_id } }
                    ]
                }
            },
            "size": 100
        });

        // Add additional filters
        if let Some(filters) = filters {
            let must_clauses = search_body["query"]["bool"]["must"].as_array_mut().unwrap();

            if let Some(indicator_type) = filters.get("indicator_type") {
                must_clauses.push(serde_json::json!({ "term": { "indicator_type": indicator_type } }));
            }

            if let Some(source) = filters.get("source") {
                must_clauses.push(serde_json::json!({ "term": { "source": source } }));
            }
        }

        let response = self.client
            .search(elasticsearch::SearchParts::Index(&[&index]))
            .body(search_body)
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Advanced search failed: {}", e)))?;

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
            limit: 100,
            offset: 0,
            has_more: total > 100,
        })
    }
}