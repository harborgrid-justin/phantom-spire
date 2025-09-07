/**
 * CVE Frontend Types
 * Type definitions for CVE management frontend components
 */

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
  platforms?: string[];
}

export interface CVEReference {
  url: string;
  name?: string;
  source?: string;
  type: 'advisory' | 'exploit' | 'patch' | 'analysis' | 'tool' | 'vendor' | 'third-party';
  tags?: string[];
}

export interface CVEExploitInfo {
  exploitAvailable: boolean;
  exploitabilityLevel: 'proof-of-concept' | 'functional' | 'weaponized' | 'none';
  exploitInWild: boolean;
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
  effectiveness: number;
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
  businessImpact: number;
  affectedServices: string[];
}

export interface CVERiskAssessment {
  riskScore: number;
  businessRisk: 'critical' | 'high' | 'medium' | 'low';
  technicalRisk: 'critical' | 'high' | 'medium' | 'low';
  reputationalRisk: 'critical' | 'high' | 'medium' | 'low';
  financialImpact: number;
  likelihood: number;
  riskFactors: string[];
  riskJustification: string;
}

export interface CVEWorkflow {
  status: 'new' | 'triaged' | 'investigating' | 'patching' | 'testing' | 'closed' | 'accepted-risk';
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
    responseTime: string;
    resolutionTime: string;
  };
}

export interface CVE {
  id: string;
  cveId: string;
  title: string;
  description: string;
  publishedDate: string;
  lastModifiedDate: string;
  discoveredDate?: string;
  
  scoring: CVEScoring;
  affectedProducts: CVEProduct[];
  references: CVEReference[];
  exploitInfo: CVEExploitInfo;
  patchInfo: CVEPatchInfo;
  mitigations: CVEMitigation[];
  assetImpacts: CVEAssetImpact[];
  riskAssessment: CVERiskAssessment;
  workflow: CVEWorkflow;
  
  source: string;
  tags: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
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
  syncInterval: string;
  syncStatus: 'active' | 'error' | 'paused';
  itemsProcessed: number;
  configuration: {
    [key: string]: any;
  };
}

export interface CVENotification {
  id: string;
  cveId: string;
  type: 'new-cve' | 'severity-change' | 'exploit-available' | 'patch-available' | 'sla-breach';
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