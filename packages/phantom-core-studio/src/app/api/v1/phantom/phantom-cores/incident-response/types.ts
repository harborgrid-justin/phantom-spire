// Types and interfaces for Incident Response API

export interface IncidentResponseStatus {
  status: string;
  metrics: {
    uptime: string;
    active_incidents: number;
    response_time_avg: string;
    resolution_rate: number;
    team_readiness: number;
  };
  components: {
    incident_metrics: {
      open: number;
      investigating: number;
      contained: number;
      resolved: number;
      false_positives: number;
    };
    response_performance: {
      mean_time_to_detection: string;
      mean_time_to_response: string;
      mean_time_to_containment: string;
      mean_time_to_recovery: string;
      sla_compliance: number;
    };
    severity_distribution: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      informational: number;
    };
    team_status: {
      analysts_available: number;
      analysts_busy: number;
      escalation_queue: number;
      on_call_engineers: number;
    };
  };
}

export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  created: string;
  assigned_to: string;
  affected_assets: string[];
  indicators: number;
  timeline_entries: number;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  severity: string;
  description: string;
  analyst: string;
  artifacts: string[];
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  steps: number;
  automation_level: string;
  last_used: string;
}

export interface ResponseMetrics {
  response_times: {
    detection_time: TimeMetric;
    response_time: TimeMetric;
    containment_time: TimeMetric;
  };
  incident_trends: {
    daily_incidents: number[];
    monthly_resolved: number;
    false_positive_rate: number;
    escalation_rate: number;
  };
  team_performance: {
    analyst_workload: number;
    sla_compliance: number;
    customer_satisfaction: number;
    knowledge_base_usage: number;
  };
}

export interface TimeMetric {
  average: number;
  median: number;
  p95: number;
  unit: string;
}

export interface AnalyzeIncidentRequest {
  incident_type?: string;
  severity_level?: string;
}

export interface InitiateResponseRequest {
  response_level?: string;
}

export interface CoordinateTeamRequest {
  teams?: string[];
}

export interface GenerateReportRequest {
  report_type?: string;
  compliance_requirements?: string[];
}

export interface CreateIncidentRequest {
  title?: string;
  severity?: string;
}

export interface UpdateIncidentRequest {
  incident_id?: string;
  updates?: any;
  status?: string;
}

export interface EscalateIncidentRequest {
  incident_id?: string;
  reason?: string;
}

export interface ContainIncidentRequest {
  incident_id?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
