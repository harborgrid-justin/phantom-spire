/**
 * Common Types for Phantom Spire CTI Platform
 * Enterprise-grade type definitions for threat intelligence operations
 */

// User Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  organization: string;
  avatar?: string;
  lastLogin?: Date;
  isActive?: boolean;
  mfaEnabled?: boolean;
  preferences?: UserPreferences;
}

export type UserRole =
  | 'admin'
  | 'analyst'
  | 'investigator'
  | 'viewer'
  | 'manager';

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'investigate'
  | 'admin'
  | 'export'
  | 'manage_users'
  | 'manage_feeds'
  | 'manage_incidents';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  dashboardLayout: DashboardLayout[];
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  browser: boolean;
  sms: boolean;
  slack: boolean;
  severity: ThreatSeverity[];
}

// System Status Types
export type SystemStatus =
  | 'initializing'
  | 'operational'
  | 'degraded'
  | 'maintenance'
  | 'error';

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';

// Threat Intelligence Types
export interface ThreatIndicator {
  id: string;
  type: IOCType;
  value: string;
  confidence: ConfidenceLevel;
  severity: ThreatSeverity;
  tags: string[];
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  description?: string;
  context?: ThreatContext;
  malwareFamily?: string;
  campaignId?: string;
  actorGroup?: string;
  tlpLevel: TLPLevel;
  enrichment?: IOCEnrichment;
}

export type IOCType =
  | 'ip'
  | 'domain'
  | 'url'
  | 'hash_md5'
  | 'hash_sha1'
  | 'hash_sha256'
  | 'email'
  | 'file_name'
  | 'registry_key'
  | 'mutex'
  | 'user_agent'
  | 'certificate'
  | 'bitcoin_address'
  | 'cve';

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

export type ThreatSeverity =
  | 'informational'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type TLPLevel = 'white' | 'green' | 'amber' | 'red';

export interface ThreatContext {
  geolocation?: GeoLocation;
  asn?: string;
  registrar?: string;
  whois?: WhoisData;
  dnsRecords?: DNSRecord[];
  reputation?: ReputationData;
  sandbox?: SandboxAnalysis;
}

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WhoisData {
  registrar: string;
  registrationDate: Date;
  expirationDate: Date;
  nameServers: string[];
  contacts: WhoisContact[];
}

export interface WhoisContact {
  type: 'registrant' | 'admin' | 'tech' | 'billing';
  name?: string;
  organization?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export interface ReputationData {
  score: number;
  vendor: string;
  category: string;
  lastChecked: Date;
  verdict: 'clean' | 'suspicious' | 'malicious';
}

export interface SandboxAnalysis {
  vendor: string;
  analysisId: string;
  verdict: 'clean' | 'suspicious' | 'malicious';
  score: number;
  behaviors: BehaviorAnalysis[];
  networkActivity: NetworkActivity[];
  fileOperations: FileOperation[];
  registryOperations: RegistryOperation[];
}

export interface BehaviorAnalysis {
  category: string;
  description: string;
  severity: ThreatSeverity;
  confidence: ConfidenceLevel;
}

export interface NetworkActivity {
  protocol: string;
  source: string;
  destination: string;
  port: number;
  direction: 'inbound' | 'outbound';
  bytes: number;
}

export interface FileOperation {
  operation: 'create' | 'modify' | 'delete' | 'read';
  path: string;
  hash?: string;
  size?: number;
}

export interface RegistryOperation {
  operation: 'create' | 'modify' | 'delete' | 'read';
  key: string;
  value?: string;
  data?: string;
}

export interface IOCEnrichment {
  threatActors?: string[];
  campaigns?: string[];
  malwareFamilies?: string[];
  attackPatterns?: string[];
  vulnerabilities?: string[];
  references?: Reference[];
  relatedIOCs?: string[];
}

export interface Reference {
  url: string;
  title: string;
  source: string;
  date: Date;
}

// Incident Management Types
export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignee?: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  indicators: string[];
  artifacts: IncidentArtifact[];
  timeline: IncidentTimelineEntry[];
  playbook?: string;
  mttrData?: MTTRData;
  impact?: ImpactAssessment;
}

export type IncidentStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'investigating'
  | 'containment'
  | 'eradication'
  | 'recovery'
  | 'resolved'
  | 'closed'
  | 'false_positive';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IncidentArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  hash: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  analysis?: ArtifactAnalysis;
}

export type ArtifactType =
  | 'file'
  | 'memory_dump'
  | 'network_capture'
  | 'log_file'
  | 'screenshot'
  | 'document'
  | 'email'
  | 'registry_export';

export interface ArtifactAnalysis {
  verdict: 'clean' | 'suspicious' | 'malicious';
  score: number;
  engines: AnalysisEngine[];
  behaviors: string[];
  signatures: string[];
}

export interface AnalysisEngine {
  name: string;
  version: string;
  verdict: string;
  confidence: number;
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  description: string;
  details?: Record<string, any>;
}

export interface MTTRData {
  timeToDetection: number;
  timeToResponse: number;
  timeToContainment: number;
  timeToResolution: number;
}

export interface ImpactAssessment {
  affectedSystems: number;
  affectedUsers: number;
  dataExfiltrated: boolean;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  financialImpact?: number;
  reputationalImpact?: 'low' | 'medium' | 'high';
}

// Feed Management Types
export interface ThreatFeed {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: FeedType;
  format: FeedFormat;
  url: string;
  apiKey?: string;
  updateFrequency: number;
  lastUpdate: Date;
  status: FeedStatus;
  indicators: number;
  configuration: FeedConfiguration;
  statistics: FeedStatistics;
}

export type FeedType =
  | 'commercial'
  | 'opensource'
  | 'government'
  | 'internal'
  | 'community';

export type FeedFormat =
  | 'stix'
  | 'taxii'
  | 'json'
  | 'csv'
  | 'xml'
  | 'misp'
  | 'custom';

export type FeedStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'pending'
  | 'maintenance';

export interface FeedConfiguration {
  enabled: boolean;
  autoImport: boolean;
  deduplication: boolean;
  enrichment: boolean;
  filtering: FeedFilter[];
  transformation: FeedTransformation[];
}

export interface FeedFilter {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than';
  value: string;
  action: 'include' | 'exclude';
}

export interface FeedTransformation {
  field: string;
  operation: 'rename' | 'format' | 'normalize' | 'enrich';
  parameters: Record<string, any>;
}

export interface FeedStatistics {
  totalIndicators: number;
  newIndicators: number;
  updatedIndicators: number;
  errorCount: number;
  successRate: number;
  averageLatency: number;
  bandwidthUsage: number;
}

// Analytics and Reporting Types
export interface ThreatTrend {
  period: string;
  threatTypes: ThreatTypeCount[];
  severityDistribution: SeverityCount[];
  topSources: SourceCount[];
  topTargets: TargetCount[];
  geographicDistribution: GeoCount[];
  campaignActivity: CampaignCount[];
}

export interface ThreatTypeCount {
  type: IOCType;
  count: number;
  trend: number;
}

export interface SeverityCount {
  severity: ThreatSeverity;
  count: number;
  trend: number;
}

export interface SourceCount {
  source: string;
  count: number;
  reliability: number;
}

export interface TargetCount {
  target: string;
  count: number;
  impact: 'low' | 'medium' | 'high';
}

export interface GeoCount {
  country: string;
  countryCode: string;
  count: number;
  threat_level: ThreatSeverity;
}

export interface CampaignCount {
  campaign: string;
  indicators: number;
  firstSeen: Date;
  lastSeen: Date;
  actors: string[];
}

// Dashboard Layout Types
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: LayoutConfiguration;
  isDefault: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfiguration;
  data?: any;
}

export type WidgetType =
  | 'threat_overview'
  | 'recent_indicators'
  | 'incident_summary'
  | 'feed_status'
  | 'analytics_chart'
  | 'threat_map'
  | 'campaign_tracker'
  | 'ioc_timeline'
  | 'system_health'
  | 'user_activity';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfiguration {
  refreshInterval: number;
  autoRefresh: boolean;
  filters: Record<string, any>;
  displayOptions: Record<string, any>;
}

export interface LayoutConfiguration {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  breakpoints: Record<string, number>;
}

// Search and Query Types
export interface SearchQuery {
  query: string;
  filters: SearchFilter[];
  sort: SortOption[];
  pagination: Pagination;
  facets: FacetOption[];
}

export interface SearchFilter {
  field: string;
  operator: string;
  value: any;
  type: 'include' | 'exclude';
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  size: number;
  total?: number;
}

export interface FacetOption {
  field: string;
  size: number;
  sort: 'count' | 'alpha';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  facets: Record<string, FacetResult[]>;
  executionTime: number;
}

export interface FacetResult {
  value: string;
  count: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Workflow and Automation Types
export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  successRate: number;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'event' | 'webhook';
  configuration: Record<string, any>;
}

export interface WorkflowAction {
  type: string;
  name: string;
  configuration: Record<string, any>;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator: 'AND' | 'OR';
}

// Export all types - removed circular reference
