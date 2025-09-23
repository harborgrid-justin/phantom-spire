//! Plugin Discovery System
//!
//! Provides comprehensive plugin discovery capabilities including
//! automatic plugin detection, metadata parsing, and plugin indexing.

use super::*;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use tokio::fs;
use tracing::{debug, error, info, instrument, warn};
use walkdir::WalkDir;

/// Plugin discovery configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryConfig {
    /// Plugin search paths
    pub search_paths: Vec<PathBuf>,
    /// File extensions to search for plugin manifests
    pub manifest_extensions: Vec<String>,
    /// Maximum depth for directory traversal
    pub max_depth: usize,
    /// Enable recursive search in subdirectories
    pub recursive_search: bool,
    /// Plugin file patterns to recognize
    pub plugin_patterns: Vec<String>,
    /// Exclude patterns for directories/files to skip
    pub exclude_patterns: Vec<String>,
    /// Follow symbolic links
    pub follow_symlinks: bool,
    /// Cache discovery results
    pub cache_results: bool,
    /// Cache expiration time in seconds
    pub cache_expiration_secs: u64,
}

impl Default for DiscoveryConfig {
    fn default() -> Self {
        Self {
            search_paths: vec![
                PathBuf::from("plugins"),
                PathBuf::from("./plugins"),
                PathBuf::from("~/.phantom/plugins"),
                PathBuf::from("/usr/local/lib/phantom/plugins"),
            ],
            manifest_extensions: vec![
                "toml".to_string(),
                "json".to_string(),
                "yaml".to_string(),
                "yml".to_string(),
            ],
            max_depth: 5,
            recursive_search: true,
            plugin_patterns: vec![
                "plugin.toml".to_string(),
                "plugin.json".to_string(),
                "manifest.toml".to_string(),
                "manifest.json".to_string(),
                "*.wasm".to_string(),
                "lib*.so".to_string(),
                "*.dll".to_string(),
                "*.dylib".to_string(),
            ],
            exclude_patterns: vec![
                "node_modules".to_string(),
                "target".to_string(),
                ".git".to_string(),
                "build".to_string(),
                "dist".to_string(),
                "*.tmp".to_string(),
                "*.bak".to_string(),
            ],
            follow_symlinks: false,
            cache_results: true,
            cache_expiration_secs: 3600, // 1 hour
        }
    }
}

/// Discovered plugin information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredPlugin {
    /// Plugin metadata
    pub metadata: PluginMetadata,
    /// Path to plugin directory
    pub plugin_path: PathBuf,
    /// Path to plugin manifest file
    pub manifest_path: PathBuf,
    /// Additional plugin files (libraries, WASM modules, etc.)
    pub plugin_files: Vec<PluginFile>,
    /// Discovery timestamp
    pub discovered_at: DateTime<Utc>,
    /// Plugin hash for change detection
    pub plugin_hash: String,
    /// Whether plugin is valid and loadable
    pub is_valid: bool,
    /// Validation errors if any
    pub validation_errors: Vec<String>,
}

/// Plugin file information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginFile {
    /// File path
    pub path: PathBuf,
    /// File type (library, wasm, config, resource, etc.)
    pub file_type: PluginFileType,
    /// File size in bytes
    pub size_bytes: u64,
    /// File hash for integrity checking
    pub hash: String,
    /// Last modified time
    pub modified_at: DateTime<Utc>,
}

/// Plugin file types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PluginFileType {
    /// Dynamic library (.so, .dll, .dylib)
    Library,
    /// WebAssembly module (.wasm)
    WebAssembly,
    /// Configuration file
    Configuration,
    /// Resource file (data, assets)
    Resource,
    /// Documentation
    Documentation,
    /// Script file
    Script,
    /// Unknown file type
    Unknown,
}

/// Discovery cache entry
#[derive(Debug, Clone, Serialize, Deserialize)]
struct CacheEntry {
    plugins: Vec<DiscoveredPlugin>,
    discovered_at: DateTime<Utc>,
    expires_at: DateTime<Utc>,
    search_paths: Vec<PathBuf>,
}

/// Plugin discovery system
pub struct PluginDiscovery {
    config: DiscoveryConfig,
    cache: Option<CacheEntry>,
    discovered_plugins: HashMap<String, DiscoveredPlugin>,
    plugin_index: HashMap<String, HashSet<String>>, // tag -> plugin_ids
}

impl PluginDiscovery {
    /// Create a new plugin discovery system
    pub fn new(config: DiscoveryConfig) -> Self {
        Self {
            config,
            cache: None,
            discovered_plugins: HashMap::new(),
            plugin_index: HashMap::new(),
        }
    }

    /// Discover all plugins in configured search paths
    #[instrument(skip(self))]
    pub async fn discover_plugins(&mut self) -> PluginResult<Vec<DiscoveredPlugin>> {
        info!("Starting plugin discovery");

        // Check cache first
        if self.config.cache_results && self.is_cache_valid() {
            if let Some(cache) = &self.cache {
                info!("Using cached discovery results");
                self.update_internal_state(&cache.plugins);
                return Ok(cache.plugins.clone());
            }
        }

        let mut discovered_plugins = Vec::new();

        // Search in each configured path
        for search_path in &self.config.search_paths {
            if search_path.exists() {
                info!("Searching for plugins in: {:?}", search_path);
                let plugins = self.discover_in_path(search_path).await?;
                discovered_plugins.extend(plugins);
            } else {
                debug!("Search path does not exist: {:?}", search_path);
            }
        }

        // Remove duplicates based on plugin ID
        self.deduplicate_plugins(&mut discovered_plugins);

        // Update cache
        if self.config.cache_results {
            self.update_cache(&discovered_plugins);
        }

        // Update internal state
        self.update_internal_state(&discovered_plugins);

        info!("Discovered {} plugins", discovered_plugins.len());
        Ok(discovered_plugins)
    }

    /// Discover plugins in a specific path
    #[instrument(skip(self))]
    async fn discover_in_path(&self, search_path: &Path) -> PluginResult<Vec<DiscoveredPlugin>> {
        let mut discovered_plugins = Vec::new();

        if self.config.recursive_search {
            // Use walkdir for recursive search
            for entry in WalkDir::new(search_path)
                .max_depth(self.config.max_depth)
                .follow_links(self.config.follow_symlinks)
                .into_iter()
                .filter_entry(|e| !self.should_exclude_path(e.path()))
            {
                match entry {
                    Ok(entry) => {
                        if let Some(plugin) = self.check_for_plugin(entry.path()).await? {
                            discovered_plugins.push(plugin);
                        }
                    }
                    Err(e) => {
                        warn!("Error reading directory entry: {}", e);
                    }
                }
            }
        } else {
            // Non-recursive search
            let mut entries = fs::read_dir(search_path).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if !self.should_exclude_path(&path) {
                    if let Some(plugin) = self.check_for_plugin(&path).await? {
                        discovered_plugins.push(plugin);
                    }
                }
            }
        }

        Ok(discovered_plugins)
    }

    /// Check if a path contains a plugin
    async fn check_for_plugin(&self, path: &Path) -> PluginResult<Option<DiscoveredPlugin>> {
        // Check for manifest files
        if self.is_manifest_file(path) {
            return self.discover_plugin_from_manifest(path).await.map(Some);
        }

        // Check for plugin directories
        if path.is_dir() {
            for pattern in &self.config.plugin_patterns {
                let manifest_path = path.join(pattern);
                if manifest_path.exists() && self.is_manifest_file(&manifest_path) {
                    return self.discover_plugin_from_manifest(&manifest_path).await.map(Some);
                }
            }
        }

        // Check for standalone plugin files (WASM, libraries)
        if self.is_plugin_file(path) {
            return self.discover_standalone_plugin(path).await.map(Some);
        }

        Ok(None)
    }

    /// Discover plugin from manifest file
    async fn discover_plugin_from_manifest(
        &self,
        manifest_path: &Path,
    ) -> PluginResult<DiscoveredPlugin> {
        debug!("Discovering plugin from manifest: {:?}", manifest_path);

        // Parse manifest
        let metadata = self.parse_manifest_file(manifest_path).await?;

        // Get plugin directory
        let plugin_path = if manifest_path.file_name().unwrap().to_str().unwrap().starts_with("plugin.") {
            manifest_path.parent().unwrap_or(manifest_path).to_path_buf()
        } else {
            manifest_path.to_path_buf()
        };

        // Discover additional plugin files
        let plugin_files = self.discover_plugin_files(&plugin_path).await?;

        // Calculate plugin hash
        let plugin_hash = self.calculate_plugin_hash(&plugin_path, &plugin_files).await?;

        // Validate plugin
        let (is_valid, validation_errors) = self.validate_discovered_plugin(&metadata, &plugin_files);

        Ok(DiscoveredPlugin {
            metadata,
            plugin_path,
            manifest_path: manifest_path.to_path_buf(),
            plugin_files,
            discovered_at: Utc::now(),
            plugin_hash,
            is_valid,
            validation_errors,
        })
    }

    /// Discover standalone plugin (WASM or library without manifest)
    async fn discover_standalone_plugin(&self, path: &Path) -> PluginResult<DiscoveredPlugin> {
        debug!("Discovering standalone plugin: {:?}", path);

        // Create minimal metadata from file
        let metadata = self.create_metadata_from_file(path).await?;

        // Create plugin file entry
        let plugin_file = self.create_plugin_file(path).await?;

        let plugin_hash = plugin_file.hash.clone();

        Ok(DiscoveredPlugin {
            metadata,
            plugin_path: path.parent().unwrap_or(path).to_path_buf(),
            manifest_path: path.to_path_buf(),
            plugin_files: vec![plugin_file],
            discovered_at: Utc::now(),
            plugin_hash,
            is_valid: true, // Assume valid for standalone files
            validation_errors: Vec::new(),
        })
    }

    /// Parse manifest file based on extension
    async fn parse_manifest_file(&self, manifest_path: &Path) -> PluginResult<PluginMetadata> {
        let content = fs::read_to_string(manifest_path).await?;

        match manifest_path.extension().and_then(|s| s.to_str()) {
            Some("toml") => self.parse_toml_manifest(&content),
            Some("json") => self.parse_json_manifest(&content),
            Some("yaml") | Some("yml") => self.parse_yaml_manifest(&content),
            _ => Err(PluginError::ConfigurationInvalid {
                field: "Unsupported manifest file format".to_string(),
            }),
        }
    }

    /// Parse TOML manifest
    fn parse_toml_manifest(&self, content: &str) -> PluginResult<PluginMetadata> {
        let manifest: toml::Value = toml::from_str(content)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("TOML parse error: {}", e),
            })?;

        self.parse_manifest_value(serde_json::to_value(manifest)?)
    }

    /// Parse JSON manifest
    fn parse_json_manifest(&self, content: &str) -> PluginResult<PluginMetadata> {
        let manifest: serde_json::Value = serde_json::from_str(content)?;
        self.parse_manifest_value(manifest)
    }

    /// Parse YAML manifest
    fn parse_yaml_manifest(&self, content: &str) -> PluginResult<PluginMetadata> {
        // For now, return an error as we don't have serde_yaml in dependencies
        // In a real implementation, you'd add serde_yaml and implement this
        Err(PluginError::ConfigurationInvalid {
            field: "YAML manifest parsing not implemented".to_string(),
        })
    }

    /// Parse manifest value into PluginMetadata
    fn parse_manifest_value(&self, value: serde_json::Value) -> PluginResult<PluginMetadata> {
        // This is a simplified version of what we implemented in the loader
        // In practice, you'd reuse the parsing logic from the loader
        let plugin_section = value.get("plugin")
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing [plugin] section".to_string(),
            })?;

        let id = plugin_section.get("id")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing plugin.id".to_string(),
            })?
            .to_string();

        let name = plugin_section.get("name")
            .and_then(|v| v.as_str())
            .unwrap_or(&id)
            .to_string();

        let version_str = plugin_section.get("version")
            .and_then(|v| v.as_str())
            .unwrap_or("0.1.0");

        let version = Version::parse(version_str)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("invalid version: {}", e),
            })?;

        let description = plugin_section.get("description")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let author = plugin_section.get("author")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();

        let plugin_type = match plugin_section.get("type")
            .and_then(|v| v.as_str())
            .unwrap_or("native") {
            "native" => PluginType::Native,
            "wasm" | "webassembly" => PluginType::WebAssembly,
            "javascript" | "js" => PluginType::JavaScript,
            _ => PluginType::Native,
        };

        let now = Utc::now();

        Ok(PluginMetadata {
            id,
            name,
            description,
            version,
            author,
            license: "Unknown".to_string(),
            plugin_type,
            entry_point: "main".to_string(),
            dependencies: Vec::new(),
            required_api_version: Version::parse("1.0.0").unwrap(),
            permissions: Vec::new(),
            resource_limits: ResourceLimits::default(),
            tags: Vec::new(),
            created_at: now,
            updated_at: now,
            checksum: String::new(),
            signature: None,
            configuration_schema: None,
        })
    }

    /// Discover additional plugin files in a directory
    async fn discover_plugin_files(&self, plugin_path: &Path) -> PluginResult<Vec<PluginFile>> {
        let mut plugin_files = Vec::new();

        if plugin_path.is_dir() {
            let mut entries = fs::read_dir(plugin_path).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_file() && !self.should_exclude_path(&path) {
                    let plugin_file = self.create_plugin_file(&path).await?;
                    plugin_files.push(plugin_file);
                }
            }
        }

        Ok(plugin_files)
    }

    /// Create PluginFile from path
    async fn create_plugin_file(&self, path: &Path) -> PluginResult<PluginFile> {
        let metadata = fs::metadata(path).await?;
        let size_bytes = metadata.len();
        let modified_at = metadata.modified()
            .map(|time| time.into())
            .unwrap_or_else(|_| Utc::now());

        // Calculate file hash
        let content = fs::read(path).await?;
        let hash = format!("{:x}", sha2::Sha256::digest(&content));

        // Determine file type
        let file_type = self.determine_file_type(path);

        Ok(PluginFile {
            path: path.to_path_buf(),
            file_type,
            size_bytes,
            hash,
            modified_at,
        })
    }

    /// Determine file type from path/extension
    fn determine_file_type(&self, path: &Path) -> PluginFileType {
        if let Some(extension) = path.extension().and_then(|s| s.to_str()) {
            match extension.to_lowercase().as_str() {
                "so" | "dll" | "dylib" => PluginFileType::Library,
                "wasm" => PluginFileType::WebAssembly,
                "toml" | "json" | "yaml" | "yml" | "conf" | "config" => PluginFileType::Configuration,
                "md" | "txt" | "rst" => PluginFileType::Documentation,
                "js" | "ts" | "py" | "rb" | "sh" | "bat" => PluginFileType::Script,
                _ => PluginFileType::Resource,
            }
        } else {
            PluginFileType::Unknown
        }
    }

    /// Create metadata from standalone file
    async fn create_metadata_from_file(&self, path: &Path) -> PluginResult<PluginMetadata> {
        let file_stem = path.file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("unknown")
            .to_string();

        let plugin_type = match path.extension().and_then(|s| s.to_str()) {
            Some("wasm") => PluginType::WebAssembly,
            Some("so") | Some("dll") | Some("dylib") => PluginType::Native,
            Some("js") | Some("ts") => PluginType::JavaScript,
            _ => PluginType::Native,
        };

        let now = Utc::now();

        Ok(PluginMetadata {
            id: file_stem.clone(),
            name: file_stem,
            description: format!("Auto-discovered plugin from {}", path.display()),
            version: Version::parse("0.1.0").unwrap(),
            author: "Unknown".to_string(),
            license: "Unknown".to_string(),
            plugin_type,
            entry_point: "main".to_string(),
            dependencies: Vec::new(),
            required_api_version: Version::parse("1.0.0").unwrap(),
            permissions: Vec::new(),
            resource_limits: ResourceLimits::default(),
            tags: vec!["auto-discovered".to_string()],
            created_at: now,
            updated_at: now,
            checksum: String::new(),
            signature: None,
            configuration_schema: None,
        })
    }

    /// Calculate plugin hash for change detection
    async fn calculate_plugin_hash(
        &self,
        plugin_path: &Path,
        plugin_files: &[PluginFile],
    ) -> PluginResult<String> {
        use sha2::{Digest, Sha256};

        let mut hasher = Sha256::new();

        // Hash plugin path
        hasher.update(plugin_path.to_string_lossy().as_bytes());

        // Hash all plugin files
        for file in plugin_files {
            hasher.update(&file.hash);
            hasher.update(&file.size_bytes.to_le_bytes());
        }

        Ok(format!("{:x}", hasher.finalize()))
    }

    /// Validate discovered plugin
    fn validate_discovered_plugin(
        &self,
        metadata: &PluginMetadata,
        plugin_files: &[PluginFile],
    ) -> (bool, Vec<String>) {
        let mut errors = Vec::new();

        // Check for required files based on plugin type
        match metadata.plugin_type {
            PluginType::Native => {
                let has_library = plugin_files.iter()
                    .any(|f| f.file_type == PluginFileType::Library);
                if !has_library {
                    errors.push("Native plugin missing library file (.so, .dll, .dylib)".to_string());
                }
            }
            PluginType::WebAssembly => {
                let has_wasm = plugin_files.iter()
                    .any(|f| f.file_type == PluginFileType::WebAssembly);
                if !has_wasm {
                    errors.push("WebAssembly plugin missing .wasm file".to_string());
                }
            }
            PluginType::JavaScript => {
                let has_script = plugin_files.iter()
                    .any(|f| f.file_type == PluginFileType::Script);
                if !has_script {
                    errors.push("JavaScript plugin missing script file".to_string());
                }
            }
        }

        // Validate metadata fields
        if metadata.id.is_empty() {
            errors.push("Plugin ID cannot be empty".to_string());
        }

        if metadata.name.is_empty() {
            errors.push("Plugin name cannot be empty".to_string());
        }

        let is_valid = errors.is_empty();
        (is_valid, errors)
    }

    /// Check if path should be excluded
    fn should_exclude_path(&self, path: &Path) -> bool {
        let path_str = path.to_string_lossy();

        for pattern in &self.config.exclude_patterns {
            if path_str.contains(pattern) {
                return true;
            }
        }

        false
    }

    /// Check if file is a manifest file
    fn is_manifest_file(&self, path: &Path) -> bool {
        if let Some(file_name) = path.file_name().and_then(|s| s.to_str()) {
            for pattern in &self.config.plugin_patterns {
                if pattern.contains("plugin.") || pattern.contains("manifest.") {
                    if file_name == pattern {
                        return true;
                    }
                }
            }
        }

        if let Some(extension) = path.extension().and_then(|s| s.to_str()) {
            return self.config.manifest_extensions.contains(&extension.to_string());
        }

        false
    }

    /// Check if file is a plugin file
    fn is_plugin_file(&self, path: &Path) -> bool {
        if let Some(extension) = path.extension().and_then(|s| s.to_str()) {
            match extension {
                "wasm" | "so" | "dll" | "dylib" => true,
                _ => false,
            }
        } else {
            false
        }
    }

    /// Remove duplicate plugins based on ID
    fn deduplicate_plugins(&self, plugins: &mut Vec<DiscoveredPlugin>) {
        let mut seen_ids = HashSet::new();
        plugins.retain(|plugin| seen_ids.insert(plugin.metadata.id.clone()));
    }

    /// Check if cache is valid
    fn is_cache_valid(&self) -> bool {
        if let Some(cache) = &self.cache {
            Utc::now() < cache.expires_at && cache.search_paths == self.config.search_paths
        } else {
            false
        }
    }

    /// Update cache with new discovery results
    fn update_cache(&mut self, plugins: &[DiscoveredPlugin]) {
        let now = Utc::now();
        let expires_at = now + chrono::Duration::seconds(self.config.cache_expiration_secs as i64);

        self.cache = Some(CacheEntry {
            plugins: plugins.to_vec(),
            discovered_at: now,
            expires_at,
            search_paths: self.config.search_paths.clone(),
        });
    }

    /// Update internal state with discovered plugins
    fn update_internal_state(&mut self, plugins: &[DiscoveredPlugin]) {
        self.discovered_plugins.clear();
        self.plugin_index.clear();

        for plugin in plugins {
            self.discovered_plugins.insert(plugin.metadata.id.clone(), plugin.clone());

            // Index by tags
            for tag in &plugin.metadata.tags {
                self.plugin_index
                    .entry(tag.clone())
                    .or_insert_with(HashSet::new)
                    .insert(plugin.metadata.id.clone());
            }
        }
    }

    /// Get discovered plugin by ID
    pub fn get_plugin(&self, plugin_id: &str) -> Option<&DiscoveredPlugin> {
        self.discovered_plugins.get(plugin_id)
    }

    /// List all discovered plugins
    pub fn list_plugins(&self) -> Vec<&DiscoveredPlugin> {
        self.discovered_plugins.values().collect()
    }

    /// Find plugins by tag
    pub fn find_plugins_by_tag(&self, tag: &str) -> Vec<&DiscoveredPlugin> {
        if let Some(plugin_ids) = self.plugin_index.get(tag) {
            plugin_ids.iter()
                .filter_map(|id| self.discovered_plugins.get(id))
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Find plugins by type
    pub fn find_plugins_by_type(&self, plugin_type: &PluginType) -> Vec<&DiscoveredPlugin> {
        self.discovered_plugins
            .values()
            .filter(|plugin| plugin.metadata.plugin_type == *plugin_type)
            .collect()
    }

    /// Get discovery statistics
    pub fn get_statistics(&self) -> HashMap<String, serde_json::Value> {
        let mut stats = HashMap::new();

        let total_plugins = self.discovered_plugins.len();
        let valid_plugins = self.discovered_plugins.values()
            .filter(|p| p.is_valid)
            .count();

        let plugins_by_type: HashMap<String, usize> = self.discovered_plugins
            .values()
            .fold(HashMap::new(), |mut acc, plugin| {
                let type_name = match plugin.metadata.plugin_type {
                    PluginType::Native => "native",
                    PluginType::WebAssembly => "wasm",
                    PluginType::JavaScript => "javascript",
                };
                *acc.entry(type_name.to_string()).or_insert(0) += 1;
                acc
            });

        stats.insert("total_plugins".to_string(), serde_json::json!(total_plugins));
        stats.insert("valid_plugins".to_string(), serde_json::json!(valid_plugins));
        stats.insert("invalid_plugins".to_string(), serde_json::json!(total_plugins - valid_plugins));
        stats.insert("plugins_by_type".to_string(), serde_json::json!(plugins_by_type));
        stats.insert("search_paths".to_string(), serde_json::json!(self.config.search_paths));

        if let Some(cache) = &self.cache {
            stats.insert("cache_valid".to_string(), serde_json::json!(self.is_cache_valid()));
            stats.insert("cache_discovered_at".to_string(), serde_json::json!(cache.discovered_at));
            stats.insert("cache_expires_at".to_string(), serde_json::json!(cache.expires_at));
        }

        stats
    }

    /// Clear discovery cache
    pub fn clear_cache(&mut self) {
        self.cache = None;
    }
}