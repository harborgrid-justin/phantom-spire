//! Elasticsearch connection management module
//!
//! This module provides connection management and client creation for Elasticsearch.

use elasticsearch::{
    Elasticsearch, ElasticsearchBuilder,
    http::transport::Transport,
};
use serde_json::Value;

use crate::data_stores::types::{DataStoreResult, DataStoreError};
use super::config::ElasticsearchConfig;

/// Elasticsearch data store with connection management
pub struct ElasticsearchDataStore {
    pub config: ElasticsearchConfig,
    pub client: Elasticsearch,
}

impl ElasticsearchDataStore {
    /// Create a new Elasticsearch data store
    pub async fn new(config: ElasticsearchConfig) -> DataStoreResult<Self> {
        let transport = Transport::single_node(&config.hosts[0])
            .map_err(|e| DataStoreError::Connection(format!("Failed to create transport: {}", e)))?;

        let client = Elasticsearch::new(transport);

        // Test connection
        let response = client
            .info()
            .send()
            .await
            .map_err(|e| DataStoreError::Connection(format!("Failed to connect to Elasticsearch: {}", e)))?;

        if !response.status_code().is_success() {
            return Err(DataStoreError::Connection("Elasticsearch connection failed".to_string()));
        }

        let store = Self { config, client };

        // Create indexes
        store.create_indexes().await?;

        Ok(store)
    }

    /// Get IOC index name
    pub fn ioc_index(&self) -> String {
        format!("{}iocs", self.config.index_prefix)
    }

    /// Get results index name
    pub fn results_index(&self) -> String {
        format!("{}results", self.config.index_prefix)
    }

    /// Get enriched index name
    pub fn enriched_index(&self) -> String {
        format!("{}enriched", self.config.index_prefix)
    }

    /// Get correlations index name
    pub fn correlations_index(&self) -> String {
        format!("{}correlations", self.config.index_prefix)
    }

    /// Create Elasticsearch indexes with mappings
    pub async fn create_indexes(&self) -> DataStoreResult<()> {
        // IOC index mapping
        let ioc_mapping = serde_json::json!({
            "mappings": {
                "properties": {
                    "tenant_id": { "type": "keyword" },
                    "id": { "type": "keyword" },
                    "indicator_type": { "type": "keyword" },
                    "value": { "type": "text", "analyzer": "standard" },
                    "confidence": { "type": "float" },
                    "severity": { "type": "keyword" },
                    "source": { "type": "keyword" },
                    "timestamp": { "type": "date" },
                    "tags": { "type": "keyword" },
                    "context": { "type": "object" },
                    "raw_data": { "type": "text" }
                }
            }
        });

        self.create_index_if_not_exists(&self.ioc_index(), ioc_mapping).await?;

        // Results index mapping
        let results_mapping = serde_json::json!({
            "mappings": {
                "properties": {
                    "tenant_id": { "type": "keyword" },
                    "ioc": { "type": "object" },
                    "detection_result": { "type": "object" },
                    "intelligence": { "type": "object" },
                    "correlations": { "type": "object" },
                    "analysis": { "type": "object" },
                    "processing_timestamp": { "type": "date" }
                }
            }
        });

        self.create_index_if_not_exists(&self.results_index(), results_mapping).await?;

        // Enriched index mapping
        let enriched_mapping = serde_json::json!({
            "mappings": {
                "properties": {
                    "tenant_id": { "type": "keyword" },
                    "base_ioc": { "type": "keyword" },
                    "enrichment_data": { "type": "object" },
                    "source": { "type": "keyword" },
                    "enrichment_type": { "type": "keyword" },
                    "confidence": { "type": "float" },
                    "confidence_boost": { "type": "float" },
                    "created_at": { "type": "date" }
                }
            }
        });

        self.create_index_if_not_exists(&self.enriched_index(), enriched_mapping).await?;

        // Correlations index mapping
        let correlations_mapping = serde_json::json!({
            "mappings": {
                "properties": {
                    "tenant_id": { "type": "keyword" },
                    "id": { "type": "keyword" },
                    "correlated_iocs": { "type": "keyword" },
                    "correlation_type": { "type": "keyword" },
                    "strength": { "type": "float" },
                    "evidence": { "type": "keyword" },
                    "timestamp": { "type": "date" }
                }
            }
        });

        self.create_index_if_not_exists(&self.correlations_index(), correlations_mapping).await?;

        Ok(())
    }

    /// Create index if it doesn't exist
    pub async fn create_index_if_not_exists(&self, index_name: &str, mapping: Value) -> DataStoreResult<()> {
        let response = self.client
            .indices()
            .exists(elasticsearch::indices::IndicesExistsParts::Index(&[index_name]))
            .send()
            .await
            .map_err(|e| DataStoreError::Internal(format!("Failed to check index existence: {}", e)))?;

        if response.status_code() == elasticsearch::http::StatusCode::NOT_FOUND {
            let create_response = self.client
                .indices()
                .create(elasticsearch::indices::IndicesCreateParts::Index(index_name))
                .body(mapping)
                .send()
                .await
                .map_err(|e| DataStoreError::Internal(format!("Failed to create index {}: {}", index_name, e)))?;

            if !create_response.status_code().is_success() {
                let body = create_response.text().await.unwrap_or_default();
                return Err(DataStoreError::Internal(format!("Failed to create index {}: {}", index_name, body)));
            }
        }

        Ok(())
    }
}