// phantom-compliance-core/src/lib.rs
// Compliance and regulatory framework analysis library

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFramework {
    pub id: String,
    pub name: String,
    pub version: String,
    pub requirements: Vec<ComplianceRequirement>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRequirement {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: ComplianceSeverity,
    pub category: String,
    pub controls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceAssessment {
    pub framework_id: String,
    pub overall_score: f64,
    pub compliant_controls: u32,
    pub non_compliant_controls: u32,
    pub findings: Vec<ComplianceFinding>,
    pub assessment_date: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFinding {
    pub requirement_id: String,
    pub status: ComplianceStatus,
    pub details: String,
    pub remediation: String,
    pub priority: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceStatus {
    Compliant,
    NonCompliant,
    PartiallyCompliant,
    NotApplicable,
}

pub struct ComplianceCore {
    frameworks: HashMap<String, ComplianceFramework>,
}

impl ComplianceCore {
    pub fn new() -> Result<Self, String> {
        let mut frameworks = HashMap::new();
        
        // Add sample framework
        frameworks.insert("SOC2".to_string(), ComplianceFramework {
            id: "SOC2".to_string(),
            name: "SOC 2 Type II".to_string(),
            version: "2017".to_string(),
            requirements: vec![
                ComplianceRequirement {
                    id: "CC1.1".to_string(),
                    title: "Control Environment".to_string(),
                    description: "Management establishes control environment".to_string(),
                    severity: ComplianceSeverity::High,
                    category: "Control Environment".to_string(),
                    controls: vec!["access_control".to_string(), "monitoring".to_string()],
                }
            ],
            last_updated: Utc::now(),
        });
        
        Ok(Self { frameworks })
    }

    pub fn assess_compliance(&self, framework_id: &str, controls: HashMap<String, bool>) -> Result<ComplianceAssessment, String> {
        let framework = self.frameworks.get(framework_id)
            .ok_or_else(|| format!("Framework {} not found", framework_id))?;

        let total_controls = framework.requirements.len() as u32;
        let compliant_controls = controls.values().filter(|&&v| v).count() as u32;
        let non_compliant_controls = total_controls - compliant_controls;

        let overall_score = (compliant_controls as f64 / total_controls as f64) * 100.0;

        let mut findings = Vec::new();
        for requirement in &framework.requirements {
            let status = if controls.get(&requirement.id).unwrap_or(&false) {
                ComplianceStatus::Compliant
            } else {
                ComplianceStatus::NonCompliant
            };

            findings.push(ComplianceFinding {
                requirement_id: requirement.id.clone(),
                status,
                details: format!("Assessment for {}", requirement.title),
                remediation: "Implement required controls".to_string(),
                priority: 1,
            });
        }

        Ok(ComplianceAssessment {
            framework_id: framework_id.to_string(),
            overall_score,
            compliant_controls,
            non_compliant_controls,
            findings,
            assessment_date: Utc::now(),
        })
    }
}

#[napi]
pub struct ComplianceCoreNapi {
    inner: ComplianceCore,
}

#[napi]
impl ComplianceCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        let core = ComplianceCore::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create Compliance Core: {}", e)))?;
        Ok(ComplianceCoreNapi { inner: core })
    }

    #[napi]
    pub fn assess_compliance(&self, framework_id: String, controls_json: String) -> Result<String> {
        let controls: HashMap<String, bool> = serde_json::from_str(&controls_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse controls: {}", e)))?;

        let assessment = self.inner.assess_compliance(&framework_id, controls)
            .map_err(|e| napi::Error::from_reason(format!("Failed to assess compliance: {}", e)))?;

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
    fn test_compliance_core_creation() {
        let core = ComplianceCore::new();
        assert!(core.is_ok());
    }
}
