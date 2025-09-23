//! PostgreSQL connection management module
//!
//! This module handles connection pool management and database connections.

use bb8::{Pool, PooledConnection};
use bb8_postgres::PostgresConnectionManager;
use tokio_postgres::NoTls;

use crate::data_stores::traits::DataStoreResult;

/// PostgreSQL IOC Data Store
pub struct PostgreSQLDataStore {
    pub config: crate::data_stores::postgres::config::PostgreSQLConfig,
    pub pool: Pool<PostgresConnectionManager<NoTls>>,
}

impl PostgreSQLDataStore {
    /// Get a database connection from the pool
    pub async fn get_connection(&self) -> DataStoreResult<PooledConnection<PostgresConnectionManager<NoTls>>> {
        self.pool.get().await
            .map_err(|e| crate::data_stores::traits::DataStoreError::Connection(format!("Failed to get database connection: {}", e)))
    }
}