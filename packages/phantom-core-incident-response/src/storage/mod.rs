//! Storage abstraction layer for phantom-incident-response-core
//! Provides database-agnostic interfaces and implementations for multiple backends

pub mod traits;
pub mod local;

pub use traits::*;
pub use local::LocalStorage;

use crate::config::Config;
use crate::central_config::CentralConfig;
use std::sync::Arc;

/// Storage configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct StorageConfig {
    pub storage_type: StorageType,
    pub local: Option<LocalStorageConfig>,
    pub postgres: Option<PostgresStorageConfig>,
    pub elasticsearch: Option<ElasticsearchStorageConfig>,
    pub mongodb: Option<MongoDbStorageConfig>,
}

/// Storage backend types
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum StorageType {
    Local,
    Postgres,
    Elasticsearch,
    MongoDB,
}

/// Local storage configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LocalStorageConfig {
    pub data_dir: String,
    pub max_file_size_mb: usize,
    pub compression_enabled: bool,
    pub backup_interval_hours: Option<u32>,
}

/// PostgreSQL storage configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PostgresStorageConfig {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
    pub pool_size: u32,
    pub connection_timeout_seconds: u64,
    pub ssl_mode: String,
}

/// Elasticsearch storage configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ElasticsearchStorageConfig {
    pub nodes: Vec<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub index_prefix: String,
    pub number_of_shards: u32,
    pub number_of_replicas: u32,
    pub refresh_interval: String,
}

/// MongoDB storage configuration
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MongoDbStorageConfig {
    pub connection_string: String,
    pub database: String,
    pub collection_prefix: String,
    pub pool_size: u32,
    pub connection_timeout_ms: u64,
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            storage_type: StorageType::Local,
            local: Some(LocalStorageConfig::default()),
            postgres: None,
            elasticsearch: None,
            mongodb: None,
        }
    }
}

impl Default for LocalStorageConfig {
    fn default() -> Self {
        Self {
            data_dir: "./incident_response_data".to_string(),
            max_file_size_mb: 1024, // 1GB
            compression_enabled: true,
            backup_interval_hours: Some(24),
        }
    }
}

impl Default for PostgresStorageConfig {
    fn default() -> Self {
        Self {
            host: "localhost".to_string(),
            port: 5432,
            database: "incident_response".to_string(),
            username: "postgres".to_string(),
            password: "password".to_string(),
            pool_size: 10,
            connection_timeout_seconds: 30,
            ssl_mode: "prefer".to_string(),
        }
    }
}

impl Default for ElasticsearchStorageConfig {
    fn default() -> Self {
        Self {
            nodes: vec!["http://localhost:9200".to_string()],
            username: None,
            password: None,
            index_prefix: "incident_response".to_string(),
            number_of_shards: 1,
            number_of_replicas: 0,
            refresh_interval: "1s".to_string(),
        }
    }
}

impl Default for MongoDbStorageConfig {
    fn default() -> Self {
        Self {
            connection_string: "mongodb://localhost:27017".to_string(),
            database: "incident_response".to_string(),
            collection_prefix: "ir".to_string(),
            pool_size: 10,
            connection_timeout_ms: 30000,
        }
    }
}

/// Factory function to create appropriate storage backend based on configuration
pub async fn create_storage(config: &StorageConfig) -> StorageResult<Arc<dyn ComprehensiveStorage>> {
    match config.storage_type {
        StorageType::Local => {
            let local_config = config.local.as_ref()
                .ok_or_else(|| StorageError::ConfigurationError("Local storage configuration not found".to_string()))?;
            let storage = LocalStorage::new(local_config.clone()).await?;
            Ok(Arc::new(storage))
        },
        StorageType::Postgres => {
            Err(StorageError::ConfigurationError("PostgreSQL storage not implemented yet".to_string()))
        },
        StorageType::Elasticsearch => {
            Err(StorageError::ConfigurationError("Elasticsearch storage not implemented yet".to_string()))
        },
        StorageType::MongoDB => {
            Err(StorageError::ConfigurationError("MongoDB storage not implemented yet".to_string()))
        },
    }
}

/// Create storage from environment variables
pub async fn create_storage_from_env() -> StorageResult<Arc<dyn ComprehensiveStorage>> {
    let config = StorageConfig::from_env();
    create_storage(&config).await
}

/// Create storage from CentralConfig
pub async fn create_storage_from_central_config(central_config: &CentralConfig) -> StorageResult<Arc<dyn ComprehensiveStorage>> {
    let config = StorageConfig::from_central_config(central_config);
    create_storage(&config).await
}

impl StorageConfig {
    /// Create configuration from environment variables
    pub fn from_env() -> Self {
        let storage_type = std::env::var("INCIDENT_RESPONSE_STORAGE_TYPE")
            .unwrap_or_else(|_| "local".to_string());
        
        let storage_type = match storage_type.to_lowercase().as_str() {
            "postgres" | "postgresql" => StorageType::Postgres,
            "elasticsearch" | "es" => StorageType::Elasticsearch,
            "mongodb" | "mongo" => StorageType::MongoDB,
            _ => StorageType::Local,
        };
        
        let mut config = Self {
            storage_type,
            local: None,
            postgres: None,
            elasticsearch: None,
            mongodb: None,
        };
        
        // Configure based on selected storage type
        match config.storage_type {
            StorageType::Local => {
                config.local = Some(LocalStorageConfig {
                    data_dir: std::env::var("INCIDENT_RESPONSE_DATA_DIR")
                        .unwrap_or_else(|_| "./incident_response_data".to_string()),
                    max_file_size_mb: std::env::var("INCIDENT_RESPONSE_MAX_FILE_SIZE_MB")
                        .unwrap_or_else(|_| "1024".to_string())
                        .parse().unwrap_or(1024),
                    compression_enabled: std::env::var("INCIDENT_RESPONSE_COMPRESSION_ENABLED")
                        .unwrap_or_else(|_| "true".to_string())
                        .parse().unwrap_or(true),
                    backup_interval_hours: std::env::var("INCIDENT_RESPONSE_BACKUP_INTERVAL_HOURS")
                        .ok()
                        .and_then(|s| s.parse().ok()),
                });
            },
            StorageType::Postgres => {
                config.postgres = Some(PostgresStorageConfig {
                    host: std::env::var("INCIDENT_RESPONSE_POSTGRES_HOST")
                        .unwrap_or_else(|_| "localhost".to_string()),
                    port: std::env::var("INCIDENT_RESPONSE_POSTGRES_PORT")
                        .unwrap_or_else(|_| "5432".to_string())
                        .parse().unwrap_or(5432),
                    database: std::env::var("INCIDENT_RESPONSE_POSTGRES_DB")
                        .unwrap_or_else(|_| "incident_response".to_string()),
                    username: std::env::var("INCIDENT_RESPONSE_POSTGRES_USER")
                        .unwrap_or_else(|_| "postgres".to_string()),
                    password: std::env::var("INCIDENT_RESPONSE_POSTGRES_PASSWORD")
                        .unwrap_or_else(|_| "password".to_string()),
                    pool_size: std::env::var("INCIDENT_RESPONSE_POSTGRES_POOL_SIZE")
                        .unwrap_or_else(|_| "10".to_string())
                        .parse().unwrap_or(10),
                    connection_timeout_seconds: std::env::var("INCIDENT_RESPONSE_POSTGRES_TIMEOUT")
                        .unwrap_or_else(|_| "30".to_string())
                        .parse().unwrap_or(30),
                    ssl_mode: std::env::var("INCIDENT_RESPONSE_POSTGRES_SSL_MODE")
                        .unwrap_or_else(|_| "prefer".to_string()),
                });
            },
            StorageType::Elasticsearch => {
                let nodes = std::env::var("INCIDENT_RESPONSE_ES_NODES")
                    .unwrap_or_else(|_| "http://localhost:9200".to_string())
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .collect();
                
                config.elasticsearch = Some(ElasticsearchStorageConfig {
                    nodes,
                    username: std::env::var("INCIDENT_RESPONSE_ES_USERNAME").ok(),
                    password: std::env::var("INCIDENT_RESPONSE_ES_PASSWORD").ok(),
                    index_prefix: std::env::var("INCIDENT_RESPONSE_ES_INDEX_PREFIX")
                        .unwrap_or_else(|_| "incident_response".to_string()),
                    number_of_shards: std::env::var("INCIDENT_RESPONSE_ES_SHARDS")
                        .unwrap_or_else(|_| "1".to_string())
                        .parse().unwrap_or(1),
                    number_of_replicas: std::env::var("INCIDENT_RESPONSE_ES_REPLICAS")
                        .unwrap_or_else(|_| "0".to_string())
                        .parse().unwrap_or(0),
                    refresh_interval: std::env::var("INCIDENT_RESPONSE_ES_REFRESH_INTERVAL")
                        .unwrap_or_else(|_| "1s".to_string()),
                });
            },
            StorageType::MongoDB => {
                config.mongodb = Some(MongoDbStorageConfig {
                    connection_string: std::env::var("INCIDENT_RESPONSE_MONGO_URI")
                        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string()),
                    database: std::env::var("INCIDENT_RESPONSE_MONGO_DB")
                        .unwrap_or_else(|_| "incident_response".to_string()),
                    collection_prefix: std::env::var("INCIDENT_RESPONSE_MONGO_COLLECTION_PREFIX")
                        .unwrap_or_else(|_| "ir".to_string()),
                    pool_size: std::env::var("INCIDENT_RESPONSE_MONGO_POOL_SIZE")
                        .unwrap_or_else(|_| "10".to_string())
                        .parse().unwrap_or(10),
                    connection_timeout_ms: std::env::var("INCIDENT_RESPONSE_MONGO_TIMEOUT")
                        .unwrap_or_else(|_| "30000".to_string())
                        .parse().unwrap_or(30000),
                });
            },
        }
        
        config
    }
    
    /// Create configuration from CentralConfig
    pub fn from_central_config(central_config: &CentralConfig) -> Self {
        let storage_type = match central_config.storage.storage_type.to_lowercase().as_str() {
            "postgres" | "postgresql" => StorageType::Postgres,
            "elasticsearch" | "es" => StorageType::Elasticsearch,
            "mongodb" | "mongo" => StorageType::MongoDB,
            _ => StorageType::Local,
        };
        
        let mut config = Self {
            storage_type,
            local: None,
            postgres: None,
            elasticsearch: None,
            mongodb: None,
        };
        
        // Configure based on selected storage type
        match config.storage_type {
            StorageType::Local => {
                if let Some(ref local_config) = central_config.storage.local {
                    config.local = Some(LocalStorageConfig {
                        data_dir: local_config.data_dir.clone(),
                        max_file_size_mb: local_config.max_file_size_mb as usize,
                        compression_enabled: local_config.compression_enabled,
                        backup_interval_hours: local_config.backup_interval_hours,
                    });
                }
            },
            StorageType::Postgres => {
                if let Some(ref postgres_config) = central_config.storage.postgres {
                    config.postgres = Some(PostgresStorageConfig {
                        host: postgres_config.host.clone(),
                        port: postgres_config.port,
                        database: postgres_config.database.clone(),
                        username: postgres_config.username.clone(),
                        password: postgres_config.password.clone(),
                        pool_size: postgres_config.pool_size,
                        connection_timeout_seconds: postgres_config.connection_timeout_seconds as u64,
                        ssl_mode: postgres_config.ssl_mode.clone(),
                    });
                }
            },
            StorageType::Elasticsearch => {
                if let Some(ref es_config) = central_config.storage.elasticsearch {
                    config.elasticsearch = Some(ElasticsearchStorageConfig {
                        nodes: es_config.nodes.clone(),
                        username: es_config.username.clone(),
                        password: es_config.password.clone(),
                        index_prefix: es_config.index_prefix.clone(),
                        number_of_shards: es_config.number_of_shards,
                        number_of_replicas: es_config.number_of_replicas,
                        refresh_interval: es_config.refresh_interval.clone(),
                    });
                }
            },
            StorageType::MongoDB => {
                if let Some(ref mongo_config) = central_config.storage.mongodb {
                    config.mongodb = Some(MongoDbStorageConfig {
                        connection_string: mongo_config.connection_string.clone(),
                        database: mongo_config.database.clone(),
                        collection_prefix: mongo_config.collection_prefix.clone(),
                        pool_size: mongo_config.pool_size,
                        connection_timeout_ms: mongo_config.connection_timeout_ms as u64,
                    });
                }
            },
        }
        
        config
    }
    
    /// Validate the configuration
    pub fn validate(&self) -> Result<(), String> {
        match self.storage_type {
            StorageType::Local => {
                if self.local.is_none() {
                    return Err("Local storage configuration is required".to_string());
                }
            },
            StorageType::Postgres => {
                if self.postgres.is_none() {
                    return Err("PostgreSQL storage configuration is required".to_string());
                }
            },
            StorageType::Elasticsearch => {
                if self.elasticsearch.is_none() {
                    return Err("Elasticsearch storage configuration is required".to_string());
                }
            },
            StorageType::MongoDB => {
                if self.mongodb.is_none() {
                    return Err("MongoDB storage configuration is required".to_string());
                }
            },
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_storage_config_default() {
        let config = StorageConfig::default();
        assert!(matches!(config.storage_type, StorageType::Local));
        assert!(config.local.is_some());
    }
    
    #[test]
    fn test_storage_config_validation() {
        let config = StorageConfig::default();
        assert!(config.validate().is_ok());
        
        let invalid_config = StorageConfig {
            storage_type: StorageType::Postgres,
            local: None,
            postgres: None,
            elasticsearch: None,
            mongodb: None,
        };
        assert!(invalid_config.validate().is_err());
    }
}