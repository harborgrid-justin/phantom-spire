//! Core plugin trait system and interfaces
//!
//! Defines the fundamental plugin traits and interfaces that all plugins must implement,
//! providing a unified API for both native and WASM plugins.

use super::*;
use async_trait::async_trait;
use serde_json::Value;
use std::any::Any;
use std::sync::Arc;
use uuid::Uuid;

/// Core plugin trait that all plugins must implement
///
/// This trait provides the fundamental interface for plugin execution and management.
/// It's designed to be object-safe and support both synchronous and asynchronous operations.
#[async_trait]
pub trait Plugin: Send + Sync {
    /// Get plugin metadata
    fn metadata(&self) -> &PluginMetadata;

    /// Initialize the plugin with given configuration
    async fn initialize(&mut self, config: PluginContext) -> PluginResult<()>;

    /// Execute the plugin with given input
    async fn execute(&self, input: PluginExecutionInput) -> PluginResult<PluginExecutionResult>;

    /// Shutdown the plugin and cleanup resources
    async fn shutdown(&mut self) -> PluginResult<()>;

    /// Validate plugin configuration
    fn validate_config(&self, config: &HashMap<String, Value>) -> PluginResult<()>;

    /// Get plugin health status
    fn health(&self) -> PluginHealth;

    /// Handle plugin messages for inter-plugin communication
    async fn handle_message(&self, message: PluginMessage) -> PluginResult<Option<PluginMessage>>;

    /// Get plugin capabilities
    fn capabilities(&self) -> Vec<PluginCapability>;

    /// Plugin-specific configuration schema
    fn config_schema(&self) -> Value;

    /// Check if plugin supports hot reloading
    fn supports_hot_reload(&self) -> bool {
        false
    }

    /// Handle hot reload event
    async fn on_hot_reload(&mut self) -> PluginResult<()> {
        Ok(())
    }

    /// Get plugin-specific metrics
    fn metrics(&self) -> HashMap<String, Value> {
        HashMap::new()
    }

    /// Handle configuration update
    async fn update_config(&mut self, config: HashMap<String, Value>) -> PluginResult<()>;

    /// Get as Any for downcasting (used internally)
    fn as_any(&self) -> &dyn Any;
}

/// Plugin execution input with flexible data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginExecutionInput {
    pub context: PluginContext,
    pub data: Value,
    pub operation: String,
    pub parameters: HashMap<String, Value>,
    pub timeout_ms: Option<u64>,
}

/// Plugin capability enumeration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PluginCapability {
    /// Data processing capability
    DataProcessing {
        input_formats: Vec<String>,
        output_formats: Vec<String>,
    },
    /// Machine learning model capability
    MachineLearning {
        model_types: Vec<String>,
        training_supported: bool,
        inference_supported: bool,
    },
    /// Security analysis capability
    SecurityAnalysis {
        analysis_types: Vec<String>,
        threat_detection: bool,
        vulnerability_scanning: bool,
    },
    /// API integration capability
    ApiIntegration {
        supported_apis: Vec<String>,
        authentication_methods: Vec<String>,
    },
    /// File processing capability
    FileProcessing {
        supported_formats: Vec<String>,
        batch_processing: bool,
    },
    /// Database integration capability
    DatabaseIntegration {
        supported_databases: Vec<String>,
        query_types: Vec<String>,
    },
    /// Custom capability
    Custom {
        name: String,
        description: String,
        properties: HashMap<String, Value>,
    },
}

/// Agent plugin trait that extends Plugin for agent-specific functionality
#[async_trait]
pub trait AgentPlugin: Plugin {
    /// Execute agent-specific operations
    async fn execute_agent(
        &self,
        agent_context: crate::agents::AgentContext,
    ) -> PluginResult<crate::agents::AgentResult>;

    /// Get agent compatibility information
    fn agent_compatibility(&self) -> Vec<String>;

    /// Validate agent context
    fn validate_agent_context(
        &self,
        context: &crate::agents::AgentContext,
    ) -> PluginResult<()>;
}

/// Native plugin trait for Rust plugins loaded via dynamic libraries
#[async_trait]
pub trait NativePlugin: Plugin {
    /// Get the dynamic library symbol
    fn symbol_name() -> &'static str;

    /// Initialize from dynamic library
    fn from_library(lib: Arc<libloading::Library>) -> PluginResult<Box<dyn NativePlugin>>
    where
        Self: Sized;
}

/// WebAssembly plugin trait for WASM plugins
#[async_trait]
pub trait WasmPlugin: Plugin {
    /// Get WASM module bytes
    fn wasm_bytes(&self) -> &[u8];

    /// Get WASM imports required by the plugin
    fn required_imports(&self) -> Vec<String>;

    /// Get WASM memory limits
    fn memory_limits(&self) -> WasmMemoryLimits;
}

/// WebAssembly memory limits configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmMemoryLimits {
    pub initial_pages: u32,
    pub maximum_pages: Option<u32>,
    pub shared: bool,
}

impl Default for WasmMemoryLimits {
    fn default() -> Self {
        Self {
            initial_pages: 16, // 1MB initial
            maximum_pages: Some(256), // 16MB maximum
            shared: false,
        }
    }
}

/// Plugin factory trait for creating plugin instances
pub trait PluginFactory: Send + Sync {
    /// Create a new plugin instance
    fn create_plugin(&self, metadata: PluginMetadata) -> PluginResult<Box<dyn Plugin>>;

    /// Get supported plugin types
    fn supported_types(&self) -> Vec<PluginType>;

    /// Validate plugin before creation
    fn validate_plugin(&self, metadata: &PluginMetadata) -> PluginResult<()>;
}

/// Plugin lifecycle events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PluginEvent {
    /// Plugin was loaded
    Loaded { plugin_id: String, timestamp: DateTime<Utc> },
    /// Plugin was unloaded
    Unloaded { plugin_id: String, timestamp: DateTime<Utc> },
    /// Plugin started execution
    ExecutionStarted { plugin_id: String, execution_id: Uuid, timestamp: DateTime<Utc> },
    /// Plugin completed execution
    ExecutionCompleted { plugin_id: String, execution_id: Uuid, result: PluginExecutionResult },
    /// Plugin execution failed
    ExecutionFailed { plugin_id: String, execution_id: Uuid, error: PluginError },
    /// Plugin configuration changed
    ConfigurationChanged { plugin_id: String, timestamp: DateTime<Utc> },
    /// Plugin hot reloaded
    HotReloaded { plugin_id: String, timestamp: DateTime<Utc> },
    /// Plugin health check
    HealthCheck { plugin_id: String, health: PluginHealth },
    /// Custom plugin event
    Custom { plugin_id: String, event_type: String, data: Value, timestamp: DateTime<Utc> },
}

/// Plugin event listener trait
#[async_trait]
pub trait PluginEventListener: Send + Sync {
    /// Handle plugin event
    async fn on_event(&self, event: PluginEvent) -> PluginResult<()>;

    /// Get listener name
    fn name(&self) -> &str;

    /// Get interested event types
    fn interested_events(&self) -> Vec<String>;
}

/// Base plugin implementation that provides common functionality
#[derive(Debug)]
pub struct BasePlugin {
    pub metadata: PluginMetadata,
    pub status: PluginStatus,
    pub context: Option<PluginContext>,
    pub execution_count: u64,
    pub success_count: u64,
    pub error_count: u64,
    pub warning_count: u64,
    pub total_execution_time_ms: u64,
    pub last_execution: Option<DateTime<Utc>>,
}

impl BasePlugin {
    pub fn new(metadata: PluginMetadata) -> Self {
        Self {
            metadata,
            status: PluginStatus::Unloaded,
            context: None,
            execution_count: 0,
            success_count: 0,
            error_count: 0,
            warning_count: 0,
            total_execution_time_ms: 0,
            last_execution: None,
        }
    }

    pub fn update_execution_stats(&mut self, result: &PluginExecutionResult) {
        self.execution_count += 1;
        self.total_execution_time_ms += result.execution_time_ms;
        self.last_execution = Some(Utc::now());

        if result.success {
            self.success_count += 1;
        } else {
            self.error_count += 1;
        }

        self.warning_count += result.warnings.len() as u64;
    }

    pub fn get_success_rate(&self) -> f64 {
        if self.execution_count == 0 {
            0.0
        } else {
            self.success_count as f64 / self.execution_count as f64
        }
    }

    pub fn get_average_execution_time(&self) -> f64 {
        if self.execution_count == 0 {
            0.0
        } else {
            self.total_execution_time_ms as f64 / self.execution_count as f64
        }
    }
}

/// Plugin builder for creating plugins with fluent API
pub struct PluginBuilder {
    metadata: Option<PluginMetadata>,
    permissions: Vec<Permission>,
    resource_limits: Option<ResourceLimits>,
    configuration: HashMap<String, Value>,
}

impl PluginBuilder {
    pub fn new() -> Self {
        Self {
            metadata: None,
            permissions: Vec::new(),
            resource_limits: None,
            configuration: HashMap::new(),
        }
    }

    pub fn metadata(mut self, metadata: PluginMetadata) -> Self {
        self.metadata = Some(metadata);
        self
    }

    pub fn permission(mut self, permission: Permission) -> Self {
        self.permissions.push(permission);
        self
    }

    pub fn resource_limits(mut self, limits: ResourceLimits) -> Self {
        self.resource_limits = Some(limits);
        self
    }

    pub fn config<K, V>(mut self, key: K, value: V) -> Self
    where
        K: Into<String>,
        V: Into<Value>,
    {
        self.configuration.insert(key.into(), value.into());
        self
    }

    pub fn build(self) -> PluginResult<BasePlugin> {
        let metadata = self.metadata.ok_or_else(|| PluginError::ConfigurationInvalid {
            field: "metadata".to_string(),
        })?;

        Ok(BasePlugin::new(metadata))
    }
}

impl Default for PluginBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Macro for implementing basic plugin traits
#[macro_export]
macro_rules! impl_plugin_base {
    ($plugin:ty) => {
        #[async_trait::async_trait]
        impl Plugin for $plugin {
            fn metadata(&self) -> &PluginMetadata {
                &self.base.metadata
            }

            async fn initialize(&mut self, config: PluginContext) -> PluginResult<()> {
                self.base.context = Some(config);
                self.base.status = PluginStatus::Loaded;
                Ok(())
            }

            async fn shutdown(&mut self) -> PluginResult<()> {
                self.base.status = PluginStatus::Unloaded;
                self.base.context = None;
                Ok(())
            }

            fn validate_config(&self, config: &HashMap<String, Value>) -> PluginResult<()> {
                // Basic validation - override for plugin-specific validation
                Ok(())
            }

            fn health(&self) -> PluginHealth {
                PluginHealth {
                    plugin_id: self.base.metadata.id.clone(),
                    status: self.base.status.clone(),
                    last_execution: self.base.last_execution,
                    execution_count: self.base.execution_count,
                    success_rate: self.base.get_success_rate(),
                    average_execution_time_ms: self.base.get_average_execution_time(),
                    memory_usage_bytes: 0, // Override with actual memory usage
                    error_count: self.base.error_count,
                    warnings_count: self.base.warning_count,
                    uptime_seconds: 0, // Override with actual uptime
                }
            }

            async fn handle_message(&self, message: PluginMessage) -> PluginResult<Option<PluginMessage>> {
                // Default implementation - override for plugin-specific message handling
                Ok(None)
            }

            fn capabilities(&self) -> Vec<PluginCapability> {
                // Override with plugin-specific capabilities
                Vec::new()
            }

            fn config_schema(&self) -> Value {
                self.base.metadata.configuration_schema
                    .as_ref()
                    .cloned()
                    .unwrap_or_else(|| serde_json::json!({}))
            }

            async fn update_config(&mut self, config: HashMap<String, Value>) -> PluginResult<()> {
                self.validate_config(&config)?;
                if let Some(ref mut ctx) = self.base.context {
                    ctx.configuration = config;
                }
                Ok(())
            }

            fn as_any(&self) -> &dyn std::any::Any {
                self
            }
        }
    };
}

pub use impl_plugin_base;