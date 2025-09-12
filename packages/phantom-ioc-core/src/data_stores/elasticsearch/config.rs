//! Elasticsearch configuration module
//!
//! This module provides configuration structures and utilities for Elasticsearch
//! data store connections and settings.

use serde::{Deserialize, Serialize};

/// Elasticsearch-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchConfig {
    pub hosts: Vec<String>,
    pub index_prefix: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub request_timeout_seconds: u64,
    pub max_retries: usize,
    pub enable_ssl: bool,
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            hosts: vec!["http://localhost:9200".to_string()],
            index_prefix: "phantom-ioc-".to_string(),
            username: None,
            password: None,
            request_timeout_seconds: 30,
            max_retries: 3,
            enable_ssl: false,
        }
    }
}

impl ElasticsearchConfig {
    /// Create a new configuration with custom hosts
    pub fn with_hosts(hosts: Vec<String>) -> Self {
        Self {
            hosts,
            ..Default::default()
        }
    }

    /// Set authentication credentials
    pub fn with_auth(mut self, username: String, password: String) -> Self {
        self.username = Some(username);
        self.password = Some(password);
        self
    }

    /// Set custom index prefix
    pub fn with_index_prefix(mut self, prefix: String) -> Self {
        self.index_prefix = prefix;
        self
    }

    /// Enable SSL connections
    pub fn with_ssl(mut self, enable: bool) -> Self {
        self.enable_ssl = enable;
        self
    }
}