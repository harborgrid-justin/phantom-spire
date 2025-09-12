//! Data Store Registry
//!
//! Registry for managing multiple data store implementations

use std::collections::HashMap;
use std::sync::Arc;

use crate::data_stores::types::{DataStoreResult, DataStoreType};
use crate::data_stores::factory_trait::IOCDataStoreFactory;
use crate::data_stores::core_traits::ComprehensiveIOCStore;

/// Data store registry for managing multiple store implementations
pub struct DataStoreRegistry {
    factories: HashMap<DataStoreType, Arc<dyn IOCDataStoreFactory>>,
}

impl DataStoreRegistry {
    /// Create a new registry
    pub fn new() -> Self {
        Self {
            factories: HashMap::new(),
        }
    }

    /// Register a data store factory
    pub fn register_factory<F>(&mut self, store_type: &DataStoreType, factory: F)
    where
        F: IOCDataStoreFactory + 'static,
    {
        self.factories.insert(store_type.clone(), Arc::new(factory));
    }

    /// Create a data store instance
    pub async fn create_store(
        &self,
        store_type: &DataStoreType,
        config: &HashMap<String, String>
    ) -> DataStoreResult<Box<dyn ComprehensiveIOCStore>> {
        let factory = self.factories.get(store_type)
            .ok_or_else(|| crate::data_stores::DataStoreError::Internal(
                format!("No factory registered for store type: {:?}", store_type)
            ))?;

        factory.create_store(config).await
    }

    /// Validate configuration for a store type
    pub fn validate_config(
        &self,
        store_type: &DataStoreType,
        config: &HashMap<String, String>
    ) -> DataStoreResult<()> {
        let factory = self.factories.get(store_type)
            .ok_or_else(|| crate::data_stores::DataStoreError::Internal(
                format!("No factory registered for store type: {:?}", store_type)
            ))?;

        factory.validate_config(config)
    }

    /// Get required configuration keys for a store type
    pub fn get_required_config_keys(&self, store_type: &DataStoreType) -> Vec<&'static str> {
        self.factories.get(store_type)
            .map(|factory| factory.required_config_keys())
            .unwrap_or_default()
    }
}

impl Default for DataStoreRegistry {
    fn default() -> Self {
        Self::new()
    }
}