//! PostgreSQL configuration module
//!
//! This module contains the configuration structures for PostgreSQL data store.

use serde::{Deserialize, Serialize};

/// PostgreSQL-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgreSQLConfig {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub user: String,
    pub password: String,
    pub max_connections: u32,
    pub connection_timeout_seconds: u64,
    pub schema: String,
}

impl Default for PostgreSQLConfig {
    fn default() -> Self {
        Self {
            host: "localhost".to_string(),
            port: 5432,
            database: "phantom_ioc".to_string(),
            user: "phantom".to_string(),
            password: "".to_string(),
            max_connections: 10,
            connection_timeout_seconds: 30,
            schema: "public".to_string(),
        }
    }
}