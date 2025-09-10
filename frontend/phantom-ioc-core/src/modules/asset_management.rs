// Asset Management Module
// Track and manage security assets, inventory, and vulnerabilities

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: Uuid,
    pub name: String,
    pub asset_type: String,
    pub ip_address: Option<String>,
    pub mac_address: Option<String>,
    pub operating_system: Option<String>,
    pub owner: String,
    pub criticality: String,
    pub location: Option<String>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub last_scan: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vulnerability {
    pub id: Uuid,
    pub cve_id: Option<String>,
    pub severity: String,
    pub description: String,
    pub discovered_at: DateTime<Utc>,
    pub remediation_status: String,
}

#[napi]
pub struct AssetManager {
    assets: Vec<Asset>,
}

#[napi]
impl AssetManager {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { assets: Vec::new() })
    }

    #[napi]
    pub fn create_asset(&mut self, asset_json: String) -> Result<String> {
        let mut asset: Asset = serde_json::from_str(&asset_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse asset: {}", e)))?;
        
        asset.id = Uuid::new_v4();
        asset.created_at = Utc::now();
        asset.updated_at = Utc::now();
        
        let asset_id = asset.id.to_string();
        self.assets.push(asset);
        
        Ok(asset_id)
    }

    #[napi]
    pub fn get_asset(&self, asset_id: String) -> Result<String> {
        let id = Uuid::parse_str(&asset_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid asset ID: {}", e)))?;
        
        let asset = self.assets.iter()
            .find(|a| a.id == id)
            .ok_or_else(|| napi::Error::from_reason("Asset not found"))?;
        
        serde_json::to_string(asset)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize asset: {}", e)))
    }

    #[napi]
    pub fn get_asset_metrics(&self) -> Result<String> {
        let total_assets = self.assets.len();
        let critical_assets = self.assets.iter().filter(|a| a.criticality == "Critical").count();
        let vulnerable_assets = self.assets.iter().filter(|a| !a.vulnerabilities.is_empty()).count();
        
        let metrics = serde_json::json!({
            "total_assets": total_assets,
            "critical_assets": critical_assets,
            "vulnerable_assets": vulnerable_assets,
            "coverage_percentage": 100.0
        });
        
        Ok(metrics.to_string())
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "assets_count": self.assets.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}