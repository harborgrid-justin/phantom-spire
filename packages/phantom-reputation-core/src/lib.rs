// phantom-reputation-core/src/lib.rs
// IP, domain, and URL reputation analysis library

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationResult {
    pub indicator: String,
    pub indicator_type: IndicatorType,
    pub reputation_score: f64,
    pub risk_level: RiskLevel,
    pub sources: Vec<ReputationSource>,
    pub last_updated: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IndicatorType {
    IP,
    Domain,
    URL,
    FileHash,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Clean,
    Low,
    Medium,
    High,
    Malicious,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReputationSource {
    pub source_name: String,
    pub score: f64,
    pub classification: String,
    pub last_seen: DateTime<Utc>,
}

pub struct ReputationCore {
    reputation_db: HashMap<String, ReputationResult>,
}

impl ReputationCore {
    pub fn new() -> Result<Self, String> {
        let mut reputation_db = HashMap::new();
        
        // Add sample reputation data
        reputation_db.insert("192.168.1.1".to_string(), ReputationResult {
            indicator: "192.168.1.1".to_string(),
            indicator_type: IndicatorType::IP,
            reputation_score: 8.5,
            risk_level: RiskLevel::Clean,
            sources: vec![
                ReputationSource {
                    source_name: "VirusTotal".to_string(),
                    score: 9.0,
                    classification: "clean".to_string(),
                    last_seen: Utc::now(),
                }
            ],
            last_updated: Utc::now(),
            metadata: {
                let mut meta = HashMap::new();
                meta.insert("country".to_string(), "US".to_string());
                meta.insert("asn".to_string(), "AS12345".to_string());
                meta
            },
        });

        Ok(Self { reputation_db })
    }

    pub fn check_reputation(&self, indicator: &str) -> Result<ReputationResult, String> {
        if let Some(result) = self.reputation_db.get(indicator) {
            Ok(result.clone())
        } else {
            // Generate a default reputation check
            let indicator_type = self.classify_indicator(indicator);
            let (score, risk_level) = self.calculate_default_reputation(indicator);
            
            Ok(ReputationResult {
                indicator: indicator.to_string(),
                indicator_type,
                reputation_score: score,
                risk_level,
                sources: vec![
                    ReputationSource {
                        source_name: "PhantomDB".to_string(),
                        score,
                        classification: format!("{:?}", risk_level).to_lowercase(),
                        last_seen: Utc::now(),
                    }
                ],
                last_updated: Utc::now(),
                metadata: HashMap::new(),
            })
        }
    }

    pub fn bulk_check(&self, indicators: Vec<String>) -> Result<Vec<ReputationResult>, String> {
        let mut results = Vec::new();
        
        for indicator in indicators {
            match self.check_reputation(&indicator) {
                Ok(result) => results.push(result),
                Err(_) => continue,
            }
        }
        
        Ok(results)
    }

    fn classify_indicator(&self, indicator: &str) -> IndicatorType {
        if indicator.parse::<std::net::IpAddr>().is_ok() {
            IndicatorType::IP
        } else if indicator.contains(".") && !indicator.contains("/") {
            IndicatorType::Domain
        } else if indicator.starts_with("http") {
            IndicatorType::URL
        } else {
            IndicatorType::FileHash
        }
    }

    fn calculate_default_reputation(&self, indicator: &str) -> (f64, RiskLevel) {
        // Simple heuristic based on indicator characteristics
        let score = if indicator.contains("malware") || indicator.contains("suspicious") {
            2.0
        } else if indicator.contains("test") {
            5.0
        } else {
            7.5
        };

        let risk_level = match score {
            0.0..=2.0 => RiskLevel::Malicious,
            2.0..=4.0 => RiskLevel::High,
            4.0..=6.0 => RiskLevel::Medium,
            6.0..=8.0 => RiskLevel::Low,
            _ => RiskLevel::Clean,
        };

        (score, risk_level)
    }
}

#[napi]
pub struct ReputationCoreNapi {
    inner: ReputationCore,
}

#[napi]
impl ReputationCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = ReputationCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Reputation Core: {}", e)))?;
        Ok(ReputationCoreNapi { inner: core })
    }

    #[napi]
    pub fn check_reputation(&self, indicator: String) -> Result<String> {
        let result = self.inner.check_reputation(&indicator)
            .map_err(|e| napi::Error::from_reason(format!("Failed to check reputation: {}", e)))?;

        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize result: {}", e)))
    }

    #[napi]
    pub fn bulk_check(&self, indicators: Vec<String>) -> Result<String> {
        let results = self.inner.bulk_check(indicators)
            .map_err(|e| napi::Error::from_reason(format!("Failed to bulk check: {}", e)))?;

        serde_json::to_string(&results)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize results: {}", e)))
    }

    #[napi]
    pub fn get_health_status(&self) -> Result<String> {
        let status = serde_json::json!({
            "status": "healthy",
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "version": env!("CARGO_PKG_VERSION")
        });

        serde_json::to_string(&status)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize health status: {}", e)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reputation_core_creation() {
        let core = ReputationCore::new();
        assert!(core.is_ok());
    }
}
