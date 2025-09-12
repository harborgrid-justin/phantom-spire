//! Unified Data Store Configuration
//!
//! Configuration structures for the unified IOC data store that combines
//! multiple storage backends with intelligent routing and failover.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::data_stores::config::DataStoreType;

/// Unified data store configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedDataStoreConfig {
    pub primary_store: DataStoreType,
    pub fallback_stores: Vec<DataStoreType>,
    pub store_configs: HashMap<DataStoreType, HashMap<String, String>>,
    pub enable_failover: bool,
    pub enable_replication: bool,
    pub health_check_interval_seconds: u64,
}

impl Default for UnifiedDataStoreConfig {
    fn default() -> Self {
        Self {
            primary_store: DataStoreType::Local,
            fallback_stores: vec![],
            store_configs: HashMap::new(),
            enable_failover: true,
            enable_replication: false,
            health_check_interval_seconds: 30,
        }
    }
}