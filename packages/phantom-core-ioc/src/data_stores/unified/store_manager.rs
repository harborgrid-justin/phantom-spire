//! Unified Data Store Manager
//!
//! Core management logic for the unified IOC data store, handling
//! multiple storage backends with health monitoring and failover.

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::data_stores::config::DataStoreType;
use crate::data_stores::traits::ComprehensiveIOCStore;

use super::config::UnifiedDataStoreConfig;

/// Unified IOC Data Store
pub struct IOCUnifiedDataStore {
    pub config: UnifiedDataStoreConfig,
    pub stores: HashMap<DataStoreType, Box<dyn ComprehensiveIOCStore>>,
    pub primary_store: DataStoreType,
    pub health_status: Arc<RwLock<HashMap<DataStoreType, bool>>>,
}

impl IOCUnifiedDataStore {
    /// Create a new unified data store
    pub fn new(config: UnifiedDataStoreConfig) -> Self {
        Self {
            config: config.clone(),
            stores: HashMap::new(),
            primary_store: config.primary_store,
            health_status: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Add a data store backend
    pub fn add_store(&mut self, store_type: DataStoreType, store: Box<dyn ComprehensiveIOCStore>) {
        self.stores.insert(store_type, store);
    }

    /// Get the primary store
    pub fn primary_store(&self) -> Option<&dyn ComprehensiveIOCStore> {
        self.stores.get(&self.primary_store).map(|s| s.as_ref())
    }

    /// Get a specific store by type
    pub fn get_store(&self, store_type: DataStoreType) -> Option<&dyn ComprehensiveIOCStore> {
        self.stores.get(&store_type).map(|s| s.as_ref())
    }

    /// Get all available stores
    pub fn all_stores(&self) -> &HashMap<DataStoreType, Box<dyn ComprehensiveIOCStore>> {
        &self.stores
    }

    /// Update health status for a store
    pub async fn update_health_status(&self, store_type: DataStoreType, healthy: bool) {
        let mut status = self.health_status.write().await;
        status.insert(store_type, healthy);
    }

    /// Get health status for all stores
    pub async fn get_health_status(&self) -> HashMap<DataStoreType, bool> {
        self.health_status.read().await.clone()
    }

    /// Find a healthy store for operations
    pub async fn find_healthy_store(&self) -> Option<(DataStoreType, &dyn ComprehensiveIOCStore)> {
        let status = self.health_status.read().await;

        // Try primary store first
        if let Some(is_healthy) = status.get(&self.primary_store) {
            if *is_healthy {
                if let Some(store) = self.stores.get(&self.primary_store) {
                    return Some((self.primary_store, store.as_ref()));
                }
            }
        }

        // Try fallback stores
        for store_type in &self.config.fallback_stores {
            if let Some(is_healthy) = status.get(store_type) {
                if *is_healthy {
                    if let Some(store) = self.stores.get(store_type) {
                        return Some((*store_type, store.as_ref()));
                    }
                }
            }
        }

        None
    }
}