//! Data Store Configuration
//! 
//! Configuration structures and types for IOC data stores
//! Enhanced with phantom-cve-core architectural patterns

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::time::Duration;

pub use crate::data_stores::config_types::*;
pub use crate::data_stores::configs::*;

/// Comprehensive data store configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreConfig {
    /// Default data store type
    pub default_store: DataStoreType,
    /// Enable multi-tenancy support
    pub multi_tenancy: bool,
    /// Cache TTL for frequently accessed data
    pub cache_ttl: Duration,
    /// Health check interval
    pub health_check_interval: Duration,
    /// Metrics collection interval
    pub metrics_interval: Duration,
    /// Store-specific configurations
    pub redis: Option<RedisConfig>,
    pub postgresql: Option<PostgreSQLConfig>,
    pub mongodb: Option<MongoDBConfig>,
    pub elasticsearch: Option<ElasticsearchConfig>,
    pub local_file: Option<LocalFileConfig>,
    /// Custom configurations for external stores
    pub custom_configs: HashMap<String, HashMap<String, String>>,
    /// Feature flags
    pub features: DataStoreFeatures,
}

/// Feature flags for data store capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreFeatures {
    /// Enable full-text search capabilities
    pub full_text_search: bool,
    /// Enable analytical queries
    pub analytics: bool,
    /// Enable bulk operations
    pub bulk_operations: bool,
    /// Enable real-time subscriptions
    pub subscriptions: bool,
    /// Enable data encryption at rest
    pub encryption_at_rest: bool,
    /// Enable audit logging
    pub audit_logging: bool,
    /// Enable backup and restore
    pub backup_restore: bool,
    /// Enable data versioning
    pub versioning: bool,
}

impl Default for DataStoreFeatures {
    fn default() -> Self {
        Self {
            full_text_search: true,
            analytics: true,
            bulk_operations: true,
            subscriptions: false,
            encryption_at_rest: false,
            audit_logging: true,
            backup_restore: false,
            versioning: false,
        }
    }
}

impl Default for DataStoreConfig {
    fn default() -> Self {
        Self {
            default_store: DataStoreType::Memory,
            multi_tenancy: true,
            cache_ttl: Duration::from_secs(3600), // 1 hour
            health_check_interval: Duration::from_secs(30),
            metrics_interval: Duration::from_secs(60),
            redis: None,
            postgresql: None,
            mongodb: None,
            elasticsearch: None,
            local_file: Some(LocalFileConfig::default()),
            custom_configs: HashMap::new(),
            features: DataStoreFeatures::default(),
        }
    }
}

impl DataStoreConfig {
    /// Create a new configuration with default values
    pub fn new() -> Self {
        Self::default()
    }
    
    /// Create configuration for a specific store type with defaults
    pub fn for_store_type(store_type: DataStoreType) -> Self {
        let mut config = Self::default();
        config.default_store = store_type.clone();
        
        match store_type {
            DataStoreType::Redis => {
                config.redis = Some(RedisConfig::default());
            }
            DataStoreType::PostgreSQL => {
                config.postgresql = Some(PostgreSQLConfig::default());
            }
            DataStoreType::MongoDB => {
                config.mongodb = Some(MongoDBConfig::default());
            }
            DataStoreType::Elasticsearch => {
                config.elasticsearch = Some(ElasticsearchConfig::default());
            }
            DataStoreType::LocalFile => {
                config.local_file = Some(LocalFileConfig::default());
            }
            _ => {}
        }
        
        config
    }
    
    /// Enable multi-tenancy with appropriate store configuration
    pub fn with_multi_tenancy(mut self) -> Self {
        self.multi_tenancy = true;
        self
    }
    
    /// Set cache TTL duration
    pub fn with_cache_ttl(mut self, ttl: Duration) -> Self {
        self.cache_ttl = ttl;
        self
    }
    
    /// Enable specific features
    pub fn with_features(mut self, features: DataStoreFeatures) -> Self {
        self.features = features;
        self
    }
    
    /// Validate the configuration
    pub fn validate(&self) -> Result<(), String> {
        match self.default_store {
            DataStoreType::Redis if self.redis.is_none() => {
                Err("Redis configuration required for Redis store type".to_string())
            }
            DataStoreType::PostgreSQL if self.postgresql.is_none() => {
                Err("PostgreSQL configuration required for PostgreSQL store type".to_string())
            }
            DataStoreType::MongoDB if self.mongodb.is_none() => {
                Err("MongoDB configuration required for MongoDB store type".to_string())
            }
            DataStoreType::Elasticsearch if self.elasticsearch.is_none() => {
                Err("Elasticsearch configuration required for Elasticsearch store type".to_string())
            }
            DataStoreType::LocalFile if self.local_file.is_none() => {
                Err("Local file configuration required for LocalFile store type".to_string())
            }
            _ => Ok(()),
        }
    }
}