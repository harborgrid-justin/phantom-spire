//! Example Plugin Implementations
//!
//! This module contains example plugin implementations to demonstrate
//! the plugin system capabilities and provide templates for developers.

pub mod log_analyzer_plugin;
pub mod security_scanner_plugin;
pub mod data_processor_plugin;

pub use log_analyzer_plugin::*;
pub use security_scanner_plugin::*;
pub use data_processor_plugin::*;

use super::*;
use std::collections::HashMap;
use std::sync::Arc;

/// Plugin factory for creating example plugins
pub struct ExamplePluginFactory;

impl PluginFactory for ExamplePluginFactory {
    fn create_plugin(&self, metadata: PluginMetadata) -> PluginResult<Box<dyn Plugin>> {
        match metadata.id.as_str() {
            "log_analyzer" => Ok(Box::new(LogAnalyzerPlugin::new(metadata))),
            "security_scanner" => Ok(Box::new(SecurityScannerPlugin::new(metadata))),
            "data_processor" => Ok(Box::new(DataProcessorPlugin::new(metadata))),
            _ => Err(PluginError::PluginNotFound {
                plugin_id: metadata.id,
            }),
        }
    }

    fn supported_types(&self) -> Vec<PluginType> {
        vec![PluginType::Native]
    }

    fn validate_plugin(&self, metadata: &PluginMetadata) -> PluginResult<()> {
        if metadata.name.is_empty() {
            return Err(PluginError::ValidationFailed {
                errors: vec!["Plugin name cannot be empty".to_string()],
            });
        }

        if metadata.version.to_string().is_empty() {
            return Err(PluginError::ValidationFailed {
                errors: vec!["Plugin version cannot be empty".to_string()],
            });
        }

        Ok(())
    }
}

/// Helper function to create example plugin metadata
pub fn create_example_metadata(
    id: &str,
    name: &str,
    description: &str,
    version: &str,
) -> PluginMetadata {
    let now = Utc::now();

    PluginMetadata {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        version: Version::parse(version).unwrap_or_else(|_| Version::parse("1.0.0").unwrap()),
        author: "Phantom ML Core Team".to_string(),
        license: "MIT".to_string(),
        plugin_type: PluginType::Native,
        entry_point: "main".to_string(),
        dependencies: Vec::new(),
        required_api_version: Version::parse("1.0.0").unwrap(),
        permissions: vec![
            Permission::FileSystemRead { paths: vec!["./data".to_string()] },
            Permission::FileSystemWrite { paths: vec!["./output".to_string()] },
        ],
        resource_limits: ResourceLimits {
            max_memory_bytes: 100 * 1024 * 1024, // 100MB
            max_cpu_time_ms: 30_000, // 30 seconds
            max_file_handles: 50,
            max_network_connections: 5,
            max_execution_time_ms: 10_000, // 10 seconds
            custom_limits: HashMap::new(),
        },
        tags: vec!["example".to_string(), "demo".to_string()],
        created_at: now,
        updated_at: now,
        checksum: "example_checksum".to_string(),
        signature: None,
        configuration_schema: Some(serde_json::json!({
            "type": "object",
            "properties": {
                "enabled": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable the plugin"
                },
                "log_level": {
                    "type": "string",
                    "enum": ["debug", "info", "warn", "error"],
                    "default": "info",
                    "description": "Logging level"
                }
            },
            "required": ["enabled"]
        })),
    }
}

/// Utility function to create a standard plugin execution result
pub fn create_plugin_result(
    plugin_id: &str,
    execution_id: Uuid,
    success: bool,
    data: Option<serde_json::Value>,
    error: Option<String>,
    execution_time_ms: u64,
) -> PluginExecutionResult {
    PluginExecutionResult {
        plugin_id: plugin_id.to_string(),
        execution_id,
        success,
        result: data,
        error,
        warnings: Vec::new(),
        logs: Vec::new(),
        execution_time_ms,
        memory_used_bytes: 1024 * 1024, // 1MB estimate
        cpu_time_ms: execution_time_ms / 10, // Rough CPU time estimate
        created_files: Vec::new(),
        network_requests: 0,
        metadata: HashMap::new(),
    }
}