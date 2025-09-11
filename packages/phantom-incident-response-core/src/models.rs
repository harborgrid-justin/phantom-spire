//! Additional Models and Data Structures
//! 
//! Supporting data structures for NIST SP 800-61r2 compliant incident response,
//! This module contains models that support the core functionality but aren't
//! specific to incidents, evidence, or response actions

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use napi_derive::napi;

/// NIST SP 800-61r2 Incident Response Team Structure
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentResponseTeam {
    pub id: String,
    pub name: String,
    pub description: String,
    pub organization: String,
    pub team_lead: String,
    pub members: Vec<TeamMember>,
    pub on_call_schedule: Vec<OnCallSchedule>,
    pub escalation_contacts: Vec<EscalationContact>,
    pub capabilities: Vec<String>,
    pub coverage_hours: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// Team member information
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMember {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub role: String,
    pub skills: Vec<String>,
    pub certifications: Vec<String>,
    pub availability: String,
    pub backup_contact: Option<String>,
}

/// On-call schedule
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnCallSchedule {
    pub id: String,
    pub member_id: String,
    pub start_time: i64,
    pub end_time: i64,
    pub primary: bool,
    pub backup_member_id: Option<String>,
}

/// Escalation contact
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationContact {
    pub id: String,
    pub name: String,
    pub role: String,
    pub email: String,
    pub phone: String,
    pub escalation_level: u8,
    pub notification_methods: Vec<String>,
}

/// NIST Preparedness Assessment
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparednessAssessment {
    pub id: String,
    pub assessment_date: i64,
    pub assessor: String,
    pub overall_score: f64,
    pub categories: Vec<PreparednessCategory>,
    pub recommendations: Vec<String>,
    pub action_items: Vec<ActionItem>,
    pub next_assessment_date: i64,
}

/// Preparedness category scoring
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparednessCategory {
    pub name: String,
    pub description: String,
    pub score: f64,
    pub max_score: f64,
    pub criteria: Vec<PreparednessCriteria>,
    pub gaps: Vec<String>,
}

/// Preparedness criteria
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparednessCriteria {
    pub name: String,
    pub description: String,
    pub weight: f64,
    pub score: f64,
    pub evidence: Vec<String>,
    pub notes: String,
}

/// Action item for preparedness improvement
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionItem {
    pub id: String,
    pub title: String,
    pub description: String,
    pub priority: u8,
    pub assigned_to: String,
    pub due_date: i64,
    pub status: String,
    pub progress: f64,
    pub dependencies: Vec<String>,
}

/// Threat landscape analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatLandscape {
    pub id: String,
    pub analysis_date: i64,
    pub analyst: String,
    pub period_start: i64,
    pub period_end: i64,
    pub threat_actors: Vec<ThreatActorActivity>,
    pub attack_vectors: Vec<AttackVector>,
    pub targeted_assets: Vec<String>,
    pub industry_trends: Vec<IndustryTrend>,
    pub recommendations: Vec<String>,
}

/// Threat actor activity
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActorActivity {
    pub actor_name: String,
    pub activity_level: String,
    pub targeting: Vec<String>,
    pub techniques: Vec<String>,
    pub campaigns: Vec<String>,
    pub risk_level: String,
}

/// Attack vector information
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackVector {
    pub vector_type: String,
    pub prevalence: String,
    pub effectiveness: String,
    pub detection_difficulty: String,
    pub mitigation_strategies: Vec<String>,
}

/// Industry trend analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndustryTrend {
    pub trend_name: String,
    pub description: String,
    pub impact_level: String,
    pub timeframe: String,
    pub affected_sectors: Vec<String>,
}

/// Training and awareness program
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingProgram {
    pub id: String,
    pub name: String,
    pub description: String,
    pub target_audience: Vec<String>,
    pub modules: Vec<TrainingModule>,
    pub schedule: TrainingSchedule,
    pub effectiveness_metrics: Vec<EffectivenessMetric>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// Training module
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingModule {
    pub id: String,
    pub name: String,
    pub content_type: String,
    pub duration_minutes: u32,
    pub learning_objectives: Vec<String>,
    pub assessment_criteria: Vec<String>,
    pub materials: Vec<String>,
}

/// Training schedule
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingSchedule {
    pub frequency: String,
    pub next_session: i64,
    pub mandatory: bool,
    pub completion_deadline: Option<i64>,
    pub recurring_schedule: Vec<RecurringSession>,
}

/// Recurring training session
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecurringSession {
    pub session_type: String,
    pub interval_days: u32,
    pub duration_minutes: u32,
    pub participants: Vec<String>,
}

/// Training effectiveness metric
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectivenessMetric {
    pub metric_name: String,
    pub measurement_method: String,
    pub target_value: f64,
    pub current_value: f64,
    pub trend: String,
}

/// Business impact analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpactAnalysis {
    pub id: String,
    pub analysis_date: i64,
    pub analyst: String,
    pub business_processes: Vec<BusinessProcess>,
    pub critical_dependencies: Vec<Dependency>,
    pub recovery_objectives: RecoveryObjectives,
    pub impact_scenarios: Vec<ImpactScenario>,
}

/// Business process analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessProcess {
    pub name: String,
    pub description: String,
    pub criticality_level: String,
    pub dependencies: Vec<String>,
    pub recovery_time_objective: u32,
    pub recovery_point_objective: u32,
    pub maximum_tolerable_downtime: u32,
}

/// System or service dependency
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    pub name: String,
    pub type_: String,
    pub criticality: String,
    pub vendor: Option<String>,
    pub alternate_options: Vec<String>,
    pub recovery_procedures: Vec<String>,
}

/// Recovery objectives
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryObjectives {
    pub overall_rto_hours: u32,
    pub overall_rpo_hours: u32,
    pub maximum_data_loss_tolerance: String,
    pub service_level_targets: HashMap<String, f64>,
}

/// Impact scenario analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactScenario {
    pub scenario_name: String,
    pub description: String,
    pub probability: String,
    pub impact_level: String,
    pub financial_impact: f64,
    pub operational_impact: String,
    pub reputation_impact: String,
    pub compliance_impact: String,
}

/// Vendor and third-party management
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendorManagement {
    pub id: String,
    pub vendor_name: String,
    pub service_description: String,
    pub criticality_level: String,
    pub contract_details: ContractDetails,
    pub incident_response_capabilities: Vec<String>,
    pub communication_contacts: Vec<VendorContact>,
    pub sla_requirements: HashMap<String, String>,
}

/// Contract details for vendors
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractDetails {
    pub contract_number: String,
    pub start_date: i64,
    pub end_date: i64,
    pub renewal_terms: String,
    pub incident_response_clauses: Vec<String>,
    pub liability_terms: String,
}

/// Vendor contact information
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VendorContact {
    pub name: String,
    pub role: String,
    pub email: String,
    pub phone: String,
    pub escalation_level: u8,
    pub availability: String,
}

/// Policy and procedure management
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyDocument {
    pub id: String,
    pub title: String,
    pub description: String,
    pub version: String,
    pub document_type: String,
    pub approval_status: String,
    pub effective_date: i64,
    pub review_date: i64,
    pub owner: String,
    pub approvers: Vec<String>,
    pub content_sections: Vec<PolicySection>,
    pub related_procedures: Vec<String>,
}

/// Policy section
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicySection {
    pub section_number: String,
    pub title: String,
    pub content: String,
    pub requirements: Vec<String>,
    pub exceptions: Vec<String>,
}

/// Regulatory compliance tracking
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFramework {
    pub id: String,
    pub framework_name: String,
    pub version: String,
    pub applicable_requirements: Vec<ComplianceRequirement>,
    pub assessment_schedule: String,
    pub last_assessment_date: i64,
    pub next_assessment_date: i64,
    pub compliance_status: String,
    pub gaps: Vec<ComplianceGap>,
}

/// Individual compliance requirement
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRequirement {
    pub requirement_id: String,
    pub title: String,
    pub description: String,
    pub criticality: String,
    pub implementation_status: String,
    pub evidence_artifacts: Vec<String>,
    pub responsible_party: String,
    pub due_date: Option<i64>,
}

/// Compliance gap
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceGap {
    pub requirement_id: String,
    pub gap_description: String,
    pub risk_level: String,
    pub remediation_plan: String,
    pub target_completion_date: i64,
    pub assigned_to: String,
}

/// Service Level Agreement tracking
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceLevelAgreement {
    pub id: String,
    pub service_name: String,
    pub customer: String,
    pub sla_terms: Vec<SlaMetric>,
    pub incident_response_terms: SlaIncidentTerms,
    pub reporting_requirements: Vec<String>,
    pub penalties: Vec<SlaPenalty>,
    pub effective_period: DateRange,
}

/// SLA metric definition
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaMetric {
    pub metric_name: String,
    pub target_value: f64,
    pub measurement_unit: String,
    pub measurement_frequency: String,
    pub breach_threshold: f64,
    pub current_performance: f64,
}

/// SLA incident response terms
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaIncidentTerms {
    pub response_time_minutes: HashMap<String, u32>,
    pub resolution_time_hours: HashMap<String, u32>,
    pub communication_requirements: Vec<String>,
    pub escalation_procedures: Vec<String>,
}

/// SLA penalty structure
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlaPenalty {
    pub breach_type: String,
    pub penalty_type: String,
    pub penalty_amount: f64,
    pub conditions: Vec<String>,
}

/// Date range utility
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DateRange {
    pub start_date: i64,
    pub end_date: i64,
}

/// Knowledge base article
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeArticle {
    pub id: String,
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub content: String,
    pub author: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub version: String,
    pub approval_status: String,
    pub view_count: u32,
    pub helpful_votes: u32,
    pub related_articles: Vec<String>,
}

/// Simulation and tabletop exercise
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabletopExercise {
    pub id: String,
    pub name: String,
    pub description: String,
    pub scenario: String,
    pub objectives: Vec<String>,
    pub participants: Vec<String>,
    pub facilitator: String,
    pub scheduled_date: i64,
    pub duration_minutes: u32,
    pub results: Option<ExerciseResults>,
}

/// Exercise results and findings
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseResults {
    pub completion_date: i64,
    pub participants_count: u32,
    pub objectives_met: u32,
    pub total_objectives: u32,
    pub findings: Vec<Finding>,
    pub improvement_areas: Vec<String>,
    pub action_items: Vec<ActionItem>,
    pub overall_score: f64,
}

/// Exercise finding
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub category: String,
    pub description: String,
    pub severity: String,
    pub recommendation: String,
    pub assigned_to: String,
    pub due_date: i64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_incident_response_team_creation() {
        let team = IncidentResponseTeam {
            id: "team-1".to_string(),
            name: "Primary IR Team".to_string(),
            description: "Main incident response team".to_string(),
            organization: "ACME Corp".to_string(),
            team_lead: "john.doe@acme.com".to_string(),
            members: vec![],
            on_call_schedule: vec![],
            escalation_contacts: vec![],
            capabilities: vec!["malware_analysis".to_string(), "forensics".to_string()],
            coverage_hours: "24x7".to_string(),
            created_at: 1633536000,
            updated_at: 1633536000,
        };

        assert_eq!(team.name, "Primary IR Team");
        assert_eq!(team.capabilities.len(), 2);
    }

    #[test]
    fn test_preparedness_assessment_scoring() {
        let assessment = PreparednessAssessment {
            id: "assessment-1".to_string(),
            assessment_date: 1633536000,
            assessor: "Security Team".to_string(),
            overall_score: 85.0,
            categories: vec![],
            recommendations: vec![],
            action_items: vec![],
            next_assessment_date: 1641312000,
        };

        assert_eq!(assessment.overall_score, 85.0);
        assert!(assessment.overall_score >= 80.0); // Good preparedness level
    }
}