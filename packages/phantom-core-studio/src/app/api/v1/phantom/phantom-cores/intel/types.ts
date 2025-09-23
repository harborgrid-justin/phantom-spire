// Types and interfaces for Intel API

export interface IntelStatus {
  status_id: string;
  system_overview: {
    overall_status: string;
    system_health: string;
    uptime: string;
    active_feeds: number;
    intelligence_db_size: string;
  };
  intelligence_sources: {
    osint: IntelSource;
    sigint: IntelSource;
    humint: IntelSource;
    technical: IntelSource;
  };
  collection_metrics: {
    indicators_collected_today: number;
    reports_generated: number;
    intelligence_processed: number;
    quality_score: number;
  };
  threat_landscape: {
    active_campaigns: number;
    new_campaigns_today: number;
    threat_actors_tracked: number;
    iocs_flagged: number;
  };
}

export interface IntelSource {
  active: number;
  status: string;
  reliability: number;
}

export interface ThreatAnalysis {
  analysis_id: string;
  threat_assessment: {
    threat_level: string;
    confidence: number;
    threat_type: string;
    campaign_name: string;
    first_observed: string;
    last_activity: string;
  };
  attribution: {
    threat_actor: string;
    confidence: number;
    motivation: string;
    targeting: string;
    geographical_origin: string;
    sophistication_level: string;
  };
  tactics_techniques: TacticTechnique[];
  indicators: {
    ip_addresses: string[];
    domains: string[];
    file_hashes: string[];
    email_addresses: string[];
  };
  recommendations: string[];
}

export interface TacticTechnique {
  tactic: string;
  technique: string;
  mitre_id: string;
}

export interface Campaign {
  id: string;
  name: string;
  threat_actor: string;
  status: string;
  first_seen: string;
  targets: string;
  severity: string;
  indicators_count: number;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: string;
  active_since: string;
  sophistication: string;
  campaigns: number;
  last_activity: string;
}

export interface IntelFeed {
  id: string;
  name: string;
  category: string;
  status: string;
  last_update: string;
  indicators_today: number;
  reliability: number;
}

export interface IndicatorEnrichment {
  indicator: string;
  enrichment: {
    threat_score: number;
    first_seen: string;
    last_seen: string;
    associated_campaigns: string[];
    geolocation: string;
    threat_types: string[];
    confidence: number;
  };
  sources: EnrichmentSource[];
}

export interface EnrichmentSource {
  name: string;
  last_update: string;
}

export interface ThreatHuntResult {
  hunt_id: string;
  query: string;
  results: HuntMatch[];
  total_matches: number;
  execution_time: string;
}

export interface HuntMatch {
  indicator: string;
  type: string;
  matches: number;
  threat_score: number;
  campaigns: string[];
}

export interface EnrichRequest {
  indicator?: string;
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
