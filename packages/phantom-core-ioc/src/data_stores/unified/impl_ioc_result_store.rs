//! IOCResultStore Implementation for Unified Store
//!
//! Implementation of the IOCResultStore trait for the unified data store,
//! providing IOC result operations with automatic failover.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl IOCResultStore for IOCUnifiedDataStore {
    async fn store_result(&self, result: &IOCResult, context: &TenantContext) -> DataStoreResult<String> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.store_result(result, context).await
    }

    async fn get_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Option<IOCResult>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_result(ioc_id, context).await
    }

    async fn delete_result(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.delete_result(ioc_id, context).await
    }

    async fn search_results(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<IOCResult>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.search_results(criteria, context).await
    }
}