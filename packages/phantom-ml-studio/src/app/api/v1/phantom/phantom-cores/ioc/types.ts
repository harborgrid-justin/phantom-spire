// Types and interfaces for IOC (Indicators of Compromise) API

export interface IOCStatus {
  status: string;
  components: {
    enrichment_engine: string;
    correlation_engine: string;
    ingestion_pipeline: string;
    validation_service: string;
  };
  metrics: {
    uptime: string;
    total_iocs: number;
    active_iocs: number;
    detection_rate: number;
    false_positive_rate: number;
  };
  system_overview: {
    overall_status: string;
    system_health: string;
    uptime: string;
    total_indicators: number;
    new_indicators_today: number;
  };
  indicator_distribution: {
    ip_addresses: number;
    domains: number;
    file_hashes: number;
    urls: number;
    email_addresses: number;
  };
  threat_classification: {
    malware: number;
    phishing: number;
    botnet: number;
    apt: number;
    unknown: number;
  };
  processing_metrics: {
    ingestion_rate: string;
    enrichment_queue: number;
    validation_accuracy: number;
    false_positive_rate: number;
  };
  data_sources: {
    feeds_active: number;
    manual_submissions: number;
    api_integrations: number;
    automated_collection: number;
  };
}

export interface IOCAnalysis {
  analysis_id: string;
  indicator_profile: {
    value: string;
    type: string;
    first_seen: string;
    last_seen: string;
    confidence: number;
    threat_score: number;
  };
  threat_context: {
    malware_families: string[];
    campaign_associations: string[];
    geolocation: {
      country: string;
      city: string;
      isp: string;
    };
    network_behavior: {
      port_scanning: boolean;
      c2_communication: boolean;
      data_exfiltration: boolean;
      lateral_movement: boolean;
    };
  };
  enrichment_data: {
    whois_info: {
      registrar: string;
      creation_date: string;
      expiration_date: string;
    };
    dns_records: string[];
    ssl_certificates: any[];
    reputation_scores: {
      virustotal: number;
      abuseipdb: number;
      threatminer: number;
    };
  };
  related_indicators: Array<{
    value: string;
    type: string;
    relationship: string;
  }>;
  recommendations: string[];
}

export interface IOCItem {
  id: string;
  value: string;
  type: string;
  confidence: number;
  threat_score: number;
  first_seen: string;
  source: string;
  campaigns: string[];
}

export interface TrendingIOC {
  value: string;
  type: string;
  mentions: number;
  trend: string;
  campaigns: string[];
}

export interface IOCFeed {
  id: string;
  name: string;
  type: string;
  status: string;
  last_update: string;
  indicators_today: number;
  quality_score: number;
}

export interface SubmitIOCRequest {
  indicators?: any[];
}

export interface SearchIOCRequest {
  query?: string;
}

export interface AnalyzeIOCRequest {
  indicator_value?: string;
  indicator_type?: string;
}

export interface EnrichIOCRequest {
  enrichment_sources?: string[];
}

export interface CorrelateIOCRequest {
  correlation_parameters?: any;
}

export interface GenerateReportRequest {
  report_type?: string;
  time_period?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
