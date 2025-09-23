/**
 * Enterprise ML Core - Type Definitions
 * Complete enterprise-grade machine learning platform interfaces
 */

export interface PhantomMLCore {
  // Model Operations
  loadModel(modelPath: string, config?: ModelConfig): Promise<MLModel>;
  trainModel(data: TrainingData, config: TrainingConfig): Promise<MLModel>;
  validateModel(model: MLModel, testData: TestData): Promise<ValidationResult>;
  optimizeModel(model: MLModel, config: OptimizationConfig): Promise<MLModel>;
  explainModel(model: MLModel, data?: any[]): Promise<ModelExplanation>;
  exportModel(model: MLModel, format: ExportFormat): Promise<Buffer>;
  versionModel(model: MLModel, version: string): Promise<string>;

  // Data Operations
  preprocessData(data: any[], config: PreprocessConfig): Promise<ProcessedData>;
  validateData(data: any[], schema: DataSchema): Promise<ValidationResult>;
  transformData(data: any[], transformations: Transformation[]): Promise<any[]>;

  // Prediction Operations
  predict(model: MLModel, data: any[]): Promise<PredictionResult>;
  batchPredict(model: MLModel, data: any[][]): Promise<PredictionResult[]>;

  // Feature Operations
  extractFeatures(data: any[], config: FeatureConfig): Promise<Feature[]>;
  selectFeatures(features: Feature[], criteria: SelectionCriteria): Promise<Feature[]>;

  // Evaluation Operations
  evaluateModel(model: MLModel, data: any[], metrics: string[]): Promise<EvaluationResult>;
  compareModels(models: MLModel[], data: any[]): Promise<ComparisonResult>;
}

export interface MLModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  metadata: ModelMetadata;
  parameters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelMetadata {
  algorithm: string;
  framework: string;
  version: string;
  author: string;
  description?: string;
  tags: string[];
  metrics?: Record<string, number>;
}

export interface TrainingData {
  features: any[][];
  targets: any[];
  weights?: number[];
  metadata?: Record<string, any>;
}

export interface TrainingConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  validationSplit?: number;
  crossValidation?: CrossValidationConfig;
  earlyStoping?: EarlyStoppingConfig;
  regularization?: RegularizationConfig;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  metrics: Record<string, number>;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface PredictionResult {
  predictions: any[];
  confidence: number[];
  probabilities?: number[][];
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface Feature {
  name: string;
  type: FeatureType;
  importance?: number;
  description?: string;
  statistics?: FeatureStatistics;
}

export interface ModelExplanation {
  globalExplanation: GlobalExplanation;
  localExplanations?: LocalExplanation[];
  featureImportances: FeatureImportance[];
  metadata: Record<string, any>;
}

// Enterprise-specific interfaces
export interface EnterpriseConfig {
  tenantId: string;
  environment: 'development' | 'staging' | 'production';
  security: SecurityConfig;
  compliance: ComplianceConfig;
  monitoring: MonitoringConfig;
  persistence: PersistenceConfig;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  auditLogging: boolean;
  rbacEnabled: boolean;
  apiKeyRequired: boolean;
  rateLimiting: RateLimitConfig;
}

export interface ComplianceConfig {
  framework: ComplianceFramework;
  dataRetentionDays: number;
  privacyControls: PrivacyControl[];
  auditRequirements: AuditRequirement[];
}

export interface MonitoringConfig {
  metricsEnabled: boolean;
  alertingEnabled: boolean;
  logLevel: LogLevel;
  performanceTracking: boolean;
}

export interface PersistenceConfig {
  provider: PersistenceProvider;
  connectionString: string;
  encryptionKey?: string;
  backupEnabled: boolean;
}

// Analytics & Insights Types
export interface TrendAnalysis {
  metric: string;
  timeframe: TimeFrame;
  trend: TrendDirection;
  confidence: number;
  dataPoints: DataPoint[];
  forecast?: ForecastData;
}

export interface CorrelationAnalysis {
  variables: string[];
  correlationMatrix: number[][];
  significantCorrelations: CorrelationPair[];
  method: CorrelationMethod;
}

export interface StatisticalSummary {
  variable: string;
  count: number;
  mean: number;
  median: number;
  mode: any;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  quartiles: [number, number, number];
  skewness: number;
  kurtosis: number;
}

export interface DataQualityAssessment {
  overallScore: number;
  completeness: QualityMetric;
  accuracy: QualityMetric;
  consistency: QualityMetric;
  validity: QualityMetric;
  uniqueness: QualityMetric;
  recommendations: QualityRecommendation[];
}

export interface FeatureImportanceAnalysis {
  modelId: string;
  method: ImportanceMethod;
  rankings: FeatureRanking[];
  stability: number;
  explanation: string;
}

export interface BusinessImpactAnalysis {
  modelId: string;
  businessValue: number;
  costSavings: number;
  revenueImpact: number;
  riskReduction: number;
  recommendations: BusinessRecommendation[];
}

// Real-time Processing Types
export interface StreamConfig {
  streamId: string;
  batchSize: number;
  windowSize: number;
  processingLatency: number;
  errorHandling: ErrorHandlingStrategy;
}

export interface AlertConfig {
  name: string;
  condition: AlertCondition;
  threshold: number;
  severity: AlertSeverity;
  channels: NotificationChannel[];
}

export interface ThresholdConfig {
  metric: string;
  upperThreshold?: number;
  lowerThreshold?: number;
  window: TimeWindow;
  action: ThresholdAction;
}

// Business Intelligence Types
export interface ROICalculation {
  modelId: string;
  investment: number;
  returns: number;
  timeframe: TimeFrame;
  roi: number;
  npv: number;
  irr: number;
}

export interface CostBenefitAnalysis {
  modelId: string;
  costs: CostBreakdown;
  benefits: BenefitBreakdown;
  netBenefit: number;
  benefitCostRatio: number;
  paybackPeriod: number;
}

export interface PerformanceForecasting {
  modelId: string;
  currentPerformance: PerformanceMetrics;
  forecastedPerformance: PerformanceMetrics;
  confidenceInterval: [number, number];
  assumptions: string[];
}

export interface ResourceOptimization {
  currentUsage: ResourceUsage;
  optimizedUsage: ResourceUsage;
  savings: ResourceSavings;
  recommendations: OptimizationRecommendation[];
}

export interface BusinessMetrics {
  modelId: string;
  kpis: KPI[];
  businessValue: number;
  userSatisfaction: number;
  operationalEfficiency: number;
  timestamp: Date;
}

// Audit and Compliance Types
export interface AuditTrail {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  outcome: AuditOutcome;
}

export interface ComplianceReport {
  id: string;
  framework: ComplianceFramework;
  period: ReportPeriod;
  compliance: ComplianceStatus;
  findings: ComplianceFinding[];
  recommendations: ComplianceRecommendation[];
  generatedAt: Date;
  generatedBy: string;
}

export interface SecurityScan {
  id: string;
  scanType: SecurityScanType;
  results: SecurityFinding[];
  riskScore: number;
  executedAt: Date;
  recommendations: SecurityRecommendation[];
}

// Enums and Constants
export enum ModelType {
  REGRESSION = 'regression',
  CLASSIFICATION = 'classification',
  CLUSTERING = 'clustering',
  TIME_SERIES = 'time_series',
  DEEP_LEARNING = 'deep_learning',
  ENSEMBLE = 'ensemble'
}

export enum FeatureType {
  NUMERICAL = 'numerical',
  CATEGORICAL = 'categorical',
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum ExportFormat {
  ONNX = 'onnx',
  PMML = 'pmml',
  PICKLE = 'pickle',
  JSON = 'json',
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch'
}

export enum ComplianceFramework {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  SOC2 = 'soc2',
  ISO27001 = 'iso27001',
  PCI_DSS = 'pci_dss',
  FEDRAMP = 'fedramp'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum PersistenceProvider {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  ELASTICSEARCH = 'elasticsearch',
  S3 = 's3'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum SecurityScanType {
  VULNERABILITY = 'vulnerability',
  COMPLIANCE = 'compliance',
  PENETRATION = 'penetration',
  CODE_ANALYSIS = 'code_analysis'
}

// Helper Types
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';
export type CorrelationMethod = 'pearson' | 'spearman' | 'kendall';
export type ImportanceMethod = 'permutation' | 'shap' | 'lime' | 'eli5';
export type ErrorHandlingStrategy = 'ignore' | 'retry' | 'fallback' | 'circuit_breaker';
export type ThresholdAction = 'alert' | 'scale' | 'stop' | 'restart';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant';

// Complex nested types
export interface ModelConfig {
  name?: string;
  version?: string;
  metadata?: Record<string, any>;
  cache?: boolean;
  timeout?: number;
}

export interface CrossValidationConfig {
  folds: number;
  stratified?: boolean;
  shuffle?: boolean;
  randomState?: number;
}

export interface EarlyStoppingConfig {
  monitor: string;
  patience: number;
  minDelta?: number;
  restoreBestWeights?: boolean;
}

export interface RegularizationConfig {
  l1?: number;
  l2?: number;
  dropout?: number;
  batchNorm?: boolean;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface FeatureStatistics {
  mean?: number;
  median?: number;
  mode?: any;
  std?: number;
  min?: number;
  max?: number;
  nullCount: number;
  uniqueCount: number;
}

export interface GlobalExplanation {
  method: string;
  importance: FeatureImportance[];
  summary: string;
}

export interface LocalExplanation {
  instanceId: string;
  features: LocalFeatureImportance[];
  prediction: any;
  confidence: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

export interface LocalFeatureImportance extends FeatureImportance {
  value: any;
  contribution: number;
}