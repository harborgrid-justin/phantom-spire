// phantom-ioc-core/src/incident_response.rs
// Automated incident response workflows and playbooks

use crate::types::*;
use async_trait::async_trait;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

/// Incident response engine for automated response workflows
pub struct IncidentResponseEngine {
    playbooks: Arc<RwLock<HashMap<String, ResponsePlaybook>>>,
    incidents: Arc<RwLock<HashMap<String, SecurityIncident>>>,
    response_actions: Arc<RwLock<HashMap<String, ResponseAction>>>,
    statistics: Arc<RwLock<IncidentResponseStats>>,
}

impl IncidentResponseEngine {
    /// Create a new incident response engine
    pub async fn new() -> Result<Self, IOCError> {
        let engine = Self {
            playbooks: Arc::new(RwLock::new(HashMap::new())),
            incidents: Arc::new(RwLock::new(HashMap::new())),
            response_actions: Arc::new(RwLock::new(HashMap::new())),
            statistics: Arc::new(RwLock::new(IncidentResponseStats::default())),
        };

        // Initialize with default playbooks
        engine.initialize_default_playbooks().await?;

        Ok(engine)
    }

    /// Initialize default response playbooks
    async fn initialize_default_playbooks(&self) -> Result<(), IOCError> {
        let default_playbooks = vec![
            ResponsePlaybook {
                id: "malware_response".to_string(),
                name: "Malware Incident Response".to_string(),
                description: "Standard response for malware incidents".to_string(),
                trigger_conditions: vec![
                    PlaybookTrigger {
                        condition_type: "ioc_type".to_string(),
                        operator: "equals".to_string(),
                        value: "hash".to_string(),
                    },
                    PlaybookTrigger {
                        condition_type: "tags".to_string(),
                        operator: "contains".to_string(),
                        value: "malware".to_string(),
                    },
                ],
                steps: vec![
                    PlaybookStep {
                        id: "containment".to_string(),
                        name: "Immediate Containment".to_string(),
                        action_type: ActionType::Containment,
                        parameters: HashMap::from([
                            ("isolate_endpoints".to_string(), serde_json::Value::Bool(true)),
                            ("block_network_traffic".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::minutes(15),
                        required: true,
                    },
                    PlaybookStep {
                        id: "analysis".to_string(),
                        name: "Malware Analysis".to_string(),
                        action_type: ActionType::Investigation,
                        parameters: HashMap::from([
                            ("collect_samples".to_string(), serde_json::Value::Bool(true)),
                            ("behavioral_analysis".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(2),
                        required: false,
                    },
                    PlaybookStep {
                        id: "eradication".to_string(),
                        name: "Malware Eradication".to_string(),
                        action_type: ActionType::Eradication,
                        parameters: HashMap::from([
                            ("remove_malware".to_string(), serde_json::Value::Bool(true)),
                            ("patch_vulnerabilities".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(4),
                        required: true,
                    },
                    PlaybookStep {
                        id: "recovery".to_string(),
                        name: "System Recovery".to_string(),
                        action_type: ActionType::Recovery,
                        parameters: HashMap::from([
                            ("restore_from_backup".to_string(), serde_json::Value::Bool(true)),
                            ("verify_integrity".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(8),
                        required: true,
                    },
                ],
                severity_mapping: HashMap::from([
                    (Severity::Critical, vec!["containment".to_string(), "analysis".to_string(), "eradication".to_string(), "recovery".to_string()]),
                    (Severity::High, vec!["containment".to_string(), "analysis".to_string(), "eradication".to_string()]),
                    (Severity::Medium, vec!["analysis".to_string(), "eradication".to_string()]),
                ]),
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            ResponsePlaybook {
                id: "data_breach_response".to_string(),
                name: "Data Breach Response".to_string(),
                description: "Response playbook for data breach incidents".to_string(),
                trigger_conditions: vec![
                    PlaybookTrigger {
                        condition_type: "tags".to_string(),
                        operator: "contains_any".to_string(),
                        value: "data_breach,exfiltration,leak".to_string(),
                    },
                    PlaybookTrigger {
                        condition_type: "severity".to_string(),
                        operator: "greater_than_or_equal".to_string(),
                        value: "high".to_string(),
                    },
                ],
                steps: vec![
                    PlaybookStep {
                        id: "immediate_assessment".to_string(),
                        name: "Immediate Assessment".to_string(),
                        action_type: ActionType::Investigation,
                        parameters: HashMap::from([
                            ("identify_affected_data".to_string(), serde_json::Value::Bool(true)),
                            ("assess_exposure_scope".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::minutes(30),
                        required: true,
                    },
                    PlaybookStep {
                        id: "legal_notification".to_string(),
                        name: "Legal Team Notification".to_string(),
                        action_type: ActionType::Notification,
                        parameters: HashMap::from([
                            ("notify_legal_team".to_string(), serde_json::Value::Bool(true)),
                            ("prepare_compliance_report".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(1),
                        required: true,
                    },
                    PlaybookStep {
                        id: "containment_and_preservation".to_string(),
                        name: "Evidence Preservation".to_string(),
                        action_type: ActionType::Containment,
                        parameters: HashMap::from([
                            ("preserve_evidence".to_string(), serde_json::Value::Bool(true)),
                            ("secure_affected_systems".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(2),
                        required: true,
                    },
                ],
                severity_mapping: HashMap::from([
                    (Severity::Critical, vec!["immediate_assessment".to_string(), "legal_notification".to_string(), "containment_and_preservation".to_string()]),
                    (Severity::High, vec!["immediate_assessment".to_string(), "legal_notification".to_string(), "containment_and_preservation".to_string()]),
                ]),
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
            ResponsePlaybook {
                id: "network_intrusion_response".to_string(),
                name: "Network Intrusion Response".to_string(),
                description: "Response for network-based intrusions".to_string(),
                trigger_conditions: vec![
                    PlaybookTrigger {
                        condition_type: "ioc_type".to_string(),
                        operator: "equals_any".to_string(),
                        value: "ip,domain,url".to_string(),
                    },
                    PlaybookTrigger {
                        condition_type: "tags".to_string(),
                        operator: "contains".to_string(),
                        value: "intrusion".to_string(),
                    },
                ],
                steps: vec![
                    PlaybookStep {
                        id: "network_isolation".to_string(),
                        name: "Network Isolation".to_string(),
                        action_type: ActionType::Containment,
                        parameters: HashMap::from([
                            ("block_malicious_ips".to_string(), serde_json::Value::Bool(true)),
                            ("isolate_compromised_hosts".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::minutes(10),
                        required: true,
                    },
                    PlaybookStep {
                        id: "traffic_analysis".to_string(),
                        name: "Network Traffic Analysis".to_string(),
                        action_type: ActionType::Investigation,
                        parameters: HashMap::from([
                            ("analyze_network_logs".to_string(), serde_json::Value::Bool(true)),
                            ("identify_lateral_movement".to_string(), serde_json::Value::Bool(true)),
                        ]),
                        timeout: Duration::hours(3),
                        required: false,
                    },
                ],
                severity_mapping: HashMap::from([
                    (Severity::Critical, vec!["network_isolation".to_string(), "traffic_analysis".to_string()]),
                    (Severity::High, vec!["network_isolation".to_string(), "traffic_analysis".to_string()]),
                    (Severity::Medium, vec!["network_isolation".to_string()]),
                ]),
                created_at: Utc::now(),
                updated_at: Utc::now(),
                enabled: true,
            },
        ];

        let mut playbooks = self.playbooks.write().await;
        for playbook in default_playbooks {
            playbooks.insert(playbook.id.clone(), playbook);
        }

        Ok(())
    }

    /// Trigger incident response based on IOC
    pub async fn trigger_response(&self, ioc: &IOC, analyst: &str) -> Result<String, IOCError> {
        // Find matching playbooks
        let matching_playbooks = self.find_matching_playbooks(ioc).await?;
        
        if matching_playbooks.is_empty() {
            return Err(IOCError::Processing("No matching playbooks found for this IOC".to_string()));
        }

        // Create incident
        let incident_id = Uuid::new_v4().to_string();
        let incident = SecurityIncident {
            id: incident_id.clone(),
            title: format!("Security Incident - {}", ioc.value),
            description: format!("Automated incident response triggered by IOC: {}", ioc.value),
            severity: ioc.severity.clone(),
            status: IncidentStatus::Open,
            ioc_ids: vec![ioc.id.to_string()],
            assigned_analyst: analyst.to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            timeline: vec![
                IncidentTimelineEntry {
                    timestamp: Utc::now(),
                    event_type: "incident_created".to_string(),
                    description: "Incident automatically created from IOC detection".to_string(),
                    actor: "system".to_string(),
                },
            ],
            metadata: HashMap::from([
                ("trigger_ioc".to_string(), serde_json::Value::String(ioc.id.to_string())),
                ("auto_created".to_string(), serde_json::Value::Bool(true)),
            ]),
        };

        // Store incident
        {
            let mut incidents = self.incidents.write().await;
            incidents.insert(incident_id.clone(), incident);
        }

        // Execute the highest priority playbook
        let primary_playbook = &matching_playbooks[0];
        self.execute_playbook(&incident_id, primary_playbook, ioc).await?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_incidents += 1;
            stats.automated_responses += 1;
            stats.last_incident_time = Some(Utc::now());
        }

        Ok(incident_id)
    }

    /// Find playbooks that match the given IOC
    async fn find_matching_playbooks(&self, ioc: &IOC) -> Result<Vec<ResponsePlaybook>, IOCError> {
        let playbooks = self.playbooks.read().await;
        let mut matching = Vec::new();

        for playbook in playbooks.values() {
            if !playbook.enabled {
                continue;
            }

            let mut matches = true;
            for trigger in &playbook.trigger_conditions {
                if !self.evaluate_trigger(trigger, ioc)? {
                    matches = false;
                    break;
                }
            }

            if matches {
                matching.push(playbook.clone());
            }
        }

        // Sort by severity mapping (most comprehensive first)
        matching.sort_by(|a, b| {
            let a_steps = a.severity_mapping.get(&ioc.severity).map(|s| s.len()).unwrap_or(0);
            let b_steps = b.severity_mapping.get(&ioc.severity).map(|s| s.len()).unwrap_or(0);
            b_steps.cmp(&a_steps)
        });

        Ok(matching)
    }

    /// Evaluate a trigger condition against an IOC
    fn evaluate_trigger(&self, trigger: &PlaybookTrigger, ioc: &IOC) -> Result<bool, IOCError> {
        let field_value = match trigger.condition_type.as_str() {
            "ioc_type" => format!("{:?}", ioc.indicator_type).to_lowercase(),
            "severity" => format!("{:?}", ioc.severity).to_lowercase(),
            "tags" => ioc.tags.join(","),
            "confidence" => ioc.confidence.to_string(),
            "source" => ioc.source.clone(),
            _ => return Ok(false),
        };

        let result = match trigger.operator.as_str() {
            "equals" => field_value == trigger.value,
            "equals_any" => {
                let values: Vec<&str> = trigger.value.split(',').collect();
                values.iter().any(|v| field_value == v.trim())
            }
            "contains" => field_value.contains(&trigger.value),
            "contains_any" => {
                let values: Vec<&str> = trigger.value.split(',').collect();
                values.iter().any(|v| field_value.contains(v.trim()))
            }
            "greater_than_or_equal" => {
                if trigger.condition_type == "severity" {
                    self.severity_meets_threshold(&ioc.severity, &trigger.value)
                } else if let (Ok(field_num), Ok(trigger_num)) = (field_value.parse::<f64>(), trigger.value.parse::<f64>()) {
                    field_num >= trigger_num
                } else {
                    false
                }
            }
            _ => false,
        };

        Ok(result)
    }

    /// Check if severity meets or exceeds threshold
    fn severity_meets_threshold(&self, severity: &Severity, threshold: &str) -> bool {
        let threshold_level = match threshold.to_lowercase().as_str() {
            "low" => 0,
            "medium" => 1,
            "high" => 2,
            "critical" => 3,
            _ => return false,
        };

        let severity_level = match severity {
            Severity::Low => 0,
            Severity::Medium => 1,
            Severity::High => 2,
            Severity::Critical => 3,
        };

        severity_level >= threshold_level
    }

    /// Execute a response playbook
    async fn execute_playbook(&self, incident_id: &str, playbook: &ResponsePlaybook, ioc: &IOC) -> Result<(), IOCError> {
        let applicable_steps = playbook.severity_mapping
            .get(&ioc.severity)
            .cloned()
            .unwrap_or_else(|| playbook.steps.iter().map(|s| s.id.clone()).collect());

        for step_id in applicable_steps {
            if let Some(step) = playbook.steps.iter().find(|s| s.id == step_id) {
                let action_result = self.execute_playbook_step(incident_id, step, ioc).await?;
                
                // Update incident timeline
                self.update_incident_timeline(incident_id, &format!("Executed step: {}", step.name), "system").await?;

                // Store action result
                {
                    let mut actions = self.response_actions.write().await;
                    actions.insert(action_result.id.clone(), action_result);
                }
            }
        }

        Ok(())
    }

    /// Execute a single playbook step
    async fn execute_playbook_step(&self, incident_id: &str, step: &PlaybookStep, ioc: &IOC) -> Result<ResponseAction, IOCError> {
        let action_id = Uuid::new_v4().to_string();
        let start_time = Utc::now();

        // Simulate action execution based on type
        let (result, details) = match step.action_type {
            ActionType::Containment => {
                ("success".to_string(), "Containment actions executed successfully".to_string())
            }
            ActionType::Investigation => {
                ("success".to_string(), "Investigation procedures initiated".to_string())
            }
            ActionType::Eradication => {
                ("success".to_string(), "Eradication measures deployed".to_string())
            }
            ActionType::Recovery => {
                ("success".to_string(), "Recovery procedures initiated".to_string())
            }
            ActionType::Notification => {
                ("success".to_string(), "Notifications sent to relevant parties".to_string())
            }
            ActionType::Documentation => {
                ("success".to_string(), "Documentation updated".to_string())
            }
        };

        let end_time = Utc::now();
        let duration = end_time - start_time;

        Ok(ResponseAction {
            id: action_id,
            incident_id: incident_id.to_string(),
            step_id: step.id.clone(),
            action_type: step.action_type.clone(),
            status: ActionStatus::Completed,
            result: result,
            details: details,
            executed_at: start_time,
            duration: duration.num_milliseconds(),
            metadata: step.parameters.clone(),
        })
    }

    /// Update incident timeline
    async fn update_incident_timeline(&self, incident_id: &str, description: &str, actor: &str) -> Result<(), IOCError> {
        let mut incidents = self.incidents.write().await;
        if let Some(incident) = incidents.get_mut(incident_id) {
            incident.timeline.push(IncidentTimelineEntry {
                timestamp: Utc::now(),
                event_type: "action_executed".to_string(),
                description: description.to_string(),
                actor: actor.to_string(),
            });
            incident.updated_at = Utc::now();
        }
        Ok(())
    }

    /// Get incident details
    pub async fn get_incident(&self, incident_id: &str) -> Result<Option<SecurityIncident>, IOCError> {
        let incidents = self.incidents.read().await;
        Ok(incidents.get(incident_id).cloned())
    }

    /// List recent incidents
    pub async fn list_incidents(&self, limit: usize) -> Result<Vec<SecurityIncident>, IOCError> {
        let incidents = self.incidents.read().await;
        let mut sorted_incidents: Vec<_> = incidents.values().cloned().collect();
        sorted_incidents.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(sorted_incidents.into_iter().take(limit).collect())
    }

    /// Close an incident
    pub async fn close_incident(&self, incident_id: &str, analyst: &str, resolution: &str) -> Result<(), IOCError> {
        let mut incidents = self.incidents.write().await;
        if let Some(incident) = incidents.get_mut(incident_id) {
            incident.status = IncidentStatus::Closed;
            incident.updated_at = Utc::now();
            incident.timeline.push(IncidentTimelineEntry {
                timestamp: Utc::now(),
                event_type: "incident_closed".to_string(),
                description: resolution.to_string(),
                actor: analyst.to_string(),
            });

            // Update statistics
            let mut stats = self.statistics.write().await;
            stats.closed_incidents += 1;
        }
        Ok(())
    }

    /// Get response statistics
    pub async fn get_statistics(&self) -> IncidentResponseStats {
        self.statistics.read().await.clone()
    }

    /// Get health status
    pub async fn get_health(&self) -> ComponentHealth {
        let stats = self.statistics.read().await;
        let playbooks = self.playbooks.read().await;
        let incidents = self.incidents.read().await;

        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Incident response engine operational with {} playbooks", playbooks.len()),
            last_check: Utc::now(),
            metrics: HashMap::from([
                ("total_playbooks".to_string(), playbooks.len() as f64),
                ("total_incidents".to_string(), stats.total_incidents as f64),
                ("open_incidents".to_string(), incidents.values()
                    .filter(|i| i.status == IncidentStatus::Open)
                    .count() as f64),
                ("automation_rate".to_string(), if stats.total_incidents > 0 {
                    stats.automated_responses as f64 / stats.total_incidents as f64
                } else { 0.0 }),
            ]),
        }
    }
}

/// Response playbook definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponsePlaybook {
    pub id: String,
    pub name: String,
    pub description: String,
    pub trigger_conditions: Vec<PlaybookTrigger>,
    pub steps: Vec<PlaybookStep>,
    pub severity_mapping: HashMap<Severity, Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub enabled: bool,
}

/// Playbook trigger condition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookTrigger {
    pub condition_type: String,
    pub operator: String,
    pub value: String,
}

/// Playbook step definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookStep {
    pub id: String,
    pub name: String,
    pub action_type: ActionType,
    pub parameters: HashMap<String, serde_json::Value>,
    pub timeout: Duration,
    pub required: bool,
}

/// Response action types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    Containment,
    Investigation,
    Eradication,
    Recovery,
    Notification,
    Documentation,
}

/// Security incident
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityIncident {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: Severity,
    pub status: IncidentStatus,
    pub ioc_ids: Vec<String>,
    pub assigned_analyst: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub timeline: Vec<IncidentTimelineEntry>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Incident status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum IncidentStatus {
    Open,
    InProgress,
    Resolved,
    Closed,
}

/// Incident timeline entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentTimelineEntry {
    pub timestamp: DateTime<Utc>,
    pub event_type: String,
    pub description: String,
    pub actor: String,
}

/// Response action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseAction {
    pub id: String,
    pub incident_id: String,
    pub step_id: String,
    pub action_type: ActionType,
    pub status: ActionStatus,
    pub result: String,
    pub details: String,
    pub executed_at: DateTime<Utc>,
    pub duration: i64, // milliseconds
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Action status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

/// Incident response statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct IncidentResponseStats {
    pub total_incidents: u64,
    pub open_incidents: u64,
    pub closed_incidents: u64,
    pub automated_responses: u64,
    pub manual_responses: u64,
    pub average_response_time: f64, // minutes
    pub last_incident_time: Option<DateTime<Utc>>,
}