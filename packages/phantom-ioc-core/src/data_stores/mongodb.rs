//! MongoDB IOC Data Store Implementation
//!
//! Scalable MongoDB-based storage for IOC data with document-oriented
//! storage, indexing, and aggregation capabilities.

use async_trait::async_trait;
use mongodb::{
    Client, Database, bson::doc,
    options::ClientOptions,
};
use serde::{Deserialize, Serialize};

// Re-export configuration
pub mod config;
pub use config::*;

// Re-export conversions
pub mod conversions;
pub use conversions::*;

// Re-export indexes
pub mod indexes;
pub use indexes::*;

// Re-export trait implementations
pub mod impl_ioc_data_store;
pub mod impl_ioc_store;
pub mod impl_ioc_result_store;
pub mod impl_enriched_ioc_store;
pub mod impl_correlation_store;
pub mod impl_comprehensive_ioc_store;

// Re-export all traits for convenience
pub use impl_ioc_data_store::*;
pub use impl_ioc_store::*;
pub use impl_ioc_result_store::*;
pub use impl_enriched_ioc_store::*;
pub use impl_correlation_store::*;
pub use impl_comprehensive_ioc_store::*;

/// MongoDB IOC Data Store
pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Create a new MongoDB data store
    pub async fn new(config: MongoDBConfig) -> crate::data_stores::types::DataStoreResult<Self> {
        let mut client_options = ClientOptions::parse(&config.connection_string).await
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to parse connection string: {}", e)))?;

        client_options.max_pool_size = Some(config.max_pool_size);

        let client = Client::with_options(client_options)
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to create MongoDB client: {}", e)))?;

        // Test connection
        client.database("admin").run_command(doc! { "ping": 1 }, None).await
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to connect to MongoDB: {}", e)))?;

        let database = client.database(&config.database);

        let store = Self { config, client, database };

        // Create indexes
        indexes::create_indexes(&store.database, &store.config.collection_prefix).await?;

        Ok(store)
    }
}

/// MongoDB-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    pub connection_string: String,
    pub database: String,
    pub collection_prefix: String,
    pub connection_timeout_ms: u64,
    pub max_pool_size: u32,
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            connection_string: "mongodb://localhost:27017".to_string(),
            database: "phantom_ioc".to_string(),
            collection_prefix: "phantom_ioc_".to_string(),
            connection_timeout_ms: 30000,
            max_pool_size: 10,
        }
    }
}

/// MongoDB IOC Data Store
pub struct MongoDataStore {
    pub config: MongoDBConfig,
    pub client: Client,
    pub database: Database,
}

impl MongoDataStore {
    /// Create a new MongoDB data store
    pub async fn new(config: MongoDBConfig) -> crate::data_stores::types::DataStoreResult<Self> {
        let mut client_options = ClientOptions::parse(&config.connection_string).await
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to parse connection string: {}", e)))?;

        client_options.max_pool_size = Some(config.max_pool_size);

        let client = Client::with_options(client_options)
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to create MongoDB client: {}", e)))?;

        // Test connection
        client.database("admin").run_command(doc! { "ping": 1 }, None).await
            .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to connect to MongoDB: {}", e)))?;

        let database = client.database(&config.database);

        let store = Self { config, client, database };

        // Create indexes
        indexes::create_indexes(&store.database, &store.config.collection_prefix).await?;

        Ok(store)
    }
}