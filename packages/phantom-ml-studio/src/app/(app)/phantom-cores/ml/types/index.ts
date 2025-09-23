// ML Management Types
// Comprehensive type definitions for ML security analytics and management

export interface MLStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_models: number;
      model_accuracy: number;
      predictions_per_second: number;
      anomaly_detection_rate: number;
    };
  };
}

export interface MLAnalysis {
  analysis_id: string;
  ml_profile: {
    model_name: string;
    algorithm_type: string;
    confidence_score: number;
    prediction_accuracy: number;
  };
  security_insights: any;
  anomaly_detection: any;
  recommendations: string[];
}

export interface MLAnalysisData {
  model_type: string;
  data_source: string;
  analysis_window: string;
  confidence_threshold: number;
  include_feature_importance: boolean;
  real_time_processing: boolean;
}

export interface ModelTrainingData {
  model_type: string;
  training_data: string;
  algorithm: string;
  validation_split: number;
  hyperparameter_tuning: boolean;
}

export interface AnomalyDetectionData {
  detection_algorithms: string[];
  sensitivity_level: string;
  time_window: string;
  feature_selection: string;
}

export interface MLReportData {
  report_type: string;
  include_model_performance: boolean;
  include_threat_predictions: boolean;
  include_anomaly_analysis: boolean;
  time_period: string;
}

export interface MLOperation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

export type ModelType = 'anomaly_detection' | 'threat_classification' | 'behavioral_analysis' | 'predictive_modeling' | 'clustering' | 'time_series_analysis';

export type DataSource = 'network_traffic' | 'system_logs' | 'user_behavior' | 'file_activity' | 'endpoint_data' | 'threat_intelligence';

export type AccuracyColor = 'success' | 'warning' | 'error';
