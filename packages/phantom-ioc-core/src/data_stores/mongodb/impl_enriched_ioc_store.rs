//! EnrichedIOCStore Trait Implementation
//!
//! Implementation of the EnrichedIOCStore trait for MongoDB.

use async_trait::async_trait;
use mongodb::{Database, Collection, bson::doc, options::FindOptions};
use futures::stream::TryStreamExt;
use uuid::Uuid;
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::EnrichedIOCStore;
use super::config::MongoDBConfig;

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: mongodb::Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Get enriched IOCs collection
    fn enriched_collection(&self) -> Collection<mongodb::bson::Document> {
        self.database.collection(&format!("{}enriched", self.config.collection_prefix))
    }
}

#[async_trait]
impl EnrichedIOCStore for MongoDataStore {
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String> {
        let collection = self.enriched_collection();

        let doc = doc! {
            "tenant_id": &context.tenant_id,
            "base_ioc": enriched.base_ioc.id.to_string(),
            "enrichment_data": mongodb::bson::to_bson(&enriched.enrichment_data).unwrap_or(mongodb::bson::Bson::Document(doc! {})),
            "sources": mongodb::bson::to_bson(&enriched.sources).unwrap_or(mongodb::bson::Bson::Array(vec![])),
            "enrichment_timestamp": enriched.enrichment_timestamp,
        };

        collection.replace_one(doc! { "tenant_id": &context.tenant_id, "base_ioc": enriched.base_ioc.to_string() }, doc).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to store enriched IOC: {}", e)))?;

        Ok(enriched.base_ioc.to_string())
    }

    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>> {
        let collection = self.enriched_collection();

        let doc = collection.find_one(doc! { "tenant_id": &context.tenant_id, "base_ioc": ioc_id.to_string() }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get enriched IOC: {}", e)))?;

        match doc {
            Some(doc) => {
                let enriched = EnrichedIOC {
                    base_ioc: mongodb::bson::from_bson(doc.get("base_ioc").cloned().unwrap_or(mongodb::bson::Bson::String("".to_string())))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize base_ioc: {}", e)))?,
                    enrichment_data: mongodb::bson::from_bson(doc.get("enrichment_data").cloned().unwrap_or(mongodb::bson::Bson::Document(doc! {})))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize enrichment_data: {}", e)))?,
                    sources: mongodb::bson::from_bson(doc.get("sources").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![])))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize sources: {}", e)))?,
                    enrichment_timestamp: doc.get_datetime("enrichment_timestamp")
                        .map(|dt| dt.to_chrono())
                        .unwrap_or_else(|_| Utc::now()),
                };
                Ok(Some(enriched))
            }
            None => Ok(None)
        }
    }

    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let collection = self.enriched_collection();

        let result = collection.delete_one(doc! { "tenant_id": &context.tenant_id, "base_ioc": ioc_id.to_string() }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete enriched IOC: {}", e)))?;

        if result.deleted_count == 0 {
            return Err(DataStoreError::NotFound(format!("Enriched IOC {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>> {
        let collection = self.enriched_collection();

        let mut filter = doc! { "tenant_id": &context.tenant_id };
        let mut options = FindOptions::default();

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            filter.insert("base_ioc.confidence", doc! { "$gte": min_conf });
        }

        options.sort = Some(doc! { "base_ioc.confidence": -1 });

        // Add pagination
        if let Some(limit) = criteria.limit {
            options.limit = Some(limit as i64);
        }

        if let Some(offset) = criteria.offset {
            options.skip = Some(offset as u64);
        }

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search enriched IOCs: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect search results: {}", e)))?;

        let mut results = Vec::new();
        for doc in docs {
            let enriched = EnrichedIOC {
                base_ioc: mongodb::bson::from_bson(doc.get("base_ioc").cloned().unwrap_or(mongodb::bson::Bson::String("".to_string()))).unwrap_or_default(),
                enrichment_data: mongodb::bson::from_bson(doc.get("enrichment_data").cloned().unwrap_or(mongodb::bson::Bson::Document(doc! {}))).unwrap_or_default(),
                sources: mongodb::bson::from_bson(doc.get("sources").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![]))).unwrap_or_default(),
                enrichment_timestamp: doc.get_datetime("enrichment_timestamp").map(|dt| dt.to_chrono()).unwrap_or_else(|_| Utc::now()),
            };
            results.push(enriched);
        }

        // Get total count
        let count_filter = doc! { "tenant_id": &context.tenant_id };
        let total_count = collection.count_documents(count_filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get total count: {}", e)))?;

        Ok(SearchResults {
            items: results,
            total_count: total_count as usize,
            limit: criteria.limit.unwrap_or(100),
            offset: criteria.offset.unwrap_or(0),
            has_more: criteria.offset.map_or(false, |offset| criteria.limit.map_or(false, |limit| (offset + limit) < total_count.try_into().unwrap_or(usize::MAX))),
        })
    }
}