// IOC Management Types and Interfaces

export interface IOCStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      total_iocs: number;
      active_iocs: number;
      detection_rate: number;
      false_positive_rate: number;
    };
  };
}

export interface IOCAnalysis {
  analysis_id: string;
  ioc_profile: {
    indicator_value: string;
    indicator_type: string;
    threat_level: string;
    confidence_score: number;
  };
  threat_assessment: any;
  attribution_data: any;
  recommendations: string[];
}

export interface IOCAnalysisRequest {
  indicator_type: string;
  indicator_value: string;
  analysis_scope: string;
  threat_intelligence_enrichment: boolean;
  attribution_analysis: boolean;
  confidence_threshold: number;
}

export interface IOCEnrichmentRequest {
  enrichment_sources: string[];
  enrichment_types: string[];
  include_historical_data: boolean;
  correlation_analysis: boolean;
}

export interface IOCCorrelationRequest {
  correlation_algorithms: string[];
  time_window: string;
  similarity_threshold: number;
  include_campaign_analysis: boolean;
}

export interface IOCReportRequest {
  report_type: string;
  time_period: string;
  include_trending_analysis: boolean;
  include_attribution: boolean;
  include_mitigation_strategies: boolean;
}

export type IndicatorType = 'hash' | 'ip_address' | 'domain' | 'url' | 'file_path' | 'registry_key' | 'email' | 'user_agent';

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
