// Types and interfaces for ML API

export interface MLStatus {
  status: string;
  metrics: {
    uptime: string;
    active_models: number;
    model_accuracy: number;
    predictions_per_second: number;
    anomaly_detection_rate: number;
  };
  components: {
    model_registry: {
      total_models: number;
      active_models: number;
      training_models: number;
      deployed_models: number;
      model_types: string[];
    };
    training_pipeline: {
      status: string;
      jobs_queued: number;
      jobs_running: number;
      jobs_completed: number;
      average_training_time: string;
    };
    prediction_engine: {
      status: string;
      requests_per_second: number;
      average_response_time: string;
      accuracy_threshold: number;
      real_time_processing: boolean;
    };
    anomaly_detection: {
      algorithms_active: string[];
      detection_rate: number;
      false_positive_rate: number;
      sensitivity: string;
    };
    feature_engineering: {
      feature_store_size: string;
      features_available: number;
      automated_feature_selection: boolean;
      real_time_features: number;
    };
  };
}

export interface MLModel {
  id: string;
  name: string;
  type: string;
  status: string;
  accuracy: number;
  version: string;
  last_trained: string;
  predictions_today: number;
}

export interface ModelsData {
  total_models: number;
  models: MLModel[];
}

export interface SystemPerformance {
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  disk_usage: number;
  network_throughput: string;
}

export interface ModelPerformance {
  average_inference_time: string;
  throughput: string;
  queue_length: number;
  error_rate: string;
}

export interface TrainingMetrics {
  active_training_jobs: number;
  queued_jobs: number;
  completed_jobs_today: number;
  average_training_time: string;
}

export interface PerformanceData {
  system_performance: SystemPerformance;
  model_performance: ModelPerformance;
  training_metrics: TrainingMetrics;
}

export interface MLProfile {
  model_name: string;
  algorithm_type: string;
  confidence_score: number;
  prediction_accuracy: number;
}

export interface ThreatSeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SecurityInsights {
  threats_detected: number;
  threat_severity_distribution: ThreatSeverityDistribution;
  anomaly_score: number;
  behavioral_patterns: string[];
}

export interface ConfidenceLevels {
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
}

export interface AnomalyDetection {
  anomalies_found: number;
  anomaly_types: string[];
  confidence_levels: ConfidenceLevels;
}

export interface MLAnalysis {
  analysis_id: string;
  ml_profile: MLProfile;
  security_insights: SecurityInsights;
  anomaly_detection: AnomalyDetection;
  recommendations: string[];
}

export interface ModelConfig {
  model_type: string;
  algorithm: string;
  training_data_size: number;
  validation_split: number;
  hyperparameter_tuning: boolean;
}

export interface TrainingProgress {
  status: string;
  estimated_duration: string;
  current_epoch: number;
  total_epochs: number;
  current_loss: number | null;
  validation_accuracy: number | null;
}

export interface ResourceAllocation {
  cpu_cores: number;
  memory_gb: number;
  gpu_count: number;
  storage_gb: number;
}

export interface ExpectedOutcomes {
  target_accuracy: number;
  model_size_mb: number;
  inference_time_ms: number;
  deployment_ready: string;
}

export interface ModelTraining {
  training_id: string;
  model_config: ModelConfig;
  training_progress: TrainingProgress;
  resource_allocation: ResourceAllocation;
  expected_outcomes: ExpectedOutcomes;
}

export interface DetectionConfig {
  algorithms: string[];
  sensitivity_level: string;
  time_window: string;
  feature_selection: string;
}

export interface AnomalyResults {
  total_data_points_analyzed: number;
  anomalies_detected: number;
  anomaly_rate: string;
  confidence_distribution: ConfidenceLevels;
}

export interface AnomalyCategory {
  category: string;
  count: number;
  severity: string;
  description: string;
}

export interface AnomalyDetectionResult {
  detection_id: string;
  detection_config: DetectionConfig;
  anomaly_results: AnomalyResults;
  anomaly_categories: AnomalyCategory[];
  recommended_actions: string[];
}

export interface ExecutiveSummary {
  total_predictions: number;
  threats_detected: number;
  anomalies_identified: number;
  model_accuracy: number;
  false_positive_rate: string;
}

export interface ModelPerformanceReport {
  active_models: number;
  average_accuracy: number;
  prediction_latency: string;
  throughput: string;
  uptime: string;
}

export interface ThreatAnalysis {
  threat_categories_detected: string[];
  severity_breakdown: ThreatSeverityDistribution;
  trending_threats: string[];
}

export interface InvestigationOutcomes {
  confirmed_threats: number;
  false_positives: number;
  under_investigation: number;
}

export interface AnomalyInsights {
  anomaly_detection_rate: number;
  top_anomaly_types: string[];
  investigation_outcomes: InvestigationOutcomes;
}

export interface ReportSections {
  executive_summary: ExecutiveSummary;
  model_performance: ModelPerformanceReport;
  threat_analysis: ThreatAnalysis;
  anomaly_insights: AnomalyInsights;
}

export interface MLReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  time_period: string;
  report_sections: ReportSections;
  recommendations: string[];
  download_url: string;
}

export interface RunAnalysisRequest {
  mlData?: {
    model_type?: string;
  };
}

export interface TrainModelRequest {
  trainingData?: {
    model_type?: string;
    algorithm?: string;
    validation_split?: number;
    hyperparameter_tuning?: boolean;
  };
}

export interface DetectAnomaliesRequest {
  anomalyData?: {
    detection_algorithms?: string[];
    sensitivity_level?: string;
    time_window?: string;
    feature_selection?: string;
  };
}

export interface GenerateReportRequest {
  reportData?: {
    report_type?: string;
    time_period?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  timestamp: string;
}
