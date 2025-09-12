//! Data Store Configuration
//! 
//! Configuration structures and types for IOC data stores
//! Enhanced with phantom-cve-core architectural patterns

use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::time::Duration;

/// Data store type enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DataStoreType {
    /// In-memory storage (for testing/development)
    Memory,
    /// Local file system storage
    LocalFile,
    /// Redis cache and storage
    Redis,
    /// PostgreSQL relational database
    PostgreSQL,
    /// MongoDB document database
    MongoDB,
    /// Elasticsearch search engine
    Elasticsearch,
    /// SQLite embedded database
    SQLite,
    /// Custom external data store
    Custom(String),
}

impl std::fmt::Display for DataStoreType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataStoreType::Memory => write!(f, "memory"),
            DataStoreType::LocalFile => write!(f, "local_file"),
            DataStoreType::Redis => write!(f, "redis"),
            DataStoreType::PostgreSQL => write!(f, "postgresql"),
            DataStoreType::MongoDB => write!(f, "mongodb"),
            DataStoreType::Elasticsearch => write!(f, "elasticsearch"),
            DataStoreType::SQLite => write!(f, "sqlite"),
            DataStoreType::Custom(name) => write!(f, "custom_{}", name),
        }
    }
}

impl std::str::FromStr for DataStoreType {
    type Err = String;
    
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "memory" => Ok(DataStoreType::Memory),
            "local_file" | "localfile" => Ok(DataStoreType::LocalFile),
            "redis" => Ok(DataStoreType::Redis),
            "postgresql" | "postgres" => Ok(DataStoreType::PostgreSQL),
            "mongodb" | "mongo" => Ok(DataStoreType::MongoDB),
            "elasticsearch" | "elastic" => Ok(DataStoreType::Elasticsearch),
            "sqlite" => Ok(DataStoreType::SQLite),
            custom if custom.starts_with("custom_") => {
                let name = custom.strip_prefix("custom_").unwrap().to_string();
                Ok(DataStoreType::Custom(name))
            }
            _ => Err(format!("Unknown data store type: {}", s)),
        }
    }
}

/// Connection pool configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionPoolConfig {
    /// Minimum number of connections in the pool
    pub min_connections: u32,
    /// Maximum number of connections in the pool
    pub max_connections: u32,
    /// Connection timeout duration
    pub connect_timeout: Duration,
    /// Idle timeout for connections
    pub idle_timeout: Option<Duration>,
    /// Maximum lifetime of connections
    pub max_lifetime: Option<Duration>,
    /// Test connections on acquisition
    pub test_on_acquire: bool,
}

impl Default for ConnectionPoolConfig {
    fn default() -> Self {
        Self {
            min_connections: 1,
            max_connections: 10,
            connect_timeout: Duration::from_secs(30),
            idle_timeout: Some(Duration::from_secs(600)), // 10 minutes
            max_lifetime: Some(Duration::from_secs(1800)), // 30 minutes
            test_on_acquire: true,
        }
    }
}

/// Redis-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    /// Redis connection URL
    pub url: String,
    /// Key prefix for all IOC data
    pub key_prefix: String,
    /// Default TTL for cached data
    pub default_ttl: Option<Duration>,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable compression for stored data
    pub compression: bool,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://localhost:6379".to_string(),
            key_prefix: "phantom_ioc:".to_string(),
            default_ttl: Some(Duration::from_secs(3600)), // 1 hour
            pool: ConnectionPoolConfig::default(),
            compression: true,
        }
    }
}

/// PostgreSQL-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgreSQLConfig {
    /// PostgreSQL connection URL
    pub url: String,
    /// Schema name for IOC tables
    pub schema: String,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable SSL/TLS
    pub ssl_mode: String,
    /// Migration settings
    pub auto_migrate: bool,
}

impl Default for PostgreSQLConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://localhost:5432/phantom_ioc".to_string(),
            schema: "ioc".to_string(),
            pool: ConnectionPoolConfig::default(),
            ssl_mode: "prefer".to_string(),
            auto_migrate: true,
        }
    }
}

/// MongoDB-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    /// MongoDB connection URL
    pub url: String,
    /// Database name
    pub database: String,
    /// Collection prefix
    pub collection_prefix: String,
    /// Connection pool configuration
    pub pool: ConnectionPoolConfig,
    /// Enable compression
    pub compression: bool,
    /// Write concern
    pub write_concern: String,
    /// Read preference
    pub read_preference: String,
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            url: "mongodb://localhost:27017".to_string(),
            database: "phantom_ioc".to_string(),
            collection_prefix: "ioc_".to_string(),
            pool: ConnectionPoolConfig::default(),
            compression: true,
            write_concern: "majority".to_string(),
            read_preference: "primary".to_string(),
        }
    }
}

/// Elasticsearch-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchConfig {
    /// Elasticsearch URLs
    pub urls: Vec<String>,
    /// Index prefix
    pub index_prefix: String,
    /// Number of shards per index
    pub shards: u32,
    /// Number of replicas per index
    pub replicas: u32,
    /// Refresh policy
    pub refresh_policy: String,
    /// Connection timeout
    pub timeout: Duration,
    /// Enable compression
    pub compression: bool,
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            urls: vec!["http://localhost:9200".to_string()],
            index_prefix: "phantom_ioc".to_string(),
            shards: 1,
            replicas: 1,
            refresh_policy: "wait_for".to_string(),
            timeout: Duration::from_secs(30),
            compression: true,
        }
    }
}

/// Local file storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalFileConfig {
    /// Base directory for storage
    pub base_path: String,
    /// Enable compression for stored files
    pub compression: bool,
    /// File format (json, bincode, msgpack)
    pub format: String,
    /// Create directories if they don't exist
    pub create_dirs: bool,
    /// File permissions (Unix-style octal)
    pub permissions: Option<u32>,
}

impl Default for LocalFileConfig {
    fn default() -> Self {
        Self {
            base_path: "./data/ioc_store".to_string(),
            compression: true,
            format: "json".to_string(),
            create_dirs: true,
            permissions: Some(0o644),
        }
    }
}

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
        config.default_store = store_type;
        
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