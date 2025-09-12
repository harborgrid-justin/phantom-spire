//! EnrichedIOCStore Implementation for Unified Store
//!
//! Implementation of the EnrichedIOCStore trait for the unified data store,
//! providing enriched IOC operations with automatic failover.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl EnrichedIOCStore for IOCUnifiedDataStore {
    async fn store_enriched(&self, enriched: &EnrichedIOC, context: &TenantContext) -> DataStoreResult<String> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.store_enriched(enriched, context).await
    }

    async fn get_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<EnrichedIOC>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_enriched(ioc_id, context).await
    }

    async fn delete_enriched(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.delete_enriched(ioc_id, context).await
    }

    async fn search_enriched(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<EnrichedIOC>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.search_enriched(criteria, context).await
    }
}