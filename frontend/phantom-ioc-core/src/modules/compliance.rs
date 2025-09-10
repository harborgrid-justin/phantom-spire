// Compliance Module
// Handles regulatory compliance tracking, auditing, and reporting

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ComplianceFramework {
    SOX,
    GDPR,
    HIPAA,
    PciDss,
    SOC2,
    ISO27001,
    NIST,
    CIS,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComplianceStatus {
    Compliant,
    NonCompliant,
    PartiallyCompliant,
    NotAssessed,
    InProgress,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AuditType {
    Internal,
    External,
    Regulatory,
    ThirdParty,
    SelfAssessment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceControl {
    pub id: Uuid,
    pub control_id: String,
    pub name: String,
    pub description: String,
    pub framework: ComplianceFramework,
    pub category: String,
    pub status: ComplianceStatus,
    pub implementation_date: Option<DateTime<Utc>>,
    pub last_assessment: Option<DateTime<Utc>>,
    pub next_assessment: Option<DateTime<Utc>>,
    pub owner: String,
    pub evidence: Vec<String>,
    pub exceptions: Vec<String>,
    pub remediation_plan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditRecord {
    pub id: Uuid,
    pub audit_type: AuditType,
    pub framework: ComplianceFramework,
    pub auditor: String,
    pub audit_date: DateTime<Utc>,
    pub scope: String,
    pub findings: Vec<AuditFinding>,
    pub overall_status: ComplianceStatus,
    pub report_url: Option<String>,
    pub follow_up_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditFinding {
    pub id: Uuid,
    pub control_id: String,
    pub severity: String,
    pub description: String,
    pub recommendation: String,
    pub status: String,
    pub target_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub id: Uuid,
    pub framework: ComplianceFramework,
    pub report_date: DateTime<Utc>,
    pub reporting_period_start: DateTime<Utc>,
    pub reporting_period_end: DateTime<Utc>,
    pub overall_score: f64,
    pub total_controls: u32,
    pub compliant_controls: u32,
    pub non_compliant_controls: u32,
    pub summary: String,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMetrics {
    pub total_frameworks: u32,
    pub total_controls: u32,
    pub compliant_percentage: f64,
    pub critical_findings: u32,
    pub high_findings: u32,
    pub medium_findings: u32,
    pub low_findings: u32,
    pub overdue_assessments: u32,
    pub upcoming_assessments: u32,
}

#[napi]
pub struct ComplianceManager {
    controls: Vec<ComplianceControl>,
    audits: Vec<AuditRecord>,
    reports: Vec<ComplianceReport>,
}

#[napi]
impl ComplianceManager {
    #[napi(constructor)]
    pub fn new() -> Result<Self> {
        Ok(Self {
            controls: Vec::new(),
            audits: Vec::new(),
            reports: Vec::new(),
        })
    }

    #[napi]
    pub fn create_control(&mut self, control_json: String) -> Result<String> {
        let mut control: ComplianceControl = serde_json::from_str(&control_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse control: {}", e)))?;
        
        control.id = Uuid::new_v4();
        
        let control_id = control.id.to_string();
        self.controls.push(control);
        
        Ok(control_id)
    }

    #[napi]
    pub fn get_control(&self, control_id: String) -> Result<String> {
        let id = Uuid::parse_str(&control_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid control ID: {}", e)))?;
        
        let control = self.controls.iter()
            .find(|c| c.id == id)
            .ok_or_else(|| napi::Error::from_reason("Control not found"))?;
        
        serde_json::to_string(control)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize control: {}", e)))
    }

    #[napi]
    pub fn update_control_status(&mut self, control_id: String, status: String) -> Result<()> {
        let id = Uuid::parse_str(&control_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid control ID: {}", e)))?;
        
        let status: ComplianceStatus = serde_json::from_str(&format!("\"{}\"", status))
            .map_err(|e| napi::Error::from_reason(format!("Invalid status: {}", e)))?;
        
        let control = self.controls.iter_mut()
            .find(|c| c.id == id)
            .ok_or_else(|| napi::Error::from_reason("Control not found"))?;
        
        control.status = status;
        control.last_assessment = Some(Utc::now());
        
        Ok(())
    }

    #[napi]
    pub fn list_controls_by_framework(&self, framework: String) -> Result<String> {
        let framework: ComplianceFramework = serde_json::from_str(&format!("\"{}\"", framework))
            .map_err(|e| napi::Error::from_reason(format!("Invalid framework: {}", e)))?;
        
        let filtered_controls: Vec<&ComplianceControl> = self.controls.iter()
            .filter(|c| c.framework == framework)
            .collect();
        
        serde_json::to_string(&filtered_controls)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize controls: {}", e)))
    }

    #[napi]
    pub fn create_audit(&mut self, audit_json: String) -> Result<String> {
        let mut audit: AuditRecord = serde_json::from_str(&audit_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse audit: {}", e)))?;
        
        audit.id = Uuid::new_v4();
        
        let audit_id = audit.id.to_string();
        self.audits.push(audit);
        
        Ok(audit_id)
    }

    #[napi]
    pub fn get_audit(&self, audit_id: String) -> Result<String> {
        let id = Uuid::parse_str(&audit_id)
            .map_err(|e| napi::Error::from_reason(format!("Invalid audit ID: {}", e)))?;
        
        let audit = self.audits.iter()
            .find(|a| a.id == id)
            .ok_or_else(|| napi::Error::from_reason("Audit not found"))?;
        
        serde_json::to_string(audit)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize audit: {}", e)))
    }

    #[napi]
    pub fn generate_compliance_report(&mut self, framework: String, start_date: String, end_date: String) -> Result<String> {
        let framework: ComplianceFramework = serde_json::from_str(&format!("\"{}\"", framework))
            .map_err(|e| napi::Error::from_reason(format!("Invalid framework: {}", e)))?;
        
        let start_date = DateTime::parse_from_rfc3339(&start_date)
            .map_err(|e| napi::Error::from_reason(format!("Invalid start date: {}", e)))?
            .with_timezone(&Utc);
        
        let end_date = DateTime::parse_from_rfc3339(&end_date)
            .map_err(|e| napi::Error::from_reason(format!("Invalid end date: {}", e)))?
            .with_timezone(&Utc);
        
        let framework_controls: Vec<&ComplianceControl> = self.controls.iter()
            .filter(|c| c.framework == framework)
            .collect();
        
        let total_controls = framework_controls.len() as u32;
        let compliant_controls = framework_controls.iter()
            .filter(|c| matches!(c.status, ComplianceStatus::Compliant))
            .count() as u32;
        let non_compliant_controls = framework_controls.iter()
            .filter(|c| matches!(c.status, ComplianceStatus::NonCompliant))
            .count() as u32;
        
        let overall_score = if total_controls > 0 {
            (compliant_controls as f64 / total_controls as f64) * 100.0
        } else {
            0.0
        };
        
        let mut report = ComplianceReport {
            id: Uuid::new_v4(),
            framework: framework.clone(),
            report_date: Utc::now(),
            reporting_period_start: start_date,
            reporting_period_end: end_date,
            overall_score,
            total_controls,
            compliant_controls,
            non_compliant_controls,
            summary: format!("Compliance assessment for {:?} framework", framework),
            recommendations: vec![
                "Conduct regular compliance assessments".to_string(),
                "Implement automated monitoring".to_string(),
                "Maintain documentation updates".to_string(),
            ],
        };
        
        if overall_score < 80.0 {
            report.recommendations.push("Prioritize remediation of non-compliant controls".to_string());
        }
        
        let _report_id = report.id.to_string();
        self.reports.push(report.clone());
        
        serde_json::to_string(&report)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize report: {}", e)))
    }

    #[napi]
    pub fn get_compliance_metrics(&self) -> Result<String> {
        let frameworks: std::collections::HashSet<_> = self.controls.iter()
            .map(|c| &c.framework)
            .collect();
        
        let total_frameworks = frameworks.len() as u32;
        let total_controls = self.controls.len() as u32;
        
        let compliant_controls = self.controls.iter()
            .filter(|c| matches!(c.status, ComplianceStatus::Compliant))
            .count() as u32;
        
        let compliant_percentage = if total_controls > 0 {
            (compliant_controls as f64 / total_controls as f64) * 100.0
        } else {
            0.0
        };
        
        // Count findings by severity from audits
        let mut critical_findings = 0;
        let mut high_findings = 0;
        let mut medium_findings = 0;
        let mut low_findings = 0;
        
        for audit in &self.audits {
            for finding in &audit.findings {
                match finding.severity.as_str() {
                    "Critical" => critical_findings += 1,
                    "High" => high_findings += 1,
                    "Medium" => medium_findings += 1,
                    "Low" => low_findings += 1,
                    _ => {}
                }
            }
        }
        
        let now = Utc::now();
        let overdue_assessments = self.controls.iter()
            .filter(|c| c.next_assessment.map_or(false, |date| date < now))
            .count() as u32;
        
        let upcoming_assessments = self.controls.iter()
            .filter(|c| {
                c.next_assessment.map_or(false, |date| {
                    let days_until = (date - now).num_days();
                    days_until >= 0 && days_until <= 30
                })
            })
            .count() as u32;
        
        let metrics = ComplianceMetrics {
            total_frameworks,
            total_controls,
            compliant_percentage,
            critical_findings,
            high_findings,
            medium_findings,
            low_findings,
            overdue_assessments,
            upcoming_assessments,
        };
        
        serde_json::to_string(&metrics)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize metrics: {}", e)))
    }

    #[napi]
    pub fn health_check(&self) -> Result<String> {
        let health_info = serde_json::json!({
            "status": "healthy",
            "controls_count": self.controls.len(),
            "audits_count": self.audits.len(),
            "reports_count": self.reports.len(),
            "timestamp": Utc::now().to_rfc3339()
        });
        
        Ok(health_info.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compliance_manager_creation() {
        let manager = ComplianceManager::new();
        assert!(manager.is_ok());
    }

    #[test]
    fn test_create_and_get_control() {
        let mut manager = ComplianceManager::new().unwrap();
        
        let control = ComplianceControl {
            id: Uuid::new_v4(), // Will be overwritten
            control_id: "SOC2-CC1.1".to_string(),
            name: "Access Management".to_string(),
            description: "User access is managed and monitored".to_string(),
            framework: ComplianceFramework::SOC2,
            category: "Common Criteria".to_string(),
            status: ComplianceStatus::Compliant,
            implementation_date: Some(Utc::now()),
            last_assessment: None,
            next_assessment: None,
            owner: "Security Team".to_string(),
            evidence: vec!["access_logs.pdf".to_string()],
            exceptions: vec![],
            remediation_plan: None,
        };
        
        let control_json = serde_json::to_string(&control).unwrap();
        let control_id = manager.create_control(control_json).unwrap();
        
        let retrieved_control_json = manager.get_control(control_id).unwrap();
        let retrieved_control: ComplianceControl = serde_json::from_str(&retrieved_control_json).unwrap();
        
        assert_eq!(retrieved_control.control_id, "SOC2-CC1.1");
        assert_eq!(retrieved_control.framework, ComplianceFramework::SOC2);
    }
}