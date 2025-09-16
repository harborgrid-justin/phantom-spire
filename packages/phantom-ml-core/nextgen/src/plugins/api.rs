//! Plugin API Abstractions and Agent Communication
//!
//! Provides high-level API abstractions for plugin management, agent integration,
//! and inter-plugin communication with type safety and comprehensive error handling.

use super::*;
use crate::agents::{Agent, AgentContext, AgentResult};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tracing::{debug, error, info, instrument, warn};

/// High-level plugin API for managing the plugin system
pub struct PluginApi {
    registry: Arc<RwLock<crate::plugins::registry::PluginRegistry>>,
    config_manager: Arc<RwLock<crate::plugins::config::ConfigManager>>,
    marketplace_client: Arc<RwLock<Option<crate::plugins::marketplace::MarketplaceClient>>>,
    message_router: Arc<MessageRouter>,
    execution_queue: Arc<ExecutionQueue>,
}

impl PluginApi {
    /// Create a new plugin API instance
    pub fn new(
        registry: crate::plugins::registry::PluginRegistry,
        config_manager: crate::plugins::config::ConfigManager,
    ) -> PluginResult<Self> {
        Ok(Self {
            registry: Arc::new(RwLock::new(registry)),
            config_manager: Arc::new(RwLock::new(config_manager)),
            marketplace_client: Arc::new(RwLock::new(None)),
            message_router: Arc::new(MessageRouter::new()),
            execution_queue: Arc::new(ExecutionQueue::new()),
        })
    }

    /// Initialize the plugin API
    pub async fn initialize(&self) -> PluginResult<()> {
        info!("Initializing plugin API");

        // Initialize registry
        {
            let mut registry = self.registry.write().await;
            registry.initialize().await?;
        }

        // Load configurations
        {
            let mut config_manager = self.config_manager.write().await;
            config_manager.load_configurations().await?;
        }

        // Start message router
        self.message_router.start().await?;

        info!("Plugin API initialized successfully");
        Ok(())
    }

    /// Set marketplace client
    pub async fn set_marketplace_client(
        &self,
        client: crate::plugins::marketplace::MarketplaceClient,
    ) {
        *self.marketplace_client.write().await = Some(client);
    }

    /// List all available plugins
    pub async fn list_plugins(&self) -> Vec<String> {
        let registry = self.registry.read().await;
        registry.list_plugins()
    }

    /// Get plugin information
    pub async fn get_plugin_info(&self, plugin_id: &str) -> Option<PluginMetadata> {
        let registry = self.registry.read().await;
        registry.get_plugin_entry(plugin_id)
            .map(|entry| entry.metadata)
    }

    /// Execute plugin with simplified interface
    #[instrument(skip(self, input))]
    pub async fn execute_plugin(
        &self,
        plugin_id: &str,
        operation: &str,
        input: serde_json::Value,
    ) -> PluginResult<serde_json::Value> {
        info!("Executing plugin: {} (operation: {})", plugin_id, operation);

        let registry = self.registry.read().await;

        // Get plugin configuration
        let config = {
            let config_manager = self.config_manager.read().await;
            config_manager.get_plugin_config(plugin_id)
                .unwrap_or_default()
        };

        // Create execution context
        let context = PluginContext {
            execution_id: Uuid::new_v4(),
            plugin_id: plugin_id.to_string(),
            environment: std::env::vars().collect(),
            configuration: config,
            working_directory: std::env::current_dir()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string(),
            temp_directory: std::env::temp_dir()
                .to_string_lossy()
                .to_string(),
            permissions: Vec::new(), // TODO: Get from plugin metadata
            resource_limits: ResourceLimits::default(),
            metadata: HashMap::new(),
            agent_context: None,
        };

        // Create execution request
        let request = crate::plugins::registry::PluginExecutionRequest {
            plugin_id: plugin_id.to_string(),
            operation: operation.to_string(),
            input,
            context,
            timeout_ms: Some(30_000), // 30 seconds default
            priority: 0,
            tags: HashMap::new(),
        };

        // Execute plugin
        let result = registry.execute_plugin(request).await?;

        if result.success {
            Ok(result.result.unwrap_or_else(|| serde_json::json!({})))
        } else {
            Err(PluginError::ExecutionFailed {
                error: result.error.unwrap_or_else(|| "Unknown error".to_string()),
            })
        }
    }

    /// Execute plugin for agent integration
    #[instrument(skip(self, context))]
    pub async fn execute_agent_plugin(
        &self,
        plugin_id: &str,
        context: AgentContext,
    ) -> PluginResult<AgentResult> {
        info!("Executing agent plugin: {}", plugin_id);

        let registry = self.registry.read().await;
        registry.execute_agent_plugin(plugin_id, context).await
    }

    /// Install plugin from marketplace
    #[instrument(skip(self))]
    pub async fn install_plugin(
        &self,
        plugin_id: &str,
        version: Option<&str>,
        target_directory: &std::path::Path,
    ) -> PluginResult<crate::plugins::marketplace::InstallationResult> {
        info!("Installing plugin: {} to {:?}", plugin_id, target_directory);

        let marketplace_client = self.marketplace_client.read().await;
        let client = marketplace_client
            .as_ref()
            .ok_or_else(|| PluginError::ApiError {
                message: "Marketplace client not configured".to_string(),
            })?;

        let request = crate::plugins::marketplace::InstallationRequest {
            plugin_id: plugin_id.to_string(),
            version: version.map(|v| v.to_string()),
            target_directory: target_directory.to_path_buf(),
            options: crate::plugins::marketplace::InstallationOptions::default(),
            force_install: false,
            install_dependencies: true,
        };

        client.install_plugin(request).await
    }

    /// Search plugins in marketplace
    pub async fn search_marketplace(
        &self,
        query: &str,
        limit: Option<u32>,
    ) -> PluginResult<crate::plugins::marketplace::SearchResults> {
        let marketplace_client = self.marketplace_client.read().await;
        let client = marketplace_client
            .as_ref()
            .ok_or_else(|| PluginError::ApiError {
                message: "Marketplace client not configured".to_string(),
            })?;

        let criteria = crate::plugins::marketplace::SearchCriteria {
            query: Some(query.to_string()),
            category: None,
            tags: Vec::new(),
            author: None,
            min_rating: None,
            max_price: None,
            plugin_type: None,
            license: None,
            sort_by: crate::plugins::marketplace::SearchSortBy::Relevance,
            limit,
            offset: None,
        };

        client.search_plugins(criteria).await
    }

    /// Update plugin configuration
    pub async fn update_plugin_config(
        &self,
        plugin_id: &str,
        updates: HashMap<String, serde_json::Value>,
    ) -> PluginResult<()> {
        let mut config_manager = self.config_manager.write().await;
        config_manager.update_plugin_config(plugin_id, updates).await
    }

    /// Get plugin health status
    pub async fn get_plugin_health(&self, plugin_id: &str) -> Option<PluginHealth> {
        let registry = self.registry.read().await;
        registry.get_plugin_health(plugin_id)
    }

    /// Get system metrics
    pub async fn get_metrics(&self) -> HashMap<String, serde_json::Value> {
        let registry = self.registry.read().await;
        registry.get_metrics()
    }

    /// Send message between plugins
    pub async fn send_plugin_message(
        &self,
        sender: &str,
        recipient: &str,
        message_type: &str,
        payload: serde_json::Value,
    ) -> PluginResult<()> {
        let message = PluginMessage {
            id: Uuid::new_v4(),
            sender: sender.to_string(),
            recipient: recipient.to_string(),
            message_type: message_type.to_string(),
            payload,
            timestamp: Utc::now(),
            reply_to: None,
        };

        self.message_router.route_message(message).await
    }

    /// Subscribe to plugin events
    pub async fn subscribe_to_events(
        &self,
        listener: Arc<dyn PluginEventListener>,
    ) {
        let registry = self.registry.read().await;
        registry.add_event_listener(listener);
    }

    /// Shutdown the plugin system
    pub async fn shutdown(&self) -> PluginResult<()> {
        info!("Shutting down plugin API");

        // Stop message router
        self.message_router.stop().await?;

        // Shutdown registry
        {
            let mut registry = self.registry.write().await;
            registry.shutdown().await?;
        }

        info!("Plugin API shutdown completed");
        Ok(())
    }
}

/// Message router for inter-plugin communication
pub struct MessageRouter {
    message_handlers: RwLock<HashMap<String, Vec<MessageHandler>>>,
    message_tx: Option<mpsc::UnboundedSender<PluginMessage>>,
    router_handle: Option<tokio::task::JoinHandle<()>>,
}

type MessageHandler = Arc<dyn Fn(PluginMessage) -> std::pin::Pin<Box<dyn std::future::Future<Output = PluginResult<()>> + Send>> + Send + Sync>;

impl MessageRouter {
    pub fn new() -> Self {
        Self {
            message_handlers: RwLock::new(HashMap::new()),
            message_tx: None,
            router_handle: None,
        }
    }

    /// Start the message router
    pub async fn start(&self) -> PluginResult<()> {
        info!("Starting plugin message router");

        let (tx, mut rx) = mpsc::unbounded_channel();
        let handlers = self.message_handlers.clone();

        let handle = tokio::spawn(async move {
            while let Some(message) = rx.recv().await {
                let handlers_read = handlers.read().await;
                if let Some(plugin_handlers) = handlers_read.get(&message.recipient) {
                    for handler in plugin_handlers {
                        if let Err(e) = handler(message.clone()).await {
                            error!("Message handler failed: {}", e);
                        }
                    }
                } else {
                    warn!("No message handlers found for plugin: {}", message.recipient);
                }
            }
        });

        // This is not ideal - we need to store the sender and handle somewhere accessible
        // In a real implementation, you'd use Arc<Mutex<Option<T>>> or similar
        info!("Plugin message router started");
        Ok(())
    }

    /// Stop the message router
    pub async fn stop(&self) -> PluginResult<()> {
        info!("Stopping plugin message router");
        Ok(())
    }

    /// Register a message handler for a plugin
    pub async fn register_handler<F, Fut>(
        &self,
        plugin_id: &str,
        handler: F,
    ) where
        F: Fn(PluginMessage) -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = PluginResult<()>> + Send + 'static,
    {
        let wrapped_handler = Arc::new(move |message: PluginMessage| {
            let handler_ref = &handler;
            Box::pin(handler_ref(message))
        });

        let mut handlers = self.message_handlers.write().await;
        handlers
            .entry(plugin_id.to_string())
            .or_insert_with(Vec::new)
            .push(wrapped_handler);
    }

    /// Route a message to its destination
    pub async fn route_message(&self, message: PluginMessage) -> PluginResult<()> {
        debug!("Routing message from {} to {}", message.sender, message.recipient);

        if let Some(tx) = &self.message_tx {
            tx.send(message)
                .map_err(|e| PluginError::ApiError {
                    message: format!("Failed to route message: {}", e),
                })?;
        } else {
            return Err(PluginError::ApiError {
                message: "Message router not started".to_string(),
            });
        }

        Ok(())
    }
}

/// Execution queue for managing plugin execution order and priorities
pub struct ExecutionQueue {
    queue: RwLock<Vec<QueuedExecution>>,
    processing: RwLock<bool>,
}

#[derive(Debug, Clone)]
struct QueuedExecution {
    plugin_id: String,
    operation: String,
    priority: i32,
    queued_at: DateTime<Utc>,
    timeout_at: DateTime<Utc>,
}

impl ExecutionQueue {
    pub fn new() -> Self {
        Self {
            queue: RwLock::new(Vec::new()),
            processing: RwLock::new(false),
        }
    }

    /// Add execution to queue
    pub async fn queue_execution(
        &self,
        plugin_id: String,
        operation: String,
        priority: i32,
        timeout_secs: u64,
    ) -> PluginResult<()> {
        let queued_execution = QueuedExecution {
            plugin_id,
            operation,
            priority,
            queued_at: Utc::now(),
            timeout_at: Utc::now() + chrono::Duration::seconds(timeout_secs as i64),
        };

        let mut queue = self.queue.write().await;
        queue.push(queued_execution);

        // Sort by priority (higher priority first)
        queue.sort_by(|a, b| b.priority.cmp(&a.priority));

        Ok(())
    }

    /// Process queued executions
    pub async fn process_queue(&self) -> PluginResult<()> {
        let mut processing = self.processing.write().await;
        if *processing {
            return Ok(()); // Already processing
        }
        *processing = true;
        drop(processing);

        let mut queue = self.queue.write().await;
        let now = Utc::now();

        // Remove expired items
        queue.retain(|item| item.timeout_at > now);

        // Process items (simplified - in practice, you'd execute them)
        for item in queue.drain(..) {
            debug!("Processing queued execution: {} - {}", item.plugin_id, item.operation);
            // TODO: Actually execute the plugin
        }

        *self.processing.write().await = false;
        Ok(())
    }
}

/// Plugin adapter for integrating plugins with the existing agent system
pub struct PluginAgentAdapter {
    plugin_api: Arc<PluginApi>,
    plugin_id: String,
    agent_metadata: crate::agents::AgentConfig,
}

impl PluginAgentAdapter {
    pub fn new(
        plugin_api: Arc<PluginApi>,
        plugin_id: String,
        agent_metadata: crate::agents::AgentConfig,
    ) -> Self {
        Self {
            plugin_api,
            plugin_id,
            agent_metadata,
        }
    }
}

#[async_trait]
impl Agent for PluginAgentAdapter {
    fn name(&self) -> String {
        self.agent_metadata.name.clone()
    }

    fn version(&self) -> String {
        self.agent_metadata.version.clone()
    }

    fn description(&self) -> String {
        format!("Plugin adapter for: {}", self.plugin_id)
    }

    async fn execute(
        &self,
        context: AgentContext,
    ) -> Result<AgentResult, crate::agents::AgentError> {
        self.plugin_api
            .execute_agent_plugin(&self.plugin_id, context)
            .await
            .map_err(|e| crate::agents::AgentError {
                code: "PLUGIN_ERROR".to_string(),
                message: e.to_string(),
                details: None,
            })
    }

    fn validate_config(
        &self,
        config: &HashMap<String, String>,
    ) -> Result<(), Vec<String>> {
        // Basic validation - plugin-specific validation would be handled by the plugin
        if config.is_empty() {
            return Err(vec!["Configuration cannot be empty".to_string()]);
        }
        Ok(())
    }
}

/// Builder for creating plugin configurations
pub struct PluginConfigBuilder {
    plugin_id: String,
    config: HashMap<String, serde_json::Value>,
    environment_configs: HashMap<crate::plugins::config::ConfigEnvironment, HashMap<String, serde_json::Value>>,
    schema: Option<serde_json::Value>,
}

impl PluginConfigBuilder {
    pub fn new(plugin_id: String) -> Self {
        Self {
            plugin_id,
            config: HashMap::new(),
            environment_configs: HashMap::new(),
            schema: None,
        }
    }

    pub fn set<K, V>(mut self, key: K, value: V) -> Self
    where
        K: Into<String>,
        V: Into<serde_json::Value>,
    {
        self.config.insert(key.into(), value.into());
        self
    }

    pub fn set_for_environment<K, V>(
        mut self,
        environment: crate::plugins::config::ConfigEnvironment,
        key: K,
        value: V,
    ) -> Self
    where
        K: Into<String>,
        V: Into<serde_json::Value>,
    {
        self.environment_configs
            .entry(environment)
            .or_insert_with(HashMap::new)
            .insert(key.into(), value.into());
        self
    }

    pub fn schema(mut self, schema: serde_json::Value) -> Self {
        self.schema = Some(schema);
        self
    }

    pub fn build(self) -> crate::plugins::config::PluginConfig {
        let mut plugin_config = crate::plugins::config::PluginConfig::new(self.plugin_id);

        for (key, value) in self.config {
            plugin_config.set_base_config(key, value);
        }

        for (env, env_config) in self.environment_configs {
            for (key, value) in env_config {
                plugin_config.set_environment_config(env.clone(), key, value);
            }
        }

        plugin_config.schema = self.schema;
        plugin_config
    }
}

/// Utility functions for plugin development
pub mod utils {
    use super::*;

    /// Create a simple plugin execution result
    pub fn create_success_result(
        plugin_id: &str,
        result_data: serde_json::Value,
    ) -> PluginExecutionResult {
        PluginExecutionResult {
            plugin_id: plugin_id.to_string(),
            execution_id: Uuid::new_v4(),
            success: true,
            result: Some(result_data),
            error: None,
            warnings: Vec::new(),
            logs: Vec::new(),
            execution_time_ms: 0,
            memory_used_bytes: 0,
            cpu_time_ms: 0,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        }
    }

    /// Create a plugin execution error result
    pub fn create_error_result(
        plugin_id: &str,
        error_message: &str,
    ) -> PluginExecutionResult {
        PluginExecutionResult {
            plugin_id: plugin_id.to_string(),
            execution_id: Uuid::new_v4(),
            success: false,
            result: None,
            error: Some(error_message.to_string()),
            warnings: Vec::new(),
            logs: Vec::new(),
            execution_time_ms: 0,
            memory_used_bytes: 0,
            cpu_time_ms: 0,
            created_files: Vec::new(),
            network_requests: 0,
            metadata: HashMap::new(),
        }
    }

    /// Validate plugin metadata
    pub fn validate_plugin_metadata(metadata: &PluginMetadata) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();

        if metadata.id.is_empty() {
            errors.push("Plugin ID cannot be empty".to_string());
        }

        if metadata.name.is_empty() {
            errors.push("Plugin name cannot be empty".to_string());
        }

        if metadata.version.to_string().is_empty() {
            errors.push("Plugin version cannot be empty".to_string());
        }

        if metadata.author.is_empty() {
            errors.push("Plugin author cannot be empty".to_string());
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Convert plugin error to agent error
    pub fn plugin_error_to_agent_error(plugin_error: PluginError) -> crate::agents::AgentError {
        match plugin_error {
            PluginError::PluginNotFound { plugin_id } => crate::agents::AgentError {
                code: "PLUGIN_NOT_FOUND".to_string(),
                message: format!("Plugin not found: {}", plugin_id),
                details: None,
            },
            PluginError::ExecutionFailed { error } => crate::agents::AgentError {
                code: "PLUGIN_EXECUTION_FAILED".to_string(),
                message: error,
                details: None,
            },
            _ => crate::agents::AgentError {
                code: "PLUGIN_ERROR".to_string(),
                message: plugin_error.to_string(),
                details: None,
            },
        }
    }
}