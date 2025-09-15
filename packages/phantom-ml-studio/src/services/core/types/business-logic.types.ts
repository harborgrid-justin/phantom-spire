/**
 * Business Logic Type Definitions
 * Comprehensive type system for enterprise business logic following Facebook's type-first approach
 */

// Core Business Logic Types
export interface BusinessLogicRequest<T = Record<string, unknown>> {
  id: string;
  type: string;
  data: T;
  metadata: BusinessLogicMetadata;
  context: BusinessLogicContext;
  timestamp: Date;
}

export interface BusinessLogicResponse<T = Record<string, unknown>> {
  id: string;
  success: boolean;
  data?: T;
  error?: BusinessLogicError;
  metadata: BusinessLogicMetadata;
  performance: PerformanceMetrics;
  timestamp: Date;
}

export interface BusinessLogicMetadata {
  category: string;
  module: string;
  version: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  source?: string;
}

export interface BusinessLogicContext {
  userId?: string;
  sessionId?: string;
  tenantId?: string;
  permissions?: string[];
  environment: 'development' | 'staging' | 'production';
  clientInfo?: ClientInfo;
  trace?: TraceContext;
}

export interface BusinessLogicError {
  code: string;
  message: string;
  type: 'validation' | 'business_rule' | 'system' | 'external_service';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  stack?: string;
  retryable?: boolean;
}

export interface ClientInfo {
  userAgent?: string;
  ipAddress?: string;
  locale?: string;
  timezone?: string;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  recommendation?: string;
}

// Business Rules Types
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  enabled: boolean;
  condition: BusinessRuleCondition;
  actions: BusinessRuleAction[];
  metadata: BusinessRuleMetadata;
}

export interface BusinessRuleCondition {
  type: 'simple' | 'complex' | 'expression';
  field?: string;
  operator?: ComparisonOperator;
  value?: unknown;
  expression?: string;
  nested?: BusinessRuleCondition[];
  logic?: 'AND' | 'OR' | 'NOT';
}

export type ComparisonOperator = 
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'regex' | 'exists';

export interface BusinessRuleAction {
  type: 'validate' | 'transform' | 'enrich' | 'notify' | 'workflow' | 'custom';
  config: Record<string, unknown>;
  async?: boolean;
}

export interface BusinessRuleMetadata {
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  documentation?: string;
}

// Performance Types
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage?: number;
  cacheHits?: number;
  cacheMisses?: number;
  queryCount?: number;
  errorCount?: number;
  retryCount?: number;
}

// Process Types
export interface ProcessResult {
  success: boolean;
  message: string;
  data?: unknown;
  warnings?: string[];
  metrics?: PerformanceMetrics;
}

export interface RuleEnforcementResult {
  passed: boolean;
  violations: RuleViolation[];
  warnings: RuleWarning[];
  appliedRules: string[];
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  field?: string;
  value?: unknown;
}

export interface RuleWarning {
  ruleId: string;
  ruleName: string;
  message: string;
  recommendation?: string;
}

// Insight and Analytics Types
export interface InsightResult {
  insights: Insight[];
  metadata: InsightMetadata;
  confidence: number;
  generatedAt: Date;
}

export interface Insight {
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation' | 'prediction';
  category: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  confidence: number;
  data: Record<string, unknown>;
  actions?: RecommendedAction[];
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
}

export interface InsightMetadata {
  dataSource: string;
  algorithm: string;
  parameters: Record<string, unknown>;
  dataRange: DateRange;
  sampleSize: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Metrics and KPI Types
export interface MetricResult {
  metrics: Metric[];
  aggregations: MetricAggregation[];
  metadata: MetricMetadata;
  timestamp: Date;
}

export interface Metric {
  name: string;
  category: string;
  value: number | string | boolean;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  trend?: TrendDirection;
  target?: number;
  thresholds?: MetricThresholds;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface MetricThresholds {
  warning?: number;
  critical?: number;
  target?: number;
}

export interface MetricAggregation {
  type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct';
  field: string;
  value: number;
  groupBy?: string[];
}

export interface MetricMetadata {
  timeGranularity: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  filters: Record<string, unknown>;
  dataSource: string;
  refreshRate: number;
}

// Trend Prediction Types
export interface TrendPrediction {
  predictions: Prediction[];
  confidence: number;
  model: ModelMetadata;
  horizon: number;
  generatedAt: Date;
}

export interface Prediction {
  timestamp: Date;
  value: number;
  confidence: number;
  bounds?: {
    lower: number;
    upper: number;
  };
  factors?: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  influence: number;
  category: string;
  description?: string;
}

export interface ModelMetadata {
  name: string;
  version: string;
  algorithm: string;
  accuracy: number;
  trainedAt: Date;
  features: string[];
}

// Integration Types
export interface IntegrationResult {
  success: boolean;
  system: string;
  operation: string;
  data?: unknown;
  errors?: IntegrationError[];
  performance: PerformanceMetrics;
  timestamp: Date;
}

export interface IntegrationError {
  code: string;
  message: string;
  system: string;
  recoverable: boolean;
  retryAfter?: number;
}

// Generic Data Object
export interface DataObject {
  [key: string]: string | number | boolean | null;
}


// Feature Engineering Types
export interface FeatureEngineeringResult {
  engineeredFeatures: EngineeredFeature[];
  transformedData: DataObject[];
  metadata: FeatureEngineeringMetadata;
}

export interface EngineeredFeature {
  name: string;
  type: 'polynomial' | 'interaction' | 'binning' | 'encoding';
  sourceColumns: string[];
  description: string;
}

export interface FeatureEngineeringMetadata {
  totalFeatures: number;
  executionTime: number;
  algorithm: string;
}

// Feature Selection Types
export interface FeatureSelectionResult {
  selectedFeatures: SelectedFeature[];
  metadata: FeatureSelectionMetadata;
}

export interface SelectedFeature {
  name: string;
  importance: number;
  selectionMethod: 'variance_threshold' | 'correlation' | 'mock';
}

export interface FeatureSelectionMetadata {
  totalFeaturesSelected: number;
  executionTime: number;
  algorithm: string;
}

// Ensemble Types
export interface EnsembleResult {
  ensembleModelId: string;
  baseModels: string[];
  ensembleStrategy: 'averaging' | 'stacking';
  score: number;
  metadata: EnsembleMetadata;
}

export interface EnsembleMetadata {
  executionTime: number;
  correlationMatrix?: number[][];
}