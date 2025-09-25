//! Compliance and Audit Framework
//!
//! Enterprise compliance monitoring and audit capabilities
//! for SOX, GDPR, HIPAA, NIST, and other regulatory frameworks.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Compliance frameworks supported
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ComplianceFramework {
    SOX,
    GDPR,
    HIPAA,
    NIST,
    ISO27001,
    PCI_DSS,
    FISMA,
    FEDRAMP,
}

/// Compliance report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub report_id: String,
    pub framework: ComplianceFramework,
    pub assessment_date: DateTime<Utc>,
    pub overall_score: f32,
    pub compliant_controls: u32,
    pub total_controls: u32,
    pub findings: Vec<ComplianceFinding>,
    pub recommendations: Vec<ComplianceRecommendation>,
}

/// Compliance finding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFinding {
    pub finding_id: String,
    pub control_id: String,
    pub severity: ComplianceSeverity,
    pub description: String,
    pub evidence: Vec<String>,
    pub remediation_required: bool,
}

/// Compliance severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceSeverity {
    Critical,
    High,
    Medium,
    Low,
}

/// Compliance recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRecommendation {
    pub recommendation_id: String,
    pub title: String,
    pub description: String,
    pub priority: ComplianceSeverity,
    pub implementation_effort: String,
    pub expected_impact: String,
}

/// Compliance operations trait
#[async_trait]
pub trait ComplianceModule: Send + Sync {
    /// Generate compliance report
    async fn generate_compliance_report(&self, framework: ComplianceFramework) -> ComplianceReport;

    /// Validate compliance controls
    async fn validate_controls(&self, framework: ComplianceFramework) -> Vec<ComplianceFinding>;

    /// Get audit trail
    async fn get_audit_trail(
        &self,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> Vec<AuditEvent>;
}

/// Audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub event_id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub user_id: String,
    pub resource: String,
    pub action: String,
    pub result: String,
    pub details: HashMap<String, serde_json::Value>,
}
