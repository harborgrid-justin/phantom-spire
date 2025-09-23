// ML Management Hooks
// Custom hooks for ML security analytics and management functionality

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMLStatus, runMLAnalysis, trainModel, detectAnomalies, generateMLReport } from '../api';
import type { MLAnalysis, AccuracyColor, ModelType, DataSource } from '../types';

// Hook for fetching ML status with automatic refresh
export const useMLStatus = () => {
  return useQuery({
    queryKey: ['ml-status'],
    queryFn: fetchMLStatus,
    refetchInterval: 30000,
  });
};

// Hook for ML analysis operations
export const useMLAnalysis = () => {
  const [analysis, setAnalysis] = useState<MLAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState<ModelType>('anomaly_detection');
  const [dataSource, setDataSource] = useState<DataSource>('network_traffic');

  const modelTypes: ModelType[] = [
    'anomaly_detection', 'threat_classification', 'behavioral_analysis',
    'predictive_modeling', 'clustering', 'time_series_analysis'
  ];

  const dataSources: DataSource[] = [
    'network_traffic', 'system_logs', 'user_behavior', 'file_activity',
    'endpoint_data', 'threat_intelligence'
  ];

  const runMLSecurityAnalysis = async () => {
    setLoading(true);
    try {
      const result = await runMLAnalysis({
        model_type: modelType,
        data_source: dataSource,
        analysis_window: '1_hour',
        confidence_threshold: 0.8,
        include_feature_importance: true,
        real_time_processing: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('ML analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    modelType,
    setModelType,
    dataSource,
    setDataSource,
    modelTypes,
    dataSources,
    runMLSecurityAnalysis
  };
};

// Hook for ML operations
export const useMLOperations = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOperation = async (operationId: string, action: () => Promise<any>) => {
    setLoading(true);
    setActiveOperation(operationId);
    try {
      const result = await action();
      setOperationResult(result);
    } catch (error) {
      console.error(`Operation ${operationId} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runModelTraining = () => runOperation('train', async () => {
    const result = await trainModel({
      model_type: 'threat_detection',
      training_data: 'security_events_30_days',
      algorithm: 'ensemble_methods',
      validation_split: 0.2,
      hyperparameter_tuning: true
    });
    return result.data;
  });

  const runAnomalyDetection = () => runOperation('anomaly', async () => {
    const result = await detectAnomalies({
      detection_algorithms: ['isolation_forest', 'one_class_svm', 'autoencoder'],
      sensitivity_level: 'high',
      time_window: '24_hours',
      feature_selection: 'automated'
    });
    return result.data;
  });

  const runMLReportGeneration = () => runOperation('report', async () => {
    const result = await generateMLReport({
      report_type: 'ML Security Analytics Report',
      include_model_performance: true,
      include_threat_predictions: true,
      include_anomaly_analysis: true,
      time_period: '7_days'
    });
    return result.data;
  });

  return {
    activeOperation,
    operationResult,
    loading,
    runModelTraining,
    runAnomalyDetection,
    runMLReportGeneration
  };
};

// Utility hooks for ML calculations
export const useMLUtils = () => {
  const getAccuracyColor = (accuracy: number): AccuracyColor => {
    if (accuracy >= 0.95) return 'success';
    if (accuracy >= 0.85) return 'warning';
    return 'error';
  };

  return {
    getAccuracyColor
  };
};
