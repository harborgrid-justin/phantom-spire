// phantom-threat-actor-core/src/storage/mod.rs
// Storage layer for Threat Actor Core

pub mod traits;
pub mod local;

pub use traits::*;
pub use local::LocalStorage;

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
                // TODO: Implement PostgreSQL storage
                Err(StorageError::Configuration("PostgreSQL storage not implemented".to_string()))
            },
            StorageBackend::MongoDB => {
                // TODO: Implement MongoDB storage
                Err(StorageError::Configuration("MongoDB storage not implemented".to_string()))
            },
            StorageBackend::Elasticsearch => {
                // TODO: Implement Elasticsearch storage
                Err(StorageError::Configuration("Elasticsearch storage not implemented".to_string()))
            },
            StorageBackend::Redis => {
                // TODO: Implement Redis storage
                Err(StorageError::Configuration("Redis storage not implemented".to_string()))
            },
        }
    }
}