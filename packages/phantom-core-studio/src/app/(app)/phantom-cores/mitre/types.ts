// MITRE Types and Interfaces

export type MitreTactic = 
  | 'Reconnaissance' 
  | 'Resource Development' 
  | 'Initial Access' 
  | 'Execution'
  | 'Persistence' 
  | 'Privilege Escalation' 
  | 'Defense Evasion' 
  | 'Credential Access'
  | 'Discovery' 
  | 'Lateral Movement' 
  | 'Collection' 
  | 'Command and Control'
  | 'Exfiltration' 
  | 'Impact';

export interface MitreStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      techniques_mapped: number;
      coverage_percentage: number;
      detection_rules: number;
      framework_version: string;
    };
  };
}

export interface MitreAnalysis {
  analysis_id: string;
  ttp_profile: {
    technique_id: string;
    technique_name: string;
    tactic: string;
    coverage_score: number;
  };
  mapping_results: {
    mapped_techniques: string[];
    coverage_gaps: string[];
    threat_actors: string[];
    detection_coverage: number;
  };
  detection_coverage: {
    active_rules: number;
    coverage_percentage: number;
    mitigation_strategies: string[];
    recommended_improvements: string[];
  };
  recommendations: string[];
}

export interface TTPAnalysisRequest {
  technique_id: string;
  tactic: string;
  analysis_scope: 'basic' | 'comprehensive' | 'advanced';
  include_detection_rules: boolean;
  include_mitigations: boolean;
  assess_coverage: boolean;
}

export interface TechniqueMappingRequest {
  mapping_scope: string;
  include_sub_techniques: boolean;
  correlation_analysis: boolean;
  threat_actor_attribution: boolean;
}

export interface CoverageAssessmentRequest {
  assessment_scope: string;
  include_detection_rules: boolean;
  include_mitigations: boolean;
  gap_analysis: boolean;
}

export interface MitreReportRequest {
  report_type: string;
  include_heat_map: boolean;
  include_gap_analysis: boolean;
  include_recommendations: boolean;
  framework_version: string;
}

export interface MitreApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: MitreTactic;
  description: string;
  platforms: string[];
  data_sources: string[];
  detection_difficulty: 'Low' | 'Medium' | 'High';
  mitigation_strategies: string[];
}

export interface MitreHeatMapData {
  technique_id: string;
  technique_name: string;
  tactic: string;
  coverage_score: number;
  detection_count: number;
  threat_actor_usage: number;
}
