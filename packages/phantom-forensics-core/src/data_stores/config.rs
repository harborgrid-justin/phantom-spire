//! Data Store Configuration
//! 
//! Configuration structures for all supported data stores with forensics-specific settings

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
    pub forensics: ForensicsConfig,
}

/// Data store type enumeration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataStoreType {
    Redis,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
}

/// Forensics-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicsConfig {
    pub enable_integrity_checks: bool,
    pub enable_chain_of_custody: bool,
    pub enable_audit_logging: bool,
    pub evidence_retention_days: u64,
    pub auto_hash_verification: bool,
    pub compliance_standards: Vec<String>,
    pub encryption_at_rest: bool,
    pub encryption_key_rotation_days: u64,
    pub max_evidence_size_mb: u64,
    pub allowed_evidence_types: Vec<String>,
}

impl Default for ForensicsConfig {
    fn default() -> Self {
        Self {
            enable_integrity_checks: true,
            enable_chain_of_custody: true,
            enable_audit_logging: true,
            evidence_retention_days: 2555, // 7 years
            auto_hash_verification: true,
            compliance_standards: vec![
                "ISO/IEC 27037".to_string(),
                "NIST SP 800-86".to_string(),
                "RFC 3227".to_string(),
            ],
            encryption_at_rest: true,
            encryption_key_rotation_days: 90,
            max_evidence_size_mb: 1024, // 1GB
            allowed_evidence_types: vec![
                "FileSystem".to_string(),
                "Network".to_string(),
                "Memory".to_string(),
                "Registry".to_string(),
                "EventLog".to_string(),
                "Database".to_string(),
            ],
        }
    }
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
    pub evidence_expiry_seconds: Option<u64>,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://localhost:6379".to_string(),
            key_prefix: "phantom_forensics:".to_string(),
            max_connections: 10,
            connection_timeout_ms: 5000,
            command_timeout_ms: 3000,
            max_retries: 3,
            retry_delay_ms: 1000,
            enable_compression: true,
            cluster_mode: false,
            cluster_nodes: vec![],
            evidence_expiry_seconds: None, // Never expire evidence
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
    pub enable_row_level_security: bool,
}

impl Default for PostgresConfig {
    fn default() -> Self {
        Self {
            url: "postgresql://localhost:5432/phantom_forensics".to_string(),
            max_connections: 20,
            min_connections: 5,
            connection_timeout_ms: 30000,
            idle_timeout_ms: 600000,
            acquire_timeout_ms: 30000,
            max_lifetime_ms: 1800000,
            schema_name: "forensics".to_string(),
            table_prefix: "pf_".to_string(),
            enable_ssl: true,
            ssl_mode: "require".to_string(),
            enable_migrations: true,
            enable_row_level_security: true,
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
    pub enable_gridfs: bool, // For large evidence files
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
            database_name: "phantom_forensics".to_string(),
            collection_prefix: "pf_".to_string(),
            max_pool_size: 20,
            min_pool_size: 5,
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
            enable_gridfs: true,
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
    pub enable_audit_index: bool,
    pub audit_index_retention_days: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchIndexSettings {
    pub number_of_shards: u32,
    pub number_of_replicas: u32,
    pub refresh_interval: String,
    pub analysis: HashMap<String, serde_json::Value>,
    pub evidence_mapping: HashMap<String, serde_json::Value>,
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            urls: vec!["http://localhost:9200".to_string()],
            username: None,
            password: None,
            api_key: None,
            index_prefix: "phantom_forensics".to_string(),
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
            enable_audit_index: true,
            audit_index_retention_days: 2555, // 7 years
        }
    }
}

impl Default for ElasticsearchIndexSettings {
    fn default() -> Self {
        let mut evidence_mapping = HashMap::new();
        evidence_mapping.insert(
            "properties".to_string(),
            serde_json::json!({
                "timestamp": {
                    "type": "date",
                    "format": "strict_date_optional_time||epoch_millis"
                },
                "evidence_type": {
                    "type": "keyword"
                },
                "hash": {
                    "type": "keyword"
                },
                "source": {
                    "type": "text",
                    "analyzer": "standard"
                },
                "metadata": {
                    "type": "object",
                    "dynamic": true
                }
            })
        );
        
        Self {
            number_of_shards: 2,
            number_of_replicas: 1,
            refresh_interval: "1s".to_string(),
            analysis: HashMap::new(),
            evidence_mapping,
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
            default_store: DataStoreType::PostgreSQL, // PostgreSQL is better for forensics
            multi_tenant: true,
            cache_ttl_seconds: 3600,
            forensics: ForensicsConfig::default(),
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
        
        // Forensics-specific settings
        if let Ok(integrity_checks) = std::env::var("FORENSICS_INTEGRITY_CHECKS") {
            config.forensics.enable_integrity_checks = integrity_checks.parse().unwrap_or(true);
        }
        
        if let Ok(chain_of_custody) = std::env::var("FORENSICS_CHAIN_OF_CUSTODY") {
            config.forensics.enable_chain_of_custody = chain_of_custody.parse().unwrap_or(true);
        }
        
        if let Ok(audit_logging) = std::env::var("FORENSICS_AUDIT_LOGGING") {
            config.forensics.enable_audit_logging = audit_logging.parse().unwrap_or(true);
        }
        
        if let Ok(retention_days) = std::env::var("FORENSICS_RETENTION_DAYS") {
            config.forensics.evidence_retention_days = retention_days.parse().unwrap_or(2555);
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
        
        // Validate forensics-specific settings
        if self.forensics.evidence_retention_days == 0 {
            return Err("Evidence retention days must be greater than 0".to_string());
        }
        
        if self.forensics.max_evidence_size_mb == 0 {
            return Err("Max evidence size must be greater than 0".to_string());
        }
        
        if self.forensics.allowed_evidence_types.is_empty() {
            return Err("At least one evidence type must be allowed".to_string());
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_data_store_config_default() {
        let config = DataStoreConfig::default();
        assert_eq!(config.default_store, DataStoreType::PostgreSQL);
        assert!(config.multi_tenant);
        assert!(config.forensics.enable_integrity_checks);
        assert!(config.forensics.enable_chain_of_custody);
        assert!(config.forensics.enable_audit_logging);
    }
    
    #[test]
    fn test_forensics_config_validation() {
        let config = DataStoreConfig::default();
        assert!(config.validate().is_ok());
        
        let mut invalid_config = config.clone();
        invalid_config.forensics.evidence_retention_days = 0;
        assert!(invalid_config.validate().is_err());
    }
    
    #[test]
    fn test_postgres_config_forensics_defaults() {
        let postgres_config = PostgresConfig::default();
        assert!(postgres_config.enable_ssl);
        assert_eq!(postgres_config.ssl_mode, "require");
        assert!(postgres_config.enable_row_level_security);
        assert_eq!(postgres_config.schema_name, "forensics");
    }
}