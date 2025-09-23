//! Incident Response Models
//! 
//! Core data structures for incident management and response

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use napi_derive::napi;

/// Incident severity levels
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentSeverity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// Incident status tracking
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentStatus {
    New,
    Assigned,
    InProgress,
    Investigating,
    Contained,
    Eradicated,
    Recovering,
    Resolved,
    Closed,
    Reopened,
}

/// Incident categories
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentCategory {
    Malware,
    Phishing,
    DataBreach,
    DenialOfService,
    Unauthorized,
    SystemCompromise,
    NetworkIntrusion,
    InsiderThreat,
    PhysicalSecurity,
    Compliance,
    Other,
}

/// Response team roles
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResponderRole {
    IncidentCommander,
    LeadInvestigator,
    ForensicsAnalyst,
    SecurityAnalyst,
    NetworkAnalyst,
    SystemAdministrator,
    CommunicationsLead,
    LegalCounsel,
    ComplianceOfficer,
    ExecutiveSponsor,
}

/// Core incident structure
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Incident {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: IncidentCategory,
    pub severity: IncidentSeverity,
    pub status: IncidentStatus,
    pub priority: u8,
    pub created_at: i64,
    pub updated_at: i64,
    pub detected_at: i64,
    pub reported_by: String,
    pub assigned_to: String,
    pub incident_commander: String,
    pub affected_systems: Vec<String>,
    pub affected_users: Vec<String>,
    pub indicators: Vec<String>,
    pub tags: Vec<String>,
    pub timeline: Vec<TimelineEvent>,
    pub responders: Vec<Responder>,
    pub evidence: Vec<Evidence>,
    pub tasks: Vec<Task>,
    pub communications: Vec<Communication>,
    pub impact_assessment: ImpactAssessment,
    pub containment_actions: Vec<ContainmentAction>,
    pub eradication_actions: Vec<EradicationAction>,
    pub recovery_actions: Vec<RecoveryAction>,
    pub lessons_learned: Vec<LessonLearned>,
    pub cost_estimate: f64,
    pub sla_breach: bool,
    pub external_notifications: Vec<ExternalNotification>,
    pub compliance_requirements: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Timeline event for incident tracking
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineEvent {
    pub id: String,
    pub timestamp: i64,
    pub event_type: String,
    pub description: String,
    pub actor: String,
    pub source: String,
    pub details: HashMap<String, String>,
    pub automated: bool,
}

/// Response team member
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Responder {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: ResponderRole,
    pub phone: Option<String>,
    pub availability: String,
    pub skills: Vec<String>,
    pub assigned_at: i64,
    pub active: bool,
}

/// Incident response task
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub assigned_to: String,
    pub created_at: i64,
    pub due_date: Option<i64>,
    pub completed_at: Option<i64>,
    pub status: String,
    pub priority: u8,
    pub category: String,
    pub dependencies: Vec<String>,
    pub checklist: Vec<ChecklistItem>,
    pub notes: String,
}

/// Task checklist item
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub id: String,
    pub description: String,
    pub completed: bool,
    pub completed_by: Option<String>,
    pub completed_at: Option<i64>,
}

/// Communication channels
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CommunicationChannel {
    Email,
    Slack,
    Teams,
    Phone,
    SMS,
    WebPortal,
    Dashboard,
    API,
}

/// Communication record
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Communication {
    pub id: String,
    pub timestamp: i64,
    pub channel: CommunicationChannel,
    pub sender: String,
    pub recipients: Vec<String>,
    pub subject: String,
    pub message: String,
    pub attachments: Vec<String>,
    pub status: String,
}

/// Impact assessment
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactAssessment {
    pub business_impact: String,
    pub technical_impact: String,
    pub financial_impact: f64,
    pub reputation_impact: String,
    pub compliance_impact: String,
    pub affected_customers: u32,
    pub affected_systems_count: u32,
    pub data_compromised: bool,
    pub service_disruption: bool,
    pub estimated_downtime: u32,
}

/// External notification
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalNotification {
    pub id: String,
    pub recipient: String,
    pub notification_type: String,
    pub sent_at: i64,
    pub sent_by: String,
    pub content: String,
    pub delivery_status: String,
    pub response_required: bool,
    pub response_deadline: Option<i64>,
}

use crate::evidence_models::{Evidence};
use crate::response_actions::{ContainmentAction, EradicationAction, RecoveryAction, LessonLearned};