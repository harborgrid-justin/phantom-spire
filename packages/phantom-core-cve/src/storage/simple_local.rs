// Simplified local storage implementation that works without external dependencies
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use crate::config::LocalStorageConfig;
use crate::models::{CVE, CVEAnalysisResult, SearchCriteria};
use super::{StorageError, StorageStatistics, HealthStatus};

/// Simplified local storage that works without async dependencies
pub struct SimpleLocalStorage {
    data_dir: PathBuf,
    // In-memory storage for simplicity
    cve_data: Arc<Mutex<HashMap<String, CVE>>>,
    analysis_data: Arc<Mutex<HashMap<String, CVEAnalysisResult>>>,
}

impl SimpleLocalStorage {
    pub fn new(config: &LocalStorageConfig) -> Result<Self, StorageError> {
        let data_dir = PathBuf::from(&config.data_directory);
        
        // Create data directory if it doesn't exist
        if !data_dir.exists() {
            fs::create_dir_all(&data_dir).map_err(|e| {
                StorageError::IoError(format!("Failed to create data directory: {}", e))
            })?;
        }
        
        Ok(SimpleLocalStorage {
            data_dir,
            cve_data: Arc::new(Mutex::new(HashMap::new())),
            analysis_data: Arc::new(Mutex::new(HashMap::new())),
        })
    }
    
    pub fn store_cve(&self, cve: &CVE) -> Result<(), StorageError> {
        let mut data = self.cve_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        data.insert(cve.id.clone(), cve.clone());
        Ok(())
    }
    
    pub fn get_cve(&self, cve_id: &str) -> Result<Option<CVE>, StorageError> {
        let data = self.cve_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        Ok(data.get(cve_id).cloned())
    }
    
    pub fn store_analysis(&self, result: &CVEAnalysisResult) -> Result<(), StorageError> {
        let mut data = self.analysis_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        data.insert(result.cve.id.clone(), result.clone());
        Ok(())
    }
    
    pub fn get_analysis(&self, cve_id: &str) -> Result<Option<CVEAnalysisResult>, StorageError> {
        let data = self.analysis_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        Ok(data.get(cve_id).cloned())
    }
    
    pub fn search_cves(&self, criteria: &SearchCriteria) -> Result<Vec<CVE>, StorageError> {
        let data = self.cve_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        
        let results: Vec<CVE> = data.values()
            .filter(|cve| self.matches_criteria(cve, criteria))
            .cloned()
            .collect();
        
        Ok(results)
    }
    
    fn matches_criteria(&self, cve: &CVE, criteria: &SearchCriteria) -> bool {
        // CVE ID filter
        if let Some(ref cve_id) = criteria.cve_id {
            if !cve.id.contains(cve_id) {
                return false;
            }
        }
        
        // Vendor filter
        if let Some(ref vendor) = criteria.vendor {
            let vendor_match = cve.affected_products.iter()
                .any(|p| p.vendor.to_lowercase().contains(&vendor.to_lowercase()));
            if !vendor_match {
                return false;
            }
        }
        
        // Product filter
        if let Some(ref product) = criteria.product {
            let product_match = cve.affected_products.iter()
                .any(|p| p.product.to_lowercase().contains(&product.to_lowercase()));
            if !product_match {
                return false;
            }
        }
        
        // Severity range filter
        if let Some(ref cvss) = cve.cvss_metrics {
            if let Some(min_severity) = criteria.severity_min {
                if cvss.base_score < min_severity {
                    return false;
                }
            }
            if let Some(max_severity) = criteria.severity_max {
                if cvss.base_score > max_severity {
                    return false;
                }
            }
        }
        
        // Date range filter
        if let Some((start_date, end_date)) = criteria.date_range {
            if cve.published_date < start_date || cve.published_date > end_date {
                return false;
            }
        }
        
        true
    }
    
    pub fn get_statistics(&self) -> Result<StorageStatistics, StorageError> {
        let cve_data = self.cve_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        let analysis_data = self.analysis_data.lock().map_err(|_| {
            StorageError::DatabaseError("Failed to acquire lock".to_string())
        })?;
        
        Ok(StorageStatistics {
            total_cves: cve_data.len() as u64,
            total_analyses: analysis_data.len() as u64,
            storage_size_bytes: 0, // In-memory, size not tracked
            last_updated: chrono::Utc::now(),
        })
    }
    
    pub fn health_check(&self) -> Result<HealthStatus, StorageError> {
        // Check if data directory exists
        if !self.data_dir.exists() {
            return Ok(HealthStatus::Unhealthy {
                reason: "Data directory does not exist".to_string()
            });
        }
        
        Ok(HealthStatus::Healthy)
    }
}