// Phantom SecOp Core - TypeScript Type Definitions
// Advanced Security Operations System Types

export enum IncidentSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum IncidentStatus {
  New = 'New',
  Assigned = 'Assigned',
  InProgress = 'InProgress',
  Investigating = 'Investigating',
  Contained = 'Contained',
  Eradicated = 'Eradicated',
  Recovering = 'Recovering',
  Closed = 'Closed',
  Reopened = 'Reopened',
}

export enum IncidentCategory {
  Malware = 'Malware',
  Phishing = 'Phishing',
  DataBreach = 'DataBreach',
  UnauthorizedAccess = 'Unauthorized Access',
  DenialOfService = 'DenialOfService',
  InsiderThreat = 'Insider Threat',
  PhysicalSecurity = 'Physical Security',
  ComplianceViolation = 'Compliance Violation',
  SystemCompromise = 'System Compromise',
  NetworkIntrusion = 'Network Intrusion',
  Other = 'Other',
}

export enum AlertPriority {
  Info = 'Info',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum AlertStatus {
  Open = 'Open',
  Acknowledged = 'Acknowledged',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed',
  FalsePositive = 'FalsePositive',
}

export enum PlaybookStatus {
  Pending = 'Pending',
  Running = 'Running',
  Paused = 'Paused',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export enum ActionType {
  Investigation = 'Investigation',
  Containment = 'Containment',
  Eradication = 'Eradication',
  Recovery = 'Recovery',
  Communication = 'Communication',
  Documentation = 'Documentation',
  Escalation = 'Escalation',
  Custom = 'Custom',
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
  Skipped = 'Skipped',
  Cancelled = 'Cancelled',
}

export enum EvidenceType {
  NetworkCapture = 'NetworkCapture',
  SystemLogs = 'SystemLogs',
  MemoryDump = 'MemoryDump',
  DiskImage = 'DiskImage',
  FileSystem = 'FileSystem',
  Registry = 'Registry',
  Email = 'Email',
  Document = 'Document',
  Screenshot = 'Screenshot',
  Other = 'Other',
}

export enum OperationalImpact {
  None = 'None',
  Minimal = 'Minimal',
  Moderate = 'Moderate',
  Significant = 'Significant',
  Severe = 'Severe',
}

export enum ReputationImpact {
  None = 'None',
  Minor = 'Minor',
  Moderate = 'Moderate',
  Major = 'Major',
  Severe = 'Severe',
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  event_type: string;
  description: string;
  actor: string;
  details: Record<string, string>;
}

export interface CustodyEntry {
  timestamp: Date;
  action: string;
  actor: string;
  location: string;
  notes: string;
}

export interface AnalysisResult {
  id: string;
  analysis_type: string;
  tool_used: string;
  analyst: string;
  timestamp: Date;
  findings: string[];
  confidence: number;
  details: Record<string, string>;
}

export interface Evidence {
  id: string;
  evidence_type: EvidenceType;
  name: string;
  description: string;
  source: string;
  collected_at: Date;
  collected_by: string;
  file_path?: string;
  file_hash?: string;
  file_size?: number;
  chain_of_custody: CustodyEntry[];
  analysis_results: AnalysisResult[];
  tags: string[];
  metadata: Record<string, string>;
}

export interface CustomerImpact {
  customers_affected: number;
  service_degradation: boolean;
  data_exposure: boolean;
  communication_required: boolean;
  compensation_required: boolean;
}

export interface DataImpact {
  data_types_affected: string[];
  records_affected: number;
  confidentiality_breach: boolean;
  integrity_compromise: boolean;
  availability_impact: boolean;
  regulatory_notification_required: boolean;
}

export interface BusinessImpact {
  financial_impact: number;
  operational_impact: OperationalImpact;
  reputation_impact: ReputationImpact;
  regulatory_impact: string[];
  customer_impact: CustomerImpact;
  service_disruption: string[];
  data_impact: DataImpact;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority_score: number;
  created_at: Date;
  updated_at: Date;
  detected_at: Date;
  assigned_to?: string;
  assigned_team?: string;
  source_system: string;
  affected_assets: string[];
  indicators: string[];
  tags: string[];
  timeline: IncidentTimelineEntry[];
  evidence: Evidence[];
  related_alerts: string[];
  related_incidents: string[];
  containment_actions: string[];
  eradication_actions: string[];
  recovery_actions: string[];
  lessons_learned: string[];
  cost_impact?: number;
  business_impact: BusinessImpact;
  compliance_impact: string[];
  metadata: Record<string, string>;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  priority: AlertPriority;
  status: AlertStatus;
  source: string;
  rule_id?: string;
  created_at: Date;
  updated_at: Date;
  first_seen: Date;
  last_seen: Date;
  count: number;
  assigned_to?: string;
  indicators: string[];
  affected_assets: string[];
  tags: string[];
  raw_data: Record<string, string>;
  enrichment_data: Record<string, string>;
  related_alerts: string[];
  incident_id?: string;
  false_positive_likelihood: number;
  confidence_score: number;
  metadata: Record<string, string>;
}

export interface TriggerCondition {
  condition_type: string;
  field: string;
  operator: string;
  value: string;
  case_sensitive: boolean;
}

export interface PlaybookAction {
  id: string;
  name: string;
  action_type: ActionType;
  description: string;
  order: number;
  required: boolean;
  timeout_seconds: number;
  retry_count: number;
  parameters: Record<string, string>;
  conditions: string[];
  on_success: string[];
  on_failure: string[];
}

export interface SecurityPlaybook {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  trigger_conditions: TriggerCondition[];
  actions: PlaybookAction[];
  approval_required: boolean;
  timeout_minutes: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  enabled: boolean;
  execution_count: number;
  success_rate: number;
  average_execution_time: number;
  tags: string[];
  metadata: Record<string, string>;
}

export interface ActionExecution {
  action_id: string;
  action_name: string;
  status: TaskStatus;
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  retry_count: number;
  output: Record<string, string>;
  error_message?: string;
}

export interface PlaybookExecution {
  id: string;
  playbook_id: string;
  playbook_name: string;
  status: PlaybookStatus;
  triggered_by: string;
  trigger_event: string;
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  actions_executed: ActionExecution[];
  success_count: number;
  failure_count: number;
  error_messages: string[];
  output_data: Record<string, string>;
  metadata: Record<string, string>;
}

export interface TaskChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: Date;
  notes?: string;
}

export interface TaskComment {
  id: string;
  author: string;
  content: string;
  created_at: Date;
  updated_at?: Date;
  attachments: string[];
}

export interface SecurityTask {
  id: string;
  title: string;
  description: string;
  task_type: string;
  priority: AlertPriority;
  status: TaskStatus;
  assigned_to?: string;
  assigned_team?: string;
  created_at: Date;
  updated_at: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  incident_id?: string;
  alert_ids: string[];
  dependencies: string[];
  checklist: TaskChecklistItem[];
  attachments: string[];
  comments: TaskComment[];
  tags: string[];
  metadata: Record<string, string>;
}

export interface IncidentMetrics {
  total_incidents: number;
  incidents_by_severity: Record<IncidentSeverity, number>;
  incidents_by_category: Record<IncidentCategory, number>;
  incidents_by_status: Record<IncidentStatus, number>;
  mean_time_to_detection: number;
  mean_time_to_response: number;
  mean_time_to_containment: number;
  mean_time_to_resolution: number;
  escalation_rate: number;
  reopened_incidents: number;
  cost_per_incident: number;
  total_cost_impact: number;
}

export interface AlertMetrics {
  total_alerts: number;
  alerts_by_priority: Record<AlertPriority, number>;
  alerts_by_source: Record<string, number>;
  false_positive_rate: number;
  alert_to_incident_ratio: number;
  mean_time_to_triage: number;
  auto_resolved_alerts: number;
  escalated_alerts: number;
}

export interface ResponseMetrics {
  playbooks_executed: number;
  automation_success_rate: number;
  manual_interventions: number;
  sla_compliance_rate: number;
  escalations: number;
  after_hours_responses: number;
}

export interface TeamMetrics {
  analysts_active: number;
  workload_distribution: Record<string, number>;
  response_times_by_analyst: Record<string, number>;
  resolution_rates: Record<string, number>;
  training_hours: number;
  certification_status: Record<string, string>;
}

export interface AutomationMetrics {
  automated_actions: number;
  automation_success_rate: number;
  time_saved_hours: number;
  cost_savings: number;
  failed_automations: number;
  manual_overrides: number;
}

export interface ComplianceMetrics {
  frameworks_monitored: string[];
  compliance_score: number;
  violations_detected: number;
  remediation_time: number;
  audit_findings: number;
  policy_exceptions: number;
}

export interface SecurityMetrics {
  period_start: Date;
  period_end: Date;
  incident_metrics: IncidentMetrics;
  alert_metrics: AlertMetrics;
  response_metrics: ResponseMetrics;
  team_metrics: TeamMetrics;
  automation_metrics: AutomationMetrics;
  compliance_metrics: ComplianceMetrics;
}

export interface ThreatIntelFeed {
  id: string;
  name: string;
  source: string;
  feed_type: string;
  last_updated: Date;
  indicators_count: number;
  confidence_level: number;
  active: boolean;
  update_frequency: string;
  cost?: number;
  tags: string[];
}

export interface RetryPolicy {
  max_attempts: number;
  delay_seconds: number;
  backoff_multiplier: number;
  max_delay_seconds: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  step_type: string;
  order: number;
  configuration: Record<string, string>;
  timeout_seconds: number;
  retry_policy: RetryPolicy;
  conditions: string[];
}

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  steps: WorkflowStep[];
  enabled: boolean;
  created_at: Date;
  last_executed?: Date;
  execution_count: number;
  success_rate: number;
}

// Search and filter interfaces
export interface IncidentSearchCriteria {
  query?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  category?: IncidentCategory;
  assigned_to?: string;
  date_range?: [Date, Date];
  tags?: string[];
  limit?: number;
}

export interface AlertSearchCriteria {
  query?: string;
  priority?: AlertPriority;
  status?: AlertStatus;
  source?: string;
  date_range?: [Date, Date];
  tags?: string[];
  limit?: number;
}

export interface TaskSearchCriteria {
  query?: string;
  status?: TaskStatus;
  priority?: AlertPriority;
  assigned_to?: string;
  task_type?: string;
  due_date_range?: [Date, Date];
  tags?: string[];
  limit?: number;
}

// Dashboard and reporting interfaces
export interface SecurityDashboard {
  active_incidents: number;
  critical_alerts: number;
  pending_tasks: number;
  automation_rate: number;
  mean_response_time: number;
  sla_compliance: number;
  recent_incidents: SecurityIncident[];
  top_alerts: SecurityAlert[];
  team_workload: Record<string, number>;
  threat_trends: Array<{ date: Date; count: number }>;
}

export interface IncidentReport {
  incident: SecurityIncident;
  timeline_summary: string;
  impact_assessment: string;
  lessons_learned: string[];
  recommendations: string[];
  cost_analysis: {
    direct_costs: number;
    indirect_costs: number;
    total_impact: number;
  };
  compliance_implications: string[];
}

export interface SecurityPosture {
  overall_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  threat_exposure: number;
  control_effectiveness: number;
  incident_trends: Array<{ period: string; count: number }>;
  recommendations: string[];
}

// Automation and orchestration interfaces
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_conditions: TriggerCondition[];
  actions: PlaybookAction[];
  enabled: boolean;
  priority: number;
  created_at: Date;
  last_triggered?: Date;
  execution_count: number;
  success_rate: number;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: TriggerCondition[];
  escalation_levels: EscalationLevel[];
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EscalationLevel {
  level: number;
  delay_minutes: number;
  recipients: string[];
  notification_method: 'email' | 'sms' | 'slack' | 'teams';
  message_template: string;
}

// Integration interfaces
export interface SIEMIntegration {
  id: string;
  name: string;
  type: 'splunk' | 'qradar' | 'sentinel' | 'elastic' | 'other';
  endpoint: string;
  api_key: string;
  enabled: boolean;
  last_sync: Date;
  sync_frequency: string;
  data_types: string[];
}

export interface TicketingIntegration {
  id: string;
  name: string;
  type: 'jira' | 'servicenow' | 'remedy' | 'other';
  endpoint: string;
  credentials: Record<string, string>;
  enabled: boolean;
  auto_create_tickets: boolean;
  ticket_mapping: Record<string, string>;
}

// Notification and communication interfaces
export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
  configuration: Record<string, string>;
  enabled: boolean;
  recipients: string[];
  filters: TriggerCondition[];
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'incident_notification' | 'status_update' | 'escalation' | 'closure';
  subject_template: string;
  body_template: string;
  variables: string[];
  created_at: Date;
  updated_at: Date;
}

// Training and knowledge management
export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  content_url: string;
  prerequisites: string[];
  learning_objectives: string[];
  created_at: Date;
  updated_at: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created_at: Date;
  updated_at: Date;
  views: number;
  rating: number;
  related_incidents: string[];
}

// Compliance and audit interfaces
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  assessment_frequency: string;
  last_assessment: Date;
  next_assessment: Date;
  compliance_score: number;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  implementation_status: 'implemented' | 'partial' | 'not_implemented';
  effectiveness: number;
  evidence: string[];
  gaps: string[];
  remediation_plan: string[];
}

export interface AuditTrail {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

// Additional interfaces needed for the implementation
export interface IncidentTimeline {
  id: string;
  incident_id: string;
  events: IncidentTimelineEntry[];
}

export interface AlertCorrelation {
  id: string;
  alert_ids: string[];
  correlation_score: number;
  correlation_type: string;
  common_indicators: string[];
  created_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assignee_id: string;
  assigned_at: string;
  status: string;
}

export interface EvidenceChain {
  id: string;
  evidence_ids: string[];
  chain_hash: string;
  created_at: string;
  verified: boolean;
  custody_log: Array<{
    evidence_id: string;
    action: string;
    timestamp: string;
    user_id: string;
  }>;
}

export interface SecurityAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger_conditions: TriggerCondition[];
  actions: PlaybookAction[];
  created_at: string;
  updated_at: string;
}

export interface SecurityIntegration {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  enabled: boolean;
  configuration: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface TeamPerformanceMetrics {
  average_response_time: number;
  task_completion_rate: number;
  escalation_rate: number;
  workload_distribution: Record<string, number>;
  skill_utilization: Record<string, number>;
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum ImpactLevel {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface SearchFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  category?: IncidentCategory;
  assignee?: string;
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
