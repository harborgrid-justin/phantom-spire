// Types and interfaces for Threat Actor API

export interface SystemComponents {
  actor_profiler: string;
  attribution_engine: string;
  campaign_tracker: string;
  intelligence_aggregator: string;
}

export interface SystemMetrics {
  uptime: string;
  tracked_actors: number;
  active_campaigns: number;
  attribution_confidence: number;
}

export interface SystemOverview {
  overall_status: string;
  system_health: string;
  uptime: string;
  tracked_actors: number;
  active_campaigns: number;
}

export interface ActorIntelligence {
  apt_groups: number;
  cybercriminal_groups: number;
  insider_threats: number;
  hacktivist_groups: number;
  nation_state_actors: number;
}

export interface AttributionMetrics {
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  attribution_accuracy: number;
  false_positive_rate: number;
}

export interface ActivityTracking {
  campaigns_analyzed: number;
  ttps_mapped: number;
  indicators_attributed: number;
  timeline_reconstructions: number;
}

export interface IntelligenceSource {
  active: number;
  quality: number;
}

export interface IntelligenceSources {
  osint: IntelligenceSource;
  commercial: IntelligenceSource;
  government: IntelligenceSource;
  community: IntelligenceSource;
}

export interface ThreatActorStatus {
  status: string;
  components: SystemComponents;
  metrics: SystemMetrics;
  system_overview: SystemOverview;
  actor_intelligence: ActorIntelligence;
  attribution_metrics: AttributionMetrics;
  activity_tracking: ActivityTracking;
  intelligence_sources: IntelligenceSources;
}

export interface ActorProfile {
  name: string;
  aliases: string[];
  classification: string;
  origin: string;
  active_since: string;
  sophistication_level: string;
}

export interface SupportingEvidence {
  infrastructure: string;
  ttps: string;
  targeting: string;
  timing: string;
}

export interface AttributionAssessment {
  confidence_score: number;
  attribution_factors: string[];
  supporting_evidence: SupportingEvidence;
}

export interface AttackLifecycle {
  initial_access: string[];
  persistence: string[];
  privilege_escalation: string[];
  command_control: string[];
}

export interface OperationalProfile {
  primary_motivation: string;
  secondary_motivations: string[];
  target_sectors: string[];
  target_regions: string[];
  attack_lifecycle: AttackLifecycle;
}

export interface CampaignHistory {
  name: string;
  timeframe: string;
  targets: string;
  status: string;
  iocs: number;
}

export interface ThreatAssessment {
  current_threat_level: string;
  likelihood_of_attack: number;
  potential_impact: string;
  recommended_defenses: string[];
}

export interface ThreatActorAnalysis {
  analysis_id: string;
  actor_profile: ActorProfile;
  attribution_assessment: AttributionAssessment;
  operational_profile: OperationalProfile;
  campaign_history: CampaignHistory[];
  threat_assessment: ThreatAssessment;
}

export interface Actor {
  id: string;
  name: string;
  type: string;
  origin: string;
  sophistication: string;
  active_campaigns: number;
  last_activity: string;
  threat_level: string;
}

export interface ActorsData {
  total_actors: number;
  active_actors: number;
  actors: Actor[];
}

export interface Campaign {
  id: string;
  name: string;
  actor: string;
  status: string;
  start_date: string;
  targets: string;
  indicators: number;
  confidence: number;
}

export interface CampaignsData {
  total_campaigns: number;
  active_campaigns: number;
  campaigns: Campaign[];
}

export interface Attribution {
  incident_id: string;
  attributed_actor: string;
  confidence: number;
  factors: string[];
  timestamp: string;
}

export interface AttributionData {
  recent_attributions: Attribution[];
}

export interface AttributionResult {
  actor: string;
  confidence: number;
  factors: string[];
  score: number;
}

export interface AttributeResponse {
  incident_id: string;
  attribution_results: AttributionResult[];
  recommended_actor: string;
  analysis_complete: boolean;
}

export interface NewIntelligence {
  ttps_added: number;
  indicators_linked: number;
  campaigns_associated: number;
}

export interface ProfileResponse {
  actor_name: string;
  profile_updated: boolean;
  new_intelligence: NewIntelligence;
  confidence_improved: boolean;
  threat_assessment_updated: boolean;
}

export interface ProfileData {
  actor_type?: string;
  target_sector?: string;
}

export interface ActorProfileDetailed {
  name: string;
  aliases: string[];
  type: string;
  sophistication_level: string;
  motivation: string;
  origin_country: string;
}

export interface Capabilities {
  technical_skills: string;
  resource_level: string;
  target_sectors: string[];
  attack_vectors: string[];
}

export interface CampaignHistoryDetailed {
  name: string;
  timeframe: string;
  targets: string;
  status: string;
}

export interface ProfileActorResponse {
  actor_id: string;
  actor_profile: ActorProfileDetailed;
  capabilities: Capabilities;
  campaign_history: CampaignHistoryDetailed[];
  attribution_indicators: string[];
  threat_level: string;
  confidence_score: number;
}

export interface CampaignData {
  campaign_name?: string;
  tracking_scope?: string;
}

export interface CampaignOverview {
  threat_actor: string;
  campaign_type: string;
  start_date: string;
  duration: string;
  scope: string;
}

export interface TacticalAnalysis {
  initial_access: string;
  persistence: string;
  privilege_escalation: string;
  defense_evasion: string;
  collection: string;
  exfiltration: string;
}

export interface IndicatorsTracked {
  total_indicators: number;
  domains: number;
  ip_addresses: number;
  file_hashes: number;
  registry_keys: number;
}

export interface TargetingAnalysis {
  primary_sectors: string[];
  geographic_regions: string[];
  victim_organizations: number;
  affected_countries: number;
}

export interface TrackCampaignResponse {
  campaign_id: string;
  campaign_name: string;
  tracking_status: string;
  campaign_overview: CampaignOverview;
  tactical_analysis: TacticalAnalysis;
  indicators_tracked: IndicatorsTracked;
  targeting_analysis: TargetingAnalysis;
}

export interface AttributionData {
  incident_data?: {
    attack_patterns?: string[];
  };
}

export interface AnalysisSummary {
  primary_candidate: string;
  confidence_level: number;
  attribution_factors: number;
  evidence_strength: string;
}

export interface CandidateActor {
  actor_name: string;
  confidence_score: number;
  matching_factors: string[];
  evidence_summary: string;
}

export interface TechnicalIndicators {
  malware_similarity: number;
  infrastructure_reuse: number;
  ttp_overlap: number;
  code_similarity: number;
}

export interface BehavioralPatterns {
  operational_timing: string;
  target_selection: string;
  attack_methodology: string;
  persistence_mechanisms: string;
}

export interface AnalyzeAttributionResponse {
  attribution_id: string;
  analysis_summary: AnalysisSummary;
  candidate_actors: CandidateActor[];
  technical_indicators: TechnicalIndicators;
  behavioral_patterns: BehavioralPatterns;
  recommendations: string[];
}

export interface ExecutiveSummary {
  total_actors_analyzed: number;
  active_campaigns: number;
  emerging_threats: number;
  attribution_accuracy: string;
  threat_trend: string;
}

export interface ActorTypeCount {
  count: number;
  percentage: number;
}

export interface DominantActorTypes {
  apt_groups: ActorTypeCount;
  cybercriminal_groups: ActorTypeCount;
  nation_state_actors: ActorTypeCount;
}

export interface LandscapeAnalysis {
  dominant_actor_types: DominantActorTypes;
  geographic_distribution: Record<string, number>;
  sector_targeting_trends: Record<string, number>;
}

export interface EmergingThreat {
  actor: string;
  threat_type: string;
  risk_level: string;
  description: string;
}

export interface GenerateIntelligenceResponse {
  intelligence_id: string;
  report_type: string;
  scope: string;
  time_range: string;
  executive_summary: ExecutiveSummary;
  landscape_analysis: LandscapeAnalysis;
  emerging_threats: EmergingThreat[];
  strategic_recommendations: string[];
}

export interface HuntMatch {
  actor: string;
  match_type: string;
  confidence: number;
  evidence: string;
}

export interface HuntResponse {
  hunt_id: string;
  query: string;
  matches: HuntMatch[];
  total_matches: number;
  recommendations: string[];
}

// Request interfaces
export interface AttributeRequest {
  incident_id?: string;
}

export interface ProfileRequest {
  actor_name?: string;
}

export interface ProfileActorRequest {
  profileData?: ProfileData;
}

export interface TrackCampaignRequest {
  campaignData?: CampaignData;
}

export interface AnalyzeAttributionRequest {
  attributionData?: AttributionData;
}

export interface GenerateIntelligenceRequest {
  intelligence_type?: string;
  scope?: string;
  time_range?: string;
}

export interface HuntRequest {
  query?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
