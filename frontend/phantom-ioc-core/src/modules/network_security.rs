// Network Security Module - Network-based threat detection
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkThreat {
    pub id: Uuid,
    pub source_ip: String,
    pub destination_ip: String,
    pub threat_type: String,
    pub severity: String,
    pub detected_at: DateTime<Utc>,
    pub blocked: bool,
}

#[napi]
pub struct NetworkSecurityMonitor {
    threats: Vec<NetworkThreat>,
}

#[napi]
impl NetworkSecurityMonitor {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { threats: Vec::new() })
    }

    #[napi]
    pub fn detect_threat(&mut self, threat_json: String) -> Result<String> {
        let mut threat: NetworkThreat = serde_json::from_str(&threat_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse threat: {}", e)))?;
        
        threat.id = Uuid::new_v4();
        threat.detected_at = Utc::now();
        
        let threat_id = threat.id.to_string();
        self.threats.push(threat);
        
        Ok(threat_id)
    }

    #[napi]
    pub fn get_threat_summary(&self) -> Result<String> {
        let total_threats = self.threats.len();
        let blocked_threats = self.threats.iter().filter(|t| t.blocked).count();
        
        let summary = serde_json::json!({
            "total_threats": total_threats,
            "blocked_threats": blocked_threats,
            "block_rate": if total_threats > 0 { (blocked_threats as f64 / total_threats as f64) * 100.0 } else { 0.0 }
        });
        
        Ok(summary.to_string())
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "threats_count": self.threats.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}