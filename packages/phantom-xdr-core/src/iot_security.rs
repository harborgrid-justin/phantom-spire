// IoT Security Engine for XDR Platform
use async_trait::async_trait;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IoTDevice {
    pub device_id: String,
    pub device_type: String,
    pub name: String,
    pub manufacturer: String,
    pub firmware_version: String,
    pub ip_address: String,
    pub mac_address: String,
    pub security_score: f64,
    pub last_seen: i64,
}

#[async_trait]
pub trait IoTSecurityTrait {
    async fn register_device(&self, device: IoTDevice) -> Result<String, String>;
    async fn scan_vulnerabilities(&self, device_id: &str) -> Vec<String>;
    async fn get_iot_security_status(&self) -> String;
}

#[derive(Clone)]
pub struct IoTSecurityEngine {
    devices: Arc<DashMap<String, IoTDevice>>,
    scanned_devices: Arc<RwLock<u64>>,
    vulnerabilities_found: Arc<RwLock<u64>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl IoTSecurityEngine {
    pub fn new() -> Self {
        Self {
            devices: Arc::new(DashMap::new()),
            scanned_devices: Arc::new(RwLock::new(0)),
            vulnerabilities_found: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }
}

#[async_trait]
impl IoTSecurityTrait for IoTSecurityEngine {
    async fn register_device(&self, device: IoTDevice) -> Result<String, String> {
        let device_id = device.device_id.clone();
        self.devices.insert(device_id.clone(), device);
        Ok(device_id)
    }

    async fn scan_vulnerabilities(&self, _device_id: &str) -> Vec<String> {
        vec!["CVE-2023-12345".to_string()]
    }

    async fn get_iot_security_status(&self) -> String {
        let scanned = *self.scanned_devices.read().await;
        let vulns = *self.vulnerabilities_found.read().await;
        format!("IoT Security Engine: {} devices scanned, {} vulnerabilities found", scanned, vulns)
    }
}