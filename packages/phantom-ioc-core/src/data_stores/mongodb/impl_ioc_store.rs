//! IOCStore Trait Implementation
//!
//! Implementation of the IOCStore trait for MongoDB.

use async_trait::async_trait;
use mongodb::{Database, Collection, bson::doc, options::{FindOptions, UpdateOptions}};
use futures::stream::TryStreamExt;
use uuid::Uuid;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::IOCStore;
use super::config::MongoDBConfig;
use super::conversions::{ioc_to_document, document_to_ioc};

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: mongodb::Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Get IOC collection
    fn ioc_collection(&self) -> Collection<mongodb::bson::Document> {
        self.database.collection(&format!("{}iocs", self.config.collection_prefix))
    }
}

#[async_trait]
impl IOCStore for MongoDataStore {
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String> {
        let collection = self.ioc_collection();
        let mut doc = ioc_to_document(ioc);
        doc.insert("tenant_id", &context.tenant_id);

        let update = doc! {
            "$set": doc,
            "$setOnInsert": { "created_at": chrono::Utc::now() }
        };

        let options = UpdateOptions::builder().upsert(true).build();

        collection.update_one(doc! { "_id": ioc.id.to_string() }, update, options).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to store IOC: {}", e)))?;

        Ok(ioc.id.to_string())
    }

    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>> {
        let collection = self.ioc_collection();

        let doc = collection.find_one(doc! { "_id": id.to_string(), "tenant_id": &context.tenant_id }, None).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get IOC: {}", e)))?;

        match doc {
            Some(doc) => {
                let ioc = document_to_ioc(doc)?;
                Ok(Some(ioc))
            }
            None => Ok(None)
        }
    }

    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()> {
        let collection = self.ioc_collection();
        let mut doc = ioc_to_document(ioc);
        doc.insert("tenant_id", &context.tenant_id);
        doc.insert("updated_at", chrono::Utc::now());

        collection.replace_one(doc! { "_id": ioc.id.to_string(), "tenant_id": &context.tenant_id }, doc, None).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to update IOC: {}", e)))?;

        Ok(())
    }

    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let collection = self.ioc_collection();

        let result = collection.delete_one(doc! { "_id": id.to_string(), "tenant_id": &context.tenant_id }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete IOC: {}", e)))?;

        if result.deleted_count == 0 {
            return Err(DataStoreError::NotFound(format!("IOC {} not found", id)));
        }

        Ok(())
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let collection = self.ioc_collection();

        let mut filter = doc! { "tenant_id": &context.tenant_id };
        let mut options = FindOptions::default();

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            filter.insert("confidence", doc! { "$gte": min_conf });
        }

        // Add sorting
        options.sort = Some(doc! { "created_at": -1 });

        // Add pagination
        if let Some(limit) = criteria.limit {
            options.limit = Some(limit as i64);
        }

        if let Some(offset) = criteria.offset {
            options.skip = Some(offset as u64);
        }

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search IOCs: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect search results: {}", e)))?;

        let mut results = Vec::new();
        for doc in docs {
            match document_to_ioc(doc) {
                Ok(ioc) => results.push(ioc),
                Err(e) => log::warn!("Failed to deserialize IOC: {}", e),
            }
        }

        // Get total count for pagination
        let count_filter = doc! { "tenant_id": &context.tenant_id };
        let total_count = collection.count_documents(count_filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get total count: {}", e)))?;

        Ok(SearchResults {
            items: results,
            total_count,
            has_more: criteria.offset.map_or(false, |offset| criteria.limit.map_or(false, |limit| (offset + limit) < total_count.try_into().unwrap_or(usize::MAX))),
        })
    }

    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let collection = self.ioc_collection();

        let docs: Vec<mongodb::bson::Document> = iocs.iter()
            .map(|ioc| {
                let mut doc = ioc_to_document(ioc);
                doc.insert("tenant_id", &context.tenant_id);
                doc
            })
            .collect();

        match collection.insert_many(docs).await {
            Ok(result) => Ok(BulkOperationResult {
                total_requested: iocs.len(),
                successful: result.inserted_ids.len(),
                failed: 0,
                failed_ids: vec![],
                processing_time_ms: 0,
            }),
            Err(e) => Ok(BulkOperationResult {
                total_requested: iocs.len(),
                successful: 0,
                failed: iocs.len(),
                failed_ids: vec![],
                processing_time_ms: 0,
            })
        }
    }

    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>> {
        let collection = self.ioc_collection();

        let filter = doc! { "tenant_id": &context.tenant_id };
        let options = mongodb::options::FindOptions::builder()
            .projection(doc! { "_id": 1 })
            .sort(doc! { "created_at": -1 })
            .build();

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to list IOC IDs: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect IOC IDs: {}", e)))?;

        let mut ids = Vec::new();
        for doc in docs {
            if let Ok(id_str) = doc.get_str("_id") {
                if let Ok(id) = Uuid::parse_str(id_str) {
                    ids.push(id);
                }
            }
        }

        Ok(ids)
    }
}