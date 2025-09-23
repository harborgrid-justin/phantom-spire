//! Threat Intelligence Feed Integrations
//!
//! Integration modules for external threat intelligence platforms

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use super::{HealthCheck, IntegrationStatus};

/// Threat intelligence indicator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIndicator {
    pub id: String,
    pub indicator_type: IndicatorType,
    pub value: String,
    pub confidence: f64,
    pub threat_types: Vec<String>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub source: String,
    pub tags: Vec<String>,
    pub malware_families: Vec<String>,
    pub related_cves: Vec<String>,
}

/// Types of threat indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IndicatorType {
    IpAddress,
    Domain,
    Url,
    FileHash,
    Email,
    Vulnerability,
    Malware,
    Campaign,
    ThreatActor,
}

/// Threat intelligence query parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatQuery {
    pub indicator_types: Vec<IndicatorType>,
    pub threat_types: Vec<String>,
    pub confidence_min: Option<f64>,
    pub tags: Vec<String>,
    pub malware_families: Vec<String>,
    pub related_cves: Vec<String>,
    pub since: Option<DateTime<Utc>>,
    pub limit: Option<usize>,
}

/// Common interface for threat intelligence platforms
#[async_trait]
pub trait ThreatIntelligencePlatform: Send + Sync {
    /// Get the platform name
    fn platform_name(&self) -> &'static str;
    
    /// Initialize the platform connection
    async fn initialize(&mut self) -> Result<(), String>;
    
    /// Fetch recent threat indicators
    async fn fetch_indicators(&self, query: Option<ThreatQuery>) -> Result<Vec<ThreatIndicator>, String>;
    
    /// Fetch indicators related to specific CVE
    async fn fetch_cve_indicators(&self, cve_id: &str) -> Result<Vec<ThreatIndicator>, String>;
    
    /// Submit indicator for analysis
    async fn submit_indicator(&self, indicator: &ThreatIndicator) -> Result<(), String>;
    
    /// Health check for the platform
    async fn health_check(&self) -> Result<HealthCheck, String>;
}

/// MISP (Malware Information Sharing Platform) integration
pub struct MISPPlatform {
    base_url: String,
    api_key: String,
    client: Option<reqwest::Client>,
}

impl MISPPlatform {
    pub fn new(base_url: String, api_key: String) -> Self {
        Self {
            base_url,
            api_key,
            client: None,
        }
    }
}

#[async_trait]
impl ThreatIntelligencePlatform for MISPPlatform {
    fn platform_name(&self) -> &'static str {
        "MISP"
    }
    
    async fn initialize(&mut self) -> Result<(), String> {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::HeaderName::from_static("authorization"),
            format!("{}", self.api_key).parse().map_err(|e| format!("Invalid API key: {}", e))?
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
    
    async fn fetch_indicators(&self, _query: Option<ThreatQuery>) -> Result<Vec<ThreatIndicator>, String> {
        // Implementation would call MISP REST API
        Ok(vec![])
    }
    
    async fn fetch_cve_indicators(&self, _cve_id: &str) -> Result<Vec<ThreatIndicator>, String> {
        Ok(vec![])
    }
    
    async fn submit_indicator(&self, _indicator: &ThreatIndicator) -> Result<(), String> {
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
            service_name: "MISP".to_string(),
            status,
            response_time_ms: start_time.elapsed().as_millis() as u64,
            last_check: Utc::now(),
            error_message: None,
        })
    }
}

/// AlienVault OTX (Open Threat Exchange) integration
pub struct AlienVaultOTX {
    api_key: String,
    base_url: String,
    client: Option<reqwest::Client>,
}

impl AlienVaultOTX {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://otx.alienvault.com/api/v1".to_string(),
            client: None,
        }
    }
}

#[async_trait]
impl ThreatIntelligencePlatform for AlienVaultOTX {
    fn platform_name(&self) -> &'static str {
        "AlienVault OTX"
    }
    
    async fn initialize(&mut self) -> Result<(), String> {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::HeaderName::from_static("x-otx-api-key"),
            self.api_key.parse().map_err(|e| format!("Invalid API key: {}", e))?
        );
        
        self.client = Some(
            reqwest::ClientBuilder::new()
                .default_headers(headers)
                .build()
                .map_err(|e| format!("Failed to build client: {}", e))?
        );
        Ok(())
    }
    
    async fn fetch_indicators(&self, _query: Option<ThreatQuery>) -> Result<Vec<ThreatIndicator>, String> {
        Ok(vec![])
    }
    
    async fn fetch_cve_indicators(&self, _cve_id: &str) -> Result<Vec<ThreatIndicator>, String> {
        Ok(vec![])
    }
    
    async fn submit_indicator(&self, _indicator: &ThreatIndicator) -> Result<(), String> {
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
            service_name: "AlienVault OTX".to_string(),
            status,
            response_time_ms: start_time.elapsed().as_millis() as u64,
            last_check: Utc::now(),
            error_message: None,
        })
    }
}

/// VirusTotal integration
pub struct VirusTotal {
    api_key: String,
    base_url: String,
    client: Option<reqwest::Client>,
}

impl VirusTotal {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://www.virustotal.com/vtapi/v2".to_string(),
            client: None,
        }
    }
}

#[async_trait]
impl ThreatIntelligencePlatform for VirusTotal {
    fn platform_name(&self) -> &'static str {
        "VirusTotal"
    }
    
    async fn initialize(&mut self) -> Result<(), String> {
        self.client = Some(reqwest::Client::new());
        Ok(())
    }
    
    async fn fetch_indicators(&self, _query: Option<ThreatQuery>) -> Result<Vec<ThreatIndicator>, String> {
        Ok(vec![])
    }
    
    async fn fetch_cve_indicators(&self, _cve_id: &str) -> Result<Vec<ThreatIndicator>, String> {
        Ok(vec![])
    }
    
    async fn submit_indicator(&self, _indicator: &ThreatIndicator) -> Result<(), String> {
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
            service_name: "VirusTotal".to_string(),
            status,
            response_time_ms: start_time.elapsed().as_millis() as u64,
            last_check: Utc::now(),
            error_message: None,
        })
    }
}

/// Threat intelligence platform manager
pub struct ThreatIntelligenceManager {
    platforms: Vec<Box<dyn ThreatIntelligencePlatform>>,
}

impl ThreatIntelligenceManager {
    pub fn new() -> Self {
        Self {
            platforms: Vec::new(),
        }
    }
    
    pub fn add_platform(&mut self, platform: Box<dyn ThreatIntelligencePlatform>) {
        self.platforms.push(platform);
    }
    
    pub async fn initialize_all(&mut self) -> Result<(), String> {
        for platform in &mut self.platforms {
            platform.initialize().await?;
        }
        Ok(())
    }
    
    pub async fn fetch_all_indicators(&self, query: Option<ThreatQuery>) -> Result<Vec<ThreatIndicator>, String> {
        let mut all_indicators = Vec::new();
        
        for platform in &self.platforms {
            match platform.fetch_indicators(query.clone()).await {
                Ok(mut indicators) => all_indicators.append(&mut indicators),
                Err(e) => {
                    eprintln!("Failed to fetch indicators from {}: {}", platform.platform_name(), e);
                    // Continue with other platforms
                }
            }
        }
        
        // Remove duplicates based on indicator value and type
        all_indicators.sort_by(|a, b| a.value.cmp(&b.value));
        all_indicators.dedup_by(|a, b| a.value == b.value && std::mem::discriminant(&a.indicator_type) == std::mem::discriminant(&b.indicator_type));
        
        Ok(all_indicators)
    }
    
    pub async fn fetch_cve_threat_intelligence(&self, cve_id: &str) -> Result<Vec<ThreatIndicator>, String> {
        let mut cve_indicators = Vec::new();
        
        for platform in &self.platforms {
            match platform.fetch_cve_indicators(cve_id).await {
                Ok(mut indicators) => cve_indicators.append(&mut indicators),
                Err(e) => {
                    eprintln!("Failed to fetch CVE indicators from {}: {}", platform.platform_name(), e);
                }
            }
        }
        
        Ok(cve_indicators)
    }
    
    pub async fn health_check_all(&self) -> Result<Vec<HealthCheck>, String> {
        let mut results = Vec::new();
        
        for platform in &self.platforms {
            match platform.health_check().await {
                Ok(check) => results.push(check),
                Err(e) => {
                    results.push(HealthCheck {
                        service_name: platform.platform_name().to_string(),
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
}

impl Default for ThreatIntelligenceManager {
    fn default() -> Self {
        Self::new()
    }
}