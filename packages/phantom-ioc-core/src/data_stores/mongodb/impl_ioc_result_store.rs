//! IOCResultStore Trait Implementation
//!
//! Implementation of the IOCResultStore trait for MongoDB.

use async_trait::async_trait;
use mongodb::{Database, Collection, bson::doc, options::FindOptions};
use futures::stream::TryStreamExt;
use uuid::Uuid;
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCResultStore;
use super::config::MongoDBConfig;

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: mongodb::Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Get IOC results collection
    fn results_collection(&self) -> Collection<mongodb::bson::Document> {
        self.database.collection(&format!("{}results", self.config.collection_prefix))
    }
}

#[async_trait]
impl IOCResultStore for MongoDataStore {
    async fn store_result(&self, result: &IOCResult, context: &TenantContext) -> DataStoreResult<String> {
        let collection = self.results_collection();

        let doc = doc! {
            "tenant_id": &context.tenant_id,
            "ioc": mongodb::bson::to_bson(&result.ioc).unwrap_or(mongodb::bson::Bson::Document(doc!{})),
            "detection_result": mongodb::bson::to_bson(&result.detection_result).unwrap_or(mongodb::bson::Bson::Document(doc!{})),
            "intelligence": mongodb::bson::to_bson(&result.intelligence).unwrap_or(mongodb::bson::Bson::Document(doc!{})),
            "correlations": mongodb::bson::to_bson(&result.correlations).unwrap_or(mongodb::bson::Bson::Array(vec![])),
            "analysis": mongodb::bson::to_bson(&result.analysis).unwrap_or(mongodb::bson::Bson::Document(doc!{})),
            "processing_timestamp": result.processing_timestamp,
        };

        collection.replace_one(doc! { "tenant_id": &context.tenant_id, "ioc_id": result.ioc.id.to_string() }, doc).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC result: {}", e)))?;

        Ok(result.ioc.id.to_string())
    }

    async fn get_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOCResult>> {
        let collection = self.results_collection();

        let doc = collection.find_one(doc! { "tenant_id": &context.tenant_id, "ioc.id": ioc_id.to_string() }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC result: {}", e)))?;

        match doc {
            Some(doc) => {
                let result = IOCResult {
                    ioc: mongodb::bson::from_bson(doc.get("ioc").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{})))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize ioc: {}", e)))?,
                    detection_result: mongodb::bson::from_bson(doc.get("detection_result").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{})))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize detection_result: {}", e)))?,
                    intelligence: mongodb::bson::from_bson(doc.get("intelligence").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{})))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize intelligence: {}", e)))?,
                    correlations: mongodb::bson::from_bson(doc.get("correlations").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![])))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize correlations: {}", e)))?,
                    analysis: mongodb::bson::from_bson(doc.get("analysis").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{})))
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to deserialize analysis: {}", e)))?,
                    processing_timestamp: doc.get_datetime("processing_timestamp")
                        .map_err(|e| DataStoreError::Serialization(format!("Failed to get processing_timestamp: {}", e)))?
                        .to_chrono(),
                };
                Ok(Some(result))
            }
            None => Ok(None)
        }
    }

    async fn delete_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let collection = self.results_collection();

        let result = collection.delete_one(doc! { "tenant_id": &context.tenant_id, "ioc.id": ioc_id.to_string() }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC result: {}", e)))?;

        if result.deleted_count == 0 {
            return Err(DataStoreError::NotFound(format!("IOC result for {} not found", ioc_id)));
        }

        Ok(())
    }

    async fn search_results(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOCResult>> {
        let collection = self.results_collection();

        let mut filter = doc! { "tenant_id": &context.tenant_id };
        let mut options = FindOptions::default();

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            filter.insert("ioc.confidence", doc! { "$gte": min_conf });
        }

        options.sort = Some(doc! { "ioc.confidence": -1 });

        // Add pagination
        if let Some(limit) = criteria.limit {
            options.limit = Some(limit as i64);
        }

        if let Some(offset) = criteria.offset {
            options.skip = Some(offset as u64);
        }

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOC results: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect search results: {}", e)))?;

        let mut results = Vec::new();
        for doc in docs {
            let result = IOCResult {
                ioc: mongodb::bson::from_bson(doc.get("ioc").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{}))).unwrap_or_default(),
                detection_result: mongodb::bson::from_bson(doc.get("detection_result").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{}))).unwrap_or_default(),
                intelligence: mongodb::bson::from_bson(doc.get("intelligence").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{}))).unwrap_or_default(),
                correlations: mongodb::bson::from_bson(doc.get("correlations").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![]))).unwrap_or_default(),
                analysis: mongodb::bson::from_bson(doc.get("analysis").cloned().unwrap_or(mongodb::bson::Bson::Document(doc!{}))).unwrap_or_default(),
                processing_timestamp: doc.get_datetime("processing_timestamp").map(|dt| dt.to_chrono()).unwrap_or_else(|_| Utc::now()),
            };
            results.push(result);
        }

        // Get total count
        let count_filter = doc! { "tenant_id": &context.tenant_id };
        let total_count = collection.count_documents(count_filter, None).await
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