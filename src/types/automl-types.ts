/**
 * AutoML Types for Phantom ML Core
 * Defines interfaces and types used in the AutoML engine
 */

// Core AutoML Configuration
export interface AutoMLConfig {
  task_type: AutoMLTaskType;
  target_column: string;
  optimization_metric: string;
  time_budget_minutes: number;
  algorithms_to_try?: string[];
  feature_engineering: boolean;
  cross_validation_folds: number;
  ensemble_methods: boolean;
  max_models: number;
}

// Supported AutoML Task Types
export enum AutoMLTaskType {
  BinaryClassification = 'binary_classification',
  MultiClassClassification = 'multiclass_classification',
  Regression = 'regression',
  AnomalyDetection = 'anomaly_detection',
  TimeSeriesForecasting = 'timeseries_forecasting',
  SecurityThreatDetection = 'security_threat_detection',
}

// AutoML Training Result
export interface AutoMLResult {
  experiment_id: string;
  best_model_id: string;
  best_algorithm: string;
  best_score: number;
  leaderboard: ModelResult[];
  feature_importance: FeatureImportance[];
  training_time_seconds: number;
  total_models_trained: number;
  data_insights: DataInsights;
}

// Individual Model Result
export interface ModelResult {
  model_id: string;
  algorithm: string;
  score: number;
  training_time: number;
  hyperparameters: Record<string, any>;
  cross_validation_scores: number[];
}

// Feature Importance
export interface FeatureImportance {
  feature_name: string;
  importance_score: number;
  feature_type: string;
}

// Data Analysis Insights
export interface DataInsights {
  total_rows: number;
  total_features: number;
  missing_values_percentage: number;
  categorical_features: string[];
  numerical_features: string[];
  data_quality_score: number;
  recommended_preprocessing: string[];
}

// Hyperparameter Optimization Configuration
export interface HyperparameterOptimizationConfig {
  algorithm: string;
  optimization_method: OptimizationMethod;
  time_budget_seconds: number;
  parameter_space?: Record<string, any[]>;
  n_trials?: number;
  early_stopping?: boolean;
  patience?: number;
  min_improvement?: number;
  objectives?: string[];
}

// Optimization Methods
export enum OptimizationMethod {
  BayesianOptimization = 'bayesian',
  RandomSearch = 'random_search',
  GridSearch = 'grid_search',
  Hyperband = 'hyperband',
  NSGA2 = 'nsga2'
}

// Feature Engineering Configuration  
export interface FeatureEngineeringConfig {
  task_type: AutoMLTaskType;
  include_statistical_features?: boolean;
  include_interaction_features?: boolean;
  include_temporal_features?: boolean;
  include_text_features?: boolean;
  max_interaction_degree?: number;
  time_windows?: string[];
  extract_ip_features?: boolean;
  extract_content_features?: boolean;
  normalize_numerical?: boolean;
  handle_categorical?: boolean;
  detect_correlation?: boolean;
  correlation_threshold?: number;
}

// Security Feature Extraction Configuration
export interface SecurityFeatureConfig {
  extract_geo_features?: boolean;
  extract_asn_features?: boolean;
  extract_reputation_scores?: boolean;
  extract_entropy_features?: boolean;
  extract_pattern_features?: boolean;
  extract_linguistic_features?: boolean;
  extract_temporal_patterns?: boolean;
  extract_velocity_features?: boolean;
  extract_sequence_features?: boolean;
  reputation_sources?: string[];
  pattern_types?: string[];
  time_windows?: string[];
  sequence_analysis?: boolean;
}

// Cross-validation Configuration
export interface CrossValidationConfig {
  folds: number;
  stratified?: boolean;
  shuffle?: boolean;
  random_state?: number;
  group_column?: string;
  time_series?: boolean;
}

// Ensemble Configuration
export interface EnsembleConfig {
  method: EnsembleMethod;
  voting_type?: 'hard' | 'soft';
  weights?: number[];
  meta_learner?: string;
  cv_folds?: number;
}

// Ensemble Methods
export enum EnsembleMethod {
  Voting = 'voting',
  Bagging = 'bagging',
  Boosting = 'boosting',
  Stacking = 'stacking',
  Blending = 'blending'
}

// Model Explanation
export interface ModelExplanation {
  model_id: string;
  feature_contributions: Record<string, number>;
  prediction_confidence: number;
  explanation: string;
  shap_values?: number[];
  local_importance?: FeatureImportance[];
}

// Data Loading Configuration
export interface DataLoadingConfig {
  data_format?: 'csv' | 'json' | 'nested_json' | 'parquet' | 'streaming';
  features_path?: string;
  target_path?: string;
  separator?: string;
  encoding?: string;
  join_tables?: boolean;
  primary_key?: string;
  time_series?: boolean;
  timestamp_column?: string;
  value_column?: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  auc_roc?: number;
  auc_pr?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2_score?: number;
}

// Algorithm Types
export enum AlgorithmType {
  RandomForest = 'RandomForest',
  XGBoost = 'XGBoost',
  LightGBM = 'LightGBM',
  LogisticRegression = 'LogisticRegression',
  LinearRegression = 'LinearRegression',
  NeuralNetwork = 'NeuralNetwork',
  SVM = 'SVM',
  IsolationForest = 'IsolationForest',
  OneClassSVM = 'OneClassSVM',
  LocalOutlierFactor = 'LocalOutlierFactor',
  EnsembleClassifier = 'EnsembleClassifier'
}

// Training Configuration
export interface TrainingConfig {
  validation_split?: number;
  test_split?: number;
  batch_size?: number;
  epochs?: number;
  early_stopping?: boolean;
  patience?: number;
  min_delta?: number;
  verbose?: boolean;
}

// Security Data Types
export interface SecurityData {
  network_traffic?: NetworkTrafficData;
  log_data?: LogData;
  file_analysis?: FileAnalysisData;
  user_behavior?: UserBehaviorData;
  threat_intelligence?: ThreatIntelligenceData;
}

export interface NetworkTrafficData {
  src_ip: string;
  dst_ip: string;
  protocol: string;
  src_port: number;
  dst_port: number;
  bytes_in: number;
  bytes_out: number;
  duration: number;
  timestamp?: string;
}

export interface LogData {
  timestamp: string;
  level: string;
  message: string;
  source: string;
  ip_address?: string;
  user_id?: string;
}

export interface FileAnalysisData {
  filename: string;
  size_bytes: number;
  hash_md5: string;
  hash_sha256?: string;
  file_type: string;
  created_date: string;
  entropy?: number;
  pe_sections?: number;
  imports?: number;
  strings_count?: number;
  is_packed?: boolean;
  digital_signature?: boolean;
}

export interface UserBehaviorData {
  user_id: string;
  login_time_hour: number;
  session_duration_minutes: number;
  pages_visited: number;
  files_accessed: number;
  emails_sent: number;
  unusual_locations: boolean;
  off_hours_activity: boolean;
  timestamp?: string;
}

export interface ThreatIntelligenceData {
  ioc_value: string;
  ioc_type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  threat_type?: string;
  confidence_score: number;
  first_seen: string;
  last_seen?: string;
  source: string;
}

// Data Quality Metrics
export interface DataQualityMetrics {
  completeness_score: number;
  consistency_score: number;
  validity_score: number;
  uniqueness_score: number;
  overall_quality_score: number;
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: 'missing_values' | 'duplicates' | 'outliers' | 'inconsistency' | 'invalid_format';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_columns: string[];
  affected_rows_count: number;
}

// Experiment Tracking
export interface ExperimentMetadata {
  experiment_id: string;
  created_at: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  config: AutoMLConfig;
  metrics: PerformanceMetrics;
  artifacts: string[];
  notes?: string;
}

// Model Registry
export interface ModelMetadata {
  model_id: string;
  name: string;
  algorithm: AlgorithmType;
  version: string;
  created_at: string;
  status: 'training' | 'ready' | 'deployed' | 'archived';
  performance: PerformanceMetrics;
  hyperparameters: Record<string, any>;
  feature_names: string[];
  target_column: string;
  task_type: AutoMLTaskType;
}

// Deployment Configuration
export interface DeploymentConfig {
  model_id: string;
  deployment_type: 'batch' | 'realtime' | 'streaming';
  endpoint_url?: string;
  batch_size?: number;
  max_latency_ms?: number;
  scaling_config?: {
    min_instances: number;
    max_instances: number;
    cpu_request: string;
    memory_request: string;
  };
}