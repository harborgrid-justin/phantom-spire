//! Phantom Incident Response Core
//! 
//! Advanced incident response engine providing comprehensive incident management,
//! response automation, forensic analysis, and recovery coordination capabilities.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;
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

/// Evidence types for forensic analysis
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EvidenceType {
    DiskImage,
    MemoryDump,
    NetworkCapture,
    LogFile,
    Registry,
    FileSystem,
    Database,
    Email,
    Document,
    Screenshot,
    Video,
    Audio,
    Mobile,
    Cloud,
}

/// Playbook execution status
#[napi]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PlaybookStatus {
    NotStarted,
    InProgress,
    Completed,
    Failed,
    Skipped,
    Paused,
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

/// Digital evidence item
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub id: String,
    pub name: String,
    pub evidence_type: EvidenceType,
    pub description: String,
    pub source_system: String,
    pub collected_by: String,
    pub collected_at: i64,
    pub file_path: String,
    pub file_size: u64,
    pub hash_md5: String,
    pub hash_sha256: String,
    pub chain_of_custody: Vec<CustodyRecord>,
    pub analysis_results: Vec<AnalysisResult>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Chain of custody record
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyRecord {
    pub timestamp: i64,
    pub action: String,
    pub person: String,
    pub location: String,
    pub notes: String,
}

/// Analysis result for evidence
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub id: String,
    pub analyst: String,
    pub analysis_type: String,
    pub timestamp: i64,
    pub findings: String,
    pub confidence: f32,
    pub tools_used: Vec<String>,
    pub artifacts: Vec<String>,
    pub recommendations: Vec<String>,
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

/// Containment action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainmentAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub effectiveness: String,
    pub side_effects: Vec<String>,
    pub rollback_plan: String,
}

/// Eradication action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EradicationAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub target_systems: Vec<String>,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub verification_method: String,
    pub success: bool,
}

/// Recovery action
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryAction {
    pub id: String,
    pub action: String,
    pub description: String,
    pub systems_restored: Vec<String>,
    pub implemented_by: String,
    pub implemented_at: i64,
    pub validation_tests: Vec<String>,
    pub success: bool,
}

/// Lesson learned
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonLearned {
    pub id: String,
    pub category: String,
    pub description: String,
    pub root_cause: String,
    pub recommendations: Vec<String>,
    pub action_items: Vec<ActionItem>,
    pub priority: u8,
}

/// Action item from lessons learned
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionItem {
    pub id: String,
    pub description: String,
    pub assigned_to: String,
    pub due_date: i64,
    pub status: String,
    pub priority: u8,
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

/// Response playbook
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponsePlaybook {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: IncidentCategory,
    pub severity_threshold: IncidentSeverity,
    pub steps: Vec<PlaybookStep>,
    pub estimated_duration: u32,
    pub required_roles: Vec<ResponderRole>,
    pub prerequisites: Vec<String>,
    pub success_criteria: Vec<String>,
    pub created_by: String,
    pub created_at: i64,
    pub version: String,
    pub active: bool,
}

/// Playbook step
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookStep {
    pub id: String,
    pub step_number: u32,
    pub title: String,
    pub description: String,
    pub instructions: String,
    pub estimated_duration: u32,
    pub required_role: ResponderRole,
    pub dependencies: Vec<String>,
    pub automation_script: Option<String>,
    pub verification_criteria: Vec<String>,
    pub status: PlaybookStatus,
}

/// Playbook execution
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookExecution {
    pub id: String,
    pub incident_id: String,
    pub playbook_id: String,
    pub started_by: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub status: PlaybookStatus,
    pub step_executions: Vec<StepExecution>,
    pub notes: String,
}

/// Step execution record
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecution {
    pub step_id: String,
    pub executed_by: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub status: PlaybookStatus,
    pub notes: String,
    pub output: HashMap<String, String>,
}

/// Forensic investigation
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicInvestigation {
    pub id: String,
    pub incident_id: String,
    pub investigator: String,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub scope: String,
    pub methodology: String,
    pub tools_used: Vec<String>,
    pub evidence_collected: Vec<String>,
    pub findings: Vec<ForensicFinding>,
    pub timeline_reconstruction: Vec<TimelineEvent>,
    pub attribution: Option<Attribution>,
    pub report_path: Option<String>,
}

/// Forensic finding
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForensicFinding {
    pub id: String,
    pub category: String,
    pub description: String,
    pub confidence: f32,
    pub evidence_references: Vec<String>,
    pub impact: String,
    pub recommendations: Vec<String>,
}

/// Attribution analysis
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attribution {
    pub threat_actor: Option<String>,
    pub campaign: Option<String>,
    pub techniques: Vec<String>,
    pub tools: Vec<String>,
    pub infrastructure: Vec<String>,
    pub confidence: f32,
    pub evidence: Vec<String>,
}

/// Incident metrics
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentMetrics {
    pub total_incidents: u32,
    pub open_incidents: u32,
    pub closed_incidents: u32,
    pub average_resolution_time: f64,
    pub incidents_by_severity: HashMap<String, u32>,
    pub incidents_by_category: HashMap<String, u32>,
    pub incidents_by_status: HashMap<String, u32>,
    pub sla_compliance_rate: f32,
    pub cost_per_incident: f64,
    pub total_cost: f64,
    pub top_affected_systems: Vec<String>,
    pub response_team_utilization: HashMap<String, f32>,
}

/// Main incident response core
#[napi]
pub struct IncidentResponseCore {
    incidents: HashMap<String, Incident>,
    playbooks: HashMap<String, ResponsePlaybook>,
    executions: HashMap<String, PlaybookExecution>,
    investigations: HashMap<String, ForensicInvestigation>,
    responders: HashMap<String, Responder>,
}

#[napi]
impl IncidentResponseCore {
    /// Create a new incident response core
    #[napi(constructor)]
    pub fn new() -> Self {
        let mut core = Self {
            incidents: HashMap::new(),
            playbooks: HashMap::new(),
            executions: HashMap::new(),
            investigations: HashMap::new(),
            responders: HashMap::new(),
        };
        
        core.load_sample_data();
        core
    }

    /// Create a new incident
    #[napi]
    pub fn create_incident(&mut self, mut incident: Incident) -> String {
        incident.id = Uuid::new_v4().to_string();
        incident.created_at = Utc::now().timestamp();
        incident.updated_at = Utc::now().timestamp();
        
        // Add initial timeline event
        let timeline_event = TimelineEvent {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now().timestamp(),
            event_type: "incident_created".to_string(),
            description: "Incident created".to_string(),
            actor: incident.reported_by.clone(),
            source: "system".to_string(),
            details: HashMap::new(),
            automated: true,
        };
        incident.timeline.push(timeline_event);
        
        let incident_id = incident.id.clone();
        self.incidents.insert(incident_id.clone(), incident);
        incident_id
    }

    /// Get incident by ID
    #[napi]
    pub fn get_incident(&self, id: String) -> Option<Incident> {
        self.incidents.get(&id).cloned()
    }

    /// Update incident
    #[napi]
    pub fn update_incident(&mut self, id: String, updates: HashMap<String, serde_json::Value>) -> bool {
        if let Some(incident) = self.incidents.get_mut(&id) {
            incident.updated_at = Utc::now().timestamp();
            
            // Add timeline event for update
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "incident_updated".to_string(),
                description: "Incident updated".to_string(),
                actor: "system".to_string(),
                source: "api".to_string(),
                details: updates.iter().map(|(k, v)| (k.clone(), v.to_string())).collect(),
                automated: true,
            };
            incident.timeline.push(timeline_event);
            
            true
        } else {
            false
        }
    }

    /// Assign incident to responder
    #[napi]
    pub fn assign_incident(&mut self, incident_id: String, responder_id: String) -> bool {
        if let Some(incident) = self.incidents.get_mut(&incident_id) {
            incident.assigned_to = responder_id.to_string();
            incident.status = IncidentStatus::Assigned;
            incident.updated_at = Utc::now().timestamp();
            
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "incident_assigned".to_string(),
                description: format!("Incident assigned to {}", responder_id),
                actor: "system".to_string(),
                source: "assignment".to_string(),
                details: HashMap::from([("assignee".to_string(), responder_id.to_string())]),
                automated: true,
            };
            incident.timeline.push(timeline_event);
            
            true
        } else {
            false
        }
    }

    /// Escalate incident
    #[napi]
    pub fn escalate_incident(&mut self, incident_id: String, new_severity: IncidentSeverity, reason: String) -> bool {
        if let Some(incident) = self.incidents.get_mut(&incident_id) {
            let old_severity = incident.severity.clone();
            incident.severity = new_severity;
            incident.updated_at = Utc::now().timestamp();
            
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "incident_escalated".to_string(),
                description: format!("Incident escalated from {:?} to {:?}: {}", old_severity, incident.severity, reason),
                actor: "system".to_string(),
                source: "escalation".to_string(),
                details: HashMap::from([
                    ("old_severity".to_string(), format!("{:?}", old_severity)),
                    ("new_severity".to_string(), format!("{:?}", incident.severity)),
                    ("reason".to_string(), reason.to_string()),
                ]),
                automated: false,
            };
            incident.timeline.push(timeline_event);
            
            true
        } else {
            false
        }
    }

    /// Add evidence to incident
    #[napi]
    pub fn add_evidence(&mut self, incident_id: String, mut evidence: Evidence) -> String {
        evidence.id = Uuid::new_v4().to_string();
        evidence.collected_at = Utc::now().timestamp();
        
        if let Some(incident) = self.incidents.get_mut(&incident_id) {
            let evidence_id = evidence.id.clone();
            incident.evidence.push(evidence);
            incident.updated_at = Utc::now().timestamp();
            
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "evidence_added".to_string(),
                description: format!("Evidence added: {}", evidence_id),
                actor: "forensics".to_string(),
                source: "evidence_collection".to_string(),
                details: HashMap::from([("evidence_id".to_string(), evidence_id.clone())]),
                automated: false,
            };
            incident.timeline.push(timeline_event);
            
            evidence_id
        } else {
            String::new()
        }
    }

    /// Execute playbook for incident
    #[napi]
    pub fn execute_playbook(&mut self, incident_id: String, playbook_id: String, executor: String) -> Option<String> {
        if let (Some(_incident), Some(playbook)) = (self.incidents.get(&incident_id), self.playbooks.get(&playbook_id)) {
            let execution_id = Uuid::new_v4().to_string();
            let execution = PlaybookExecution {
                id: execution_id.clone(),
                incident_id: incident_id.to_string(),
                playbook_id: playbook_id.to_string(),
                started_by: executor.to_string(),
                started_at: Utc::now().timestamp(),
                completed_at: None,
                status: PlaybookStatus::InProgress,
                step_executions: playbook.steps.iter().map(|step| StepExecution {
                    step_id: step.id.clone(),
                    executed_by: String::new(),
                    started_at: Utc::now().timestamp(),
                    completed_at: None,
                    status: PlaybookStatus::NotStarted,
                    notes: String::new(),
                    output: HashMap::new(),
                }).collect(),
                notes: String::new(),
            };
            
            self.executions.insert(execution_id.clone(), execution);
            
            // Add timeline event
            if let Some(incident) = self.incidents.get_mut(&incident_id) {
                let timeline_event = TimelineEvent {
                    id: Uuid::new_v4().to_string(),
                    timestamp: Utc::now().timestamp(),
                    event_type: "playbook_started".to_string(),
                    description: format!("Started playbook: {}", playbook.name),
                    actor: executor.to_string(),
                    source: "playbook_execution".to_string(),
                    details: HashMap::from([
                        ("playbook_id".to_string(), playbook_id.to_string()),
                        ("execution_id".to_string(), execution_id.clone()),
                    ]),
                    automated: false,
                };
                incident.timeline.push(timeline_event);
            }
            
            Some(execution_id)
        } else {
            None
        }
    }

    /// Start forensic investigation
    #[napi]
    pub fn start_investigation(&mut self, incident_id: String, investigator: String, scope: String) -> Option<String> {
        if self.incidents.contains_key(&incident_id) {
            let investigation_id = Uuid::new_v4().to_string();
            let investigation = ForensicInvestigation {
                id: investigation_id.clone(),
                incident_id: incident_id.to_string(),
                investigator: investigator.to_string(),
                started_at: Utc::now().timestamp(),
                completed_at: None,
                scope: scope.to_string(),
                methodology: "Standard forensic methodology".to_string(),
                tools_used: vec!["EnCase".to_string(), "Volatility".to_string(), "Wireshark".to_string()],
                evidence_collected: Vec::new(),
                findings: Vec::new(),
                timeline_reconstruction: Vec::new(),
                attribution: None,
                report_path: None,
            };
            
            self.investigations.insert(investigation_id.clone(), investigation);
            
            // Add timeline event
            if let Some(incident) = self.incidents.get_mut(&incident_id) {
                let timeline_event = TimelineEvent {
                    id: Uuid::new_v4().to_string(),
                    timestamp: Utc::now().timestamp(),
                    event_type: "investigation_started".to_string(),
                    description: "Forensic investigation started".to_string(),
                    actor: investigator.to_string(),
                    source: "forensics".to_string(),
                    details: HashMap::from([
                        ("investigation_id".to_string(), investigation_id.clone()),
                        ("scope".to_string(), scope.to_string()),
                    ]),
                    automated: false,
                };
                incident.timeline.push(timeline_event);
            }
            
            Some(investigation_id)
        } else {
            None
        }
    }

    /// Generate incident metrics
    #[napi]
    pub fn generate_metrics(&self) -> IncidentMetrics {
        let total_incidents = self.incidents.len() as u32;
        let open_incidents = self.incidents.values()
            .filter(|i| !matches!(i.status, IncidentStatus::Closed | IncidentStatus::Resolved))
            .count() as u32;
        let closed_incidents = total_incidents - open_incidents;
        
        let mut incidents_by_severity = HashMap::new();
        let mut incidents_by_category = HashMap::new();
        let mut incidents_by_status = HashMap::new();
        let mut total_cost = 0.0;
        let mut resolution_times = Vec::new();
        
        for incident in self.incidents.values() {
            // Count by severity
            let severity_key = format!("{:?}", incident.severity);
            *incidents_by_severity.entry(severity_key).or_insert(0) += 1;
            
            // Count by category
            let category_key = format!("{:?}", incident.category);
            *incidents_by_category.entry(category_key).or_insert(0) += 1;
            
            // Count by status
            let status_key = format!("{:?}", incident.status);
            *incidents_by_status.entry(status_key).or_insert(0) += 1;
            
            // Calculate costs and resolution times
            total_cost += incident.cost_estimate;
            
            if matches!(incident.status, IncidentStatus::Closed | IncidentStatus::Resolved) {
                let resolution_time = DateTime::from_timestamp(incident.updated_at, 0).unwrap().signed_duration_since(DateTime::from_timestamp(incident.created_at, 0).unwrap());
                resolution_times.push(resolution_time.num_hours() as f64);
            }
        }
        
        let average_resolution_time = if resolution_times.is_empty() {
            0.0
        } else {
            resolution_times.iter().sum::<f64>() / resolution_times.len() as f64
        };
        
        let cost_per_incident = if total_incidents > 0 {
            total_cost / total_incidents as f64
        } else {
            0.0
        };
        
        IncidentMetrics {
            total_incidents,
            open_incidents,
            closed_incidents,
            average_resolution_time,
            incidents_by_severity,
            incidents_by_category,
            incidents_by_status,
            sla_compliance_rate: 95.0, // Placeholder
            cost_per_incident,
            total_cost,
            top_affected_systems: vec!["web-server-01".to_string(), "database-01".to_string()],
            response_team_utilization: HashMap::from([
                ("security_analysts".to_string(), 85.0),
                ("forensics_team".to_string(), 70.0),
            ]),
        }
    }

    /// Search incidents
    #[napi]
    pub fn search_incidents(&self, query: String) -> Vec<Incident> {
        self.incidents.values()
            .filter(|incident| {
                incident.title.to_lowercase().contains(&query.to_lowercase()) ||
                incident.description.to_lowercase().contains(&query.to_lowercase()) ||
                incident.tags.iter().any(|tag| tag.to_lowercase().contains(&query.to_lowercase()))
            })
            .cloned()
            .collect()
    }

    /// Get incidents by status
    #[napi]
    pub fn get_incidents_by_status(&self, status: IncidentStatus) -> Vec<Incident> {
        self.incidents.values()
            .filter(|incident| incident.status == status)
            .cloned()
            .collect()
    }

    /// Get incidents by severity
    #[napi]
    pub fn get_incidents_by_severity(&self, severity: IncidentSeverity) -> Vec<Incident> {
        self.incidents.values()
            .filter(|incident| incident.severity == severity)
            .cloned()
            .collect()
    }

    /// Load sample data
    fn load_sample_data(&mut self) {
        // Sample responder
        let responder = Responder {
            id: "resp-001".to_string(),
            name: "John Smith".to_string(),
            email: "john.smith@company.com".to_string(),
            role: ResponderRole::IncidentCommander,
            phone: Some("+1-555-0123".to_string()),
            availability: "24/7".to_string(),
            skills: vec!["incident_management".to_string(), "forensics".to_string()],
            assigned_at: Utc::now().timestamp(),
            active: true,
        };
        self.responders.insert(responder.id.clone(), responder);

        // Sample incident
        let incident = Incident {
            id: "inc-001".to_string(),
            title: "Suspected Data Breach".to_string(),
            description: "Unusual network activity detected on database server".to_string(),
            category: IncidentCategory::DataBreach,
            severity: IncidentSeverity::High,
            status: IncidentStatus::InProgress,
            priority: 1,
            created_at: Utc::now().timestamp(),
            updated_at: Utc::now().timestamp(),
            detected_at: Utc::now().timestamp(),
            reported_by: "security_monitor".to_string(),
            assigned_to: "resp-001".to_string(),
            incident_commander: "resp-001".to_string(),
            affected_systems: vec!["db-server-01".to_string(), "web-app-01".to_string()],
            affected_users: vec!["user123".to_string(), "user456".to_string()],
            indicators: vec!["192.168.1.100".to_string(), "malicious.exe".to_string()],
            tags: vec!["data_breach".to_string(), "database".to_string(), "urgent".to_string()],
            timeline: Vec::new(),
            responders: Vec::new(),
            evidence: Vec::new(),
            tasks: Vec::new(),
            communications: Vec::new(),
            impact_assessment: ImpactAssessment {
                business_impact: "High - potential customer data exposure".to_string(),
                technical_impact: "Database server compromised".to_string(),
                financial_impact: 50000.0,
                reputation_impact: "Significant risk to company reputation".to_string(),
                compliance_impact: "GDPR and PCI DSS implications".to_string(),
                affected_customers: 1500,
                affected_systems_count: 2,
                data_compromised: true,
                service_disruption: false,
                estimated_downtime: 0,
            },
            containment_actions: Vec::new(),
            eradication_actions: Vec::new(),
            recovery_actions: Vec::new(),
            lessons_learned: Vec::new(),
            cost_estimate: 75000.0,
            sla_breach: false,
            external_notifications: Vec::new(),
            compliance_requirements: vec!["GDPR".to_string(), "PCI DSS".to_string()],
            metadata: HashMap::new(),
        };
        self.incidents.insert(incident.id.clone(), incident);

        // Sample playbook
        let playbook = ResponsePlaybook {
            id: "pb-001".to_string(),
            name: "Data Breach Response".to_string(),
            description: "Standard response playbook for data breach incidents".to_string(),
            category: IncidentCategory::DataBreach,
            severity_threshold: IncidentSeverity::Medium,
            steps: vec![
                PlaybookStep {
                    id: "step-001".to_string(),
                    step_number: 1,
                    title: "Initial Assessment".to_string(),
                    description: "Assess the scope and impact of the breach".to_string(),
                    instructions: "Review logs, identify affected systems, estimate data exposure".to_string(),
                    estimated_duration: 30,
                    required_role: ResponderRole::SecurityAnalyst,
                    dependencies: Vec::new(),
                    automation_script: None,
                    verification_criteria: vec!["Impact assessment completed".to_string()],
                    status: PlaybookStatus::NotStarted,
                },
                PlaybookStep {
                    id: "step-002".to_string(),
                    step_number: 2,
                    title: "Containment".to_string(),
                    description: "Contain the breach to prevent further damage".to_string(),
                    instructions: "Isolate affected systems, revoke compromised credentials".to_string(),
                    estimated_duration: 60,
                    required_role: ResponderRole::SystemAdministrator,
                    dependencies: vec!["step-001".to_string()],
                    automation_script: Some("containment_script.sh".to_string()),
                    verification_criteria: vec!["Systems isolated".to_string(), "Credentials revoked".to_string()],
                    status: PlaybookStatus::NotStarted,
                },
            ],
            estimated_duration: 240,
            required_roles: vec![ResponderRole::IncidentCommander, ResponderRole::SecurityAnalyst],
            prerequisites: vec!["Access to security tools".to_string()],
            success_criteria: vec!["Breach contained".to_string(), "Evidence preserved".to_string()],
            created_by: "security_team".to_string(),
            created_at: Utc::now().timestamp(),
            version: "1.0".to_string(),
            active: true,
        };
        self.playbooks.insert(playbook.id.clone(), playbook);
    }

    /// Get all incidents
    #[napi]
    pub fn get_all_incidents(&self) -> Vec<Incident> {
        self.incidents.values().cloned().collect()
    }

    /// Get all playbooks
    #[napi]
    pub fn get_all_playbooks(&self) -> Vec<ResponsePlaybook> {
        self.playbooks.values().cloned().collect()
    }

    /// Get all investigations
    #[napi]
    pub fn get_all_investigations(&self) -> Vec<ForensicInvestigation> {
        self.investigations.values().cloned().collect()
    }

    /// Get all responders
    #[napi]
    pub fn get_all_responders(&self) -> Vec<Responder> {
        self.responders.values().cloned().collect()
    }

    /// Add responder
    #[napi]
    pub fn add_responder(&mut self, mut responder: Responder) -> String {
        responder.id = Uuid::new_v4().to_string();
        responder.assigned_at = Utc::now().timestamp();
        let responder_id = responder.id.clone();
        self.responders.insert(responder_id.clone(), responder);
        responder_id
    }

    /// Create playbook
    #[napi]
    pub fn create_playbook(&mut self, mut playbook: ResponsePlaybook) -> String {
        playbook.id = Uuid::new_v4().to_string();
        playbook.created_at = Utc::now().timestamp();
        let playbook_id = playbook.id.clone();
        self.playbooks.insert(playbook_id.clone(), playbook);
        playbook_id
    }

    /// Close incident
    #[napi]
    pub fn close_incident(&mut self, incident_id: String, resolution_notes: String) -> bool {
        if let Some(incident) = self.incidents.get_mut(&incident_id) {
            incident.status = IncidentStatus::Closed;
            incident.updated_at = Utc::now().timestamp();
            
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "incident_closed".to_string(),
                description: format!("Incident closed: {}", resolution_notes),
                actor: "system".to_string(),
                source: "closure".to_string(),
                details: HashMap::from([("resolution_notes".to_string(), resolution_notes.to_string())]),
                automated: false,
            };
            incident.timeline.push(timeline_event);
            
            true
        } else {
            false
        }
    }

    /// Add task to incident
    #[napi]
    pub fn add_task(&mut self, incident_id: String, mut task: Task) -> String {
        task.id = Uuid::new_v4().to_string();
        task.created_at = Utc::now().timestamp();
        
        if let Some(incident) = self.incidents.get_mut(&incident_id) {
            let task_id = task.id.clone();
            incident.tasks.push(task);
            incident.updated_at = Utc::now().timestamp();
            
            let timeline_event = TimelineEvent {
                id: Uuid::new_v4().to_string(),
                timestamp: Utc::now().timestamp(),
                event_type: "task_added".to_string(),
                description: format!("Task added: {}", task_id),
                actor: "system".to_string(),
                source: "task_management".to_string(),
                details: HashMap::from([("task_id".to_string(), task_id.clone())]),
                automated: false,
            };
            incident.timeline.push(timeline_event);
            
            task_id
        } else {
            String::new()
        }
    }

    /// Generate incident report
    #[napi]
    pub fn generate_incident_report(&self, incident_id: String) -> Option<String> {
        if let Some(incident) = self.incidents.get(&incident_id) {
            let mut report = format!("INCIDENT RESPONSE REPORT\n");
            report.push_str(&format!("========================\n\n"));
            report.push_str(&format!("Incident ID: {}
", incident.id));
            report.push_str(&format!("Title: {}
", incident.title));
            report.push_str(&format!("Category: {:?}\n", incident.category));
            report.push_str(&format!("Severity: {:?}\n", incident.severity));
            report.push_str(&format!("Status: {:?}\n", incident.status));
            report.push_str(&format!("Created: {}
", DateTime::from_timestamp(incident.created_at, 0).unwrap()));
            report.push_str(&format!("Updated: {}
", DateTime::from_timestamp(incident.updated_at, 0).unwrap()));
            report.push_str(&format!("\nDescription:\n{}
", incident.description));
            
            report.push_str(&format!("\nAffected Systems:\n"));
            for system in &incident.affected_systems {
                report.push_str(&format!(
