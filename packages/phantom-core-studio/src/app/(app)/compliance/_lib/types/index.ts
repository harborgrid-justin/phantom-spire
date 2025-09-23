/**
 * Types and interfaces for Enterprise Security & Compliance
 * Phantom Spire Enterprise ML Platform
 */

export interface ComplianceFramework {
  id: string;
  name: string;
  fullName: string;
  version: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'in-progress';
  overallScore: number;
  lastAudit: string;
  nextAudit: string;
  categories: ComplianceCategory[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  remediation: {
    required: number;
    inProgress: number;
    completed: number;
  };
}

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  score: number;
  requirements: ComplianceRequirement[];
  riskAssessment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'met' | 'partial' | 'not-met' | 'not-applicable';
  evidence: string[];
  lastVerified: string;
  assignedTo: string;
  dueDate: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface SecurityMetrics {
  overallSecurityScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  threats: {
    blocked: number;
    mitigated: number;
    investigating: number;
    resolved: number;
  };
  accessControl: {
    activeUsers: number;
    privilegedAccounts: number;
    failedLogins: number;
    mfaEnabled: number;
  };
  dataProtection: {
    encryptedData: number;
    backupStatus: string;
    retentionCompliance: number;
    dataClassification: {
      public: number;
      internal: number;
      confidential: number;
      restricted: number;
    };
  };
  incidentResponse: {
    averageResponseTime: number;
    resolvedIncidents: number;
    openIncidents: number;
    escalatedIncidents: number;
  };
}

export interface AuditReport {
  id: string;
  framework: string;
  type: 'internal' | 'external' | 'regulatory';
  date: string;
  auditor: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'remediation';
  findings: AuditFinding[];
  overallRating: 'satisfactory' | 'needs-improvement' | 'unsatisfactory';
  nextReview: string;
  recommendations: string[];
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  remediation: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk';
  evidence: string[];
}

export interface RiskAssessment {
  id: string;
  title: string;
  category: 'operational' | 'financial' | 'strategic' | 'compliance' | 'reputational';
  probability: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  impact: 'negligible' | 'minor' | 'moderate' | 'major' | 'catastrophic';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string[];
  owner: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed';
  lastReview: string;
  nextReview: string;
}

export type TabValue = 0 | 1 | 2 | 3 | 4;