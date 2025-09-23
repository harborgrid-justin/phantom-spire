//! IOCStore Implementation for Unified Store
//!
//! Implementation of the IOCStore trait for the unified data store,
//! providing core IOC operations with automatic failover.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl IOCStore for IOCUnifiedDataStore {
    async fn store_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<String> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.store_ioc(ioc, context).await
    }

    async fn get_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOC>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_ioc(id, context).await
    }

    async fn update_ioc(&self, ioc: &IOC, context: &TenantContext) -> DataStoreResult<()> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.update_ioc(ioc, context).await
    }

    async fn delete_ioc(&self, id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.delete_ioc(id, context).await
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOC>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.search_iocs(criteria, context).await
    }

    async fn bulk_store_iocs(&self, iocs: &[IOC], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.bulk_store_iocs(iocs, context).await
    }

    async fn list_ioc_ids(&self, context: &TenantContext) -> DataStoreResult<Vec<Uuid>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.list_ioc_ids(context).await
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_ioc_count(context).await
    }
}