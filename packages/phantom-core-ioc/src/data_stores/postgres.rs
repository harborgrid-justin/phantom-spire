//! PostgreSQL Data Store Implementation
//!
//! Robust PostgreSQL-based storage for IOC data with connection pooling,
//! transactions, and advanced querying capabilities.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_postgres::{Client, NoTls, Config};
use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::models::*;
use crate::data_stores::traits::*;

pub mod config;
pub mod connection;
pub mod conversions;
pub mod schema;
pub mod impl_ioc_data_store;
pub mod impl_ioc_store;
pub mod impl_ioc_result_store;
pub mod impl_enriched_ioc_store;
pub mod impl_correlation_store;
pub mod impl_comprehensive_ioc_store;

// Re-export the main struct and config for easy access
pub use config::PostgreSQLConfig;
pub use connection::PostgreSQLDataStore;

impl PostgreSQLDataStore {
    /// Create a new PostgreSQL data store
    pub async fn new(config: PostgreSQLConfig) -> DataStoreResult<Self> {
        let mut pg_config = Config::new();
        pg_config
            .host(&config.host)
            .port(config.port)
            .dbname(&config.database)
            .user(&config.user)
            .password(&config.password);

        let manager = PostgresConnectionManager::new(pg_config, NoTls);
        let pool = Pool::builder()
            .max_size(config.max_connections)
            .build(manager)
            .await
            .map_err(|e| DataStoreError::Connection(format!("Failed to create connection pool: {}", e)))?;

        let store = Self { config, pool };

        // Initialize database schema
        store.initialize_schema().await?;

        Ok(store)
    }
}