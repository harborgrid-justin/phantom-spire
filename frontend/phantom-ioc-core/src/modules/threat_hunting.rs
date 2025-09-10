// Threat Hunting Module
// Proactive threat detection and hunting capabilities

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatHunt {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub hypothesis: String,
    pub data_sources: Vec<String>,
    pub techniques: Vec<String>,
    pub findings: Vec<HuntFinding>,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HuntFinding {
    pub id: Uuid,
    pub description: String,
    pub severity: String,
    pub evidence: Vec<String>,
    pub iocs: Vec<String>,
    pub confidence: f64,
    pub discovered_at: DateTime<Utc>,
}

#[napi]
pub struct ThreatHunter {
    hunts: Vec<ThreatHunt>,
}

#[napi]
impl ThreatHunter {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { hunts: Vec::new() })
    }

    #[napi]
    pub fn create_hunt(&mut self, hunt_json: String) -> Result<String> {
        let mut hunt: ThreatHunt = serde_json::from_str(&hunt_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse hunt: {}", e)))?;
        
        hunt.id = Uuid::new_v4();
        hunt.created_at = Utc::now();
        
        let hunt_id = hunt.id.to_string();
        self.hunts.push(hunt);
        
        Ok(hunt_id)
    }

    #[napi]
    pub fn get_hunt(&self, hunt_id: String) -> Result<String> {
        let id = Uuid::parse_str(&hunt_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid hunt ID: {}", e)))?;
        
        let hunt = self.hunts.iter()
            .find(|h| h.id == id)
            .ok_or_else(|| napi::Error::from_reason("Hunt not found"))?;
        
        serde_json::to_string(hunt)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize hunt: {}", e)))
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "hunts_count": self.hunts.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}