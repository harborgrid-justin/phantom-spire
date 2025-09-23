/**
 * Analytics Type Definitions
 * Comprehensive analytics and ML types following Google Analytics architecture
 */

// Analytics Core Types
export interface AnalyticsQuery {
  id: string;
  type: AnalyticsQueryType;
  datasources: string[];
  timeRange: TimeRange;
  filters: AnalyticsFilter[];
  aggregations: AnalyticsAggregation[];
  groupBy?: string[];
  sortBy?: SortCriteria[];
  limit?: number;
  offset?: number;
  metadata: QueryMetadata;
}

export type AnalyticsQueryType = 
  | 'metric'
  | 'dimension'
  | 'funnel'
  | 'cohort'
  | 'retention'
  | 'attribution'
  | 'anomaly'
  | 'prediction'
  | 'custom';

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
  timezone?: string;
}

export type TimeGranularity = 
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface AnalyticsFilter {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  type: FilterType;
  logic?: 'AND' | 'OR' | 'NOT';
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'regex'
  | 'exists'
  | 'not_exists';

export type FilterValue = string | number | boolean | Date | Array<string | number>;

export type FilterType = 'dimension' | 'metric' | 'date' | 'custom';

export interface AnalyticsAggregation {
  type: AggregationType;
  field: string;
  alias?: string;
  parameters?: Record<string, unknown>;
}

export type AggregationType = 
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'count_distinct'
  | 'median'
  | 'percentile'
  | 'std_dev'
  | 'variance'
  | 'first'
  | 'last';

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  nulls?: 'first' | 'last';
}

export interface QueryMetadata {
  createdBy: string;
  createdAt: Date;
  tags: string[];
  description?: string;
  cached: boolean;
  cacheTtl?: number;
}

// Analytics Results
export interface AnalyticsResult {
  queryId: string;
  data: AnalyticsDataPoint[];
  metadata: ResultMetadata;
  performance: QueryPerformance;
  timestamp: Date;
}

export interface AnalyticsDataPoint {
  dimensions: Record<string, string | number>;
  metrics: Record<string, number>;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

export interface ResultMetadata {
  totalRows: number;
  rowsReturned: number;
  isPartial: boolean;
  dataFreshness: Date;
  queryComplexity: 'low' | 'medium' | 'high';
  estimatedCost?: number;
}

export interface QueryPerformance {
  executionTime: number;
  planningTime: number;
  networkTime: number;
  cacheHit: boolean;
  bytesProcessed: number;
  rowsScanned: number;
  optimizations: string[];
}

// ML Analytics Types
export interface MLAnalyticsConfig {
  model: MLModelConfig;
  features: MLFeatureConfig[];
  target: MLTargetConfig;
  validation: MLValidationConfig;
  deployment: MLDeploymentConfig;
}

export interface MLModelConfig {
  type: MLModelType;
  algorithm: string;
  hyperparameters: Record<string, unknown>;
  ensembling?: MLEnsemblingConfig;
  interpretability: MLInterpretabilityConfig;
}

export type MLModelType = 
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'anomaly_detection'
  | 'time_series'
  | 'recommendation'
  | 'nlp'
  | 'computer_vision';

export interface MLEnsemblingConfig {
  enabled: boolean;
  method: 'voting' | 'stacking' | 'blending' | 'bagging' | 'boosting';
  models: string[];
  weights?: number[];
}

export interface MLInterpretabilityConfig {
  enabled: boolean;
  methods: ('shap' | 'lime' | 'permutation' | 'partial_dependence')[];
  globalExplanations: boolean;
  localExplanations: boolean;
}

export interface MLFeatureConfig {
  name: string;
  type: MLFeatureType;
  source: string;
  transformations: MLTransformation[];
  importance?: number;
  description?: string;
}

export type MLFeatureType = 
  | 'numerical'
  | 'categorical'
  | 'boolean'
  | 'text'
  | 'datetime'
  | 'geospatial'
  | 'image'
  | 'audio'
  | 'video';

export interface MLTransformation {
  type: MLTransformationType;
  parameters: Record<string, unknown>;
  order: number;
}

export type MLTransformationType = 
  | 'scaling'
  | 'normalization'
  | 'encoding'
  | 'binning'
  | 'outlier_removal'
  | 'feature_selection'
  | 'dimensionality_reduction'
  | 'text_vectorization'
  | 'image_preprocessing';

export interface MLTargetConfig {
  name: string;
  type: 'binary' | 'multiclass' | 'regression' | 'multilabel';
  classes?: string[];
  metrics: MLMetric[];
}

export interface MLMetric {
  name: string;
  weight: number;
  threshold?: number;
  direction: 'maximize' | 'minimize';
}

export interface MLValidationConfig {
  method: 'train_test_split' | 'cross_validation' | 'time_series_split';
  testSize: number;
  folds?: number;
  stratified: boolean;
  randomState?: number;
}

export interface MLDeploymentConfig {
  type: 'batch' | 'realtime' | 'streaming';
  infrastructure: MLInfrastructureConfig;
  monitoring: MLMonitoringConfig;
  scaling: MLScalingConfig;
}

export interface MLInfrastructureConfig {
  platform: 'cloud' | 'on_premise' | 'edge';
  resources: MLResourceRequirements;
  containerization: boolean;
  orchestration: 'kubernetes' | 'docker_swarm' | 'none';
}

export interface MLResourceRequirements {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  networkBandwidth?: number;
}

export interface MLMonitoringConfig {
  dataDeift: boolean;
  modelDeift: boolean;
  performanceTracking: boolean;
  alerting: MLAlertingConfig;
  explanations: boolean;
}

export interface MLAlertingConfig {
  enabled: boolean;
  accuracyThreshold: number;
  latencyThreshold: number;
  throughputThreshold: number;
  errorRateThreshold: number;
  channels: string[];
}

export interface MLScalingConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

// Real-time Analytics Types
export interface StreamAnalyticsConfig {
  stream: StreamConfig;
  processing: StreamProcessingConfig;
  output: StreamOutputConfig;
  monitoring: StreamMonitoringConfig;
}

export interface StreamConfig {
  source: string;
  format: 'json' | 'avro' | 'protobuf' | 'csv' | 'parquet';
  compression: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
  partitioning: StreamPartitioning;
  schema: StreamSchema;
}

export interface StreamPartitioning {
  enabled: boolean;
  key: string;
  partitions: number;
  strategy: 'hash' | 'range' | 'round_robin';
}

export interface StreamSchema {
  fields: StreamField[];
  version: string;
  evolution: 'backward' | 'forward' | 'full' | 'none';
}

export interface StreamField {
  name: string;
  type: 'string' | 'int' | 'long' | 'float' | 'double' | 'boolean' | 'timestamp' | 'array' | 'object';
  nullable: boolean;
  defaultValue?: unknown;
}

export interface StreamProcessingConfig {
  framework: 'kafka_streams' | 'flink' | 'spark_streaming' | 'storm';
  windowType: 'tumbling' | 'sliding' | 'session' | 'global';
  windowSize: number;
  watermark: WatermarkConfig;
  parallelism: number;
  stateStorage: StreamStateConfig;
}

export interface WatermarkConfig {
  enabled: boolean;
  maxLateness: number;
  strategy: 'periodic' | 'punctuated';
}

export interface StreamStateConfig {
  backend: 'memory' | 'rocksdb' | 'cassandra' | 'redis';
  checkpointing: StreamCheckpointConfig;
  ttl?: number;
}

export interface StreamCheckpointConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  minPause: number;
  maxConcurrent: number;
}

export interface StreamOutputConfig {
  destinations: StreamDestination[];
  batching: StreamBatchingConfig;
  errorHandling: StreamErrorHandlingConfig;
}

export interface StreamDestination {
  type: 'kafka' | 'database' | 'file' | 'api' | 'queue';
  config: Record<string, unknown>;
  format: string;
  partitioning?: StreamPartitioning;
}

export interface StreamBatchingConfig {
  enabled: boolean;
  size: number;
  timeout: number;
  compression: boolean;
}

export interface StreamErrorHandlingConfig {
  strategy: 'fail_fast' | 'skip' | 'retry' | 'dead_letter';
  retryPolicy?: RetryPolicy;
  deadLetterTopic?: string;
}

export interface StreamMonitoringConfig {
  metrics: StreamMetricsConfig;
  alerting: StreamAlertingConfig;
  logging: StreamLoggingConfig;
}

export interface StreamMetricsConfig {
  enabled: boolean;
  collection: ('throughput' | 'latency' | 'error_rate' | 'backpressure' | 'state_size')[];
  retention: number;
  aggregation: TimeGranularity;
}

export interface StreamAlertingConfig {
  enabled: boolean;
  thresholds: StreamThresholds;
  channels: string[];
  suppressionTime: number;
}

export interface StreamThresholds {
  throughputMin: number;
  latencyMax: number;
  errorRateMax: number;
  backpressureMax: number;
  stateSizeMax: number;
}

export interface StreamLoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  sampling: number;
  structured: boolean;
  destination: 'console' | 'file' | 'elk' | 'cloudwatch';
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}