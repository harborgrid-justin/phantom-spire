//! CorrelationStore Implementation for Unified Store
//!
//! Implementation of the CorrelationStore trait for the unified data store,
//! providing correlation operations with automatic failover.

use async_trait::async_trait;
use uuid::Uuid;

use crate::models::*;
use crate::data_stores::traits::*;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl CorrelationStore for IOCUnifiedDataStore {
    async fn store_correlations(&self, correlations: &[Correlation], context: &TenantContext) -> DataStoreResult<BulkOperationResult> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.store_correlations(correlations, context).await
    }

    async fn get_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<Vec<Correlation>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_correlations(ioc_id, context).await
    }

    async fn delete_correlations(&self, ioc_id: &Uuid, context: &TenantContext) -> DataStoreResult<()> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.delete_correlations(ioc_id, context).await
    }

    async fn search_correlations(&self, criteria: &IOCSearchCriteria, context: &TenantContext) -> DataStoreResult<SearchResults<Correlation>> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.search_correlations(criteria, context).await
    }
}