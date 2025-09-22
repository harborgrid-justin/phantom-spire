// Types and interfaces for XDR Management

export interface XDRSystemStatus {
  success: boolean;
  data?: {
    status_id: string;
    system_overview: {
      overall_status: string;
      system_health: string;
      uptime: string;
      current_load: string;
    };
    performance_metrics: {
      events_per_second: number;
      detection_latency: string;
      response_time: string;
    };
    threat_landscape: {
      active_threats: number;
      blocked_threats: number;
      investigated_incidents: number;
    };
    enterprise_coverage: {
      monitored_endpoints: number;
      network_sensors: number;
      cloud_integrations: number;
    };
  };
}

export interface ThreatAnalysis {
  analysis_id: string;
  threat_overview: {
    total_threats_detected: number;
    critical_threats: number;
    high_priority_threats: number;
    medium_priority_threats: number;
  };
  detection_engines: any;
  recommendations: string[];
  timestamp: string;
}

export interface ThreatDetectionRequest {
  scope: string;
  analysis_depth: string;
  detection_config: {
    enable_behavioral: boolean;
    enable_ml_anomaly: boolean;
    enable_signature: boolean;
    enable_threat_intel: boolean;
  };
}

export interface IncidentInvestigationRequest {
  incident_type: string;
  investigation_scope: {
    timeline: string;
    forensic_depth: string;
  };
}

export interface ThreatHuntRequest {
  hunt_name: string;
  hunt_scope: string;
  hypotheses: Array<{
    hypothesis: string;
    techniques: string[];
  }>;
}

export interface XDROperation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}
