// TypeScript interfaces for Phantom Hunting Core

export interface HuntingStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_hunts: number;
      hunt_success_rate: number;
      threats_discovered: number;
      coverage_percentage: number;
    };
  };
}

export interface HuntingAnalysis {
  analysis_id: string;
  hunt_profile: {
    hunt_name: string;
    hypothesis: string;
    confidence_score: number;
    threat_level: string;
  };
  findings: any;
  ioc_matches: any;
  recommendations: string[];
}

export interface HuntData {
  hunt_type: string;
  target_scope: string;
  hypothesis: string;
  time_range: string;
  confidence_threshold: number;
  include_ml_analysis: boolean;
}

export interface HypothesisData {
  hypothesis: string;
  evidence_sources: string[];
  analysis_depth: string;
  confidence_threshold: number;
}

export interface IOCData {
  ioc_types: string[];
  tracking_scope: string;
  correlation_analysis: boolean;
  threat_intelligence_enrichment: boolean;
}

export interface ReportData {
  report_type: string;
  time_period: string;
  include_timeline: boolean;
  include_ioc_analysis: boolean;
  include_recommendations: boolean;
}

export interface HuntingOperation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}
