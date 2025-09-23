//! Incident Response Planner Module
//! Advanced incident response planning capabilities

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentResponseResult {
    pub plan_id: String,
    pub timestamp: DateTime<Utc>,
    pub incident_type: IncidentType,
    pub severity_level: SeverityLevel,
    pub response_phases: Vec<ResponsePhase>,
    pub resource_assignments: Vec<ResourceAssignment>,
    pub timeline: ResponseTimeline,
    pub communication_plan: CommunicationPlan,
    pub escalation_triggers: Vec<EscalationTrigger>,
    pub success_metrics: Vec<SuccessMetric>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IncidentType {
    Malware,
    DataBreach,
    DenialOfService,
    UnauthorizedAccess,
    Phishing,
    Ransomware,
    InsiderThreat,
    SupplyChainAttack,
    AdvancedPersistentThreat,
    SystemCompromise,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SeverityLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponsePhase {
    pub phase_name: String,
    pub phase_order: u32,
    pub estimated_duration: Duration,
    pub required_resources: Vec<String>,
    pub activities: Vec<ResponseActivity>,
    pub success_criteria: Vec<String>,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseActivity {
    pub activity_id: String,
    pub activity_name: String,
    pub description: String,
    pub assigned_role: String,
    pub estimated_time: Duration,
    pub required_tools: Vec<String>,
    pub output_artifacts: Vec<String>,
    pub is_automated: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceAssignment {
    pub resource_id: String,
    pub resource_type: ResourceType,
    pub assigned_to: String,
    pub role: String,
    pub availability_window: Vec<TimeWindow>,
    pub skills: Vec<String>,
    pub contact_info: ContactInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResourceType {
    Human,
    Technical,
    External,
    Legal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeWindow {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub availability_type: AvailabilityType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AvailabilityType {
    OnCall,
    BusinessHours,
    Emergency,
    Scheduled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContactInfo {
    pub primary_phone: String,
    pub email: String,
    pub secondary_phone: Option<String>,
    pub emergency_contact: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseTimeline {
    pub total_estimated_time: Duration,
    pub critical_milestones: Vec<Milestone>,
    pub phase_transitions: Vec<PhaseTransition>,
    pub checkpoint_intervals: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Milestone {
    pub milestone_id: String,
    pub milestone_name: String,
    pub target_time: Duration,
    pub description: String,
    pub success_criteria: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseTransition {
    pub from_phase: String,
    pub to_phase: String,
    pub transition_criteria: Vec<String>,
    pub required_approvals: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunicationPlan {
    pub internal_stakeholders: Vec<Stakeholder>,
    pub external_stakeholders: Vec<Stakeholder>,
    pub communication_templates: Vec<CommunicationTemplate>,
    pub escalation_matrix: Vec<EscalationLevel>,
    pub update_frequency: HashMap<String, Duration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stakeholder {
    pub stakeholder_id: String,
    pub name: String,
    pub role: String,
    pub notification_methods: Vec<NotificationMethod>,
    pub escalation_level: u32,
    pub information_sensitivity: InformationSensitivity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationMethod {
    Email,
    Phone,
    SMS,
    Slack,
    Dashboard,
    InPerson,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InformationSensitivity {
    Public,
    Internal,
    Confidential,
    Restricted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommunicationTemplate {
    pub template_id: String,
    pub template_name: String,
    pub audience: String,
    pub message_type: MessageType,
    pub content_template: String,
    pub required_approvals: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    InitialNotification,
    StatusUpdate,
    Escalation,
    Resolution,
    PostIncident,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationTrigger {
    pub trigger_id: String,
    pub trigger_name: String,
    pub conditions: Vec<EscalationCondition>,
    pub escalation_action: EscalationAction,
    pub time_threshold: Option<Duration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationCondition {
    pub condition_type: String,
    pub operator: String,
    pub threshold_value: String,
    pub measurement_metric: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationAction {
    pub action_type: String,
    pub target_roles: Vec<String>,
    pub notification_channels: Vec<NotificationMethod>,
    pub automated_actions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EscalationLevel {
    pub level: u32,
    pub level_name: String,
    pub target_audience: Vec<String>,
    pub information_detail_level: InformationSensitivity,
    pub response_time_requirement: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuccessMetric {
    pub metric_id: String,
    pub metric_name: String,
    pub description: String,
    pub target_value: f64,
    pub measurement_unit: String,
    pub collection_method: String,
}

pub struct IncidentResponsePlanner {
    response_plans: Vec<IncidentResponseResult>,
    template_library: HashMap<IncidentType, ResponseTemplate>,
    resource_pool: HashMap<String, AvailableResource>,
    historical_data: Vec<HistoricalIncident>,
    config: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseTemplate {
    pub template_id: String,
    pub incident_type: IncidentType,
    pub base_phases: Vec<ResponsePhase>,
    pub required_roles: Vec<String>,
    pub estimated_complexity: f64,
    pub customization_options: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableResource {
    pub resource_id: String,
    pub name: String,
    pub resource_type: ResourceType,
    pub skills: Vec<String>,
    pub availability_schedule: Vec<TimeWindow>,
    pub current_assignments: Vec<String>,
    pub capacity_rating: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoricalIncident {
    pub incident_id: String,
    pub incident_type: IncidentType,
    pub severity: SeverityLevel,
    pub actual_duration: Duration,
    pub resources_used: Vec<String>,
    pub lessons_learned: Vec<String>,
    pub effectiveness_rating: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncidentPlanningRequest {
    pub incident_type: IncidentType,
    pub severity_level: SeverityLevel,
    pub affected_systems: Vec<String>,
    pub business_impact: BusinessImpact,
    pub regulatory_requirements: Vec<String>,
    pub available_resources: Vec<String>,
    pub time_constraints: Option<Duration>,
    pub special_considerations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BusinessImpact {
    pub financial_impact: f64,
    pub operational_impact: String,
    pub reputational_impact: String,
    pub customer_impact: u32,
    pub regulatory_impact: Vec<String>,
}

impl IncidentResponsePlanner {
    pub fn new() -> Self {
        let mut planner = Self {
            response_plans: Vec::new(),
            template_library: HashMap::new(),
            resource_pool: HashMap::new(),
            historical_data: Vec::new(),
            config: HashMap::new(),
        };
        
        planner.initialize_templates();
        planner.initialize_resource_pool();
        planner
    }

    fn initialize_templates(&mut self) {
        // Malware Incident Template
        let malware_template = ResponseTemplate {
            template_id: "malware_response".to_string(),
            incident_type: IncidentType::Malware,
            base_phases: vec![
                ResponsePhase {
                    phase_name: "Detection & Analysis".to_string(),
                    phase_order: 1,
                    estimated_duration: Duration::hours(2),
                    required_resources: vec!["SOC Analyst", "Malware Analyst"].into_iter().map(|s| s.to_string()).collect(),
                    activities: vec![
                        ResponseActivity {
                            activity_id: "MA001".to_string(),
                            activity_name: "Initial Triage".to_string(),
                            description: "Assess scope and severity of malware infection".to_string(),
                            assigned_role: "SOC Analyst".to_string(),
                            estimated_time: Duration::minutes(30),
                            required_tools: vec!["SIEM", "EDR Console"].into_iter().map(|s| s.to_string()).collect(),
                            output_artifacts: vec!["Initial Assessment Report"].into_iter().map(|s| s.to_string()).collect(),
                            is_automated: false,
                        },
                    ],
                    success_criteria: vec!["Malware identified and classified".to_string()],
                    dependencies: vec![],
                },
                ResponsePhase {
                    phase_name: "Containment".to_string(),
                    phase_order: 2,
                    estimated_duration: Duration::hours(1),
                    required_resources: vec!["Security Engineer", "Network Administrator"].into_iter().map(|s| s.to_string()).collect(),
                    activities: vec![
                        ResponseActivity {
                            activity_id: "MA002".to_string(),
                            activity_name: "System Isolation".to_string(),
                            description: "Isolate infected systems from network".to_string(),
                            assigned_role: "Security Engineer".to_string(),
                            estimated_time: Duration::minutes(15),
                            required_tools: vec!["Network Management Tools", "EDR"].into_iter().map(|s| s.to_string()).collect(),
                            output_artifacts: vec!["Isolation Log"].into_iter().map(|s| s.to_string()).collect(),
                            is_automated: true,
                        },
                    ],
                    success_criteria: vec!["Infected systems isolated".to_string()],
                    dependencies: vec!["Detection & Analysis".to_string()],
                },
            ],
            required_roles: vec!["SOC Analyst", "Security Engineer", "Malware Analyst"].into_iter().map(|s| s.to_string()).collect(),
            estimated_complexity: 0.7,
            customization_options: vec!["Add forensic analysis", "Include legal review"].into_iter().map(|s| s.to_string()).collect(),
        };

        self.template_library.insert(IncidentType::Malware, malware_template);

        // Data Breach Template
        let breach_template = ResponseTemplate {
            template_id: "data_breach_response".to_string(),
            incident_type: IncidentType::DataBreach,
            base_phases: vec![
                ResponsePhase {
                    phase_name: "Immediate Response".to_string(),
                    phase_order: 1,
                    estimated_duration: Duration::hours(4),
                    required_resources: vec!["Incident Commander", "Legal Counsel", "PR Manager"].into_iter().map(|s| s.to_string()).collect(),
                    activities: vec![
                        ResponseActivity {
                            activity_id: "DB001".to_string(),
                            activity_name: "Breach Assessment".to_string(),
                            description: "Determine scope and impact of data breach".to_string(),
                            assigned_role: "Incident Commander".to_string(),
                            estimated_time: Duration::hours(1),
                            required_tools: vec!["Data Discovery Tools", "Database Logs"].into_iter().map(|s| s.to_string()).collect(),
                            output_artifacts: vec!["Breach Impact Assessment"].into_iter().map(|s| s.to_string()).collect(),
                            is_automated: false,
                        },
                    ],
                    success_criteria: vec!["Breach scope determined"].into_iter().map(|s| s.to_string()).collect(),
                    dependencies: vec![],
                },
            ],
            required_roles: vec!["Incident Commander", "Legal Counsel", "PR Manager", "Forensics Specialist"].into_iter().map(|s| s.to_string()).collect(),
            estimated_complexity: 0.9,
            customization_options: vec!["Regulatory notification", "Customer communication"].into_iter().map(|s| s.to_string()).collect(),
        };

        self.template_library.insert(IncidentType::DataBreach, breach_template);
    }

    fn initialize_resource_pool(&mut self) {
        let resources = vec![
            AvailableResource {
                resource_id: "RES001".to_string(),
                name: "John Smith".to_string(),
                resource_type: ResourceType::Human,
                skills: vec!["Incident Response", "Malware Analysis", "Digital Forensics"].into_iter().map(|s| s.to_string()).collect(),
                availability_schedule: vec![
                    TimeWindow {
                        start_time: Utc::now(),
                        end_time: Utc::now() + Duration::hours(8),
                        availability_type: AvailabilityType::BusinessHours,
                    },
                ],
                current_assignments: vec![],
                capacity_rating: 0.8,
            },
            AvailableResource {
                resource_id: "RES002".to_string(),
                name: "Sarah Johnson".to_string(),
                resource_type: ResourceType::Human,
                skills: vec!["Legal Compliance", "Data Protection", "Regulatory Affairs"].into_iter().map(|s| s.to_string()).collect(),
                availability_schedule: vec![
                    TimeWindow {
                        start_time: Utc::now(),
                        end_time: Utc::now() + Duration::hours(24),
                        availability_type: AvailabilityType::OnCall,
                    },
                ],
                current_assignments: vec![],
                capacity_rating: 0.9,
            },
        ];

        for resource in resources {
            self.resource_pool.insert(resource.resource_id.clone(), resource);
        }
    }

    pub fn create_response_plan(&mut self, request: IncidentPlanningRequest) -> IncidentResponseResult {
        let plan_id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let template = self.select_template(&request.incident_type, &request.severity_level);
        let customized_phases = self.customize_phases(&template, &request);
        let resource_assignments = self.assign_resources(&customized_phases, &request);
        let timeline = self.calculate_timeline(&customized_phases, &request);
        let communication_plan = self.create_communication_plan(&request);
        let escalation_triggers = self.define_escalation_triggers(&request);
        let success_metrics = self.define_success_metrics(&request);
        let recommendations = self.generate_recommendations(&request, &timeline);

        let result = IncidentResponseResult {
            plan_id: plan_id.clone(),
            timestamp,
            incident_type: request.incident_type.clone(),
            severity_level: request.severity_level.clone(),
            response_phases: customized_phases,
            resource_assignments,
            timeline,
            communication_plan,
            escalation_triggers,
            success_metrics,
            recommendations,
        };

        self.response_plans.push(result.clone());
        result
    }

    fn select_template(&self, incident_type: &IncidentType, severity: &SeverityLevel) -> ResponseTemplate {
        self.template_library.get(incident_type)
            .cloned()
            .unwrap_or_else(|| self.create_generic_template(incident_type.clone(), severity))
    }

    fn create_generic_template(&self, incident_type: IncidentType, _severity: &SeverityLevel) -> ResponseTemplate {
        ResponseTemplate {
            template_id: "generic_response".to_string(),
            incident_type,
            base_phases: vec![
                ResponsePhase {
                    phase_name: "Initial Response".to_string(),
                    phase_order: 1,
                    estimated_duration: Duration::hours(2),
                    required_resources: vec!["Incident Commander".to_string()],
                    activities: vec![],
                    success_criteria: vec!["Incident contained".to_string()],
                    dependencies: vec![],
                },
            ],
            required_roles: vec!["Incident Commander".to_string()],
            estimated_complexity: 0.5,
            customization_options: vec![],
        }
    }

    fn customize_phases(&self, template: &ResponseTemplate, request: &IncidentPlanningRequest) -> Vec<ResponsePhase> {
        let mut phases = template.base_phases.clone();

        // Adjust phases based on severity
        match request.severity_level {
            SeverityLevel::Critical => {
                // Add additional coordination phase for critical incidents
                phases.insert(0, ResponsePhase {
                    phase_name: "Emergency Coordination".to_string(),
                    phase_order: 0,
                    estimated_duration: Duration::minutes(30),
                    required_resources: vec!["Incident Commander", "Senior Leadership"].into_iter().map(|s| s.to_string()).collect(),
                    activities: vec![],
                    success_criteria: vec!["Leadership notified and coordinated".to_string()],
                    dependencies: vec![],
                });
            },
            _ => {},
        }

        // Add regulatory compliance phase if required
        if !request.regulatory_requirements.is_empty() {
            phases.push(ResponsePhase {
                phase_name: "Regulatory Compliance".to_string(),
                phase_order: phases.len() as u32 + 1,
                estimated_duration: Duration::hours(8),
                required_resources: vec!["Legal Counsel", "Compliance Officer"].into_iter().map(|s| s.to_string()).collect(),
                activities: vec![],
                success_criteria: vec!["Regulatory requirements addressed".to_string()],
                dependencies: vec!["Containment".to_string()],
            });
        }

        phases
    }

    fn assign_resources(&self, phases: &[ResponsePhase], _request: &IncidentPlanningRequest) -> Vec<ResourceAssignment> {
        let mut assignments = Vec::new();
        
        for phase in phases {
            for required_resource in &phase.required_resources {
                if let Some(available_resource) = self.find_available_resource(required_resource) {
                    assignments.push(ResourceAssignment {
                        resource_id: available_resource.resource_id.clone(),
                        resource_type: available_resource.resource_type.clone(),
                        assigned_to: phase.phase_name.clone(),
                        role: required_resource.clone(),
                        availability_window: available_resource.availability_schedule.clone(),
                        skills: available_resource.skills.clone(),
                        contact_info: ContactInfo {
                            primary_phone: "+1-555-0100".to_string(),
                            email: format!("{}@company.com", available_resource.name.to_lowercase().replace(' ', ".")),
                            secondary_phone: None,
                            emergency_contact: Some("+1-555-0911".to_string()),
                        },
                    });
                }
            }
        }

        assignments
    }

    fn find_available_resource(&self, required_role: &str) -> Option<&AvailableResource> {
        self.resource_pool.values()
            .find(|resource| resource.skills.iter().any(|skill| 
                skill.to_lowercase().contains(&required_role.to_lowercase()) ||
                required_role.to_lowercase().contains(&skill.to_lowercase())
            ))
    }

    fn calculate_timeline(&self, phases: &[ResponsePhase], request: &IncidentPlanningRequest) -> ResponseTimeline {
        let total_time = phases.iter()
            .map(|phase| phase.estimated_duration)
            .fold(Duration::zero(), |acc, duration| acc + duration);

        let severity_multiplier = match request.severity_level {
            SeverityLevel::Critical => 0.7, // Faster response required
            SeverityLevel::High => 0.8,
            SeverityLevel::Medium => 1.0,
            SeverityLevel::Low => 1.2,
        };

        let adjusted_total_time = Duration::seconds((total_time.num_seconds() as f64 * severity_multiplier) as i64);

        let milestones = vec![
            Milestone {
                milestone_id: "M001".to_string(),
                milestone_name: "Initial Response Activated".to_string(),
                target_time: Duration::minutes(15),
                description: "Incident response team activated and initial assessment completed".to_string(),
                success_criteria: vec!["Response team notified", "Initial triage completed"].into_iter().map(|s| s.to_string()).collect(),
            },
            Milestone {
                milestone_id: "M002".to_string(),
                milestone_name: "Containment Achieved".to_string(),
                target_time: Duration::hours(2),
                description: "Incident contained to prevent further damage".to_string(),
                success_criteria: vec!["Threat contained", "Spread prevented"].into_iter().map(|s| s.to_string()).collect(),
            },
        ];

        ResponseTimeline {
            total_estimated_time: adjusted_total_time,
            critical_milestones: milestones,
            phase_transitions: vec![],
            checkpoint_intervals: Duration::minutes(30),
        }
    }

    fn create_communication_plan(&self, request: &IncidentPlanningRequest) -> CommunicationPlan {
        let mut internal_stakeholders = vec![
            Stakeholder {
                stakeholder_id: "STK001".to_string(),
                name: "Security Team".to_string(),
                role: "Technical Response".to_string(),
                notification_methods: vec![NotificationMethod::Email, NotificationMethod::Slack],
                escalation_level: 1,
                information_sensitivity: InformationSensitivity::Internal,
            },
        ];

        // Add executive stakeholders for high/critical incidents
        if matches!(request.severity_level, SeverityLevel::High | SeverityLevel::Critical) {
            internal_stakeholders.push(Stakeholder {
                stakeholder_id: "STK002".to_string(),
                name: "Executive Leadership".to_string(),
                role: "Strategic Oversight".to_string(),
                notification_methods: vec![NotificationMethod::Phone, NotificationMethod::Email],
                escalation_level: 3,
                information_sensitivity: InformationSensitivity::Confidential,
            });
        }

        CommunicationPlan {
            internal_stakeholders,
            external_stakeholders: vec![],
            communication_templates: vec![],
            escalation_matrix: vec![],
            update_frequency: HashMap::from([
                ("internal".to_string(), Duration::hours(2)),
                ("executive".to_string(), Duration::hours(4)),
            ]),
        }
    }

    fn define_escalation_triggers(&self, request: &IncidentPlanningRequest) -> Vec<EscalationTrigger> {
        vec![
            EscalationTrigger {
                trigger_id: "ESC001".to_string(),
                trigger_name: "Time-based Escalation".to_string(),
                conditions: vec![
                    EscalationCondition {
                        condition_type: "time_elapsed".to_string(),
                        operator: "greater_than".to_string(),
                        threshold_value: "4".to_string(),
                        measurement_metric: "hours".to_string(),
                    },
                ],
                escalation_action: EscalationAction {
                    action_type: "notify_management".to_string(),
                    target_roles: vec!["Senior Management".to_string()],
                    notification_channels: vec![NotificationMethod::Phone, NotificationMethod::Email],
                    automated_actions: vec!["Create executive summary".to_string()],
                },
                time_threshold: Some(Duration::hours(4)),
            },
        ]
    }

    fn define_success_metrics(&self, _request: &IncidentPlanningRequest) -> Vec<SuccessMetric> {
        vec![
            SuccessMetric {
                metric_id: "MET001".to_string(),
                metric_name: "Time to Containment".to_string(),
                description: "Time elapsed from detection to containment".to_string(),
                target_value: 120.0,
                measurement_unit: "minutes".to_string(),
                collection_method: "Automated timestamp tracking".to_string(),
            },
            SuccessMetric {
                metric_id: "MET002".to_string(),
                metric_name: "Systems Restored".to_string(),
                description: "Percentage of affected systems restored to normal operation".to_string(),
                target_value: 100.0,
                measurement_unit: "percentage".to_string(),
                collection_method: "System monitoring dashboard".to_string(),
            },
        ]
    }

    fn generate_recommendations(&self, request: &IncidentPlanningRequest, timeline: &ResponseTimeline) -> Vec<String> {
        let mut recommendations = Vec::new();

        if timeline.total_estimated_time > Duration::hours(8) {
            recommendations.push("Consider implementing additional automation to reduce response time".to_string());
        }

        if matches!(request.severity_level, SeverityLevel::Critical) {
            recommendations.push("Activate war room for coordinated response".to_string());
        }

        if !request.regulatory_requirements.is_empty() {
            recommendations.push("Ensure legal counsel is involved from the beginning".to_string());
        }

        recommendations.push("Document all actions for post-incident review".to_string());
        recommendations.push("Prepare for potential media/customer communications".to_string());

        recommendations
    }

    pub fn get_response_plans(&self) -> &[IncidentResponseResult] {
        &self.response_plans
    }

    pub fn get_plan_by_incident_type(&self, incident_type: &IncidentType) -> Vec<&IncidentResponseResult> {
        self.response_plans.iter()
            .filter(|plan| std::mem::discriminant(&plan.incident_type) == std::mem::discriminant(incident_type))
            .collect()
    }
}

#[napi]
pub struct IncidentResponsePlannerNapi {
    inner: IncidentResponsePlanner,
}

#[napi]
impl IncidentResponsePlannerNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: IncidentResponsePlanner::new(),
        }
    }

    #[napi]
    pub fn create_response_plan(&mut self, request_json: String) -> napi::Result<String> {
        let request: IncidentPlanningRequest = serde_json::from_str(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse request: {}", e)))?;
        
        let result = self.inner.create_response_plan(request);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_response_plans(&self) -> napi::Result<String> {
        serde_json::to_string(self.inner.get_response_plans())
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_available_templates(&self) -> napi::Result<Vec<String>> {
        Ok(self.inner.template_library.keys()
            .map(|incident_type| format!("{:?}", incident_type))
            .collect())
    }

    #[napi]
    pub fn get_resource_pool(&self) -> napi::Result<String> {
        serde_json::to_string(&self.inner.resource_pool)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }
}

impl Default for IncidentResponsePlanner {
    fn default() -> Self {
        Self::new()
    }
}
