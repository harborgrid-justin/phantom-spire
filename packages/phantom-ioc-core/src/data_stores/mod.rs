//! Data Store Module for IOC Core
//! 
//! Enhanced data store architecture with multi-database support and enterprise features
//! Based on phantom-cve-core architectural patterns

pub mod traits;
pub mod serialization;
pub mod config;

// Re-export core traits and types for easy access
pub use traits::{
    IOCDataStore, 
    IOCStore, 
    IOCResultStore, 
    EnrichedIOCStore, 
    CorrelationStore,
    ComprehensiveIOCStore,
    IOCDataStoreFactory,
    TenantContext,
    DataStoreResult,
    DataStoreError,
    IOCSearchCriteria,
    SearchResults,
    DataStoreMetrics,
    BulkOperationResult,
};

pub use config::{DataStoreConfig, DataStoreType};
pub use serialization::{IOCSerializer, SerializationFormat};

use std::collections::HashMap;
use std::sync::Arc;

/// Data store registry for managing multiple store implementations
pub struct DataStoreRegistry {
    factories: HashMap<DataStoreType, Arc<dyn IOCDataStoreFactory<Store = Box<dyn ComprehensiveIOCStore>>>>,
}

impl DataStoreRegistry {
    /// Create a new registry
    pub fn new() -> Self {
        Self {
            factories: HashMap::new(),
        }
    }
    
    /// Register a data store factory
    pub fn register_factory<F>(&mut self, store_type: DataStoreType, factory: F)
    where
        F: IOCDataStoreFactory<Store = Box<dyn ComprehensiveIOCStore>> + 'static,
    {
        self.factories.insert(store_type, Arc::new(factory));
    }
    
    /// Create a data store instance
    pub async fn create_store(
        &self, 
        store_type: DataStoreType, 
        config: &HashMap<String, String>
    ) -> DataStoreResult<Box<dyn ComprehensiveIOCStore>> {
        let factory = self.factories.get(&store_type)
            .ok_or_else(|| DataStoreError::Internal(
                format!("No factory registered for store type: {:?}", store_type)
            ))?;
        
        factory.create_store(config).await
    }
    
    /// Validate configuration for a store type
    pub fn validate_config(
        &self, 
        store_type: DataStoreType, 
        config: &HashMap<String, String>
    ) -> DataStoreResult<()> {
        let factory = self.factories.get(&store_type)
            .ok_or_else(|| DataStoreError::Internal(
                format!("No factory registered for store type: {:?}", store_type)
            ))?;
        
        factory.validate_config(config)
    }
    
    /// Get required configuration keys for a store type
    pub fn get_required_config_keys(&self, store_type: DataStoreType) -> Vec<&'static str> {
        self.factories.get(&store_type)
            .map(|factory| factory.required_config_keys())
            .unwrap_or_default()
    }
}

impl Default for DataStoreRegistry {
    fn default() -> Self {
        Self::new()
    }
}

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
    pub fn get_store_mut(&mut self, context: &TenantContext) -> Option<&mut dyn ComprehensiveIOCStore> {
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
                .map_err(|e| DataStoreError::Internal(
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
                .map_err(|e| DataStoreError::Internal(
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