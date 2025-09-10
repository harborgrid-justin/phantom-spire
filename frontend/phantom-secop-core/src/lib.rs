//! Phantom SecOp Core - Advanced Security Operations System
//! 
//! This library provides comprehensive security operations capabilities including
//! incident response, security orchestration, automation, and operational intelligence.
//! 
//! Enhanced with multi-data store support for business SaaS readiness:
//! - Redis: High-performance caching and real-time data
//! - PostgreSQL: Structured data with ACID properties
//! - MongoDB: Flexible document storage and horizontal scaling
//! - Elasticsearch: Advanced search and analytics

use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use indexmap::IndexMap;

// Data store modules
pub mod datastore;
pub mod stores;

// Test module
#[cfg(test)]
mod tests;

/// Incident severity levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum IncidentSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Incident status types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum IncidentCategory {
    Malware,
    Phishing,
    DataBreach,
    UnauthorizedAccess,
    DenialOfService,
    InsiderThreat,
    PhysicalSecurity,
    ComplianceViolation,
    SystemCompromise,
    NetworkIntrusion,
    Other,
}

/// Alert priority levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum AlertPriority {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

/// Alert status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AlertStatus {
    Open,
    Acknowledged,
    InProgress,
    Resolved,
    Closed,
    FalsePositive,
}

/// Playbook execution status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PlaybookStatus {
    Pending,
    Running,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

/// Action types for automation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ActionType {
    Investigation,
    Containment,
    Eradication,
    Recovery,
    Communication,
    Documentation,
    Escalation,
    Custom,
}

/// Task status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Skipped,
    Cancelled,
}

/// Security incident representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityIncident {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: IncidentCategory,
    pub severity: IncidentSeverity,
    pub status: IncidentStatus,
    pub priority_score: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub detected_at: DateTime<Utc>,
    pub assigned_to: Option<String>,
    pub assigned_team: Option<String>,
    pub source_system: String,
    pub affected_assets: Vec<String>,
    pub indicators: Vec<String>,
    pub tags: Vec<String>,
    pub timeline: Vec<IncidentTimelineEntry>,
    pub evidence: Vec<Evidence>,
    pub related_alerts: Vec<String>,
    pub related_incidents: Vec<String>,
    pub containment_actions: Vec<String>,
    pub eradication_actions: Vec<String>,
    pub recovery_actions: Vec<String>,
    pub lessons_learned: Vec<String>,
    pub cost_impact: Option<f64>,
    pub business_impact: BusinessImpact,
    pub compliance_impact: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Timeline entry for incidents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentTimelineEntry {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub actor: String,
    pub details: HashMap<String, String>,
}

/// Evidence collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub id: String,
    pub evidence_type: EvidenceType,
    pub name: String,
    pub description: String,
    pub source: String,
    pub collected_at: DateTime<Utc>,
    pub collected_by: String,
    pub file_path: Option<String>,
    pub file_hash: Option<String>,
    pub file_size: Option<u64>,
    pub chain_of_custody: Vec<CustodyEntry>,
    pub analysis_results: Vec<AnalysisResult>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Evidence types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum EvidenceType {
    NetworkCapture,
    SystemLogs,
    MemoryDump,
    DiskImage,
    FileSystem,
    Registry,
    Email,
    Document,
    Screenshot,
    Other,
}

/// Chain of custody entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustodyEntry {
    pub timestamp: DateTime<Utc>,
    pub action: String,
    pub actor: String,
    pub location: String,
    pub notes: String,
}

/// Analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub id: String,
    pub analysis_type: String,
    pub tool_used: String,
    pub analyst: String,
    pub timestamp: DateTime<Utc>,
    pub findings: Vec<String>,
    pub confidence: f64,
    pub details: HashMap<String, String>,
}

/// Business impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpact {
    pub financial_impact: f64,
    pub operational_impact: OperationalImpact,
    pub reputation_impact: ReputationImpact,
    pub regulatory_impact: Vec<String>,
    pub customer_impact: CustomerImpact,
    pub service_disruption: Vec<String>,
    pub data_impact: DataImpact,
}

/// Operational impact levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum OperationalImpact {
    None,
    Minimal,
    Moderate,
    Significant,
    Severe,
}

/// Reputation impact levels
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ReputationImpact {
    None,
    Minor,
    Moderate,
    Major,
    Severe,
}

/// Customer impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerImpact {
    pub customers_affected: u32,
    pub service_degradation: bool,
    pub data_exposure: bool,
    pub communication_required: bool,
    pub compensation_required: bool,
}

/// Data impact assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataImpact {
    pub data_types_affected: Vec<String>,
    pub records_affected: u32,
    pub confidentiality_breach: bool,
    pub integrity_compromise: bool,
    pub availability_impact: bool,
    pub regulatory_notification_required: bool,
}

/// Security alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAlert {
    pub id: String,
    pub title: String,
    pub description: String,
    pub priority: AlertPriority,
    pub status: AlertStatus,
    pub source: String,
    pub rule_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub first_seen: DateTime<Utc>,
    pub last_seen: DateTime<Utc>,
    pub count: u32,
    pub assigned_to: Option<String>,
    pub indicators: Vec<String>,
    pub affected_assets: Vec<String>,
    pub tags: Vec<String>,
    pub raw_data: HashMap<String, String>,
    pub enrichment_data: HashMap<String, String>,
    pub related_alerts: Vec<String>,
    pub incident_id: Option<String>,
    pub false_positive_likelihood: f64,
    pub confidence_score: f64,
    pub metadata: HashMap<String, String>,
}

/// Security playbook
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPlaybook {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub category: String,
    pub trigger_conditions: Vec<TriggerCondition>,
    pub actions: Vec<PlaybookAction>,
    pub approval_required: bool,
    pub timeout_minutes: u32,
    pub created_by: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
    pub execution_count: u32,
    pub success_rate: f64,
    pub average_execution_time: f64,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Trigger condition for playbooks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerCondition {
    pub condition_type: String,
    pub field: String,
    pub operator: String,
    pub value: String,
    pub case_sensitive: bool,
}

/// Playbook action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookAction {
    pub id: String,
    pub name: String,
    pub action_type: ActionType,
    pub description: String,
    pub order: u32,
    pub required: bool,
    pub timeout_seconds: u32,
    pub retry_count: u32,
    pub parameters: HashMap<String, String>,
    pub conditions: Vec<String>,
    pub on_success: Vec<String>,
    pub on_failure: Vec<String>,
}

/// Playbook execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookExecution {
    pub id: String,
    pub playbook_id: String,
    pub playbook_name: String,
    pub status: PlaybookStatus,
    pub triggered_by: String,
    pub trigger_event: String,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_seconds: Option<f64>,
    pub actions_executed: Vec<ActionExecution>,
    pub success_count: u32,
    pub failure_count: u32,
    pub error_messages: Vec<String>,
    pub output_data: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
}

/// Action execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionExecution {
    pub action_id: String,
    pub action_name: String,
    pub status: TaskStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub duration_seconds: Option<f64>,
    pub retry_count: u32,
    pub output: HashMap<String, String>,
    pub error_message: Option<String>,
}

/// Security task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityTask {
    pub id: String,
    pub title: String,
    pub description: String,
    pub task_type: String,
    pub priority: AlertPriority,
    pub status: TaskStatus,
    pub assigned_to: Option<String>,
    pub assigned_team: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub due_date: Option<DateTime<Utc>>,
    pub estimated_hours: Option<f64>,
    pub actual_hours: Option<f64>,
    pub incident_id: Option<String>,
    pub alert_ids: Vec<String>,
    pub dependencies: Vec<String>,
    pub checklist: Vec<TaskChecklistItem>,
    pub attachments: Vec<String>,
    pub comments: Vec<TaskComment>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Task checklist item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskChecklistItem {
    pub id: String,
    pub description: String,
    pub completed: bool,
    pub completed_by: Option<String>,
    pub completed_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
}

/// Task comment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskComment {
    pub id: String,
    pub author: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub attachments: Vec<String>,
}

/// Security metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityMetrics {
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub incident_metrics: IncidentMetrics,
    pub alert_metrics: AlertMetrics,
    pub response_metrics: ResponseMetrics,
    pub team_metrics: TeamMetrics,
    pub automation_metrics: AutomationMetrics,
    pub compliance_metrics: ComplianceMetrics,
}

/// Incident-related metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentMetrics {
    pub total_incidents: u32,
    pub incidents_by_severity: HashMap<IncidentSeverity, u32>,
    pub incidents_by_category: HashMap<IncidentCategory, u32>,
    pub incidents_by_status: HashMap<IncidentStatus, u32>,
    pub mean_time_to_detection: f64,
    pub mean_time_to_response: f64,
    pub mean_time_to_containment: f64,
    pub mean_time_to_resolution: f64,
    pub escalation_rate: f64,
    pub reopened_incidents: u32,
    pub cost_per_incident: f64,
    pub total_cost_impact: f64,
}

/// Alert-related metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertMetrics {
    pub total_alerts: u32,
    pub alerts_by_priority: HashMap<AlertPriority, u32>,
    pub alerts_by_source: HashMap<String, u32>,
    pub false_positive_rate: f64,
    pub alert_to_incident_ratio: f64,
    pub mean_time_to_triage: f64,
    pub auto_resolved_alerts: u32,
    pub escalated_alerts: u32,
}

/// Response-related metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMetrics {
    pub playbooks_executed: u32,
    pub automation_success_rate: f64,
    pub manual_interventions: u32,
    pub sla_compliance_rate: f64,
    pub escalations: u32,
    pub after_hours_responses: u32,
}

/// Team performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMetrics {
    pub analysts_active: u32,
    pub workload_distribution: HashMap<String, u32>,
    pub response_times_by_analyst: HashMap<String, f64>,
    pub resolution_rates: HashMap<String, f64>,
    pub training_hours: f64,
    pub certification_status: HashMap<String, String>,
}

/// Automation metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationMetrics {
    pub automated_actions: u32,
    pub automation_success_rate: f64,
    pub time_saved_hours: f64,
    pub cost_savings: f64,
    pub failed_automations: u32,
    pub manual_overrides: u32,
}

/// Compliance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceMetrics {
    pub frameworks_monitored: Vec<String>,
    pub compliance_score: f64,
    pub violations_detected: u32,
    pub remediation_time: f64,
    pub audit_findings: u32,
    pub policy_exceptions: u32,
}

/// Threat intelligence feed
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatIntelFeed {
    pub id: String,
    pub name: String,
    pub source: String,
    pub feed_type: String,
    pub last_updated: DateTime<Utc>,
    pub indicators_count: u32,
    pub confidence_level: f64,
    pub active: bool,
    pub update_frequency: String,
    pub cost: Option<f64>,
    pub tags: Vec<String>,
}

/// Security orchestration workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestrationWorkflow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub trigger_type: String,
    pub steps: Vec<WorkflowStep>,
    pub enabled: bool,
    pub created_at: DateTime<Utc>,
    pub last_executed: Option<DateTime<Utc>>,
    pub execution_count: u32,
    pub success_rate: f64,
}

/// Workflow step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub step_type: String,
    pub order: u32,
    pub configuration: HashMap<String, String>,
    pub timeout_seconds: u32,
    pub retry_policy: RetryPolicy,
    pub conditions: Vec<String>,
}

/// Retry policy for workflow steps
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub delay_seconds: u32,
    pub backoff_multiplier: f64,
    pub max_delay_seconds: u32,
}

/// Main SecOp Core implementation with configurable data stores
pub struct SecOpCore {
    // Legacy in-memory storage for backward compatibility
    incidents: IndexMap<String, SecurityIncident>,
    alerts: IndexMap<String, SecurityAlert>,
    playbooks: IndexMap<String, SecurityPlaybook>,
    executions: IndexMap<String, PlaybookExecution>,
    tasks: IndexMap<String, SecurityTask>,
    evidence: IndexMap<String, Evidence>,
    workflows: IndexMap<String, OrchestrationWorkflow>,
    threat_feeds: IndexMap<String, ThreatIntelFeed>,
    
    // New data store manager
    data_store: Option<Box<dyn datastore::DataStoreManager>>,
    config: Option<datastore::DataStoreConfig>,
}

impl SecOpCore {
    /// Create a new SecOp Core instance with in-memory storage
    pub fn new() -> Self {
        Self {
            incidents: IndexMap::new(),
            alerts: IndexMap::new(),
            playbooks: IndexMap::new(),
            executions: IndexMap::new(),
            tasks: IndexMap::new(),
            evidence: IndexMap::new(),
            workflows: IndexMap::new(),
            threat_feeds: IndexMap::new(),
            data_store: None,
            config: None,
        }
    }
    
    /// Create a new SecOp Core instance with configurable data store
    pub async fn new_with_config(config: datastore::DataStoreConfig) -> Result<Self, String> {
        let data_store = match datastore::DataStoreFactory::create_hybrid_manager(config.clone()).await {
            Ok(store) => store,
            Err(e) => return Err(format!("Failed to create data store: {}", e)),
        };
        
        Ok(Self {
            incidents: IndexMap::new(),
            alerts: IndexMap::new(),
            playbooks: IndexMap::new(),
            executions: IndexMap::new(),
            tasks: IndexMap::new(),
            evidence: IndexMap::new(),
            workflows: IndexMap::new(),
            threat_feeds: IndexMap::new(),
            data_store: Some(data_store),
            config: Some(config),
        })
    }
    
    /// Initialize the data store
    pub async fn initialize_data_store(&mut self) -> Result<(), String> {
        if let Some(data_store) = &mut self.data_store {
            data_store.initialize().await.map_err(|e| format!("Data store initialization failed: {}", e))?;
            log::info!("Data store initialized successfully");
        }
        Ok(())
    }
    
    /// Check if using external data stores
    pub fn has_external_data_store(&self) -> bool {
        self.data_store.is_some()
    }
    
    /// Get data store health status
    pub async fn data_store_health(&self) -> bool {
        if let Some(data_store) = &self.data_store {
            data_store.health_check().await.unwrap_or(false)
        } else {
            true // In-memory is always healthy
        }
    }

    /// Initialize with sample data
    pub fn initialize_with_sample_data(&mut self) {
        self.load_sample_incidents();
        self.load_sample_alerts();
        self.load_sample_playbooks();
        self.load_sample_tasks();
        self.load_sample_workflows();
    }

    /// Create a new security incident
    pub async fn create_incident(&mut self, title: String, description: String, category: IncidentCategory, severity: IncidentSeverity) -> Result<String, String> {
        let incident_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let incident = SecurityIncident {
            id: incident_id.clone(),
            title,
            description,
            category,
            severity: severity.clone(),
            status: IncidentStatus::New,
            priority_score: self.calculate_priority_score(&severity),
            created_at: now,
            updated_at: now,
            detected_at: now,
            assigned_to: None,
            assigned_team: None,
            source_system: "Phantom SecOp Core".to_string(),
            affected_assets: Vec::new(),
            indicators: Vec::new(),
            tags: Vec::new(),
            timeline: vec![IncidentTimelineEntry {
                timestamp: now,
                event_type: "Created".to_string(),
                description: "Incident created".to_string(),
                actor: "System".to_string(),
                details: HashMap::new(),
            }],
            evidence: Vec::new(),
            related_alerts: Vec::new(),
            related_incidents: Vec::new(),
            containment_actions: Vec::new(),
            eradication_actions: Vec::new(),
            recovery_actions: Vec::new(),
            lessons_learned: Vec::new(),
            cost_impact: None,
            business_impact: BusinessImpact {
                financial_impact: 0.0,
                operational_impact: OperationalImpact::None,
                reputation_impact: ReputationImpact::None,
                regulatory_impact: Vec::new(),
                customer_impact: CustomerImpact {
                    customers_affected: 0,
                    service_degradation: false,
                    data_exposure: false,
                    communication_required: false,
                    compensation_required: false,
                },
                service_disruption: Vec::new(),
                data_impact: DataImpact {
                    data_types_affected: Vec::new(),
                    records_affected: 0,
                    confidentiality_breach: false,
                    integrity_compromise: false,
                    availability_impact: false,
                    regulatory_notification_required: false,
                },
            },
            compliance_impact: Vec::new(),
            metadata: HashMap::new(),
        };

        // Try to store in external data store first
        if let Some(data_store) = &self.data_store {
            match data_store.create_incident(&incident).await {
                Ok(id) => return Ok(id),
                Err(e) => {
                    log::warn!("Failed to store incident in external data store: {}", e);
                    // Fall back to in-memory storage
                }
            }
        }

        // Fallback to in-memory storage
        self.incidents.insert(incident_id.clone(), incident);
        Ok(incident_id)
    }

    /// Update incident status
    pub fn update_incident_status(&mut self, incident_id: &str, status: IncidentStatus, actor: &str) -> std::result::Result<(), String> {
        if let Some(incident) = self.incidents.get_mut(incident_id) {
            let now = Utc::now();
            incident.status = status.clone();
            incident.updated_at = now;
            
            incident.timeline.push(IncidentTimelineEntry {
                timestamp: now,
                event_type: "Status Update".to_string(),
                description: format!("Status changed to {:?}", status),
                actor: actor.to_string(),
                details: HashMap::new(),
            });
            
            std::result::Result::Ok(())
        } else {
            std::result::Result::Err("Incident not found".to_string())
        }
    }

    /// Create a security alert
    pub fn create_alert(&mut self, title: String, description: String, priority: AlertPriority, source: String) -> String {
        let alert_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let alert = SecurityAlert {
            id: alert_id.clone(),
            title,
            description,
            priority,
            status: AlertStatus::Open,
            source,
            rule_id: None,
            created_at: now,
            updated_at: now,
            first_seen: now,
            last_seen: now,
            count: 1,
            assigned_to: None,
            indicators: Vec::new(),
            affected_assets: Vec::new(),
            tags: Vec::new(),
            raw_data: HashMap::new(),
            enrichment_data: HashMap::new(),
            related_alerts: Vec::new(),
            incident_id: None,
            false_positive_likelihood: 0.1,
            confidence_score: 0.8,
            metadata: HashMap::new(),
        };

        self.alerts.insert(alert_id.clone(), alert);
        alert_id
    }

    /// Execute a security playbook
    pub fn execute_playbook(&mut self, playbook_id: &str, triggered_by: &str, trigger_event: &str) -> std::result::Result<String, String> {
        if let Some(playbook) = self.playbooks.get(playbook_id) {
            let execution_id = Uuid::new_v4().to_string();
            let now = Utc::now();

            let execution = PlaybookExecution {
                id: execution_id.clone(),
                playbook_id: playbook_id.to_string(),
                playbook_name: playbook.name.clone(),
                status: PlaybookStatus::Running,
                triggered_by: triggered_by.to_string(),
                trigger_event: trigger_event.to_string(),
                started_at: now,
                completed_at: None,
                duration_seconds: None,
                actions_executed: Vec::new(),
                success_count: 0,
                failure_count: 0,
                error_messages: Vec::new(),
                output_data: HashMap::new(),
                metadata: HashMap::new(),
            };

            self.executions.insert(execution_id.clone(), execution);
            std::result::Result::Ok(execution_id)
        } else {
            std::result::Result::Err("Playbook not found".to_string())
        }
    }

    /// Generate security metrics
    pub fn generate_metrics(&self, start_date: DateTime<Utc>, end_date: DateTime<Utc>) -> SecurityMetrics {
        let incidents_in_period: Vec<&SecurityIncident> = self.incidents
            .values()
            .filter(|i| i.created_at >= start_date && i.created_at <= end_date)
            .collect();

        let alerts_in_period: Vec<&SecurityAlert> = self.alerts
            .values()
            .filter(|a| a.created_at >= start_date && a.created_at <= end_date)
            .collect();

        SecurityMetrics {
            period_start: start_date,
            period_end: end_date,
            incident_metrics: self.calculate_incident_metrics(&incidents_in_period),
            alert_metrics: self.calculate_alert_metrics(&alerts_in_period),
            response_metrics: self.calculate_response_metrics(),
            team_metrics: self.calculate_team_metrics(),
            automation_metrics: self.calculate_automation_metrics(),
            compliance_metrics: self.calculate_compliance_metrics(),
        }
    }

    /// Search incidents by criteria
    pub fn search_incidents(&self, query: &str, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Vec<&SecurityIncident> {
        self.incidents
            .values()
            .filter(|incident| {
                let matches_query = query.is_empty() || 
                    incident.title.to_lowercase().contains(&query.to_lowercase()) ||
                    incident.description.to_lowercase().contains(&query.to_lowercase());
                
                let matches_status = status.is_none() || incident.status == *status.as_ref().unwrap();
                let matches_severity = severity.is_none() || incident.severity == *severity.as_ref().unwrap();
                
                matches_query && matches_status && matches_severity
            })
            .collect()
    }

    /// Get incident by ID
    pub fn get_incident(&self, incident_id: &str) -> Option<&SecurityIncident> {
        self.incidents.get(incident_id)
    }

    /// Get alert by ID
    pub fn get_alert(&self, alert_id: &str) -> Option<&SecurityAlert> {
        self.alerts.get(alert_id)
    }

    /// Get playbook by ID
    pub fn get_playbook(&self, playbook_id: &str) -> Option<&SecurityPlaybook> {
        self.playbooks.get(playbook_id)
    }

    /// Get all active alerts
    pub fn get_active_alerts(&self) -> Vec<&SecurityAlert> {
        self.alerts
            .values()
            .filter(|alert| matches!(alert.status, AlertStatus::Open | AlertStatus::Acknowledged | AlertStatus::InProgress))
            .collect()
    }

    /// Get incidents by severity
    pub fn get_incidents_by_severity(&self, severity: IncidentSeverity) -> Vec<&SecurityIncident> {
        self.incidents
            .values()
            .filter(|incident| incident.severity == severity)
            .collect()
    }

    /// Update alert status
    pub fn update_alert_status(&mut self, alert_id: &str, status: AlertStatus, assigned_to: Option<&str>) -> std::result::Result<(), String> {
        if let Some(alert) = self.alerts.get_mut(alert_id) {
            let now = Utc::now();
            alert.status = status;
            alert.updated_at = now;
            alert.last_seen = now;
            
            if let Some(assignee) = assigned_to {
                alert.assigned_to = Some(assignee.to_string());
            }
            
            std::result::Result::Ok(())
        } else {
            std::result::Result::Err("Alert not found".to_string())
        }
    }

    /// Create a security playbook
    pub fn create_playbook(&mut self, name: String, description: String, category: String) -> String {
        let playbook_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let playbook = SecurityPlaybook {
            id: playbook_id.clone(),
            name,
            description,
            version: "1.0".to_string(),
            category,
            trigger_conditions: Vec::new(),
            actions: Vec::new(),
            approval_required: false,
            timeout_minutes: 60,
            created_by: "System".to_string(),
            created_at: now,
            updated_at: now,
            enabled: true,
            execution_count: 0,
            success_rate: 0.0,
            average_execution_time: 0.0,
            tags: Vec::new(),
            metadata: HashMap::new(),
        };

        self.playbooks.insert(playbook_id.clone(), playbook);
        playbook_id
    }

    /// Get playbook execution status
    pub fn get_playbook_execution_status(&self, execution_id: &str) -> Option<&PlaybookExecution> {
        self.executions.get(execution_id)
    }

    /// Create a security task
    pub fn create_task(&mut self, title: String, description: String, task_type: String, priority: AlertPriority) -> String {
        let task_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let task = SecurityTask {
            id: task_id.clone(),
            title,
            description,
            task_type,
            priority,
            status: TaskStatus::Pending,
            assigned_to: None,
            assigned_team: None,
            created_at: now,
            updated_at: now,
            due_date: None,
            estimated_hours: None,
            actual_hours: None,
            incident_id: None,
            alert_ids: Vec::new(),
            dependencies: Vec::new(),
            checklist: Vec::new(),
            attachments: Vec::new(),
            comments: Vec::new(),
            tags: Vec::new(),
            metadata: HashMap::new(),
        };

        self.tasks.insert(task_id.clone(), task);
        task_id
    }

    /// Get task by ID
    pub fn get_task(&self, task_id: &str) -> Option<&SecurityTask> {
        self.tasks.get(task_id)
    }

    /// Update task status
    pub fn update_task_status(&mut self, task_id: &str, status: TaskStatus, _actor: &str) -> std::result::Result<(), String> {
        if let Some(task) = self.tasks.get_mut(task_id) {
            let now = Utc::now();
            task.status = status;
            task.updated_at = now;
            
            std::result::Result::Ok(())
        } else {
            std::result::Result::Err("Task not found".to_string())
        }
    }

    /// Add evidence to the system
    pub fn add_evidence(&mut self, name: String, description: String, evidence_type: EvidenceType, source: String, collected_by: String) -> String {
        let evidence_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let evidence = Evidence {
            id: evidence_id.clone(),
            evidence_type,
            name,
            description,
            source,
            collected_at: now,
            collected_by,
            file_path: None,
            file_hash: None,
            file_size: None,
            chain_of_custody: vec![CustodyEntry {
                timestamp: now,
                action: "Evidence Collected".to_string(),
                actor: "System".to_string(),
                location: "Digital Collection".to_string(),
                notes: "Initial evidence collection".to_string(),
            }],
            analysis_results: Vec::new(),
            tags: Vec::new(),
            metadata: HashMap::new(),
        };

        self.evidence.insert(evidence_id.clone(), evidence);
        evidence_id
    }

    /// Get evidence by ID
    pub fn get_evidence(&self, evidence_id: &str) -> Option<&Evidence> {
        self.evidence.get(evidence_id)
    }

    /// Get evidence chain of custody
    pub fn get_evidence_chain_of_custody(&self, evidence_id: &str) -> std::result::Result<Vec<&CustodyEntry>, String> {
        if let Some(evidence) = self.evidence.get(evidence_id) {
            std::result::Result::Ok(evidence.chain_of_custody.iter().collect())
        } else {
            std::result::Result::Err("Evidence not found".to_string())
        }
    }

    /// Search alerts by criteria
    pub fn search_alerts(&self, query: &str, priority: Option<AlertPriority>, status: Option<AlertStatus>) -> Vec<&SecurityAlert> {
        self.alerts
            .values()
            .filter(|alert| {
                let matches_query = query.is_empty() || 
                    alert.title.to_lowercase().contains(&query.to_lowercase()) ||
                    alert.description.to_lowercase().contains(&query.to_lowercase());
                
                let matches_priority = priority.is_none() || alert.priority == *priority.as_ref().unwrap();
                let matches_status = status.is_none() || alert.status == *status.as_ref().unwrap();
                
                matches_query && matches_priority && matches_status
            })
            .collect()
    }

    /// Create an orchestration workflow
    pub fn create_workflow(&mut self, name: String, description: String, trigger_type: String) -> String {
        let workflow_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let workflow = OrchestrationWorkflow {
            id: workflow_id.clone(),
            name,
            description,
            trigger_type,
            steps: Vec::new(),
            enabled: true,
            created_at: now,
            last_executed: None,
            execution_count: 0,
            success_rate: 0.0,
        };

        self.workflows.insert(workflow_id.clone(), workflow);
        workflow_id
    }

    /// Execute a workflow
    pub fn execute_workflow(&mut self, workflow_id: &str, _context: HashMap<String, String>) -> std::result::Result<String, String> {
        if let Some(workflow) = self.workflows.get_mut(workflow_id) {
            let execution_id = Uuid::new_v4().to_string();
            let now = Utc::now();
            
            workflow.last_executed = Some(now);
            workflow.execution_count += 1;
            
            // In a real implementation, this would execute the workflow steps
            // For now, we'll just return the execution ID
            std::result::Result::Ok(execution_id)
        } else {
            std::result::Result::Err("Workflow not found".to_string())
        }
    }

    // Private helper methods

    fn load_sample_incidents(&mut self) {
        let sample_incidents = vec![
            ("Malware Detection", "Suspicious executable detected on workstation", IncidentCategory::Malware, IncidentSeverity::High),
            ("Phishing Campaign", "Multiple users received suspicious emails", IncidentCategory::Phishing, IncidentSeverity::Medium),
            ("Data Breach", "Unauthorized access to customer database", IncidentCategory::DataBreach, IncidentSeverity::Critical),
        ];

        for (title, description, category, severity) in sample_incidents {
            self.create_incident(title.to_string(), description.to_string(), category, severity);
        }
    }

    fn load_sample_alerts(&mut self) {
        let sample_alerts = vec![
            ("Suspicious Network Traffic", "Unusual outbound connections detected", AlertPriority::High, "Network Monitor"),
            ("Failed Login Attempts", "Multiple failed authentication attempts", AlertPriority::Medium, "SIEM"),
            ("Malware Signature", "Known malware signature detected", AlertPriority::Critical, "Antivirus"),
        ];

        for (title, description, priority, source) in sample_alerts {
            self.create_alert(title.to_string(), description.to_string(), priority, source.to_string());
        }
    }

    fn load_sample_playbooks(&mut self) {
        let playbook_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let playbook = SecurityPlaybook {
            id: playbook_id.clone(),
            name: "Malware Response".to_string(),
            description: "Automated response to malware detection".to_string(),
            version: "1.0".to_string(),
            category: "Incident Response".to_string(),
            trigger_conditions: vec![
                TriggerCondition {
                    condition_type: "alert".to_string(),
                    field: "category".to_string(),
                    operator: "equals".to_string(),
                    value: "malware".to_string(),
                    case_sensitive: false,
                }
            ],
            actions: vec![
                PlaybookAction {
                    id: Uuid::new_v4().to_string(),
                    name: "Isolate Host".to_string(),
                    action_type: ActionType::Containment,
                    description: "Isolate the affected host from network".to_string(),
                    order: 1,
                    required: true,
                    timeout_seconds: 300,
                    retry_count: 3,
                    parameters: HashMap::new(),
                    conditions: Vec::new(),
                    on_success: Vec::new(),
                    on_failure: Vec::new(),
                }
            ],
            approval_required: false,
            timeout_minutes: 60,
            created_by: "System".to_string(),
            created_at: now,
            updated_at: now,
            enabled: true,
            execution_count: 0,
            success_rate: 0.0,
            average_execution_time: 0.0,
            tags: vec!["malware".to_string(), "automated".to_string()],
            metadata: HashMap::new(),
        };

        self.playbooks.insert(playbook_id, playbook);
    }

    fn load_sample_tasks(&mut self) {
        let task_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let task = SecurityTask {
            id: task_id.clone(),
            title: "Investigate Malware Alert".to_string(),
            description: "Analyze and investigate the malware detection alert".to_string(),
            task_type: "Investigation".to_string(),
            priority: AlertPriority::High,
            status: TaskStatus::Pending,
            assigned_to: None,
            assigned_team: Some("SOC Team".to_string()),
            created_at: now,
            updated_at: now,
            due_date: Some(now + chrono::Duration::hours(4)),
            estimated_hours: Some(2.0),
            actual_hours: None,
            incident_id: None,
            alert_ids: Vec::new(),
            dependencies: Vec::new(),
            checklist: vec![
                TaskChecklistItem {
                    id: Uuid::new_v4().to_string(),
                    description: "Review alert details".to_string(),
                    completed: false,
                    completed_by: None,
                    completed_at: None,
                    notes: None,
                },
                TaskChecklistItem {
                    id: Uuid::new_v4().to_string(),
                    description: "Analyze affected systems".to_string(),
                    completed: false,
                    completed_by: None,
                    completed_at: None,
                    notes: None,
                },
            ],
            attachments: Vec::new(),
            comments: Vec::new(),
            tags: vec!["malware".to_string(), "investigation".to_string()],
            metadata: HashMap::new(),
        };

        self.tasks.insert(task_id, task);
    }

    fn load_sample_workflows(&mut self) {
        let workflow_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let workflow = OrchestrationWorkflow {
            id: workflow_id.clone(),
            name: "Incident Response Workflow".to_string(),
            description: "Automated incident response and escalation workflow".to_string(),
            trigger_type: "incident_created".to_string(),
            steps: vec![
                WorkflowStep {
                    id: Uuid::new_v4().to_string(),
                    name: "Initial Assessment".to_string(),
                    step_type: "assessment".to_string(),
                    order: 1,
                    configuration: HashMap::new(),
                    timeout_seconds: 300,
                    retry_policy: RetryPolicy {
                        max_attempts: 3,
                        delay_seconds: 30,
                        backoff_multiplier: 2.0,
                        max_delay_seconds: 300,
                    },
                    conditions: Vec::new(),
                },
                WorkflowStep {
                    id: Uuid::new_v4().to_string(),
                    name: "Notify Team".to_string(),
                    step_type: "notification".to_string(),
                    order: 2,
                    configuration: HashMap::new(),
                    timeout_seconds: 60,
                    retry_policy: RetryPolicy {
                        max_attempts: 2,
                        delay_seconds: 10,
                        backoff_multiplier: 1.5,
                        max_delay_seconds: 60,
                    },
                    conditions: Vec::new(),
                },
            ],
            enabled: true,
            created_at: now,
            last_executed: None,
            execution_count: 0,
            success_rate: 0.0,
        };

        self.workflows.insert(workflow_id, workflow);
    }

    fn calculate_priority_score(&self, severity: &IncidentSeverity) -> f64 {
        match severity {
            IncidentSeverity::Low => 1.0,
            IncidentSeverity::Medium => 2.5,
            IncidentSeverity::High => 4.0,
            IncidentSeverity::Critical => 5.0,
        }
    }

    fn calculate_incident_metrics(&self, incidents: &[&SecurityIncident]) -> IncidentMetrics {
        let total_incidents = incidents.len() as u32;
        
        let mut incidents_by_severity = HashMap::new();
        let mut incidents_by_category = HashMap::new();
        let mut incidents_by_status = HashMap::new();

        for incident in incidents {
            *incidents_by_severity.entry(incident.severity.clone()).or_insert(0) += 1;
            *incidents_by_category.entry(incident.category.clone()).or_insert(0) += 1;
            *incidents_by_status.entry(incident.status.clone()).or_insert(0) += 1;
        }

        IncidentMetrics {
            total_incidents,
            incidents_by_severity,
            incidents_by_category,
            incidents_by_status,
            mean_time_to_detection: 15.5, // minutes
            mean_time_to_response: 8.2,   // minutes
            mean_time_to_containment: 45.0, // minutes
            mean_time_to_resolution: 240.0, // minutes
            escalation_rate: 0.15,
            reopened_incidents: 2,
            cost_per_incident: 5000.0,
            total_cost_impact: total_incidents as f64 * 5000.0,
        }
    }

    fn calculate_alert_metrics(&self, alerts: &[&SecurityAlert]) -> AlertMetrics {
        let total_alerts = alerts.len() as u32;
        
        let mut alerts_by_priority = HashMap::new();
        let mut alerts_by_source = HashMap::new();

        for alert in alerts {
            *alerts_by_priority.entry(alert.priority.clone()).or_insert(0) += 1;
            *alerts_by_source.entry(alert.source.clone()).or_insert(0) += 1;
        }

        AlertMetrics {
            total_alerts,
            alerts_by_priority,
            alerts_by_source,
            false_positive_rate: 0.12,
            alert_to_incident_ratio: 3.2,
            mean_time_to_triage: 5.8, // minutes
            auto_resolved_alerts: total_alerts / 4,
            escalated_alerts: total_alerts / 8,
        }
    }

    fn calculate_response_metrics(&self) -> ResponseMetrics {
        ResponseMetrics {
            playbooks_executed: self.executions.len() as u32,
            automation_success_rate: 0.87,
            manual_interventions: 15,
            sla_compliance_rate: 0.92,
            escalations: 8,
            after_hours_responses: 12,
        }
    }

    fn calculate_team_metrics(&self) -> TeamMetrics {
        let mut workload_distribution = HashMap::new();
        workload_distribution.insert("Alice".to_string(), 25);
        workload_distribution.insert("Bob".to_string(), 18);
        workload_distribution.insert("Charlie".to_string(), 22);

        let mut response_times_by_analyst = HashMap::new();
        response_times_by_analyst.insert("Alice".to_string(), 8.5);
        response_times_by_analyst.insert("Bob".to_string(), 12.3);
        response_times_by_analyst.insert("Charlie".to_string(), 9.8);

        let mut resolution_rates = HashMap::new();
        resolution_rates.insert("Alice".to_string(), 0.94);
        resolution_rates.insert("Bob".to_string(), 0.89);
        resolution_rates.insert("Charlie".to_string(), 0.91);

        let mut certification_status = HashMap::new();
        certification_status.insert("Alice".to_string(), "CISSP".to_string());
        certification_status.insert("Bob".to_string(), "GCIH".to_string());
        certification_status.insert("Charlie".to_string(), "GCFA".to_string());

        TeamMetrics {
            analysts_active: 3,
            workload_distribution,
            response_times_by_analyst,
            resolution_rates,
            training_hours: 120.0,
            certification_status,
        }
    }

    fn calculate_automation_metrics(&self) -> AutomationMetrics {
        AutomationMetrics {
            automated_actions: 156,
            automation_success_rate: 0.87,
            time_saved_hours: 48.5,
            cost_savings: 12500.0,
            failed_automations: 8,
            manual_overrides: 3,
        }
    }

    fn calculate_compliance_metrics(&self) -> ComplianceMetrics {
        ComplianceMetrics {
            frameworks_monitored: vec![
                "SOX".to_string(),
                "PCI DSS".to_string(),
                "GDPR".to_string(),
                "HIPAA".to_string(),
            ],
            compliance_score: 0.94,
            violations_detected: 5,
            remediation_time: 72.0, // hours
            audit_findings: 2,
            policy_exceptions: 1,
        }
    }
}

impl Default for SecOpCore {
    fn default() -> Self {
        let mut core = Self::new();
        core.initialize_with_sample_data();
        core
    }
}

// NAPI wrapper for JavaScript bindings
#[napi]
pub struct SecOpCoreNapi {
    inner: SecOpCore,
    runtime: Option<tokio::runtime::Runtime>,
}

#[napi]
impl SecOpCoreNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        let runtime = tokio::runtime::Runtime::new().ok();
        Self {
            inner: SecOpCore::default(),
            runtime,
        }
    }
    
    /// Create a new SecOp Core instance with data store configuration
    #[napi(factory)]
    pub fn new_with_data_store(config_json: String) -> Result<SecOpCoreNapi> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| napi::Error::from_reason(format!("Failed to create runtime: {}", e)))?;
        
        let config: datastore::DataStoreConfig = serde_json::from_str(&config_json)
            .map_err(|e| napi::Error::from_reason(format!("Invalid config JSON: {}", e)))?;
        
        let inner = runtime.block_on(async {
            SecOpCore::new_with_config(config).await
        }).map_err(|e| napi::Error::from_reason(format!("Failed to create SecOpCore with config: {}", e)))?;
        
        Ok(Self {
            inner,
            runtime: Some(runtime),
        })
    }
    
    /// Initialize the data store
    #[napi]
    pub fn initialize_data_store(&mut self) -> Result<bool> {
        if let Some(runtime) = &self.runtime {
            match runtime.block_on(async {
                self.inner.initialize_data_store().await
            }) {
                Ok(_) => Ok(true),
                Err(e) => {
                    log::warn!("Data store initialization failed: {}", e);
                    Ok(false)
                }
            }
        } else {
            Ok(true) // No runtime needed for in-memory
        }
    }
    
    /// Check data store health
    #[napi]
    pub fn data_store_health(&self) -> Result<bool> {
        if let Some(runtime) = &self.runtime {
            Ok(runtime.block_on(async {
                self.inner.data_store_health().await
            }))
        } else {
            Ok(true) // In-memory is always healthy
        }
    }
    
    /// Get data store configuration info
    #[napi]
    pub fn get_data_store_info(&self) -> Result<String> {
        let info = if self.inner.has_external_data_store() {
            serde_json::json!({
                "type": "external",
                "has_redis": self.inner.config.as_ref().map(|c| c.redis_url.is_some()).unwrap_or(false),
                "has_postgres": self.inner.config.as_ref().map(|c| c.postgres_url.is_some()).unwrap_or(false),
                "has_mongodb": self.inner.config.as_ref().map(|c| c.mongodb_url.is_some()).unwrap_or(false),
                "has_elasticsearch": self.inner.config.as_ref().map(|c| c.elasticsearch_url.is_some()).unwrap_or(false),
                "cache_enabled": self.inner.config.as_ref().map(|c| c.cache_enabled).unwrap_or(false),
                "default_store": self.inner.config.as_ref().map(|c| &c.default_store).unwrap_or(&datastore::DataStoreType::Memory)
            })
        } else {
            serde_json::json!({
                "type": "memory",
                "description": "In-memory storage for development and testing"
            })
        };
        
        serde_json::to_string(&info)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize info: {}", e)))
    }

    #[napi]
    pub fn create_incident(&mut self, title: String, description: String, category: String, severity: String) -> Result<String> {
        let category_enum = match category.as_str() {
            "Malware" => IncidentCategory::Malware,
            "Phishing" => IncidentCategory::Phishing,
            "DataBreach" => IncidentCategory::DataBreach,
            "UnauthorizedAccess" => IncidentCategory::UnauthorizedAccess,
            "DenialOfService" => IncidentCategory::DenialOfService,
            "InsiderThreat" => IncidentCategory::InsiderThreat,
            "PhysicalSecurity" => IncidentCategory::PhysicalSecurity,
            "ComplianceViolation" => IncidentCategory::ComplianceViolation,
            "SystemCompromise" => IncidentCategory::SystemCompromise,
            "NetworkIntrusion" => IncidentCategory::NetworkIntrusion,
            _ => IncidentCategory::Other,
        };
        
        let severity_enum = match severity.as_str() {
            "Low" => IncidentSeverity::Low,
            "Medium" => IncidentSeverity::Medium,
            "High" => IncidentSeverity::High,
            "Critical" => IncidentSeverity::Critical,
            _ => IncidentSeverity::Low,
        };
        
        // Use runtime if available for async operations
        if let Some(runtime) = &self.runtime {
            match runtime.block_on(async {
                self.inner.create_incident(title, description, category_enum, severity_enum).await
            }) {
                Ok(id) => Ok(id),
                Err(e) => Err(napi::Error::from_reason(format!("Failed to create incident: {}", e))),
            }
        } else {
            // Fallback to synchronous in-memory operation
            // This is a simplified version for backward compatibility
            let incident_id = Uuid::new_v4().to_string();
            let now = Utc::now();

            let incident = SecurityIncident {
                id: incident_id.clone(),
                title,
                description,
                category: category_enum,
                severity: severity_enum.clone(),
                status: IncidentStatus::New,
                priority_score: self.inner.calculate_priority_score(&severity_enum),
                created_at: now,
                updated_at: now,
                detected_at: now,
                assigned_to: None,
                assigned_team: None,
                source_system: "Phantom SecOp Core".to_string(),
                affected_assets: Vec::new(),
                indicators: Vec::new(),
                tags: Vec::new(),
                timeline: vec![IncidentTimelineEntry {
                    timestamp: now,
                    event_type: "Created".to_string(),
                    description: "Incident created".to_string(),
                    actor: "System".to_string(),
                    details: HashMap::new(),
                }],
                evidence: Vec::new(),
                related_alerts: Vec::new(),
                related_incidents: Vec::new(),
                containment_actions: Vec::new(),
                eradication_actions: Vec::new(),
                recovery_actions: Vec::new(),
                lessons_learned: Vec::new(),
                cost_impact: None,
                business_impact: BusinessImpact {
                    financial_impact: 0.0,
                    operational_impact: OperationalImpact::None,
                    reputation_impact: ReputationImpact::None,
                    regulatory_impact: Vec::new(),
                    customer_impact: CustomerImpact {
                        customers_affected: 0,
                        service_degradation: false,
                        data_exposure: false,
                        communication_required: false,
                        compensation_required: false,
                    },
                    service_disruption: Vec::new(),
                    data_impact: DataImpact {
                        data_types_affected: Vec::new(),
                        records_affected: 0,
                        confidentiality_breach: false,
                        integrity_compromise: false,
                        availability_impact: false,
                        regulatory_notification_required: false,
                    },
                },
                compliance_impact: Vec::new(),
                metadata: HashMap::new(),
            };

            self.inner.incidents.insert(incident_id.clone(), incident);
            Ok(incident_id)
        }
    }

    #[napi]
    pub fn get_incident(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_incident(&id) {
            Some(incident) => {
                let json = serde_json::to_string(incident)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize incident: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    #[napi]
    pub fn update_incident_status(&mut self, id: String, status: String, actor: String) -> Result<bool> {
        let status_enum = match status.as_str() {
            "New" => IncidentStatus::New,
            "Assigned" => IncidentStatus::Assigned,
            "InProgress" => IncidentStatus::InProgress,
            "Investigating" => IncidentStatus::Investigating,
            "Contained" => IncidentStatus::Contained,
            "Eradicated" => IncidentStatus::Eradicated,
            "Recovering" => IncidentStatus::Recovering,
            "Resolved" => IncidentStatus::Resolved,
            "Closed" => IncidentStatus::Closed,
            _ => return Err(napi::Error::from_reason("Invalid incident status")),
        };
        
        match self.inner.update_incident_status(&id, status_enum, &actor) {
            std::result::Result::Ok(_) => Ok(true),
            std::result::Result::Err(_) => Ok(false),
        }
    }

    #[napi]
    pub fn generate_security_metrics(&self, start_date: String, end_date: String) -> Result<String> {
        // For simplicity, use 30 days ago to now if parsing fails
        let start = chrono::DateTime::parse_from_rfc3339(&start_date)
            .unwrap_or_else(|_| (Utc::now() - chrono::Duration::days(30)).into())
            .with_timezone(&Utc);
        let end = chrono::DateTime::parse_from_rfc3339(&end_date)
            .unwrap_or_else(|_| Utc::now().into())
            .with_timezone(&Utc);
            
        let metrics = self.inner.generate_metrics(start, end);
        serde_json::to_string(&metrics)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize metrics: {}", e)))
    }

    // ============ ALERT MANAGEMENT MODULES (3 methods) ============

    /// Create a new security alert
    #[napi]
    pub fn create_alert(&mut self, title: String, description: String, priority: String, source: String) -> Result<String> {
        let priority_enum = match priority.as_str() {
            "Info" => AlertPriority::Info,
            "Low" => AlertPriority::Low,
            "Medium" => AlertPriority::Medium,
            "High" => AlertPriority::High,
            "Critical" => AlertPriority::Critical,
            _ => AlertPriority::Low,
        };
        
        Ok(self.inner.create_alert(title, description, priority_enum, source))
    }

    /// Get alert by ID
    #[napi]
    pub fn get_alert(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_alert(&id) {
            Some(alert) => {
                let json = serde_json::to_string(alert)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize alert: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    /// Update alert status and assignment
    #[napi]
    pub fn update_alert_status(&mut self, id: String, status: String, assigned_to: Option<String>) -> Result<bool> {
        let status_enum = match status.as_str() {
            "Open" => AlertStatus::Open,
            "Acknowledged" => AlertStatus::Acknowledged,
            "InProgress" => AlertStatus::InProgress,
            "Resolved" => AlertStatus::Resolved,
            "Closed" => AlertStatus::Closed,
            "FalsePositive" => AlertStatus::FalsePositive,
            _ => return Err(napi::Error::from_reason("Invalid alert status")),
        };
        
        match self.inner.update_alert_status(&id, status_enum, assigned_to.as_deref()) {
            std::result::Result::Ok(_) => Ok(true),
            std::result::Result::Err(_) => Ok(false),
        }
    }

    // ============ PLAYBOOK MANAGEMENT MODULES (4 methods) ============

    /// Create a new security playbook
    #[napi]
    pub fn create_playbook(&mut self, name: String, description: String, category: String) -> Result<String> {
        Ok(self.inner.create_playbook(name, description, category))
    }

    /// Get playbook by ID
    #[napi]
    pub fn get_playbook(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_playbook(&id) {
            Some(playbook) => {
                let json = serde_json::to_string(playbook)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize playbook: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    /// Execute a security playbook
    #[napi]
    pub fn execute_playbook(&mut self, playbook_id: String, triggered_by: String, trigger_event: String) -> Result<String> {
        match self.inner.execute_playbook(&playbook_id, &triggered_by, &trigger_event) {
            std::result::Result::Ok(execution_id) => Ok(execution_id),
            std::result::Result::Err(err) => Err(napi::Error::from_reason(err)),
        }
    }

    /// Get playbook execution status
    #[napi]
    pub fn get_playbook_execution_status(&self, execution_id: String) -> Result<Option<String>> {
        match self.inner.get_playbook_execution_status(&execution_id) {
            Some(execution) => {
                let json = serde_json::to_string(execution)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize execution: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    // ============ TASK MANAGEMENT MODULES (3 methods) ============

    /// Create a new security task
    #[napi]
    pub fn create_task(&mut self, title: String, description: String, task_type: String, priority: String) -> Result<String> {
        let priority_enum = match priority.as_str() {
            "Info" => AlertPriority::Info,
            "Low" => AlertPriority::Low,
            "Medium" => AlertPriority::Medium,
            "High" => AlertPriority::High,
            "Critical" => AlertPriority::Critical,
            _ => AlertPriority::Low,
        };
        
        Ok(self.inner.create_task(title, description, task_type, priority_enum))
    }

    /// Get task by ID
    #[napi]
    pub fn get_task(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_task(&id) {
            Some(task) => {
                let json = serde_json::to_string(task)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize task: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    /// Update task status
    #[napi]
    pub fn update_task_status(&mut self, id: String, status: String, actor: String) -> Result<bool> {
        let status_enum = match status.as_str() {
            "Pending" => TaskStatus::Pending,
            "InProgress" => TaskStatus::InProgress,
            "Completed" => TaskStatus::Completed,
            "Failed" => TaskStatus::Failed,
            "Skipped" => TaskStatus::Skipped,
            "Cancelled" => TaskStatus::Cancelled,
            _ => return Err(napi::Error::from_reason("Invalid task status")),
        };
        
        match self.inner.update_task_status(&id, status_enum, &actor) {
            std::result::Result::Ok(_) => Ok(true),
            std::result::Result::Err(_) => Ok(false),
        }
    }

    // ============ EVIDENCE MANAGEMENT MODULES (3 methods) ============

    /// Add evidence to the system
    #[napi]
    pub fn add_evidence(&mut self, name: String, description: String, evidence_type: String, source: String, collected_by: String) -> Result<String> {
        let evidence_type_enum = match evidence_type.as_str() {
            "NetworkCapture" => EvidenceType::NetworkCapture,
            "SystemLogs" => EvidenceType::SystemLogs,
            "MemoryDump" => EvidenceType::MemoryDump,
            "DiskImage" => EvidenceType::DiskImage,
            "FileSystem" => EvidenceType::FileSystem,
            "Registry" => EvidenceType::Registry,
            "Email" => EvidenceType::Email,
            "Document" => EvidenceType::Document,
            "Screenshot" => EvidenceType::Screenshot,
            _ => EvidenceType::Other,
        };
        
        Ok(self.inner.add_evidence(name, description, evidence_type_enum, source, collected_by))
    }

    /// Get evidence by ID
    #[napi]
    pub fn get_evidence(&self, id: String) -> Result<Option<String>> {
        match self.inner.get_evidence(&id) {
            Some(evidence) => {
                let json = serde_json::to_string(evidence)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize evidence: {}", e)))?;
                Ok(Some(json))
            }
            None => Ok(None)
        }
    }

    /// Get evidence chain of custody
    #[napi]
    pub fn get_evidence_chain_of_custody(&self, id: String) -> Result<String> {
        match self.inner.get_evidence_chain_of_custody(&id) {
            std::result::Result::Ok(chain) => {
                let json = serde_json::to_string(&chain)
                    .map_err(|e| napi::Error::from_reason(format!("Failed to serialize chain of custody: {}", e)))?;
                Ok(json)
            }
            std::result::Result::Err(err) => Err(napi::Error::from_reason(err)),
        }
    }

    // ============ SEARCH & ANALYTICS MODULES (3 methods) ============

    /// Search incidents by criteria
    #[napi]
    pub fn search_incidents(&self, query: String, status: Option<String>, severity: Option<String>) -> Result<String> {
        let status_enum = status.and_then(|s| match s.as_str() {
            "New" => Some(IncidentStatus::New),
            "Assigned" => Some(IncidentStatus::Assigned),
            "InProgress" => Some(IncidentStatus::InProgress),
            "Investigating" => Some(IncidentStatus::Investigating),
            "Contained" => Some(IncidentStatus::Contained),
            "Eradicated" => Some(IncidentStatus::Eradicated),
            "Recovering" => Some(IncidentStatus::Recovering),
            "Resolved" => Some(IncidentStatus::Resolved),
            "Closed" => Some(IncidentStatus::Closed),
            _ => None,
        });

        let severity_enum = severity.and_then(|s| match s.as_str() {
            "Low" => Some(IncidentSeverity::Low),
            "Medium" => Some(IncidentSeverity::Medium),
            "High" => Some(IncidentSeverity::High),
            "Critical" => Some(IncidentSeverity::Critical),
            _ => None,
        });

        let incidents = self.inner.search_incidents(&query, status_enum, severity_enum);
        let json = serde_json::to_string(&incidents)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize incidents: {}", e)))?;
        Ok(json)
    }

    /// Search alerts by criteria
    #[napi]
    pub fn search_alerts(&self, query: String, priority: Option<String>, status: Option<String>) -> Result<String> {
        let priority_enum = priority.and_then(|p| match p.as_str() {
            "Info" => Some(AlertPriority::Info),
            "Low" => Some(AlertPriority::Low),
            "Medium" => Some(AlertPriority::Medium),
            "High" => Some(AlertPriority::High),
            "Critical" => Some(AlertPriority::Critical),
            _ => None,
        });

        let status_enum = status.and_then(|s| match s.as_str() {
            "Open" => Some(AlertStatus::Open),
            "Acknowledged" => Some(AlertStatus::Acknowledged),
            "InProgress" => Some(AlertStatus::InProgress),
            "Resolved" => Some(AlertStatus::Resolved),
            "Closed" => Some(AlertStatus::Closed),
            "FalsePositive" => Some(AlertStatus::FalsePositive),
            _ => None,
        });

        let alerts = self.inner.search_alerts(&query, priority_enum, status_enum);
        let json = serde_json::to_string(&alerts)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize alerts: {}", e)))?;
        Ok(json)
    }

    /// Get all active alerts (open, acknowledged, or in progress)
    #[napi]
    pub fn get_active_alerts(&self) -> Result<String> {
        let alerts = self.inner.get_active_alerts();
        let json = serde_json::to_string(&alerts)
            .map_err(|e| napi::Error::from_reason(format!("Failed to serialize active alerts: {}", e)))?;
        Ok(json)
    }

    // ============ WORKFLOW MANAGEMENT MODULES (2 methods) ============

    /// Create an orchestration workflow
    #[napi]
    pub fn create_workflow(&mut self, name: String, description: String, trigger_type: String) -> Result<String> {
        Ok(self.inner.create_workflow(name, description, trigger_type))
    }

    /// Execute a workflow with context
    #[napi]
    pub fn execute_workflow(&mut self, workflow_id: String, context: String) -> Result<String> {
        // Parse the context JSON into a HashMap
        let context_map: HashMap<String, String> = serde_json::from_str(&context)
            .map_err(|e| napi::Error::from_reason(format!("Invalid context JSON: {}", e)))?;
        
        match self.inner.execute_workflow(&workflow_id, context_map) {
            std::result::Result::Ok(execution_id) => Ok(execution_id),
            std::result::Result::Err(err) => Err(napi::Error::from_reason(err)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_secop_core_creation() {
        let core = SecOpCore::new();
        assert!(core.incidents.is_empty());
        assert!(core.alerts.is_empty());
    }

    #[test]
    fn test_incident_creation() {
        let mut core = SecOpCore::new();
        let incident_id = core.create_incident(
            "Test Incident".to_string(),
            "Test Description".to_string(),
            IncidentCategory::Malware,
            IncidentSeverity::High,
        );
        
        assert!(!incident_id.is_empty());
        assert!(core.get_incident(&incident_id).is_some());
    }

    #[test]
    fn test_alert_creation() {
        let mut core = SecOpCore::new();
        let alert_id = core.create_alert(
            "Test Alert".to_string(),
            "Test Description".to_string(),
            AlertPriority::High,
            "Test Source".to_string(),
        );
        
        assert!(!alert_id.is_empty());
        assert!(core.get_alert(&alert_id).is_some());
    }

    #[test]
    fn test_incident_status_update() {
        let mut core = SecOpCore::new();
        let incident_id = core.create_incident(
            "Test Incident".to_string(),
            "Test Description".to_string(),
            IncidentCategory::Malware,
            IncidentSeverity::High,
        );
        
        let result = core.update_incident_status(&incident_id, IncidentStatus::InProgress, "Test User");
        assert!(result.is_ok());
        
        let incident = core.get_incident(&incident_id).unwrap();
        assert_eq!(incident.status, IncidentStatus::InProgress);
    }

    #[test]
    fn test_metrics_generation() {
        let core = SecOpCore::default();
        let start_date = Utc::now() - chrono::Duration::days(30);
        let end_date = Utc::now();
        
        let metrics = core.generate_metrics(start_date, end_date);
        assert!(metrics.incident_metrics.total_incidents > 0);
        assert!(metrics.alert_metrics.total_alerts > 0);
    }

    #[test]
    fn test_alert_management() {
        let mut core = SecOpCore::new();
        
        // Test alert creation
        let alert_id = core.create_alert(
            "Test Alert".to_string(),
            "Test Description".to_string(),
            AlertPriority::High,
            "Test Source".to_string(),
        );
        assert!(!alert_id.is_empty());
        assert!(core.get_alert(&alert_id).is_some());

        // Test alert status update
        let result = core.update_alert_status(&alert_id, AlertStatus::Acknowledged, Some("Test User"));
        assert!(result.is_ok());
        
        let alert = core.get_alert(&alert_id).unwrap();
        assert_eq!(alert.status, AlertStatus::Acknowledged);
        assert_eq!(alert.assigned_to, Some("Test User".to_string()));
    }

    #[test]
    fn test_playbook_management() {
        let mut core = SecOpCore::new();
        
        // Test playbook creation
        let playbook_id = core.create_playbook(
            "Test Playbook".to_string(),
            "Test Description".to_string(),
            "Test Category".to_string(),
        );
        assert!(!playbook_id.is_empty());
        assert!(core.get_playbook(&playbook_id).is_some());

        // Test playbook execution
        let execution_id = core.execute_playbook(&playbook_id, "Test User", "Test Event");
        assert!(execution_id.is_ok());
        
        let exec_id = execution_id.unwrap();
        let execution = core.get_playbook_execution_status(&exec_id);
        assert!(execution.is_some());
    }

    #[test]
    fn test_task_management() {
        let mut core = SecOpCore::new();
        
        // Test task creation
        let task_id = core.create_task(
            "Test Task".to_string(),
            "Test Description".to_string(),
            "Investigation".to_string(),
            AlertPriority::Medium,
        );
        assert!(!task_id.is_empty());
        assert!(core.get_task(&task_id).is_some());

        // Test task status update
        let result = core.update_task_status(&task_id, TaskStatus::InProgress, "Test User");
        assert!(result.is_ok());
        
        let task = core.get_task(&task_id).unwrap();
        assert_eq!(task.status, TaskStatus::InProgress);
    }

    #[test]
    fn test_evidence_management() {
        let mut core = SecOpCore::new();
        
        // Test evidence creation
        let evidence_id = core.add_evidence(
            "Test Evidence".to_string(),
            "Test Description".to_string(),
            EvidenceType::SystemLogs,
            "Test Source".to_string(),
            "Test Collector".to_string(),
        );
        assert!(!evidence_id.is_empty());
        assert!(core.get_evidence(&evidence_id).is_some());

        // Test chain of custody retrieval
        let chain_result = core.get_evidence_chain_of_custody(&evidence_id);
        assert!(chain_result.is_ok());
        let chain = chain_result.unwrap();
        assert!(!chain.is_empty());
    }

    #[test]
    fn test_search_functionality() {
        let mut core = SecOpCore::default(); // Uses sample data
        
        // Test incident search
        let incidents = core.search_incidents("malware", None, None);
        assert!(!incidents.is_empty());
        
        // Test alert search
        let alerts = core.search_alerts("suspicious", None, None);
        assert!(!alerts.is_empty());
        
        // Test active alerts
        let active_alerts = core.get_active_alerts();
        assert!(!active_alerts.is_empty());
    }

    #[test]
    fn test_workflow_management() {
        let mut core = SecOpCore::new();
        
        // Test workflow creation
        let workflow_id = core.create_workflow(
            "Test Workflow".to_string(),
            "Test Description".to_string(),
            "incident_created".to_string(),
        );
        assert!(!workflow_id.is_empty());

        // Test workflow execution
        let mut context = HashMap::new();
        context.insert("test_key".to_string(), "test_value".to_string());
        
        let execution_result = core.execute_workflow(&workflow_id, context);
        assert!(execution_result.is_ok());
    }

    #[test]
    fn test_napi_wrapper_creation() {
        let _napi_core = SecOpCoreNapi::new();
        // Just testing that the NAPI wrapper can be created without panicking
    }
}
