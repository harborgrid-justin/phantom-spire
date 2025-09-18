/**
 * Model Builder Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse, DataObject, EngineeredFeature, SelectedFeature, EnsembleResult } from '../core';

// Use existing DataObject type from core instead of defining DataRow
export type DataRow = DataObject;

export type TaskType = 'classification' | 'regression' | 'anomaly_detection' | 'security_threat_detection';
export type OptimizationMetric = 'accuracy' | 'precision' | 'recall' | 'f1_score' | 'mse' | 'mae' | 'r2' | 'rmse';
export type AlgorithmType = 'simple_linear_regression' | 'random_forest_regression';

export interface ModelConfig {
  taskType: TaskType;
  targetColumn: string;
  optimizationMetric: OptimizationMetric;
  timeBudget: number;
  algorithms: AlgorithmType[];
  featureEngineering: boolean;
  crossValidationFolds: number;
  ensembleMethods: boolean;
  maxModels: number;
}

export interface ModelResult {
  modelId: string;
  algorithm: string;
  score: number;
  trainingTime: number;
  hyperparameters: Record<string, unknown>;
  crossValidationScores: number[];
}

export interface FeatureImportance {
  featureName: string;
  importance: number;
  rank: number;
}

export interface AutoMLResult {
  experimentId: string;
  bestModelId: string;
  bestAlgorithm: string;
  bestScore: number;
  leaderboard: ModelResult[];
  featureImportance: FeatureImportance[];
  engineeredFeatures?: EngineeredFeature[];
  selectedFeatures?: SelectedFeature[];
  ensembleResult?: EnsembleResult;
  trainingTimeSeconds: number;
  totalModelsTrained: number;
}

export interface UploadedData {
    headers: string[];
    data: DataRow[];
    errors: string[];
}

export type ParseDataRequest = BusinessLogicRequest<{ file: File }>;
export type ParseDataResponse = BusinessLogicResponse<UploadedData>;

export type StartTrainingRequest = BusinessLogicRequest<{ config: ModelConfig, columns: string[] }>;
export type StartTrainingResponse = BusinessLogicResponse<AutoMLResult>;
