// ML Management API Functions
// API layer for ML security analytics and management operations

import type {
  MLStatus,
  MLAnalysisData,
  ModelTrainingData,
  AnomalyDetectionData,
  MLReportData
} from '../types';

export const fetchMLStatus = async (): Promise<MLStatus> => {
  const response = await fetch('/api/phantom-cores/ml?operation=status');
  return response.json();
};

export const runMLAnalysis = async (mlData: MLAnalysisData) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'run-analysis',
      mlData
    })
  });
  return response.json();
};

export const trainModel = async (trainingData: ModelTrainingData) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'train-model',
      trainingData
    })
  });
  return response.json();
};

export const detectAnomalies = async (anomalyData: AnomalyDetectionData) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'detect-anomalies',
      anomalyData
    })
  });
  return response.json();
};

export const generateMLReport = async (reportData: MLReportData) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-ml-report',
      reportData
    })
  });
  return response.json();
};
