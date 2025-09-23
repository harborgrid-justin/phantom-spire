// phantom-threat-actor-core/src/storage/mod.rs
// Storage layer for Threat Actor Core

pub mod traits;
pub mod local;
#[cfg(feature = "postgres-store")]
pub mod postgres;
#[cfg(feature = "mongodb-store")]
pub mod mongodb;
#[cfg(feature = "redis-store")]
pub mod redis;
#[cfg(feature = "elasticsearch-store")]
pub mod elasticsearch;

pub use traits::*;
pub use local::LocalStorage;
#[cfg(feature = "postgres-store")]
pub use postgres::PostgresStorage;
#[cfg(feature = "mongodb-store")]
pub use mongodb::MongoDBStorage;
#[cfg(feature = "redis-store")]
pub use redis::RedisStorage;
#[cfg(feature = "elasticsearch-store")]
pub use elasticsearch::ElasticsearchStorage;

use crate::config::StorageBackend;
use std::sync::Arc;

/// Storage factory for creating storage backends
pub struct StorageFactory;

impl StorageFactory {
    /// Create a storage backend based on configuration
    pub async fn create_storage(
        backend: StorageBackend,
        connection_string: Option<String>,
    ) -> Result<Arc<dyn ThreatActorStorage>, StorageError> {
        match backend {
            StorageBackend::Local => {
                let storage = LocalStorage::new().await?;
                Ok(Arc::new(storage))
            },
            StorageBackend::PostgreSQL => {
                #[cfg(feature = "postgres-store")]
                {
                    let connection_string = connection_string.ok_or_else(|| {
                        StorageError::Configuration("PostgreSQL connection string required".to_string())
                    })?;
                    let storage = PostgresStorage::new(&connection_string).await?;
                    Ok(Arc::new(storage))
                }
                #[cfg(not(feature = "postgres-store"))]
                {
                    Err(StorageError::Configuration("PostgreSQL storage not enabled. Enable with 'postgres-store' feature".to_string()))
                }
            },
            StorageBackend::MongoDB => {
                #[cfg(feature = "mongodb-store")]
                {
                    let connection_string = connection_string.ok_or_else(|| {
                        StorageError::Configuration("MongoDB connection string required".to_string())
                    })?;
                    // For MongoDB, we need to parse the connection string to extract database name
                    // For simplicity, we'll use a default database name
                    let storage = MongoDBStorage::new(&connection_string, "phantom_threat_actors").await?;
                    Ok(Arc::new(storage))
                }
                #[cfg(not(feature = "mongodb-store"))]
                {
                    Err(StorageError::Configuration("MongoDB storage not enabled. Enable with 'mongodb-store' feature".to_string()))
                }
            },
            StorageBackend::Redis => {
                #[cfg(feature = "redis-store")]
                {
                    let connection_string = connection_string.ok_or_else(|| {
                        StorageError::Configuration("Redis connection string required".to_string())
                    })?;
                    let storage = RedisStorage::new(&connection_string).await?;
                    Ok(Arc::new(storage))
                }
                #[cfg(not(feature = "redis-store"))]
                {
                    Err(StorageError::Configuration("Redis storage not enabled. Enable with 'redis-store' feature".to_string()))
                }
            },
            StorageBackend::Elasticsearch => {
                #[cfg(feature = "elasticsearch-store")]
                {
                    let connection_string = connection_string.ok_or_else(|| {
                        StorageError::Configuration("Elasticsearch connection string required".to_string())
                    })?;
                    // For Elasticsearch, we need to parse the connection string to extract index name
                    // For simplicity, we'll use a default index name
                    let storage = ElasticsearchStorage::new(&connection_string, "phantom_threat_actors").await?;
                    Ok(Arc::new(storage))
                }
                #[cfg(not(feature = "elasticsearch-store"))]
                {
                    Err(StorageError::Configuration("Elasticsearch storage not enabled. Enable with 'elasticsearch-store' feature".to_string()))
                }
            },
        }
    }
}