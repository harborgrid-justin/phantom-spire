// Attribution Management Types and Interfaces

export interface AttributionStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_campaigns: number;
      attribution_confidence: number;
      tracked_actors: number;
    };
  };
}

export interface AttributionAnalysis {
  analysis_id: string;
  attribution_profile: {
    threat_actor: string;
    confidence_score: number;
    campaign_name: string;
    attribution_techniques: string[];
  };
  campaign_analysis: any;
  ttp_mapping: any;
  recommendations: string[];
}

export interface AttributionAnalysisRequest {
  analysis_type: string;
  target_actor: string;
  analysis_scope: string;
  confidence_threshold: number;
  include_ttp_mapping: boolean;
  timeframe: string;
}

export interface ThreatActorProfileRequest {
  actor_name: string;
  profiling_scope: string;
  include_infrastructure: boolean;
  include_campaigns: boolean;
  timeframe: string;
}

export interface TTPAnalysisRequest {
  analysis_type: string;
  techniques: string[];
  scope: string;
  include_detection_rules: boolean;
}

export interface CampaignProfileRequest {
  campaign_name: string;
  attribution_indicators: string[];
  analysis_depth: string;
  confidence_threshold: number;
}

export type AnalysisType = 'campaign_attribution' | 'actor_profiling' | 'ttp_analysis' | 'infrastructure_mapping';

export type ThreatActor = 'APT29' | 'APT28' | 'Lazarus Group' | 'FIN7' | 'Carbanak' | 'Equation Group' | 'Comment Crew' | 'Mustang Panda' | 'TA505' | 'Conti';
