// Forensics Types and Interfaces

export type EvidenceType = 
  | 'disk_image' 
  | 'memory_dump' 
  | 'network_capture' 
  | 'mobile_device' 
  | 'log_files'
  | 'registry_hives' 
  | 'file_system' 
  | 'database_files';

export type AnalysisMethod = 
  | 'comprehensive' 
  | 'timeline_focused' 
  | 'artifact_extraction' 
  | 'signature_analysis'
  | 'hash_verification' 
  | 'metadata_analysis';

export interface ForensicsStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_cases: number;
      evidence_items: number;
      analysis_completion: number;
      storage_used_gb: number;
      active_investigations?: number;
      artifact_extraction_rate?: number;
    };
  };
}

export interface ForensicsAnalysis {
  analysis_id: string;
  case_profile: {
    case_id: string;
    evidence_type: string;
    analysis_method: string;
    confidence_level: number;
  };
  forensic_findings: {
    artifacts_found: number;
    deleted_files_recovered: number;
    suspicious_activities: string[];
    timeline_events: number;
  };
  timeline_reconstruction: {
    start_time: string;
    end_time: string;
    key_events: Array<{
      timestamp: string;
      event_type: string;
      description: string;
      confidence: number;
    }>;
  };
  recommendations: string[];
}

export interface EvidenceAnalysisRequest {
  evidence_type: EvidenceType;
  analysis_method: AnalysisMethod;
  case_priority: 'low' | 'medium' | 'high' | 'critical';
  preserve_chain_of_custody: boolean;
  include_deleted_files: boolean;
  deep_analysis: boolean;
}

export interface TimelineReconstructionRequest {
  time_range: string;
  evidence_sources: string[];
  correlation_algorithms: string[];
  include_deleted_items: boolean;
}

export interface ArtifactExtractionRequest {
  extraction_scope: string;
  artifact_types: string[];
  preserve_metadata: boolean;
  hash_verification: boolean;
}

export interface ForensicsReportRequest {
  report_type: string;
  include_timeline: boolean;
  include_artifacts: boolean;
  include_chain_of_custody: boolean;
  format: string;
}

export interface ForensicsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
