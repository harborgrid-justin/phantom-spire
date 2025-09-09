// Phantom MITRE Core - TypeScript Type Definitions
// Advanced MITRE ATT&CK Framework Integration Types

export enum MitreTactic {
  Reconnaissance = 'Reconnaissance',
  ResourceDevelopment = 'ResourceDevelopment',
  InitialAccess = 'InitialAccess',
  Execution = 'Execution',
  Persistence = 'Persistence',
  PrivilegeEscalation = 'PrivilegeEscalation',
  DefenseEvasion = 'DefenseEvasion',
  CredentialAccess = 'CredentialAccess',
  Discovery = 'Discovery',
  LateralMovement = 'LateralMovement',
  Collection = 'Collection',
  CommandAndControl = 'CommandAndControl',
  Exfiltration = 'Exfiltration',
  Impact = 'Impact',
}

export enum MitrePlatform {
  Windows = 'Windows',
  MacOS = 'MacOS',
  Linux = 'Linux',
  Cloud = 'Cloud',
  Network = 'Network',
  Mobile = 'Mobile',
  ICS = 'ICS',
  Office365 = 'Office365',
  Azure = 'Azure',
  AWS = 'AWS',
  GCP = 'GCP',
  SaaS = 'SaaS',
  PRE = 'PRE',
}

export enum DataSource {
  ProcessMonitoring = 'ProcessMonitoring',
  FileMonitoring = 'FileMonitoring',
  NetworkTraffic = 'NetworkTraffic',
  WindowsEventLogs = 'WindowsEventLogs',
  Authentication = 'Authentication',
  CommandLineInterface = 'CommandLineInterface',
  PowerShell = 'PowerShell',
  Registry = 'Registry',
  Services = 'Services',
  WMI = 'WMI',
  DNS = 'DNS',
  WebProxy = 'WebProxy',
  Email = 'Email',
  CloudLogs = 'CloudLogs',
  API = 'API',
}

export enum DetectionDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  VeryHard = 'VeryHard',
}

export enum DetectionRuleType {
  Sigma = 'Sigma',
  Yara = 'Yara',
  Snort = 'Snort',
  Suricata = 'Suricata',
  Splunk = 'Splunk',
  ElasticSearch = 'ElasticSearch',
  KQL = 'KQL',
  Custom = 'Custom',
}

export enum Severity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum SoftwareType {
  Malware = 'Malware',
  Tool = 'Tool',
}

export enum ImplementationDifficulty {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'VeryHigh',
}

export enum CostEstimate {
  Free = 'Free',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'VeryHigh',
}

export enum GapType {
  NoDetection = 'NoDetection',
  LowCoverage = 'LowCoverage',
  HighFalsePositives = 'HighFalsePositives',
  DelayedDetection = 'DelayedDetection',
  InsufficientContext = 'InsufficientContext',
}

export enum ActivityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'VeryHigh',
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  rule_type: DetectionRuleType;
  severity: Severity;
  confidence: number;
  data_source: DataSource;
  query: string;
  false_positive_rate: number;
  coverage_percentage: number;
  created: Date;
  updated: Date;
  author: string;
  references: string[];
}

export interface MitreTechnique {
  id: string;
  name: string;
  description: string;
  tactic: MitreTactic;
  platforms: MitrePlatform[];
  data_sources: DataSource[];
  detection_difficulty: DetectionDifficulty;
  sub_techniques: string[];
  mitigations: string[];
  detection_rules: DetectionRule[];
  kill_chain_phases: string[];
  permissions_required: string[];
  effective_permissions: string[];
  system_requirements: string[];
  network_requirements: string[];
  remote_support: boolean;
  impact_type: string[];
  created: Date;
  modified: Date;
  version: string;
  revoked: boolean;
  deprecated: boolean;
}

export interface SubTechnique {
  id: string;
  name: string;
  description: string;
  parent_technique: string;
  platforms: MitrePlatform[];
  data_sources: DataSource[];
  detection_difficulty: DetectionDifficulty;
  detection_rules: DetectionRule[];
  mitigations: string[];
}

export interface MitreGroup {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  techniques_used: string[];
  software_used: string[];
  associated_campaigns: string[];
  first_seen: Date;
  last_seen: Date;
  origin_country?: string;
  motivation: string[];
  sophistication_level: string;
  targets: string[];
  references: string[];
}

export interface MitreSoftware {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  software_type: SoftwareType;
  platforms: MitrePlatform[];
  techniques_used: string[];
  groups_using: string[];
  kill_chain_phases: string[];
  first_seen: Date;
  last_seen: Date;
  references: string[];
}

export interface Mitigation {
  id: string;
  name: string;
  description: string;
  techniques_mitigated: string[];
  implementation_difficulty: ImplementationDifficulty;
  effectiveness: number;
  cost_estimate: CostEstimate;
  deployment_time: string;
  prerequisites: string[];
  side_effects: string[];
  references: string[];
}

export interface TechniqueMatch {
  technique_id: string;
  technique_name: string;
  confidence: number;
  evidence: string[];
  indicators: string[];
  sub_techniques: string[];
  platforms_affected: MitrePlatform[];
  data_sources_triggered: DataSource[];
}

export interface AttackPathStep {
  step_number: number;
  tactic: MitreTactic;
  technique_id: string;
  technique_name: string;
  description: string;
  prerequisites: string[];
  outcomes: string[];
  detection_opportunities: string[];
  mitigation_opportunities: string[];
}

export interface DetectionGap {
  technique_id: string;
  technique_name: string;
  gap_type: GapType;
  severity: Severity;
  description: string;
  recommended_actions: string[];
  data_sources_needed: DataSource[];
  estimated_coverage_improvement: number;
}

export interface GroupActivity {
  group_id: string;
  group_name: string;
  activity_level: ActivityLevel;
  recent_techniques: string[];
  target_sectors: string[];
  geographic_focus: string[];
}

export interface EmergingThreat {
  threat_id: string;
  name: string;
  description: string;
  techniques_involved: string[];
  first_observed: Date;
  confidence: number;
  potential_impact: Severity;
  affected_platforms: MitrePlatform[];
  indicators: string[];
}

export interface ThreatLandscape {
  most_common_tactics: Array<[MitreTactic, number]>;
  most_common_techniques: Array<[string, number]>;
  trending_techniques: string[];
  platform_distribution: Record<MitrePlatform, number>;
  group_activity: GroupActivity[];
  emerging_threats: EmergingThreat[];
}

export interface ThreatAnalysis {
  analysis_id: string;
  timestamp: Date;
  techniques_identified: TechniqueMatch[];
  tactics_coverage: Record<MitreTactic, number>;
  attack_path: AttackPathStep[];
  risk_score: number;
  confidence_score: number;
  recommended_mitigations: string[];
  detection_gaps: DetectionGap[];
  threat_landscape: ThreatLandscape;
}

export interface NavigatorMetadata {
  name: string;
  value: string;
}

export interface NavigatorLink {
  label: string;
  url: string;
}

export interface NavigatorTechnique {
  technique_id: string;
  tactic: string;
  color: string;
  comment: string;
  enabled: boolean;
  metadata: NavigatorMetadata[];
  links: NavigatorLink[];
  show_subtechniques: boolean;
}

export interface NavigatorGradient {
  colors: string[];
  min_value: number;
  max_value: number;
}

export interface NavigatorFilters {
  platforms: string[];
  tactics: string[];
  data_sources: string[];
  stages: string[];
}

export interface NavigatorLayout {
  layout: string;
  aggregate_function: string;
  show_aggregate_scores: boolean;
  count_unscored: boolean;
}

export interface NavigatorLayer {
  name: string;
  description: string;
  domain: string;
  version: string;
  techniques: NavigatorTechnique[];
  gradient: NavigatorGradient;
  filters: NavigatorFilters;
  sorting: number;
  layout: NavigatorLayout;
  hide_disabled: boolean;
  metadata: NavigatorMetadata[];
}

export interface MitreSearchCriteria {
  query?: string;
  tactics?: MitreTactic[];
  platforms?: MitrePlatform[];
  data_sources?: DataSource[];
  groups?: string[];
  software?: string[];
  detection_difficulty?: DetectionDifficulty;
  date_range?: [Date, Date];
  limit?: number;
}

export interface MitreAnalysisResult {
  analysis: ThreatAnalysis;
  navigator_layer: NavigatorLayer;
  detection_coverage: Record<string, number>;
  analysis_timestamp: Date;
}

// Utility types for advanced analysis
export interface TacticAnalysis {
  tactic: MitreTactic;
  techniques_count: number;
  coverage_percentage: number;
  risk_level: Severity;
  common_techniques: string[];
  detection_gaps: number;
  mitigation_recommendations: string[];
}

export interface PlatformAnalysis {
  platform: MitrePlatform;
  techniques_applicable: number;
  high_risk_techniques: string[];
  detection_coverage: number;
  recommended_data_sources: DataSource[];
  priority_mitigations: string[];
}

export interface GroupThreatProfile {
  group: MitreGroup;
  threat_score: number;
  active_campaigns: string[];
  signature_techniques: string[];
  target_likelihood: number;
  recommended_defenses: string[];
  attribution_confidence: number;
}

export interface DetectionMaturity {
  overall_score: number;
  tactic_coverage: Record<MitreTactic, number>;
  data_source_utilization: Record<DataSource, number>;
  rule_effectiveness: number;
  false_positive_rate: number;
  improvement_recommendations: string[];
}

export interface MitigationPlan {
  id: string;
  name: string;
  description: string;
  target_techniques: string[];
  implementation_phases: MitigationPhase[];
  total_cost: CostEstimate;
  expected_risk_reduction: number;
  timeline: string;
  success_metrics: string[];
}

export interface MitigationPhase {
  phase_number: number;
  name: string;
  description: string;
  duration: string;
  cost: CostEstimate;
  prerequisites: string[];
  deliverables: string[];
  risk_reduction: number;
}

export interface ThreatHuntingQuery {
  id: string;
  name: string;
  description: string;
  technique_id: string;
  data_source: DataSource;
  query: string;
  query_type: DetectionRuleType;
  expected_results: string[];
  false_positive_indicators: string[];
  hunting_hypothesis: string;
}

export interface AttackSimulation {
  simulation_id: string;
  name: string;
  description: string;
  techniques_simulated: string[];
  attack_path: AttackPathStep[];
  success_rate: number;
  detection_rate: number;
  mean_time_to_detection: number;
  recommendations: string[];
}

export interface ComplianceMapping {
  framework: string;
  controls: ComplianceControl[];
  coverage_percentage: number;
  gaps: string[];
  recommendations: string[];
}

export interface ComplianceControl {
  control_id: string;
  name: string;
  description: string;
  mapped_techniques: string[];
  implementation_status: 'Implemented' | 'Partial' | 'Not Implemented';
  effectiveness: number;
}
