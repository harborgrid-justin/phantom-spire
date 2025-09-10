// Risk Assessment Module - Risk scoring and assessment
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub id: Uuid,
    pub asset_id: String,
    pub risk_type: String,
    pub likelihood: f64,
    pub impact: f64,
    pub risk_score: f64,
    pub mitigation_measures: Vec<String>,
    pub assessed_by: String,
    pub assessed_at: DateTime<Utc>,
}

#[napi]
pub struct RiskAssessor {
    assessments: Vec<RiskAssessment>,
}

#[napi]
impl RiskAssessor {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self { assessments: Vec::new() })
    }

    #[napi]
    pub fn create_assessment(&mut self, assessment_json: String) -> Result<String> {
        let mut assessment: RiskAssessment = serde_json::from_str(&assessment_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse assessment: {}", e)))?;
        
        assessment.id = Uuid::new_v4();
        assessment.assessed_at = Utc::now();
        assessment.risk_score = assessment.likelihood * assessment.impact;
        
        let assessment_id = assessment.id.to_string();
        self.assessments.push(assessment);
        
        Ok(assessment_id)
    }

    #[napi]
    pub fn get_risk_summary(&self) -> Result<String> {
        let total_assessments = self.assessments.len();
        let high_risk = self.assessments.iter().filter(|a| a.risk_score > 0.7).count();
        let medium_risk = self.assessments.iter().filter(|a| a.risk_score > 0.4 && a.risk_score <= 0.7).count();
        let low_risk = self.assessments.iter().filter(|a| a.risk_score <= 0.4).count();
        
        let summary = serde_json::json!({
            "total_assessments": total_assessments,
            "high_risk": high_risk,
            "medium_risk": medium_risk,
            "low_risk": low_risk
        });
        
        Ok(summary.to_string())
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        Ok(serde_json::json!({
            "status": "healthy",
            "assessments_count": self.assessments.len(),
            "timestamp": Utc::now().to_rfc3339()
        }).to_string())
    }
}