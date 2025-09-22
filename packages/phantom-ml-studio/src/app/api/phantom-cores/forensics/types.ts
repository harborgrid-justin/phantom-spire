// Types and interfaces for Forensics API

export interface ForensicsStatus {
  status: string;
  metrics: {
    uptime: string;
    active_investigations: number;
    evidence_items: number;
    analysis_queue: number;
    artifact_extraction_rate: number;
  };
  components: {
    evidence_collection: {
      disk_imaging_active: boolean;
      memory_acquisition: boolean;
      network_capture: boolean;
      mobile_forensics: boolean;
      cloud_forensics: boolean;
    };
    analysis_engines: {
      file_system_analysis: string;
      registry_analysis: string;
      network_analysis: string;
      malware_analysis: string;
      timeline_reconstruction: string;
    };
    artifact_extraction: {
      deleted_files_recovered: number;
      registry_entries_analyzed: number;
      network_connections_mapped: number;
      browser_artifacts_extracted: number;
      email_artifacts_processed: number;
    };
    investigation_status: {
      active_cases: number;
      pending_analysis: number;
      completed_cases: number;
      evidence_preservation_integrity: string;
      chain_of_custody_compliance: boolean;
    };
  };
}

export interface Investigation {
  id: string;
  name: string;
  status: string;
  priority: string;
  created: string;
  investigator: string;
  evidence_items: number;
  progress: number;
}

export interface EvidenceCategory {
  category: string;
  count: number;
  total_size: string;
  integrity_verified: boolean;
}

export interface ArtifactExtraction {
  type: string;
  count: number;
  last_extracted: string;
  significance: string;
}

export interface AnalysisRequest {
  evidence_type?: string;
  analysis_method?: string;
  acquisition_method?: string;
  file_system?: string;
}

export interface TimelineRequest {
  time_range?: string;
  source_types?: string[];
  resolution?: string;
}

export interface ArtifactRequest {
  artifact_types?: string[];
  extraction_depth?: string;
  include_deleted?: boolean;
  hash_verification?: boolean;
}

export interface ReportRequest {
  report_type?: string;
  case_number?: string;
  investigator?: string;
  investigation_period?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
