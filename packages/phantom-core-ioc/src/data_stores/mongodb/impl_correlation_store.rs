//! CorrelationStore Trait Implementation
//!
//! Implementation of the CorrelationStore trait for MongoDB.

use async_trait::async_trait;
use mongodb::{Database, Collection, bson::doc, options::FindOptions};
use futures::stream::TryStreamExt;
use uuid::Uuid;
use chrono::Utc;

use crate::data_stores::types::*;
use crate::data_stores::core_traits::CorrelationStore;
use super::config::MongoDBConfig;

pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: mongodb::Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Get correlations collection
    fn correlations_collection(&self) -> Collection<mongodb::bson::Document> {
        self.database.collection(&format!("{}correlations", self.config.collection_prefix))
    }
}

#[async_trait]
impl CorrelationStore for MongoDataStore {
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let collection = self.correlations_collection();

        let mut success_count = 0;
        let mut errors = Vec::new();

        for correlation in correlations {
            let correlated_iocs: Vec<String> = correlation.correlated_iocs.iter()
                .map(|uuid| uuid.to_string())
                .collect();

            let doc = doc! {
                "tenant_id": &context.tenant_id,
                "id": correlation.id.to_string(),
                "correlated_iocs": correlated_iocs,
                "correlation_type": &correlation.correlation_type,
                "strength": correlation.strength,
                "evidence": mongodb::bson::to_bson(&correlation.evidence).unwrap_or(mongodb::bson::Bson::Array(vec![])),
                "timestamp": correlation.timestamp,
            };

            match collection.insert_one(doc).await {
                Ok(_) => success_count += 1,
                Err(e) => errors.push(format!("Failed to store correlation for IOC {}: {}", correlation.id, e)),
            }
        }

        Ok(BulkOperationResult {
            total_requested: correlations.len(),
            successful: success_count,
            failed: errors.len(),
            failed_ids: vec![],
            processing_time_ms: 0,
        })
    }

    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>> {
        let collection = self.correlations_collection();

        let filter = doc! { "tenant_id": &context.tenant_id, "correlated_iocs": ioc_id.to_string() };
        let options = FindOptions::builder().sort(doc! { "timestamp": -1 }).build();

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to get correlations: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect correlations: {}", e)))?;

        let mut results = Vec::new();
        for doc in docs {
            let correlation = Correlation {
                id: Uuid::parse_str(doc.get_str("id").unwrap_or("")).unwrap_or(Uuid::new_v4()),
                correlated_iocs: doc.get_array("correlated_iocs")
                    .unwrap_or(&vec![])
                    .iter()
                    .filter_map(|id| id.as_str())
                    .filter_map(|id_str| Uuid::parse_str(id_str).ok())
                    .collect(),
                correlation_type: doc.get_str("correlation_type").unwrap_or("unknown").to_string(),
                strength: doc.get_f64("strength").unwrap_or(0.0),
                evidence: mongodb::bson::from_bson(doc.get("evidence").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![]))).unwrap_or_default(),
                timestamp: doc.get_datetime("timestamp").map(|dt| dt.to_chrono()).unwrap_or_else(|_| Utc::now()),
            };
            results.push(correlation);
        }

        Ok(results)
    }

    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let collection = self.correlations_collection();

        collection.delete_many(doc! { "tenant_id": &context.tenant_id, "correlated_iocs": ioc_id.to_string() }).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to delete correlations: {}", e)))?;

        Ok(())
    }

    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>> {
        let collection = self.correlations_collection();

        let mut filter = doc! { "tenant_id": &context.tenant_id };
        let mut options = FindOptions::default();

        // Add confidence filters
        if let Some(min_conf) = criteria.confidence_min {
            filter.insert("strength", doc! { "$gte": min_conf });
        }

        options.sort = Some(doc! { "strength": -1 });

        // Add pagination
        if let Some(limit) = criteria.limit {
            options.limit = Some(limit as i64);
        }

        if let Some(offset) = criteria.offset {
            options.skip = Some(offset as u64);
        }

        let cursor = collection.find(filter).await
            .map_err(|e| DataStoreError::Internal(format!("Failed to search correlations: {}", e)))?;

        let docs: Vec<mongodb::bson::Document> = cursor.try_collect().await
            .map_err(|e| DataStoreError::Internal(format!("Failed to collect search results: {}", e)))?;

        let mut results = Vec::new();
        for doc in docs {
            let correlation = Correlation {
                id: Uuid::parse_str(doc.get_str("id").unwrap_or("")).unwrap_or(Uuid::new_v4()),
                correlated_iocs: doc.get_array("correlated_iocs").unwrap_or(&vec![]).iter()
                    .filter_map(|id| id.as_str())
                    .filter_map(|id_str| Uuid::parse_str(id_str).ok())
                    .collect(),
                correlation_type: doc.get_str("correlation_type").unwrap_or("unknown").to_string(),
                strength: doc.get_f64("strength").unwrap_or(0.0),
                evidence: mongodb::bson::from_bson(doc.get("evidence").cloned().unwrap_or(mongodb::bson::Bson::Array(vec![]))).unwrap_or_default(),
                timestamp: doc.get_datetime("timestamp").map(|dt| dt.to_chrono()).unwrap_or_else(|_| Utc::now()),
            };
            results.push(correlation);
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