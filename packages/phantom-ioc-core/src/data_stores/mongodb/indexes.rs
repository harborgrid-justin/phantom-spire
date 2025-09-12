//! Database Index Management
//!
//! Index creation and management for MongoDB collections.

use mongodb::{Database, Collection, bson::doc};

use crate::data_stores::types::DataStoreResult;

/// Create database indexes for performance
pub async fn create_indexes(database: &Database, collection_prefix: &str) -> DataStoreResult<()> {
    let ioc_collection = database.collection(&format!("{}iocs", collection_prefix));

    // IOC collection indexes
    ioc_collection.create_index(doc! { "indicator_type": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create indicator_type index: {}", e)))?;

    ioc_collection.create_index(doc! { "confidence": -1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create confidence index: {}", e)))?;

    ioc_collection.create_index(doc! { "source": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create source index: {}", e)))?;

    ioc_collection.create_index(doc! { "created_at": -1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create created_at index: {}", e)))?;

    ioc_collection.create_index(doc! { "tags": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create tags index: {}", e)))?;

    // Text index for full-text search
    ioc_collection.create_index(doc! { "value": "text", "tags": "text" }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create text index: {}", e)))?;

    // Results collection indexes
    let results_collection = database.collection(&format!("{}results", collection_prefix));
    results_collection.create_index(doc! { "ioc_id": 1 }, Some(doc! { "unique": true })).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create ioc_id index on results: {}", e)))?;

    results_collection.create_index(doc! { "confidence": -1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create confidence index on results: {}", e)))?;

    // Enriched collection indexes
    let enriched_collection = database.collection(&format!("{}enriched", collection_prefix));
    enriched_collection.create_index(doc! { "ioc_id": 1 }, Some(doc! { "unique": true })).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create ioc_id index on enriched: {}", e)))?;

    enriched_collection.create_index(doc! { "source": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create source index on enriched: {}", e)))?;

    // Correlations collection indexes
    let correlations_collection = database.collection(&format!("{}correlations", collection_prefix));
    correlations_collection.create_index(doc! { "ioc_id": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create ioc_id index on correlations: {}", e)))?;

    correlations_collection.create_index(doc! { "correlation_type": 1 }, None).await
        .map_err(|e| crate::data_stores::types::DataStoreError::Internal(format!("Failed to create correlation_type index: {}", e)))?;

    Ok(())
}