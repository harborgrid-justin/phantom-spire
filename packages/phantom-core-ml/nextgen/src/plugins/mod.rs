//! Comprehensive Plugin System for Phantom ML Core
//!
//! This module provides a enterprise-grade plugin architecture with support for:
//! - Native Rust plugins with dynamic loading
//! - WebAssembly plugins with sandboxing and resource limits
//! - Hot-reloading capabilities
//! - Version compatibility checking
//! - Dependency resolution
//! - Security isolation
//! - Performance monitoring

pub mod core;
pub mod loader;
// pub mod wasm; // Temporarily disabled due to wasmparser dependency issues
pub mod registry;
pub mod config;
pub mod security;
// pub mod discovery; // Temporarily disabled due to walkdir dependency issues
pub mod api;
pub mod marketplace;
pub mod monitoring;
// pub mod examples; // Temporarily disabled due to trait object issues
pub mod napi;

pub use core::*;
pub use loader::*;
// pub use wasm::*;
pub use registry::*;
pub use config::*;
pub use security::*;
// pub use discovery::*;
pub use api::*;
pub use marketplace::*;
pub use monitoring::*;

use thiserror::Error;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use semver::Version;

/// Plugin system errors with comprehensive error types for all failure modes
#[derive(Error, Debug, Clone, Serialize, Deserialize)]
pub enum PluginError {
    #[error("Plugin not found: {plugin_id}")]
    PluginNotFound { plugin_id: String },

    #[error("Plugin loading failed: {reason}")]
    LoadingFailed { reason: String },

    #[error("Plugin validation failed: {errors:?}")]
    ValidationFailed { errors: Vec<String> },

    #[error("Plugin execution failed: {error}")]
    ExecutionFailed { error: String },

    #[error("Plugin dependency not found: {dependency}")]
    DependencyMissing { dependency: String },

    #[error("Plugin version incompatible: required {required}, found {found}")]
    VersionIncompatible { required: String, found: String },

    #[error("Plugin security violation: {violation}")]
    SecurityViolation { violation: String },

    #[error("Plugin resource limit exceeded: {resource} {limit}")]
    ResourceLimitExceeded { resource: String, limit: String },

    #[error("Plugin configuration invalid: {field}")]
    ConfigurationInvalid { field: String },

    #[error("Plugin API error: {message}")]
    ApiError { message: String },

    #[error("WebAssembly error: {message}")]
    WasmError { message: String },

    #[error("I/O error: {error}")]
    IoError { error: String },

    #[error("Serialization error: {error}")]
    SerializationError { error: String },
}

impl From<std::io::Error> for PluginError {
    fn from(err: std::io::Error) -> Self {
        Self::IoError { error: err.to_string() }
    }
}

impl From<serde_json::Error> for PluginError {
    fn from(err: serde_json::Error) -> Self {
        Self::SerializationError { error: err.to_string() }
    }
}

/// Result type for plugin operations
pub type PluginResult<T> = Result<T, PluginError>;

/// Plugin type enumeration supporting both native and WASM plugins
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PluginType {
    /// Native Rust plugin (dynamic library)
    Native,
    /// WebAssembly plugin with sandboxing
    WebAssembly,
    /// JavaScript/TypeScript plugin
    JavaScript,
}

/// Plugin status enumeration for lifecycle management
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PluginStatus {
    /// Plugin is not loaded
    Unloaded,
    /// Plugin is loaded but not active
    Loaded,
    /// Plugin is active and running
    Running,
    /// Plugin is paused (temporarily inactive)
    Paused,
    /// Plugin failed to load or execute
    Failed,
    /// Plugin is being updated
    Updating,
}

/// Comprehensive plugin metadata with all necessary information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: Version,
    pub author: String,
    pub license: String,
    pub plugin_type: PluginType,
    pub entry_point: String,
    pub dependencies: Vec<PluginDependency>,
    pub required_api_version: Version,
    pub permissions: Vec<Permission>,
    pub resource_limits: ResourceLimits,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub checksum: String,
    pub signature: Option<String>,
    pub configuration_schema: Option<serde_json::Value>,
}

/// Plugin dependency specification with version constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginDependency {
    pub name: String,
    pub version_requirement: String, // semver requirement like "^1.0.0"
    pub optional: bool,
}

/// Permission system for plugin security
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Permission {
    /// Read file system access
    FileSystemRead { paths: Vec<String> },
    /// Write file system access
    FileSystemWrite { paths: Vec<String> },
    /// Network access
    Network { hosts: Vec<String> },
    /// Environment variable access
    Environment { variables: Vec<String> },
    /// Process execution
    ProcessExecution,
    /// System information access
    SystemInfo,
    /// Inter-plugin communication
    PluginCommunication,
    /// Database access
    Database { connections: Vec<String> },
    /// Custom permission
    Custom { name: String, description: String },
}

/// Resource limits for plugin execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    /// Maximum memory usage in bytes
    pub max_memory_bytes: u64,
    /// Maximum CPU time in milliseconds
    pub max_cpu_time_ms: u64,
    /// Maximum file handles
    pub max_file_handles: u32,
    /// Maximum network connections
    pub max_network_connections: u32,
    /// Maximum execution time for single operation in milliseconds
    pub max_execution_time_ms: u64,
    /// Custom resource limits
    pub custom_limits: HashMap<String, u64>,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_memory_bytes: 100 * 1024 * 1024, // 100MB
            max_cpu_time_ms: 30_000, // 30 seconds
            max_file_handles: 100,
            max_network_connections: 10,
            max_execution_time_ms: 10_000, // 10 seconds
            custom_limits: HashMap::new(),
        }
    }
}

/// Plugin execution context with comprehensive environment information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginContext {
    /// Unique execution ID
    pub execution_id: Uuid,
    /// Plugin ID being executed
    pub plugin_id: String,
    /// Execution environment variables
    pub environment: HashMap<String, String>,
    /// Plugin-specific configuration
    pub configuration: HashMap<String, serde_json::Value>,
    /// Working directory
    pub working_directory: String,
    /// Temporary directory for plugin use
    pub temp_directory: String,
    /// Available permissions
    pub permissions: Vec<Permission>,
    /// Resource limits
    pub resource_limits: ResourceLimits,
    /// Execution metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// Parent agent context (if called from an agent)
    pub agent_context: Option<crate::agents::AgentContext>,
}

/// Plugin execution result with comprehensive information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginExecutionResult {
    pub plugin_id: String,
    pub execution_id: Uuid,
    pub success: bool,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub warnings: Vec<String>,
    pub logs: Vec<String>,
    pub execution_time_ms: u64,
    pub memory_used_bytes: u64,
    pub cpu_time_ms: u64,
    pub created_files: Vec<String>,
    pub network_requests: u32,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Plugin communication message for inter-plugin communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMessage {
    pub id: Uuid,
    pub sender: String,
    pub recipient: String,
    pub message_type: String,
    pub payload: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub reply_to: Option<Uuid>,
}

/// Plugin health status for monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginHealth {
    pub plugin_id: String,
    pub status: PluginStatus,
    pub last_execution: Option<DateTime<Utc>>,
    pub execution_count: u64,
    pub success_rate: f64,
    pub average_execution_time_ms: f64,
    pub memory_usage_bytes: u64,
    pub error_count: u64,
    pub warnings_count: u64,
    pub uptime_seconds: u64,
}

/// Plugin marketplace entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceEntry {
    pub id: String,
    pub plugin_id: String,
    pub name: String,
    pub description: String,
    pub version: Version,
    pub author: String,
    pub category: String,
    pub tags: Vec<String>,
    pub download_count: u64,
    pub rating: f64,
    pub reviews_count: u64,
    pub price: Option<f64>,
    pub license: String,
    pub homepage_url: Option<String>,
    pub repository_url: Option<String>,
    pub documentation_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub verified: bool,
    pub checksums: HashMap<String, String>,
    pub download_urls: HashMap<String, String>, // platform -> url
}

/// Configuration validation trait for type-safe plugin configuration
pub trait PluginConfiguration: Serialize + for<'de> Deserialize<'de> + Clone + Send + Sync {
    /// Validate the configuration
    fn validate(&self) -> PluginResult<()>;

    /// Get configuration schema for UI generation
    fn schema() -> serde_json::Value;

    /// Get default configuration
    fn default_config() -> Self;
}