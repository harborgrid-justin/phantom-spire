/**
 * CVE (Common Vulnerabilities and Exposures) Type Definitions
 * Enterprise-grade type definitions for comprehensive CVE management
 */

export interface CVEBase {
  id: string;
  cveId: string; // e.g., CVE-2024-1234
  title: string;
  description: string;
  publishedDate: string;
  lastModifiedDate: string;
  discoveredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CVEScoring {
  cvssV3Score?: number;
  cvssV3Vector?: string;
  cvssV2Score?: number;
  cvssV2Vector?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  baseSeverity?: string;
  exploitabilityScore?: number;
  impactScore?: number;
}

export interface CVEProduct {
  vendor: string;
  product: string;
  versions: string[];
  versionStartIncluding?: string;
  versionEndIncluding?: string;
  versionStartExcluding?: string;
  versionEndExcluding?: string;
  platforms?: string[];
}

export interface CVEReference {
  url: string;
  name?: string;
  source?: string;
  type:
    | 'advisory'
    | 'exploit'
    | 'patch'
    | 'analysis'
    | 'tool'
    | 'vendor'
    | 'third-party';
  tags?: string[];
}

export interface CVEWeakness {
  cweId: string;
  description: string;
}

export interface CVEConfiguration {
  operator: 'AND' | 'OR';
  children?: CVEConfiguration[];
  cpe_match?: {
    vulnerable: boolean;
    cpe23Uri: string;
    versionStartIncluding?: string;
    versionEndIncluding?: string;
  }[];
}

export interface CVEExploitInfo {
  exploitAvailable: boolean;
  exploitabilityLevel:
    | 'proof-of-concept'
    | 'functional'
    | 'weaponized'
    | 'none';
  exploitInWild: boolean;
  exploitMaturity?: 'unproven' | 'proof-of-concept' | 'functional' | 'high';
  publicExploits: number;
  exploitSources: string[];
}

export interface CVEPatchInfo {
  patchAvailable: boolean;
  patchDate?: string;
  vendorAdvisory?: string;
  patchComplexity: 'low' | 'medium' | 'high';
  patchSources: CVEReference[];
}

export interface CVEMitigation {
  type: 'patch' | 'configuration' | 'workaround' | 'compensating-control';
  description: string;
  effectiveness: number; // 0-100
  implementationCost: 'low' | 'medium' | 'high';
  timeToImplement?: string;
  prerequisites?: string[];
}

export interface CVEAssetImpact {
  assetId: string;
  assetName: string;
  assetType: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  exposure: 'internet' | 'internal' | 'isolated';
  businessImpact: number; // 0-100
  affectedServices: string[];
}

export interface CVEThreatIntelligence {
  threatActors: string[];
  campaigns: string[];
  malwareFamilies: string[];
  attackPatterns: string[];
  indicators: {
    type: string;
    value: string;
    confidence: number;
  }[];
}

export interface CVECompliance {
  frameworks: string[]; // e.g., ['NIST', 'ISO27001', 'SOC2']
  requirements: {
    framework: string;
    requirement: string;
    status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  }[];
  regulatoryImpact: 'high' | 'medium' | 'low' | 'none';
}

export interface CVERiskAssessment {
  riskScore: number; // 0-100 composite risk score
  businessRisk: 'critical' | 'high' | 'medium' | 'low';
  technicalRisk: 'critical' | 'high' | 'medium' | 'low';
  reputationalRisk: 'critical' | 'high' | 'medium' | 'low';
  financialImpact: number; // estimated financial impact
  likelihood: number; // 0-100 likelihood of exploitation
  riskFactors: string[];
  riskJustification: string;
}

export interface CVEWorkflow {
  status:
    | 'new'
    | 'triaged'
    | 'investigating'
    | 'patching'
    | 'testing'
    | 'closed'
    | 'accepted-risk';
  assignedTo?: string;
  dueDate?: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  workflowSteps: {
    step: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped';
    assignee?: string;
    completedDate?: string;
    notes?: string;
  }[];
  sla: {
    responseTime: string; // e.g., "4h", "24h"
    resolutionTime: string; // e.g., "30d", "90d"
  };
}

export interface CVEMetrics {
  discoveryToDisclosure: number; // days
  disclosureToPatching: number; // days
  patchingToDeployment: number; // days
  meanTimeToDetection: number; // hours
  meanTimeToResponse: number; // hours
  meanTimeToResolution: number; // days
}

export interface CVE extends CVEBase {
  scoring: CVEScoring;
  affectedProducts: CVEProduct[];
  references: CVEReference[];
  weaknesses: CVEWeakness[];
  configurations?: CVEConfiguration[];
  exploitInfo: CVEExploitInfo;
  patchInfo: CVEPatchInfo;
  mitigations: CVEMitigation[];
  assetImpacts: CVEAssetImpact[];
  threatIntelligence: CVEThreatIntelligence;
  compliance: CVECompliance;
  riskAssessment: CVERiskAssessment;
  workflow: CVEWorkflow;
  metrics?: CVEMetrics;

  // Metadata
  source: string; // e.g., 'NVD', 'MITRE', 'manual'
  tags: string[];
  organizationId: string;
  createdBy: string;
  updatedBy: string;
}

export interface CVESearchFilters {
  cveId?: string;
  severity?: string[];
  cvssScore?: { min?: number; max?: number };
  publishedDate?: { start?: string; end?: string };
  vendor?: string[];
  product?: string[];
  exploitAvailable?: boolean;
  patchAvailable?: boolean;
  status?: string[];
  tags?: string[];
  assetImpacted?: boolean;
  businessRisk?: string[];
  compliance?: string[];
}

export interface CVESearchRequest {
  query?: string;
  filters?: CVESearchFilters;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface CVESearchResponse {
  cves: CVE[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    [key: string]: {
      value: string;
      count: number;
    }[];
  };
}

export interface CVEStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byStatus: {
    [status: string]: number;
  };
  withExploits: number;
  withPatches: number;
  pastDue: number;
  trending: {
    period: string;
    newCVEs: number;
    patchedCVEs: number;
    criticalNew: number;
  };
  topVendors: {
    vendor: string;
    count: number;
  }[];
  topProducts: {
    product: string;
    count: number;
  }[];
}

export interface CVEFeed {
  id: string;
  name: string;
  url: string;
  type: 'nvd' | 'mitre' | 'vendor' | 'third-party' | 'internal';
  enabled: boolean;
  lastSync: string;
  syncInterval: string; // e.g., '1h', '24h'
  syncStatus: 'active' | 'error' | 'paused';
  itemsProcessed: number;
  configuration: {
    [key: string]: any;
  };
}

export interface CVENotification {
  id: string;
  cveId: string;
  type:
    | 'new-cve'
    | 'severity-change'
    | 'exploit-available'
    | 'patch-available'
    | 'sla-breach';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  recipients: string[];
  channels: ('email' | 'slack' | 'teams' | 'webhook')[];
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
}

export interface CVEReport {
  id: string;
  name: string;
  type: 'executive' | 'technical' | 'compliance' | 'risk' | 'trend' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
  };
  filters: CVESearchFilters;
  generatedAt: string;
  filePath?: string;
  status: 'generating' | 'completed' | 'failed';
}

export interface CVEIntegration {
  id: string;
  name: string;
  type:
    | 'scanner'
    | 'ticketing'
    | 'patch-management'
    | 'asset-management'
    | 'siem';
  vendor: string;
  enabled: boolean;
  configuration: {
    endpoint?: string;
    apiKey?: string;
    [key: string]: any;
  };
  lastSync: string;
  syncStatus: 'connected' | 'error' | 'disabled';
}
