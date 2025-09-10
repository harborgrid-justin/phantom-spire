// phantom-ioc-core/src/lib.rs
// IOC processing library with napi bindings

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

// Import all business modules
pub mod modules;
pub use modules::*;

// Core IOC types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IOCType {
    IPAddress,
    Domain,
    URL,
    Hash,
    Email,
    FilePath,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOC {
    pub id: Uuid,
    pub indicator_type: IOCType,
    pub value: String,
    pub confidence: f64,
    pub severity: Severity,
    pub source: String,
    pub timestamp: DateTime<Utc>,
    pub tags: Vec<String>,
    pub context: IOCContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCContext {
    pub description: Option<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub threat_actors: Vec<String>,
    pub campaigns: Vec<String>,
    pub malware_families: Vec<String>,
    pub attack_vectors: Vec<String>,
    pub impact_assessment: ImpactAssessment,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub business_impact: f64,
    pub technical_impact: f64,
    pub operational_impact: f64,
    pub overall_risk: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IOCResult {
    pub ioc: IOC,
    pub analysis: AnalysisResult,
    pub processing_timestamp: DateTime<Utc>,
}

// Core processing logic
#[napi]
pub struct IOCCore {
    _internal: bool,
}

#[napi]
impl IOCCore {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { _internal: true })
    }

    #[napi]
    pub fn process_ioc(&self, ioc_json: String) -> Result<String> {
        let ioc: IOC = serde_json::from_str(&ioc_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse IOC: {}", e)))?;
        
        let result = self.process_ioc_internal(ioc)
            .map_err(|e| napi::Error::from_reason(format!("Failed to process IOC: {}", e)))?;
        
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize result: {}", e)))
    }
}

impl IOCCore {
    fn process_ioc_internal(&self, ioc: IOC) -> Result<IOCResult, String> {
        // Mock analysis - in real implementation this would do threat intelligence lookup
        let analysis = AnalysisResult {
            threat_actors: vec!["APT29".to_string(), "Lazarus Group".to_string()]
                .into_iter()
                .take((rand::random::<u32>() % 3) as usize)
                .collect(),
            campaigns: vec!["Operation Cobalt Kitty".to_string(), "SolarWinds".to_string()]
                .into_iter()
                .take((rand::random::<u32>() % 2 + 1) as usize)
                .collect(),
            malware_families: vec!["TrickBot".to_string(), "Emotet".to_string(), "Cobalt Strike".to_string()]
                .into_iter()
                .take((rand::random::<u32>() % 3 + 1) as usize)
                .collect(),
            attack_vectors: vec!["Phishing".to_string(), "Watering Hole".to_string()]
                .into_iter()
                .take((rand::random::<u32>() % 2 + 1) as usize)
                .collect(),
            impact_assessment: ImpactAssessment {
                business_impact: 0.3 + ((rand::random::<u32>() as f64 / u32::MAX as f64) * 0.5),
                technical_impact: 0.3 + ((rand::random::<u32>() as f64 / u32::MAX as f64) * 0.5),
                operational_impact: 0.3 + ((rand::random::<u32>() as f64 / u32::MAX as f64) * 0.5),
                overall_risk: 0.4 + ((rand::random::<u32>() as f64 / u32::MAX as f64) * 0.4),
            },
            recommendations: vec![
                "Block this indicator at network perimeter".to_string(),
                "Monitor for lateral movement indicators".to_string(),
                "Update security signatures".to_string(),
                "Implement additional monitoring".to_string(),
            ],
        };

        Ok(IOCResult {
            ioc,
            analysis,
            processing_timestamp: Utc::now(),
        })
    }
}

// Simple random number generator for mock data
mod rand {
    use std::sync::atomic::{AtomicU64, Ordering};
    
    static SEED: AtomicU64 = AtomicU64::new(12345);
    
    pub fn random<T>() -> T 
    where 
        T: From<u32>
    {
        let current = SEED.load(Ordering::SeqCst);
        let next = current.wrapping_mul(1103515245).wrapping_add(12345);
        SEED.store(next, Ordering::SeqCst);
        T::from(next as u32)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ioc_core_creation() {
        let core = IOCCore::new();
        assert!(core.is_ok());
    }

    #[test]
    fn test_ioc_processing() {
        let core = IOCCore::new().unwrap();

        let test_ioc = IOC {
            id: Uuid::new_v4(),
            indicator_type: IOCType::IPAddress,
            value: "192.168.1.100".to_string(),
            confidence: 0.85,
            severity: Severity::High,
            source: "test_source".to_string(),
            timestamp: Utc::now(),
            tags: vec!["malware".to_string(), "c2".to_string()],
            context: IOCContext {
                description: Some("Test IOC".to_string()),
                metadata: HashMap::new(),
            },
        };

        let result = core.process_ioc_internal(test_ioc);
        assert!(result.is_ok());
    }
}
