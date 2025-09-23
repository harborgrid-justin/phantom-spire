//! PostgreSQL Data Store Configuration
//!
//! Configuration for PostgreSQL-based IOC data stores

use serde::{Serialize, Deserialize};
use std::time::Duration;

use crate::data_stores::config_types::ConnectionPoolConfig;

/// PostgreSQL-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgreSQLConfig {
    /// PostgreSQL connection URL
    pub url: String,
    /// Schema name for IOC tables
    pub schema: String,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable SSL/TLS
    pub ssl_mode: String,
    /// Migration settings
    pub auto_migrate: bool,
}

impl Default for PostgreSQLConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://localhost:5432/phantom_ioc".to_string(),
            schema: "ioc".to_string(),
            pool: ConnectionPoolConfig::default(),
            ssl_mode: "prefer".to_string(),
            auto_migrate: true,
        }
    }
}