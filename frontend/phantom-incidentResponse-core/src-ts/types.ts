// Phantom Incident Response Core - TypeScript Type Definitions
// Advanced Incident Response System Types

export enum IncidentSeverity {
  Info = 'Info',
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
  Resolved = 'Resolved',
  Closed = 'Closed',
  Reopened = 'Reopened',
}

export enum IncidentCategory {
  Malware = 'Malware',
  Phishing = 'Phishing',
  DataBreach = 'DataBreach',
  DenialOfService = 'DenialOfService',
  Unauthorized = 'Unauthorized',
  SystemCompromise = 'SystemCompromise',
  NetworkIntrusion = 'NetworkIntrusion',
  InsiderThreat = 'InsiderThreat',
  PhysicalSecurity = 'PhysicalSecurity',
  Compliance = 'Compliance',
  Other = 'Other',
}

export enum ResponderRole {
  IncidentCommander = 'IncidentCommander',
  LeadInvestigator = 'LeadInvestigator',
  ForensicsAnalyst = 'ForensicsAnalyst',
  SecurityAnalyst = 'SecurityAnalyst',
  NetworkAnalyst = 'NetworkAnalyst',
  SystemAdministrator = 'SystemAdministrator',
  CommunicationsLead = 'CommunicationsLead',
  LegalCounsel = 'LegalCounsel',
  ComplianceOfficer = 'ComplianceOfficer',
  ExecutiveSponsor = 'ExecutiveSponsor',
}

export enum EvidenceType {
  DiskImage = 'DiskImage',
  MemoryDump = 'MemoryDump',
  NetworkCapture = 'NetworkCapture',
  LogFile = 'LogFile',
  Registry = 'Registry',
  FileSystem = 'FileSystem',
  Database = 'Database',
  Email = 'Email',
  Document = 'Document',
  Screenshot = 'Screenshot',
  Video = 'Video',
  Audio = 'Audio',
  Mobile = 'Mobile',
  Cloud = 'Cloud',
}

export enum PlaybookStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
  Skipped = 'Skipped',
  Paused = 'Paused',
}

export enum CommunicationChannel {
  Email = 'Email',
  Slack = 'Slack',
  Teams = 'Teams',
  Phone = 'Phone',
  SMS = 'SMS',
  WebPortal = 'WebPortal',
  Dashboard = 'Dashboard',
  API = 'API',
}

// Core interfaces
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  event_type: string;
  description: string;
  actor: string;
  source: string;
  details: Record<string, string>;
  automated: boolean;
}

export interface Responder {
  id: string;
  name: string;
  email: string;
  role: ResponderRole;
  phone?: string;
  availability: string;
  skills: string[];
  assigned_at: Date;
  active: boolean;
}

export interface CustodyRecord {
  timestamp: Date;
  action: string;
  person: string;
  location: string;
  notes: string;
}

export interface AnalysisResult {
  id: string;
  analyst: string;
  analysis_type: string;
  timestamp: Date;
  findings: string;
  confidence: number;
  tools_used: string[];
  artifacts: string[];
  recommendations: string[];
}

export interface Evidence {
  id: string;
  name: string;
  evidence_type: EvidenceType;
  description: string;
  source_system: string;
  collected_by: string;
  collected_at: Date;
  file_path: string;
  file_size: number;
  hash_md5: string;
  hash_sha256: string;
  chain_of_custody: CustodyRecord[];
  analysis_results: AnalysisResult[];
  tags: string[];
  metadata: Record<string, string>;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  created_at: Date;
  due_date?: Date;
  completed_at?: Date;
  status: string;
  priority: number;
  category: string;
  dependencies: string[];
  checklist: ChecklistItem[];
  notes: string;
}

export interface Communication {
  id: string;
  timestamp: Date;
  channel: CommunicationChannel;
  sender: string;
  recipients: string[];
  subject: string;
  message: string;
  attachments: string[];
  status: string;
}

export interface ImpactAssessment {
  business_impact: string;
  technical_impact: string;
  financial_impact: number;
  reputation_impact: string;
  compliance_impact: string;
  affected_customers: number;
  affected_systems_count: number;
  data_compromised: boolean;
  service_disruption: boolean;
  estimated_downtime: number;
}

export interface ContainmentAction {
  id: string;
  action: string;
  description: string;
  implemented_by: string;
  implemented_at: Date;
  effectiveness: string;
  side_effects: string[];
  rollback_plan: string;
}

export interface EradicationAction {
  id: string;
  action: string;
  description: string;
  target_systems: string[];
  implemented_by: string;
  implemented_at: Date;
  verification_method: string;
  success: boolean;
}

export interface RecoveryAction {
  id: string;
  action: string;
  description: string;
  systems_restored: string[];
  implemented_by: string;
  implemented_at: Date;
  validation_tests: string[];
  success: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to: string;
  due_date: Date;
  status: string;
  priority: number;
}

export interface LessonLearned {
  id: string;
  category: string;
  description: string;
  root_cause: string;
  recommendations: string[];
  action_items: ActionItem[];
  priority: number;
}

export interface ExternalNotification {
  id: string;
  recipient: string;
  notification_type: string;
  sent_at: Date;
  sent_by: string;
  content: string;
  delivery_status: string;
  response_required: boolean;
  response_deadline?: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: number;
  created_at: Date;
  updated_at: Date;
  detected_at: Date;
  reported_by: string;
  assigned_to: string;
  incident_commander: string;
  affected_systems: string[];
  affected_users: string[];
  indicators: string[];
  tags: string[];
  timeline: TimelineEvent[];
  responders: Responder[];
  evidence: Evidence[];
  tasks: Task[];
  communications: Communication[];
  impact_assessment: ImpactAssessment;
  containment_actions: ContainmentAction[];
  eradication_actions: EradicationAction[];
  recovery_actions: RecoveryAction[];
  lessons_learned: LessonLearned[];
  cost_estimate: number;
  sla_breach: boolean;
  external_notifications: ExternalNotification[];
  compliance_requirements: string[];
  metadata: Record<string, string>;
}

export interface PlaybookStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  instructions: string;
  estimated_duration: number;
  required_role: ResponderRole;
  dependencies: string[];
  automation_script?: string;
  verification_criteria: string[];
  status: PlaybookStatus;
}

export interface ResponsePlaybook {
  id: string;
  name: string;
  description: string;
  category: IncidentCategory;
  severity_threshold: IncidentSeverity;
  steps: PlaybookStep[];
  estimated_duration: number;
  required_roles: ResponderRole[];
  prerequisites: string[];
  success_criteria: string[];
  created_by: string;
  created_at: Date;
  version: string;
  active: boolean;
}

export interface StepExecution {
  step_id: string;
  executed_by: string;
  started_at: Date;
  completed_at?: Date;
  status: PlaybookStatus;
  notes: string;
  output: Record<string, string>;
}

export interface PlaybookExecution {
  id: string;
  incident_id: string;
  playbook_id: string;
  started_by: string;
  started_at: Date;
  completed_at?: Date;
  status: PlaybookStatus;
  step_executions: StepExecution[];
  notes: string;
}

export interface ForensicFinding {
  id: string;
  category: string;
  description: string;
  confidence: number;
  evidence_references: string[];
  impact: string;
  recommendations: string[];
}

export interface Attribution {
  threat_actor?: string;
  campaign?: string;
  techniques: string[];
  tools: string[];
  infrastructure: string[];
  confidence: number;
  evidence: string[];
}

export interface ForensicInvestigation {
  id: string;
  incident_id: string;
  investigator: string;
  started_at: Date;
  completed_at?: Date;
  scope: string;
  methodology: string;
  tools_used: string[];
  evidence_collected: string[];
  findings: ForensicFinding[];
  timeline_reconstruction: TimelineEvent[];
  attribution?: Attribution;
  report_path?: string;
}

export interface IncidentMetrics {
  total_incidents: number;
  open_incidents: number;
  closed_incidents: number;
  average_resolution_time: number;
  incidents_by_severity: Record<string, number>;
  incidents_by_category: Record<string, number>;
  incidents_by_status: Record<string, number>;
  sla_compliance_rate: number;
  cost_per_incident: number;
  total_cost: number;
  top_affected_systems: string[];
  response_team_utilization: Record<string, number>;
}

// Search and filter interfaces
export interface IncidentSearchFilters {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  category?: IncidentCategory;
  assigned_to?: string;
  incident_commander?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  affected_systems?: string[];
  priority_min?: number;
  priority_max?: number;
}

export interface ResponderSearchFilters {
  role?: ResponderRole;
  skills?: string[];
  availability?: string;
  active_only?: boolean;
}

export interface PlaybookSearchFilters {
  category?: IncidentCategory;
  severity_threshold?: IncidentSeverity;
  required_roles?: ResponderRole[];
  active_only?: boolean;
}

export interface EvidenceSearchFilters {
  evidence_type?: EvidenceType;
  collected_by?: string;
  source_system?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

// Dashboard and reporting interfaces
export interface IncidentDashboard {
  summary: {
    total_incidents: number;
    open_incidents: number;
    critical_incidents: number;
    sla_breaches: number;
    average_resolution_time: number;
  };
  recent_incidents: Incident[];
  severity_distribution: Record<IncidentSeverity, number>;
  category_distribution: Record<IncidentCategory, number>;
  status_distribution: Record<IncidentStatus, number>;
  team_workload: Record<string, number>;
  trending_indicators: string[];
  upcoming_deadlines: Task[];
}

export interface ResponseTeamMetrics {
  team_size: number;
  active_responders: number;
  average_response_time: number;
  workload_distribution: Record<ResponderRole, number>;
  skill_coverage: Record<string, number>;
  availability_status: Record<string, string>;
  performance_metrics: Record<string, number>;
}

export interface ForensicsReport {
  investigation_id: string;
  incident_id: string;
  executive_summary: string;
  methodology: string;
  timeline_analysis: TimelineEvent[];
  key_findings: ForensicFinding[];
  evidence_summary: Evidence[];
  attribution_analysis?: Attribution;
  technical_details: string;
  recommendations: string[];
  appendices: string[];
  generated_date: Date;
  investigator: string;
  review_status: string;
}

// Workflow and automation interfaces
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_conditions: Record<string, any>;
  actions: AutomationAction[];
  enabled: boolean;
  created_by: string;
  created_at: Date;
  last_triggered?: Date;
  execution_count: number;
}

export interface AutomationAction {
  action_type: string;
  parameters: Record<string, any>;
  timeout_seconds: number;
  retry_count: number;
  on_failure: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: Record<string, any>;
  escalation_path: EscalationStep[];
  enabled: boolean;
  created_by: string;
  created_at: Date;
}

export interface EscalationStep {
  step_number: number;
  trigger_after_minutes: number;
  action: string;
  recipients: string[];
  message_template: string;
}

// Integration interfaces
export interface SIEMIntegration {
  id: string;
  name: string;
  siem_type: string;
  connection_config: Record<string, any>;
  enabled: boolean;
  last_sync: Date;
  sync_status: string;
  event_mapping: Record<string, string>;
}

export interface TicketingIntegration {
  id: string;
  name: string;
  system_type: string;
  connection_config: Record<string, any>;
  enabled: boolean;
  field_mapping: Record<string, string>;
  sync_direction: 'bidirectional' | 'inbound' | 'outbound';
}

export interface NotificationChannel {
  id: string;
  name: string;
  channel_type: CommunicationChannel;
  configuration: Record<string, any>;
  enabled: boolean;
  default_for_severity: IncidentSeverity[];
  recipients: string[];
}

// Compliance and audit interfaces
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  requirements: ComplianceRequirement[];
  applicable_categories: IncidentCategory[];
  mandatory: boolean;
}

export interface ComplianceRequirement {
  id: string;
  requirement_id: string;
  description: string;
  notification_timeframe: number;
  documentation_required: string[];
  responsible_roles: ResponderRole[];
}

export interface AuditTrail {
  id: string;
  incident_id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

// Training and knowledge management
export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  prerequisites: string[];
  learning_objectives: string[];
  content_url: string;
  created_by: string;
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
  view_count: number;
  rating: number;
  related_incidents: string[];
}

// Export and import interfaces
export interface ExportConfiguration {
  format: 'json' | 'csv' | 'pdf' | 'xml';
  include_timeline: boolean;
  include_evidence: boolean;
  include_communications: boolean;
  date_range?: {
    start: Date;
    end: Date;
  };
  filters?: IncidentSearchFilters;
}

export interface ImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: string[];
  warnings: string[];
}
