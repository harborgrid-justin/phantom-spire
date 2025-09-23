//! Redis Connection Management
//!
//! Connection pooling and management for Redis data store.

use redis::{Client, ConnectionManager};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::data_stores::types::DataStoreResult;

/// Redis connection manager wrapper
pub struct RedisConnectionManager {
    client: Client,
    connection_manager: Arc<Mutex<Option<ConnectionManager>>>,
}

impl RedisConnectionManager {
    /// Create a new Redis connection manager
    pub fn new(client: Client) -> Self {
        Self {
            client,
            connection_manager: Arc::new(Mutex::new(None)),
        }
    }

    /// Get a connection manager
    pub async fn get_connection(&self) -> DataStoreResult<ConnectionManager> {
        let mut manager_guard = self.connection_manager.lock().await;
        if let Some(manager) = &*manager_guard {
            Ok(manager.clone())
        } else {
            let manager = self.client.get_connection_manager().await
                .map_err(|e| crate::data_stores::types::DataStoreError::Connection(format!("Failed to get Redis connection: {}", e)))?;
            *manager_guard = Some(manager.clone());
            Ok(manager)
        }
    }
}