// phantom-ioc-core/src/compliance.rs
// Regulatory compliance tracking, reporting, and audit trails

use crate::types::*;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Compliance engine for regulatory compliance management
pub struct ComplianceEngine {
    compliance_frameworks: Arc<RwLock<HashMap<String, ComplianceFramework>>>,
    audit_logs: Arc<RwLock<Vec<AuditEvent>>>,
    compliance_reports: Arc<RwLock<HashMap<String, ComplianceReport>>>,
    violations: Arc<RwLock<HashMap<String, ComplianceViolation>>>,
    statistics: Arc<RwLock<ComplianceStats>>,
}

impl ComplianceEngine {
    /// Create a new compliance engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            compliance_frameworks: Arc::new(RwLock::new(HashMap::new())),
            audit_logs: Arc::new(RwLock::new(Vec::new())),
            compliance_reports: Arc::new(RwLock::new(HashMap::new())),
            violations: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(ComplianceStats::default())),
        };

        // Initialize with default frameworks
        engine.initialize_frameworks().await?;

        Ok(engine)
    }

    /// Initialize default compliance frameworks
    async fn initialize_frameworks(&self) -> Result<(), IOCError> {
        let frameworks = vec![
            ComplianceFramework {
                id: "gdpr".to_string(),
                name: "General Data Protection Regulation".to_string(),
                version: "2018".to_string(),
                jurisdiction: "European Union".to_string(),
                requirements: vec![
                    ComplianceRequirement {
                        id: "gdpr_breach_notification".to_string(),
                        title: "Data Breach Notification".to_string(),
                        description: "Notify supervisory authority within 72 hours of breach".to_string(),
                        severity: RequirementSeverity::Critical,
                        mandatory: true,
                        deadline_hours: Some(72),
                        penalties: vec!["Administrative fines up to 4% of annual turnover".to_string()],
                    },
                    ComplianceRequirement {
                        id: "gdpr_data_protection".to_string(),
                        title: "Data Protection by Design".to_string(),
                        description: "Implement appropriate technical and organizational measures".to_string(),
                        severity: RequirementSeverity::High,
                        mandatory: true,
                        deadline_hours: None,
                        penalties: vec!["Administrative fines up to 2% of annual turnover".to_string()],
                    },
                ],
                notification_triggers: vec![
                    "personal_data".to_string(),
                    "data_breach".to_string(),
                    "unauthorized_access".to_string(),
                ],
            },
            ComplianceFramework {
                id: "pci_dss".to_string(),
                name: "Payment Card Industry Data Security Standard".to_string(),
                version: "4.0".to_string(),
                jurisdiction: "Global".to_string(),
                requirements: vec![
                    ComplianceRequirement {
                        id: "pci_incident_response".to_string(),
                        title: "Incident Response Procedures".to_string(),
                        description: "Maintain incident response plan and test regularly".to_string(),
                        severity: RequirementSeverity::Critical,
                        mandatory: true,
                        deadline_hours: Some(24),
                        penalties: vec!["Fines from $5,000 to $100,000 per month".to_string()],
                    },
                    ComplianceRequirement {
                        id: "pci_vulnerability_management".to_string(),
                        title: "Vulnerability Management".to_string(),
                        description: "Regularly test security systems and processes".to_string(),
                        severity: RequirementSeverity::High,
                        mandatory: true,
                        deadline_hours: None,
                        penalties: vec!["Potential loss of card processing privileges".to_string()],
                    },
                ],
                notification_triggers: vec![
                    "payment_data".to_string(),
                    "cardholder_data".to_string(),
                    "payment_system".to_string(),
                ],
            },
            ComplianceFramework {
                id: "sox".to_string(),
                name: "Sarbanes-Oxley Act".to_string(),
                version: "2002".to_string(),
                jurisdiction: "United States".to_string(),
                requirements: vec![
                    ComplianceRequirement {
                        id: "sox_internal_controls".to_string(),
                        title: "Internal Controls Over Financial Reporting".to_string(),
                        description: "Maintain adequate internal control structure".to_string(),
                        severity: RequirementSeverity::Critical,
                        mandatory: true,
                        deadline_hours: None,
                        penalties: vec!["Criminal penalties including imprisonment".to_string()],
                    },
                ],
                notification_triggers: vec![
                    "financial_data".to_string(),
                    "financial_system".to_string(),
                ],
            },
            ComplianceFramework {
                id: "hipaa".to_string(),
                name: "Health Insurance Portability and Accountability Act".to_string(),
                version: "1996".to_string(),
                jurisdiction: "United States".to_string(),
                requirements: vec![
                    ComplianceRequirement {
                        id: "hipaa_breach_notification".to_string(),
                        title: "Breach Notification Rule".to_string(),
                        description: "Notify patients and HHS within 60 days of breach".to_string(),
                        severity: RequirementSeverity::Critical,
                        mandatory: true,
                        deadline_hours: Some(1440), // 60 days
                        penalties: vec!["Civil monetary penalties up to $1.5 million".to_string()],
                    },
                ],
                notification_triggers: vec![
                    "health_data".to_string(),
                    "medical_records".to_string(),
                    "phi".to_string(),
                ],
            },
        ];

        let mut compliance_frameworks = self.compliance_frameworks.write().await;
        for framework in frameworks {
            compliance_frameworks.insert(framework.id.clone(), framework);
        }

        Ok(())
    }

    /// Check compliance for an IOC incident
    pub async fn check_compliance(&self, ioc: &IOC, incident_context: &IncidentContext) -> Result<ComplianceAssessment, IOCError> {
        let assessment_id = Uuid::new_v4().to_string();
        let assessment_time = Utc::now();

        // Identify applicable frameworks
        let applicable_frameworks = self.identify_applicable_frameworks(ioc, incident_context).await?;
        
        let mut triggered_requirements = Vec::new();
        let mut violations = Vec::new();
        let mut notifications_required = Vec::new();

        for framework_id in &applicable_frameworks {
            let framework = {
                let frameworks = self.compliance_frameworks.read().await;
                frameworks.get(framework_id).cloned()
                    .ok_or_else(|| IOCError::Configuration(format!("Framework not found: {}", framework_id)))?
            };

            // Check each requirement
            for requirement in &framework.requirements {
                let compliance_status = self.assess_requirement_compliance(
                    &requirement,
                    ioc,
                    incident_context,
                    &assessment_time
                ).await?;

                triggered_requirements.push(TriggeredRequirement {
                    framework_id: framework.id.clone(),
                    requirement_id: requirement.id.clone(),
                    title: requirement.title.clone(),
                    status: compliance_status.clone(),
                    deadline: if let Some(hours) = requirement.deadline_hours {
                        Some(assessment_time + Duration::hours(hours as i64))
                    } else {
                        None
                    },
                    actions_required: self.determine_required_actions(&requirement, &compliance_status).await,
                });

                // Check for violations
                if matches!(compliance_status, ComplianceStatus::NonCompliant | ComplianceStatus::AtRisk) {
                    violations.push(self.create_violation_record(
                        &framework,
                        &requirement,
                        ioc,
                        incident_context,
                        &assessment_time
                    ).await?);
                }

                // Check notification requirements
                if requirement.mandatory && matches!(compliance_status, ComplianceStatus::NonCompliant) {
                    notifications_required.push(ComplianceNotification {
                        framework_id: framework.id.clone(),
                        requirement_id: requirement.id.clone(),
                        notification_type: NotificationType::Regulatory,
                        recipients: self.get_notification_recipients(&framework, &requirement).await,
                        deadline: if let Some(hours) = requirement.deadline_hours {
                            Some(assessment_time + Duration::hours(hours as i64))
                        } else {
                            Some(assessment_time + Duration::hours(24)) // Default 24 hours
                        },
                        urgency: match requirement.severity {
                            RequirementSeverity::Critical => NotificationUrgency::Immediate,
                            RequirementSeverity::High => NotificationUrgency::High,
                            RequirementSeverity::Medium => NotificationUrgency::Medium,
                            RequirementSeverity::Low => NotificationUrgency::Low,
                        },
                    });
                }
            }
        }

        let overall_status = self.determine_overall_compliance_status(&triggered_requirements);
        let risk_level = self.assess_compliance_risk(&violations, &triggered_requirements);

        let assessment = ComplianceAssessment {
            id: assessment_id.clone(),
            ioc_id: ioc.id.to_string(),
            assessment_time,
            applicable_frameworks,
            triggered_requirements,
            violations: violations.iter().map(|v| v.id.clone()).collect(),
            notifications_required,
            overall_status,
            risk_level,
            next_review_date: assessment_time + Duration::days(30),
            metadata: HashMap::from([
                ("incident_id".to_string(), serde_json::Value::String(incident_context.incident_id.clone())),
                ("assessor".to_string(), serde_json::Value::String(incident_context.analyst.clone())),
            ]),
        };

        // Store violations
        {
            let mut stored_violations = self.violations.write().await;
            for violation in violations {
                stored_violations.insert(violation.id.clone(), violation);
            }
        }

        // Log the assessment
        self.log_audit_event(AuditEvent {
            id: Uuid::new_v4().to_string(),
            event_type: AuditEventType::ComplianceAssessment,
            timestamp: assessment_time,
            actor: incident_context.analyst.clone(),
            resource_type: "ioc".to_string(),
            resource_id: ioc.id.to_string(),
            action: "compliance_assessment".to_string(),
            details: format!("Compliance assessment completed for IOC {}", ioc.value),
            metadata: HashMap::from([
                ("assessment_id".to_string(), serde_json::Value::String(assessment_id.clone())),
                ("frameworks_checked".to_string(), serde_json::Value::Number(
                    serde_json::Number::from(applicable_frameworks.len())
                )),
            ]),
        }).await?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_assessments += 1;
            match overall_status {
                ComplianceStatus::Compliant => stats.compliant_assessments += 1,
                ComplianceStatus::NonCompliant => stats.non_compliant_assessments += 1,
                ComplianceStatus::AtRisk => stats.at_risk_assessments += 1,
                ComplianceStatus::Unknown => stats.unknown_assessments += 1,
            }
            stats.last_assessment_time = Some(assessment_time);
        }

        Ok(assessment)
    }

    /// Identify applicable compliance frameworks for an IOC
    async fn identify_applicable_frameworks(&self, ioc: &IOC, context: &IncidentContext) -> Result<Vec<String>, IOCError> {
        let frameworks = self.compliance_frameworks.read().await;
        let mut applicable = Vec::new();

        for (framework_id, framework) in frameworks.iter() {
            // Check if any trigger conditions match
            for trigger in &framework.notification_triggers {
                if ioc.tags.iter().any(|tag| tag.contains(trigger)) ||
                   context.affected_systems.iter().any(|system| system.contains(trigger)) ||
                   context.data_types.iter().any(|data_type| data_type.contains(trigger)) {
                    applicable.push(framework_id.clone());
                    break;
                }
            }
        }

        Ok(applicable)
    }

    /// Assess compliance status for a specific requirement
    async fn assess_requirement_compliance(
        &self,
        requirement: &ComplianceRequirement,
        ioc: &IOC,
        context: &IncidentContext,
        assessment_time: &DateTime<Utc>
    ) -> Result<ComplianceStatus, IOCError> {
        // Check if incident response was timely
        if requirement.id.contains("breach_notification") || requirement.id.contains("incident_response") {
            if let Some(deadline_hours) = requirement.deadline_hours {
                let incident_time = context.incident_start_time;
                let elapsed_hours = (*assessment_time - incident_time).num_hours();
                
                if elapsed_hours > deadline_hours as i64 {
                    return Ok(ComplianceStatus::NonCompliant);
                } else if elapsed_hours > (deadline_hours as f64 * 0.8) as i64 {
                    return Ok(ComplianceStatus::AtRisk);
                }
            }
        }

        // Check for proper controls based on IOC severity
        if requirement.id.contains("controls") || requirement.id.contains("protection") {
            match ioc.severity {
                Severity::Critical | Severity::High => {
                    if context.controls_in_place {
                        Ok(ComplianceStatus::Compliant)
                    } else {
                        Ok(ComplianceStatus::NonCompliant)
                    }
                }
                _ => Ok(ComplianceStatus::Compliant)
            }
        } else {
            // Default to compliant for other requirements
            Ok(ComplianceStatus::Compliant)
        }
    }

    /// Determine required actions for a compliance requirement
    async fn determine_required_actions(&self, requirement: &ComplianceRequirement, status: &ComplianceStatus) -> Vec<String> {
        let mut actions = Vec::new();

        match status {
            ComplianceStatus::NonCompliant => {
                if requirement.id.contains("notification") {
                    actions.push("Submit regulatory notification immediately".to_string());
                }
                if requirement.id.contains("controls") {
                    actions.push("Implement required security controls".to_string());
                }
                actions.push("Document remediation steps".to_string());
                actions.push("Schedule compliance review".to_string());
            }
            ComplianceStatus::AtRisk => {
                actions.push("Review compliance status urgently".to_string());
                actions.push("Prepare for potential notification".to_string());
            }
            _ => {}
        }

        actions
    }

    /// Create a violation record
    async fn create_violation_record(
        &self,
        framework: &ComplianceFramework,
        requirement: &ComplianceRequirement,
        ioc: &IOC,
        context: &IncidentContext,
        timestamp: &DateTime<Utc>
    ) -> Result<ComplianceViolation, IOCError> {
        Ok(ComplianceViolation {
            id: Uuid::new_v4().to_string(),
            framework_id: framework.id.clone(),
            requirement_id: requirement.id.clone(),
            violation_type: ViolationType::ProcessFailure,
            severity: match requirement.severity {
                RequirementSeverity::Critical => ViolationSeverity::Critical,
                RequirementSeverity::High => ViolationSeverity::High,
                RequirementSeverity::Medium => ViolationSeverity::Medium,
                RequirementSeverity::Low => ViolationSeverity::Low,
            },
            description: format!("Compliance violation for requirement: {}", requirement.title),
            related_ioc_id: ioc.id.to_string(),
            incident_id: context.incident_id.clone(),
            detected_at: *timestamp,
            status: ViolationStatus::Open,
            potential_penalties: requirement.penalties.clone(),
            remediation_steps: vec![
                "Review incident response procedures".to_string(),
                "Update compliance documentation".to_string(),
                "Implement corrective measures".to_string(),
            ],
            assigned_to: context.analyst.clone(),
            due_date: if let Some(hours) = requirement.deadline_hours {
                Some(*timestamp + Duration::hours(hours as i64))
            } else {
                Some(*timestamp + Duration::days(30))
            },
        })
    }

    /// Get notification recipients for a framework requirement
    async fn get_notification_recipients(&self, framework: &ComplianceFramework, requirement: &ComplianceRequirement) -> Vec<String> {
        let mut recipients = Vec::new();

        match framework.id.as_str() {
            "gdpr" => {
                recipients.push("data-protection-officer@company.com".to_string());
                recipients.push("legal-team@company.com".to_string());
                if requirement.severity == RequirementSeverity::Critical {
                    recipients.push("supervisory-authority@gdpr.eu".to_string());
                }
            }
            "pci_dss" => {
                recipients.push("compliance-team@company.com".to_string());
                recipients.push("payment-security@company.com".to_string());
            }
            "sox" => {
                recipients.push("financial-controls@company.com".to_string());
                recipients.push("internal-audit@company.com".to_string());
            }
            "hipaa" => {
                recipients.push("privacy-officer@company.com".to_string());
                recipients.push("healthcare-compliance@company.com".to_string());
            }
            _ => {
                recipients.push("compliance-team@company.com".to_string());
            }
        }

        recipients
    }

    /// Determine overall compliance status
    fn determine_overall_compliance_status(&self, requirements: &[TriggeredRequirement]) -> ComplianceStatus {
        if requirements.iter().any(|r| matches!(r.status, ComplianceStatus::NonCompliant)) {
            ComplianceStatus::NonCompliant
        } else if requirements.iter().any(|r| matches!(r.status, ComplianceStatus::AtRisk)) {
            ComplianceStatus::AtRisk
        } else if requirements.iter().all(|r| matches!(r.status, ComplianceStatus::Compliant)) {
            ComplianceStatus::Compliant
        } else {
            ComplianceStatus::Unknown
        }
    }

    /// Assess compliance risk level
    fn assess_compliance_risk(&self, violations: &[ComplianceViolation], requirements: &[TriggeredRequirement]) -> ComplianceRiskLevel {
        let critical_violations = violations.iter().filter(|v| matches!(v.severity, ViolationSeverity::Critical)).count();
        let high_violations = violations.iter().filter(|v| matches!(v.severity, ViolationSeverity::High)).count();

        if critical_violations > 0 {
            ComplianceRiskLevel::Critical
        } else if high_violations > 2 {
            ComplianceRiskLevel::High
        } else if high_violations > 0 || violations.len() > 3 {
            ComplianceRiskLevel::Medium
        } else {
            ComplianceRiskLevel::Low
        }
    }

    /// Log an audit event
    async fn log_audit_event(&self, event: AuditEvent) -> Result<(), IOCError> {
        let mut logs = self.audit_logs.write().await;
        logs.push(event);

        // Keep only last 10000 events to prevent memory issues
        if logs.len() > 10000 {
            logs.drain(0..1000);
        }

        Ok(())
    }

    /// Generate compliance report
    pub async fn generate_compliance_report(&self, period_start: DateTime<Utc>, period_end: DateTime<Utc>) -> Result<ComplianceReport, IOCError> {
        let report_id = Uuid::new_v4().to_string();
        
        // Get audit events for the period
        let logs = self.audit_logs.read().await;
        let period_events: Vec<_> = logs.iter()
            .filter(|event| event.timestamp >= period_start && event.timestamp <= period_end)
            .cloned()
            .collect();

        // Get violations for the period
        let violations = self.violations.read().await;
        let period_violations: Vec<_> = violations.values()
            .filter(|v| v.detected_at >= period_start && v.detected_at <= period_end)
            .cloned()
            .collect();

        // Generate compliance metrics
        let metrics = ComplianceMetrics {
            total_assessments: period_events.iter()
                .filter(|e| matches!(e.event_type, AuditEventType::ComplianceAssessment))
                .count() as u64,
            compliant_percentage: self.calculate_compliance_percentage(&period_events),
            violations_by_framework: self.group_violations_by_framework(&period_violations),
            average_response_time: self.calculate_average_response_time(&period_events),
            improvement_areas: self.identify_improvement_areas(&period_violations),
        };

        let report = ComplianceReport {
            id: report_id.clone(),
            period_start,
            period_end,
            generated_at: Utc::now(),
            metrics,
            violations: period_violations,
            audit_events: period_events,
            recommendations: self.generate_compliance_recommendations(&period_violations).await,
            executive_summary: self.generate_executive_summary(&metrics, &period_violations),
        };

        // Store the report
        {
            let mut reports = self.compliance_reports.write().await;
            reports.insert(report_id, report.clone());
        }

        Ok(report)
    }

    fn calculate_compliance_percentage(&self, events: &[AuditEvent]) -> f64 {
        let assessments = events.iter()
            .filter(|e| matches!(e.event_type, AuditEventType::ComplianceAssessment))
            .count();
        
        if assessments == 0 {
            return 100.0;
        }

        // Simplified calculation
        let violations = events.iter()
            .filter(|e| matches!(e.event_type, AuditEventType::ViolationDetected))
            .count();

        ((assessments - violations) as f64 / assessments as f64) * 100.0
    }

    fn group_violations_by_framework(&self, violations: &[ComplianceViolation]) -> HashMap<String, u64> {
        let mut counts = HashMap::new();
        for violation in violations {
            *counts.entry(violation.framework_id.clone()).or_insert(0) += 1;
        }
        counts
    }

    fn calculate_average_response_time(&self, events: &[AuditEvent]) -> f64 {
        // Simplified calculation - would need more sophisticated tracking in real implementation
        24.0 // Default 24 hours
    }

    fn identify_improvement_areas(&self, violations: &[ComplianceViolation]) -> Vec<String> {
        let mut areas = Vec::new();
        
        if violations.iter().any(|v| v.violation_type == ViolationType::ProcessFailure) {
            areas.push("Incident response procedures".to_string());
        }
        
        if violations.iter().any(|v| v.violation_type == ViolationType::TimelineMissed) {
            areas.push("Notification timelines".to_string());
        }

        if violations.len() > 5 {
            areas.push("Overall compliance program".to_string());
        }

        areas
    }

    async fn generate_compliance_recommendations(&self, violations: &[ComplianceViolation]) -> Vec<String> {
        let mut recommendations = Vec::new();

        if violations.iter().any(|v| matches!(v.severity, ViolationSeverity::Critical)) {
            recommendations.push("Implement enhanced monitoring for critical compliance requirements".to_string());
        }

        if violations.len() > 3 {
            recommendations.push("Review and update compliance procedures".to_string());
            recommendations.push("Provide additional compliance training to staff".to_string());
        }

        if violations.iter().any(|v| v.framework_id == "gdpr") {
            recommendations.push("Enhance data protection measures and breach response procedures".to_string());
        }

        recommendations
    }

    fn generate_executive_summary(&self, metrics: &ComplianceMetrics, violations: &[ComplianceViolation]) -> String {
        format!(
            "Compliance Summary: {}% compliance rate with {} violations detected. {} assessments completed during reporting period. Key areas for improvement: {}",
            metrics.compliant_percentage as u32,
            violations.len(),
            metrics.total_assessments,
            metrics.improvement_areas.join(", ")
        )
    }

    /// Get compliance statistics
    pub async fn get_statistics(&self) -> ComplianceStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let frameworks = self.compliance_frameworks.read().await;
        let violations = self.violations.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Compliance engine operational with {} frameworks", frameworks.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("frameworks".to_string(), frameworks.len() as f64),
                ("total_assessments".to_string(), stats.total_assessments as f64),
                ("open_violations".to_string(), violations.values()
                    .filter(|v| v.status == ViolationStatus::Open)
                    .count() as f64),
                ("compliance_rate".to_string(), if stats.total_assessments > 0 {
                    stats.compliant_assessments as f64 / stats.total_assessments as f64 * 100.0
                } else { 100.0 }),
            ]),
        }
    }
}

// Compliance data structures

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFramework {
    pub id: String,
    pub name: String,
    pub version: String,
    pub jurisdiction: String,
    pub requirements: Vec<ComplianceRequirement>,
    pub notification_triggers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRequirement {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: RequirementSeverity,
    pub mandatory: bool,
    pub deadline_hours: Option<u32>,
    pub penalties: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RequirementSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentContext {
    pub incident_id: String,
    pub incident_start_time: DateTime<Utc>,
    pub affected_systems: Vec<String>,
    pub data_types: Vec<String>,
    pub controls_in_place: bool,
    pub analyst: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceAssessment {
    pub id: String,
    pub ioc_id: String,
    pub assessment_time: DateTime<Utc>,
    pub applicable_frameworks: Vec<String>,
    pub triggered_requirements: Vec<TriggeredRequirement>,
    pub violations: Vec<String>,
    pub notifications_required: Vec<ComplianceNotification>,
    pub overall_status: ComplianceStatus,
    pub risk_level: ComplianceRiskLevel,
    pub next_review_date: DateTime<Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggeredRequirement {
    pub framework_id: String,
    pub requirement_id: String,
    pub title: String,
    pub status: ComplianceStatus,
    pub deadline: Option<DateTime<Utc>>,
    pub actions_required: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceStatus {
    Compliant,
    NonCompliant,
    AtRisk,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplianceRiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceNotification {
    pub framework_id: String,
    pub requirement_id: String,
    pub notification_type: NotificationType,
    pub recipients: Vec<String>,
    pub deadline: Option<DateTime<Utc>>,
    pub urgency: NotificationUrgency,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    Regulatory,
    Internal,
    Customer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationUrgency {
    Immediate,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceViolation {
    pub id: String,
    pub framework_id: String,
    pub requirement_id: String,
    pub violation_type: ViolationType,
    pub severity: ViolationSeverity,
    pub description: String,
    pub related_ioc_id: String,
    pub incident_id: String,
    pub detected_at: DateTime<Utc>,
    pub status: ViolationStatus,
    pub potential_penalties: Vec<String>,
    pub remediation_steps: Vec<String>,
    pub assigned_to: String,
    pub due_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ViolationType {
    ProcessFailure,
    TimelineMissed,
    ControlDeficiency,
    DocumentationGap,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ViolationSeverity {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ViolationStatus {
    Open,
    InProgress,
    Resolved,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub event_type: AuditEventType,
    pub timestamp: DateTime<Utc>,
    pub actor: String,
    pub resource_type: String,
    pub resource_id: String,
    pub action: String,
    pub details: String,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    ComplianceAssessment,
    ViolationDetected,
    NotificationSent,
    ReportGenerated,
    PolicyUpdate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceReport {
    pub id: String,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub generated_at: DateTime<Utc>,
    pub metrics: ComplianceMetrics,
    pub violations: Vec<ComplianceViolation>,
    pub audit_events: Vec<AuditEvent>,
    pub recommendations: Vec<String>,
    pub executive_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMetrics {
    pub total_assessments: u64,
    pub compliant_percentage: f64,
    pub violations_by_framework: HashMap<String, u64>,
    pub average_response_time: f64,
    pub improvement_areas: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ComplianceStats {
    pub total_assessments: u64,
    pub compliant_assessments: u64,
    pub non_compliant_assessments: u64,
    pub at_risk_assessments: u64,
    pub unknown_assessments: u64,
    pub total_violations: u64,
    pub last_assessment_time: Option<DateTime<Utc>>,
}