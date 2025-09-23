//! Multi-Tenant Data Store Manager
//!
//! Manager for handling multi-tenant data store operations

use std::collections::HashMap;

use crate::data_stores::types::{DataStoreResult, TenantContext};
use crate::data_stores::core_traits::ComprehensiveIOCStore;
use crate::data_stores::registry::DataStoreRegistry;

/// Multi-tenant data store manager
pub struct MultiTenantDataStoreManager {
    stores: HashMap<String, Box<dyn ComprehensiveIOCStore>>,
    default_store: Option<Box<dyn ComprehensiveIOCStore>>,
    registry: DataStoreRegistry,
}

impl MultiTenantDataStoreManager {
    /// Create a new multi-tenant manager
    pub fn new() -> Self {
        Self {
            stores: HashMap::new(),
            default_store: None,
            registry: DataStoreRegistry::new(),
        }
    }

    /// Set the default data store
    pub fn set_default_store(&mut self, store: Box<dyn ComprehensiveIOCStore>) {
        self.default_store = Some(store);
    }

    /// Add a tenant-specific data store
    pub fn add_tenant_store(&mut self, tenant_id: String, store: Box<dyn ComprehensiveIOCStore>) {
        self.stores.insert(tenant_id, store);
    }

    /// Get the appropriate data store for a tenant
    pub fn get_store(&self, context: &TenantContext) -> Option<&dyn ComprehensiveIOCStore> {
        // First try to get tenant-specific store
        if let Some(store) = self.stores.get(&context.tenant_id) {
            return Some(store.as_ref());
        }

        // Fall back to default store
        self.default_store.as_ref().map(|store| store.as_ref())
    }

    /// Get mutable reference to store for a tenant
    pub fn get_store_mut(&mut self, context: &TenantContext) -> Option<&mut (dyn ComprehensiveIOCStore + '_)> {
        // First try to get tenant-specific store
        if self.stores.contains_key(&context.tenant_id) {
            return self.stores.get_mut(&context.tenant_id)
                .map(|store| store.as_mut());
        }

        // Fall back to default store
        self.default_store.as_mut().map(|store| store.as_mut())
    }

    /// Get the registry for managing store types
    pub fn registry(&self) -> &DataStoreRegistry {
        &self.registry
    }

    /// Get mutable registry for registering new store types
    pub fn registry_mut(&mut self) -> &mut DataStoreRegistry {
        &mut self.registry
    }

    /// Initialize all data stores
    pub async fn initialize_all(&mut self) -> DataStoreResult<()> {
        // Initialize default store
        if let Some(store) = &mut self.default_store {
            store.initialize().await?;
        }

        // Initialize tenant-specific stores
        for (tenant_id, store) in &mut self.stores {
            store.initialize().await
                .map_err(|e| crate::data_stores::DataStoreError::Internal(
                    format!("Failed to initialize store for tenant {}: {}", tenant_id, e)
                ))?;
        }

        Ok(())
    }

    /// Perform health check on all stores
    pub async fn health_check_all(&self) -> HashMap<String, bool> {
        let mut results = HashMap::new();

        // Check default store
        if let Some(store) = &self.default_store {
            let health = store.health_check().await.unwrap_or(false);
            results.insert("default".to_string(), health);
        }

        // Check tenant-specific stores
        for (tenant_id, store) in &self.stores {
            let health = store.health_check().await.unwrap_or(false);
            results.insert(tenant_id.clone(), health);
        }

        results
    }

    /// Close all data stores
    pub async fn close_all(&mut self) -> DataStoreResult<()> {
        // Close default store
        if let Some(store) = &mut self.default_store {
            store.close().await?;
        }

        // Close tenant-specific stores
        for (tenant_id, store) in &mut self.stores {
            store.close().await
                .map_err(|e| crate::data_stores::DataStoreError::Internal(
                    format!("Failed to close store for tenant {}: {}", tenant_id, e)
                ))?;
        }

        Ok(())
    }
}

impl Default for MultiTenantDataStoreManager {
    fn default() -> Self {
        Self::new()
    }
}