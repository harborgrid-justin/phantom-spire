//! PostgreSQL data conversion module
//!
//! This module handles conversion between Rust types and database representations.

use crate::models::*;
use crate::data_stores::traits::DataStoreResult;
use crate::data_stores::postgres::connection::PostgreSQLDataStore;

impl PostgreSQLDataStore {
    /// Convert IOC to database row
    pub fn ioc_to_row(&self, ioc: &IOC) -> DataStoreResult<(String, String, String, f32, String, serde_json::Value, serde_json::Value, serde_json::Value)> {
        Ok((
            ioc.id.to_string(),
            serde_json::to_string(&ioc.indicator_type).map_err(|e| crate::data_stores::traits::DataStoreError::Serialization(format!("Failed to serialize indicator_type: {}", e)))?,
            ioc.value.clone(),
            ioc.confidence as f32,
            ioc.source.clone(),
            serde_json::to_value(&ioc.tags).map_err(|e| crate::data_stores::traits::DataStoreError::Serialization(format!("Failed to serialize tags: {}", e)))?,
            serde_json::to_value(&ioc.context.metadata).map_err(|e| crate::data_stores::traits::DataStoreError::Serialization(format!("Failed to serialize metadata: {}", e)))?,
            serde_json::to_value(&ioc.raw_data).map_err(|e| crate::data_stores::traits::DataStoreError::Serialization(format!("Failed to serialize raw_data: {}", e)))?,
        ))
    }
}