// Forensics Module - Digital investigation tools
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicCase {
    pub id: Uuid,
    pub case_name: String,
    pub investigator: String,
    pub evidence_items: Vec<EvidenceItem>,
    pub created_at: DateTime<Utc>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceItem {
    pub id: Uuid,
    pub item_type: String,
    pub description: String,
    pub hash: String,
    pub collected_at: DateTime<Utc>,
    pub chain_of_custody: Vec<String>,
}

#[napi]
pub struct ForensicsManager {
    cases: Vec<ForensicCase>,
}

#[napi]
impl ForensicsManager {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { cases: Vec::new() })
    }

    #[napi]
    pub fn create_case(&mut self, case_json: String) -> Result<String> {
        let mut case: ForensicCase = serde_json::from_str(&case_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse case: {}", e)))?;
        
        case.id = Uuid::new_v4();
        case.created_at = Utc::now();
        
        let case_id = case.id.to_string();
        self.cases.push(case);
        
        Ok(case_id)
    }

    #[napi]
    pub fn add_evidence(&mut self, case_id: String, evidence_json: String) -> Result<String> {
        let id = Uuid::parse_str(&case_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid case ID: {}", e)))?;
        
        let mut evidence: EvidenceItem = serde_json::from_str(&evidence_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse evidence: {}", e)))?;
        
        evidence.id = Uuid::new_v4();
        evidence.collected_at = Utc::now();
        
        let case = self.cases.iter_mut()
            .find(|c| c.id == id)
            .ok_or_else(|| napi::Error::from_reason("Case not found"))?;
        
        let evidence_id = evidence.id.to_string();
        case.evidence_items.push(evidence);
        
        Ok(evidence_id)
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "cases_count": self.cases.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}