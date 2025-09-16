//! NAPI-RS Integration for Plugin System
//!
//! Provides Node.js bindings for the plugin system, allowing JavaScript/TypeScript
//! applications to interact with the plugin system seamlessly.

use super::*;
use crate::agents::{AgentContext, AgentResult};
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// NAPI-RS wrapper for the Plugin API
#[napi]
pub struct PluginSystemApi {
    inner: Arc<RwLock<Option<PluginApi>>>,
}

#[napi]
impl PluginSystemApi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(None)),
        }
    }

    /// Initialize the plugin system
    #[napi]
    pub async fn initialize(
        &self,
        config_directory: Option<String>,
        environment: Option<String>,
    ) -> Result<()> {
        let config_dir = config_directory.unwrap_or_else(|| "./plugins".to_string());
        let env = environment.unwrap_or_else(|| "development".to_string());

        // Create configuration manager
        let environment_config = env.parse::<crate::plugins::config::ConfigEnvironment>()
            .map_err(|e| Error::new(Status::InvalidArg, format!("Invalid environment: {}", e)))?;

        let config_manager = crate::plugins::config::ConfigManager::new(
            config_dir,
            environment_config,
        ).map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

        // Create plugin loader
        let loader_config = crate::plugins::loader::LoaderConfig::default();
        let mut loader = crate::plugins::loader::PluginLoader::new(loader_config)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        loader.initialize().await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

        // Create registry
        let registry_config = crate::plugins::registry::RegistryConfig::default();
        let registry = crate::plugins::registry::PluginRegistry::new(registry_config, loader)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

        // Create plugin API
        let plugin_api = PluginApi::new(registry, config_manager)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

        plugin_api.initialize().await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

        *self.inner.write().await = Some(plugin_api);

        Ok(())
    }

    /// List all available plugins
    #[napi]
    pub async fn list_plugins(&self) -> Result<Vec<String>> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            Ok(api.list_plugins().await)
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Get plugin information
    #[napi]
    pub async fn get_plugin_info(&self, plugin_id: String) -> Result<Option<PluginInfoJs>> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            Ok(api.get_plugin_info(&plugin_id).await.map(|metadata| PluginInfoJs {
                id: metadata.id,
                name: metadata.name,
                description: metadata.description,
                version: metadata.version.to_string(),
                author: metadata.author,
                plugin_type: match metadata.plugin_type {
                    PluginType::Native => "native".to_string(),
                    PluginType::WebAssembly => "wasm".to_string(),
                    PluginType::JavaScript => "javascript".to_string(),
                },
                tags: metadata.tags,
            }))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Execute a plugin operation
    #[napi]
    pub async fn execute_plugin(
        &self,
        plugin_id: String,
        operation: String,
        input: serde_json::Value,
    ) -> Result<serde_json::Value> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            api.execute_plugin(&plugin_id, &operation, input).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Execute plugin for agent integration
    #[napi]
    pub async fn execute_agent_plugin(
        &self,
        plugin_id: String,
        agent_context: AgentContextJs,
    ) -> Result<AgentResultJs> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            let context = AgentContext {
                project_path: agent_context.project_path,
                target_files: agent_context.target_files,
                config: agent_context.config.into_iter().collect(),
                metadata: agent_context.metadata.into_iter().collect(),
                dry_run: agent_context.dry_run,
                verbose: agent_context.verbose,
            };

            let result = api.execute_agent_plugin(&plugin_id, context).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

            Ok(AgentResultJs {
                agent_name: result.agent_name,
                success: result.success,
                message: result.message,
                data: result.data,
                errors: result.errors,
                warnings: result.warnings,
                execution_time_ms: result.execution_time_ms,
            })
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Search plugins in marketplace
    #[napi]
    pub async fn search_marketplace(
        &self,
        query: String,
        limit: Option<u32>,
    ) -> Result<Vec<MarketplaceEntryJs>> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            let results = api.search_marketplace(&query, limit).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

            Ok(results.entries.into_iter().map(|entry| MarketplaceEntryJs {
                id: entry.id,
                plugin_id: entry.plugin_id,
                name: entry.name,
                description: entry.description,
                version: entry.version.to_string(),
                author: entry.author,
                category: entry.category,
                tags: entry.tags,
                download_count: entry.download_count,
                rating: entry.rating,
                license: entry.license,
                verified: entry.verified,
            }).collect())
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Install plugin from marketplace
    #[napi]
    pub async fn install_plugin(
        &self,
        plugin_id: String,
        version: Option<String>,
        target_directory: String,
    ) -> Result<InstallationResultJs> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            let result = api.install_plugin(
                &plugin_id,
                version.as_deref(),
                std::path::Path::new(&target_directory)
            ).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

            Ok(InstallationResultJs {
                plugin_id: result.plugin_id,
                installed_version: result.installed_version,
                installation_path: result.installation_path.to_string_lossy().to_string(),
                success: result.success,
                error: result.error,
                installed_files: result.installed_files.into_iter()
                    .map(|p| p.to_string_lossy().to_string())
                    .collect(),
            })
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Update plugin configuration
    #[napi]
    pub async fn update_plugin_config(
        &self,
        plugin_id: String,
        updates: HashMap<String, serde_json::Value>,
    ) -> Result<()> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            api.update_plugin_config(&plugin_id, updates).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Get plugin health status
    #[napi]
    pub async fn get_plugin_health(&self, plugin_id: String) -> Result<Option<PluginHealthJs>> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            Ok(api.get_plugin_health(&plugin_id).await.map(|health| PluginHealthJs {
                plugin_id: health.plugin_id,
                status: match health.status {
                    PluginStatus::Unloaded => "unloaded".to_string(),
                    PluginStatus::Loaded => "loaded".to_string(),
                    PluginStatus::Running => "running".to_string(),
                    PluginStatus::Paused => "paused".to_string(),
                    PluginStatus::Failed => "failed".to_string(),
                    PluginStatus::Updating => "updating".to_string(),
                },
                last_execution: health.last_execution.map(|dt| dt.to_rfc3339()),
                execution_count: health.execution_count,
                success_rate: health.success_rate,
                average_execution_time_ms: health.average_execution_time_ms,
                memory_usage_bytes: health.memory_usage_bytes,
                error_count: health.error_count,
                uptime_seconds: health.uptime_seconds,
            }))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Get system metrics
    #[napi]
    pub async fn get_metrics(&self) -> Result<serde_json::Value> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            let metrics = api.get_metrics().await;
            Ok(serde_json::to_value(metrics).unwrap_or_else(|_| serde_json::json!({})))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Send message between plugins
    #[napi]
    pub async fn send_plugin_message(
        &self,
        sender: String,
        recipient: String,
        message_type: String,
        payload: serde_json::Value,
    ) -> Result<()> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            api.send_plugin_message(&sender, &recipient, &message_type, payload).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Shutdown the plugin system
    #[napi]
    pub async fn shutdown(&self) -> Result<()> {
        let mut inner = self.inner.write().await;
        if let Some(api) = inner.take() {
            api.shutdown().await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
        } else {
            Ok(())
        }
    }

    /// Create example plugins for testing
    #[napi]
    pub async fn create_example_plugins(&self) -> Result<Vec<String>> {
        let inner = self.inner.read().await;
        if let Some(_api) = inner.as_ref() {
            // Return list of example plugins that can be created
            Ok(vec![
                "log_analyzer".to_string(),
                "security_scanner".to_string(),
                "data_processor".to_string(),
            ])
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }

    /// Execute example plugin with sample data
    #[napi]
    pub async fn execute_example_plugin(
        &self,
        example_type: String,
        operation: String,
        sample_data: serde_json::Value,
    ) -> Result<serde_json::Value> {
        let inner = self.inner.read().await;
        if let Some(api) = inner.as_ref() {
            let plugin_id = match example_type.as_str() {
                "log_analyzer" => "log_analyzer",
                "security_scanner" => "security_scanner",
                "data_processor" => "data_processor",
                _ => return Err(Error::new(Status::InvalidArg, "Unknown example type")),
            };

            api.execute_plugin(plugin_id, &operation, sample_data).await
                .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
        } else {
            Err(Error::new(Status::InvalidArg, "Plugin system not initialized"))
        }
    }
}

// JavaScript/TypeScript type definitions

#[napi(object)]
pub struct PluginInfoJs {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub plugin_type: String,
    pub tags: Vec<String>,
}

#[napi(object)]
pub struct AgentContextJs {
    pub project_path: String,
    pub target_files: Vec<String>,
    pub config: Vec<(String, String)>,
    pub metadata: Vec<(String, String)>,
    pub dry_run: bool,
    pub verbose: bool,
}

#[napi(object)]
pub struct AgentResultJs {
    pub agent_name: String,
    pub success: bool,
    pub message: String,
    pub data: Option<String>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub execution_time_ms: i64,
}

#[napi(object)]
pub struct MarketplaceEntryJs {
    pub id: String,
    pub plugin_id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub category: String,
    pub tags: Vec<String>,
    pub download_count: u64,
    pub rating: f64,
    pub license: String,
    pub verified: bool,
}

#[napi(object)]
pub struct InstallationResultJs {
    pub plugin_id: String,
    pub installed_version: String,
    pub installation_path: String,
    pub success: bool,
    pub error: Option<String>,
    pub installed_files: Vec<String>,
}

#[napi(object)]
pub struct PluginHealthJs {
    pub plugin_id: String,
    pub status: String,
    pub last_execution: Option<String>,
    pub execution_count: u64,
    pub success_rate: f64,
    pub average_execution_time_ms: f64,
    pub memory_usage_bytes: u64,
    pub error_count: u64,
    pub uptime_seconds: u64,
}

/// Convenience function to create and initialize the plugin system
#[napi]
pub async fn create_plugin_system(
    config_directory: Option<String>,
    environment: Option<String>,
) -> Result<PluginSystemApi> {
    let api = PluginSystemApi::new();
    api.initialize(config_directory, environment).await?;
    Ok(api)
}

/// Get plugin system version information
#[napi]
pub fn get_plugin_system_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Create sample plugin configuration
#[napi]
pub fn create_sample_plugin_config(plugin_id: String) -> serde_json::Value {
    serde_json::json!({
        "plugin_id": plugin_id,
        "config": {
            "enabled": true,
            "log_level": "info",
            "timeout_ms": 30000
        },
        "environments": {
            "development": {
                "debug": true,
                "verbose": true
            },
            "production": {
                "debug": false,
                "verbose": false
            }
        },
        "metadata": {
            "created_by": "plugin_system",
            "version": "1.0.0"
        }
    })
}

/// Validate plugin manifest format
#[napi]
pub fn validate_plugin_manifest(manifest: serde_json::Value) -> Result<bool> {
    // Basic validation of plugin manifest structure
    let plugin_section = manifest.get("plugin")
        .ok_or_else(|| Error::new(Status::InvalidArg, "Missing [plugin] section"))?;

    let _id = plugin_section.get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| Error::new(Status::InvalidArg, "Missing plugin.id"))?;

    let _name = plugin_section.get("name")
        .and_then(|v| v.as_str())
        .ok_or_else(|| Error::new(Status::InvalidArg, "Missing plugin.name"))?;

    let version_str = plugin_section.get("version")
        .and_then(|v| v.as_str())
        .ok_or_else(|| Error::new(Status::InvalidArg, "Missing plugin.version"))?;

    // Validate version format
    Version::parse(version_str)
        .map_err(|_| Error::new(Status::InvalidArg, "Invalid version format"))?;

    Ok(true)
}

/// Create sample data for testing plugins
#[napi]
pub fn create_sample_data(data_type: String) -> Result<serde_json::Value> {
    match data_type.as_str() {
        "log_entries" => {
            Ok(serde_json::json!([
                {
                    "timestamp": "2024-01-15T10:30:00Z",
                    "level": "INFO",
                    "message": "Application started successfully",
                    "service": "web-server",
                    "duration_ms": 1500
                },
                {
                    "timestamp": "2024-01-15T10:31:00Z",
                    "level": "ERROR",
                    "message": "Database connection failed",
                    "service": "web-server",
                    "error": "Connection timeout"
                },
                {
                    "timestamp": "2024-01-15T10:32:00Z",
                    "level": "WARN",
                    "message": "High memory usage detected",
                    "service": "worker",
                    "memory_mb": 950
                }
            ]))
        }
        "security_scan" => {
            Ok(serde_json::json!({
                "file_path": "src/example.js",
                "content": "const password = \"hardcoded_password123\";\nconst query = \"SELECT * FROM users WHERE id = \" + userId;"
            }))
        }
        "user_data" => {
            Ok(serde_json::json!([
                {
                    "id": 1,
                    "name": "Alice",
                    "age": 28,
                    "score": 95.5,
                    "active": true
                },
                {
                    "id": 2,
                    "name": "Bob",
                    "age": 34,
                    "score": 87.2,
                    "active": false
                },
                {
                    "id": 3,
                    "name": "Charlie",
                    "age": 22,
                    "score": 92.8,
                    "active": true
                }
            ]))
        }
        _ => Err(Error::new(Status::InvalidArg, "Unknown data type"))
    }
}