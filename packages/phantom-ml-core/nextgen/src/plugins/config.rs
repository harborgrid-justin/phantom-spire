//! Plugin Configuration Management
//!
//! Provides comprehensive configuration management for plugins including
//! validation, schema management, environment-specific configurations,
//! and dynamic configuration updates.

use super::*;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tokio::fs;
use tracing::{debug, error, info, instrument, warn};

/// Configuration environment types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ConfigEnvironment {
    Development,
    Testing,
    Staging,
    Production,
    Custom(String),
}

impl ConfigEnvironment {
    pub fn as_str(&self) -> &str {
        match self {
            ConfigEnvironment::Development => "development",
            ConfigEnvironment::Testing => "testing",
            ConfigEnvironment::Staging => "staging",
            ConfigEnvironment::Production => "production",
            ConfigEnvironment::Custom(name) => name,
        }
    }
}

impl std::str::FromStr for ConfigEnvironment {
    type Err = PluginError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "development" | "dev" => Ok(ConfigEnvironment::Development),
            "testing" | "test" => Ok(ConfigEnvironment::Testing),
            "staging" | "stage" => Ok(ConfigEnvironment::Staging),
            "production" | "prod" => Ok(ConfigEnvironment::Production),
            name => Ok(ConfigEnvironment::Custom(name.to_string())),
        }
    }
}

/// Plugin configuration with environment-specific overrides
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    /// Plugin identifier
    pub plugin_id: String,
    /// Base configuration that applies to all environments
    pub base_config: HashMap<String, JsonValue>,
    /// Environment-specific configuration overrides
    pub environment_configs: HashMap<ConfigEnvironment, HashMap<String, JsonValue>>,
    /// Configuration schema for validation
    pub schema: Option<JsonValue>,
    /// Configuration metadata
    pub metadata: HashMap<String, String>,
    /// Whether configuration is encrypted
    pub encrypted: bool,
    /// Configuration version for tracking changes
    pub version: u64,
    /// Last updated timestamp
    pub updated_at: DateTime<Utc>,
    /// Configuration source (file, database, remote, etc.)
    pub source: ConfigSource,
}

/// Configuration source information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConfigSource {
    File { path: PathBuf },
    Database { connection: String, table: String },
    Remote { url: String },
    Memory,
    Environment,
}

impl PluginConfig {
    /// Create a new plugin configuration
    pub fn new(plugin_id: String) -> Self {
        Self {
            plugin_id,
            base_config: HashMap::new(),
            environment_configs: HashMap::new(),
            schema: None,
            metadata: HashMap::new(),
            encrypted: false,
            version: 1,
            updated_at: Utc::now(),
            source: ConfigSource::Memory,
        }
    }

    /// Get effective configuration for a specific environment
    pub fn get_effective_config(&self, environment: &ConfigEnvironment) -> HashMap<String, JsonValue> {
        let mut effective_config = self.base_config.clone();

        // Apply environment-specific overrides
        if let Some(env_config) = self.environment_configs.get(environment) {
            for (key, value) in env_config {
                effective_config.insert(key.clone(), value.clone());
            }
        }

        effective_config
    }

    /// Set a configuration value in the base configuration
    pub fn set_base_config<K, V>(&mut self, key: K, value: V)
    where
        K: Into<String>,
        V: Into<JsonValue>,
    {
        self.base_config.insert(key.into(), value.into());
        self.version += 1;
        self.updated_at = Utc::now();
    }

    /// Set an environment-specific configuration value
    pub fn set_environment_config<K, V>(
        &mut self,
        environment: ConfigEnvironment,
        key: K,
        value: V,
    ) where
        K: Into<String>,
        V: Into<JsonValue>,
    {
        self.environment_configs
            .entry(environment)
            .or_insert_with(HashMap::new)
            .insert(key.into(), value.into());
        self.version += 1;
        self.updated_at = Utc::now();
    }

    /// Remove a configuration key
    pub fn remove_config(&mut self, key: &str) {
        self.base_config.remove(key);
        for env_config in self.environment_configs.values_mut() {
            env_config.remove(key);
        }
        self.version += 1;
        self.updated_at = Utc::now();
    }

    /// Validate configuration against schema
    pub fn validate(&self, environment: &ConfigEnvironment) -> PluginResult<()> {
        if let Some(schema) = &self.schema {
            let config = self.get_effective_config(environment);
            self.validate_against_schema(&config, schema)?;
        }
        Ok(())
    }

    /// Validate configuration against a JSON schema
    fn validate_against_schema(
        &self,
        config: &HashMap<String, JsonValue>,
        schema: &JsonValue,
    ) -> PluginResult<()> {
        // Basic schema validation - in a real implementation, use a JSON schema library
        if let Some(required_fields) = schema.get("required") {
            if let Some(required_array) = required_fields.as_array() {
                for field in required_array {
                    if let Some(field_name) = field.as_str() {
                        if !config.contains_key(field_name) {
                            return Err(PluginError::ConfigurationInvalid {
                                field: format!("Required field '{}' is missing", field_name),
                            });
                        }
                    }
                }
            }
        }

        // Validate field types if specified in schema
        if let Some(properties) = schema.get("properties") {
            if let Some(properties_obj) = properties.as_object() {
                for (field_name, field_schema) in properties_obj {
                    if let Some(config_value) = config.get(field_name) {
                        self.validate_field_type(field_name, config_value, field_schema)?;
                    }
                }
            }
        }

        Ok(())
    }

    /// Validate a field type against its schema
    fn validate_field_type(
        &self,
        field_name: &str,
        value: &JsonValue,
        schema: &JsonValue,
    ) -> PluginResult<()> {
        if let Some(expected_type) = schema.get("type") {
            if let Some(type_str) = expected_type.as_str() {
                let actual_type = match value {
                    JsonValue::String(_) => "string",
                    JsonValue::Number(_) => "number",
                    JsonValue::Bool(_) => "boolean",
                    JsonValue::Array(_) => "array",
                    JsonValue::Object(_) => "object",
                    JsonValue::Null => "null",
                };

                if actual_type != type_str {
                    return Err(PluginError::ConfigurationInvalid {
                        field: format!(
                            "Field '{}' expected type '{}', got '{}'",
                            field_name, type_str, actual_type
                        ),
                    });
                }
            }
        }

        Ok(())
    }

    /// Merge another configuration into this one
    pub fn merge(&mut self, other: &PluginConfig) {
        // Merge base config
        for (key, value) in &other.base_config {
            self.base_config.insert(key.clone(), value.clone());
        }

        // Merge environment configs
        for (env, env_config) in &other.environment_configs {
            let target_env_config = self.environment_configs.entry(env.clone()).or_insert_with(HashMap::new);
            for (key, value) in env_config {
                target_env_config.insert(key.clone(), value.clone());
            }
        }

        self.version += 1;
        self.updated_at = Utc::now();
    }
}

/// Configuration manager for handling plugin configurations
pub struct ConfigManager {
    /// Base configuration directory
    config_directory: PathBuf,
    /// Current environment
    current_environment: ConfigEnvironment,
    /// Loaded configurations
    configurations: HashMap<String, PluginConfig>,
    /// Configuration file watchers for hot reloading
    file_watchers: HashMap<PathBuf, notify::RecommendedWatcher>,
    /// Configuration change listeners
    change_listeners: Vec<Arc<dyn ConfigChangeListener>>,
    /// Configuration encryption key
    encryption_key: Option<Vec<u8>>,
}

/// Configuration change listener trait
#[async_trait]
pub trait ConfigChangeListener: Send + Sync {
    /// Called when a plugin configuration changes
    async fn on_config_changed(
        &self,
        plugin_id: &str,
        old_config: &PluginConfig,
        new_config: &PluginConfig,
    ) -> PluginResult<()>;

    /// Get listener name
    fn name(&self) -> &str;
}

impl ConfigManager {
    /// Create a new configuration manager
    pub fn new<P: AsRef<Path>>(
        config_directory: P,
        environment: ConfigEnvironment,
    ) -> PluginResult<Self> {
        let config_dir = config_directory.as_ref().to_path_buf();

        Ok(Self {
            config_directory: config_dir,
            current_environment: environment,
            configurations: HashMap::new(),
            file_watchers: HashMap::new(),
            change_listeners: Vec::new(),
            encryption_key: None,
        })
    }

    /// Set encryption key for configuration encryption/decryption
    pub fn set_encryption_key(&mut self, key: Vec<u8>) {
        self.encryption_key = Some(key);
    }

    /// Add a configuration change listener
    pub fn add_change_listener(&mut self, listener: Arc<dyn ConfigChangeListener>) {
        self.change_listeners.push(listener);
    }

    /// Load all plugin configurations from the configuration directory
    #[instrument(skip(self))]
    pub async fn load_configurations(&mut self) -> PluginResult<()> {
        info!("Loading plugin configurations from {:?}", self.config_directory);

        if !self.config_directory.exists() {
            fs::create_dir_all(&self.config_directory).await?;
            info!("Created configuration directory: {:?}", self.config_directory);
        }

        let mut entries = fs::read_dir(&self.config_directory).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();

            if path.is_file() && path.extension().map_or(false, |ext| ext == "toml" || ext == "json") {
                match self.load_configuration_file(&path).await {
                    Ok(config) => {
                        self.configurations.insert(config.plugin_id.clone(), config);
                    }
                    Err(e) => {
                        error!("Failed to load configuration file {:?}: {}", path, e);
                    }
                }
            }
        }

        info!("Loaded {} plugin configurations", self.configurations.len());
        Ok(())
    }

    /// Load a single configuration file
    #[instrument(skip(self))]
    async fn load_configuration_file(&self, path: &Path) -> PluginResult<PluginConfig> {
        debug!("Loading configuration file: {:?}", path);

        let content = fs::read_to_string(path).await?;
        let mut config = if path.extension().map_or(false, |ext| ext == "json") {
            self.parse_json_config(&content)?
        } else {
            self.parse_toml_config(&content)?
        };

        config.source = ConfigSource::File { path: path.to_path_buf() };
        config.updated_at = Utc::now();

        // Decrypt if necessary
        if config.encrypted {
            self.decrypt_config(&mut config)?;
        }

        // Validate configuration
        config.validate(&self.current_environment)?;

        debug!("Successfully loaded configuration for plugin: {}", config.plugin_id);
        Ok(config)
    }

    /// Parse JSON configuration
    fn parse_json_config(&self, content: &str) -> PluginResult<PluginConfig> {
        let json: JsonValue = serde_json::from_str(content)?;
        self.parse_config_json(json)
    }

    /// Parse TOML configuration
    fn parse_toml_config(&self, content: &str) -> PluginResult<PluginConfig> {
        let toml: toml::Value = toml::from_str(content)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("TOML parse error: {}", e),
            })?;

        // Convert TOML to JSON for unified processing
        let json = serde_json::to_value(toml)?;
        self.parse_config_json(json)
    }

    /// Parse configuration from JSON value
    fn parse_config_json(&self, json: JsonValue) -> PluginResult<PluginConfig> {
        let plugin_id = json.get("plugin_id")
            .and_then(|v| v.as_str())
            .ok_or_else(|| PluginError::ConfigurationInvalid {
                field: "missing plugin_id".to_string(),
            })?
            .to_string();

        let mut config = PluginConfig::new(plugin_id);

        // Parse base configuration
        if let Some(base_config) = json.get("config") {
            if let Some(base_obj) = base_config.as_object() {
                for (key, value) in base_obj {
                    config.base_config.insert(key.clone(), value.clone());
                }
            }
        }

        // Parse environment-specific configurations
        if let Some(environments) = json.get("environments") {
            if let Some(env_obj) = environments.as_object() {
                for (env_name, env_config) in env_obj {
                    let environment: ConfigEnvironment = env_name.parse()?;
                    if let Some(env_config_obj) = env_config.as_object() {
                        let mut env_map = HashMap::new();
                        for (key, value) in env_config_obj {
                            env_map.insert(key.clone(), value.clone());
                        }
                        config.environment_configs.insert(environment, env_map);
                    }
                }
            }
        }

        // Parse schema
        if let Some(schema) = json.get("schema") {
            config.schema = Some(schema.clone());
        }

        // Parse metadata
        if let Some(metadata) = json.get("metadata") {
            if let Some(metadata_obj) = metadata.as_object() {
                for (key, value) in metadata_obj {
                    if let Some(value_str) = value.as_str() {
                        config.metadata.insert(key.clone(), value_str.to_string());
                    }
                }
            }
        }

        // Parse encryption flag
        if let Some(encrypted) = json.get("encrypted") {
            config.encrypted = encrypted.as_bool().unwrap_or(false);
        }

        // Parse version
        if let Some(version) = json.get("version") {
            config.version = version.as_u64().unwrap_or(1);
        }

        Ok(config)
    }

    /// Save a plugin configuration to file
    #[instrument(skip(self, config))]
    pub async fn save_configuration(&mut self, config: &PluginConfig) -> PluginResult<()> {
        info!("Saving configuration for plugin: {}", config.plugin_id);

        let mut config_to_save = config.clone();

        // Encrypt if necessary
        if config_to_save.encrypted {
            self.encrypt_config(&mut config_to_save)?;
        }

        // Determine file path
        let file_path = match &config.source {
            ConfigSource::File { path } => path.clone(),
            _ => {
                let filename = format!("{}.toml", config.plugin_id);
                self.config_directory.join(filename)
            }
        };

        // Convert to TOML and save
        let toml_content = self.config_to_toml(&config_to_save)?;
        fs::write(&file_path, toml_content).await?;

        // Update in memory
        self.configurations.insert(config.plugin_id.clone(), config_to_save);

        info!("Successfully saved configuration for plugin: {}", config.plugin_id);
        Ok(())
    }

    /// Convert configuration to TOML string
    fn config_to_toml(&self, config: &PluginConfig) -> PluginResult<String> {
        let mut toml_value = toml::Value::Table(toml::value::Table::new());

        // Plugin ID
        if let toml::Value::Table(ref mut table) = toml_value {
            table.insert("plugin_id".to_string(), toml::Value::String(config.plugin_id.clone()));

            // Base config
            if !config.base_config.is_empty() {
                let base_config_toml = json_to_toml_value(&serde_json::json!(config.base_config))?;
                table.insert("config".to_string(), base_config_toml);
            }

            // Environment configs
            if !config.environment_configs.is_empty() {
                let mut env_table = toml::value::Table::new();
                for (env, env_config) in &config.environment_configs {
                    let env_toml = json_to_toml_value(&serde_json::json!(env_config))?;
                    env_table.insert(env.as_str().to_string(), env_toml);
                }
                table.insert("environments".to_string(), toml::Value::Table(env_table));
            }

            // Schema
            if let Some(schema) = &config.schema {
                let schema_toml = json_to_toml_value(schema)?;
                table.insert("schema".to_string(), schema_toml);
            }

            // Metadata
            if !config.metadata.is_empty() {
                let metadata_toml = json_to_toml_value(&serde_json::json!(config.metadata))?;
                table.insert("metadata".to_string(), metadata_toml);
            }

            // Other fields
            table.insert("encrypted".to_string(), toml::Value::Boolean(config.encrypted));
            table.insert("version".to_string(), toml::Value::Integer(config.version as i64));
        }

        toml::to_string(&toml_value).map_err(|e| PluginError::SerializationError {
            error: e.to_string(),
        })
    }

    /// Get plugin configuration for current environment
    pub fn get_plugin_config(&self, plugin_id: &str) -> Option<HashMap<String, JsonValue>> {
        self.configurations
            .get(plugin_id)
            .map(|config| config.get_effective_config(&self.current_environment))
    }

    /// Get plugin configuration for specific environment
    pub fn get_plugin_config_for_environment(
        &self,
        plugin_id: &str,
        environment: &ConfigEnvironment,
    ) -> Option<HashMap<String, JsonValue>> {
        self.configurations
            .get(plugin_id)
            .map(|config| config.get_effective_config(environment))
    }

    /// Update plugin configuration
    pub async fn update_plugin_config(
        &mut self,
        plugin_id: &str,
        updates: HashMap<String, JsonValue>,
    ) -> PluginResult<()> {
        let old_config = self.configurations.get(plugin_id).cloned();

        if let Some(mut config) = self.configurations.remove(plugin_id) {
            let old_config = config.clone();

            // Apply updates to base config
            for (key, value) in updates {
                config.set_base_config(key, value);
            }

            // Validate updated configuration
            config.validate(&self.current_environment)?;

            // Save configuration
            self.save_configuration(&config).await?;

            // Notify listeners
            for listener in &self.change_listeners {
                if let Err(e) = listener.on_config_changed(plugin_id, &old_config, &config).await {
                    warn!("Config change listener '{}' failed: {}", listener.name(), e);
                }
            }

            Ok(())
        } else {
            Err(PluginError::PluginNotFound {
                plugin_id: plugin_id.to_string(),
            })
        }
    }

    /// Create a new plugin configuration
    pub async fn create_plugin_config(
        &mut self,
        plugin_id: String,
        initial_config: HashMap<String, JsonValue>,
    ) -> PluginResult<()> {
        if self.configurations.contains_key(&plugin_id) {
            return Err(PluginError::ConfigurationInvalid {
                field: format!("Configuration for plugin '{}' already exists", plugin_id),
            });
        }

        let mut config = PluginConfig::new(plugin_id.clone());

        // Set initial configuration
        for (key, value) in initial_config {
            config.set_base_config(key, value);
        }

        // Validate configuration
        config.validate(&self.current_environment)?;

        // Save configuration
        self.save_configuration(&config).await?;

        info!("Created configuration for plugin: {}", plugin_id);
        Ok(())
    }

    /// Delete plugin configuration
    pub async fn delete_plugin_config(&mut self, plugin_id: &str) -> PluginResult<()> {
        if let Some(config) = self.configurations.remove(plugin_id) {
            // Remove configuration file if it exists
            if let ConfigSource::File { path } = config.source {
                if path.exists() {
                    fs::remove_file(&path).await?;
                }
            }

            info!("Deleted configuration for plugin: {}", plugin_id);
            Ok(())
        } else {
            Err(PluginError::PluginNotFound {
                plugin_id: plugin_id.to_string(),
            })
        }
    }

    /// List all plugin configurations
    pub fn list_configurations(&self) -> Vec<String> {
        self.configurations.keys().cloned().collect()
    }

    /// Get current environment
    pub fn current_environment(&self) -> &ConfigEnvironment {
        &self.current_environment
    }

    /// Set current environment
    pub fn set_environment(&mut self, environment: ConfigEnvironment) {
        self.current_environment = environment;
    }

    /// Encrypt configuration (placeholder implementation)
    fn encrypt_config(&self, _config: &mut PluginConfig) -> PluginResult<()> {
        // TODO: Implement actual encryption using the encryption key
        if self.encryption_key.is_none() {
            return Err(PluginError::ConfigurationInvalid {
                field: "Encryption key not set".to_string(),
            });
        }
        Ok(())
    }

    /// Decrypt configuration (placeholder implementation)
    fn decrypt_config(&self, _config: &mut PluginConfig) -> PluginResult<()> {
        // TODO: Implement actual decryption using the encryption key
        if self.encryption_key.is_none() {
            return Err(PluginError::ConfigurationInvalid {
                field: "Encryption key not set".to_string(),
            });
        }
        Ok(())
    }
}

/// Convert JSON value to TOML value
fn json_to_toml_value(json: &JsonValue) -> PluginResult<toml::Value> {
    match json {
        JsonValue::String(s) => Ok(toml::Value::String(s.clone())),
        JsonValue::Number(n) => {
            if let Some(i) = n.as_i64() {
                Ok(toml::Value::Integer(i))
            } else if let Some(f) = n.as_f64() {
                Ok(toml::Value::Float(f))
            } else {
                Err(PluginError::SerializationError {
                    error: "Invalid number format".to_string(),
                })
            }
        }
        JsonValue::Bool(b) => Ok(toml::Value::Boolean(*b)),
        JsonValue::Array(arr) => {
            let toml_arr: Result<Vec<_>, _> = arr.iter().map(json_to_toml_value).collect();
            Ok(toml::Value::Array(toml_arr?))
        }
        JsonValue::Object(obj) => {
            let mut toml_table = toml::value::Table::new();
            for (key, value) in obj {
                toml_table.insert(key.clone(), json_to_toml_value(value)?);
            }
            Ok(toml::Value::Table(toml_table))
        }
        JsonValue::Null => Ok(toml::Value::String("null".to_string())),
    }
}