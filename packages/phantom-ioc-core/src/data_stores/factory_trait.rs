//! Data Store Factory Trait
//!
//! Factory pattern for creating data store instances
//! Enhanced architecture based on phantom-cve-core patterns

use async_trait::async_trait;
use std::collections::HashMap;

use crate::data_stores::types::*;

/// Data store factory trait for creating store instances
#[async_trait]
pub trait IOCDataStoreFactory: Send + Sync {
    /// Create a new data store instance
    async fn create_store(&self, config: &HashMap<String, String>) -> DataStoreResult<Box<dyn ComprehensiveIOCStore>>;

    /// Validate configuration
    fn validate_config(&self, config: &HashMap<String, String>) -> DataStoreResult<()>;

    /// Get required configuration keys
    fn required_config_keys(&self) -> Vec<&'static str>;
}