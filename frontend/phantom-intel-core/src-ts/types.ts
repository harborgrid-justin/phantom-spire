// Phantom Intel Core - TypeScript Type Definitions
// Advanced Threat Intelligence System Types

export enum IndicatorType {
  IpAddress = 'IpAddress',
  Domain = 'Domain',
  Url = 'Url',
  FileHash = 'FileHash',
  Email = 'Email',
  Registry = 'Registry',
  Mutex = 'Mutex',
  Certificate = 'Certificate',
  UserAgent = 'UserAgent',
  JA3 = 'JA3',
  YARA = 'YARA',
  Sigma = 'Sigma',
  Custom = 'Custom',
}

export enum ThreatSeverity {
  Info = 'Info',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum RelationshipType {
  Communicates = 'Communicates',
  Downloads = 'Downloads',
  Drops = 'Drops',
  Uses = 'Uses',
  Indicates = 'Indicates',
  Attributed = 'Attributed',
  Variant = 'Variant',
  Derived = 'Derived',
  Related = 'Related',
}

export enum ActorType {
  NationState = 'NationState',
  Cybercriminal = 'Cybercriminal',
  Hacktivist = 'Hacktivist',
  Terrorist = 'Terrorist',
  Insider = 'Insider',
  Unknown = 'Unknown',
}

export enum SophisticationLevel {
  Minimal = 'Minimal',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  Strategic = 'Strategic',
}

export enum Motivation {
  Financial = 'Financial',
  Political = 'Political',
  Espionage = 'Espionage',
  Sabotage = 'Sabotage',
  Ideology = 'Ideology',
  Revenge = 'Revenge',
  Notoriety = 'Notoriety',
  Unknown = 'Unknown',
}

export enum FeedType {
  Commercial = 'Commercial',
  OpenSource = 'OpenSource',
  Government = 'Government',
  Community = 'Community',
  Internal = 'Internal',
  STIX = 'STIX',
  TAXII = 'TAXII',
}

export enum FeedFormat {
  JSON = 'JSON',
  XML = 'XML',
  CSV = 'CSV',
  STIX = 'STIX',
  MISP = 'MISP',
  IOC = 'IOC',
  YARA = 'YARA',
  Custom = 'Custom',
}

export enum AuthenticationType {
  None = 'None',
  ApiKey = 'ApiKey',
  BasicAuth = 'BasicAuth',
  OAuth = 'OAuth',
  Certificate = 'Certificate',
}

export enum ReportType {
  ThreatActor = 'ThreatActor',
  Campaign = 'Campaign',
  Malware = 'Malware',
  Vulnerability = 'Vulnerability',
  Technique = 'Technique',
  Sector = 'Sector',
  Geographic = 'Geographic',
  Strategic = 'Strategic',
  Tactical = 'Tactical',
}

export enum EvidenceType {
  Technical = 'Technical',
  Behavioral = 'Behavioral',
  Linguistic = 'Linguistic',
  Temporal = 'Temporal',
  Infrastructure = 'Infrastructure',
  Operational = 'Operational',
  Strategic = 'Strategic',
}

// Core interfaces
export interface IndicatorContext {
  malware_families: string[];
  threat_actors: string[];
  campaigns: string[];
  attack_patterns: string[];
  targeted_sectors: string[];
  geographic_regions: string[];
  description: string;
}

export interface IndicatorRelationship {
  relationship_type: RelationshipType;
  target_indicator: string;
  confidence: number;
  description: string;
  first_observed: Date;
}

export interface GeolocationData {
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  asn: number;
  organization: string;
  isp: string;
}

export interface WhoisData {
  registrar: string;
  creation_date?: Date;
  expiration_date?: Date;
  registrant: string;
  admin_contact: string;
  tech_contact: string;
  name_servers: string[];
}

export interface DnsData {
  a_records: string[];
  aaaa_records: string[];
  mx_records: string[];
  ns_records: string[];
  txt_records: string[];
  cname_records: string[];
}

export interface ReputationData {
  overall_score: number;
  vendor_scores: Record<string, number>;
  categories: string[];
  last_updated: Date;
}

export interface StaticAnalysis {
  file_type: string;
  size: number;
  entropy: number;
  imports: string[];
  exports: string[];
  sections: string[];
  strings: string[];
  packer?: string;
}

export interface NetworkConnection {
  protocol: string;
  source_ip: string;
  source_port: number;
  destination_ip: string;
  destination_port: number;
  direction: string;
  bytes_sent: number;
  bytes_received: number;
}

export interface FileOperation {
  operation: string;
  file_path: string;
  file_hash: string;
  timestamp: Date;
}

export interface RegistryOperation {
  operation: string;
  key_path: string;
  value_name: string;
  value_data: string;
  timestamp: Date;
}

export interface ProcessOperation {
  operation: string;
  process_name: string;
  process_id: number;
  command_line: string;
  timestamp: Date;
}

export interface ApiCall {
  api_name: string;
  parameters: string[];
  return_value: string;
  timestamp: Date;
}

export interface DynamicAnalysis {
  network_connections: NetworkConnection[];
  file_operations: FileOperation[];
  registry_operations: RegistryOperation[];
  process_operations: ProcessOperation[];
  api_calls: ApiCall[];
}

export interface MalwareAnalysis {
  family: string;
  variant: string;
  capabilities: string[];
  yara_rules: string[];
  behavioral_indicators: string[];
  static_analysis: StaticAnalysis;
  dynamic_analysis: DynamicAnalysis;
}

export interface TrafficPattern {
  pattern_type: string;
  frequency: number;
  volume: number;
  timing: Date[];
  confidence: number;
}

export interface C2Indicator {
  indicator_type: string;
  value: string;
  protocol: string;
  port: number;
  confidence: number;
}

export interface BeaconingAnalysis {
  is_beaconing: boolean;
  interval?: number;
  jitter?: number;
  confidence: number;
  patterns: string[];
}

export interface NetworkAnalysis {
  traffic_patterns: TrafficPattern[];
  communication_protocols: string[];
  encryption_methods: string[];
  c2_indicators: C2Indicator[];
  beaconing_analysis: BeaconingAnalysis;
}

export interface PassiveDnsRecord {
  query: string;
  answer: string;
  record_type: string;
  first_seen: Date;
  last_seen: Date;
  count: number;
}

export interface CertificateData {
  serial_number: string;
  issuer: string;
  subject: string;
  not_before: Date;
  not_after: Date;
  fingerprint: string;
  algorithm: string;
}

export interface IndicatorEnrichment {
  geolocation?: GeolocationData;
  whois?: WhoisData;
  dns?: DnsData;
  reputation?: ReputationData;
  malware_analysis?: MalwareAnalysis;
  network_analysis?: NetworkAnalysis;
  passive_dns: PassiveDnsRecord[];
  certificates: CertificateData[];
}

export interface ThreatIndicator {
  id: string;
  indicator_type: IndicatorType;
  value: string;
  confidence: number;
  severity: ThreatSeverity;
  first_seen: Date;
  last_seen: Date;
  sources: string[];
  tags: string[];
  context: IndicatorContext;
  relationships: IndicatorRelationship[];
  enrichment: IndicatorEnrichment;
  kill_chain_phases: string[];
  false_positive_score: number;
  expiration_date?: Date;
  metadata: Record<string, string>;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  actor_type: ActorType;
  sophistication: SophisticationLevel;
  motivation: Motivation[];
  origin_country?: string;
  target_sectors: string[];
  target_regions: string[];
  first_observed: Date;
  last_activity: Date;
  capabilities: string[];
  tools: string[];
  techniques: string[];
  infrastructure: string[];
  campaigns: string[];
  confidence: number;
  metadata: Record<string, string>;
}

export interface CampaignEvent {
  timestamp: Date;
  event_type: string;
  description: string;
  indicators: string[];
  confidence: number;
}

export interface ThreatCampaign {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  threat_actors: string[];
  start_date: Date;
  end_date?: Date;
  target_sectors: string[];
  target_regions: string[];
  objectives: string[];
  techniques: string[];
  tools: string[];
  indicators: string[];
  timeline: CampaignEvent[];
  confidence: number;
  metadata: Record<string, string>;
}

export interface FeedAuthentication {
  auth_type: AuthenticationType;
  credentials: Record<string, string>;
}

export interface ProcessingRule {
  rule_type: string;
  condition: string;
  action: string;
  parameters: Record<string, string>;
}

export interface IntelligenceFeed {
  id: string;
  name: string;
  description: string;
  feed_type: FeedType;
  source_url: string;
  format: FeedFormat;
  update_frequency: number;
  last_updated: Date;
  enabled: boolean;
  confidence_adjustment: number;
  tags: string[];
  authentication?: FeedAuthentication;
  processing_rules: ProcessingRule[];
  metadata: Record<string, string>;
}

export interface ThreatReport {
  id: string;
  title: string;
  description: string;
  report_type: ReportType;
  threat_actors: string[];
  campaigns: string[];
  indicators: string[];
  techniques: string[];
  vulnerabilities: string[];
  published_date: Date;
  author: string;
  source: string;
  confidence: number;
  executive_summary: string;
  technical_details: string;
  recommendations: string[];
  references: string[];
  metadata: Record<string, string>;
}

export interface AttributionEvidence {
  evidence_type: EvidenceType;
  description: string;
  weight: number;
  confidence: number;
  sources: string[];
}

export interface Attribution {
  id: string;
  threat_actor: string;
  campaign?: string;
  indicators: string[];
  techniques: string[];
  confidence: number;
  evidence: AttributionEvidence[];
  analysis_date: Date;
  analyst: string;
  methodology: string;
  metadata: Record<string, string>;
}

export interface TacticTechnique {
  id: string;
  tactic: string;
  technique: string;
  sub_technique?: string;
  description: string;
  platforms: string[];
  data_sources: string[];
  detection_methods: string[];
  mitigation_strategies: string[];
  threat_actors: string[];
  campaigns: string[];
  examples: string[];
  references: string[];
  metadata: Record<string, string>;
}

export interface ThreatVulnerability {
  id: string;
  cve_id?: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  cvss_score?: number;
  affected_products: string[];
  exploit_available: boolean;
  exploited_in_wild: boolean;
  threat_actors: string[];
  campaigns: string[];
  published_date: Date;
  discovery_date?: Date;
  patch_available: boolean;
  patch_date?: Date;
  references: string[];
  metadata: Record<string, string>;
}

export interface IntelligenceSummary {
  total_indicators: number;
  total_threat_actors: number;
  total_campaigns: number;
  total_feeds: number;
  active_feeds: number;
  high_confidence_indicators: number;
  critical_indicators: number;
  recent_indicators: number;
  top_threat_actors: string[];
  active_campaigns: string[];
  indicator_types: Record<string, number>;
}

// Search and filter interfaces
export interface IndicatorSearchFilters {
  indicator_type?: IndicatorType;
  severity?: ThreatSeverity;
  confidence_min?: number;
  sources?: string[];
  tags?: string[];
  date_range?: {
    start: Date;
    end: Date;
  };
  kill_chain_phases?: string[];
  malware_families?: string[];
  threat_actors?: string[];
  campaigns?: string[];
}

export interface ThreatActorSearchFilters {
  actor_type?: ActorType;
  sophistication?: SophisticationLevel;
  motivation?: Motivation[];
  origin_country?: string;
  target_sectors?: string[];
  target_regions?: string[];
  confidence_min?: number;
  activity_date_range?: {
    start: Date;
    end: Date;
  };
}

export interface CampaignSearchFilters {
  threat_actors?: string[];
  target_sectors?: string[];
  target_regions?: string[];
  active_only?: boolean;
  confidence_min?: number;
  date_range?: {
    start: Date;
    end: Date;
  };
}

export interface FeedSearchFilters {
  feed_type?: FeedType;
  format?: FeedFormat;
  enabled_only?: boolean;
  tags?: string[];
  last_updated_since?: Date;
}

// Analytics and reporting interfaces
export interface ThreatLandscape {
  top_threat_actors: Array<{
    actor: ThreatActor;
    activity_score: number;
    recent_campaigns: string[];
  }>;
  active_campaigns: Array<{
    campaign: ThreatCampaign;
    threat_level: ThreatSeverity;
    target_overlap: string[];
  }>;
  trending_indicators: Array<{
    indicator: ThreatIndicator;
    trend_score: number;
    related_campaigns: string[];
  }>;
  sector_targeting: Record<string, {
    threat_count: number;
    top_actors: string[];
    risk_level: ThreatSeverity;
  }>;
  geographic_threats: Record<string, {
    threat_count: number;
    top_campaigns: string[];
    risk_level: ThreatSeverity;
  }>;
  technique_usage: Record<string, {
    usage_count: number;
    associated_actors: string[];
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
}

export interface IntelligenceMetrics {
  feed_performance: Array<{
    feed_id: string;
    feed_name: string;
    indicators_processed: number;
    quality_score: number;
    false_positive_rate: number;
    last_update: Date;
  }>;
  indicator_statistics: {
    total_indicators: number;
    by_type: Record<IndicatorType, number>;
    by_severity: Record<ThreatSeverity, number>;
    by_confidence: Record<string, number>;
    expiring_soon: number;
    recently_added: number;
  };
  enrichment_coverage: {
    geolocation: number;
    whois: number;
    dns: number;
    reputation: number;
    malware_analysis: number;
    network_analysis: number;
  };
  correlation_insights: {
    total_relationships: number;
    campaign_correlations: number;
    actor_correlations: number;
    technique_correlations: number;
  };
}

export interface ThreatIntelligenceReport {
  id: string;
  title: string;
  executive_summary: string;
  threat_landscape: ThreatLandscape;
  key_findings: string[];
  recommendations: string[];
  indicators_of_compromise: ThreatIndicator[];
  attribution_analysis: Attribution[];
  campaign_analysis: ThreatCampaign[];
  technical_analysis: string;
  mitigation_strategies: string[];
  generated_date: Date;
  report_period: {
    start: Date;
    end: Date;
  };
  confidence_level: number;
  sources: string[];
  metadata: Record<string, string>;
}

// Integration interfaces
export interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIXObject[];
  spec_version: string;
  created: Date;
  modified: Date;
}

export interface STIXObject {
  type: string;
  id: string;
  created: Date;
  modified: Date;
  spec_version: string;
  [key: string]: any;
}

export interface TAXIICollection {
  id: string;
  title: string;
  description: string;
  can_read: boolean;
  can_write: boolean;
  media_types: string[];
  alias?: string;
}

export interface TAXIIServer {
  id: string;
  title: string;
  description: string;
  contact: string;
  default: string;
  api_roots: string[];
}

// Workflow and automation interfaces
export interface IntelligenceWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'scheduled' | 'event' | 'manual';
  trigger_config: Record<string, any>;
  steps: WorkflowStep[];
  enabled: boolean;
  created_date: Date;
  last_executed?: Date;
  execution_count: number;
  success_rate: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  step_type: 'enrichment' | 'correlation' | 'analysis' | 'notification' | 'export';
  configuration: Record<string, any>;
  timeout_seconds: number;
  retry_count: number;
  on_success: string[];
  on_failure: string[];
}

export interface EnrichmentJob {
  id: string;
  indicator_ids: string[];
  enrichment_types: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_date: Date;
  started_date?: Date;
  completed_date?: Date;
  results: Record<string, any>;
  error_message?: string;
}

export interface CorrelationJob {
  id: string;
  indicator_ids: string[];
  correlation_types: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_date: Date;
  started_date?: Date;
  completed_date?: Date;
  correlations: IndicatorRelationship[];
  confidence_threshold: number;
}

// Export and sharing interfaces
export interface ExportConfiguration {
  id: string;
  name: string;
  description: string;
  format: 'json' | 'xml' | 'csv' | 'stix' | 'misp' | 'yara';
  filters: Record<string, any>;
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    day_of_week?: number;
    day_of_month?: number;
  };
  destination: {
    type: 'file' | 'email' | 'api' | 'ftp' | 's3';
    configuration: Record<string, any>;
  };
  enabled: boolean;
  last_export?: Date;
  export_count: number;
}

export interface SharingGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  sharing_rules: SharingRule[];
  created_date: Date;
  created_by: string;
  active: boolean;
}

export interface SharingRule {
  id: string;
  name: string;
  conditions: Record<string, any>;
  actions: string[];
  priority: number;
  enabled: boolean;
}
