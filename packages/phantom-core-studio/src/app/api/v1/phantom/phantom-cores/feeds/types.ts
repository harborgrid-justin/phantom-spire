// Feeds Core Types - TypeScript interfaces for threat feed operations

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  source: string;
}

export interface FeedsStatus {
  status_id: string;
  system_overview: {
    overall_status: 'operational' | 'degraded' | 'maintenance';
    system_health: 'excellent' | 'good' | 'fair' | 'poor';
    uptime: string;
    active_feeds: number;
    total_indicators: string;
    processing_rate: string;
  };
  feed_sources: {
    commercial: { active: number; status: string; reliability: number };
    open_source: { active: number; status: string; reliability: number };
    government: { active: number; status: string; reliability: number };
    community: { active: number; status: string; reliability: number };
    proprietary: { active: number; status: string; reliability: number };
  };
  processing_metrics: {
    indicators_processed_today: number;
    feeds_updated: number;
    duplicates_removed: number;
    false_positives_filtered: number;
    enrichment_operations: number;
    correlation_matches: number;
  };
  data_quality: {
    overall_quality_score: number;
    freshness_score: number;
    accuracy_score: number;
    completeness_score: number;
    consistency_score: number;
  };
}

export interface FeedSource {
  source_id: string;
  name: string;
  type: 'commercial' | 'open_source' | 'government' | 'community' | 'proprietary';
  category: 'malware' | 'network' | 'email' | 'url' | 'domain' | 'reputation' | 'vulnerability';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  reliability_score: number;
  data_format: 'stix' | 'taxii' | 'misp' | 'json' | 'xml' | 'csv' | 'custom';
  update_frequency: string;
  last_update: string;
  next_update: string;
  total_indicators: number;
  indicators_today: number;
  quality_metrics: {
    accuracy: number;
    freshness: number;
    completeness: number;
    false_positive_rate: number;
  };
  integration_config: {
    api_endpoint?: string;
    authentication_type: string;
    polling_interval: string;
    data_retention: string;
    processing_rules: string[];
  };
}

export interface ThreatFeed {
  feed_id: string;
  source_name: string;
  feed_type: string;
  timestamp: string;
  indicators: ThreatIndicator[];
  metadata: {
    total_count: number;
    new_indicators: number;
    updated_indicators: number;
    confidence_level: 'high' | 'medium' | 'low';
    threat_level: 'critical' | 'high' | 'medium' | 'low';
    classification: string;
  };
  processing_info: {
    processed_at: string;
    processing_time: string;
    enrichment_status: string;
    validation_status: string;
    normalization_status: string;
  };
}

export interface ThreatIndicator {
  indicator_id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file' | 'registry' | 'mutex';
  value: string;
  confidence: number;
  threat_score: number;
  classification: string[];
  first_seen: string;
  last_seen: string;
  source_feeds: string[];
  attributes: {
    malware_family?: string;
    threat_type?: string;
    campaign?: string;
    actor?: string;
    country?: string;
    asn?: string;
    organization?: string;
  };
  relationships: {
    related_indicators: string[];
    parent_indicators: string[];
    child_indicators: string[];
  };
  context: {
    kill_chain_phase?: string[];
    mitre_techniques?: string[];
    targeted_sectors?: string[];
    detection_rate?: number;
  };
}

export interface FeedMetrics {
  metrics_id: string;
  collection_period: string;
  volume_metrics: {
    total_indicators_collected: number;
    unique_indicators: number;
    duplicate_indicators: number;
    indicators_by_type: Record<string, number>;
    indicators_by_source: Record<string, number>;
  };
  quality_metrics: {
    overall_quality_score: number;
    accuracy_percentage: number;
    false_positive_rate: number;
    completeness_score: number;
    timeliness_score: number;
  };
  processing_metrics: {
    average_processing_time: string;
    enrichment_success_rate: number;
    correlation_matches: number;
    normalization_success_rate: number;
    validation_pass_rate: number;
  };
  distribution_metrics: {
    feeds_distributed: number;
    subscribers_reached: number;
    api_requests_served: number;
    export_operations: number;
  };
}

export interface IntelligenceFusion {
  fusion_id: string;
  fusion_timestamp: string;
  input_sources: string[];
  fusion_type: 'indicator_correlation' | 'threat_landscape' | 'campaign_analysis' | 'actor_tracking';
  fusion_results: {
    confidence_score: number;
    correlation_strength: 'weak' | 'moderate' | 'strong';
    key_insights: string[];
    actionable_intelligence: string[];
    threat_assessment: {
      threat_level: 'critical' | 'high' | 'medium' | 'low';
      urgency: 'immediate' | 'high' | 'medium' | 'low';
      scope: 'global' | 'regional' | 'national' | 'sectoral' | 'local';
    };
  };
  correlated_entities: {
    indicators: string[];
    malware_families: string[];
    threat_actors: string[];
    campaigns: string[];
    infrastructure: string[];
  };
  temporal_analysis: {
    trend_direction: 'increasing' | 'stable' | 'decreasing';
    activity_pattern: string;
    seasonal_indicators: string[];
    prediction_window: string;
  };
}

export interface FeedProcessingJob {
  job_id: string;
  job_type: 'aggregation' | 'normalization' | 'enrichment' | 'validation' | 'deduplication' | 'correlation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  input_sources: string[];
  output_destination?: string;
  processing_config: {
    batch_size: number;
    timeout: string;
    retry_count: number;
    quality_threshold: number;
  };
  progress: {
    total_items: number;
    processed_items: number;
    success_count: number;
    error_count: number;
    progress_percentage: number;
  };
  results?: {
    output_indicators: number;
    quality_score: number;
    processing_time: string;
    error_summary: string[];
  };
}

export interface CustomFeed {
  feed_id: string;
  name: string;
  description: string;
  owner: string;
  created_at: string;
  last_modified: string;
  feed_config: {
    source_filters: string[];
    indicator_types: string[];
    threat_levels: string[];
    confidence_threshold: number;
    update_frequency: string;
  };
  output_format: 'json' | 'stix' | 'csv' | 'xml' | 'misp';
  distribution: {
    access_level: 'public' | 'restricted' | 'private';
    subscribers: string[];
    api_endpoint?: string;
    webhook_urls?: string[];
  };
  statistics: {
    total_indicators: number;
    unique_sources: number;
    last_update: string;
    download_count: number;
    subscriber_count: number;
  };
}