// phantom-ioc-core/src/storage/mod.rs
// Storage layer for IOC Core

pub mod traits;
pub mod local;
pub mod postgres;
pub mod mongodb;
pub mod elasticsearch;
pub mod redis;

pub use traits::*;
pub use local::LocalStorage;

#[cfg(feature = "postgres")]
pub use postgres::PostgreSQLStorage;

#[cfg(feature = "mongodb")]
pub use mongodb::MongoDBStorage;

#[cfg(feature = "elasticsearch")]
pub use elasticsearch::ElasticsearchStorage;

#[cfg(feature = "redis")]
pub use redis::RedisStorage;

use crate::config::StorageBackend;
use std::sync::Arc;

/// Storage factory for creating storage backends
pub struct StorageFactory;

impl StorageFactory {
    /// Create a storage backend based on configuration
    pub async fn create_storage(
        backend: StorageBackend,
        connection_string: Option<String>,
    ) -> Result<Arc<dyn IOCStorage>, StorageError> {
        match backend {
            StorageBackend::Local => {
                let storage = LocalStorage::new().await?;
                Ok(Arc::new(storage))
            },
            #[cfg(feature = "postgres")]
            StorageBackend::PostgreSQL => {
                let conn_str = connection_string
                    .ok_or_else(|| StorageError::Configuration("PostgreSQL connection string required".to_string()))?;
                let storage = PostgreSQLStorage::new(&conn_str).await?;
                Ok(Arc::new(storage))
            },
            #[cfg(not(feature = "postgres"))]
            StorageBackend::PostgreSQL => {
                Err(StorageError::Configuration("PostgreSQL support not compiled".to_string()))
            },
            #[cfg(feature = "mongodb")]
            StorageBackend::MongoDB => {
                let conn_str = connection_string
                    .ok_or_else(|| StorageError::Configuration("MongoDB connection string required".to_string()))?;
                let storage = MongoDBStorage::new(&conn_str).await?;
                Ok(Arc::new(storage))
            },
            #[cfg(not(feature = "mongodb"))]
            StorageBackend::MongoDB => {
                Err(StorageError::Configuration("MongoDB support not compiled".to_string()))
            },
            #[cfg(feature = "elasticsearch")]
            StorageBackend::Elasticsearch => {
                let conn_str = connection_string
                    .ok_or_else(|| StorageError::Configuration("Elasticsearch connection string required".to_string()))?;
                let storage = ElasticsearchStorage::new(&conn_str).await?;
                Ok(Arc::new(storage))
            },
            #[cfg(not(feature = "elasticsearch"))]
            StorageBackend::Elasticsearch => {
                Err(StorageError::Configuration("Elasticsearch support not compiled".to_string()))
            },
            #[cfg(feature = "redis")]
            StorageBackend::Redis => {
                let conn_str = connection_string
                    .ok_or_else(|| StorageError::Configuration("Redis connection string required".to_string()))?;
                let storage = RedisStorage::new(&conn_str).await?;
                Ok(Arc::new(storage))
            },
            #[cfg(not(feature = "redis"))]
            StorageBackend::Redis => {
                Err(StorageError::Configuration("Redis support not compiled".to_string()))
            },
        }
    }
}