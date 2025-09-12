//! Common Configuration Types for IOC Data Stores
//!
//! Shared configuration type definitions used across all data store implementations

use serde::{Serialize, Deserialize};
use std::time::Duration;

/// Data store type enumeration
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DataStoreType {
    /// In-memory storage (for testing/development)
    Memory,
    /// Local file system storage
    LocalFile,
    /// Redis cache and storage
    Redis,
    /// PostgreSQL relational database
    PostgreSQL,
    /// MongoDB document database
    MongoDB,
    /// Elasticsearch search engine
    Elasticsearch,
    /// SQLite embedded database
    SQLite,
    /// Custom external data store
    Custom(String),
}

impl std::fmt::Display for DataStoreType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataStoreType::Memory => write!(f, "memory"),
            DataStoreType::LocalFile => write!(f, "local_file"),
            DataStoreType::Redis => write!(f, "redis"),
            DataStoreType::PostgreSQL => write!(f, "postgresql"),
            DataStoreType::MongoDB => write!(f, "mongodb"),
            DataStoreType::Elasticsearch => write!(f, "elasticsearch"),
            DataStoreType::SQLite => write!(f, "sqlite"),
            DataStoreType::Custom(name) => write!(f, "custom_{}", name),
        }
    }
}

impl std::str::FromStr for DataStoreType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "memory" => Ok(DataStoreType::Memory),
            "local_file" | "localfile" => Ok(DataStoreType::LocalFile),
            "redis" => Ok(DataStoreType::Redis),
            "postgresql" | "postgres" => Ok(DataStoreType::PostgreSQL),
            "mongodb" | "mongo" => Ok(DataStoreType::MongoDB),
            "elasticsearch" | "elastic" => Ok(DataStoreType::Elasticsearch),
            "sqlite" => Ok(DataStoreType::SQLite),
            custom if custom.starts_with("custom_") => {
                let name = custom.strip_prefix("custom_").unwrap().to_string();
                Ok(DataStoreType::Custom(name))
            }
            _ => Err(format!("Unknown data store type: {}", s)),
        }
    }
}

/// Connection pool configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionPoolConfig {
    /// Minimum number of connections in the pool
    pub min_connections: u32,
    /// Maximum number of connections in the pool
    pub max_connections: u32,
    /// Connection timeout duration
    pub connect_timeout: Duration,
    /// Idle timeout for connections
    pub idle_timeout: Option<Duration>,
    /// Maximum lifetime of connections
    pub max_lifetime: Option<Duration>,
    /// Test connections on acquisition
    pub test_on_acquire: bool,
}

impl Default for ConnectionPoolConfig {
    fn default() -> Self {
        Self {
            min_connections: 1,
            max_connections: 10,
            connect_timeout: Duration::from_secs(30),
            idle_timeout: Some(Duration::from_secs(600)), // 10 minutes
            max_lifetime: Some(Duration::from_secs(1800)), // 30 minutes
            test_on_acquire: true,
        }
    }
}