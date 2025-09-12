//! MongoDB Configuration
//!
//! Configuration structures for MongoDB data store connections.

use serde::{Deserialize, Serialize};

/// MongoDB-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    pub connection_string: String,
    pub database: String,
    pub collection_prefix: String,
    pub connection_timeout_ms: u64,
    pub max_pool_size: u32,
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            connection_string: "mongodb://localhost:27017".to_string(),
            database: "phantom_ioc".to_string(),
            collection_prefix: "phantom_ioc_".to_string(),
            connection_timeout_ms: 30000,
            max_pool_size: 10,
        }
    }
}