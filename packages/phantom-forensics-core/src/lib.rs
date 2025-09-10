// phantom-forensics-core/src/lib.rs
// Digital forensics and incident investigation library

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicEvidence {
    pub id: String,
    pub evidence_type: EvidenceType,
    pub source: String,
    pub timestamp: DateTime<Utc>,
    pub hash: String,
    pub metadata: HashMap<String, String>,
    pub chain_of_custody: Vec<CustodyEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvidenceType {
    FileSystem,
    Network,
    Memory,
    Registry,
    EventLog,
    Database,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyEntry {
    pub handler: String,
    pub action: String,
    pub timestamp: DateTime<Utc>,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub source: String,
    pub description: String,
    pub artifacts: Vec<String>,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicTimeline {
    pub case_id: String,
    pub events: Vec<TimelineEvent>,
    pub analysis_notes: String,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
}

pub struct ForensicsCore {
    evidence: HashMap<String, ForensicEvidence>,
    timelines: HashMap<String, ForensicTimeline>,
}

impl ForensicsCore {
    pub fn new() -> Result<Self, String> {
        Ok(Self {
            evidence: HashMap::new(),
            timelines: HashMap::new(),
        })
    }

    pub fn add_evidence(&mut self, evidence: ForensicEvidence) -> Result<(), String> {
        self.evidence.insert(evidence.id.clone(), evidence);
        Ok(())
    }

    pub fn create_timeline(&mut self, case_id: &str) -> Result<ForensicTimeline, String> {
        let timeline = ForensicTimeline {
            case_id: case_id.to_string(),
            events: Vec::new(),
            analysis_notes: String::new(),
            created_by: "system".to_string(),
            created_at: Utc::now(),
        };
        
        self.timelines.insert(case_id.to_string(), timeline.clone());
        Ok(timeline)
    }

    pub fn analyze_artifacts(&self, artifacts: Vec<String>) -> Result<Vec<TimelineEvent>, String> {
        let mut events = Vec::new();
        
        for artifact in artifacts {
            events.push(TimelineEvent {
                timestamp: Utc::now(),
                event_type: "file_access".to_string(),
                source: artifact.clone(),
                description: format!("Analyzed artifact: {}", artifact),
                artifacts: vec![artifact],
                confidence: 0.8,
            });
        }
        
        Ok(events)
    }
}

#[napi]
pub struct ForensicsCoreNapi {
    inner: ForensicsCore,
}

#[napi]
impl ForensicsCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = ForensicsCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Forensics Core: {}", e)))?;
        Ok(ForensicsCoreNapi { inner: core })
    }

    #[napi]
    pub fn add_evidence(&mut self, evidence_json: String) -> Result<()> {
        let evidence: ForensicEvidence = serde_json::from_str(&evidence_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse evidence: {}", e)))?;
        
        self.inner.add_evidence(evidence)
            .map_err(|e| napi::Error::from_reason(format!("Failed to add evidence: {}", e)))
    }

    #[napi]
    pub fn create_timeline(&mut self, case_id: String) -> Result<String> {
        let timeline = self.inner.create_timeline(&case_id)
            .map_err(|e| napi::Error::from_reason(format!("Failed to create timeline: {}", e)))?;

        serde_json::to_string(&timeline)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize timeline: {}", e)))
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
    fn test_forensics_core_creation() {
        let core = ForensicsCore::new();
        assert!(core.is_ok());
    }
}