// phantom-ioc-core/src/storage/local.rs
// Local storage implementation for IOC Core

use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;
use chrono::Utc;
use crate::models::*;
use super::traits::{IOCStorage, StorageError, StorageStatistics, IOCSearchCriteria, SortOrder};
use super::traits::HealthStatus as StorageHealthStatus;

/// Local in-memory storage implementation
pub struct LocalStorage {
    iocs: Arc<RwLock<HashMap<Uuid, IOC>>>,
    results: Arc<RwLock<HashMap<Uuid, IOCResult>>>,
    correlations: Arc<RwLock<HashMap<Uuid, Vec<Correlation>>>>,
    enriched_iocs: Arc<RwLock<HashMap<Uuid, EnrichedIOC>>>,
}

impl LocalStorage {
    /// Create a new local storage instance
    pub async fn new() -> Result<Self, StorageError> {
        Ok(Self {
            iocs: Arc::new(RwLock::new(HashMap::new())),
            results: Arc::new(RwLock::new(HashMap::new())),
            correlations: Arc::new(RwLock::new(HashMap::new())),
            enriched_iocs: Arc::new(RwLock::new(HashMap::new())),
        })
    }
}

#[async_trait]
impl IOCStorage for LocalStorage {
    async fn initialize(&self) -> Result<(), StorageError> {
        // Nothing to initialize for local storage
        Ok(())
    }

    async fn health_check(&self) -> Result<StorageHealthStatus, StorageError> {
        let start = std::time::Instant::now();
        
        // Simple health check - try to access the storage
        let _iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let response_time = start.elapsed().as_millis() as u64;
        
        Ok(StorageHealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("backend".to_string(), "local".to_string());
                metadata.insert("memory_usage".to_string(), "unknown".to_string());
                metadata
            },
        })
    }

    async fn store_ioc(&self, ioc: &IOC) -> Result<(), StorageError> {
        let mut iocs = self.iocs.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        iocs.insert(ioc.id, ioc.clone());
        Ok(())
    }

    async fn store_ioc_batch(&self, iocs: &[IOC]) -> Result<(), StorageError> {
        let mut storage = self.iocs.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        for ioc in iocs {
            storage.insert(ioc.id, ioc.clone());
        }
        
        Ok(())
    }

    async fn get_ioc(&self, id: &Uuid) -> Result<Option<IOC>, StorageError> {
        let iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(iocs.get(id).cloned())
    }

    async fn get_ioc_batch(&self, ids: &[Uuid]) -> Result<Vec<IOC>, StorageError> {
        let iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let mut results = Vec::new();
        for id in ids {
            if let Some(ioc) = iocs.get(id) {
                results.push(ioc.clone());
            }
        }
        
        Ok(results)
    }

    async fn search_iocs(&self, criteria: &IOCSearchCriteria) -> Result<Vec<IOC>, StorageError> {
        let iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let mut results: Vec<IOC> = iocs
            .values()
            .filter(|ioc| self.matches_criteria(ioc, criteria))
            .cloned()
            .collect();
        
        // Apply sorting
        if let Some(sort_order) = &criteria.sort_order {
            match sort_order {
                SortOrder::Ascending => results.sort_by(|a, b| a.timestamp.cmp(&b.timestamp)),
                SortOrder::Descending => results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp)),
            }
        }
        
        // Apply pagination
        let offset = criteria.offset.unwrap_or(0);
        let limit = criteria.limit.unwrap_or(results.len());
        
        Ok(results.into_iter().skip(offset).take(limit).collect())
    }

    async fn list_ioc_ids(&self) -> Result<Vec<Uuid>, StorageError> {
        let iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(iocs.keys().cloned().collect())
    }

    async fn delete_ioc(&self, id: &Uuid) -> Result<bool, StorageError> {
        let mut iocs = self.iocs.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        Ok(iocs.remove(id).is_some())
    }

    async fn store_result(&self, result: &IOCResult) -> Result<(), StorageError> {
        let mut results = self.results.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        results.insert(result.ioc.id, result.clone());
        Ok(())
    }

    async fn store_result_batch(&self, results: &[IOCResult]) -> Result<(), StorageError> {
        let mut storage = self.results.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        for result in results {
            storage.insert(result.ioc.id, result.clone());
        }
        
        Ok(())
    }

    async fn get_result(&self, ioc_id: &Uuid) -> Result<Option<IOCResult>, StorageError> {
        let results = self.results.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(results.get(ioc_id).cloned())
    }

    async fn get_result_batch(&self, ioc_ids: &[Uuid]) -> Result<Vec<IOCResult>, StorageError> {
        let results = self.results.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let mut batch_results = Vec::new();
        for id in ioc_ids {
            if let Some(result) = results.get(id) {
                batch_results.push(result.clone());
            }
        }
        
        Ok(batch_results)
    }

    async fn search_results(&self, criteria: &IOCSearchCriteria) -> Result<Vec<IOCResult>, StorageError> {
        let results = self.results.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let mut filtered_results: Vec<IOCResult> = results
            .values()
            .filter(|result| self.matches_criteria(&result.ioc, criteria))
            .cloned()
            .collect();
        
        // Apply sorting and pagination
        if let Some(sort_order) = &criteria.sort_order {
            match sort_order {
                SortOrder::Ascending => filtered_results.sort_by(|a, b| a.processing_timestamp.cmp(&b.processing_timestamp)),
                SortOrder::Descending => filtered_results.sort_by(|a, b| b.processing_timestamp.cmp(&a.processing_timestamp)),
            }
        }
        
        let offset = criteria.offset.unwrap_or(0);
        let limit = criteria.limit.unwrap_or(filtered_results.len());
        
        Ok(filtered_results.into_iter().skip(offset).take(limit).collect())
    }

    async fn list_result_ids(&self) -> Result<Vec<Uuid>, StorageError> {
        let results = self.results.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(results.keys().cloned().collect())
    }

    async fn delete_result(&self, ioc_id: &Uuid) -> Result<bool, StorageError> {
        let mut results = self.results.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        Ok(results.remove(ioc_id).is_some())
    }

    async fn store_correlation(&self, correlation: &Correlation) -> Result<(), StorageError> {
        let mut correlations = self.correlations.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        // Store correlation for each involved IOC
        for ioc_id in &correlation.correlated_iocs {
            correlations.entry(*ioc_id).or_insert_with(Vec::new).push(correlation.clone());
        }
        
        Ok(())
    }

    async fn get_correlations(&self, ioc_id: &Uuid) -> Result<Vec<Correlation>, StorageError> {
        let correlations = self.correlations.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(correlations.get(ioc_id).cloned().unwrap_or_default())
    }

    async fn store_enriched_ioc(&self, enriched_ioc: &EnrichedIOC) -> Result<(), StorageError> {
        let mut enriched_iocs = self.enriched_iocs.write().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire write lock: {}", e))
        })?;
        
        enriched_iocs.insert(enriched_ioc.base_ioc.id, enriched_ioc.clone());
        Ok(())
    }

    async fn get_enriched_ioc(&self, ioc_id: &Uuid) -> Result<Option<EnrichedIOC>, StorageError> {
        let enriched_iocs = self.enriched_iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        Ok(enriched_iocs.get(ioc_id).cloned())
    }

    async fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let iocs = self.iocs.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        let results = self.results.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        let correlations = self.correlations.read().map_err(|e| {
            StorageError::Internal(format!("Failed to acquire read lock: {}", e))
        })?;
        
        let correlation_count = correlations.values().map(|v| v.len()).sum::<usize>() as u64;
        
        Ok(StorageStatistics {
            ioc_count: iocs.len() as u64,
            result_count: results.len() as u64,
            correlation_count,
            total_size_bytes: 0, // Would need to calculate actual memory usage
            last_updated: Utc::now(),
        })
    }

    async fn close(&self) -> Result<(), StorageError> {
        // Nothing to cleanup for local storage
        Ok(())
    }
}

impl LocalStorage {
    /// Helper method to check if an IOC matches the search criteria
    fn matches_criteria(&self, ioc: &IOC, criteria: &IOCSearchCriteria) -> bool {
        if let Some(ref ioc_types) = criteria.ioc_types {
            if !ioc_types.contains(&ioc.indicator_type) {
                return false;
            }
        }
        
        if let Some(ref severities) = criteria.severity {
            if !severities.contains(&ioc.severity) {
                return false;
            }
        }
        
        if let Some(ref sources) = criteria.sources {
            if !sources.contains(&ioc.source) {
                return false;
            }
        }
        
        if let Some(ref tags) = criteria.tags {
            if !ioc.tags.iter().any(|tag| tags.contains(tag)) {
                return false;
            }
        }
        
        if let Some(confidence_min) = criteria.confidence_min {
            if ioc.confidence < confidence_min {
                return false;
            }
        }
        
        if let Some(confidence_max) = criteria.confidence_max {
            if ioc.confidence > confidence_max {
                return false;
            }
        }
        
        if let Some((start, end)) = criteria.time_range {
            if ioc.timestamp < start || ioc.timestamp > end {
                return false;
            }
        }
        
        true
    }
}