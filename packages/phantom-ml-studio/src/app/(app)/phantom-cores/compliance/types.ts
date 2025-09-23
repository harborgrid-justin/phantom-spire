// Compliance Types and Interfaces

export type ComplianceFramework = 
  | 'ISO 27001' 
  | 'SOC 2' 
  | 'GDPR' 
  | 'HIPAA' 
  | 'PCI DSS' 
  | 'NIST CSF' 
  | 'SOX' 
  | 'FISMA';

export type ComplianceIndustry = 
  | 'Technology' 
  | 'Healthcare' 
  | 'Financial Services' 
  | 'Government' 
  | 'Retail' 
  | 'Manufacturing';

export type MaturityLevel = 
  | 'Initial' 
  | 'Managed' 
  | 'Defined' 
  | 'Quantitatively Managed' 
  | 'Optimizing'
  | 'Basic'
  | 'Intermediate' 
  | 'Advanced';

export interface ComplianceStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      frameworks_active: number;
      compliance_score: number;
      last_assessment: string;
      critical_issues: number;
      remediated_issues: number;
    };
  };
}

export interface ComplianceAnalysis {
  framework_id: string;
  framework_profile: {
    name: string;
    compliance_score: number;
    maturity_level: string;
    implementation_status: string;
    last_updated: string;
  };
  assessment_results: {
    total_controls: number;
    compliant_controls: number;
    partial_compliance: number;
    non_compliant_controls: number;
    risk_score: number;
  };
  gap_analysis: {
    identified_gaps: string[];
    priority_gaps: string[];
    remediation_timeline: string;
    estimated_cost: string;
  };
  recommendations: string[];
}

export interface FrameworkAnalysisRequest {
  name: string;
  industry: ComplianceIndustry;
  standards: ComplianceFramework[];
  scope: string;
  maturityTarget: string;
}

export interface ComplianceAssessmentRequest {
  framework_id: string;
  assessmentScope: string[];
  assessmentType: 'basic' | 'comprehensive' | 'targeted';
  include_remediation: boolean;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceAuditRequest {
  audit_type: string;
  scope: string[];
  auditStandards: ComplianceFramework[];
  audit_period: string;
  include_interviews: boolean;
  include_documentation_review: boolean;
}

export interface ComplianceReportRequest {
  report_type: string;
  frameworks: ComplianceFramework[];
  reportingPeriod: string;
  includeMetrics: boolean;
  include_executive_summary: boolean;
  format: 'pdf' | 'html' | 'json' | 'excel';
}

export interface ComplianceApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  category: string;
  title: string;
  description: string;
  implementation_status: 'implemented' | 'partial' | 'not_implemented' | 'not_applicable';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  due_date: string;
  evidence: string[];
}

export interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  risk_score: number;
  mitigation_status: 'open' | 'in_progress' | 'mitigated' | 'accepted';
  owner: string;
  mitigation_actions: string[];
}

export interface ComplianceMetrics {
  overall_score: number;
  framework_scores: Record<ComplianceFramework, number>;
  trend_data: {
    date: string;
    score: number;
  }[];
  control_effectiveness: number;
  audit_readiness: number;
  remediation_progress: number;
}
