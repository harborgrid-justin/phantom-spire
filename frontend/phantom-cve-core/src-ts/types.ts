// TypeScript implementation of CVE Core types

export enum CVSSVersion {
  V2 = '2.0',
  V3 = '3.0',
  V31 = '3.1'
}

export enum CVSSSeverity {
  None = 'none',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum CVSSAttackVector {
  Network = 'network',
  Adjacent = 'adjacent',
  Local = 'local',
  Physical = 'physical'
}

export enum CVSSAttackComplexity {
  Low = 'low',
  High = 'high'
}

export enum CVSSPrivilegesRequired {
  None = 'none',
  Low = 'low',
  High = 'high'
}

export enum CVSSUserInteraction {
  None = 'none',
  Required = 'required'
}

export enum CVSSScope {
  Unchanged = 'unchanged',
  Changed = 'changed'
}

export enum CVSSConfidentiality {
  None = 'none',
  Low = 'low',
  High = 'high'
}

export enum CVSSIntegrity {
  None = 'none',
  Low = 'low',
  High = 'high'
}

export enum CVSSAvailability {
  None = 'none',
  Low = 'low',
  High = 'high'
}

export interface CVSSMetrics {
  version: CVSSVersion;
  base_score: number;
  severity: CVSSSeverity;
  attack_vector: CVSSAttackVector;
  attack_complexity: CVSSAttackComplexity;
  privileges_required: CVSSPrivilegesRequired;
  user_interaction: CVSSUserInteraction;
  scope: CVSSScope;
  confidentiality_impact: CVSSConfidentiality;
  integrity_impact: CVSSIntegrity;
  availability_impact: CVSSAvailability;
  exploitability_score?: number;
  impact_score?: number;
}

export interface CWE {
  id: string;
  name: string;
  description: string;
}

export interface AffectedProduct {
  vendor: string;
  product: string;
  version: string;
  version_start_including?: string;
  version_end_including?: string;
  version_start_excluding?: string;
  version_end_excluding?: string;
}

export interface Reference {
  url: string;
  source: string;
  tags: string[];
}

export interface CVE {
  id: string;
  description: string;
  published_date: Date;
  last_modified_date: Date;
  cvss_metrics?: CVSSMetrics;
  cwe?: CWE;
  affected_products: AffectedProduct[];
  references: Reference[];
  status: 'reserved' | 'published' | 'rejected';
  assigner: string;
  tags: string[];
}

export interface VulnerabilityAssessment {
  exploitability: number;
  impact_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  affected_systems: string[];
  remediation_priority: number;
  exploit_available: boolean;
  public_exploits: boolean;
  in_the_wild: boolean;
  recommendations: string[];
  mitigation_steps: string[];
}

export interface CVEAnalysisResult {
  cve: CVE;
  assessment: VulnerabilityAssessment;
  processing_timestamp: Date;
  related_cves: string[];
  threat_actors: string[];
  campaigns: string[];
}

export interface CVESearchCriteria {
  cve_id?: string;
  vendor?: string;
  product?: string;
  severity?: CVSSSeverity;
  min_score?: number;
  max_score?: number;
  exploit_available?: boolean;
  in_the_wild?: boolean;
  published_after?: Date;
  published_before?: Date;
  date_range?: [Date, Date];
  tags?: string[];
}

export interface ExploitTimeline {
  cve_id: string;
  disclosure_date: Date;
  first_exploit_date?: Date;
  weaponization_date?: Date;
  mass_exploitation_date?: Date;
  patch_available_date?: Date;
  exploitation_stages: ExploitationStage[];
  risk_progression: RiskTimepoint[];
}

export interface ExploitationStage {
  stage: string;
  date: Date;
  description: string;
  threat_actors: string[];
  tools_used: string[];
}

export interface RiskTimepoint {
  date: Date;
  risk_score: number;
  exploitation_likelihood: number;
  impact_magnitude: number;
}

export interface RemediationStrategy {
  cve_id: string;
  priority: RemediationPriority;
  immediate_actions: RemediationAction[];
  short_term_actions: RemediationAction[];
  long_term_actions: RemediationAction[];
  compensating_controls: CompensatingControl[];
  estimated_effort: EstimatedEffort;
}

export enum RemediationPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

export interface RemediationAction {
  action_type: string;
  description: string;
  estimated_time: string;
  resources_required: string[];
  dependencies: string[];
}

export interface CompensatingControl {
  control_type: string;
  description: string;
  effectiveness: number;
  implementation_cost: string;
}

export interface EstimatedEffort {
  hours: number;
  cost?: number;
  complexity: string;
  skills_required: string[];
}
