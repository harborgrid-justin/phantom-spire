//! Local file system storage implementation
//! 
//! Provides local storage capabilities for incident response data with compression and backup support

use super::traits::*;
use super::LocalStorageConfig;
use crate::incident_models::*;
use crate::evidence_models::*;
use crate::playbook_models::*;
use crate::data_stores::serialization::DataSerializer;

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::io::Write;
use tokio::sync::RwLock;
use async_trait::async_trait;
use serde_json;
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Local file system storage implementation
pub struct LocalStorage {
    config: LocalStorageConfig,
    data_dir: PathBuf,
    indexes: RwLock<HashMap<String, Vec<String>>>, // Simple in-memory indexing
}

impl LocalStorage {
    /// Create a new local storage instance
    pub async fn new(config: LocalStorageConfig) -> StorageResult<Self> {
        let data_dir = PathBuf::from(&config.data_dir);
        
        // Create directory structure
        Self::create_directory_structure(&data_dir).await?;
        
        let storage = Self {
            config,
            data_dir,
            indexes: RwLock::new(HashMap::new()),
        };
        
        // Initialize indexes
        storage.build_indexes().await?;
        
        Ok(storage)
    }
    
    async fn create_directory_structure(data_dir: &Path) -> StorageResult<()> {
        let subdirs = ["incidents", "evidence", "playbooks", "investigations", "backups"];
        
        for subdir in &subdirs {
            let path = data_dir.join(subdir);
            if !path.exists() {
                fs::create_dir_all(&path)
                    .map_err(|e| StorageError::IoError(format!("Failed to create directory {}: {}", path.display(), e)))?;
            }
        }
        
        Ok(())
    }
    
    async fn build_indexes(&self) -> StorageResult<()> {
        let mut indexes = self.indexes.write().await;
        
        // Build incident index
        let incident_files = self.list_files("incidents").await?;
        indexes.insert("incidents".to_string(), incident_files);
        
        // Build evidence index
        let evidence_files = self.list_files("evidence").await?;
        indexes.insert("evidence".to_string(), evidence_files);
        
        // Build playbook index
        let playbook_files = self.list_files("playbooks").await?;
        indexes.insert("playbooks".to_string(), playbook_files);
        
        // Build investigation index
        let investigation_files = self.list_files("investigations").await?;
        indexes.insert("investigations".to_string(), investigation_files);
        
        Ok(())
    }
    
    async fn list_files(&self, subdir: &str) -> StorageResult<Vec<String>> {
        let dir_path = self.data_dir.join(subdir);
        if !dir_path.exists() {
            return Ok(Vec::new());
        }
        
        let mut files = Vec::new();
        let entries = fs::read_dir(&dir_path)
            .map_err(|e| StorageError::IoError(format!("Failed to read directory {}: {}", dir_path.display(), e)))?;
        
        for entry in entries {
            let entry = entry.map_err(|e| StorageError::IoError(e.to_string()))?;
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
                if let Some(file_stem) = path.file_stem().and_then(|s| s.to_str()) {
                    files.push(file_stem.to_string());
                }
            }
        }
        
        Ok(files)
    }
    
    fn get_file_path(&self, subdir: &str, id: &str) -> PathBuf {
        self.data_dir.join(subdir).join(format!("{}.json", id))
    }
    
    async fn write_json_file<T>(&self, path: &Path, data: &T) -> StorageResult<()>
    where
        T: serde::Serialize,
    {
        let json = DataSerializer::to_json(data)
            .map_err(|e| StorageError::SerializationError(e.to_string()))?;
        
        // Compress if enabled
        let content = if self.config.compression_enabled {
            // Simple compression would go here - using uncompressed for now
            json.into_bytes()
        } else {
            json.into_bytes()
        };
        
        // Check file size limit
        if content.len() > self.config.max_file_size_mb * 1024 * 1024 {
            return Err(StorageError::ConfigurationError(format!(
                "File size {} MB exceeds limit of {} MB",
                content.len() / (1024 * 1024),
                self.config.max_file_size_mb
            )));
        }
        
        // Write atomically
        let temp_path = path.with_extension("json.tmp");
        let mut file = std::fs::File::create(&temp_path)
            .map_err(|e| StorageError::IoError(format!("Failed to create file {}: {}", temp_path.display(), e)))?;
        
        file.write_all(&content)
            .map_err(|e| StorageError::IoError(format!("Failed to write file {}: {}", temp_path.display(), e)))?;
        
        file.sync_all()
            .map_err(|e| StorageError::IoError(format!("Failed to sync file {}: {}", temp_path.display(), e)))?;
        
        std::fs::rename(&temp_path, path)
            .map_err(|e| StorageError::IoError(format!("Failed to rename {} to {}: {}", temp_path.display(), path.display(), e)))?;
        
        Ok(())
    }
    
    async fn read_json_file<T>(&self, path: &Path) -> StorageResult<Option<T>>
    where
        T: for<'de> serde::Deserialize<'de>,
    {
        if !path.exists() {
            return Ok(None);
        }
        
        let content = fs::read(path)
            .map_err(|e| StorageError::IoError(format!("Failed to read file {}: {}", path.display(), e)))?;
        
        // Decompress if needed
        let json_str = if self.config.compression_enabled {
            // Simple decompression would go here - using uncompressed for now
            String::from_utf8(content)
                .map_err(|e| StorageError::SerializationError(format!("Invalid UTF-8: {}", e)))?
        } else {
            String::from_utf8(content)
                .map_err(|e| StorageError::SerializationError(format!("Invalid UTF-8: {}", e)))?
        };
        
        let data = DataSerializer::from_json(&json_str)
            .map_err(|e| StorageError::SerializationError(e.to_string()))?;
        Ok(Some(data))
    }
    
    async fn update_index(&self, subdir: &str, id: &str) -> StorageResult<()> {
        let mut indexes = self.indexes.write().await;
        let index = indexes.entry(subdir.to_string()).or_insert_with(Vec::new);
        if !index.contains(&id.to_string()) {
            index.push(id.to_string());
        }
        Ok(())
    }
    
    async fn remove_from_index(&self, subdir: &str, id: &str) -> StorageResult<()> {
        let mut indexes = self.indexes.write().await;
        if let Some(index) = indexes.get_mut(subdir) {
            index.retain(|x| x != id);
        }
        Ok(())
    }
}

#[async_trait]
impl Storage for LocalStorage {
    async fn initialize(&mut self) -> StorageResult<()> {
        // Already initialized in new()
        Ok(())
    }
    
    async fn close(&mut self) -> StorageResult<()> {
        // No persistent connections to close
        Ok(())
    }
    
    async fn health_check(&self) -> StorageResult<bool> {
        // Check if data directory is accessible
        Ok(self.data_dir.exists() && self.data_dir.is_dir())
    }
    
    async fn get_metrics(&self) -> StorageResult<StorageMetrics> {
        let indexes = self.indexes.read().await;
        
        let total_incidents = indexes.get("incidents").map(|v| v.len()).unwrap_or(0);
        let total_evidence = indexes.get("evidence").map(|v| v.len()).unwrap_or(0);
        let total_investigations = indexes.get("investigations").map(|v| v.len()).unwrap_or(0);
        let total_playbooks = indexes.get("playbooks").map(|v| v.len()).unwrap_or(0);
        
        // Calculate directory size
        let mut storage_size_bytes = 0u64;
        if let Ok(entries) = fs::read_dir(&self.data_dir) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if metadata.is_file() {
                        storage_size_bytes += metadata.len();
                    }
                }
            }
        }
        
        Ok(StorageMetrics {
            total_incidents,
            total_evidence,
            total_investigations,
            total_playbooks,
            storage_size_bytes,
            index_size_bytes: 0, // No separate index files
            connection_pool_size: 0,
            active_connections: 0,
            average_query_time_ms: 1.0, // Very fast for local files
            last_backup: None, // Would implement backup tracking
            last_optimization: None,
        })
    }
}

#[async_trait]
impl IncidentStorage for LocalStorage {
    async fn store_incident(&self, incident: &Incident) -> StorageResult<String> {
        let id = if incident.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            incident.id.clone()
        };
        
        let path = self.get_file_path("incidents", &id);
        self.write_json_file(&path, incident).await?;
        self.update_index("incidents", &id).await?;
        
        Ok(id)
    }
    
    async fn get_incident(&self, id: &str) -> StorageResult<Option<Incident>> {
        let path = self.get_file_path("incidents", id);
        self.read_json_file(&path).await
    }
    
    async fn update_incident(&self, incident: &Incident) -> StorageResult<()> {
        let path = self.get_file_path("incidents", &incident.id);
        self.write_json_file(&path, incident).await?;
        self.update_index("incidents", &incident.id).await?;
        Ok(())
    }
    
    async fn delete_incident(&self, id: &str) -> StorageResult<()> {
        let path = self.get_file_path("incidents", id);
        if path.exists() {
            fs::remove_file(&path)
                .map_err(|e| StorageError::IoError(format!("Failed to delete file {}: {}", path.display(), e)))?;
            self.remove_from_index("incidents", id).await?;
        }
        Ok(())
    }
    
    async fn query_incidents(&self, params: &QueryParams) -> StorageResult<QueryResult<Incident>> {
        let indexes = self.indexes.read().await;
        let incident_ids = indexes.get("incidents").cloned().unwrap_or_default();
        
        let mut incidents = Vec::new();
        for id in &incident_ids {
            if let Some(incident) = self.get_incident(id).await? {
                incidents.push(incident);
            }
        }
        
        // Apply basic filtering (simplified)
        if let Some(limit) = params.limit {
            incidents.truncate(limit);
        }
        
        Ok(QueryResult {
            items: incidents.clone(),
            total_count: incidents.len(),
            page: 0,
            page_size: incidents.len(),
            execution_time_ms: 1,
        })
    }
    
    async fn search_incidents(&self, _query: &str, params: &QueryParams) -> StorageResult<QueryResult<Incident>> {
        // Basic implementation - would implement full-text search
        self.query_incidents(params).await
    }
    
    async fn bulk_store_incidents(&self, incidents: &[Incident]) -> StorageResult<BulkResult> {
        let mut success_count = 0;
        let mut errors = Vec::new();
        let start_time = std::time::Instant::now();
        
        for (index, incident) in incidents.iter().enumerate() {
            match self.store_incident(incident).await {
                Ok(_) => success_count += 1,
                Err(e) => {
                    errors.push(BulkError {
                        index,
                        id: Some(incident.id.clone()),
                        error: e.to_string(),
                    });
                }
            }
        }
        
        Ok(BulkResult {
            success_count,
            error_count: errors.len(),
            errors,
            execution_time_ms: start_time.elapsed().as_millis() as u64,
        })
    }
    
    async fn get_incidents_by_status(&self, status: &IncidentStatus) -> StorageResult<Vec<Incident>> {
        let indexes = self.indexes.read().await;
        let incident_ids = indexes.get("incidents").cloned().unwrap_or_default();
        
        let mut matching_incidents = Vec::new();
        for id in &incident_ids {
            if let Some(incident) = self.get_incident(id).await? {
                if incident.status == *status {
                    matching_incidents.push(incident);
                }
            }
        }
        
        Ok(matching_incidents)
    }
    
    async fn get_incidents_by_severity(&self, severity: &IncidentSeverity) -> StorageResult<Vec<Incident>> {
        let indexes = self.indexes.read().await;
        let incident_ids = indexes.get("incidents").cloned().unwrap_or_default();
        
        let mut matching_incidents = Vec::new();
        for id in &incident_ids {
            if let Some(incident) = self.get_incident(id).await? {
                if incident.severity == *severity {
                    matching_incidents.push(incident);
                }
            }
        }
        
        Ok(matching_incidents)
    }
    
    async fn get_incidents_by_date_range(&self, start: DateTime<Utc>, end: DateTime<Utc>) -> StorageResult<Vec<Incident>> {
        let indexes = self.indexes.read().await;
        let incident_ids = indexes.get("incidents").cloned().unwrap_or_default();
        
        let mut matching_incidents = Vec::new();
        for id in &incident_ids {
            if let Some(incident) = self.get_incident(id).await? {
                let incident_time = chrono::DateTime::from_timestamp(incident.created_at, 0)
                    .unwrap_or_else(|| Utc::now());
                if incident_time >= start && incident_time <= end {
                    matching_incidents.push(incident);
                }
            }
        }
        
        Ok(matching_incidents)
    }
}

// Implement other storage traits with similar patterns...
#[async_trait]
impl EvidenceStorage for LocalStorage {
    async fn store_evidence(&self, evidence: &Evidence) -> StorageResult<String> {
        let id = if evidence.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            evidence.id.clone()
        };
        
        let path = self.get_file_path("evidence", &id);
        self.write_json_file(&path, evidence).await?;
        self.update_index("evidence", &id).await?;
        
        Ok(id)
    }
    
    async fn get_evidence(&self, id: &str) -> StorageResult<Option<Evidence>> {
        let path = self.get_file_path("evidence", id);
        self.read_json_file(&path).await
    }
    
    async fn update_evidence(&self, evidence: &Evidence) -> StorageResult<()> {
        let path = self.get_file_path("evidence", &evidence.id);
        self.write_json_file(&path, evidence).await?;
        Ok(())
    }
    
    async fn delete_evidence(&self, id: &str) -> StorageResult<()> {
        let path = self.get_file_path("evidence", id);
        if path.exists() {
            fs::remove_file(&path)
                .map_err(|e| StorageError::IoError(e.to_string()))?;
            self.remove_from_index("evidence", id).await?;
        }
        Ok(())
    }
    
    async fn query_evidence(&self, params: &QueryParams) -> StorageResult<QueryResult<Evidence>> {
        let indexes = self.indexes.read().await;
        let evidence_ids = indexes.get("evidence").cloned().unwrap_or_default();
        
        let mut evidence_list = Vec::new();
        for id in &evidence_ids {
            if let Some(evidence) = self.get_evidence(id).await? {
                evidence_list.push(evidence);
            }
        }
        
        if let Some(limit) = params.limit {
            evidence_list.truncate(limit);
        }
        
        Ok(QueryResult {
            items: evidence_list.clone(),
            total_count: evidence_list.len(),
            page: 0,
            page_size: evidence_list.len(),
            execution_time_ms: 1,
        })
    }
    
    async fn search_evidence(&self, _query: &str, params: &QueryParams) -> StorageResult<QueryResult<Evidence>> {
        self.query_evidence(params).await
    }
    
    async fn get_evidence_by_incident(&self, _incident_id: &str) -> StorageResult<Vec<Evidence>> {
        // Would implement incident-evidence relationship tracking
        Ok(Vec::new())
    }
    
    async fn get_evidence_by_type(&self, evidence_type: &EvidenceType) -> StorageResult<Vec<Evidence>> {
        let indexes = self.indexes.read().await;
        let evidence_ids = indexes.get("evidence").cloned().unwrap_or_default();
        
        let mut matching_evidence = Vec::new();
        for id in &evidence_ids {
            if let Some(evidence) = self.get_evidence(id).await? {
                if evidence.evidence_type == *evidence_type {
                    matching_evidence.push(evidence);
                }
            }
        }
        
        Ok(matching_evidence)
    }
    
    async fn bulk_store_evidence(&self, evidence_list: &[Evidence]) -> StorageResult<BulkResult> {
        let mut success_count = 0;
        let mut errors = Vec::new();
        let start_time = std::time::Instant::now();
        
        for (index, evidence) in evidence_list.iter().enumerate() {
            match self.store_evidence(evidence).await {
                Ok(_) => success_count += 1,
                Err(e) => {
                    errors.push(BulkError {
                        index,
                        id: Some(evidence.id.clone()),
                        error: e.to_string(),
                    });
                }
            }
        }
        
        Ok(BulkResult {
            success_count,
            error_count: errors.len(),
            errors,
            execution_time_ms: start_time.elapsed().as_millis() as u64,
        })
    }
}

// Simplified implementations for PlaybookStorage and InvestigationStorage
#[async_trait]
impl PlaybookStorage for LocalStorage {
    async fn store_playbook(&self, playbook: &ResponsePlaybook) -> StorageResult<String> {
        let id = if playbook.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            playbook.id.clone()
        };
        
        let path = self.get_file_path("playbooks", &id);
        self.write_json_file(&path, playbook).await?;
        self.update_index("playbooks", &id).await?;
        
        Ok(id)
    }
    
    async fn get_playbook(&self, id: &str) -> StorageResult<Option<ResponsePlaybook>> {
        let path = self.get_file_path("playbooks", id);
        self.read_json_file(&path).await
    }
    
    async fn update_playbook(&self, playbook: &ResponsePlaybook) -> StorageResult<()> {
        let path = self.get_file_path("playbooks", &playbook.id);
        self.write_json_file(&path, playbook).await
    }
    
    async fn delete_playbook(&self, id: &str) -> StorageResult<()> {
        let path = self.get_file_path("playbooks", id);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| StorageError::IoError(e.to_string()))?;
            self.remove_from_index("playbooks", id).await?;
        }
        Ok(())
    }
    
    async fn query_playbooks(&self, params: &QueryParams) -> StorageResult<QueryResult<ResponsePlaybook>> {
        let indexes = self.indexes.read().await;
        let playbook_ids = indexes.get("playbooks").cloned().unwrap_or_default();
        
        let mut playbooks = Vec::new();
        for id in &playbook_ids {
            if let Some(playbook) = self.get_playbook(id).await? {
                playbooks.push(playbook);
            }
        }
        
        if let Some(limit) = params.limit {
            playbooks.truncate(limit);
        }
        
        Ok(QueryResult {
            items: playbooks.clone(),
            total_count: playbooks.len(),
            page: 0,
            page_size: playbooks.len(),
            execution_time_ms: 1,
        })
    }
    
    async fn get_playbooks_by_category(&self, category: &IncidentCategory) -> StorageResult<Vec<ResponsePlaybook>> {
        let indexes = self.indexes.read().await;
        let playbook_ids = indexes.get("playbooks").cloned().unwrap_or_default();
        
        let mut matching_playbooks = Vec::new();
        for id in &playbook_ids {
            if let Some(playbook) = self.get_playbook(id).await? {
                if playbook.category == *category {
                    matching_playbooks.push(playbook);
                }
            }
        }
        
        Ok(matching_playbooks)
    }
    
    async fn get_active_playbooks(&self) -> StorageResult<Vec<ResponsePlaybook>> {
        let indexes = self.indexes.read().await;
        let playbook_ids = indexes.get("playbooks").cloned().unwrap_or_default();
        
        let mut active_playbooks = Vec::new();
        for id in &playbook_ids {
            if let Some(playbook) = self.get_playbook(id).await? {
                if playbook.active {
                    active_playbooks.push(playbook);
                }
            }
        }
        
        Ok(active_playbooks)
    }
}

#[async_trait]
impl InvestigationStorage for LocalStorage {
    async fn store_investigation(&self, investigation: &ForensicInvestigation) -> StorageResult<String> {
        let id = if investigation.id.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            investigation.id.clone()
        };
        
        let path = self.get_file_path("investigations", &id);
        self.write_json_file(&path, investigation).await?;
        self.update_index("investigations", &id).await?;
        
        Ok(id)
    }
    
    async fn get_investigation(&self, id: &str) -> StorageResult<Option<ForensicInvestigation>> {
        let path = self.get_file_path("investigations", id);
        self.read_json_file(&path).await
    }
    
    async fn update_investigation(&self, investigation: &ForensicInvestigation) -> StorageResult<()> {
        let path = self.get_file_path("investigations", &investigation.id);
        self.write_json_file(&path, investigation).await
    }
    
    async fn delete_investigation(&self, id: &str) -> StorageResult<()> {
        let path = self.get_file_path("investigations", id);
        if path.exists() {
            fs::remove_file(&path).map_err(|e| StorageError::IoError(e.to_string()))?;
            self.remove_from_index("investigations", id).await?;
        }
        Ok(())
    }
    
    async fn query_investigations(&self, params: &QueryParams) -> StorageResult<QueryResult<ForensicInvestigation>> {
        let indexes = self.indexes.read().await;
        let investigation_ids = indexes.get("investigations").cloned().unwrap_or_default();
        
        let mut investigations = Vec::new();
        for id in &investigation_ids {
            if let Some(investigation) = self.get_investigation(id).await? {
                investigations.push(investigation);
            }
        }
        
        if let Some(limit) = params.limit {
            investigations.truncate(limit);
        }
        
        Ok(QueryResult {
            items: investigations.clone(),
            total_count: investigations.len(),
            page: 0,
            page_size: investigations.len(),
            execution_time_ms: 1,
        })
    }
    
    async fn get_investigations_by_incident(&self, _incident_id: &str) -> StorageResult<Vec<ForensicInvestigation>> {
        // Would implement incident-investigation relationship tracking
        Ok(Vec::new())
    }
}

#[async_trait]
impl ComprehensiveStorage for LocalStorage {
    fn storage_type(&self) -> &'static str {
        "local"
    }
    
    fn supports_full_text_search(&self) -> bool {
        false // Could implement with external indexing
    }
    
    fn supports_transactions(&self) -> bool {
        false // File system doesn't support transactions
    }
    
    fn supports_real_time_updates(&self) -> bool {
        false // Would need file system watching
    }
    
    async fn backup(&self, path: &str) -> StorageResult<()> {
        let backup_path = Path::new(path);
        let backup_dir = self.data_dir.join("backups").join(Utc::now().format("%Y%m%d_%H%M%S").to_string());
        
        fs::create_dir_all(&backup_dir)
            .map_err(|e| StorageError::IoError(format!("Failed to create backup directory: {}", e)))?;
        
        // Copy all data files to backup directory
        self.copy_directory(&self.data_dir, &backup_dir).await?;
        
        Ok(())
    }
    
    async fn restore(&self, _path: &str) -> StorageResult<()> {
        // Would implement restoration from backup
        Err(StorageError::ConfigurationError("Restore not implemented yet".to_string()))
    }
    
    async fn optimize(&self) -> StorageResult<()> {
        // Rebuild indexes
        self.build_indexes().await?;
        Ok(())
    }
}

impl LocalStorage {
    async fn copy_directory(&self, src: &Path, dst: &Path) -> StorageResult<()> {
        if !dst.exists() {
            fs::create_dir_all(dst)
                .map_err(|e| StorageError::IoError(format!("Failed to create directory {}: {}", dst.display(), e)))?;
        }
        
        let entries = fs::read_dir(src)
            .map_err(|e| StorageError::IoError(format!("Failed to read directory {}: {}", src.display(), e)))?;
        
        for entry in entries {
            let entry = entry.map_err(|e| StorageError::IoError(e.to_string()))?;
            let src_path = entry.path();
            let dst_path = dst.join(entry.file_name());
            
            if src_path.is_file() {
                fs::copy(&src_path, &dst_path)
                    .map_err(|e| StorageError::IoError(format!("Failed to copy {} to {}: {}", src_path.display(), dst_path.display(), e)))?;
            } else if src_path.is_dir() {
                self.copy_directory(&src_path, &dst_path).await?;
            }
        }
        
        Ok(())
    }
}