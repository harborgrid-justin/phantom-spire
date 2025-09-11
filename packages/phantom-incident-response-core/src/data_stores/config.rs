//! Data Store Configuration
//! 
//! Configuration structures for all supported data stores

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

/// Overall data store configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreConfig {
    pub redis: Option<RedisConfig>,
    pub postgres: Option<PostgresConfig>,
    pub mongodb: Option<MongoDBConfig>,
    pub elasticsearch: Option<ElasticsearchConfig>,
    pub default_store: DataStoreType,
    pub multi_tenant: bool,
    pub cache_ttl_seconds: u64,
}

/// Data store type enumeration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataStoreType {
    Redis,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
}

/// Redis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    pub url: String,
    pub key_prefix: String,
    pub max_connections: u32,
    pub connection_timeout_ms: u64,
    pub command_timeout_ms: u64,
    pub max_retries: u32,
    pub retry_delay_ms: u64,
    pub enable_compression: bool,
    pub cluster_mode: bool,
    pub cluster_nodes: Vec<String>,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://localhost:6379".to_string(),
            key_prefix: "phantom_ir:".to_string(),
            max_connections: 10,
            connection_timeout_ms: 5000,
            command_timeout_ms: 3000,
            max_retries: 3,
            retry_delay_ms: 1000,
            enable_compression: true,
            cluster_mode: false,
            cluster_nodes: vec![],
        }
    }
}

/// PostgreSQL configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgresConfig {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub connection_timeout_ms: u64,
    pub idle_timeout_ms: u64,
    pub acquire_timeout_ms: u64,
    pub max_lifetime_ms: u64,
    pub schema_name: String,
    pub table_prefix: String,
    pub enable_ssl: bool,
    pub ssl_mode: String,
    pub enable_migrations: bool,
}

impl Default for PostgresConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://localhost:5432/phantom_ir".to_string(),
            max_connections: 10,
            min_connections: 2,
            connection_timeout_ms: 30000,
            idle_timeout_ms: 600000,
            acquire_timeout_ms: 30000,
            max_lifetime_ms: 1800000,
            schema_name: "incident_response".to_string(),
            table_prefix: "pir_".to_string(),
            enable_ssl: true,
            ssl_mode: "prefer".to_string(),
            enable_migrations: true,
        }
    }
}

/// MongoDB configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    pub url: String,
    pub database_name: String,
    pub collection_prefix: String,
    pub max_pool_size: u32,
    pub min_pool_size: u32,
    pub connection_timeout_ms: u64,
    pub server_selection_timeout_ms: u64,
    pub heartbeat_frequency_ms: u64,
    pub enable_compression: bool,
    pub compression_algorithm: String,
    pub read_preference: String,
    pub write_concern: MongoWriteConcern,
    pub read_concern: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoWriteConcern {
    pub w: String,
    pub j: bool,
    pub wtimeout_ms: u64,
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            url: "mongodb://localhost:27017".to_string(),
            database_name: "phantom_ir".to_string(),
            collection_prefix: "pir_".to_string(),
            max_pool_size: 10,
            min_pool_size: 2,
            connection_timeout_ms: 30000,
            server_selection_timeout_ms: 30000,
            heartbeat_frequency_ms: 10000,
            enable_compression: true,
            compression_algorithm: "zstd".to_string(),
            read_preference: "primary".to_string(),
            write_concern: MongoWriteConcern {
                w: "majority".to_string(),
                j: true,
                wtimeout_ms: 10000,
            },
            read_concern: "majority".to_string(),
        }
    }
}

/// Elasticsearch configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchConfig {
    pub urls: Vec<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub api_key: Option<String>,
    pub index_prefix: String,
    pub connection_timeout_ms: u64,
    pub request_timeout_ms: u64,
    pub max_retries: u32,
    pub retry_delay_ms: u64,
    pub enable_compression: bool,
    pub enable_ssl: bool,
    pub ssl_verification: bool,
    pub ssl_cert_path: Option<String>,
    pub ssl_key_path: Option<String>,
    pub ssl_ca_path: Option<String>,
    pub index_settings: ElasticsearchIndexSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchIndexSettings {
    pub number_of_shards: u32,
    pub number_of_replicas: u32,
    pub refresh_interval: String,
    pub analysis: HashMap<String, serde_json::Value>,
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            urls: vec!["http://localhost:9200".to_string()],
            username: None,
            password: None,
            api_key: None,
            index_prefix: "phantom_ir".to_string(),
            connection_timeout_ms: 30000,
            request_timeout_ms: 60000,
            max_retries: 3,
            retry_delay_ms: 1000,
            enable_compression: true,
            enable_ssl: false,
            ssl_verification: true,
            ssl_cert_path: None,
            ssl_key_path: None,
            ssl_ca_path: None,
            index_settings: ElasticsearchIndexSettings::default(),
        }
    }
}

impl Default for ElasticsearchIndexSettings {
    fn default() -> Self {
        Self {
            number_of_shards: 1,
            number_of_replicas: 1,
            refresh_interval: "1s".to_string(),
            analysis: HashMap::new(),
        }
    }
}

impl Default for DataStoreConfig {
    fn default() -> Self {
        Self {
            redis: Some(RedisConfig::default()),
            postgres: Some(PostgresConfig::default()),
            mongodb: Some(MongoDBConfig::default()),
            elasticsearch: Some(ElasticsearchConfig::default()),
            default_store: DataStoreType::MongoDB,
            multi_tenant: true,
            cache_ttl_seconds: 3600,
        }
    }
}

impl DataStoreConfig {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        let mut config = Self::default();
        
        // Redis configuration from environment
        if let Ok(redis_url) = std::env::var("REDIS_URL") {
            if let Some(ref mut redis_config) = config.redis {
                redis_config.url = redis_url;
            }
        }
        
        // PostgreSQL configuration from environment
        if let Ok(postgres_url) = std::env::var("POSTGRES_URL") {
            if let Some(ref mut postgres_config) = config.postgres {
                postgres_config.url = postgres_url;
            }
        }
        
        // MongoDB configuration from environment
        if let Ok(mongodb_url) = std::env::var("MONGODB_URL") {
            if let Some(ref mut mongodb_config) = config.mongodb {
                mongodb_config.url = mongodb_url;
            }
        }
        
        // Elasticsearch configuration from environment
        if let Ok(elasticsearch_urls) = std::env::var("ELASTICSEARCH_URLS") {
            if let Some(ref mut es_config) = config.elasticsearch {
                es_config.urls = elasticsearch_urls.split(',').map(|s| s.trim().to_string()).collect();
            }
        }
        
        // Default store type from environment
        if let Ok(default_store) = std::env::var("DEFAULT_DATA_STORE") {
            match default_store.to_lowercase().as_str() {
                "redis" => config.default_store = DataStoreType::Redis,
                "postgresql" | "postgres" => config.default_store = DataStoreType::PostgreSQL,
                "mongodb" | "mongo" => config.default_store = DataStoreType::MongoDB,
                "elasticsearch" | "es" => config.default_store = DataStoreType::Elasticsearch,
                _ => {}
            }
        }
        
        // Multi-tenancy setting from environment
        if let Ok(multi_tenant) = std::env::var("ENABLE_MULTI_TENANCY") {
            config.multi_tenant = multi_tenant.parse().unwrap_or(true);
        }
        
        config
    }
    
    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        match self.default_store {
            DataStoreType::Redis => {
                if self.redis.is_none() {
                    return Err("Redis configuration is required when Redis is the default store".to_string());
                }
            }
            DataStoreType::PostgreSQL => {
                if self.postgres.is_none() {
                    return Err("PostgreSQL configuration is required when PostgreSQL is the default store".to_string());
                }
            }
            DataStoreType::MongoDB => {
                if self.mongodb.is_none() {
                    return Err("MongoDB configuration is required when MongoDB is the default store".to_string());
                }
            }
            DataStoreType::Elasticsearch => {
                if self.elasticsearch.is_none() {
                    return Err("Elasticsearch configuration is required when Elasticsearch is the default store".to_string());
                }
            }
        }
        
        Ok(())
    }
}