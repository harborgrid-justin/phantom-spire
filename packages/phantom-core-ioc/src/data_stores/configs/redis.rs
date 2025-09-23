//! Redis Data Store Configuration
//!
//! Configuration for Redis-based IOC data stores

use serde::{Serialize, Deserialize};
use std::time::Duration;

use crate::data_stores::config_types::ConnectionPoolConfig;

/// Redis-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    /// Redis connection URL
    pub url: String,
    /// Key prefix for all IOC data
    pub key_prefix: String,
    /// Default TTL for cached data
    pub default_ttl: Option<Duration>,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable compression for stored data
    pub compression: bool,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://localhost:6379".to_string(),
            key_prefix: "phantom_ioc:".to_string(),
            default_ttl: Some(Duration::from_secs(3600)), // 1 hour
            pool: ConnectionPoolConfig::default(),
            compression: true,
        }
    }
}