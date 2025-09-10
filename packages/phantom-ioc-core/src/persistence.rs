// phantom-ioc-core/src/persistence.rs
// IOC data persistence and storage engine

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use uuid::Uuid;

pub struct PersistenceEngine {
    storage: Arc<RwLock<HashMap<String, IOC>>>,
    enriched_storage: Arc<RwLock<HashMap<String, EnrichedIOC>>>,
    max_storage_size: usize,
}

impl PersistenceEngine {
    pub async fn new(max_storage_size: usize) -> Result<Self, IOCError> {
        Ok(Self {
            storage: Arc::new(RwLock::new(HashMap::new())),
            enriched_storage: Arc::new(RwLock::new(HashMap::new())),
            max_storage_size,
        })
    }

    pub async fn store_ioc(&self, ioc: IOC) -> Result<String, IOCError> {
        let id = Uuid::new_v4().to_string();
        let mut storage = self.storage.write().await;

        // Check storage limits
        if storage.len() >= self.max_storage_size {
            return Err(IOCError::StorageFull);
        }

        storage.insert(id.clone(), ioc);
        Ok(id)
    }

    pub async fn get_ioc(&self, id: &str) -> Result<Option<IOC>, IOCError> {
        let storage = self.storage.read().await;
        Ok(storage.get(id).cloned())
    }

    pub async fn store_enriched_ioc(&self, enriched_ioc: EnrichedIOC) -> Result<String, IOCError> {
        let id = Uuid::new_v4().to_string();
        let mut storage = self.enriched_storage.write().await;

        if storage.len() >= self.max_storage_size {
            return Err(IOCError::StorageFull);
        }

        storage.insert(id.clone(), enriched_ioc);
        Ok(id)
    }

    pub async fn get_enriched_ioc(&self, id: &str) -> Result<Option<EnrichedIOC>, IOCError> {
        let storage = self.enriched_storage.read().await;
        Ok(storage.get(id).cloned())
    }

    pub async fn search_iocs(&self, query: &str) -> Result<Vec<IOC>, IOCError> {
        let storage = self.storage.read().await;
        let mut results = Vec::new();

        for ioc in storage.values() {
            if ioc.value.contains(query) ||
               format!("{:?}", ioc.indicator_type).contains(query) {
                results.push(ioc.clone());
            }
        }

        Ok(results)
    }

    pub async fn get_storage_stats(&self) -> StorageStats {
        let storage = self.storage.read().await;
        let enriched_storage = self.enriched_storage.read().await;

        StorageStats {
            total_iocs: storage.len(),
            total_enriched_iocs: enriched_storage.len(),
            max_capacity: self.max_storage_size,
            utilization_percentage: ((storage.len() + enriched_storage.len()) as f64 / self.max_storage_size as f64) * 100.0,
        }
    }

    pub async fn cleanup_old_iocs(&self, days_old: i64) -> Result<usize, IOCError> {
        let cutoff = Utc::now() - chrono::Duration::days(days_old);
        let mut storage = self.storage.write().await;
        let mut enriched_storage = self.enriched_storage.write().await;

        let mut removed = 0;

        // Remove old IOCs
        storage.retain(|_, ioc| {
            if ioc.timestamp < cutoff {
                removed += 1;
                false
            } else {
                true
            }
        });

        // Remove old enriched IOCs
        enriched_storage.retain(|_, enriched| {
            if enriched.enrichment_timestamp < cutoff {
                removed += 1;
                false
            } else {
                true
            }
        });

        Ok(removed)
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.get_storage_stats().await;
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Storage operational - {} IOCs stored", stats.total_iocs),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("total_iocs".to_string(), stats.total_iocs as f64);
                metrics.insert("utilization".to_string(), stats.utilization_percentage);
                metrics
            },
        }
    }
}
