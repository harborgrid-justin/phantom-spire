//! Phantom MITRE Core - Storage Module
//! 
//! This module provides storage abstractions and implementations for MITRE ATT&CK data.

pub mod traits;
pub mod local;

// Re-export public types and traits
pub use traits::*;
pub use local::LocalStorage;

use crate::config::{StorageConfig, StorageBackend};

/// Storage factory for creating storage implementations
pub struct StorageFactory;

impl StorageFactory {
    /// Create a new storage instance based on the configuration
    pub fn create_storage(config: &StorageConfig) -> StorageResult<Box<dyn MitreStorage>> {
        match config.backend {
            StorageBackend::Memory => {
                let mut storage = LocalStorage::new();
                // Configure memory-specific settings from config.memory if needed
                Ok(Box::new(storage))
            }
            StorageBackend::Redis => {
                // TODO: Implement Redis storage
                Err(StorageError::Configuration("Redis storage not implemented yet".to_string()))
            }
            StorageBackend::PostgreSQL => {
                // TODO: Implement PostgreSQL storage
                Err(StorageError::Configuration("PostgreSQL storage not implemented yet".to_string()))
            }
            StorageBackend::MongoDB => {
                // TODO: Implement MongoDB storage
                Err(StorageError::Configuration("MongoDB storage not implemented yet".to_string()))
            }
            StorageBackend::Elasticsearch => {
                // TODO: Implement Elasticsearch storage
                Err(StorageError::Configuration("Elasticsearch storage not implemented yet".to_string()))
            }
            StorageBackend::Hybrid => {
                // TODO: Implement Hybrid storage (multiple backends)
                Err(StorageError::Configuration("Hybrid storage not implemented yet".to_string()))
            }
        }
    }

    /// Create a default local storage instance
    pub fn create_local_storage() -> LocalStorage {
        LocalStorage::new()
    }

    /// Create and initialize a local storage instance with sample data
    pub async fn create_initialized_local_storage() -> StorageResult<LocalStorage> {
        let mut storage = LocalStorage::new();
        storage.initialize().await?;
        Ok(storage)
    }
}

/// Helper function to create a default storage instance (synchronous)
pub fn create_default_storage() -> Box<dyn MitreStorage> {
    let config = StorageConfig::default();
    let storage = StorageFactory::create_storage(&config)
        .expect("Failed to create default storage");
    storage
}

/// Helper function to create a default storage instance with initialization (async)
pub async fn create_default_storage_with_init() -> StorageResult<Box<dyn MitreStorage>> {
    let config = StorageConfig::default();
    let mut storage = StorageFactory::create_storage(&config)?;
    storage.initialize().await?;
    Ok(storage)
}

/// Helper function to create a local storage instance with sample data
pub async fn create_sample_storage() -> StorageResult<LocalStorage> {
    let mut storage = LocalStorage::new();
    storage.initialize().await?;
    Ok(storage)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::*;
    use chrono::Utc;

    #[tokio::test]
    async fn test_local_storage_creation() {
        let storage = LocalStorage::new();
        // Test that the storage can be created successfully
        assert!(true); // LocalStorage was created
    }

    #[tokio::test]
    async fn test_local_storage_initialization() {
        let mut storage = LocalStorage::new();
        assert!(storage.initialize().await.is_ok());
    }

    #[tokio::test]
    async fn test_storage_factory() {
        let config = StorageConfig::default();
        let storage = StorageFactory::create_storage(&config);
        assert!(storage.is_ok());
    }

    #[tokio::test]
    async fn test_technique_operations() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();

        // Test storing a technique
        let technique = MitreTechnique {
            id: "T9999".to_string(),
            name: "Test Technique".to_string(),
            description: "A test technique".to_string(),
            tactic: MitreTactic::Discovery,
            platforms: vec![MitrePlatform::Windows],
            data_sources: vec![DataSource::ProcessMonitoring],
            detection_difficulty: DetectionDifficulty::Medium,
            sub_techniques: vec![],
            mitigations: vec![],
            detection_rules: vec![],
            kill_chain_phases: vec!["act".to_string()],
            permissions_required: vec!["User".to_string()],
            effective_permissions: vec!["User".to_string()],
            system_requirements: vec![],
            network_requirements: vec![],
            remote_support: false,
            impact_type: vec![],
            created: Utc::now(),
            modified: Utc::now(),
            version: "1.0".to_string(),
            revoked: false,
            deprecated: false,
        };

        let stored_id = storage.store_technique(technique.clone()).await.unwrap();
        assert_eq!(stored_id, "T9999");

        // Test retrieving the technique
        let retrieved = storage.get_technique("T9999").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().name, "Test Technique");

        // Test updating the technique
        let mut updated_technique = technique.clone();
        updated_technique.name = "Updated Test Technique".to_string();
        assert!(storage.update_technique(updated_technique).await.is_ok());

        let retrieved_updated = storage.get_technique("T9999").await.unwrap();
        assert_eq!(retrieved_updated.unwrap().name, "Updated Test Technique");

        // Test deleting the technique
        let deleted = storage.delete_technique("T9999").await.unwrap();
        assert!(deleted);

        let retrieved_after_delete = storage.get_technique("T9999").await.unwrap();
        assert!(retrieved_after_delete.is_none());
    }

    #[tokio::test]
    async fn test_technique_filtering() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();

        // Test filtering by tactic
        let filter = TechniqueFilter {
            tactics: Some(vec![MitreTactic::InitialAccess]),
            ..Default::default()
        };

        let results = storage.list_techniques(Some(filter), None, None, None).await.unwrap();
        assert!(!results.is_empty());
        
        // All results should have InitialAccess tactic
        for technique in results {
            assert_eq!(technique.tactic, MitreTactic::InitialAccess);
        }
    }

    #[tokio::test]
    async fn test_search_functionality() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();

        // Test searching for techniques
        let results = storage.search_techniques("Spearphishing", Some(10)).await.unwrap();
        assert!(!results.is_empty());
        
        // Results should contain the search term
        for technique in results {
            assert!(technique.name.to_lowercase().contains("spearphishing") || 
                   technique.description.to_lowercase().contains("spearphishing"));
        }
    }

    #[tokio::test]
    async fn test_health_check() {
        let storage = LocalStorage::new();
        let health = storage.health_check().await.unwrap();
        assert_eq!(health.status, "healthy");
        assert!(health.response_time_ms >= 0);
    }

    #[tokio::test]
    async fn test_statistics() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();

        let stats = storage.get_statistics().await.unwrap();
        assert!(stats.technique_count > 0);
        assert!(stats.group_count > 0);
        assert!(stats.software_count > 0);
    }

    #[tokio::test]
    async fn test_bulk_operations() {
        let mut storage = LocalStorage::new();
        storage.initialize().await.unwrap();

        let techniques = vec![
            MitreTechnique {
                id: "T8001".to_string(),
                name: "Bulk Test 1".to_string(),
                description: "First bulk test technique".to_string(),
                tactic: MitreTactic::Discovery,
                platforms: vec![MitrePlatform::Windows],
                data_sources: vec![DataSource::ProcessMonitoring],
                detection_difficulty: DetectionDifficulty::Easy,
                sub_techniques: vec![],
                mitigations: vec![],
                detection_rules: vec![],
                kill_chain_phases: vec!["act".to_string()],
                permissions_required: vec!["User".to_string()],
                effective_permissions: vec!["User".to_string()],
                system_requirements: vec![],
                network_requirements: vec![],
                remote_support: false,
                impact_type: vec![],
                created: Utc::now(),
                modified: Utc::now(),
                version: "1.0".to_string(),
                revoked: false,
                deprecated: false,
            },
            MitreTechnique {
                id: "T8002".to_string(),
                name: "Bulk Test 2".to_string(),
                description: "Second bulk test technique".to_string(),
                tactic: MitreTactic::Collection,
                platforms: vec![MitrePlatform::Linux],
                data_sources: vec![DataSource::FileMonitoring],
                detection_difficulty: DetectionDifficulty::Hard,
                sub_techniques: vec![],
                mitigations: vec![],
                detection_rules: vec![],
                kill_chain_phases: vec!["act".to_string()],
                permissions_required: vec!["Administrator".to_string()],
                effective_permissions: vec!["Administrator".to_string()],
                system_requirements: vec![],
                network_requirements: vec![],
                remote_support: true,
                impact_type: vec![],
                created: Utc::now(),
                modified: Utc::now(),
                version: "1.0".to_string(),
                revoked: false,
                deprecated: false,
            },
        ];

        let ids = storage.bulk_store_techniques(techniques).await.unwrap();
        assert_eq!(ids.len(), 2);
        assert_eq!(ids[0], "T8001");
        assert_eq!(ids[1], "T8002");

        // Verify they were stored
        let technique1 = storage.get_technique("T8001").await.unwrap();
        let technique2 = storage.get_technique("T8002").await.unwrap();
        
        assert!(technique1.is_some());
        assert!(technique2.is_some());
        assert_eq!(technique1.unwrap().name, "Bulk Test 1");
        assert_eq!(technique2.unwrap().name, "Bulk Test 2");
    }
}