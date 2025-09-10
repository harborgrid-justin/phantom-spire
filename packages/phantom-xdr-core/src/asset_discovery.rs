use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use std::collections::HashMap;
use napi_derive::napi;

#[async_trait]
pub trait AssetDiscoveryTrait {
    async fn discover_assets(&self, scan_config: AssetScanConfig) -> AssetDiscoveryResult;
    async fn update_asset_inventory(&self, asset: Asset) -> Result<(), String>;
    async fn get_asset_by_id(&self, asset_id: &str) -> Option<Asset>;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Clone)]
pub struct AssetDiscoveryEngine {
    assets: Arc<DashMap<String, Asset>>,
    scan_results: Arc<DashMap<String, AssetDiscoveryResult>>,
    processed_scans: Arc<RwLock<u64>>,
    discovered_assets: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AssetScanConfig {
    pub scan_id: String,
    pub scan_type: String, // "network", "active_directory", "cloud", "endpoint"
    pub target_range: String,
    pub scan_depth: String, // "basic", "detailed", "comprehensive"
    pub include_services: bool,
    pub include_vulnerabilities: bool,
    pub credentials: Option<String>, // JSON string of credentials
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Asset {
    pub id: String,
    pub name: String,
    pub asset_type: String, // "server", "workstation", "network_device", "mobile", "iot"
    pub ip_addresses: Vec<String>,
    pub mac_addresses: Vec<String>,
    pub operating_system: Option<String>,
    pub os_version: Option<String>,
    pub services: Vec<AssetService>,
    pub criticality: String, // "critical", "high", "medium", "low"
    pub owner: Option<String>,
    pub location: Option<String>,
    pub tags: Vec<String>,
    pub first_discovered: i64,
    pub last_updated: i64,
    pub status: String, // "active", "inactive", "decomissioned"
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AssetService {
    pub port: u16,
    pub protocol: String,
    pub service_name: String,
    pub version: Option<String>,
    pub banner: Option<String>,
    pub ssl_info: Option<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AssetDiscoveryResult {
    pub scan_id: String,
    pub status: String, // "completed", "running", "failed"
    pub total_assets_found: u32,
    pub new_assets: u32,
    pub updated_assets: u32,
    pub inactive_assets: u32,
    pub scan_duration: i64, // milliseconds
    pub errors: Vec<String>,
    pub timestamp: i64,
}

impl AssetDiscoveryEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            assets: Arc::new(DashMap::new()),
            scan_results: Arc::new(DashMap::new()),
            processed_scans: Arc::new(RwLock::new(0)),
            discovered_assets: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        // Initialize with some sample assets
        engine.initialize_sample_assets();
        engine
    }

    fn initialize_sample_assets(&self) {
        let sample_assets = vec![
            Asset {
                id: "asset-001".to_string(),
                name: "DC-PRIMARY".to_string(),
                asset_type: "server".to_string(),
                ip_addresses: vec!["10.0.1.10".to_string()],
                mac_addresses: vec!["00:1B:44:11:3A:B7".to_string()],
                operating_system: Some("Windows Server 2022".to_string()),
                os_version: Some("10.0.20348".to_string()),
                services: vec![
                    AssetService {
                        port: 53,
                        protocol: "UDP".to_string(),
                        service_name: "DNS".to_string(),
                        version: Some("Windows DNS".to_string()),
                        banner: None,
                        ssl_info: None,
                    },
                    AssetService {
                        port: 389,
                        protocol: "TCP".to_string(),
                        service_name: "LDAP".to_string(),
                        version: Some("Active Directory".to_string()),
                        banner: None,
                        ssl_info: None,
                    },
                ],
                criticality: "critical".to_string(),
                owner: Some("IT-Infrastructure".to_string()),
                location: Some("Datacenter-A".to_string()),
                tags: vec!["domain-controller".to_string(), "critical-infrastructure".to_string()],
                first_discovered: (Utc::now() - chrono::Duration::days(30)).timestamp(),
                last_updated: Utc::now().timestamp(),
                status: "active".to_string(),
            },
            Asset {
                id: "asset-002".to_string(),
                name: "WEB-SERVER-01".to_string(),
                asset_type: "server".to_string(),
                ip_addresses: vec!["10.0.2.15".to_string()],
                mac_addresses: vec!["00:1B:44:11:3A:C5".to_string()],
                operating_system: Some("Ubuntu 22.04".to_string()),
                os_version: Some("22.04.3".to_string()),
                services: vec![
                    AssetService {
                        port: 80,
                        protocol: "TCP".to_string(),
                        service_name: "HTTP".to_string(),
                        version: Some("nginx/1.18.0".to_string()),
                        banner: Some("nginx/1.18.0 (Ubuntu)".to_string()),
                        ssl_info: None,
                    },
                    AssetService {
                        port: 443,
                        protocol: "TCP".to_string(),
                        service_name: "HTTPS".to_string(),
                        version: Some("nginx/1.18.0".to_string()),
                        banner: Some("nginx/1.18.0 (Ubuntu)".to_string()),
                        ssl_info: Some("TLSv1.2, TLSv1.3".to_string()),
                    },
                ],
                criticality: "high".to_string(),
                owner: Some("Web-Team".to_string()),
                location: Some("DMZ".to_string()),
                tags: vec!["web-server".to_string(), "public-facing".to_string()],
                first_discovered: (Utc::now() - chrono::Duration::days(15)).timestamp(),
                last_updated: Utc::now().timestamp(),
                status: "active".to_string(),
            },
        ];

        for asset in sample_assets {
            self.assets.insert(asset.id.clone(), asset);
        }
    }

    pub async fn get_all_assets(&self) -> Vec<Asset> {
        self.assets.iter().map(|entry| entry.value().clone()).collect()
    }

    pub async fn search_assets(&self, query: &str) -> Vec<Asset> {
        self.assets
            .iter()
            .filter(|entry| {
                let asset = entry.value();
                asset.name.to_lowercase().contains(&query.to_lowercase()) ||
                asset.ip_addresses.iter().any(|ip| ip.contains(query)) ||
                asset.tags.iter().any(|tag| tag.to_lowercase().contains(&query.to_lowercase()))
            })
            .map(|entry| entry.value().clone())
            .collect()
    }

    pub async fn get_assets_by_criticality(&self, criticality: &str) -> Vec<Asset> {
        self.assets
            .iter()
            .filter(|entry| entry.value().criticality == criticality)
            .map(|entry| entry.value().clone())
            .collect()
    }
}

#[async_trait]
impl AssetDiscoveryTrait for AssetDiscoveryEngine {
    async fn discover_assets(&self, scan_config: AssetScanConfig) -> AssetDiscoveryResult {
        let mut processed_scans = self.processed_scans.write().await;
        *processed_scans += 1;

        let start_time = Utc::now().timestamp_millis();

        // Simulate asset discovery process
        let mut new_assets = 0;
        let mut updated_assets = 0;

        // Simulate discovering new assets based on scan type
        match scan_config.scan_type.as_str() {
            "network" => {
                // Simulate network discovery
                for i in 1..=5 {
                    let asset = Asset {
                        id: format!("discovered-{}-{}", scan_config.scan_id, i),
                        name: format!("HOST-{:03}", i),
                        asset_type: "workstation".to_string(),
                        ip_addresses: vec![format!("10.0.3.{}", 10 + i)],
                        mac_addresses: vec![format!("00:1B:44:11:3A:{:02X}", 200 + i)],
                        operating_system: Some("Windows 11".to_string()),
                        os_version: Some("22H2".to_string()),
                        services: vec![
                            AssetService {
                                port: 135,
                                protocol: "TCP".to_string(),
                                service_name: "RPC".to_string(),
                                version: Some("Windows RPC".to_string()),
                                banner: None,
                                ssl_info: None,
                            },
                        ],
                        criticality: "medium".to_string(),
                        owner: Some("Unknown".to_string()),
                        location: Some("Corporate-LAN".to_string()),
                        tags: vec!["workstation".to_string(), "discovered".to_string()],
                        first_discovered: Utc::now().timestamp(),
                        last_updated: Utc::now().timestamp(),
                        status: "active".to_string(),
                    };

                    if !self.assets.contains_key(&asset.id) {
                        self.assets.insert(asset.id.clone(), asset);
                        new_assets += 1;
                    } else {
                        updated_assets += 1;
                    }
                }
            },
            "cloud" => {
                // Simulate cloud asset discovery
                for i in 1..=3 {
                    let asset = Asset {
                        id: format!("cloud-{}-{}", scan_config.scan_id, i),
                        name: format!("EC2-INSTANCE-{}", i),
                        asset_type: "server".to_string(),
                        ip_addresses: vec![format!("172.31.{}.{}", i, 10 + i)],
                        mac_addresses: vec![format!("02:42:AC:1F:{:02X}:{:02X}", i, 10 + i)],
                        operating_system: Some("Amazon Linux 2".to_string()),
                        os_version: Some("2023.2".to_string()),
                        services: vec![
                            AssetService {
                                port: 22,
                                protocol: "TCP".to_string(),
                                service_name: "SSH".to_string(),
                                version: Some("OpenSSH_7.4".to_string()),
                                banner: Some("SSH-2.0-OpenSSH_7.4".to_string()),
                                ssl_info: None,
                            },
                        ],
                        criticality: "high".to_string(),
                        owner: Some("Cloud-Team".to_string()),
                        location: Some("AWS-us-east-1".to_string()),
                        tags: vec!["cloud".to_string(), "aws".to_string(), "ec2".to_string()],
                        first_discovered: Utc::now().timestamp(),
                        last_updated: Utc::now().timestamp(),
                        status: "active".to_string(),
                    };

                    if !self.assets.contains_key(&asset.id) {
                        self.assets.insert(asset.id.clone(), asset);
                        new_assets += 1;
                    } else {
                        updated_assets += 1;
                    }
                }
            },
            _ => {
                // Default discovery - minimal assets
                new_assets = 1;
            }
        }

        let end_time = Utc::now().timestamp_millis();
        let total_assets = self.assets.len() as u32;

        let result = AssetDiscoveryResult {
            scan_id: scan_config.scan_id.clone(),
            status: "completed".to_string(),
            total_assets_found: total_assets,
            new_assets,
            updated_assets,
            inactive_assets: 0,
            scan_duration: end_time - start_time,
            errors: vec![],
            timestamp: Utc::now().timestamp(),
        };

        self.scan_results.insert(scan_config.scan_id, result.clone());

        // Update discovered assets counter
        let mut discovered_assets = self.discovered_assets.write().await;
        *discovered_assets = total_assets;

        result
    }

    async fn update_asset_inventory(&self, asset: Asset) -> Result<(), String> {
        let asset_id = asset.id.clone();
        self.assets.insert(asset_id, asset);
        Ok(())
    }

    async fn get_asset_by_id(&self, asset_id: &str) -> Option<Asset> {
        self.assets.get(asset_id).map(|entry| entry.value().clone())
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_scans = *self.processed_scans.read().await;
        let discovered_assets = *self.discovered_assets.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0, // Would need to track actual uptime
            processed_events: processed_scans as i64,
            active_alerts: discovered_assets,
            last_error,
        }
    }
}