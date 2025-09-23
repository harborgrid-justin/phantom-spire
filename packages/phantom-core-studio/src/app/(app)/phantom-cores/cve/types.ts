// CVE Management Types and Interfaces

export interface CVEStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      total_cves: number;
      critical_cves: number;
      patched_vulnerabilities: number;
      coverage_percentage: number;
    };
  };
}

export interface CVEAnalysis {
  analysis_id: string;
  vulnerability_profile: {
    cve_id: string;
    severity_score: number;
    impact_level: string;
    exploitability: string;
  };
  assessment_results: any;
  remediation_plan: any;
  recommendations: string[];
}

export interface CVEAnalysisRequest {
  cve_id: string;
  severity_filter: string;
  analysis_scope: string;
  include_exploits: boolean;
  include_patches: boolean;
  assessment_type: string;
}

export interface VulnerabilityTrackingRequest {
  tracking_scope: string;
  vulnerability_sources: string[];
  tracking_criteria: {
    severity_threshold: string;
    affected_systems: string;
  };
}

export interface CVEUpdateRequest {
  update_sources: string[];
  update_frequency: string;
  include_metadata: boolean;
  verify_signatures: boolean;
}

export interface ReportGenerationRequest {
  report_type: string;
  time_period: string;
  include_trends: boolean;
  severity_breakdown: boolean;
  remediation_status: boolean;
}

export interface CVECorrelationRequest {
  cveId: string;
  includeMLAnalysis: boolean;
  correlationTypes: string[];
}

export interface StreamAnalysisRequest {
  includeMetrics: boolean;
  includePerfomance: boolean;
  analyzeQueue: boolean;
}

export interface FeedStatusRequest {
  feedType: string;
  severityFilter: string[];
  includeHealth: boolean;
}

export interface MLPrioritizationRequest {
  cves: string[];
  organizationContext: {
    sector: string;
    riskTolerance: string;
    assetCriticality: string;
  };
  includeMLMetrics: boolean;
}

export interface CrossModuleAnalysisRequest {
  cveId: string;
  modules: string[];
  includeCorrelation: boolean;
  includeML: boolean;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
