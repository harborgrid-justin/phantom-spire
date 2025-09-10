/**
 * Business SaaS Types and Interfaces
 */

export interface IBusinessSaaSQuery {
  tenantId: string;
  filters?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
    offset?: number;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  projection?: string[];
  searchText?: string;
  dateRange?: {
    start: Date;
    end: Date;
    field?: string;
  };
}

export interface IBusinessSaaSResult<T = any> {
  success: boolean;
  data: T[];
  total: number;
  hasMore: boolean;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
  metadata?: {
    queryTime: number;
    cacheHit: boolean;
    dataSource: string[];
    tenantId: string;
  };
  error?: string;
}

export interface IPersistentOperation<T = any> {
  operation: 'create' | 'read' | 'update' | 'delete' | 'search';
  tenantId: string;
  entityType: string;
  entityId?: string;
  data?: T;
  query?: IBusinessSaaSQuery;
  options?: {
    upsert?: boolean;
    returnNew?: boolean;
    validation?: boolean;
    audit?: boolean;
    realTimeUpdate?: boolean;
  };
}

export interface IBusinessSaaSIndicator {
  id: string;
  tenantId: string;
  indicator_type: string;
  value: string;
  confidence: number;
  severity: string;
  first_seen: Date;
  last_seen: Date;
  sources: string[];
  tags: string[];
  context: {
    malware_families: string[];
    threat_actors: string[];
    campaigns: string[];
    attack_patterns: string[];
    targeted_sectors: string[];
    geographic_regions: string[];
    description: string;
  };
  relationships: Array<{
    relationship_type: string;
    target_indicator: string;
    confidence: number;
    description: string;
    first_observed: Date;
  }>;
  enrichment: {
    geolocation?: any;
    whois?: any;
    dns?: any;
    reputation?: any;
    malware_analysis?: any;
    network_analysis?: any;
    passive_dns: any[];
    certificates: any[];
  };
  kill_chain_phases: string[];
  false_positive_score: number;
  expiration_date?: Date;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface IBusinessSaaSThreatActor {
  id: string;
  tenantId: string;
  name: string;
  aliases: string[];
  description: string;
  actor_type: string;
  sophistication: string;
  motivation: string[];
  origin_country?: string;
  target_sectors: string[];
  target_regions: string[];
  first_observed: Date;
  last_activity: Date;
  capabilities: string[];
  tools: string[];
  techniques: string[];
  infrastructure: string[];
  campaigns: string[];
  confidence: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface IBusinessSaaSCampaign {
  id: string;
  tenantId: string;
  name: string;
  aliases: string[];
  description: string;
  threat_actors: string[];
  start_date: Date;
  end_date?: Date;
  target_sectors: string[];
  target_regions: string[];
  objectives: string[];
  techniques: string[];
  tools: string[];
  indicators: string[];
  timeline: Array<{
    timestamp: Date;
    event_type: string;
    description: string;
    indicators: string[];
    confidence: number;
  }>;
  confidence: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface IBusinessSaaSFeed {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  feed_type: string;
  source_url: string;
  format: string;
  update_frequency: number;
  last_updated: Date;
  enabled: boolean;
  confidence_adjustment: number;
  tags: string[];
  authentication?: any;
  processing_rules: any[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface IBusinessSaaSReport {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  report_type: string;
  threat_actors: string[];
  campaigns: string[];
  indicators: string[];
  techniques: string[];
  vulnerabilities: string[];
  published_date: Date;
  author: string;
  source: string;
  confidence: number;
  executive_summary: string;
  technical_details: string;
  recommendations: string[];
  references: string[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
}

export interface IRealTimeUpdate {
  type: 'indicator' | 'threat_actor' | 'campaign' | 'feed' | 'report' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  tenantId: string;
  entityId: string;
  entityType: string;
  timestamp: Date;
  data: any;
  userId?: string;
  source: string;
  channels: string[];
  metadata?: Record<string, any>;
}

export interface IBusinessSaaSAnalytics {
  tenantId: string;
  analysisId: string;
  analysisType: 'threat_landscape' | 'correlation' | 'prediction' | 'anomaly' | 'trend';
  input: {
    entities: string[];
    timeRange: {
      start: Date;
      end: Date;
    };
    parameters: Record<string, any>;
  };
  results: {
    findings: Array<{
      type: string;
      description: string;
      confidence: number;
      severity: string;
      entities: string[];
      evidence: any[];
    }>;
    patterns: Array<{
      pattern_type: string;
      description: string;
      confidence: number;
      frequency: number;
      entities: string[];
    }>;
    correlations: Array<{
      source_entity: string;
      target_entity: string;
      relationship_type: string;
      confidence: number;
      strength: number;
    }>;
    predictions: Array<{
      prediction_type: string;
      description: string;
      confidence: number;
      time_horizon: string;
      impact: string;
    }>;
    anomalies: Array<{
      anomaly_type: string;
      description: string;
      confidence: number;
      severity: string;
      affected_entities: string[];
    }>;
  };
  metadata: {
    execution_time: number;
    data_sources: string[];
    algorithm_version: string;
    confidence_threshold: number;
    analysis_date: Date;
  };
}

export interface IBusinessSaaSExport {
  exportId: string;
  tenantId: string;
  format: 'json' | 'csv' | 'pdf' | 'stix' | 'misp';
  entityTypes: string[];
  filters: Record<string, any>;
  options: {
    includeMetadata: boolean;
    includeRelationships: boolean;
    includeEnrichment: boolean;
    compression: boolean;
    encryption: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  completed_at?: Date;
  file_path?: string;
  file_size?: number;
  download_url?: string;
  expiration_date: Date;
  error_message?: string;
}

export interface IBusinessSaaSImport {
  importId: string;
  tenantId: string;
  format: 'json' | 'csv' | 'stix' | 'misp';
  file_path: string;
  file_size: number;
  options: {
    validateSchema: boolean;
    overwriteExisting: boolean;
    preserveIds: boolean;
    batchSize: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    total_records: number;
    processed_records: number;
    successful_records: number;
    failed_records: number;
    errors: Array<{
      record_index: number;
      error_message: string;
      data: any;
    }>;
  };
  created_at: Date;
  completed_at?: Date;
  result_summary?: {
    indicators_imported: number;
    threat_actors_imported: number;
    campaigns_imported: number;
    feeds_imported: number;
    reports_imported: number;
  };
}

export interface IBusinessSaaSMetrics {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  data_metrics: {
    total_indicators: number;
    new_indicators: number;
    updated_indicators: number;
    total_threat_actors: number;
    new_threat_actors: number;
    total_campaigns: number;
    active_campaigns: number;
    total_reports: number;
    new_reports: number;
  };
  usage_metrics: {
    api_requests: number;
    search_queries: number;
    real_time_updates: number;
    data_exports: number;
    data_imports: number;
    active_users: number;
    storage_used: number;
  };
  performance_metrics: {
    average_query_time: number;
    cache_hit_rate: number;
    system_uptime: number;
    error_rate: number;
  };
  quota_metrics: {
    indicators_quota_usage: number;
    threat_actors_quota_usage: number;
    api_requests_quota_usage: number;
    storage_quota_usage: number;
  };
}

export interface IBusinessSaaSHealth {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  tenantId: string;
  timestamp: Date;
  data_stores: {
    mongodb: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      response_time: number;
      connection_count: number;
      last_check: Date;
    };
    postgresql: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      response_time: number;
      connection_count: number;
      last_check: Date;
    };
    redis: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      response_time: number;
      memory_usage: number;
      last_check: Date;
    };
    elasticsearch: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      response_time: number;
      cluster_health: string;
      last_check: Date;
    };
  };
  services: {
    real_time: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      active_connections: number;
      message_queue_size: number;
    };
    analytics: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      running_jobs: number;
      queue_size: number;
    };
    data_sync: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      sync_lag: number;
      last_sync: Date;
    };
  };
  quotas: {
    indicators: {
      used: number;
      limit: number;
      percentage: number;
    };
    storage: {
      used: number;
      limit: number;
      percentage: number;
    };
    api_requests: {
      used_24h: number;
      limit_24h: number;
      percentage: number;
    };
  };
}