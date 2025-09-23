//! Plugin loading and management system
//!
//! Provides comprehensive plugin loading capabilities including:
//! - Dynamic library loading for native Rust plugins
//! - Hot-reloading with file system watching
//! - Plugin validation and security checks
//! - Dependency resolution and loading order

use super::*;
use anyhow::{Context, Result as AnyhowResult};
use dashmap::DashMap;
use libloading::{Library, Symbol};
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use parking_lot::RwLock;
use sha2::{Digest, Sha256};
use std::collections::VecDeque;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tokio::fs;
use tokio::sync::{mpsc, Mutex, RwLock as TokioRwLock};
use tracing::{debug, error, info, instrument, warn};

/// Plugin loader configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoaderConfig {
    /// Plugin directories to scan
    pub plugin_directories: Vec<PathBuf>,
    /// Enable hot reloading
    pub hot_reload_enabled: bool,
    /// Hot reload check interval in seconds
    pub hot_reload_interval_secs: u64,
    /// Maximum plugin load time in seconds
    pub max_load_time_secs: u64,
    /// Enable plugin signature verification
    pub signature_verification: bool,
    /// Trusted signing keys
    pub trusted_keys: Vec<String>,
    /// Maximum number of concurrent plugin loads
    pub max_concurrent_loads: usize,
    /// Plugin cache directory
    pub cache_directory: Option<PathBuf>,
    /// Enable plugin sandboxing
    pub sandboxing_enabled: bool,
}

impl Default for LoaderConfig {
    fn default() -> Self {
        Self {
            plugin_directories: vec![PathBuf::from("plugins")],
            hot_reload_enabled: true,
            hot_reload_interval_secs: 5,
            max_load_time_secs: 30,
            signature_verification: true,
            trusted_keys: Vec::new(),
            max_concurrent_loads: 4,
            cache_directory: None,
            sandboxing_enabled: true,
        }
    }
}

/// Plugin load state tracking
#[derive(Debug, Clone)]
struct PluginLoadState {
    plugin_id: String,
    path: PathBuf,
    last_modified: SystemTime,
    checksum: String,
    load_count: u64,
    last_loaded: SystemTime,
    library: Option<Arc<Library>>,
}

/// Plugin dependency graph for load ordering
#[derive(Debug)]
struct DependencyGraph {
    nodes: HashMap<String, Vec<String>>, // plugin_id -> dependencies
    resolved: Vec<String>,              // topologically sorted plugin IDs
}

impl DependencyGraph {
    fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            resolved: Vec::new(),
        }
    }

    fn add_plugin(&mut self, plugin_id: String, dependencies: Vec<String>) {
        self.nodes.insert(plugin_id, dependencies);
    }

    fn resolve(&mut self) -> PluginResult<Vec<String>> {
        let mut resolved = Vec::new();
        let mut visiting = std::collections::HashSet::new();
        let mut visited = std::collections::HashSet::new();

        for plugin_id in self.nodes.keys() {
            if !visited.contains(plugin_id) {
                self.visit_node(plugin_id, &mut visiting, &mut visited, &mut resolved)?;
            }
        }

        self.resolved = resolved.clone();
        Ok(resolved)
    }

    fn visit_node(
        &self,
        plugin_id: &str,
        visiting: &mut std::collections::HashSet<String>,
        visited: &mut std::collections::HashSet<String>,
        resolved: &mut Vec<String>,
    ) -> PluginResult<()> {
        if visiting.contains(plugin_id) {
            return Err(PluginError::ValidationFailed {
                errors: vec![format!("Circular dependency detected involving plugin: {}", plugin_id)],
            });
        }

        if visited.contains(plugin_id) {
            return Ok(());
        }

        visiting.insert(plugin_id.to_string());

        if let Some(dependencies) = self.nodes.get(plugin_id) {
            for dep in dependencies {
                self.visit_node(dep, visiting, visited, resolved)?;
            }
        }

        visiting.remove(plugin_id);
        visited.insert(plugin_id.to_string());
        resolved.push(plugin_id.to_string());

        Ok(())
    }
}

/// Plugin loader with comprehensive loading and management capabilities
pub struct PluginLoader {
    config: LoaderConfig,
    loaded_plugins: Arc<DashMap<String, Arc<RwLock<Box<dyn Plugin>>>>>,
    plugin_states: Arc<RwLock<HashMap<String, PluginLoadState>>>,
    factories: Arc<RwLock<HashMap<PluginType, Box<dyn PluginFactory>>>>,
    load_counter: Arc<AtomicU64>,
    hot_reload_watcher: Option<RecommendedWatcher>,
    event_tx: Option<mpsc::UnboundedSender<notify::Event>>,
    dependency_graph: Arc<RwLock<DependencyGraph>>,
    load_semaphore: Arc<tokio::sync::Semaphore>,
}

impl PluginLoader {
    /// Create a new plugin loader with the given configuration
    pub fn new(config: LoaderConfig) -> AnyhowResult<Self> {
        let load_semaphore = Arc::new(tokio::sync::Semaphore::new(config.max_concurrent_loads));

        Ok(Self {
            config,
            loaded_plugins: Arc::new(DashMap::new()),
            plugin_states: Arc::new(RwLock::new(HashMap::new())),
            factories: Arc::new(RwLock::new(HashMap::new())),
            load_counter: Arc::new(AtomicU64::new(0)),
            hot_reload_watcher: None,
            event_tx: None,
            dependency_graph: Arc::new(RwLock::new(DependencyGraph::new())),
            load_semaphore,
        })
    }

    /// Register a plugin factory for a specific plugin type
    pub fn register_factory<F>(&self, plugin_type: PluginType, factory: F)
    where
        F: PluginFactory + 'static,
    {
        let mut factories = self.factories.write();
        factories.insert(plugin_type, Box::new(factory));
    }

    /// Initialize the plugin loader and start hot reloading if enabled
    #[instrument(skip(self))]
    pub async fn initialize(&mut self) -> PluginResult<()> {
        info!("Initializing plugin loader");

        // Create plugin directories if they don't exist
        for dir in &self.config.plugin_directories {
            if !dir.exists() {
                fs::create_dir_all(dir).await?;
                info!("Created plugin directory: {:?}", dir);
            }
        }

        // Create cache directory if specified
        if let Some(cache_dir) = &self.config.cache_directory {
            if !cache_dir.exists() {
                fs::create_dir_all(cache_dir).await?;
                info!("Created cache directory: {:?}", cache_dir);
            }
        }

        // Set up hot reloading if enabled
        if self.config.hot_reload_enabled {
            self.setup_hot_reload().await?;
        }

        // Initial plugin discovery and loading
        self.discover_and_load_plugins().await?;

        info!("Plugin loader initialized successfully");
        Ok(())
    }

    /// Discover and load all plugins
    #[instrument(skip(self))]
    pub async fn discover_and_load_plugins(&self) -> PluginResult<()> {
        info!("Starting plugin discovery and loading");

        // Discover all plugin manifests
        let mut plugin_manifests = Vec::new();
        for dir in &self.config.plugin_directories {
            let manifests = self.discover_plugin_manifests(dir).await?;
            plugin_manifests.extend(manifests);
        }

        info!("Discovered {} plugin manifests", plugin_manifests.len());

        // Build dependency graph
        let mut dep_graph = DependencyGraph::new();
        for (metadata, _) in &plugin_manifests {
            let dependencies: Vec<String> = metadata
                .dependencies
                .iter()
                .map(|dep| dep.name.clone())
                .collect();
            dep_graph.add_plugin(metadata.id.clone(), dependencies);
        }

        // Resolve load order
        let load_order = dep_graph.resolve()?;
        *self.dependency_graph.write() = dep_graph;

        info!("Resolved plugin load order: {:?}", load_order);

        // Load plugins in dependency order
        for plugin_id in load_order {
            if let Some((metadata, path)) = plugin_manifests
                .iter()
                .find(|(meta, _)| meta.id == plugin_id)
            {
                if let Err(e) = self.load_plugin(metadata.clone(), path.clone()).await {
                    error!("Failed to load plugin {}: {}", plugin_id, e);
                    // Continue loading other plugins even if one fails
                }
            }
        }

        info!("Plugin discovery and loading completed");
        Ok(())
    }

    /// Discover plugin manifests in a directory
    #[instrument(skip(self))]
    async fn discover_plugin_manifests(
        &self,
        directory: &Path,
    ) -> PluginResult<Vec<(PluginMetadata, PathBuf)>> {
        let mut manifests = Vec::new();

        let mut entries = fs::read_dir(directory).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();

            if path.is_dir() {
                // Look for plugin.toml in subdirectories
                let manifest_path = path.join("plugin.toml");
                if manifest_path.exists() {
                    match self.load_plugin_manifest(&manifest_path).await {
                        Ok(metadata) => {
                            manifests.push((metadata, path));
                        }
                        Err(e) => {
                            warn!("Failed to load manifest at {:?}: {}", manifest_path, e);
                        }
                    }
                }
            } else if path.extension() == Some(OsStr::new("toml")) {
                // Standalone plugin manifest
                match self.load_plugin_manifest(&path).await {
                    Ok(metadata) => {
                        let plugin_dir = path.parent().unwrap_or(directory);
                        manifests.push((metadata, plugin_dir.to_path_buf()));
                    }
                    Err(e) => {
                        warn!("Failed to load manifest at {:?}: {}", path, e);
                    }
                }
            }
        }

        Ok(manifests)
    }

    /// Load a plugin manifest from a TOML file
    #[instrument(skip(self))]
    async fn load_plugin_manifest(&self, manifest_path: &Path) -> PluginResult<PluginMetadata> {
        debug!("Loading plugin manifest: {:?}", manifest_path);

        let content = fs::read_to_string(manifest_path).await?;
        let manifest: toml::Value = toml::from_str(&content)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("manifest parse error: {}", e),
            })?;

        // Parse manifest into metadata
        self.parse_manifest_toml(manifest).await
    }

    /// Parse TOML manifest into PluginMetadata
    async fn parse_manifest_toml(&self, manifest: toml::Value) -> PluginResult<PluginMetadata> {
        let plugin_section = manifest
            .get("plugin")
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing [plugin] section".to_string(),
            })?;

        let id = plugin_section
            .get("id")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing plugin.id".to_string(),
            })?
            .to_string();

        let name = plugin_section
            .get("name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing plugin.name".to_string(),
            })?
            .to_string();

        let version_str = plugin_section
            .get("version")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing plugin.version".to_string(),
            })?;

        let version = Version::parse(version_str).map_err(|e| PluginError::ConfigurationInvalid {
            field: format!("invalid version format: {}", e),
        })?;

        let plugin_type_str = plugin_section
            .get("type")
            .and_then(|v| v.as_str())
            .unwrap_or("native");

        let plugin_type = match plugin_type_str {
            "native" => PluginType::Native,
            "wasm" | "webassembly" => PluginType::WebAssembly,
            "javascript" | "js" => PluginType::JavaScript,
            _ => {
                return Err(PluginError::ConfigurationInvalid {
                    field: format!("unsupported plugin type: {}", plugin_type_str),
                })
            }
        };

        let description = plugin_section
            .get("description")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let author = plugin_section
            .get("author")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();

        let license = plugin_section
            .get("license")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();

        let entry_point = plugin_section
            .get("entry_point")
            .and_then(|v| v.as_str())
            .unwrap_or("main")
            .to_string();

        // Parse dependencies
        let dependencies = if let Some(deps) = manifest.get("dependencies") {
            self.parse_dependencies(deps)?
        } else {
            Vec::new()
        };

        // Parse required API version
        let api_version_str = plugin_section
            .get("required_api_version")
            .and_then(|v| v.as_str())
            .unwrap_or("1.0.0");

        let required_api_version = Version::parse(api_version_str)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("invalid required_api_version: {}", e),
            })?;

        // Parse permissions
        let permissions = if let Some(perms) = manifest.get("permissions") {
            self.parse_permissions(perms)?
        } else {
            Vec::new()
        };

        // Parse resource limits
        let resource_limits = if let Some(limits) = manifest.get("resource_limits") {
            self.parse_resource_limits(limits)?
        } else {
            ResourceLimits::default()
        };

        // Parse tags
        let tags = if let Some(tag_array) = manifest.get("tags") {
            tag_array
                .as_array()
                .unwrap_or(&Vec::new())
                .iter()
                .filter_map(|v| v.as_str())
                .map(|s| s.to_string())
                .collect()
        } else {
            Vec::new()
        };

        let now = Utc::now();

        Ok(PluginMetadata {
            id,
            name,
            description,
            version,
            author,
            license,
            plugin_type,
            entry_point,
            dependencies,
            required_api_version,
            permissions,
            resource_limits,
            tags,
            created_at: now,
            updated_at: now,
            checksum: String::new(), // Will be calculated later
            signature: None,
            configuration_schema: manifest.get("configuration").cloned()
                .map(|v| serde_json::to_value(v).unwrap_or_else(|_| serde_json::json!({}))),
        })
    }

    /// Parse dependencies from TOML
    fn parse_dependencies(&self, deps: &toml::Value) -> PluginResult<Vec<PluginDependency>> {
        let mut dependencies = Vec::new();

        if let Some(deps_table) = deps.as_table() {
            for (name, version_spec) in deps_table {
                let version_requirement = if let Some(version_str) = version_spec.as_str() {
                    version_str.to_string()
                } else if let Some(dep_table) = version_spec.as_table() {
                    dep_table
                        .get("version")
                        .and_then(|v| v.as_str())
                        .unwrap_or("*")
                        .to_string()
                } else {
                    "*".to_string()
                };

                let optional = version_spec
                    .as_table()
                    .and_then(|t| t.get("optional"))
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);

                dependencies.push(PluginDependency {
                    name: name.clone(),
                    version_requirement,
                    optional,
                });
            }
        }

        Ok(dependencies)
    }

    /// Parse permissions from TOML
    fn parse_permissions(&self, perms: &toml::Value) -> PluginResult<Vec<Permission>> {
        let mut permissions = Vec::new();

        if let Some(perm_array) = perms.as_array() {
            for perm in perm_array {
                if let Some(perm_str) = perm.as_str() {
                    let permission = self.parse_permission_string(perm_str)?;
                    permissions.push(permission);
                }
            }
        }

        Ok(permissions)
    }

    /// Parse a permission string
    fn parse_permission_string(&self, perm_str: &str) -> PluginResult<Permission> {
        let parts: Vec<&str> = perm_str.splitn(2, ':').collect();

        match parts[0] {
            "fs_read" => Ok(Permission::FileSystemRead {
                paths: if parts.len() > 1 {
                    parts[1].split(',').map(|s| s.trim().to_string()).collect()
                } else {
                    vec!["*".to_string()]
                },
            }),
            "fs_write" => Ok(Permission::FileSystemWrite {
                paths: if parts.len() > 1 {
                    parts[1].split(',').map(|s| s.trim().to_string()).collect()
                } else {
                    vec!["*".to_string()]
                },
            }),
            "network" => Ok(Permission::Network {
                hosts: if parts.len() > 1 {
                    parts[1].split(',').map(|s| s.trim().to_string()).collect()
                } else {
                    vec!["*".to_string()]
                },
            }),
            "env" => Ok(Permission::Environment {
                variables: if parts.len() > 1 {
                    parts[1].split(',').map(|s| s.trim().to_string()).collect()
                } else {
                    vec!["*".to_string()]
                },
            }),
            "process" => Ok(Permission::ProcessExecution),
            "system" => Ok(Permission::SystemInfo),
            "plugin_comm" => Ok(Permission::PluginCommunication),
            _ => Ok(Permission::Custom {
                name: parts[0].to_string(),
                description: if parts.len() > 1 {
                    parts[1].to_string()
                } else {
                    "Custom permission".to_string()
                },
            }),
        }
    }

    /// Parse resource limits from TOML
    fn parse_resource_limits(&self, limits: &toml::Value) -> PluginResult<ResourceLimits> {
        let mut resource_limits = ResourceLimits::default();

        if let Some(limits_table) = limits.as_table() {
            if let Some(memory) = limits_table.get("max_memory_mb") {
                if let Some(memory_mb) = memory.as_integer() {
                    resource_limits.max_memory_bytes = (memory_mb as u64) * 1024 * 1024;
                }
            }

            if let Some(cpu_time) = limits_table.get("max_cpu_time_ms") {
                if let Some(cpu_ms) = cpu_time.as_integer() {
                    resource_limits.max_cpu_time_ms = cpu_ms as u64;
                }
            }

            if let Some(file_handles) = limits_table.get("max_file_handles") {
                if let Some(handles) = file_handles.as_integer() {
                    resource_limits.max_file_handles = handles as u32;
                }
            }

            if let Some(network_conns) = limits_table.get("max_network_connections") {
                if let Some(conns) = network_conns.as_integer() {
                    resource_limits.max_network_connections = conns as u32;
                }
            }

            if let Some(exec_time) = limits_table.get("max_execution_time_ms") {
                if let Some(exec_ms) = exec_time.as_integer() {
                    resource_limits.max_execution_time_ms = exec_ms as u64;
                }
            }
        }

        Ok(resource_limits)
    }

    /// Load a single plugin
    #[instrument(skip(self, metadata))]
    async fn load_plugin(&self, mut metadata: PluginMetadata, plugin_path: PathBuf) -> PluginResult<()> {
        let _permit = self.load_semaphore.acquire().await
            .map_err(|e| PluginError::LoadingFailed { reason: e.to_string() })?;

        info!("Loading plugin: {} v{}", metadata.name, metadata.version);

        // Calculate plugin checksum
        let checksum = self.calculate_plugin_checksum(&plugin_path).await?;
        metadata.checksum = checksum.clone();

        // Validate plugin signature if enabled
        if self.config.signature_verification {
            self.verify_plugin_signature(&metadata, &plugin_path).await?;
        }

        // Check if plugin is already loaded with same checksum
        if let Some(existing_state) = self.plugin_states.read().get(&metadata.id) {
            if existing_state.checksum == checksum {
                debug!("Plugin {} already loaded with same checksum, skipping", metadata.id);
                return Ok(());
            }
        }

        // Get appropriate factory
        let factory = {
            let factories = self.factories.read();
            factories.get(&metadata.plugin_type)
                .ok_or_else(|| PluginError::LoadingFailed {
                    reason: format!("No factory registered for plugin type: {:?}", metadata.plugin_type),
                })?
                .as_ref()
        };

        // Validate plugin before loading
        factory.validate_plugin(&metadata)?;

        // Create plugin instance
        let plugin = factory.create_plugin(metadata.clone())?;

        // Update plugin state
        let load_count = self.load_counter.fetch_add(1, Ordering::SeqCst) + 1;
        let now = SystemTime::now();

        let plugin_state = PluginLoadState {
            plugin_id: metadata.id.clone(),
            path: plugin_path,
            last_modified: now,
            checksum,
            load_count,
            last_loaded: now,
            library: None, // Will be set by native factory if needed
        };

        // Store plugin and state
        self.loaded_plugins.insert(metadata.id.clone(), Arc::new(RwLock::new(plugin)));
        self.plugin_states.write().insert(metadata.id.clone(), plugin_state);

        info!("Successfully loaded plugin: {} v{}", metadata.name, metadata.version);
        Ok(())
    }

    /// Calculate plugin checksum for integrity verification
    async fn calculate_plugin_checksum(&self, plugin_path: &Path) -> PluginResult<String> {
        let mut hasher = Sha256::new();

        // Hash all files in the plugin directory
        let mut entries = fs::read_dir(plugin_path).await?;
        let mut file_paths = Vec::new();

        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                file_paths.push(path);
            }
        }

        // Sort paths for deterministic hash
        file_paths.sort();

        for path in file_paths {
            let content = fs::read(&path).await?;
            hasher.update(&content);
            hasher.update(path.to_string_lossy().as_bytes());
        }

        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Verify plugin signature (placeholder for actual implementation)
    async fn verify_plugin_signature(
        &self,
        _metadata: &PluginMetadata,
        _plugin_path: &Path,
    ) -> PluginResult<()> {
        // TODO: Implement actual signature verification
        // For now, just return Ok if signature verification is required but not implemented
        if self.config.signature_verification && self.config.trusted_keys.is_empty() {
            warn!("Signature verification is enabled but no trusted keys are configured");
        }
        Ok(())
    }

    /// Set up hot reload monitoring
    async fn setup_hot_reload(&mut self) -> PluginResult<()> {
        let (tx, mut rx) = mpsc::unbounded_channel();

        let config = Config::default()
            .with_poll_interval(Duration::from_secs(self.config.hot_reload_interval_secs));

        let mut watcher = RecommendedWatcher::new(
            move |res| {
                if let Ok(event) = res {
                    if tx.send(event).is_err() {
                        error!("Failed to send file system event");
                    }
                }
            },
            config,
        ).map_err(|e| PluginError::LoadingFailed {
            reason: format!("Failed to create file watcher: {}", e),
        })?;

        // Watch all plugin directories
        for dir in &self.config.plugin_directories {
            watcher
                .watch(dir, RecursiveMode::Recursive)
                .map_err(|e| PluginError::LoadingFailed {
                    reason: format!("Failed to watch directory {:?}: {}", dir, e),
                })?;
        }

        self.hot_reload_watcher = Some(watcher);
        self.event_tx = Some(tx);

        // Start event processing task
        let loader = Arc::new(Mutex::new(self.clone()));
        tokio::spawn(async move {
            while let Some(event) = rx.recv().await {
                if let Ok(loader) = loader.try_lock() {
                    if let Err(e) = loader.handle_file_system_event(event).await {
                        error!("Failed to handle file system event: {}", e);
                    }
                }
            }
        });

        info!("Hot reload monitoring enabled");
        Ok(())
    }

    /// Handle file system events for hot reloading
    async fn handle_file_system_event(&self, event: notify::Event) -> PluginResult<()> {
        use notify::EventKind;

        match event.kind {
            EventKind::Modify(_) | EventKind::Create(_) => {
                for path in event.paths {
                    if path.extension() == Some(OsStr::new("toml")) {
                        self.handle_plugin_change(&path).await?;
                    }
                }
            }
            EventKind::Remove(_) => {
                for path in event.paths {
                    if path.extension() == Some(OsStr::new("toml")) {
                        self.handle_plugin_removal(&path).await?;
                    }
                }
            }
            _ => {}
        }

        Ok(())
    }

    /// Handle plugin file changes for hot reloading
    async fn handle_plugin_change(&self, manifest_path: &Path) -> PluginResult<()> {
        debug!("Handling plugin change: {:?}", manifest_path);

        // Load the updated manifest
        let metadata = self.load_plugin_manifest(manifest_path).await?;
        let plugin_dir = manifest_path.parent().unwrap_or_else(|| Path::new("."));

        // Check if plugin supports hot reloading
        if let Some(plugin_ref) = self.loaded_plugins.get(&metadata.id) {
            let plugin = plugin_ref.read();
            if plugin.supports_hot_reload() {
                drop(plugin); // Release lock before reload

                // Reload the plugin
                info!("Hot reloading plugin: {}", metadata.id);
                self.reload_plugin(metadata.id.clone()).await?;
            } else {
                info!("Plugin {} does not support hot reloading", metadata.id);
            }
        } else {
            // New plugin, load it
            info!("Loading new plugin: {}", metadata.id);
            self.load_plugin(metadata, plugin_dir.to_path_buf()).await?;
        }

        Ok(())
    }

    /// Handle plugin removal
    async fn handle_plugin_removal(&self, manifest_path: &Path) -> PluginResult<()> {
        debug!("Handling plugin removal: {:?}", manifest_path);

        // Find plugin by path and unload it
        let plugin_id = {
            let states = self.plugin_states.read();
            states.iter()
                .find(|(_, state)| {
                    state.path.join("plugin.toml") == manifest_path
                })
                .map(|(id, _)| id.clone())
        };

        if let Some(plugin_id) = plugin_id {
            info!("Unloading removed plugin: {}", plugin_id);
            self.unload_plugin(&plugin_id).await?;
        }

        Ok(())
    }

    /// Reload a plugin
    #[instrument(skip(self))]
    pub async fn reload_plugin(&self, plugin_id: String) -> PluginResult<()> {
        info!("Reloading plugin: {}", plugin_id);

        // Get plugin path
        let plugin_path = {
            let states = self.plugin_states.read();
            states.get(&plugin_id)
                .map(|state| state.path.clone())
                .ok_or_else(|| PluginError::PluginNotFound { plugin_id: plugin_id.clone() })?
        };

        // Unload existing plugin
        self.unload_plugin(&plugin_id).await?;

        // Load plugin manifest
        let manifest_path = plugin_path.join("plugin.toml");
        let metadata = self.load_plugin_manifest(&manifest_path).await?;

        // Reload plugin
        self.load_plugin(metadata, plugin_path).await?;

        info!("Successfully reloaded plugin: {}", plugin_id);
        Ok(())
    }

    /// Unload a plugin
    #[instrument(skip(self))]
    pub async fn unload_plugin(&self, plugin_id: &str) -> PluginResult<()> {
        info!("Unloading plugin: {}", plugin_id);

        // Remove from loaded plugins
        if let Some((_, plugin_ref)) = self.loaded_plugins.remove(plugin_id) {
            // Shutdown plugin
            let mut plugin = plugin_ref.write();
            plugin.shutdown().await?;
        }

        // Remove from plugin states
        self.plugin_states.write().remove(plugin_id);

        info!("Successfully unloaded plugin: {}", plugin_id);
        Ok(())
    }

    /// Get a loaded plugin by ID
    pub fn get_plugin(&self, plugin_id: &str) -> Option<Arc<RwLock<Box<dyn Plugin>>>> {
        self.loaded_plugins.get(plugin_id).map(|entry| entry.value().clone())
    }

    /// List all loaded plugins
    pub fn list_plugins(&self) -> Vec<String> {
        self.loaded_plugins.iter().map(|entry| entry.key().clone()).collect()
    }

    /// Get plugin load statistics
    pub fn get_load_stats(&self) -> HashMap<String, serde_json::Value> {
        let states = self.plugin_states.read();
        let total_plugins = states.len();
        let total_loads = self.load_counter.load(Ordering::SeqCst);

        let mut stats = HashMap::new();
        stats.insert("total_plugins".to_string(), serde_json::json!(total_plugins));
        stats.insert("total_loads".to_string(), serde_json::json!(total_loads));
        stats.insert("hot_reload_enabled".to_string(), serde_json::json!(self.config.hot_reload_enabled));

        stats
    }
}

impl Clone for PluginLoader {
    fn clone(&self) -> Self {
        Self {
            config: self.config.clone(),
            loaded_plugins: self.loaded_plugins.clone(),
            plugin_states: self.plugin_states.clone(),
            factories: self.factories.clone(),
            load_counter: self.load_counter.clone(),
            hot_reload_watcher: None, // Cannot clone watcher
            event_tx: None, // Cannot clone sender
            dependency_graph: self.dependency_graph.clone(),
            load_semaphore: self.load_semaphore.clone(),
        }
    }
}