//! IOCDataStore Implementation for Unified Store
//!
//! Implementation of the IOCDataStore trait for the unified data store,
//! providing initialization, health checks, and metrics collection.

use async_trait::async_trait;

use crate::models::*;
use crate::data_stores::traits::*;
use crate::data_stores::config::DataStoreType;

use super::store_manager::IOCUnifiedDataStore;

#[async_trait]
impl IOCDataStore for IOCUnifiedDataStore {
    async fn initialize(&mut self) -> DataStoreResult<()> {
        for (store_type, store) in &mut self.stores {
            match store.initialize().await {
                Ok(_) => {
                    self.update_health_status(*store_type, true).await;
                }
                Err(e) => {
                    log::warn!("Failed to initialize store {:?}: {}", store_type, e);
                    self.update_health_status(*store_type, false).await;
                }
            }
        }
        Ok(())
    }

    async fn close(&mut self) -> DataStoreResult<()> {
        for store in self.stores.values_mut() {
            if let Err(e) = store.close().await {
                log::warn!("Error closing store: {}", e);
            }
        }
        Ok(())
    }

    async fn health_check(&self) -> DataStoreResult<bool> {
        let mut all_healthy = true;
        for (store_type, store) in &self.stores {
            match store.health_check().await {
                Ok(healthy) => {
                    self.update_health_status(*store_type, healthy).await;
                    if !healthy {
                        all_healthy = false;
                    }
                }
                Err(_) => {
                    self.update_health_status(*store_type, false).await;
                    all_healthy = false;
                }
            }
        }
        Ok(all_healthy)
    }

    async fn get_metrics(&self, context: &TenantContext) -> DataStoreResult<DataStoreMetrics> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_metrics(context).await
    }

    async fn get_ioc_count(&self, context: &TenantContext) -> DataStoreResult<u64> {
        let (_store_type, store) = self.find_healthy_store().await
            .ok_or_else(|| DataStoreError::Connection("No healthy store available".to_string()))?;
        store.get_ioc_count(context).await
    }
}