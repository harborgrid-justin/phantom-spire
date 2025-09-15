use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Hash, Eq, PartialEq, Serialize, Deserialize)]
pub enum CacheKey {
    Event(String),
    UserSession(String),
    Analytics(String),
    Configuration(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry<T> {
    pub data: T,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub max_size: usize,
    pub default_ttl: Duration,
    pub cleanup_interval: Duration,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CacheStats {
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub total_entries: usize,
}

#[derive(Debug, thiserror::Error)]
pub enum CacheError {
    #[error("Item not found in cache")]
    NotFound,
    #[error("Cache is full")]
    CapacityExceeded,
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("Item expired")]
    Expired,
}