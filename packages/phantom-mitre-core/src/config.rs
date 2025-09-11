//! Phantom MITRE Core - Configuration Management
//! 
//! This module provides comprehensive configuration management for MITRE ATT&CK framework integration,
//! including storage backends, analysis settings, and data source configurations.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Main configuration structure for MITRE Core
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreConfig {
    /// Storage configuration for different backends
    pub storage: StorageConfig,
    /// Analysis configuration settings
    pub analysis: AnalysisConfig,
    /// Data source configurations
    pub data_sources: DataSourceConfig,
    /// Navigator configuration for ATT&CK Navigator integration
    pub navigator: NavigatorConfig,
    /// Detection rule configuration
    pub detection: DetectionConfig,
    /// Performance and caching settings
    pub performance: PerformanceConfig,
    /// Logging configuration
    pub logging: LoggingConfig,
}

/// Storage backend configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    /// Primary storage backend type
    pub backend: StorageBackend,
    /// In-memory storage configuration
    pub memory: MemoryStorageConfig,
    /// Redis configuration
    pub redis: RedisConfig,
    /// PostgreSQL configuration
    pub postgresql: PostgreSQLConfig,
    /// MongoDB configuration
    pub mongodb: MongoDBConfig,
    /// Elasticsearch configuration
    pub elasticsearch: ElasticsearchConfig,
    /// Connection timeout in seconds
    pub connection_timeout: u64,
    /// Maximum retry attempts
    pub max_retries: u32,
    /// Retry delay in milliseconds
    pub retry_delay: u64,
}

/// Storage backend types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum StorageBackend {
    Memory,
    Redis,
    PostgreSQL,
    MongoDB,
    Elasticsearch,
    Hybrid,
}

/// In-memory storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStorageConfig {
    /// Maximum number of techniques to store in memory
    pub max_techniques: usize,
    /// Maximum number of groups to store in memory
    pub max_groups: usize,
    /// Maximum number of software entries to store in memory
    pub max_software: usize,
    /// Enable LRU eviction policy
    pub enable_lru: bool,
    /// Memory limit in MB
    pub memory_limit_mb: usize,
}

/// Redis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    /// Redis connection URL
    pub url: String,
    /// Redis database number
    pub database: u8,
    /// Connection pool size
    pub pool_size: u32,
    /// Key prefix for MITRE data
    pub key_prefix: String,
    /// Default TTL for cached data in seconds
    pub default_ttl: u64,
    /// Enable cluster mode
    pub cluster_mode: bool,
    /// Cluster nodes (if cluster mode is enabled)
    pub cluster_nodes: Vec<String>,
}

/// PostgreSQL configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgreSQLConfig {
    /// Database connection URL
    pub database_url: String,
    /// Connection pool size
    pub max_connections: u32,
    /// Minimum idle connections
    pub min_connections: u32,
    /// Connection timeout in seconds
    pub connect_timeout: u64,
    /// Query timeout in seconds
    pub query_timeout: u64,
    /// Schema name
    pub schema: String,
    /// Enable SSL
    pub ssl_mode: String,
    /// Migration settings
    pub auto_migrate: bool,
}

/// MongoDB configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoDBConfig {
    /// MongoDB connection URI
    pub uri: String,
    /// Database name
    pub database: String,
    /// Collection names
    pub collections: MongoCollections,
    /// Connection pool size
    pub max_pool_size: u32,
    /// Server selection timeout in seconds
    pub server_selection_timeout: u64,
    /// Connection timeout in seconds
    pub connect_timeout: u64,
    /// Read preference
    pub read_preference: String,
    /// Write concern
    pub write_concern: WriteConcern,
}

/// MongoDB collection names
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MongoCollections {
    pub techniques: String,
    pub sub_techniques: String,
    pub groups: String,
    pub software: String,
    pub mitigations: String,
    pub detection_rules: String,
    pub analyses: String,
}

/// MongoDB write concern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteConcern {
    pub w: String,
    pub j: bool,
    pub wtimeout: u64,
}

/// Elasticsearch configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElasticsearchConfig {
    /// Elasticsearch nodes
    pub nodes: Vec<String>,
    /// Index prefix
    pub index_prefix: String,
    /// Username for authentication
    pub username: Option<String>,
    /// Password for authentication
    pub password: Option<String>,
    /// Certificate path for SSL
    pub cert_path: Option<String>,
    /// Request timeout in seconds
    pub timeout: u64,
    /// Number of shards
    pub shards: u32,
    /// Number of replicas
    pub replicas: u32,
    /// Refresh interval
    pub refresh_interval: String,
}

/// Analysis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisConfig {
    /// Default confidence threshold for technique identification
    pub confidence_threshold: f64,
    /// Maximum number of techniques to analyze
    pub max_techniques: usize,
    /// Maximum number of attack path steps
    pub max_attack_path_steps: usize,
    /// Risk scoring weights
    pub risk_weights: RiskWeights,
    /// Threat landscape analysis settings
    pub threat_landscape: ThreatLandscapeConfig,
    /// Parallel processing settings
    pub parallel_processing: bool,
    /// Worker thread count
    pub worker_threads: usize,
    /// Analysis timeout in seconds
    pub analysis_timeout: u64,
}

/// Risk scoring weights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskWeights {
    /// Weight for technique confidence
    pub technique_confidence: f64,
    /// Weight for tactic coverage
    pub tactic_coverage: f64,
    /// Weight for detection difficulty
    pub detection_difficulty: f64,
    /// Weight for platform impact
    pub platform_impact: f64,
    /// Weight for group attribution
    pub group_attribution: f64,
}

/// Threat landscape analysis configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatLandscapeConfig {
    /// Time window for trending analysis in days
    pub trending_window_days: u32,
    /// Maximum number of trending techniques to track
    pub max_trending_techniques: usize,
    /// Minimum activity threshold for group inclusion
    pub min_group_activity: u32,
    /// Enable geographic analysis
    pub enable_geographic_analysis: bool,
    /// Enable sector analysis
    pub enable_sector_analysis: bool,
}

/// Data source configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSourceConfig {
    /// MITRE ATT&CK data source
    pub mitre_attck: MitreAttckDataSource,
    /// Custom data sources
    pub custom_sources: Vec<CustomDataSource>,
    /// Data refresh interval in hours
    pub refresh_interval_hours: u32,
    /// Enable automatic updates
    pub auto_update: bool,
    /// Backup configuration
    pub backup: BackupConfig,
}

/// MITRE ATT&CK data source configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MitreAttckDataSource {
    /// STIX data URL
    pub stix_url: String,
    /// API endpoint (if available)
    pub api_endpoint: Option<String>,
    /// API key for authentication
    pub api_key: Option<String>,
    /// Local data path for offline mode
    pub local_data_path: Option<String>,
    /// Enable offline mode
    pub offline_mode: bool,
    /// Data version to use
    pub data_version: String,
    /// Domains to include
    pub domains: Vec<String>,
}

/// Custom data source configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomDataSource {
    /// Data source name
    pub name: String,
    /// Data source type
    pub source_type: DataSourceType,
    /// Endpoint or file path
    pub endpoint: String,
    /// Authentication credentials
    pub credentials: Option<Credentials>,
    /// Data format
    pub format: DataFormat,
    /// Update frequency in hours
    pub update_frequency: u32,
    /// Enable this data source
    pub enabled: bool,
}

/// Data source types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataSourceType {
    API,
    File,
    Database,
    STIX,
    Custom,
}

/// Data formats
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DataFormat {
    JSON,
    XML,
    STIX,
    CSV,
    YAML,
    Custom,
}

/// Authentication credentials
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credentials {
    pub username: Option<String>,
    pub password: Option<String>,
    pub api_key: Option<String>,
    pub token: Option<String>,
    pub certificate_path: Option<String>,
}

/// Backup configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupConfig {
    /// Enable automatic backups
    pub enabled: bool,
    /// Backup directory
    pub backup_dir: String,
    /// Backup frequency in hours
    pub frequency_hours: u32,
    /// Number of backups to retain
    pub retention_count: u32,
    /// Compress backups
    pub compress: bool,
    /// Backup format
    pub format: BackupFormat,
}

/// Backup formats
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum BackupFormat {
    JSON,
    Binary,
    SQL,
    Archive,
}

/// Navigator configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorConfig {
    /// Default domain for Navigator layers
    pub default_domain: String,
    /// Default gradient colors
    pub default_gradient: Vec<String>,
    /// Default layout
    pub default_layout: String,
    /// Export configuration
    pub export: NavigatorExportConfig,
}

/// Navigator export configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigatorExportConfig {
    /// Include metadata in exports
    pub include_metadata: bool,
    /// Include comments in exports
    pub include_comments: bool,
    /// Export format
    pub format: NavigatorExportFormat,
}

/// Navigator export formats
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum NavigatorExportFormat {
    JSON,
    SVG,
    Excel,
    PDF,
}

/// Detection configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionConfig {
    /// Rule validation settings
    pub validation: DetectionValidationConfig,
    /// Rule storage settings
    pub storage: DetectionStorageConfig,
    /// Rule deployment settings
    pub deployment: DetectionDeploymentConfig,
}

/// Detection rule validation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionValidationConfig {
    /// Enable syntax validation
    pub syntax_validation: bool,
    /// Enable logic validation
    pub logic_validation: bool,
    /// Enable performance validation
    pub performance_validation: bool,
    /// Maximum rule complexity score
    pub max_complexity: u32,
    /// Performance thresholds
    pub performance_thresholds: PerformanceThresholds,
}

/// Performance thresholds for detection rules
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceThresholds {
    /// Maximum execution time in milliseconds
    pub max_execution_time_ms: u64,
    /// Maximum memory usage in MB
    pub max_memory_usage_mb: u64,
    /// Maximum false positive rate
    pub max_false_positive_rate: f64,
}

/// Detection rule storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionStorageConfig {
    /// Rule repository type
    pub repository_type: RuleRepositoryType,
    /// Version control settings
    pub version_control: bool,
    /// Rule categorization
    pub categorization: bool,
    /// Rule indexing for search
    pub indexing: bool,
}

/// Rule repository types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RuleRepositoryType {
    Local,
    Git,
    Database,
    Cloud,
}

/// Detection rule deployment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionDeploymentConfig {
    /// Deployment targets
    pub targets: Vec<DeploymentTarget>,
    /// Automatic deployment
    pub auto_deploy: bool,
    /// Deployment validation
    pub validate_deployment: bool,
    /// Rollback settings
    pub rollback: RollbackConfig,
}

/// Deployment targets
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentTarget {
    pub name: String,
    pub target_type: DeploymentTargetType,
    pub endpoint: String,
    pub credentials: Option<Credentials>,
    pub enabled: bool,
}

/// Deployment target types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DeploymentTargetType {
    Splunk,
    ElasticSearch,
    Sigma,
    SIEM,
    Custom,
}

/// Rollback configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollbackConfig {
    /// Enable automatic rollback on failure
    pub auto_rollback: bool,
    /// Rollback timeout in seconds
    pub timeout_seconds: u64,
    /// Health check configuration
    pub health_check: HealthCheckConfig,
}

/// Health check configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckConfig {
    /// Enable health checks
    pub enabled: bool,
    /// Health check interval in seconds
    pub interval_seconds: u64,
    /// Health check timeout in seconds
    pub timeout_seconds: u64,
    /// Maximum consecutive failures
    pub max_failures: u32,
}

/// Performance and caching configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Cache configuration
    pub cache: CacheConfig,
    /// Batch processing settings
    pub batch_processing: BatchConfig,
    /// Memory management
    pub memory: MemoryConfig,
    /// Concurrency settings
    pub concurrency: ConcurrencyConfig,
}

/// Cache configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    /// Enable caching
    pub enabled: bool,
    /// Cache type
    pub cache_type: CacheType,
    /// Maximum cache size in MB
    pub max_size_mb: usize,
    /// Default TTL in seconds
    pub default_ttl: u64,
    /// Cache eviction policy
    pub eviction_policy: EvictionPolicy,
}

/// Cache types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CacheType {
    Memory,
    Redis,
    Hybrid,
}

/// Cache eviction policies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum EvictionPolicy {
    LRU,
    LFU,
    FIFO,
    TTL,
}

/// Batch processing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchConfig {
    /// Enable batch processing
    pub enabled: bool,
    /// Batch size
    pub batch_size: usize,
    /// Batch timeout in seconds
    pub timeout_seconds: u64,
    /// Maximum concurrent batches
    pub max_concurrent_batches: usize,
}

/// Memory management configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// Memory limit in MB
    pub limit_mb: usize,
    /// Enable memory monitoring
    pub monitoring: bool,
    /// Garbage collection settings
    pub gc_threshold: f64,
    /// Memory cleanup interval in seconds
    pub cleanup_interval: u64,
}

/// Concurrency configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConcurrencyConfig {
    /// Maximum concurrent operations
    pub max_concurrent: usize,
    /// Thread pool size
    pub thread_pool_size: usize,
    /// Queue size for pending operations
    pub queue_size: usize,
    /// Timeout for operations in seconds
    pub operation_timeout: u64,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Log level
    pub level: LogLevel,
    /// Log format
    pub format: LogFormat,
    /// Log output destinations
    pub outputs: Vec<LogOutput>,
    /// Enable structured logging
    pub structured: bool,
    /// Log rotation settings
    pub rotation: LogRotationConfig,
}

/// Log levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

/// Log formats
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LogFormat {
    Plain,
    JSON,
    Structured,
    Custom,
}

/// Log output destinations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogOutput {
    pub output_type: LogOutputType,
    pub path: Option<String>,
    pub endpoint: Option<String>,
    pub enabled: bool,
}

/// Log output types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LogOutputType {
    Console,
    File,
    Syslog,
    Network,
    Custom,
}

/// Log rotation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogRotationConfig {
    /// Enable log rotation
    pub enabled: bool,
    /// Maximum file size in MB
    pub max_size_mb: usize,
    /// Maximum number of files to keep
    pub max_files: usize,
    /// Rotation interval in hours
    pub interval_hours: u32,
    /// Compression for rotated files
    pub compress: bool,
}

impl Default for MitreConfig {
    fn default() -> Self {
        Self {
            storage: StorageConfig::default(),
            analysis: AnalysisConfig::default(),
            data_sources: DataSourceConfig::default(),
            navigator: NavigatorConfig::default(),
            detection: DetectionConfig::default(),
            performance: PerformanceConfig::default(),
            logging: LoggingConfig::default(),
        }
    }
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            backend: StorageBackend::Memory,
            memory: MemoryStorageConfig::default(),
            redis: RedisConfig::default(),
            postgresql: PostgreSQLConfig::default(),
            mongodb: MongoDBConfig::default(),
            elasticsearch: ElasticsearchConfig::default(),
            connection_timeout: 30,
            max_retries: 3,
            retry_delay: 1000,
        }
    }
}

impl Default for MemoryStorageConfig {
    fn default() -> Self {
        Self {
            max_techniques: 10000,
            max_groups: 1000,
            max_software: 5000,
            enable_lru: true,
            memory_limit_mb: 512,
        }
    }
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://localhost:6379".to_string(),
            database: 0,
            pool_size: 10,
            key_prefix: "mitre:".to_string(),
            default_ttl: 3600,
            cluster_mode: false,
            cluster_nodes: vec![],
        }
    }
}

impl Default for PostgreSQLConfig {
    fn default() -> Self {
        Self {
            database_url: "postgresql://localhost/mitre_core".to_string(),
            max_connections: 10,
            min_connections: 1,
            connect_timeout: 30,
            query_timeout: 60,
            schema: "mitre".to_string(),
            ssl_mode: "prefer".to_string(),
            auto_migrate: true,
        }
    }
}

impl Default for MongoDBConfig {
    fn default() -> Self {
        Self {
            uri: "mongodb://localhost:27017".to_string(),
            database: "mitre_core".to_string(),
            collections: MongoCollections::default(),
            max_pool_size: 10,
            server_selection_timeout: 30,
            connect_timeout: 30,
            read_preference: "primary".to_string(),
            write_concern: WriteConcern::default(),
        }
    }
}

impl Default for MongoCollections {
    fn default() -> Self {
        Self {
            techniques: "techniques".to_string(),
            sub_techniques: "sub_techniques".to_string(),
            groups: "groups".to_string(),
            software: "software".to_string(),
            mitigations: "mitigations".to_string(),
            detection_rules: "detection_rules".to_string(),
            analyses: "analyses".to_string(),
        }
    }
}

impl Default for WriteConcern {
    fn default() -> Self {
        Self {
            w: "1".to_string(),
            j: true,
            wtimeout: 5000,
        }
    }
}

impl Default for ElasticsearchConfig {
    fn default() -> Self {
        Self {
            nodes: vec!["http://localhost:9200".to_string()],
            index_prefix: "mitre".to_string(),
            username: None,
            password: None,
            cert_path: None,
            timeout: 30,
            shards: 1,
            replicas: 0,
            refresh_interval: "1s".to_string(),
        }
    }
}

impl Default for AnalysisConfig {
    fn default() -> Self {
        Self {
            confidence_threshold: 0.3,
            max_techniques: 100,
            max_attack_path_steps: 10,
            risk_weights: RiskWeights::default(),
            threat_landscape: ThreatLandscapeConfig::default(),
            parallel_processing: true,
            worker_threads: 4,
            analysis_timeout: 300,
        }
    }
}

impl Default for RiskWeights {
    fn default() -> Self {
        Self {
            technique_confidence: 0.4,
            tactic_coverage: 0.3,
            detection_difficulty: 0.1,
            platform_impact: 0.1,
            group_attribution: 0.1,
        }
    }
}

impl Default for ThreatLandscapeConfig {
    fn default() -> Self {
        Self {
            trending_window_days: 30,
            max_trending_techniques: 50,
            min_group_activity: 5,
            enable_geographic_analysis: true,
            enable_sector_analysis: true,
        }
    }
}

impl Default for DataSourceConfig {
    fn default() -> Self {
        Self {
            mitre_attck: MitreAttckDataSource::default(),
            custom_sources: vec![],
            refresh_interval_hours: 24,
            auto_update: true,
            backup: BackupConfig::default(),
        }
    }
}

impl Default for MitreAttckDataSource {
    fn default() -> Self {
        Self {
            stix_url: "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json".to_string(),
            api_endpoint: None,
            api_key: None,
            local_data_path: None,
            offline_mode: false,
            data_version: "latest".to_string(),
            domains: vec!["enterprise-attack".to_string()],
        }
    }
}

impl Default for BackupConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            backup_dir: "./backups".to_string(),
            frequency_hours: 24,
            retention_count: 7,
            compress: true,
            format: BackupFormat::JSON,
        }
    }
}

impl Default for NavigatorConfig {
    fn default() -> Self {
        Self {
            default_domain: "enterprise-attack".to_string(),
            default_gradient: vec!["#ff6666".to_string(), "#ffe766".to_string(), "#8ec843".to_string()],
            default_layout: "side".to_string(),
            export: NavigatorExportConfig::default(),
        }
    }
}

impl Default for NavigatorExportConfig {
    fn default() -> Self {
        Self {
            include_metadata: true,
            include_comments: true,
            format: NavigatorExportFormat::JSON,
        }
    }
}

impl Default for DetectionConfig {
    fn default() -> Self {
        Self {
            validation: DetectionValidationConfig::default(),
            storage: DetectionStorageConfig::default(),
            deployment: DetectionDeploymentConfig::default(),
        }
    }
}

impl Default for DetectionValidationConfig {
    fn default() -> Self {
        Self {
            syntax_validation: true,
            logic_validation: true,
            performance_validation: true,
            max_complexity: 100,
            performance_thresholds: PerformanceThresholds::default(),
        }
    }
}

impl Default for PerformanceThresholds {
    fn default() -> Self {
        Self {
            max_execution_time_ms: 5000,
            max_memory_usage_mb: 256,
            max_false_positive_rate: 0.1,
        }
    }
}

impl Default for DetectionStorageConfig {
    fn default() -> Self {
        Self {
            repository_type: RuleRepositoryType::Local,
            version_control: true,
            categorization: true,
            indexing: true,
        }
    }
}

impl Default for DetectionDeploymentConfig {
    fn default() -> Self {
        Self {
            targets: vec![],
            auto_deploy: false,
            validate_deployment: true,
            rollback: RollbackConfig::default(),
        }
    }
}

impl Default for RollbackConfig {
    fn default() -> Self {
        Self {
            auto_rollback: true,
            timeout_seconds: 300,
            health_check: HealthCheckConfig::default(),
        }
    }
}

impl Default for HealthCheckConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            interval_seconds: 60,
            timeout_seconds: 30,
            max_failures: 3,
        }
    }
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            cache: CacheConfig::default(),
            batch_processing: BatchConfig::default(),
            memory: MemoryConfig::default(),
            concurrency: ConcurrencyConfig::default(),
        }
    }
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            cache_type: CacheType::Memory,
            max_size_mb: 256,
            default_ttl: 3600,
            eviction_policy: EvictionPolicy::LRU,
        }
    }
}

impl Default for BatchConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            batch_size: 100,
            timeout_seconds: 30,
            max_concurrent_batches: 4,
        }
    }
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            limit_mb: 1024,
            monitoring: true,
            gc_threshold: 0.8,
            cleanup_interval: 300,
        }
    }
}

impl Default for ConcurrencyConfig {
    fn default() -> Self {
        Self {
            max_concurrent: 10,
            thread_pool_size: 4,
            queue_size: 1000,
            operation_timeout: 60,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: LogLevel::Info,
            format: LogFormat::Structured,
            outputs: vec![LogOutput {
                output_type: LogOutputType::Console,
                path: None,
                endpoint: None,
                enabled: true,
            }],
            structured: true,
            rotation: LogRotationConfig::default(),
        }
    }
}

impl Default for LogRotationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_size_mb: 100,
            max_files: 10,
            interval_hours: 24,
            compress: true,
        }
    }
}