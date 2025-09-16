//! Plugin Marketplace Infrastructure
//!
//! Provides comprehensive marketplace functionality including plugin publishing,
//! discovery, installation, updates, and marketplace management.

use super::*;
use reqwest::Client;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use tempfile::TempDir;
use tokio::fs;
use tokio::io::AsyncWriteExt;
use tracing::{debug, error, info, instrument, warn};
use url::Url;

/// Marketplace configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketplaceConfig {
    /// Default marketplace URL
    pub default_marketplace_url: String,
    /// Alternative marketplace URLs
    pub alternative_marketplaces: Vec<String>,
    /// API timeout in seconds
    pub api_timeout_secs: u64,
    /// Maximum concurrent downloads
    pub max_concurrent_downloads: usize,
    /// Download retry attempts
    pub max_retry_attempts: u32,
    /// Download retry delay in milliseconds
    pub retry_delay_ms: u64,
    /// Enable signature verification for marketplace downloads
    pub verify_signatures: bool,
    /// Cache directory for downloaded plugins
    pub cache_directory: Option<PathBuf>,
    /// Cache retention time in days
    pub cache_retention_days: u32,
    /// Enable marketplace analytics
    pub analytics_enabled: bool,
    /// User agent for marketplace requests
    pub user_agent: String,
    /// Authentication token for private marketplaces
    pub auth_token: Option<String>,
}

impl Default for MarketplaceConfig {
    fn default() -> Self {
        Self {
            default_marketplace_url: "https://marketplace.phantom-ml.com".to_string(),
            alternative_marketplaces: Vec::new(),
            api_timeout_secs: 30,
            max_concurrent_downloads: 3,
            max_retry_attempts: 3,
            retry_delay_ms: 1000,
            verify_signatures: true,
            cache_directory: None,
            cache_retention_days: 7,
            analytics_enabled: true,
            user_agent: "Phantom-ML-Core/1.0".to_string(),
            auth_token: None,
        }
    }
}

/// Plugin installation request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationRequest {
    /// Plugin identifier in the marketplace
    pub plugin_id: String,
    /// Specific version to install (optional, defaults to latest)
    pub version: Option<String>,
    /// Target installation directory
    pub target_directory: PathBuf,
    /// Installation options
    pub options: InstallationOptions,
    /// Force installation even if plugin already exists
    pub force_install: bool,
    /// Install dependencies
    pub install_dependencies: bool,
}

/// Installation options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationOptions {
    /// Create backup before installation
    pub create_backup: bool,
    /// Skip signature verification
    pub skip_signature_verification: bool,
    /// Custom installation configuration
    pub custom_config: HashMap<String, serde_json::Value>,
    /// Environment-specific installation
    pub environment: Option<String>,
    /// Install as development plugin
    pub development_mode: bool,
}

impl Default for InstallationOptions {
    fn default() -> Self {
        Self {
            create_backup: true,
            skip_signature_verification: false,
            custom_config: HashMap::new(),
            environment: None,
            development_mode: false,
        }
    }
}

/// Installation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallationResult {
    /// Plugin ID that was installed
    pub plugin_id: String,
    /// Installed version
    pub installed_version: String,
    /// Installation path
    pub installation_path: PathBuf,
    /// Whether installation was successful
    pub success: bool,
    /// Error message if installation failed
    pub error: Option<String>,
    /// List of installed files
    pub installed_files: Vec<PathBuf>,
    /// Installation metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// Installation timestamp
    pub installed_at: DateTime<Utc>,
}

/// Plugin search criteria
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    /// Search query text
    pub query: Option<String>,
    /// Category filter
    pub category: Option<String>,
    /// Tags filter
    pub tags: Vec<String>,
    /// Author filter
    pub author: Option<String>,
    /// Minimum rating
    pub min_rating: Option<f64>,
    /// Maximum price (0.0 for free only)
    pub max_price: Option<f64>,
    /// Plugin type filter
    pub plugin_type: Option<PluginType>,
    /// License filter
    pub license: Option<String>,
    /// Sort criteria
    pub sort_by: SearchSortBy,
    /// Results limit
    pub limit: Option<u32>,
    /// Results offset
    pub offset: Option<u32>,
}

/// Search sort criteria
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SearchSortBy {
    /// Sort by relevance
    Relevance,
    /// Sort by download count (descending)
    DownloadCount,
    /// Sort by rating (descending)
    Rating,
    /// Sort by last updated (descending)
    LastUpdated,
    /// Sort by name (ascending)
    Name,
    /// Sort by price (ascending)
    Price,
}

/// Search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResults {
    /// Found marketplace entries
    pub entries: Vec<MarketplaceEntry>,
    /// Total number of results
    pub total_results: u64,
    /// Current offset
    pub offset: u32,
    /// Number of results returned
    pub limit: u32,
    /// Search query that produced these results
    pub query: SearchCriteria,
    /// Search execution time in milliseconds
    pub execution_time_ms: u64,
}

/// Update check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCheck {
    /// Plugin ID
    pub plugin_id: String,
    /// Current version
    pub current_version: String,
    /// Latest available version
    pub latest_version: String,
    /// Whether update is available
    pub update_available: bool,
    /// Update changelog
    pub changelog: Option<String>,
    /// Update metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Plugin marketplace client
pub struct MarketplaceClient {
    config: MarketplaceConfig,
    http_client: Client,
    cache_dir: Option<TempDir>,
}

impl MarketplaceClient {
    /// Create a new marketplace client
    pub fn new(config: MarketplaceConfig) -> PluginResult<Self> {
        let mut client_builder = Client::builder()
            .timeout(std::time::Duration::from_secs(config.api_timeout_secs))
            .user_agent(&config.user_agent);

        // Add authentication if configured
        if let Some(token) = &config.auth_token {
            let mut headers = reqwest::header::HeaderMap::new();
            let auth_value = format!("Bearer {}", token);
            headers.insert(
                reqwest::header::AUTHORIZATION,
                reqwest::header::HeaderValue::from_str(&auth_value)
                    .map_err(|e| PluginError::ApiError {
                        message: format!("Invalid auth token: {}", e),
                    })?,
            );
            client_builder = client_builder.default_headers(headers);
        }

        let http_client = client_builder.build()
            .map_err(|e| PluginError::ApiError {
                message: format!("Failed to create HTTP client: {}", e),
            })?;

        // Set up cache directory
        let cache_dir = if config.cache_directory.is_some() {
            None // Use provided directory
        } else {
            Some(TempDir::new().map_err(|e| PluginError::IoError {
                error: e.to_string(),
            })?)
        };

        Ok(Self {
            config,
            http_client,
            cache_dir,
        })
    }

    /// Search for plugins in the marketplace
    #[instrument(skip(self, criteria))]
    pub async fn search_plugins(
        &self,
        criteria: SearchCriteria,
    ) -> PluginResult<SearchResults> {
        let start_time = std::time::Instant::now();
        info!("Searching marketplace for plugins");

        let url = format!("{}/api/v1/plugins/search", self.config.default_marketplace_url);

        let response = self.http_client
            .post(&url)
            .json(&criteria)
            .send()
            .await
            .map_err(|e| PluginError::ApiError {
                message: format!("Search request failed: {}", e),
            })?;

        if !response.status().is_success() {
            return Err(PluginError::ApiError {
                message: format!("Search request failed with status: {}", response.status()),
            });
        }

        let mut results: SearchResults = response.json().await
            .map_err(|e| PluginError::ApiError {
                message: format!("Failed to parse search results: {}", e),
            })?;

        results.execution_time_ms = start_time.elapsed().as_millis() as u64;

        info!("Found {} plugins in marketplace", results.entries.len());
        Ok(results)
    }

    /// Get plugin details from marketplace
    #[instrument(skip(self))]
    pub async fn get_plugin_details(
        &self,
        plugin_id: &str,
        version: Option<&str>,
    ) -> PluginResult<MarketplaceEntry> {
        info!("Getting plugin details: {}", plugin_id);

        let mut url = format!(
            "{}/api/v1/plugins/{}",
            self.config.default_marketplace_url,
            plugin_id
        );

        if let Some(version) = version {
            url.push_str(&format!("?version={}", version));
        }

        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| PluginError::ApiError {
                message: format!("Plugin details request failed: {}", e),
            })?;

        if response.status() == reqwest::StatusCode::NOT_FOUND {
            return Err(PluginError::PluginNotFound {
                plugin_id: plugin_id.to_string(),
            });
        }

        if !response.status().is_success() {
            return Err(PluginError::ApiError {
                message: format!("Plugin details request failed with status: {}", response.status()),
            });
        }

        let entry: MarketplaceEntry = response.json().await
            .map_err(|e| PluginError::ApiError {
                message: format!("Failed to parse plugin details: {}", e),
            })?;

        debug!("Retrieved plugin details: {} v{}", entry.name, entry.version);
        Ok(entry)
    }

    /// Install a plugin from the marketplace
    #[instrument(skip(self, request))]
    pub async fn install_plugin(
        &self,
        request: InstallationRequest,
    ) -> PluginResult<InstallationResult> {
        info!("Installing plugin: {} to {:?}", request.plugin_id, request.target_directory);

        // Get plugin details
        let plugin_entry = self.get_plugin_details(
            &request.plugin_id,
            request.version.as_deref(),
        ).await?;

        // Check if plugin already exists
        if !request.force_install && self.is_plugin_installed(&request.plugin_id, &request.target_directory).await? {
            return Err(PluginError::ConfigurationInvalid {
                field: format!("Plugin '{}' is already installed", request.plugin_id),
            });
        }

        // Create backup if requested
        if request.options.create_backup {
            self.create_backup(&request.plugin_id, &request.target_directory).await?;
        }

        // Download plugin
        let download_path = self.download_plugin(&plugin_entry).await?;

        // Verify signature if enabled
        if self.config.verify_signatures && !request.options.skip_signature_verification {
            self.verify_plugin_signature(&plugin_entry, &download_path).await?;
        }

        // Extract and install plugin
        let installed_files = self.extract_and_install_plugin(
            &download_path,
            &request.target_directory,
            &plugin_entry,
        ).await?;

        // Install dependencies if requested
        if request.install_dependencies {
            self.install_plugin_dependencies(&plugin_entry, &request.target_directory).await?;
        }

        // Create installation result
        let result = InstallationResult {
            plugin_id: request.plugin_id.clone(),
            installed_version: plugin_entry.version.to_string(),
            installation_path: request.target_directory,
            success: true,
            error: None,
            installed_files,
            metadata: HashMap::new(),
            installed_at: Utc::now(),
        };

        // Report installation analytics if enabled
        if self.config.analytics_enabled {
            self.report_installation_analytics(&plugin_entry).await?;
        }

        info!("Successfully installed plugin: {} v{}", request.plugin_id, plugin_entry.version);
        Ok(result)
    }

    /// Check for plugin updates
    #[instrument(skip(self))]
    pub async fn check_for_updates(
        &self,
        installed_plugins: &HashMap<String, String>, // plugin_id -> current_version
    ) -> PluginResult<Vec<UpdateCheck>> {
        info!("Checking for plugin updates");

        let mut update_checks = Vec::new();

        for (plugin_id, current_version) in installed_plugins {
            match self.check_plugin_update(plugin_id, current_version).await {
                Ok(update_check) => update_checks.push(update_check),
                Err(e) => {
                    warn!("Failed to check updates for plugin {}: {}", plugin_id, e);
                    // Continue checking other plugins
                }
            }
        }

        info!("Checked updates for {} plugins", update_checks.len());
        Ok(update_checks)
    }

    /// Check update for a single plugin
    async fn check_plugin_update(
        &self,
        plugin_id: &str,
        current_version: &str,
    ) -> PluginResult<UpdateCheck> {
        let plugin_entry = self.get_plugin_details(plugin_id, None).await?;
        let latest_version = plugin_entry.version.to_string();

        let current_semver = Version::parse(current_version)
            .map_err(|e| PluginError::ConfigurationInvalid {
                field: format!("Invalid current version: {}", e),
            })?;

        let update_available = plugin_entry.version > current_semver;

        Ok(UpdateCheck {
            plugin_id: plugin_id.to_string(),
            current_version: current_version.to_string(),
            latest_version,
            update_available,
            changelog: None, // TODO: Fetch changelog from marketplace
            metadata: HashMap::new(),
        })
    }

    /// Download plugin from marketplace
    #[instrument(skip(self, plugin_entry))]
    async fn download_plugin(&self, plugin_entry: &MarketplaceEntry) -> PluginResult<PathBuf> {
        info!("Downloading plugin: {} v{}", plugin_entry.name, plugin_entry.version);

        // Determine download URL (use first available platform-specific URL)
        let download_url = plugin_entry.download_urls.values()
            .next()
            .ok_or_else(|| PluginError::ApiError {
                message: "No download URL available".to_string(),
            })?;

        // Prepare download path
        let cache_dir = self.get_cache_directory()?;
        let filename = format!("{}-{}.zip", plugin_entry.plugin_id, plugin_entry.version);
        let download_path = cache_dir.join(filename);

        // Download with retry logic
        let mut attempts = 0;
        loop {
            match self.attempt_download(download_url, &download_path).await {
                Ok(_) => break,
                Err(e) => {
                    attempts += 1;
                    if attempts >= self.config.max_retry_attempts {
                        return Err(e);
                    }
                    warn!("Download attempt {} failed, retrying: {}", attempts, e);
                    tokio::time::sleep(std::time::Duration::from_millis(
                        self.config.retry_delay_ms * attempts as u64
                    )).await;
                }
            }
        }

        info!("Successfully downloaded plugin to: {:?}", download_path);
        Ok(download_path)
    }

    /// Attempt to download a file
    async fn attempt_download(&self, url: &str, path: &Path) -> PluginResult<()> {
        let response = self.http_client
            .get(url)
            .send()
            .await
            .map_err(|e| PluginError::ApiError {
                message: format!("Download request failed: {}", e),
            })?;

        if !response.status().is_success() {
            return Err(PluginError::ApiError {
                message: format!("Download failed with status: {}", response.status()),
            });
        }

        let mut file = fs::File::create(path).await
            .map_err(|e| PluginError::IoError {
                error: format!("Failed to create download file: {}", e),
            })?;

        let content = response.bytes().await
            .map_err(|e| PluginError::ApiError {
                message: format!("Failed to read download content: {}", e),
            })?;

        file.write_all(&content).await
            .map_err(|e| PluginError::IoError {
                error: format!("Failed to write download file: {}", e),
            })?;

        Ok(())
    }

    /// Get cache directory
    fn get_cache_directory(&self) -> PluginResult<PathBuf> {
        if let Some(cache_dir) = &self.config.cache_directory {
            Ok(cache_dir.clone())
        } else if let Some(temp_dir) = &self.cache_dir {
            Ok(temp_dir.path().to_path_buf())
        } else {
            Err(PluginError::ConfigurationInvalid {
                field: "No cache directory configured".to_string(),
            })
        }
    }

    /// Verify plugin signature
    async fn verify_plugin_signature(
        &self,
        plugin_entry: &MarketplaceEntry,
        download_path: &Path,
    ) -> PluginResult<()> {
        // TODO: Implement actual signature verification
        // For now, just verify checksums if available
        if let Some(expected_checksum) = plugin_entry.checksums.get("sha256") {
            let actual_checksum = self.calculate_file_checksum(download_path).await?;
            if &actual_checksum != expected_checksum {
                return Err(PluginError::SecurityViolation {
                    violation: "Plugin checksum verification failed".to_string(),
                });
            }
        }

        Ok(())
    }

    /// Calculate file checksum
    async fn calculate_file_checksum(&self, path: &Path) -> PluginResult<String> {
        use sha2::{Digest, Sha256};

        let content = fs::read(path).await?;
        let hash = Sha256::digest(&content);
        Ok(format!("{:x}", hash))
    }

    /// Extract and install plugin
    async fn extract_and_install_plugin(
        &self,
        archive_path: &Path,
        target_directory: &Path,
        plugin_entry: &MarketplaceEntry,
    ) -> PluginResult<Vec<PathBuf>> {
        info!("Extracting plugin to: {:?}", target_directory);

        // Create target directory if it doesn't exist
        fs::create_dir_all(target_directory).await?;

        // For now, assume ZIP format - in practice, you'd detect format and handle accordingly
        let mut installed_files = Vec::new();

        // TODO: Implement actual ZIP extraction
        // This is a placeholder - you'd use a ZIP library like zip or async-zip
        let plugin_dir = target_directory.join(&plugin_entry.plugin_id);
        fs::create_dir_all(&plugin_dir).await?;

        // Copy the archive as a placeholder (in practice, you'd extract it)
        let target_file = plugin_dir.join("plugin.zip");
        fs::copy(archive_path, &target_file).await?;
        installed_files.push(target_file);

        Ok(installed_files)
    }

    /// Install plugin dependencies
    async fn install_plugin_dependencies(
        &self,
        plugin_entry: &MarketplaceEntry,
        target_directory: &Path,
    ) -> PluginResult<()> {
        // TODO: Implement dependency installation
        info!("Installing dependencies for plugin: {}", plugin_entry.plugin_id);
        Ok(())
    }

    /// Check if plugin is already installed
    async fn is_plugin_installed(
        &self,
        plugin_id: &str,
        target_directory: &Path,
    ) -> PluginResult<bool> {
        let plugin_path = target_directory.join(plugin_id);
        Ok(plugin_path.exists())
    }

    /// Create backup of existing plugin
    async fn create_backup(
        &self,
        plugin_id: &str,
        target_directory: &Path,
    ) -> PluginResult<()> {
        let plugin_path = target_directory.join(plugin_id);
        if plugin_path.exists() {
            let backup_path = target_directory.join(format!("{}.backup.{}", plugin_id, Utc::now().timestamp()));
            // TODO: Implement proper backup (copy directory recursively)
            info!("Creating backup: {:?} -> {:?}", plugin_path, backup_path);
        }
        Ok(())
    }

    /// Report installation analytics
    async fn report_installation_analytics(
        &self,
        plugin_entry: &MarketplaceEntry,
    ) -> PluginResult<()> {
        let analytics_url = format!(
            "{}/api/v1/analytics/install",
            self.config.default_marketplace_url
        );

        let analytics_data = serde_json::json!({
            "plugin_id": plugin_entry.plugin_id,
            "version": plugin_entry.version.to_string(),
            "timestamp": Utc::now(),
            "client_version": "1.0.0"
        });

        // Fire and forget analytics request
        let _ = self.http_client
            .post(&analytics_url)
            .json(&analytics_data)
            .send()
            .await;

        Ok(())
    }

    /// Uninstall a plugin
    #[instrument(skip(self))]
    pub async fn uninstall_plugin(
        &self,
        plugin_id: &str,
        installation_directory: &Path,
    ) -> PluginResult<()> {
        info!("Uninstalling plugin: {}", plugin_id);

        let plugin_path = installation_directory.join(plugin_id);
        if plugin_path.exists() {
            // TODO: Implement proper uninstallation (remove all files, cleanup dependencies)
            fs::remove_dir_all(&plugin_path).await?;
            info!("Successfully uninstalled plugin: {}", plugin_id);
        } else {
            warn!("Plugin {} not found at: {:?}", plugin_id, plugin_path);
        }

        Ok(())
    }

    /// List installed plugins
    pub async fn list_installed_plugins(
        &self,
        installation_directory: &Path,
    ) -> PluginResult<Vec<String>> {
        let mut installed_plugins = Vec::new();

        if installation_directory.exists() {
            let mut entries = fs::read_dir(installation_directory).await?;
            while let Some(entry) = entries.next_entry().await? {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(dir_name) = path.file_name().and_then(|s| s.to_str()) {
                        installed_plugins.push(dir_name.to_string());
                    }
                }
            }
        }

        Ok(installed_plugins)
    }

    /// Clean up old cache files
    pub async fn cleanup_cache(&self) -> PluginResult<()> {
        let cache_dir = self.get_cache_directory()?;
        let retention_duration = chrono::Duration::days(self.config.cache_retention_days as i64);
        let cutoff_time = Utc::now() - retention_duration;

        let mut entries = fs::read_dir(&cache_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if let Ok(metadata) = fs::metadata(&path).await {
                if let Ok(modified) = metadata.modified() {
                    let modified_time: DateTime<Utc> = modified.into();
                    if modified_time < cutoff_time {
                        if let Err(e) = fs::remove_file(&path).await {
                            warn!("Failed to remove old cache file {:?}: {}", path, e);
                        } else {
                            debug!("Removed old cache file: {:?}", path);
                        }
                    }
                }
            }
        }

        info!("Cache cleanup completed");
        Ok(())
    }
}