// Utility functions for ML API

import { ApiResponse } from './types';

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success,
    source: 'phantom-ml-core',
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (error !== undefined) {
    response.error = error;
  }
  
  return response;
}

/**
 * Generate random ML analysis ID
 */
export function generateAnalysisId(): string {
  return 'ml-analysis-' + Date.now();
}

/**
 * Generate random training job ID
 */
export function generateTrainingId(): string {
  return 'training-job-' + Date.now();
}

/**
 * Generate random anomaly detection ID
 */
export function generateDetectionId(): string {
  return 'anomaly-detection-' + Date.now();
}

/**
 * Generate random ML report ID
 */
export function generateReportId(): string {
  return 'ml-report-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random percentage (0.0 - 1.0)
 */
export function randomPercentage(): number {
  return Math.random();
}

/**
 * Generate random high accuracy score (0.7 - 1.0)
 */
export function randomHighAccuracy(): number {
  return Math.random() * 0.3 + 0.7;
}

/**
 * Generate random ML confidence score (0.8 - 1.0)
 */
export function randomConfidence(): number {
  return Math.random() * 0.2 + 0.8;
}

/**
 * Generate random system resource usage (0.3 - 0.7)
 */
export function randomResourceUsage(): number {
  return Math.random() * 0.4 + 0.3;
}

/**
 * Generate random low error rate (0.0 - 0.02)
 */
export function randomLowErrorRate(): number {
  return Math.random() * 0.02;
}

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index] as T;
}

/**
 * Get random items from array
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Handle API errors consistently
 */
export function handleError(error: unknown): ApiResponse {
  console.error('Phantom ML Core API error:', error);
  return createApiResponse(
    false,
    undefined,
    error instanceof Error ? error.message : 'Unknown error'
  );
}

/**
 * Log operation for debugging
 */
export function logOperation(operation: string, params?: any): void {
  console.log('ML Core API - Received operation:', operation);
  if (params) {
    console.log('ML Core API - Full body:', JSON.stringify(params, null, 2));
  }
}

/**
 * Common ML model types
 */
export const MODEL_TYPES = [
  'classification',
  'anomaly_detection',
  'clustering',
  'time_series',
  'regression',
  'neural_network'
];

/**
 * Common ML algorithms
 */
export const ALGORITHMS = [
  'ensemble_methods',
  'random_forest',
  'gradient_boosting',
  'svm',
  'neural_network',
  'isolation_forest',
  'one_class_svm',
  'autoencoder',
  'lstm',
  'transformer'
];

/**
 * Common anomaly detection algorithms
 */
export const ANOMALY_ALGORITHMS = [
  'isolation_forest',
  'one_class_svm',
  'autoencoder',
  'local_outlier_factor',
  'elliptic_envelope'
];

/**
 * Common behavioral patterns
 */
export const BEHAVIORAL_PATTERNS = [
  'unusual_login_times',
  'abnormal_data_access',
  'suspicious_network_traffic',
  'irregular_file_operations',
  'anomalous_privilege_usage',
  'unexpected_system_calls',
  'unusual_communication_patterns',
  'abnormal_resource_consumption'
];

/**
 * Common anomaly types
 */
export const ANOMALY_TYPES = [
  'network_behavior',
  'user_activity',
  'system_performance',
  'data_access',
  'application_behavior',
  'security_events'
];

/**
 * Common threat categories
 */
export const THREAT_CATEGORIES = [
  'malware',
  'phishing',
  'insider_threat',
  'ddos',
  'data_breach',
  'ransomware',
  'apt',
  'zero_day'
];

/**
 * Common sensitivity levels
 */
export const SENSITIVITY_LEVELS = ['low', 'medium', 'high', 'critical'];

/**
 * Common time windows
 */
export const TIME_WINDOWS = ['1_hour', '24_hours', '7_days', '30_days'];

/**
 * Common feature selection methods
 */
export const FEATURE_SELECTION_METHODS = ['automated', 'manual', 'hybrid', 'statistical'];

/**
 * Common ML recommendations
 */
export const ML_RECOMMENDATIONS = [
  'Increase monitoring on high-risk user activities detected by ML model',
  'Deploy additional behavioral analytics for suspicious patterns',
  'Update threat detection thresholds based on recent anomaly patterns',
  'Schedule retraining of classification model with latest threat data',
  'Implement real-time alerting for high-confidence predictions',
  'Review and validate low-confidence predictions for model improvement',
  'Expand ML model coverage to include emerging threat vectors',
  'Implement federated learning for improved threat intelligence sharing',
  'Enhance real-time processing capabilities for faster threat response',
  'Deploy additional behavioral analytics models for insider threat detection',
  'Integrate threat intelligence feeds to improve model accuracy',
  'Schedule quarterly model retraining with latest security data'
];

/**
 * Common anomaly recommended actions
 */
export const ANOMALY_ACTIONS = [
  'Investigate high-confidence network behavior anomalies immediately',
  'Review user activity patterns for potential insider threats',
  'Monitor system performance metrics for infrastructure issues',
  'Update anomaly detection thresholds based on recent patterns',
  'Schedule detailed forensic analysis of top anomalies'
];

/**
 * Common trending threats
 */
export const TRENDING_THREATS = [
  'AI-powered phishing campaigns',
  'Zero-day exploits',
  'Supply chain attacks',
  'Ransomware-as-a-Service',
  'Cloud infrastructure attacks',
  'IoT botnets',
  'Deepfake social engineering',
  'Quantum-resistant encryption bypass'
];

/**
 * Generate random threat severity distribution
 */
export function generateThreatSeverityDistribution() {
  return {
    critical: randomInRange(0, 3),
    high: randomInRange(2, 10),
    medium: randomInRange(5, 15),
    low: randomInRange(10, 25)
  };
}

/**
 * Generate random confidence levels distribution
 */
export function generateConfidenceLevels() {
  return {
    high_confidence: randomInRange(2, 8),
    medium_confidence: randomInRange(3, 12),
    low_confidence: randomInRange(1, 6)
  };
}

/**
 * Generate random system performance metrics
 */
export function generateSystemPerformance() {
  return {
    cpu_usage: randomResourceUsage(),
    memory_usage: Math.random() * 0.3 + 0.4, // 40-70%
    gpu_usage: Math.random() * 0.5 + 0.5, // 50-100%
    disk_usage: Math.random() * 0.2 + 0.3, // 30-50%
    network_throughput: randomInRange(200, 700) + ' MB/s'
  };
}

/**
 * Generate random model performance metrics
 */
export function generateModelPerformance() {
  return {
    average_inference_time: randomInRange(20, 70) + 'ms',
    throughput: randomInRange(1000, 1500) + ' predictions/sec',
    queue_length: randomInRange(0, 20),
    error_rate: (randomLowErrorRate()).toFixed(3) + '%'
  };
}

/**
 * Generate random training metrics
 */
export function generateTrainingMetrics() {
  return {
    active_training_jobs: randomInRange(1, 6),
    queued_jobs: randomInRange(2, 10),
    completed_jobs_today: randomInRange(15, 35),
    average_training_time: randomInRange(10, 40) + ' minutes'
  };
}

/**
 * Generate random anomaly category
 */
export function generateAnomalyCategory(category: string, severity: string, description: string) {
  return {
    category,
    count: randomInRange(2, 20),
    severity,
    description
  };
}

/**
 * Generate download URL for reports
 */
export function generateReportDownloadUrl(reportType: string): string {
  return `/api/reports/${reportType}-${Date.now()}.pdf`;
}
