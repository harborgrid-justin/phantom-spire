// phantom-risk-core/src/lib.rs
// Risk assessment and scoring engine library

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAssessment {
    pub asset_id: String,
    pub threat_score: f64,
    pub vulnerability_score: f64,
    pub impact_score: f64,
    pub overall_risk_score: f64,
    pub risk_level: RiskLevel,
    pub assessment_date: DateTime<Utc>,
    pub factors: Vec<RiskFactor>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactor {
    pub factor_type: String,
    pub value: f64,
    pub weight: f64,
    pub description: String,
}

pub struct RiskCore {
    risk_models: HashMap<String, RiskModel>,
}

#[derive(Debug, Clone)]
pub struct RiskModel {
    pub name: String,
    pub factors: Vec<String>,
    pub weights: HashMap<String, f64>,
}

impl RiskCore {
    pub fn new() -> Result<Self, String> {
        let mut risk_models = HashMap::new();
        
        let mut weights = HashMap::new();
        weights.insert("threat_probability".to_string(), 0.3);
        weights.insert("vulnerability_severity".to_string(), 0.4);
        weights.insert("asset_value".to_string(), 0.3);
        
        risk_models.insert("standard".to_string(), RiskModel {
            name: "Standard Risk Model".to_string(),
            factors: vec!["threat_probability".to_string(), "vulnerability_severity".to_string(), "asset_value".to_string()],
            weights,
        });

        Ok(Self { risk_models })
    }

    pub fn assess_risk(&self, asset_id: &str, factors: HashMap<String, f64>) -> Result<RiskAssessment, String> {
        let threat_score = factors.get("threat_probability").unwrap_or(&0.5) * 10.0;
        let vulnerability_score = factors.get("vulnerability_severity").unwrap_or(&0.5) * 10.0;
        let impact_score = factors.get("asset_value").unwrap_or(&0.5) * 10.0;
        
        let overall_risk_score = (threat_score + vulnerability_score + impact_score) / 3.0;
        
        let risk_level = match overall_risk_score {
            0.0..=3.0 => RiskLevel::Low,
            3.0..=6.0 => RiskLevel::Medium,
            6.0..=8.0 => RiskLevel::High,
            _ => RiskLevel::Critical,
        };

        let risk_factors = factors.into_iter().map(|(key, value)| {
            RiskFactor {
                factor_type: key.clone(),
                value,
                weight: 1.0,
                description: format!("Risk factor: {}", key),
            }
        }).collect();

        Ok(RiskAssessment {
            asset_id: asset_id.to_string(),
            threat_score,
            vulnerability_score,
            impact_score,
            overall_risk_score,
            risk_level,
            assessment_date: Utc::now(),
            factors: risk_factors,
        })
    }
}

#[napi]
pub struct RiskCoreNapi {
    inner: RiskCore,
}

#[napi]
impl RiskCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = RiskCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Risk Core: {}", e)))?;
        Ok(RiskCoreNapi { inner: core })
    }

    #[napi]
    pub fn assess_risk(&self, asset_id: String, factors_json: String) -> Result<String> {
        let factors: HashMap<String, f64> = serde_json::from_str(&factors_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse factors: {}", e)))?;

        let assessment = self.inner.assess_risk(&asset_id, factors)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess risk: {}", e)))?;

        serde_json::to_string(&assessment)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize assessment: {}", e)))
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
    fn test_risk_core_creation() {
        let core = RiskCore::new();
        assert!(core.is_ok());
    }
}
