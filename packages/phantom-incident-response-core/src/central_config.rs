//! Centralized Configuration Management
//! 
//! This module provides a unified configuration system that consolidates all
//! configuration variables from across the phantom-incident-response-core package.
//! It's designed to be easily configurable when installed as a node package.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;

/// Central configuration structure that consolidates all package settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CentralConfig {
    /// Application-level settings
    pub app: AppConfig,
    /// Storage configuration
    pub storage: StorageConfig,
    /// Data store configuration
    pub data_stores: DataStoreConfig,
    /// System configuration
    pub system: SystemConfig,
    /// Security configuration
    pub security: SecurityConfig,
    /// Notification configuration
    pub notifications: NotificationConfig,
    /// SLA configuration
    pub sla: SlaConfig,
    /// Integration configuration
    pub integrations: IntegrationConfig,
    /// Metrics configuration
    pub metrics: MetricsConfig,
    /// Compliance configuration
    pub compliance: ComplianceConfig,
}

/// Application-level configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub name: String,
    pub version: String,
    pub environment: String,
    pub log_level: String,
    pub debug_mode: bool,
}

/// Unified storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub storage_type: String,
    pub local: Option<LocalStorageConfig>,
    pub postgres: Option<PostgresStorageConfig>,
    pub elasticsearch: Option<ElasticsearchStorageConfig>,
    pub mongodb: Option<MongoDbStorageConfig>,
}

/// Local storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalStorageConfig {
    pub data_dir: String,
    pub max_file_size_mb: u64,
    pub compression_enabled: bool,
    pub backup_interval_hours: Option<u32>,
}

/// PostgreSQL storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgresStorageConfig {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
    pub pool_size: u32,
    pub connection_timeout_seconds: u32,
    pub ssl_mode: String,
}

/// Elasticsearch storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDbStorageConfig {
    pub connection_string: String,
    pub database: String,
    pub collection_prefix: String,
    pub pool_size: u32,
    pub connection_timeout_ms: u32,
}

/// Unified data store configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStoreConfig {
    pub redis_url: Option<String>,
    pub postgres_url: Option<String>,
    pub mongodb_url: Option<String>,
    pub elasticsearch_urls: Option<Vec<String>>,
    pub default_store: String,
    pub multi_tenant: bool,
    pub cache_ttl_seconds: u64,
}

/// System configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    pub organization: String,
    pub timezone: String,
    pub max_concurrent_incidents: u32,
    pub data_retention_days: u32,
}

/// Security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub auth_method: String,
    pub multi_factor_enabled: bool,
    pub session_timeout_minutes: u32,
    pub encryption_enabled: bool,
    pub key_rotation_days: u32,
    pub audit_enabled: bool,
    pub audit_retention_days: u32,
}

/// Notification configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationConfig {
    pub email_enabled: bool,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
    pub from_address: String,
    pub sms_enabled: bool,
    pub sms_provider: String,
    pub sms_api_key: String,
    pub slack_enabled: bool,
    pub slack_webhook_url: String,
    pub slack_channel: String,
}

/// SLA configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaConfig {
    pub critical_response_minutes: u32,
    pub high_response_minutes: u32,
    pub medium_response_minutes: u32,
    pub low_response_minutes: u32,
    pub critical_resolution_minutes: u32,
    pub high_resolution_minutes: u32,
    pub medium_resolution_minutes: u32,
    pub low_resolution_minutes: u32,
}

/// Integration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationConfig {
    pub siem_enabled: bool,
    pub ticketing_enabled: bool,
    pub threat_intel_enabled: bool,
    pub forensics_enabled: bool,
}

/// Metrics configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsConfig {
    pub enabled: bool,
    pub storage_backend: String,
    pub collection_interval_seconds: u32,
    pub retention_days: u32,
}

/// Compliance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceConfig {
    pub nist_enabled: bool,
    pub evidence_retention_years: u32,
    pub reporting_enabled: bool,
    pub reporting_frequency: String,
}

impl Default for CentralConfig {
    fn default() -> Self {
        Self {
            app: AppConfig::default(),
            storage: StorageConfig::default(),
            data_stores: DataStoreConfig::default(),
            system: SystemConfig::default(),
            security: SecurityConfig::default(),
            notifications: NotificationConfig::default(),
            sla: SlaConfig::default(),
            integrations: IntegrationConfig::default(),
            metrics: MetricsConfig::default(),
            compliance: ComplianceConfig::default(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            name: env::var("PHANTOM_IR_APP_NAME").unwrap_or_else(|_| "Phantom Incident Response".to_string()),
            version: env::var("PHANTOM_IR_VERSION").unwrap_or_else(|_| "1.0.0".to_string()),
            environment: env::var("PHANTOM_IR_ENVIRONMENT").unwrap_or_else(|_| "production".to_string()),
            log_level: env::var("PHANTOM_IR_LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            debug_mode: env::var("PHANTOM_IR_DEBUG").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        let storage_type = env::var("PHANTOM_IR_STORAGE_TYPE").unwrap_or_else(|_| "local".to_string());
        
        Self {
            storage_type: storage_type.clone(),
            local: if storage_type == "local" { Some(LocalStorageConfig::default()) } else { None },
            postgres: if storage_type == "postgres" { Some(PostgresStorageConfig::default()) } else { None },
            elasticsearch: if storage_type == "elasticsearch" { Some(ElasticsearchStorageConfig::default()) } else { None },
            mongodb: if storage_type == "mongodb" { Some(MongoDbStorageConfig::default()) } else { None },
        }
    }
}

impl Default for LocalStorageConfig {
    fn default() -> Self {
        Self {
            data_dir: env::var("PHANTOM_IR_DATA_DIR").unwrap_or_else(|_| "./incident_response_data".to_string()),
            max_file_size_mb: env::var("PHANTOM_IR_MAX_FILE_SIZE_MB").unwrap_or_else(|_| "1024".to_string()).parse().unwrap_or(1024),
            compression_enabled: env::var("PHANTOM_IR_COMPRESSION_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            backup_interval_hours: env::var("PHANTOM_IR_BACKUP_INTERVAL_HOURS").ok().and_then(|s| s.parse().ok()),
        }
    }
}

impl Default for PostgresStorageConfig {
    fn default() -> Self {
        Self {
            host: env::var("PHANTOM_IR_POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string()),
            port: env::var("PHANTOM_IR_POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string()).parse().unwrap_or(5432),
            database: env::var("PHANTOM_IR_POSTGRES_DB").unwrap_or_else(|_| "incident_response".to_string()),
            username: env::var("PHANTOM_IR_POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string()),
            password: env::var("PHANTOM_IR_POSTGRES_PASSWORD").unwrap_or_else(|_| "password".to_string()),
            pool_size: env::var("PHANTOM_IR_POSTGRES_POOL_SIZE").unwrap_or_else(|_| "10".to_string()).parse().unwrap_or(10),
            connection_timeout_seconds: env::var("PHANTOM_IR_POSTGRES_TIMEOUT").unwrap_or_else(|_| "30".to_string()).parse().unwrap_or(30),
            ssl_mode: env::var("PHANTOM_IR_POSTGRES_SSL_MODE").unwrap_or_else(|_| "prefer".to_string()),
        }
    }
}

impl Default for ElasticsearchStorageConfig {
    fn default() -> Self {
        let nodes = env::var("PHANTOM_IR_ES_NODES")
            .unwrap_or_else(|_| "http://localhost:9200".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();
            
        Self {
            nodes,
            username: env::var("PHANTOM_IR_ES_USERNAME").ok(),
            password: env::var("PHANTOM_IR_ES_PASSWORD").ok(),
            index_prefix: env::var("PHANTOM_IR_ES_INDEX_PREFIX").unwrap_or_else(|_| "incident_response".to_string()),
            number_of_shards: env::var("PHANTOM_IR_ES_SHARDS").unwrap_or_else(|_| "1".to_string()).parse().unwrap_or(1),
            number_of_replicas: env::var("PHANTOM_IR_ES_REPLICAS").unwrap_or_else(|_| "0".to_string()).parse().unwrap_or(0),
            refresh_interval: env::var("PHANTOM_IR_ES_REFRESH_INTERVAL").unwrap_or_else(|_| "1s".to_string()),
        }
    }
}

impl Default for MongoDbStorageConfig {
    fn default() -> Self {
        Self {
            connection_string: env::var("PHANTOM_IR_MONGO_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string()),
            database: env::var("PHANTOM_IR_MONGO_DB").unwrap_or_else(|_| "incident_response".to_string()),
            collection_prefix: env::var("PHANTOM_IR_MONGO_COLLECTION_PREFIX").unwrap_or_else(|_| "ir".to_string()),
            pool_size: env::var("PHANTOM_IR_MONGO_POOL_SIZE").unwrap_or_else(|_| "10".to_string()).parse().unwrap_or(10),
            connection_timeout_ms: env::var("PHANTOM_IR_MONGO_TIMEOUT").unwrap_or_else(|_| "30000".to_string()).parse().unwrap_or(30000),
        }
    }
}

impl Default for DataStoreConfig {
    fn default() -> Self {
        Self {
            redis_url: env::var("PHANTOM_IR_REDIS_URL").ok(),
            postgres_url: env::var("PHANTOM_IR_POSTGRES_URL").ok(),
            mongodb_url: env::var("PHANTOM_IR_MONGODB_URL").ok(),
            elasticsearch_urls: env::var("PHANTOM_IR_ELASTICSEARCH_URLS")
                .ok()
                .map(|s| s.split(',').map(|u| u.trim().to_string()).collect()),
            default_store: env::var("PHANTOM_IR_DEFAULT_STORE").unwrap_or_else(|_| "mongodb".to_string()),
            multi_tenant: env::var("PHANTOM_IR_MULTI_TENANT").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            cache_ttl_seconds: env::var("PHANTOM_IR_CACHE_TTL").unwrap_or_else(|_| "3600".to_string()).parse().unwrap_or(3600),
        }
    }
}

impl Default for SystemConfig {
    fn default() -> Self {
        Self {
            organization: env::var("PHANTOM_IR_ORGANIZATION").unwrap_or_else(|_| "Default Organization".to_string()),
            timezone: env::var("PHANTOM_IR_TIMEZONE").unwrap_or_else(|_| "UTC".to_string()),
            max_concurrent_incidents: env::var("PHANTOM_IR_MAX_CONCURRENT_INCIDENTS").unwrap_or_else(|_| "100".to_string()).parse().unwrap_or(100),
            data_retention_days: env::var("PHANTOM_IR_DATA_RETENTION_DAYS").unwrap_or_else(|_| "365".to_string()).parse().unwrap_or(365),
        }
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            auth_method: env::var("PHANTOM_IR_AUTH_METHOD").unwrap_or_else(|_| "local".to_string()),
            multi_factor_enabled: env::var("PHANTOM_IR_MFA_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            session_timeout_minutes: env::var("PHANTOM_IR_SESSION_TIMEOUT").unwrap_or_else(|_| "480".to_string()).parse().unwrap_or(480),
            encryption_enabled: env::var("PHANTOM_IR_ENCRYPTION_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            key_rotation_days: env::var("PHANTOM_IR_KEY_ROTATION_DAYS").unwrap_or_else(|_| "90".to_string()).parse().unwrap_or(90),
            audit_enabled: env::var("PHANTOM_IR_AUDIT_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            audit_retention_days: env::var("PHANTOM_IR_AUDIT_RETENTION_DAYS").unwrap_or_else(|_| "365".to_string()).parse().unwrap_or(365),
        }
    }
}

impl Default for NotificationConfig {
    fn default() -> Self {
        Self {
            email_enabled: env::var("PHANTOM_IR_EMAIL_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            smtp_host: env::var("PHANTOM_IR_SMTP_HOST").unwrap_or_else(|_| "localhost".to_string()),
            smtp_port: env::var("PHANTOM_IR_SMTP_PORT").unwrap_or_else(|_| "587".to_string()).parse().unwrap_or(587),
            smtp_username: env::var("PHANTOM_IR_SMTP_USERNAME").unwrap_or_default(),
            smtp_password: env::var("PHANTOM_IR_SMTP_PASSWORD").unwrap_or_default(),
            from_address: env::var("PHANTOM_IR_FROM_EMAIL").unwrap_or_default(),
            sms_enabled: env::var("PHANTOM_IR_SMS_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            sms_provider: env::var("PHANTOM_IR_SMS_PROVIDER").unwrap_or_else(|_| "twilio".to_string()),
            sms_api_key: env::var("PHANTOM_IR_SMS_API_KEY").unwrap_or_default(),
            slack_enabled: env::var("PHANTOM_IR_SLACK_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            slack_webhook_url: env::var("PHANTOM_IR_SLACK_WEBHOOK").unwrap_or_default(),
            slack_channel: env::var("PHANTOM_IR_SLACK_CHANNEL").unwrap_or_else(|_| "#incidents".to_string()),
        }
    }
}

impl Default for SlaConfig {
    fn default() -> Self {
        Self {
            critical_response_minutes: env::var("PHANTOM_IR_SLA_CRITICAL_RESPONSE").unwrap_or_else(|_| "15".to_string()).parse().unwrap_or(15),
            high_response_minutes: env::var("PHANTOM_IR_SLA_HIGH_RESPONSE").unwrap_or_else(|_| "60".to_string()).parse().unwrap_or(60),
            medium_response_minutes: env::var("PHANTOM_IR_SLA_MEDIUM_RESPONSE").unwrap_or_else(|_| "240".to_string()).parse().unwrap_or(240),
            low_response_minutes: env::var("PHANTOM_IR_SLA_LOW_RESPONSE").unwrap_or_else(|_| "480".to_string()).parse().unwrap_or(480),
            critical_resolution_minutes: env::var("PHANTOM_IR_SLA_CRITICAL_RESOLUTION").unwrap_or_else(|_| "240".to_string()).parse().unwrap_or(240),
            high_resolution_minutes: env::var("PHANTOM_IR_SLA_HIGH_RESOLUTION").unwrap_or_else(|_| "480".to_string()).parse().unwrap_or(480),
            medium_resolution_minutes: env::var("PHANTOM_IR_SLA_MEDIUM_RESOLUTION").unwrap_or_else(|_| "1440".to_string()).parse().unwrap_or(1440),
            low_resolution_minutes: env::var("PHANTOM_IR_SLA_LOW_RESOLUTION").unwrap_or_else(|_| "2880".to_string()).parse().unwrap_or(2880),
        }
    }
}

impl Default for IntegrationConfig {
    fn default() -> Self {
        Self {
            siem_enabled: env::var("PHANTOM_IR_SIEM_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            ticketing_enabled: env::var("PHANTOM_IR_TICKETING_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            threat_intel_enabled: env::var("PHANTOM_IR_THREAT_INTEL_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
            forensics_enabled: env::var("PHANTOM_IR_FORENSICS_ENABLED").unwrap_or_else(|_| "false".to_string()).parse().unwrap_or(false),
        }
    }
}

impl Default for MetricsConfig {
    fn default() -> Self {
        Self {
            enabled: env::var("PHANTOM_IR_METRICS_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            storage_backend: env::var("PHANTOM_IR_METRICS_STORAGE").unwrap_or_else(|_| "redis".to_string()),
            collection_interval_seconds: env::var("PHANTOM_IR_METRICS_INTERVAL").unwrap_or_else(|_| "60".to_string()).parse().unwrap_or(60),
            retention_days: env::var("PHANTOM_IR_METRICS_RETENTION").unwrap_or_else(|_| "90".to_string()).parse().unwrap_or(90),
        }
    }
}

impl Default for ComplianceConfig {
    fn default() -> Self {
        Self {
            nist_enabled: env::var("PHANTOM_IR_NIST_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            evidence_retention_years: env::var("PHANTOM_IR_EVIDENCE_RETENTION_YEARS").unwrap_or_else(|_| "7".to_string()).parse().unwrap_or(7),
            reporting_enabled: env::var("PHANTOM_IR_REPORTING_ENABLED").unwrap_or_else(|_| "true".to_string()).parse().unwrap_or(true),
            reporting_frequency: env::var("PHANTOM_IR_REPORTING_FREQUENCY").unwrap_or_else(|_| "weekly".to_string()),
        }
    }
}

impl CentralConfig {
    /// Load configuration from environment variables
    pub fn from_env() -> Self {
        Self::default()
    }
    
    /// Load configuration from a JSON file
    pub fn from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let config: CentralConfig = serde_json::from_str(&content)?;
        Ok(config)
    }
    
    /// Save configuration to a JSON file
    pub fn save_to_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let content = serde_json::to_string_pretty(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }
    
    /// Validate the configuration
    pub fn validate(&self) -> Result<(), String> {
        // Validate storage configuration
        if self.storage.storage_type == "postgres" && self.storage.postgres.is_none() {
            return Err("PostgreSQL configuration is required when storage_type is 'postgres'".to_string());
        }
        
        if self.storage.storage_type == "elasticsearch" && self.storage.elasticsearch.is_none() {
            return Err("Elasticsearch configuration is required when storage_type is 'elasticsearch'".to_string());
        }
        
        if self.storage.storage_type == "mongodb" && self.storage.mongodb.is_none() {
            return Err("MongoDB configuration is required when storage_type is 'mongodb'".to_string());
        }
        
        // Validate notifications
        if self.notifications.email_enabled && self.notifications.smtp_host.is_empty() {
            return Err("SMTP host is required when email notifications are enabled".to_string());
        }
        
        if self.notifications.sms_enabled && self.notifications.sms_api_key.is_empty() {
            return Err("SMS API key is required when SMS notifications are enabled".to_string());
        }
        
        if self.notifications.slack_enabled && self.notifications.slack_webhook_url.is_empty() {
            return Err("Slack webhook URL is required when Slack notifications are enabled".to_string());
        }
        
        Ok(())
    }
    
    /// Get a summary of all configuration variables as a HashMap for easy access
    pub fn get_all_variables(&self) -> HashMap<String, String> {
        let mut vars = HashMap::new();
        
        // App config
        vars.insert("PHANTOM_IR_APP_NAME".to_string(), self.app.name.clone());
        vars.insert("PHANTOM_IR_VERSION".to_string(), self.app.version.clone());
        vars.insert("PHANTOM_IR_ENVIRONMENT".to_string(), self.app.environment.clone());
        vars.insert("PHANTOM_IR_LOG_LEVEL".to_string(), self.app.log_level.clone());
        vars.insert("PHANTOM_IR_DEBUG".to_string(), self.app.debug_mode.to_string());
        
        // Storage config
        vars.insert("PHANTOM_IR_STORAGE_TYPE".to_string(), self.storage.storage_type.clone());
        
        if let Some(ref local) = self.storage.local {
            vars.insert("PHANTOM_IR_DATA_DIR".to_string(), local.data_dir.clone());
            vars.insert("PHANTOM_IR_MAX_FILE_SIZE_MB".to_string(), local.max_file_size_mb.to_string());
            vars.insert("PHANTOM_IR_COMPRESSION_ENABLED".to_string(), local.compression_enabled.to_string());
        }
        
        if let Some(ref postgres) = self.storage.postgres {
            vars.insert("PHANTOM_IR_POSTGRES_HOST".to_string(), postgres.host.clone());
            vars.insert("PHANTOM_IR_POSTGRES_PORT".to_string(), postgres.port.to_string());
            vars.insert("PHANTOM_IR_POSTGRES_DB".to_string(), postgres.database.clone());
            vars.insert("PHANTOM_IR_POSTGRES_USER".to_string(), postgres.username.clone());
            vars.insert("PHANTOM_IR_POSTGRES_PASSWORD".to_string(), postgres.password.clone());
        }
        
        // System config
        vars.insert("PHANTOM_IR_ORGANIZATION".to_string(), self.system.organization.clone());
        vars.insert("PHANTOM_IR_TIMEZONE".to_string(), self.system.timezone.clone());
        vars.insert("PHANTOM_IR_MAX_CONCURRENT_INCIDENTS".to_string(), self.system.max_concurrent_incidents.to_string());
        
        // Security config
        vars.insert("PHANTOM_IR_AUTH_METHOD".to_string(), self.security.auth_method.clone());
        vars.insert("PHANTOM_IR_MFA_ENABLED".to_string(), self.security.multi_factor_enabled.to_string());
        vars.insert("PHANTOM_IR_ENCRYPTION_ENABLED".to_string(), self.security.encryption_enabled.to_string());
        
        // Add more variables as needed...
        vars
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_central_config_creation() {
        let config = CentralConfig::default();
        assert_eq!(config.app.name, "Phantom Incident Response");
        assert_eq!(config.storage.storage_type, "local");
    }
    
    #[test]
    fn test_config_validation() {
        let config = CentralConfig::default();
        assert!(config.validate().is_ok());
    }
    
    #[test]
    fn test_get_all_variables() {
        let config = CentralConfig::default();
        let vars = config.get_all_variables();
        assert!(vars.contains_key("PHANTOM_IR_APP_NAME"));
        assert!(vars.contains_key("PHANTOM_IR_STORAGE_TYPE"));
    }
}