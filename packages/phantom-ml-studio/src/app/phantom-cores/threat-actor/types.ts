// Types and interfaces for Threat Actor Management

export interface ThreatActorStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      tracked_actors: number;
      active_campaigns: number;
      attribution_confidence: number;
    };
  };
}

export interface ThreatActorProfile {
  actor_id: string;
  actor_profile: {
    name: string;
    aliases: string[];
    type: string;
    sophistication_level: string;
    motivation: string;
    origin_country: string;
  };
  capabilities: {
    technical_skills: string;
    resource_level: string;
    target_sectors: string[];
    attack_vectors: string[];
  };
  campaign_history: any[];
  attribution_indicators: string[];
  threat_level: string;
  confidence_score: number;
}

export interface ProfileThreatActorRequest {
  actor_type: string;
  target_sector: string;
  analysis_depth: string;
  attribution_methods: string[];
  data_sources: string[];
}

export interface CampaignTrackingRequest {
  campaign_name: string;
  actor_indicators: string[];
  tracking_scope: string;
  analysis_period: string;
}

export interface AttributionAnalysisRequest {
  incident_data: {
    attack_patterns: string[];
    infrastructure_iocs: string[];
    malware_families: string[];
  };
  attribution_confidence_threshold: number;
}

export interface ThreatIntelligenceRequest {
  intelligence_type: string;
  scope: string;
  time_range: string;
}

export interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}
