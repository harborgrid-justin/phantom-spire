// Incident Response Management Types and Interfaces

export interface IncidentResponseStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_incidents: number;
      response_time_avg: string;
      resolution_rate: number;
      team_readiness: number;
    };
  };
}

export interface IncidentAnalysis {
  analysis_id: string;
  incident_profile: {
    incident_id: string;
    severity_level: string;
    incident_type: string;
    response_status: string;
  };
  response_metrics: any;
  containment_actions: any;
  recommendations: string[];
}

export interface IncidentAnalysisRequest {
  incident_type: string;
  severity_level: string;
  analysis_scope: string;
  include_threat_assessment: boolean;
  include_impact_analysis: boolean;
  priority_escalation: boolean;
}

export interface ResponseInitiationRequest {
  response_level: string;
  team_assembly: string;
  communication_plan: string;
  escalation_matrix: string;
}

export interface TeamCoordinationRequest {
  teams: string[];
  coordination_mode: string;
  resource_allocation: string;
  status_reporting: string;
}

export interface IncidentReportRequest {
  report_type: string;
  include_timeline: boolean;
  include_lessons_learned: boolean;
  include_recommendations: boolean;
  compliance_requirements: string[];
}

export type IncidentType = 
  | 'security_breach' 
  | 'malware_infection' 
  | 'data_breach' 
  | 'ddos_attack'
  | 'insider_threat' 
  | 'phishing_campaign' 
  | 'ransomware' 
  | 'system_compromise';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ResponseStatus = 'identified' | 'contained' | 'eradicated' | 'recovered' | 'lessons_learned';
