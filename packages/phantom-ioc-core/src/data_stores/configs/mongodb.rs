//! MongoDB Data Store Configuration
//!
//! Configuration for MongoDB-based IOC data stores

use serde::{Serialize, Deserialize};
use std::time::Duration;

use crate::data_stores::config_types::ConnectionPoolConfig;

/// MongoDB-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    /// MongoDB connection URL
    pub url: String,
    /// Database name
    pub database: String,
    /// Collection prefix
    pub collection_prefix: String,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable compression
    pub compression: bool,
    /// Write concern
    pub write_concern: String,
    /// Read preference
    pub read_preference: String,
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            url: "mongodb://localhost:27017".to_string(),
            database: "phantom_ioc".to_string(),
            collection_prefix: "ioc_".to_string(),
            pool: ConnectionPoolConfig::default(),
            compression: true,
            write_concern: "majority".to_string(),
            read_preference: "primary".to_string(),
        }
    }
}