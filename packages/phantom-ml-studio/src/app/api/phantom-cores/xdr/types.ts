// Types and interfaces for XDR API

export interface SystemOverview {
  overall_status: string;
  system_health: string;
  uptime: string;
  current_load: string;
}

export interface PerformanceMetrics {
  events_per_second: number;
  detection_latency: string;
  response_time: string;
}

export interface ThreatLandscape {
  active_threats: number;
  blocked_threats: number;
  investigated_incidents: number;
}

export interface EnterpriseCoverage {
  monitored_endpoints: number;
  network_sensors: number;
  cloud_integrations: number;
}

export interface EndpointDetection {
  status: string;
  monitored_endpoints: number;
  detection_rules: number;
  behavioral_analysis: boolean;
  signature_updates: string;
}

export interface NetworkMonitoring {
  status: string;
  monitored_segments: number;
  traffic_analysis: boolean;
  anomaly_detection: boolean;
  threat_intelligence_feeds: number;
}

export interface ThreatIntelligence {
  status: string;
  indicators_processed: number;
  threat_feeds: number;
  attribution_confidence: number;
  ioc_matching: boolean;
}

export interface SecurityOrchestration {
  status: string;
  automated_responses: number;
  playbooks_active: number;
  integration_points: number;
  response_automation: boolean;
}

export interface XDRComponents {
  endpoint_detection: EndpointDetection;
  network_monitoring: NetworkMonitoring;
  threat_intelligence: ThreatIntelligence;
  security_orchestration: SecurityOrchestration;
}

export interface XDRStatus {
  status_id: string;
  system_overview: SystemOverview;
  performance_metrics: PerformanceMetrics;
  threat_landscape: ThreatLandscape;
  enterprise_coverage: EnterpriseCoverage;
  components: XDRComponents;
}

export interface ComponentHealth {
  status: string;
  online_percentage?: number;
  processing_rate?: string;
  automation_success_rate?: number;
  feed_freshness?: string;
  last_check: string;
}

export interface HealthMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: string;
}

export interface XDRHealth {
  overall_health: string;
  component_health: {
    endpoint_agents: ComponentHealth;
    detection_engines: ComponentHealth;
    response_automation: ComponentHealth;
    threat_intelligence: ComponentHealth;
  };
  performance_metrics: HealthMetrics;
}

export interface EnterpriseDeployment {
  total_organizations: number;
  total_endpoints: number;
  total_users: number;
  geographic_distribution: string[];
  compliance_frameworks: string[];
}

export interface ThreatLandscapeDetails {
  active_threat_campaigns: number;
  threat_actor_groups_tracked: number;
  malware_families_detected: number;
  attack_techniques_observed: number;
  zero_day_indicators: number;
}

export interface SecurityPosture {
  overall_risk_score: number;
  critical_vulnerabilities: number;
  high_priority_alerts: number;
  security_controls_effective: number;
  compliance_score: number;
}

export interface EnterpriseStatus {
  enterprise_deployment: EnterpriseDeployment;
  threat_landscape: ThreatLandscapeDetails;
  security_posture: SecurityPosture;
}

export interface DetectionStatistics {
  threats_detected_total: number;
  false_positives: number;
  true_positives: number;
  detection_accuracy: number;
  mean_time_to_detection: string;
}

export interface ResponseStatistics {
  incidents_auto_resolved: number;
  manual_interventions_required: number;
  mean_time_to_response: string;
  containment_success_rate: number;
  escalation_rate: number;
}

export interface ThreatIntelligenceStats {
  iocs_processed: number;
  threat_reports_analyzed: number;
  attribution_accuracy: number;
  threat_hunting_campaigns: number;
  proactive_threat_discoveries: number;
}

export interface XDRStatistics {
  detection_statistics: DetectionStatistics;
  response_statistics: ResponseStatistics;
  threat_intelligence: ThreatIntelligenceStats;
}

export interface ThreatsDetected {
  total_threats: number;
  critical_threats: number;
  high_severity_threats: number;
  medium_severity_threats: number;
  low_severity_threats: number;
}

export interface ThreatCategory {
  category: string;
  count: number;
  severity: string;
  indicators: string[];
}

export interface DetectionTimeline {
  analysis_start: string;
  analysis_end: string;
  processing_time: string;
}

export interface ThreatDetectionResult {
  detection_id: string;
  analysis_scope: string;
  threats_detected: ThreatsDetected;
  threat_categories: ThreatCategory[];
  detection_timeline: DetectionTimeline;
  recommended_actions: string[];
}

export interface IncidentProfile {
  incident_type: string;
  severity: string;
  affected_assets: number;
  investigation_status: string;
}

export interface AttackTimeline {
  initial_compromise: string;
  lateral_movement: string;
  data_access: string;
  detection_time: string;
}

export interface IndicatorsOfCompromise {
  file_hashes: string[];
  network_indicators: string[];
  registry_modifications: string[];
}

export interface InvestigationFindings {
  attack_timeline: AttackTimeline;
  ttps_identified: string[];
  indicators_of_compromise: IndicatorsOfCompromise;
}

export interface InvestigationSummary {
  evidence_collected: number;
  systems_analyzed: number;
  timeline_events: number;
  confidence_level: number;
}

export interface IncidentInvestigationResult {
  investigation_id: string;
  incident_profile: IncidentProfile;
  investigation_findings: InvestigationFindings;
  investigation_summary: InvestigationSummary;
}

export interface HuntProfile {
  hunt_name: string;
  hunt_scope: string;
  hunt_duration: string;
  data_sources_analyzed: string[];
}

export interface HuntResults {
  suspicious_activities_found: number;
  potential_threats_identified: number;
  false_positives: number;
  hunting_hypotheses_validated: number;
}

export interface KeyDiscovery {
  discovery_type: string;
  description: string;
  risk_level: string;
  affected_hosts: number;
}

export interface ThreatHuntResult {
  hunt_id: string;
  hunt_profile: HuntProfile;
  hunt_results: HuntResults;
  key_discoveries: KeyDiscovery[];
  hunt_recommendations: string[];
}

export interface IncidentDetails {
  incident_severity: string;
  affected_systems: number;
  response_team_assigned: string;
  estimated_containment_time: string;
}

export interface AutomatedAction {
  action: string;
  status: string;
  timestamp: string;
  affected_hosts?: number;
  affected_accounts?: number;
  affected_vlans?: number;
  indicators_processed?: number;
}

export interface PlaybookExecution {
  playbook_name: string;
  execution_status: string;
  steps_completed: number;
  total_steps: number;
  estimated_completion: string;
}

export interface CommunicationStatus {
  stakeholders_notified: boolean;
  incident_declared: boolean;
  external_reporting_required: boolean;
  media_attention_risk: string;
}

export interface ResponseOrchestrationResult {
  response_id: string;
  incident_details: IncidentDetails;
  automated_actions: AutomatedAction[];
  playbook_execution: PlaybookExecution;
  communication_status: CommunicationStatus;
}

export interface AnalysisParameters {
  analysis_period: string;
  users_analyzed: number;
  behavioral_models_applied: string[];
}

export interface BehavioralInsights {
  anomalous_users: number;
  suspicious_activities: number;
  baseline_deviations: number;
  risk_score_changes: number;
}

export interface UserRiskProfile {
  user_id: string;
  risk_score: number;
  anomalies_detected: number;
  behavioral_changes: string[];
}

export interface MachineLearningInsights {
  model_accuracy: number;
  false_positive_rate: number;
  behavioral_clusters_identified: number;
  predictive_indicators: number;
}

export interface BehaviorAnalysisResult {
  analysis_id: string;
  analysis_parameters: AnalysisParameters;
  behavioral_insights: BehavioralInsights;
  user_risk_profiles: UserRiskProfile[];
  machine_learning_insights: MachineLearningInsights;
}

export interface AnalysisSummary {
  total_endpoints_analyzed: number;
  total_events_processed: number;
  analysis_duration: string;
  threat_landscape_assessment: string;
}

export interface ComprehensiveFindings {
  security_posture_score: number;
  critical_vulnerabilities: number;
  active_threat_campaigns: number;
  compromise_indicators: number;
  security_control_effectiveness: number;
}

export interface RiskAssessment {
  overall_risk_level: string;
  risk_factors: string[];
  risk_mitigation_priority: string[];
}

export interface PredictiveAnalytics {
  threat_likelihood_30_days: number;
  most_likely_attack_vectors: string[];
  recommended_security_investments: string[];
  business_impact_projection: string;
}

export interface ComprehensiveAnalysisResult {
  analysis_id: string;
  analysis_scope: string;
  analysis_summary: AnalysisSummary;
  comprehensive_findings: ComprehensiveFindings;
  risk_assessment: RiskAssessment;
  predictive_analytics: PredictiveAnalytics;
}

export interface DetectThreatsRequest {
  analysisData?: {
    scope?: string;
  };
}

export interface InvestigateIncidentRequest {
  incidentData?: {
    incident_type?: string;
  };
}

export interface ThreatHuntRequest {
  huntParameters?: {
    hunt_name?: string;
    hunt_scope?: string;
  };
}

export interface ResponseOrchestrationRequest {
  responsePlan?: {
    incident_severity?: string;
  };
}

export interface BehaviorAnalysisRequest {
  userActivity?: {
    analysis_period?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
