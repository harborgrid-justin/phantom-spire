// Storage abstraction layer for phantom-cve-core
// Provides database-agnostic interfaces and implementations for multiple backends

pub mod traits;
pub mod local;
pub mod postgres;
pub mod elasticsearch;
pub mod mongodb;

pub use traits::*;
pub use local::LocalStorage;
pub use postgres::PostgresStorage;
pub use elasticsearch::ElasticsearchStorage;
pub use mongodb::MongoDbStorage;

use crate::config::{DatabaseConfig, DatabaseType};
use crate::models::CVEAnalysisResult;
use std::sync::Arc;

/// Factory function to create appropriate storage backend based on configuration
pub async fn create_storage(config: &DatabaseConfig) -> Result<Arc<dyn Storage>, StorageError> {
    match config.db_type {
        DatabaseType::Local => {
            let storage = LocalStorage::new(&config.local)?;
            Ok(Arc::new(storage))
        },
        DatabaseType::Postgres => {
            let storage = PostgresStorage::new(&config.postgres).await?;
            Ok(Arc::new(storage))
        },
        DatabaseType::Elasticsearch => {
            let storage = ElasticsearchStorage::new(&config.elasticsearch).await?;
            Ok(Arc::new(storage))
        },
        DatabaseType::MongoDB => {
            let storage = MongoDbStorage::new(&config.mongodb).await?;
            Ok(Arc::new(storage))
        },
    }
}

/// Storage error types
#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("Connection error: {0}")]
    ConnectionError(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Serialization error: {0}")]
    SerializationError(String),
    
    #[error("Configuration error: {0}")]
    ConfigurationError(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("IO error: {0}")]
    IoError(String),
}