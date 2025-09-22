// Types and interfaces for Hunting API

export interface HuntingStatus {
  status: string;
  components: {
    hunt_engine: string;
    hypothesis_analyzer: string;
    ioc_tracker: string;
    threat_detector: string;
    behavior_analyzer: string;
  };
  metrics: {
    uptime: string;
    active_hunts: number;
    hunt_success_rate: number;
    threats_discovered: number;
    coverage_percentage: number;
  };
  system_overview: {
    overall_status: string;
    system_health: string;
    hunt_capabilities: string;
    detection_accuracy: number;
    false_positive_rate: number;
  };
  hunt_statistics: {
    total_hunts_conducted: number;
    successful_hunts: number;
    threats_identified: number;
    iocs_tracked: number;
    hypotheses_validated: number;
  };
  current_hunts: CurrentHunt[];
  capability_matrix: {
    behavioral_analysis: number;
    ioc_correlation: number;
    ttp_detection: number;
    timeline_reconstruction: number;
    threat_attribution: number;
    hypothesis_validation: number;
  };
}

export interface CurrentHunt {
  hunt_id: string;
  hunt_name: string;
  status: string;
  progress: number;
  threat_level: string;
}

export interface Hunt {
  hunt_id: string;
  hunt_name: string;
  hypothesis: string;
  status: string;
  start_time: string;
  progress: number;
  threat_level: string;
  iocs_found: number;
  confidence_score: number;
}

export interface HuntAnalytics {
  hunt_analytics: {
    success_trends: {
      last_7_days: number;
      last_30_days: number;
      last_90_days: number;
    };
    threat_discovery_rate: {
      daily_average: number;
      weekly_average: number;
      monthly_average: number;
    };
    hunt_duration_stats: {
      average_duration: string;
      shortest_hunt: string;
      longest_hunt: string;
    };
    hypothesis_accuracy: {
      validated: number;
      refuted: number;
      pending: number;
      accuracy_rate: number;
    };
  };
  threat_patterns: ThreatPattern[];
}

export interface ThreatPattern {
  pattern_name: string;
  occurrences: number;
  threat_level: string;
  detection_confidence: number;
}

export interface IOCData {
  tracked_iocs: {
    total_count: number;
    active_count: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
  ioc_categories: {
    file_hashes: number;
    ip_addresses: number;
    domain_names: number;
    registry_keys: number;
    network_signatures: number;
  };
  recent_matches: IOCMatch[];
}

export interface IOCMatch {
  ioc_value: string;
  ioc_type: string;
  match_time: string;
  hunt_id: string;
  confidence: number;
  context: string;
}

export interface HuntAnalysis {
  analysis_id: string;
  hunt_profile: {
    hunt_name: string;
    hypothesis: string;
    confidence_score: number;
    threat_level: string;
  };
  findings: {
    suspicious_activities: number;
    ioc_matches: number;
    behavioral_anomalies: number;
    timeline_events: number;
  };
  ioc_matches: IOCMatchDetail[];
  recommendations: string[];
}

export interface IOCMatchDetail {
  ioc_type: string;
  ioc_value: string;
  match_confidence: number;
  context: string;
}

export interface HypothesisAnalysis {
  hypothesis_id: string;
  hypothesis_text: string;
  analysis_results: {
    validation_status: string;
    confidence_level: number;
    evidence_strength: string;
    supporting_indicators: number;
    contradicting_indicators: number;
  };
  evidence_analysis: {
    user_behavior_patterns: {
      anomalous_access_times: boolean;
      unusual_data_volume: boolean;
      privilege_escalation_attempts: boolean;
      external_communication: boolean;
    };
    data_access_analysis: {
      unauthorized_repositories: number;
      sensitive_data_accessed: boolean;
      download_patterns: string;
      access_frequency: string;
    };
    network_indicators: {
      unusual_traffic_patterns: boolean;
      data_transfer_anomalies: boolean;
      external_connections: number;
      protocol_violations: boolean;
    };
  };
  risk_assessment: {
    threat_likelihood: number;
    potential_impact: string;
    recommended_actions: string[];
  };
}

export interface IOCTracking {
  tracking_id: string;
  tracking_summary: {
    total_iocs_tracked: number;
    matches_found: number;
    high_confidence_matches: number;
    correlation_success_rate: number;
  };
  ioc_analysis: {
    file_hashes: IOCCategory;
    ip_addresses: IOCCategory;
    domains: IOCCategory;
    registry_keys: IOCCategory;
  };
  correlation_results: {
    related_campaigns: RelatedCampaign[];
    threat_intelligence_enrichment: {
      external_sources_consulted: number;
      additional_context_obtained: boolean;
      attribution_confidence_improved: boolean;
    };
  };
}

export interface IOCCategory {
  tracked: number;
  matched: number;
  threat_families?: string[];
  geographic_distribution?: string[];
  categories?: string[];
  persistence_mechanisms?: string[];
}

export interface RelatedCampaign {
  campaign_name: string;
  correlation_strength: number;
  shared_iocs: number;
  threat_actor: string;
}

export interface HuntReport {
  report_id: string;
  report_type: string;
  time_period: string;
  executive_summary: {
    total_hunts_conducted: number;
    threats_discovered: number;
    iocs_identified: number;
    success_rate: number;
    critical_findings: number;
  };
  hunt_campaign_details: {
    campaign_objectives: string[];
    methodologies_used: string[];
    data_sources_analyzed: string[];
  };
  key_findings: KeyFinding[];
  recommendations: string[];
  metrics_and_kpis: {
    hunt_effectiveness: number;
    threat_detection_accuracy: number;
    false_positive_rate: number;
    mean_time_to_detection: string;
    coverage_improvement: string;
  };
}

export interface KeyFinding {
  finding_id: string;
  title: string;
  severity: string;
  confidence: number;
  description: string;
  affected_systems: number;
  timeline_span: string;
}

export interface ConductHuntRequest {
  huntData?: {
    hunt_type?: string;
    target_scope?: string;
    hypothesis?: string;
  };
}

export interface AnalyzeHypothesisRequest {
  hypothesisData?: {
    hypothesis?: string;
  };
}

export interface TrackIOCsRequest {
  iocData?: {
    ioc_list?: string[];
    tracking_scope?: string;
  };
}

export interface GenerateHuntReportRequest {
  reportData?: {
    report_type?: string;
    time_period?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
