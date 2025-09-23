// Attribution Core Types - TypeScript interfaces for threat actor attribution

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  source: string;
}

export interface AttributionStatus {
  status_id: string;
  system_overview: {
    overall_status: 'operational' | 'degraded' | 'maintenance';
    system_health: 'excellent' | 'good' | 'fair' | 'poor';
    uptime: string;
    active_investigations: number;
    attribution_database_size: string;
  };
  attribution_sources: {
    technical_analysis: { active: number; status: string; reliability: number };
    behavioral_analysis: { active: number; status: string; reliability: number };
    infrastructure_analysis: { active: number; status: string; reliability: number };
    victimology_analysis: { active: number; status: string; reliability: number };
  };
  analysis_metrics: {
    attributions_performed_today: number;
    confidence_scores_calculated: number;
    actors_tracked: number;
    campaigns_analyzed: number;
    average_confidence_score: number;
  };
  threat_actor_landscape: {
    tracked_actors: number;
    new_actors_today: number;
    active_campaigns: number;
    attribution_confidence_high: number;
    attribution_confidence_medium: number;
    attribution_confidence_low: number;
  };
}

export interface ThreatActorProfile {
  actor_id: string;
  names: string[];
  aliases: string[];
  confidence_score: number;
  attribution_confidence: 'high' | 'medium' | 'low';
  sophistication_level: 'novice' | 'intermediate' | 'advanced' | 'expert';
  motivation: string[];
  objectives: string[];
  geographical_origin: string[];
  suspected_sponsors: string[];
  first_observed: string;
  last_activity: string;
  attack_patterns: {
    mitre_id: string;
    technique: string;
    frequency: number;
    confidence: number;
  }[];
  infrastructure: {
    domains: string[];
    ip_addresses: string[];
    certificates: string[];
    hosting_providers: string[];
  };
  malware_families: string[];
  victim_sectors: string[];
  victim_geographies: string[];
  attribution_factors: {
    factor: string;
    confidence: number;
    evidence: string[];
  }[];
}

export interface AttributionAnalysis {
  analysis_id: string;
  incident_id?: string;
  attribution_assessment: {
    primary_attribution: string;
    alternative_attributions: string[];
    confidence_score: number;
    attribution_rationale: string;
    evidence_quality: 'high' | 'medium' | 'low';
  };
  technical_indicators: {
    malware_fingerprints: string[];
    infrastructure_overlaps: string[];
    code_reuse_patterns: string[];
    compilation_timestamps: string[];
    linguistic_artifacts: string[];
  };
  behavioral_patterns: {
    attack_timing: string;
    target_selection: string;
    operational_security: string;
    post_exploitation_behavior: string;
    data_exfiltration_methods: string[];
  };
  victimology_analysis: {
    target_sectors: string[];
    geographical_focus: string[];
    organization_types: string[];
    targeting_rationale: string;
  };
  confidence_factors: {
    technical_evidence: number;
    behavioral_consistency: number;
    infrastructure_reuse: number;
    victimology_alignment: number;
    temporal_correlation: number;
  };
  recommendations: string[];
}

export interface CampaignTracking {
  campaign_id: string;
  campaign_name: string;
  attributed_actor: string;
  campaign_status: 'active' | 'dormant' | 'concluded';
  first_observed: string;
  last_activity: string;
  campaign_objectives: string[];
  target_sectors: string[];
  geographical_scope: string[];
  attack_phases: {
    phase: string;
    start_date: string;
    end_date?: string;
    activities: string[];
    indicators: string[];
  }[];
  infrastructure_evolution: {
    domains_used: string[];
    ip_ranges: string[];
    certificates: string[];
    hosting_changes: string[];
  };
  malware_evolution: {
    families_used: string[];
    version_changes: string[];
    capability_additions: string[];
  };
  victim_impact: {
    confirmed_victims: number;
    suspected_victims: number;
    data_compromised: string;
    financial_impact: string;
  };
  campaign_confidence: number;
}

export interface RelationshipMapping {
  relationship_id: string;
  source_entity: {
    type: 'actor' | 'campaign' | 'malware' | 'infrastructure';
    id: string;
    name: string;
  };
  target_entity: {
    type: 'actor' | 'campaign' | 'malware' | 'infrastructure';
    id: string;
    name: string;
  };
  relationship_type: string;
  confidence: number;
  evidence: string[];
  first_observed: string;
  last_confirmed: string;
  relationship_strength: 'weak' | 'moderate' | 'strong';
  temporal_analysis: {
    relationship_duration: string;
    activity_correlation: number;
    timing_patterns: string[];
  };
}

export interface BehavioralAnalysis {
  analysis_id: string;
  actor_id: string;
  behavioral_profile: {
    attack_preferences: string[];
    target_selection_criteria: string[];
    operational_patterns: string[];
    security_practices: string[];
    communication_methods: string[];
  };
  behavioral_indicators: {
    timing_patterns: string[];
    geographical_patterns: string[];
    tactical_evolution: string[];
    resource_utilization: string[];
  };
  behavioral_consistency: {
    consistency_score: number;
    deviation_points: string[];
    anomalous_behaviors: string[];
    evolution_trends: string[];
  };
  predictive_indicators: {
    likely_next_targets: string[];
    probable_attack_methods: string[];
    anticipated_timing: string;
    confidence_intervals: Record<string, number>;
  };
}