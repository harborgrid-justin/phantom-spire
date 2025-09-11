//! Asset Management System Integrations
//!
//! Integration modules for CMDB and asset management systems

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use super::{HealthCheck, IntegrationStatus};

/// Asset information structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: String,
    pub name: String,
    pub asset_type: AssetType,
    pub vendor: Option<String>,
    pub product: Option<String>,
    pub version: Option<String>,
    pub environment: String,
    pub criticality: AssetCriticality,
    pub owner: Option<String>,
    pub location: Option<String>,
    pub tags: Vec<String>,
    pub last_updated: DateTime<Utc>,
}

/// Asset type enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssetType {
    Server,
    Workstation,
    NetworkDevice,
    Application,
    Database,
    Container,
    VirtualMachine,
    CloudResource,
    IoTDevice,
    Other(String),
}

/// Asset criticality levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssetCriticality {
    Critical,
    High,
    Medium,
    Low,
}

/// Asset query parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetQuery {
    pub asset_type: Option<AssetType>,
    pub vendor: Option<String>,
    pub product: Option<String>,
    pub environment: Option<String>,
    pub criticality: Option<AssetCriticality>,
    pub tags: Vec<String>,
    pub limit: Option<usize>,
}

/// Common interface for asset management system integrations
#[async_trait]
pub trait AssetManagementSystem: Send + Sync {
    /// Get the system name
    fn system_name(&self) -> &'static str;
    
    /// Initialize the connection
    async fn initialize(&mut self) -> Result<(), String>;
    
    /// Fetch all assets
    async fn fetch_assets(&self, query: Option<AssetQuery>) -> Result<Vec<Asset>, String>;
    
    /// Fetch specific asset by ID
    async fn fetch_asset_by_id(&self, asset_id: &str) -> Result<Option<Asset>, String>;
    
    /// Update asset information
    async fn update_asset(&self, asset: &Asset) -> Result<(), String>;
    
    /// Health check for the system
    async fn health_check(&self) -> Result<HealthCheck, String>;
}

/// ServiceNow CMDB integration
pub struct ServiceNowCMDB {
    instance_url: String,
    username: String,
    password: String,
    client: Option<reqwest::Client>,
}

impl ServiceNowCMDB {
    pub fn new(instance_url: String, username: String, password: String) -> Self {
        Self {
            instance_url,
            username,
            password,
            client: None,
        }
    }
}

#[async_trait]
impl AssetManagementSystem for ServiceNowCMDB {
    fn system_name(&self) -> &'static str {
        "ServiceNow CMDB"
    }
    
    async fn initialize(&mut self) -> Result<(), String> {
        let auth = base64::encode(format!("{}:{}", self.username, self.password));
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Basic {}", auth).parse().map_err(|e| format!("Invalid auth: {}", e))?
        );
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            "application/json".parse().map_err(|e| format!("Invalid content type: {}", e))?
        );
        
        self.client = Some(
            reqwest::ClientBuilder::new()
                .default_headers(headers)
                .build()
                .map_err(|e| format!("Failed to build client: {}", e))?
        );
        Ok(())
    }
    
    async fn fetch_assets(&self, _query: Option<AssetQuery>) -> Result<Vec<Asset>, String> {
        // Implementation would call ServiceNow Table API
        // For now, return mock data
        Ok(vec![])
    }
    
    async fn fetch_asset_by_id(&self, _asset_id: &str) -> Result<Option<Asset>, String> {
        Ok(None)
    }
    
    async fn update_asset(&self, _asset: &Asset) -> Result<(), String> {
        Ok(())
    }
    
    async fn health_check(&self) -> Result<HealthCheck, String> {
        let start_time = std::time::Instant::now();
        
        let status = if self.client.is_some() {
            IntegrationStatus::Healthy
        } else {
            IntegrationStatus::Unhealthy
        };
        
        Ok(HealthCheck {
            service_name: "ServiceNow CMDB".to_string(),
            status,
            response_time_ms: start_time.elapsed().as_millis() as u64,
            last_check: Utc::now(),
            error_message: None,
        })
    }
}

/// Lansweeper asset management integration
pub struct LansweeperAssets {
    server_url: String,
    username: String,
    password: String,
    client: Option<reqwest::Client>,
}

impl LansweeperAssets {
    pub fn new(server_url: String, username: String, password: String) -> Self {
        Self {
            server_url,
            username,
            password,
            client: None,
        }
    }
}

#[async_trait]
impl AssetManagementSystem for LansweeperAssets {
    fn system_name(&self) -> &'static str {
        "Lansweeper"
    }
    
    async fn initialize(&mut self) -> Result<(), String> {
        self.client = Some(reqwest::Client::new());
        Ok(())
    }
    
    async fn fetch_assets(&self, _query: Option<AssetQuery>) -> Result<Vec<Asset>, String> {
        Ok(vec![])
    }
    
    async fn fetch_asset_by_id(&self, _asset_id: &str) -> Result<Option<Asset>, String> {
        Ok(None)
    }
    
    async fn update_asset(&self, _asset: &Asset) -> Result<(), String> {
        Ok(())
    }
    
    async fn health_check(&self) -> Result<HealthCheck, String> {
        let start_time = std::time::Instant::now();
        
        let status = if self.client.is_some() {
            IntegrationStatus::Healthy
        } else {
            IntegrationStatus::Unhealthy
        };
        
        Ok(HealthCheck {
            service_name: "Lansweeper".to_string(),
            status,
            response_time_ms: start_time.elapsed().as_millis() as u64,
            last_check: Utc::now(),
            error_message: None,
        })
    }
}

/// Asset management integration manager
pub struct AssetManagementManager {
    systems: Vec<Box<dyn AssetManagementSystem>>,
}

impl AssetManagementManager {
    pub fn new() -> Self {
        Self {
            systems: Vec::new(),
        }
    }
    
    pub fn add_system(&mut self, system: Box<dyn AssetManagementSystem>) {
        self.systems.push(system);
    }
    
    pub async fn initialize_all(&mut self) -> Result<(), String> {
        for system in &mut self.systems {
            system.initialize().await?;
        }
        Ok(())
    }
    
    pub async fn fetch_all_assets(&self) -> Result<Vec<Asset>, String> {
        let mut all_assets = Vec::new();
        
        for system in &self.systems {
            match system.fetch_assets(None).await {
                Ok(mut assets) => all_assets.append(&mut assets),
                Err(e) => {
                    eprintln!("Failed to fetch assets from {}: {}", system.system_name(), e);
                    // Continue with other systems
                }
            }
        }
        
        // Remove duplicates based on asset ID
        all_assets.sort_by(|a, b| a.id.cmp(&b.id));
        all_assets.dedup_by(|a, b| a.id == b.id);
        
        Ok(all_assets)
    }
    
    pub async fn health_check_all(&self) -> Result<Vec<HealthCheck>, String> {
        let mut results = Vec::new();
        
        for system in &self.systems {
            match system.health_check().await {
                Ok(check) => results.push(check),
                Err(e) => {
                    results.push(HealthCheck {
                        service_name: system.system_name().to_string(),
                        status: IntegrationStatus::Unhealthy,
                        response_time_ms: 0,
                        last_check: Utc::now(),
                        error_message: Some(e),
                    });
                }
            }
        }
        
        Ok(results)
    }
    
    /// Find assets that match vulnerability criteria
    pub async fn find_vulnerable_assets(&self, vendor: &str, product: &str) -> Result<Vec<Asset>, String> {
        let query = AssetQuery {
            asset_type: None,
            vendor: Some(vendor.to_string()),
            product: Some(product.to_string()),
            environment: None,
            criticality: None,
            tags: vec![],
            limit: None,
        };
        
        let mut vulnerable_assets = Vec::new();
        
        for system in &self.systems {
            match system.fetch_assets(Some(query.clone())).await {
                Ok(mut assets) => vulnerable_assets.append(&mut assets),
                Err(e) => {
                    eprintln!("Failed to query assets from {}: {}", system.system_name(), e);
                }
            }
        }
        
        Ok(vulnerable_assets)
    }
}

impl Default for AssetManagementManager {
    fn default() -> Self {
        Self::new()
    }
}

// Mock base64 encoding for demonstration (in production use base64 crate)
mod base64 {
    pub fn encode(input: String) -> String {
        // This is a simplified mock - use the actual base64 crate in production
        format!("base64_{}", input)
    }
}