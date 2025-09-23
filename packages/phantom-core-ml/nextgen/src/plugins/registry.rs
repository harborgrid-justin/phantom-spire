//! Plugin Registry and Lifecycle Management
//!
//! Comprehensive plugin registry with lifecycle management, health monitoring,
//! dependency resolution, and hot-reloading capabilities.

use super::*;
use crate::agents::{AgentContext, AgentResult};
use anyhow::{Context as AnyhowContext, Result as AnyhowResult};
use dashmap::DashMap;
use parking_lot::RwLock;
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{mpsc, RwLock as TokioRwLock, Semaphore};
use tokio::time::{interval, sleep};
use tracing::{debug, error, info, instrument, warn};

/// Plugin registry configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryConfig {
    /// Health check interval in seconds
    pub health_check_interval_secs: u64,
    /// Maximum number of failed health checks before marking plugin as unhealthy
    pub max_failed_health_checks: u32,
    /// Plugin execution timeout in seconds
    pub execution_timeout_secs: u64,
    /// Maximum concurrent plugin executions
    pub max_concurrent_executions: usize,
    /// Enable automatic restart of failed plugins
    pub auto_restart_failed_plugins: bool,
    /// Maximum plugin restart attempts
    pub max_restart_attempts: u32,
    /// Plugin restart cooldown in seconds
    pub restart_cooldown_secs: u64,
    /// Enable plugin metrics collection
    pub metrics_enabled: bool,
    /// Metrics collection interval in seconds
    pub metrics_interval_secs: u64,
    /// Maximum number of execution results to keep in history
    pub max_execution_history: usize,
}

impl Default for RegistryConfig {
    fn default() -> Self {
        Self {
            health_check_interval_secs: 30,
            max_failed_health_checks: 3,
            execution_timeout_secs: 300, // 5 minutes
            max_concurrent_executions: 10,
            auto_restart_failed_plugins: true,
            max_restart_attempts: 3,
            restart_cooldown_secs: 60,
            metrics_enabled: true,
            metrics_interval_secs: 60,
            max_execution_history: 1000,
        }
    }
}

/// Plugin registry entry with comprehensive state tracking
#[derive(Debug, Clone)]
pub struct PluginRegistryEntry {
    pub metadata: PluginMetadata,
    pub status: PluginStatus,
    pub health: PluginHealth,
    pub restart_count: u32,
    pub last_restart: Option<DateTime<Utc>>,
    pub failed_health_checks: u32,
    pub execution_history: VecDeque<PluginExecutionResult>,
    pub dependencies: Vec<String>,
    pub dependents: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: HashMap<String, String>,
    pub custom_data: HashMap<String, serde_json::Value>,
}

impl PluginRegistryEntry {
    pub fn new(metadata: PluginMetadata) -> Self {
        let now = Utc::now();
        Self {
            dependencies: metadata.dependencies.iter().map(|dep| dep.name.clone()).collect(),
            dependents: Vec::new(),
            metadata,
            status: PluginStatus::Unloaded,
            health: PluginHealth {
                plugin_id: String::new(), // Will be set by registry
                status: PluginStatus::Unloaded,
                last_execution: None,
                execution_count: 0,
                success_rate: 0.0,
                average_execution_time_ms: 0.0,
                memory_usage_bytes: 0,
                error_count: 0,
                warnings_count: 0,
                uptime_seconds: 0,
            },
            restart_count: 0,
            last_restart: None,
            failed_health_checks: 0,
            execution_history: VecDeque::new(),
            created_at: now,
            updated_at: now,
            tags: HashMap::new(),
            custom_data: HashMap::new(),
        }
    }

    pub fn update_health(&mut self, health: PluginHealth) {
        self.health = health;
        self.updated_at = Utc::now();

        // Update failed health checks based on status
        match self.health.status {
            PluginStatus::Failed => {
                self.failed_health_checks += 1;
            }
            PluginStatus::Running => {
                self.failed_health_checks = 0;
            }
            _ => {}
        }
    }

    pub fn add_execution_result(&mut self, result: PluginExecutionResult, max_history: usize) {
        self.execution_history.push_back(result);

        // Keep only recent history
        while self.execution_history.len() > max_history {
            self.execution_history.pop_front();
        }

        self.updated_at = Utc::now();
    }

    pub fn get_success_rate(&self) -> f64 {
        if self.execution_history.is_empty() {
            0.0
        } else {
            let successful = self.execution_history.iter().filter(|r| r.success).count();
            successful as f64 / self.execution_history.len() as f64
        }
    }

    pub fn get_average_execution_time(&self) -> f64 {
        if self.execution_history.is_empty() {
            0.0
        } else {
            let total_time: u64 = self.execution_history.iter().map(|r| r.execution_time_ms).sum();
            total_time as f64 / self.execution_history.len() as f64
        }
    }
}

/// Plugin execution request
#[derive(Debug, Clone)]
pub struct PluginExecutionRequest {
    pub plugin_id: String,
    pub operation: String,
    pub input: serde_json::Value,
    pub context: PluginContext,
    pub timeout_ms: Option<u64>,
    pub priority: i32,
    pub tags: HashMap<String, String>,
}

/// Plugin registry with comprehensive management capabilities
pub struct PluginRegistry {
    config: RegistryConfig,
    entries: Arc<DashMap<String, PluginRegistryEntry>>,
    plugins: Arc<DashMap<String, Arc<RwLock<Box<dyn Plugin>>>>>,
    loader: Arc<TokioRwLock<crate::plugins::loader::PluginLoader>>,
    wasm_runtime: Arc<TokioRwLock<Option<crate::plugins::wasm::WasmRuntime>>>,
    execution_semaphore: Arc<Semaphore>,
    event_listeners: Arc<RwLock<Vec<Arc<dyn PluginEventListener>>>>,
    metrics_collector: Arc<RwLock<HashMap<String, serde_json::Value>>>,
    execution_counter: Arc<AtomicU64>,
    health_check_handle: Option<tokio::task::JoinHandle<()>>,
    metrics_handle: Option<tokio::task::JoinHandle<()>>,
}

impl PluginRegistry {
    /// Create a new plugin registry
    pub fn new(
        config: RegistryConfig,
        loader: crate::plugins::loader::PluginLoader,
    ) -> PluginResult<Self> {
        Ok(Self {
            execution_semaphore: Arc::new(Semaphore::new(config.max_concurrent_executions)),
            config,
            entries: Arc::new(DashMap::new()),
            plugins: Arc::new(DashMap::new()),
            loader: Arc::new(TokioRwLock::new(loader)),
            wasm_runtime: Arc::new(TokioRwLock::new(None)),
            event_listeners: Arc::new(RwLock::new(Vec::new())),
            metrics_collector: Arc::new(RwLock::new(HashMap::new())),
            execution_counter: Arc::new(AtomicU64::new(0)),
            health_check_handle: None,
            metrics_handle: None,
        })
    }

    /// Initialize the registry and start background tasks
    #[instrument(skip(self))]
    pub async fn initialize(&mut self) -> PluginResult<()> {
        info!("Initializing plugin registry");

        // Initialize WASM runtime if needed
        let wasm_config = crate::plugins::wasm::WasmRuntimeConfig::default();
        let wasm_runtime = crate::plugins::wasm::WasmRuntime::new(wasm_config)
            .map_err(|e| PluginError::LoadingFailed {
                reason: format!("Failed to create WASM runtime: {}", e),
            })?;
        *self.wasm_runtime.write().await = Some(wasm_runtime);

        // Load initial plugins
        let mut loader = self.loader.write().await;
        loader.discover_and_load_plugins().await?;

        // Register plugins with the registry
        let plugin_ids = loader.list_plugins();
        for plugin_id in plugin_ids {
            if let Some(plugin_ref) = loader.get_plugin(&plugin_id) {
                let plugin = plugin_ref.read();
                let metadata = plugin.metadata().clone();
                drop(plugin);

                let entry = PluginRegistryEntry::new(metadata);
                self.register_plugin_entry(plugin_id.clone(), entry, plugin_ref);
            }
        }

        drop(loader); // Release loader lock

        // Start background tasks
        self.start_health_monitoring().await;
        if self.config.metrics_enabled {
            self.start_metrics_collection().await;
        }

        info!("Plugin registry initialized with {} plugins", self.entries.len());
        Ok(())
    }

    /// Register a plugin entry
    fn register_plugin_entry(
        &self,
        plugin_id: String,
        mut entry: PluginRegistryEntry,
        plugin: Arc<RwLock<Box<dyn Plugin>>>,
    ) {
        entry.health.plugin_id = plugin_id.clone();
        entry.status = PluginStatus::Loaded;

        self.entries.insert(plugin_id.clone(), entry);
        self.plugins.insert(plugin_id.clone(), plugin);

        // Update dependency relationships
        self.update_dependency_graph(&plugin_id);
    }

    /// Update dependency graph for a plugin
    fn update_dependency_graph(&self, plugin_id: &str) {
        if let Some(entry) = self.entries.get(plugin_id) {
            let dependencies = entry.dependencies.clone();
            drop(entry);

            // Add this plugin as a dependent to its dependencies
            for dep_id in dependencies {
                if let Some(mut dep_entry) = self.entries.get_mut(&dep_id) {
                    if !dep_entry.dependents.contains(plugin_id) {
                        dep_entry.dependents.push(plugin_id.to_string());
                    }
                }
            }
        }
    }

    /// Add event listener
    pub fn add_event_listener(&self, listener: Arc<dyn PluginEventListener>) {
        self.event_listeners.write().push(listener);
    }

    /// Emit a plugin event
    async fn emit_event(&self, event: PluginEvent) {
        let listeners = self.event_listeners.read().clone();

        for listener in listeners {
            if let Err(e) = listener.on_event(event.clone()).await {
                warn!("Event listener '{}' failed to process event: {}", listener.name(), e);
            }
        }
    }

    /// Execute a plugin with comprehensive monitoring and error handling
    #[instrument(skip(self, request))]
    pub async fn execute_plugin(&self, request: PluginExecutionRequest) -> PluginResult<PluginExecutionResult> {
        let execution_id = Uuid::new_v4();
        let start_time = Instant::now();

        info!(
            "Starting plugin execution: {} (operation: {}, execution: {})",
            request.plugin_id, request.operation, execution_id
        );

        // Acquire execution semaphore
        let _permit = self.execution_semaphore.acquire().await
            .map_err(|e| PluginError::ExecutionFailed {
                error: format!("Failed to acquire execution semaphore: {}", e),
            })?;

        // Emit execution started event
        self.emit_event(PluginEvent::ExecutionStarted {
            plugin_id: request.plugin_id.clone(),
            execution_id,
            timestamp: Utc::now(),
        }).await;

        // Get plugin
        let plugin_ref = self.plugins.get(&request.plugin_id)
            .ok_or_else(|| PluginError::PluginNotFound {
                plugin_id: request.plugin_id.clone(),
            })?
            .clone();

        // Check plugin status
        if let Some(entry) = self.entries.get(&request.plugin_id) {
            match entry.status {
                PluginStatus::Failed => {
                    return Err(PluginError::ExecutionFailed {
                        error: "Plugin is in failed state".to_string(),
                    });
                }
                PluginStatus::Unloaded => {
                    return Err(PluginError::ExecutionFailed {
                        error: "Plugin is not loaded".to_string(),
                    });
                }
                _ => {}
            }
        }

        // Create execution input
        let execution_input = PluginExecutionInput {
            context: request.context,
            data: request.input,
            operation: request.operation,
            parameters: request.tags.into_iter()
                .map(|(k, v)| (k, serde_json::json!(v)))
                .collect(),
            timeout_ms: request.timeout_ms,
        };

        // Execute plugin
        let result = {
            let plugin = plugin_ref.read();

            // Check if plugin is WASM-based and use WASM runtime
            if plugin.metadata().plugin_type == PluginType::WebAssembly {
                drop(plugin); // Release plugin lock
                self.execute_wasm_plugin(&request.plugin_id, execution_input).await
            } else {
                // Execute native plugin
                let timeout_duration = Duration::from_millis(
                    request.timeout_ms.unwrap_or(self.config.execution_timeout_secs * 1000)
                );

                tokio::time::timeout(timeout_duration, plugin.execute(execution_input)).await
                    .map_err(|_| PluginError::ExecutionFailed {
                        error: "Plugin execution timed out".to_string(),
                    })?
            }
        };

        let execution_time = start_time.elapsed();
        let execution_count = self.execution_counter.fetch_add(1, Ordering::SeqCst) + 1;

        // Process execution result
        match result {
            Ok(mut exec_result) => {
                exec_result.execution_id = execution_id;
                exec_result.execution_time_ms = execution_time.as_millis() as u64;

                // Update plugin entry with execution result
                if let Some(mut entry) = self.entries.get_mut(&request.plugin_id) {
                    entry.add_execution_result(exec_result.clone(), self.config.max_execution_history);
                    entry.health.execution_count += 1;
                    entry.health.last_execution = Some(Utc::now());

                    if exec_result.success {
                        entry.health.success_rate = entry.get_success_rate();
                    }

                    entry.health.average_execution_time_ms = entry.get_average_execution_time();
                }

                // Emit execution completed event
                self.emit_event(PluginEvent::ExecutionCompleted {
                    plugin_id: request.plugin_id,
                    execution_id,
                    result: exec_result.clone(),
                }).await;

                info!(
                    "Plugin execution completed: {} in {:?} (success: {})",
                    execution_id, execution_time, exec_result.success
                );

                Ok(exec_result)
            }
            Err(e) => {
                let error_result = PluginExecutionResult {
                    plugin_id: request.plugin_id.clone(),
                    execution_id,
                    success: false,
                    result: None,
                    error: Some(e.to_string()),
                    warnings: Vec::new(),
                    logs: Vec::new(),
                    execution_time_ms: execution_time.as_millis() as u64,
                    memory_used_bytes: 0,
                    cpu_time_ms: 0,
                    created_files: Vec::new(),
                    network_requests: 0,
                    metadata: HashMap::new(),
                };

                // Update plugin entry with error
                if let Some(mut entry) = self.entries.get_mut(&request.plugin_id) {
                    entry.add_execution_result(error_result.clone(), self.config.max_execution_history);
                    entry.health.error_count += 1;
                    entry.health.success_rate = entry.get_success_rate();
                    entry.status = PluginStatus::Failed;
                }

                // Emit execution failed event
                self.emit_event(PluginEvent::ExecutionFailed {
                    plugin_id: request.plugin_id,
                    execution_id,
                    error: e.clone(),
                }).await;

                error!("Plugin execution failed: {} - {}", execution_id, e);
                Err(e)
            }
        }
    }

    /// Execute a WASM plugin using the WASM runtime
    async fn execute_wasm_plugin(
        &self,
        plugin_id: &str,
        input: PluginExecutionInput,
    ) -> PluginResult<PluginExecutionResult> {
        let wasm_runtime = self.wasm_runtime.read().await;
        let runtime = wasm_runtime.as_ref().ok_or_else(|| PluginError::WasmError {
            message: "WASM runtime not initialized".to_string(),
        })?;

        // Find WASM instance for this plugin
        let instances = runtime.list_instances();
        let instance_id = instances.iter()
            .find(|id| id.starts_with(plugin_id))
            .ok_or_else(|| PluginError::PluginNotFound {
                plugin_id: plugin_id.to_string(),
            })?;

        runtime.execute_plugin(instance_id, input).await
    }

    /// Execute plugin for agent integration
    #[instrument(skip(self, context))]
    pub async fn execute_agent_plugin(
        &self,
        plugin_id: &str,
        context: AgentContext,
    ) -> PluginResult<AgentResult> {
        // Get plugin
        let plugin_ref = self.plugins.get(plugin_id)
            .ok_or_else(|| PluginError::PluginNotFound {
                plugin_id: plugin_id.to_string(),
            })?
            .clone();

        let plugin = plugin_ref.read();

        // Check if plugin implements AgentPlugin trait
        if let Some(agent_plugin) = plugin.as_any().downcast_ref::<dyn AgentPlugin>() {
            agent_plugin.execute_agent(context).await
        } else {
            // Fallback: use regular plugin execution and convert to AgentResult
            let plugin_context = PluginContext {
                execution_id: Uuid::new_v4(),
                plugin_id: plugin_id.to_string(),
                environment: std::env::vars().collect(),
                configuration: HashMap::new(),
                working_directory: context.project_path.clone(),
                temp_directory: std::env::temp_dir().to_string_lossy().to_string(),
                permissions: plugin.metadata().permissions.clone(),
                resource_limits: plugin.metadata().resource_limits.clone(),
                metadata: context.metadata.clone().into_iter()
                    .map(|(k, v)| (k, serde_json::json!(v)))
                    .collect(),
                agent_context: Some(context),
            };

            let input = PluginExecutionInput {
                context: plugin_context,
                data: serde_json::json!({}),
                operation: "agent_execute".to_string(),
                parameters: HashMap::new(),
                timeout_ms: Some(300_000), // 5 minutes
            };

            let result = plugin.execute(input).await?;

            // Convert to AgentResult
            Ok(AgentResult {
                agent_name: plugin.metadata().name.clone(),
                success: result.success,
                message: result.error.unwrap_or_else(|| "Success".to_string()),
                data: result.result.map(|v| v.to_string()),
                errors: if let Some(error) = result.error {
                    vec![error]
                } else {
                    Vec::new()
                },
                warnings: result.warnings,
                execution_time_ms: result.execution_time_ms as i64,
            })
        }
    }

    /// Get plugin by ID
    pub fn get_plugin(&self, plugin_id: &str) -> Option<Arc<RwLock<Box<dyn Plugin>>>> {
        self.plugins.get(plugin_id).map(|entry| entry.value().clone())
    }

    /// Get plugin registry entry
    pub fn get_plugin_entry(&self, plugin_id: &str) -> Option<PluginRegistryEntry> {
        self.entries.get(plugin_id).map(|entry| entry.value().clone())
    }

    /// List all plugins
    pub fn list_plugins(&self) -> Vec<String> {
        self.entries.iter().map(|entry| entry.key().clone()).collect()
    }

    /// List plugins by status
    pub fn list_plugins_by_status(&self, status: PluginStatus) -> Vec<String> {
        self.entries
            .iter()
            .filter(|entry| entry.value().status == status)
            .map(|entry| entry.key().clone())
            .collect()
    }

    /// Get plugin health
    pub fn get_plugin_health(&self, plugin_id: &str) -> Option<PluginHealth> {
        self.entries.get(plugin_id).map(|entry| entry.value().health.clone())
    }

    /// Update plugin status
    pub fn update_plugin_status(&self, plugin_id: &str, status: PluginStatus) {
        if let Some(mut entry) = self.entries.get_mut(plugin_id) {
            entry.status = status.clone();
            entry.health.status = status;
            entry.updated_at = Utc::now();
        }
    }

    /// Start health monitoring background task
    async fn start_health_monitoring(&mut self) {
        let entries = self.entries.clone();
        let plugins = self.plugins.clone();
        let event_emitter = Arc::new({
            let listeners = self.event_listeners.clone();
            move |event: PluginEvent| {
                let listeners = listeners.clone();
                Box::pin(async move {
                    let listeners_read = listeners.read().clone();
                    for listener in listeners_read {
                        let _ = listener.on_event(event.clone()).await;
                    }
                })
            }
        });

        let interval_secs = self.config.health_check_interval_secs;
        let max_failed_checks = self.config.max_failed_health_checks;
        let auto_restart = self.config.auto_restart_failed_plugins;

        let handle = tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(interval_secs));

            loop {
                interval.tick().await;

                let plugin_ids: Vec<String> = entries.iter()
                    .map(|entry| entry.key().clone())
                    .collect();

                for plugin_id in plugin_ids {
                    if let Some(plugin_ref) = plugins.get(&plugin_id) {
                        let health = {
                            let plugin = plugin_ref.read();
                            plugin.health()
                        };

                        // Update entry with current health
                        if let Some(mut entry) = entries.get_mut(&plugin_id) {
                            entry.update_health(health.clone());

                            // Check if plugin needs restart
                            if auto_restart && entry.failed_health_checks >= max_failed_checks {
                                if entry.restart_count < 3 { // Max restart attempts
                                    warn!("Attempting to restart failed plugin: {}", plugin_id);
                                    entry.restart_count += 1;
                                    entry.last_restart = Some(Utc::now());
                                    entry.failed_health_checks = 0;
                                    // TODO: Implement plugin restart logic
                                }
                            }
                        }

                        // Emit health check event
                        let event = PluginEvent::HealthCheck {
                            plugin_id: plugin_id.clone(),
                            health,
                        };
                        event_emitter(event).await;
                    }
                }
            }
        });

        self.health_check_handle = Some(handle);
        info!("Started plugin health monitoring");
    }

    /// Start metrics collection background task
    async fn start_metrics_collection(&mut self) {
        let entries = self.entries.clone();
        let metrics_collector = self.metrics_collector.clone();
        let execution_counter = self.execution_counter.clone();
        let interval_secs = self.config.metrics_interval_secs;

        let handle = tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(interval_secs));

            loop {
                interval.tick().await;

                let mut metrics = HashMap::new();

                // Global metrics
                metrics.insert("total_plugins".to_string(), serde_json::json!(entries.len()));
                metrics.insert("total_executions".to_string(), serde_json::json!(execution_counter.load(Ordering::SeqCst)));

                // Plugin-specific metrics
                let mut plugin_metrics = HashMap::new();
                for entry in entries.iter() {
                    let plugin_id = entry.key().clone();
                    let entry_data = entry.value();

                    let mut plugin_data = HashMap::new();
                    plugin_data.insert("status".to_string(), serde_json::json!(entry_data.status));
                    plugin_data.insert("execution_count".to_string(), serde_json::json!(entry_data.health.execution_count));
                    plugin_data.insert("success_rate".to_string(), serde_json::json!(entry_data.health.success_rate));
                    plugin_data.insert("average_execution_time_ms".to_string(), serde_json::json!(entry_data.health.average_execution_time_ms));
                    plugin_data.insert("error_count".to_string(), serde_json::json!(entry_data.health.error_count));
                    plugin_data.insert("restart_count".to_string(), serde_json::json!(entry_data.restart_count));

                    plugin_metrics.insert(plugin_id, serde_json::json!(plugin_data));
                }

                metrics.insert("plugins".to_string(), serde_json::json!(plugin_metrics));
                metrics.insert("collected_at".to_string(), serde_json::json!(Utc::now()));

                // Store metrics
                *metrics_collector.write() = metrics;
            }
        });

        self.metrics_handle = Some(handle);
        info!("Started plugin metrics collection");
    }

    /// Get current metrics
    pub fn get_metrics(&self) -> HashMap<String, serde_json::Value> {
        self.metrics_collector.read().clone()
    }

    /// Shutdown the registry
    pub async fn shutdown(&mut self) -> PluginResult<()> {
        info!("Shutting down plugin registry");

        // Stop background tasks
        if let Some(handle) = self.health_check_handle.take() {
            handle.abort();
        }
        if let Some(handle) = self.metrics_handle.take() {
            handle.abort();
        }

        // Shutdown all plugins
        let plugin_ids: Vec<String> = self.plugins.iter()
            .map(|entry| entry.key().clone())
            .collect();

        for plugin_id in plugin_ids {
            if let Some((_, plugin_ref)) = self.plugins.remove(&plugin_id) {
                let mut plugin = plugin_ref.write();
                if let Err(e) = plugin.shutdown().await {
                    warn!("Failed to shutdown plugin {}: {}", plugin_id, e);
                }
            }
        }

        info!("Plugin registry shutdown completed");
        Ok(())
    }
}

impl Drop for PluginRegistry {
    fn drop(&mut self) {
        // Abort background tasks if they're still running
        if let Some(handle) = self.health_check_handle.take() {
            handle.abort();
        }
        if let Some(handle) = self.metrics_handle.take() {
            handle.abort();
        }
    }
}