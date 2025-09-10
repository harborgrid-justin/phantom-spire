use crate::types::*;
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use std::collections::HashMap;
use napi_derive::napi;

#[async_trait]
pub trait IncidentResponseTrait {
    async fn create_incident(&self, incident_request: IncidentCreationRequest) -> IncidentResponse;
    async fn execute_playbook(&self, playbook_execution: PlaybookExecution) -> PlaybookResult;
    async fn orchestrate_response(&self, response_plan: ResponsePlan) -> OrchestrationResult;
    async fn get_status(&self) -> ComponentStatus;
}

#[derive(Clone)]
pub struct IncidentResponseOrchestrator {
    incidents: Arc<DashMap<String, SecurityIncident>>,
    playbooks: Arc<DashMap<String, ResponsePlaybook>>,
    response_plans: Arc<DashMap<String, ResponsePlan>>,
    executed_actions: Arc<DashMap<String, ActionExecution>>,
    processed_incidents: Arc<RwLock<u64>>,
    active_incidents: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IncidentCreationRequest {
    pub title: String,
    pub description: String,
    pub severity: String, // "low", "medium", "high", "critical"
    pub category: String, // "malware", "phishing", "data_breach", "ddos", "insider_threat"
    pub source: String, // "automated_detection", "user_report", "external_report"
    pub affected_assets: Vec<String>,
    pub initial_indicators: Vec<String>,
    pub reporter: String,
    pub additional_context: String, // JSON string
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SecurityIncident {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub category: String,
    pub status: String, // "open", "investigating", "contained", "resolved", "closed"
    pub priority: u32,
    pub created_time: i64,
    pub last_updated: i64,
    pub assigned_to: Option<String>,
    pub affected_assets: Vec<String>,
    pub indicators: Vec<ThreatIndicator>,
    pub timeline: Vec<IncidentEvent>,
    pub response_actions: Vec<String>, // Action IDs
    pub estimated_impact: String, // "low", "medium", "high", "critical"
    pub containment_status: String, // "none", "partial", "full"
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResponsePlaybook {
    pub id: String,
    pub name: String,
    pub description: String,
    pub incident_types: Vec<String>,
    pub severity_threshold: String,
    pub steps: Vec<PlaybookStep>,
    pub automation_level: String, // "manual", "semi-automated", "fully-automated"
    pub estimated_duration: i64, // minutes
    pub required_approvals: Vec<String>,
    pub created_by: String,
    pub created_date: i64,
    pub last_modified: i64,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlaybookStep {
    pub step_id: String,
    pub name: String,
    pub description: String,
    pub step_type: String, // "investigation", "containment", "eradication", "recovery", "notification"
    pub action_type: String, // "automated", "manual", "decision_point"
    pub automation_script: Option<String>,
    pub required_skills: Vec<String>,
    pub estimated_time: i64, // minutes
    pub dependencies: Vec<String>, // Step IDs that must complete first
    pub success_criteria: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlaybookExecution {
    pub execution_id: String,
    pub incident_id: String,
    pub playbook_id: String,
    pub executed_by: String,
    pub execution_mode: String, // "automatic", "manual", "guided"
    pub step_overrides: String, // JSON string of step customizations
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResponsePlan {
    pub plan_id: String,
    pub incident_id: String,
    pub response_strategy: String, // "contain", "investigate", "eradicate", "recover"
    pub priority_actions: Vec<ResponseAction>,
    pub resource_requirements: Vec<String>,
    pub estimated_timeline: i64, // hours
    pub approval_required: bool,
    pub communication_plan: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResponseAction {
    pub action_id: String,
    pub action_type: String, // "isolate", "block", "investigate", "notify", "remediate"
    pub target: String,
    pub parameters: String, // JSON string of action parameters
    pub automation_available: bool,
    pub estimated_duration: i64, // minutes
    pub risk_level: String, // "low", "medium", "high"
    pub approval_required: bool,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActionExecution {
    pub execution_id: String,
    pub action_id: String,
    pub incident_id: String,
    pub status: String, // "pending", "running", "completed", "failed", "cancelled"
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub executed_by: String,
    pub result: Option<String>,
    pub error_message: Option<String>,
    pub automation_used: bool,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IncidentEvent {
    pub event_id: String,
    pub event_type: String, // "created", "assigned", "escalated", "action_taken", "status_changed"
    pub description: String,
    pub timestamp: i64,
    pub user: String,
    pub details: String, // JSON string of event details
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct IncidentResponse {
    pub incident_id: String,
    pub status: String,
    pub recommended_playbooks: Vec<String>,
    pub initial_response_plan: ResponsePlan,
    pub escalation_required: bool,
    pub estimated_resolution_time: i64, // hours
    pub next_steps: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlaybookResult {
    pub execution_id: String,
    pub playbook_id: String,
    pub status: String, // "completed", "failed", "partial", "cancelled"
    pub completed_steps: u32,
    pub total_steps: u32,
    pub execution_time: i64, // minutes
    pub results: Vec<ActionExecution>,
    pub recommendations: Vec<String>,
    pub lessons_learned: Vec<String>,
}

#[napi(object)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct OrchestrationResult {
    pub plan_id: String,
    pub execution_status: String,
    pub actions_executed: u32,
    pub actions_pending: u32,
    pub actions_failed: u32,
    pub overall_progress: f64, // 0.0 to 100.0
    pub estimated_completion: i64, // timestamp
    pub critical_issues: Vec<String>,
}

impl IncidentResponseOrchestrator {
    pub fn new() -> Self {
        let mut orchestrator = Self {
            incidents: Arc::new(DashMap::new()),
            playbooks: Arc::new(DashMap::new()),
            response_plans: Arc::new(DashMap::new()),
            executed_actions: Arc::new(DashMap::new()),
            processed_incidents: Arc::new(RwLock::new(0)),
            active_incidents: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        };

        // Initialize with sample playbooks
        orchestrator.initialize_sample_playbooks();
        orchestrator
    }

    fn initialize_sample_playbooks(&self) {
        let playbooks = vec![
            ResponsePlaybook {
                id: "pb-malware-001".to_string(),
                name: "Malware Incident Response".to_string(),
                description: "Standard response procedure for malware incidents".to_string(),
                incident_types: vec!["malware".to_string(), "virus".to_string(), "trojan".to_string()],
                severity_threshold: "medium".to_string(),
                steps: vec![
                    PlaybookStep {
                        step_id: "step-001".to_string(),
                        name: "Isolate Affected Systems".to_string(),
                        description: "Immediately isolate infected systems from the network".to_string(),
                        step_type: "containment".to_string(),
                        action_type: "automated".to_string(),
                        automation_script: Some("isolate_endpoint.py".to_string()),
                        required_skills: vec!["network_security".to_string()],
                        estimated_time: 15,
                        dependencies: vec![],
                        success_criteria: vec!["Systems disconnected from network".to_string()],
                    },
                    PlaybookStep {
                        step_id: "step-002".to_string(),
                        name: "Collect Evidence".to_string(),
                        description: "Capture memory dumps and disk images from affected systems".to_string(),
                        step_type: "investigation".to_string(),
                        action_type: "manual".to_string(),
                        automation_script: None,
                        required_skills: vec!["digital_forensics".to_string()],
                        estimated_time: 60,
                        dependencies: vec!["step-001".to_string()],
                        success_criteria: vec!["Evidence collected and preserved".to_string()],
                    },
                    PlaybookStep {
                        step_id: "step-003".to_string(),
                        name: "Malware Analysis".to_string(),
                        description: "Analyze malware samples in isolated environment".to_string(),
                        step_type: "investigation".to_string(),
                        action_type: "automated".to_string(),
                        automation_script: Some("analyze_malware.py".to_string()),
                        required_skills: vec!["malware_analysis".to_string()],
                        estimated_time: 120,
                        dependencies: vec!["step-002".to_string()],
                        success_criteria: vec!["Malware characteristics identified".to_string()],
                    },
                ],
                automation_level: "semi-automated".to_string(),
                estimated_duration: 195, // Total of all steps
                required_approvals: vec!["incident_commander".to_string()],
                created_by: "security_team".to_string(),
                created_date: (Utc::now() - chrono::Duration::days(30)).timestamp(),
                last_modified: (Utc::now() - chrono::Duration::days(5)).timestamp(),
            },
            ResponsePlaybook {
                id: "pb-phishing-001".to_string(),
                name: "Phishing Incident Response".to_string(),
                description: "Response procedure for phishing and social engineering attacks".to_string(),
                incident_types: vec!["phishing".to_string(), "social_engineering".to_string()],
                severity_threshold: "medium".to_string(),
                steps: vec![
                    PlaybookStep {
                        step_id: "step-ph-001".to_string(),
                        name: "Block Malicious URLs".to_string(),
                        description: "Add malicious URLs to blocklist across all security tools".to_string(),
                        step_type: "containment".to_string(),
                        action_type: "automated".to_string(),
                        automation_script: Some("block_urls.py".to_string()),
                        required_skills: vec!["network_security".to_string()],
                        estimated_time: 10,
                        dependencies: vec![],
                        success_criteria: vec!["URLs blocked in all systems".to_string()],
                    },
                    PlaybookStep {
                        step_id: "step-ph-002".to_string(),
                        name: "User Communication".to_string(),
                        description: "Notify all users about the phishing campaign".to_string(),
                        step_type: "notification".to_string(),
                        action_type: "manual".to_string(),
                        automation_script: None,
                        required_skills: vec!["communication".to_string()],
                        estimated_time: 30,
                        dependencies: vec!["step-ph-001".to_string()],
                        success_criteria: vec!["Users notified and educated".to_string()],
                    },
                ],
                automation_level: "semi-automated".to_string(),
                estimated_duration: 40,
                required_approvals: vec![],
                created_by: "security_team".to_string(),
                created_date: (Utc::now() - chrono::Duration::days(20)).timestamp(),
                last_modified: (Utc::now() - chrono::Duration::days(2)).timestamp(),
            },
        ];

        for playbook in playbooks {
            self.playbooks.insert(playbook.id.clone(), playbook);
        }
    }

    pub async fn get_all_incidents(&self) -> Vec<SecurityIncident> {
        self.incidents.iter().map(|entry| entry.value().clone()).collect()
    }

    pub async fn get_incident(&self, incident_id: &str) -> Option<SecurityIncident> {
        self.incidents.get(incident_id).map(|entry| entry.value().clone())
    }

    pub async fn update_incident_status(&self, incident_id: &str, status: &str, user: &str) -> Result<(), String> {
        if let Some(mut incident) = self.incidents.get_mut(incident_id) {
            let old_status = incident.status.clone();
            incident.status = status.to_string();
            incident.last_updated = Utc::now().timestamp();

            // Add timeline event
            let event = IncidentEvent {
                event_id: format!("event-{}", Utc::now().timestamp()),
                event_type: "status_changed".to_string(),
                description: format!("Status changed from {} to {}", old_status, status),
                timestamp: Utc::now().timestamp(),
                user: user.to_string(),
                details: format!(r#"{{"old_status": "{}", "new_status": "{}"}}"#, old_status, status),
            };
            incident.timeline.push(event);

            // Update active incidents counter
            if status == "closed" || status == "resolved" {
                let mut active_incidents = self.active_incidents.write().await;
                if *active_incidents > 0 {
                    *active_incidents -= 1;
                }
            }

            Ok(())
        } else {
            Err("Incident not found".to_string())
        }
    }

    pub async fn assign_incident(&self, incident_id: &str, assignee: &str, assigned_by: &str) -> Result<(), String> {
        if let Some(mut incident) = self.incidents.get_mut(incident_id) {
            incident.assigned_to = Some(assignee.to_string());
            incident.last_updated = Utc::now().timestamp();

            let event = IncidentEvent {
                event_id: format!("event-{}", Utc::now().timestamp()),
                event_type: "assigned".to_string(),
                description: format!("Incident assigned to {}", assignee),
                timestamp: Utc::now().timestamp(),
                user: assigned_by.to_string(),
                details: format!(r#"{{"assignee": "{}"}}"#, assignee),
            };
            incident.timeline.push(event);

            Ok(())
        } else {
            Err("Incident not found".to_string())
        }
    }

    pub async fn get_recommended_playbooks(&self, incident: &SecurityIncident) -> Vec<ResponsePlaybook> {
        self.playbooks
            .iter()
            .filter(|entry| {
                let playbook = entry.value();
                playbook.incident_types.contains(&incident.category) &&
                self.meets_severity_threshold(&incident.severity, &playbook.severity_threshold)
            })
            .map(|entry| entry.value().clone())
            .collect()
    }

    fn meets_severity_threshold(&self, incident_severity: &str, threshold: &str) -> bool {
        let severity_value = match incident_severity {
            "low" => 1,
            "medium" => 2,
            "high" => 3,
            "critical" => 4,
            _ => 0,
        };

        let threshold_value = match threshold {
            "low" => 1,
            "medium" => 2,
            "high" => 3,
            "critical" => 4,
            _ => 0,
        };

        severity_value >= threshold_value
    }
}

#[async_trait]
impl IncidentResponseTrait for IncidentResponseOrchestrator {
    async fn create_incident(&self, incident_request: IncidentCreationRequest) -> IncidentResponse {
        let mut processed_incidents = self.processed_incidents.write().await;
        *processed_incidents += 1;

        let incident_id = format!("inc-{}", Utc::now().timestamp());
        let current_time = Utc::now().timestamp();

        // Determine priority based on severity
        let priority = match incident_request.severity.as_str() {
            "critical" => 1,
            "high" => 2,
            "medium" => 3,
            "low" => 4,
            _ => 5,
        };

        // Create incident
        let incident = SecurityIncident {
            id: incident_id.clone(),
            title: incident_request.title.clone(),
            description: incident_request.description,
            severity: incident_request.severity.clone(),
            category: incident_request.category.clone(),
            status: "open".to_string(),
            priority,
            created_time: current_time,
            last_updated: current_time,
            assigned_to: None,
            affected_assets: incident_request.affected_assets,
            indicators: vec![], // Would be populated with actual indicators
            timeline: vec![
                IncidentEvent {
                    event_id: format!("event-{}", current_time),
                    event_type: "created".to_string(),
                    description: "Incident created".to_string(),
                    timestamp: current_time,
                    user: incident_request.reporter.clone(),
                    details: incident_request.additional_context,
                },
            ],
            response_actions: vec![],
            estimated_impact: incident_request.severity.clone(),
            containment_status: "none".to_string(),
        };

        // Get recommended playbooks
        let recommended_playbooks = self.get_recommended_playbooks(&incident).await;
        let recommended_playbook_ids: Vec<String> = recommended_playbooks.iter().map(|p| p.id.clone()).collect();

        // Create initial response plan
        let response_plan = ResponsePlan {
            plan_id: format!("plan-{}", incident_id),
            incident_id: incident_id.clone(),
            response_strategy: match incident.severity.as_str() {
                "critical" => "immediate_containment",
                "high" => "rapid_investigation",
                "medium" => "standard_investigation",
                _ => "monitor_and_assess",
            }.to_string(),
            priority_actions: vec![
                ResponseAction {
                    action_id: "action-001".to_string(),
                    action_type: "investigate".to_string(),
                    target: "initial_assessment".to_string(),
                    parameters: r#"{"scope": "preliminary", "timeline": "immediate"}"#.to_string(),
                    automation_available: false,
                    estimated_duration: 30,
                    risk_level: "low".to_string(),
                    approval_required: false,
                },
            ],
            resource_requirements: vec!["incident_responder".to_string(), "security_analyst".to_string()],
            estimated_timeline: match incident.severity.as_str() {
                "critical" => 4,
                "high" => 8,
                "medium" => 24,
                _ => 72,
            },
            approval_required: incident.severity == "critical",
            communication_plan: vec!["notify_security_team".to_string()],
        };

        self.incidents.insert(incident_id.clone(), incident);
        self.response_plans.insert(response_plan.plan_id.clone(), response_plan.clone());

        // Update active incidents counter
        let mut active_incidents = self.active_incidents.write().await;
        *active_incidents += 1;

        // Determine escalation requirement
        let escalation_required = incident_request.severity == "critical" || 
                                   incident_request.category == "data_breach";

        // Estimate resolution time
        let estimated_resolution_time = match incident_request.severity.as_str() {
            "critical" => 24,
            "high" => 72,
            "medium" => 168, // 7 days
            _ => 336, // 14 days
        };

        IncidentResponse {
            incident_id,
            status: "created".to_string(),
            recommended_playbooks: recommended_playbook_ids,
            initial_response_plan: response_plan,
            escalation_required,
            estimated_resolution_time,
            next_steps: vec![
                "Assign incident responder".to_string(),
                "Begin initial assessment".to_string(),
                "Activate appropriate playbook".to_string(),
            ],
        }
    }

    async fn execute_playbook(&self, playbook_execution: PlaybookExecution) -> PlaybookResult {
        let execution_id = playbook_execution.execution_id.clone();
        let start_time = Utc::now().timestamp();

        // Get playbook
        let playbook = self.playbooks.get(&playbook_execution.playbook_id);
        if playbook.is_none() {
            return PlaybookResult {
                execution_id,
                playbook_id: playbook_execution.playbook_id,
                status: "failed".to_string(),
                completed_steps: 0,
                total_steps: 0,
                execution_time: 0,
                results: vec![],
                recommendations: vec!["Playbook not found".to_string()],
                lessons_learned: vec![],
            };
        }

        let playbook = playbook.unwrap();
        let total_steps = playbook.steps.len() as u32;
        let mut completed_steps = 0;
        let mut results = vec![];

        // Execute steps sequentially
        for step in &playbook.steps {
            let action_execution = ActionExecution {
                execution_id: format!("exec-{}-{}", execution_id, step.step_id),
                action_id: step.step_id.clone(),
                incident_id: playbook_execution.incident_id.clone(),
                status: "running".to_string(),
                start_time: Utc::now().timestamp(),
                end_time: None,
                executed_by: playbook_execution.executed_by.clone(),
                result: None,
                error_message: None,
                automation_used: step.action_type == "automated",
            };

            // Simulate step execution
            let step_success = match step.action_type.as_str() {
                "automated" => true, // Assume automated steps succeed
                "manual" => step.step_id != "step-002", // Simulate one manual step failing
                _ => true,
            };

            let mut final_execution = action_execution;
            final_execution.end_time = Some(Utc::now().timestamp());
            final_execution.status = if step_success { "completed" } else { "failed" }.to_string();
            final_execution.result = Some(
                if step_success { 
                    "Step completed successfully".to_string() 
                } else { 
                    "Step failed - manual intervention required".to_string() 
                }
            );

            if step_success {
                completed_steps += 1;
            } else {
                final_execution.error_message = Some("Manual step requires additional time".to_string());
            }

            self.executed_actions.insert(final_execution.execution_id.clone(), final_execution.clone());
            results.push(final_execution);

            // If step failed and it's critical, abort execution
            if !step_success && step.step_type == "containment" {
                break;
            }
        }

        let end_time = Utc::now().timestamp();
        let execution_time = (end_time - start_time) / 60; // Convert to minutes

        let status = if completed_steps == total_steps {
            "completed"
        } else if completed_steps > 0 {
            "partial"
        } else {
            "failed"
        };

        PlaybookResult {
            execution_id,
            playbook_id: playbook_execution.playbook_id,
            status: status.to_string(),
            completed_steps,
            total_steps,
            execution_time,
            results,
            recommendations: vec![
                "Review failed steps and implement manually".to_string(),
                "Update playbook based on execution results".to_string(),
            ],
            lessons_learned: vec![
                "Automated steps executed successfully".to_string(),
                "Manual steps may require additional resources".to_string(),
            ],
        }
    }

    async fn orchestrate_response(&self, response_plan: ResponsePlan) -> OrchestrationResult {
        let plan_id = response_plan.plan_id.clone();
        let total_actions = response_plan.priority_actions.len() as u32;
        let mut actions_executed = 0;
        let mut actions_failed = 0;
        let mut critical_issues = vec![];

        // Execute priority actions
        for action in &response_plan.priority_actions {
            // Simulate action execution
            let action_success = match action.action_type.as_str() {
                "isolate" | "block" => true, // These typically succeed
                "investigate" => action.risk_level != "high", // High-risk investigations may fail
                _ => true,
            };

            if action_success {
                actions_executed += 1;
            } else {
                actions_failed += 1;
                critical_issues.push(format!("Failed to execute action: {}", action.action_id));
            }

            // Store execution result
            let execution = ActionExecution {
                execution_id: format!("orch-{}-{}", plan_id, Utc::now().timestamp()),
                action_id: action.action_id.clone(),
                incident_id: response_plan.incident_id.clone(),
                status: if action_success { "completed" } else { "failed" }.to_string(),
                start_time: Utc::now().timestamp(),
                end_time: Some(Utc::now().timestamp()),
                executed_by: "orchestrator".to_string(),
                result: Some(if action_success { "Success" } else { "Failed" }.to_string()),
                error_message: if !action_success { Some("Execution error".to_string()) } else { None },
                automation_used: action.automation_available,
            };

            self.executed_actions.insert(execution.execution_id.clone(), execution);
        }

        let actions_pending = total_actions - actions_executed - actions_failed;
        let overall_progress = (actions_executed as f64 / total_actions as f64) * 100.0;

        // Estimate completion time
        let estimated_completion = Utc::now().timestamp() + (response_plan.estimated_timeline * 3600);

        OrchestrationResult {
            plan_id,
            execution_status: if actions_failed == 0 { "successful" } else { "partial" }.to_string(),
            actions_executed,
            actions_pending,
            actions_failed,
            overall_progress,
            estimated_completion,
            critical_issues,
        }
    }

    async fn get_status(&self) -> ComponentStatus {
        let processed_incidents = *self.processed_incidents.read().await;
        let active_incidents = *self.active_incidents.read().await;
        let last_error = self.last_error.read().await.clone();

        ComponentStatus {
            status: "operational".to_string(),
            uptime: 0,
            processed_events: processed_incidents as i64,
            active_alerts: active_incidents,
            last_error,
        }
    }
}