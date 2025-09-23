// Intel Management Types and Interfaces

export interface IntelStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_operations: number;
      intelligence_quality: number;
      source_diversity: number;
      analysis_accuracy: number;
    };
  };
}

export interface IntelAnalysis {
  analysis_id: string;
  intelligence_profile: {
    operation_name: string;
    collection_method: string;
    confidence_level: number;
    threat_assessment: string;
  };
  findings: any;
  source_assessment: any;
  recommendations: string[];
}

export interface IntelAnalysisRequest {
  collection_method: string;
  target_domain: string;
  analysis_scope: string;
  confidence_threshold: number;
  correlation_analysis: boolean;
  threat_modeling: boolean;
}

export interface IntelGatheringRequest {
  collection_sources: string[];
  collection_scope: string;
  automated_collection: boolean;
  source_validation: boolean;
}

export interface SourceValidationRequest {
  validation_criteria: string[];
  cross_reference_analysis: boolean;
  confidence_scoring: boolean;
  bias_assessment: boolean;
}

export interface IntelReportRequest {
  report_type: string;
  classification_level: string;
  include_analysis: boolean;
  include_recommendations: boolean;
  distribution_list: string[];
}

export type CollectionMethod = 'OSINT' | 'SIGINT' | 'HUMINT' | 'GEOINT' | 'MASINT' | 'TECHINT';

export type TargetDomain = 'cyber_threats' | 'nation_state_actors' | 'criminal_organizations' | 'terrorist_groups' | 'insider_threats' | 'supply_chain_risks';
