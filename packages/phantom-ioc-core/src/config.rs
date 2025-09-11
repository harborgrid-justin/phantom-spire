// phantom-ioc-core/src/config.rs
// Configuration management for IOC processing

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use crate::models::{IOCProcessingConfig, EnrichmentConfig, MLConfig, CorrelationConfig, FeatureExtractionConfig};

/// Main configuration structure for IOC Core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCCoreConfig {
    pub processing: IOCProcessingConfig,
    pub enrichment: EnrichmentConfig,
    pub machine_learning: Option<MLConfig>,
    pub correlation: CorrelationConfig,
    pub storage: StorageConfig,
    pub api: ApiConfig,
    pub logging: LoggingConfig,
}

/// Storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub backend: StorageBackend,
    pub connection_string: Option<String>,
    pub pool_size: u32,
    pub timeout_seconds: u64,
    pub enable_caching: bool,
    pub cache_ttl: u64,
}

/// Storage backend options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageBackend {
    Local,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
    Redis,
}

/// API configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    pub bind_address: String,
    pub port: u16,
    pub enable_cors: bool,
    pub enable_auth: bool,
    pub rate_limit: RateLimitConfig,
}

/// Rate limiting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub requests_per_minute: u32,
    pub burst_size: u32,
    pub enable_per_ip: bool,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: LogLevel,
    pub format: LogFormat,
    pub output: LogOutput,
    pub enable_structured: bool,
}

/// Log levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

/// Log formats
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogFormat {
    Json,
    Plain,
    Compact,
}

/// Log output options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogOutput {
    Console,
    File(PathBuf),
    Both(PathBuf),
}

impl Default for IOCCoreConfig {
    fn default() -> Self {
        Self {
            processing: IOCProcessingConfig::default(),
            enrichment: EnrichmentConfig::default(),
            machine_learning: Some(MLConfig {
                model_path: "models/ioc_classifier.onnx".to_string(),
                confidence_threshold: 0.8,
                enable_auto_retrain: false,
                feature_extraction_config: FeatureExtractionConfig::default(),
            }),
            correlation: CorrelationConfig::default(),
            storage: StorageConfig::default(),
            api: ApiConfig::default(),
            logging: LoggingConfig::default(),
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            backend: StorageBackend::Local,
            connection_string: None,
            pool_size: 10,
            timeout_seconds: 30,
            enable_caching: true,
            cache_ttl: 3600,
        }
    }
}

impl Default for ApiConfig {
    fn default() -> Self {
        Self {
            bind_address: "127.0.0.1".to_string(),
            port: 8080,
            enable_cors: true,
            enable_auth: false,
            rate_limit: RateLimitConfig::default(),
        }
    }
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            requests_per_minute: 100,
            burst_size: 20,
            enable_per_ip: true,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: LogLevel::Info,
            format: LogFormat::Json,
            output: LogOutput::Console,
            enable_structured: true,
        }
    }
}

impl IOCCoreConfig {
    /// Load configuration from file
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let config: Self = serde_json::from_str(&content)?;
        Ok(config)
    }

    /// Save configuration to file
    pub fn save_to_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let content = serde_json::to_string_pretty(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }

    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        let mut config = Self::default();
        
        if let Ok(backend) = std::env::var("IOC_STORAGE_BACKEND") {
            config.storage.backend = match backend.as_str() {
                "postgresql" => StorageBackend::PostgreSQL,
                "mongodb" => StorageBackend::MongoDB,
                "elasticsearch" => StorageBackend::Elasticsearch,
                "redis" => StorageBackend::Redis,
                _ => StorageBackend::Local,
            };
        }

        if let Ok(connection_string) = std::env::var("IOC_DATABASE_URL") {
            config.storage.connection_string = Some(connection_string);
        }

        if let Ok(port) = std::env::var("IOC_API_PORT") {
            if let Ok(port_num) = port.parse::<u16>() {
                config.api.port = port_num;
            }
        }

        if let Ok(log_level) = std::env::var("IOC_LOG_LEVEL") {
            config.logging.level = match log_level.as_str() {
                "trace" => LogLevel::Trace,
                "debug" => LogLevel::Debug,
                "info" => LogLevel::Info,
                "warn" => LogLevel::Warn,
                "error" => LogLevel::Error,
                _ => LogLevel::Info,
            };
        }

        config
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.processing.max_batch_size == 0 {
            return Err("Processing max_batch_size must be greater than 0".to_string());
        }

        if self.processing.confidence_threshold < 0.0 || self.processing.confidence_threshold > 1.0 {
            return Err("Processing confidence_threshold must be between 0.0 and 1.0".to_string());
        }

        if self.storage.pool_size == 0 {
            return Err("Storage pool_size must be greater than 0".to_string());
        }

        if matches!(self.storage.backend, StorageBackend::PostgreSQL | StorageBackend::MongoDB | StorageBackend::Elasticsearch) 
            && self.storage.connection_string.is_none() {
            return Err("Connection string required for selected storage backend".to_string());
        }

        Ok(())
    }
}