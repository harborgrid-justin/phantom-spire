//! Elasticsearch Data Store Configuration
//!
//! Configuration for Elasticsearch-based IOC data stores

use serde::{Serialize, Deserialize};
use std::time::Duration;

/// Elasticsearch-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchConfig {
    /// Elasticsearch URLs
    pub urls: Vec<String>,
    /// Index prefix
    pub index_prefix: String,
    /// Number of shards per index
    pub shards: u32,
    /// Number of replicas per index
    pub replicas: u32,
    /// Refresh policy
    pub refresh_policy: String,
    /// Connection timeout
    pub timeout: Duration,
    /// Enable compression
    pub compression: bool,
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            urls: vec!["http://localhost:9200".to_string()],
            index_prefix: "phantom_ioc".to_string(),
            shards: 1,
            replicas: 1,
            refresh_policy: "wait_for".to_string(),
            timeout: Duration::from_secs(30),
            compression: true,
        }
    }
}