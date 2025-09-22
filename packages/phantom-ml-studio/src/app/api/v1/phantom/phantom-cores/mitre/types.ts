// Types and interfaces for MITRE API

export interface MitreStatus {
  status: string;
  metrics: {
    uptime: string;
    techniques_mapped: number;
    coverage_percentage: number;
    detection_rules: number;
    framework_version: string;
  };
  components: {
    framework_coverage: {
      tactics: number;
      techniques: number;
      sub_techniques: number;
      procedures: number;
      mitigations: number;
      groups: number;
    };
    detection_coverage: {
      techniques_covered: number;
      coverage_percentage: number;
      high_priority_gaps: number;
      detection_rules: number;
    };
    mapping_statistics: {
      alerts_mapped: number;
      incidents_analyzed: number;
      campaigns_profiled: number;
      threat_actors_tracked: number;
    };
    intelligence_integration: {
      active_campaigns: number;
      recent_mappings: number;
      threat_landscape_updates: number;
    };
  };
}

export interface AttackPattern {
  technique_id: string;
  technique_name: string;
  tactic: string;
  description: string;
  detection_methods: string[];
}

export interface ThreatContext {
  prevalence: string;
  difficulty: string;
  impact_score: number;
  detection_difficulty: string;
  commonly_used_by: string[];
}

export interface RelatedTechnique {
  id: string;
  name: string;
  relationship: string;
}

export interface Mitigation {
  id: string;
  name: string;
  description: string;
}

export interface MitreAnalysis {
  analysis_id: string;
  attack_pattern: AttackPattern;
  threat_context: ThreatContext;
  related_techniques: RelatedTechnique[];
  mitigations: Mitigation[];
  detection_analytics: string[];
}

export interface Tactic {
  id: string;
  name: string;
  description: string;
  techniques: number;
  coverage: number;
  recent_activity: number;
}

export interface TacticsData {
  total_tactics: number;
  tactics: Tactic[];
}

export interface Technique {
  id: string;
  name: string;
  tactic: string;
  prevalence: string;
  detection_coverage: boolean;
  recent_detections: number;
  threat_groups: string[];
}

export interface TechniquesData {
  total_techniques: number;
  high_priority: number;
  techniques: Technique[];
}

export interface Group {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  first_seen: string;
  techniques_used: number;
  recent_activity: boolean;
  sophistication: string;
}

export interface GroupsData {
  total_groups: number;
  active_groups: number;
  groups: Group[];
}

export interface CoverageGap {
  technique: string;
  name: string;
  priority: string;
}

export interface CoverageData {
  overall_coverage: number;
  coverage_by_tactic: Record<string, number>;
  gaps: CoverageGap[];
  recommendations: string[];
}

export interface TtpProfile {
  technique_id: string;
  technique_name: string;
  tactic: string;
  coverage_score: number;
}

export interface MappingResults {
  threat_score: number;
  prevalence: string;
  detection_difficulty: string;
  business_impact: string;
}

export interface DetectionCoverage {
  rules_count: number;
  coverage_percentage: number;
  gaps: string[];
}

export interface TtpAnalysis {
  analysis_id: string;
  ttp_profile: TtpProfile;
  mapping_results: MappingResults;
  detection_coverage: DetectionCoverage;
  recommendations: string[];
}

export interface TechniqueMapping {
  mapping_id: string;
  techniques_mapped: number;
  coverage_analysis: {
    total_techniques: number;
    covered_techniques: number;
    coverage_percentage: number;
  };
  gap_analysis: CoverageGap[];
  recommendations: string[];
}

export interface CoverageAssessment {
  assessment_id: string;
  overall_coverage: number;
  coverage_by_tactic: Record<string, number>;
  critical_gaps: string[];
  recommendations: string[];
}

export interface MitreReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  summary: {
    total_techniques_analyzed: number;
    coverage_percentage: number;
    critical_gaps: number;
    recommendations_count: number;
  };
  sections: string[];
  download_url: string;
  recommendations: string[];
}

export interface IncidentMapping {
  technique: string;
  confidence: number;
  evidence: string;
}

export interface AttackStep {
  step: number;
  tactic: string;
  technique: string;
}

export interface ThreatAssessment {
  sophistication: string;
  likely_groups: string[];
  campaign_type: string;
}

export interface IncidentMappingResult {
  incident_id: string;
  mapping_results: IncidentMapping[];
  attack_path: AttackStep[];
  threat_assessment: ThreatAssessment;
}

export interface AnalyzeTtpRequest {
  ttpData?: {
    technique_id?: string;
    tactic?: string;
  };
}

export interface MapTechniquesRequest {
  mappingData?: {
    scope?: string;
    priority?: string;
  };
}

export interface AssessCoverageRequest {
  assessmentData?: {
    scope?: string;
    timeframe?: string;
  };
}

export interface GenerateReportRequest {
  reportData?: {
    report_type?: string;
    timeframe?: string;
  };
}

export interface MapIncidentRequest {
  incident_id?: string;
  incident_data?: {
    indicators?: string[];
    timeline?: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
