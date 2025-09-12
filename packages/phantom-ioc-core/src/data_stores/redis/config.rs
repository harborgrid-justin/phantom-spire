//! Redis Configuration
//!
//! Configuration structures for Redis data store connections.

use serde::{Deserialize, Serialize};

/// Redis-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    pub host: String,
    pub port: u16,
    pub password: Option<String>,
    pub database: i64,
    pub connection_timeout_ms: u64,
    pub command_timeout_ms: u64,
    pub max_connections: usize,
    pub key_prefix: String,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            host: "localhost".to_string(),
            port: 6379,
            password: None,
            database: 0,
            connection_timeout_ms: 5000,
            command_timeout_ms: 3000,
            max_connections: 10,
            key_prefix: "phantom:ioc:".to_string(),
        }
    }
}