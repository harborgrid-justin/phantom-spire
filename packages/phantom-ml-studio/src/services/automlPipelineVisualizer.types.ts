/**
 * AutoML Pipeline Visualizer Service Type Definitions
 */

import { BusinessLogicRequest, BusinessLogicResponse } from './core/types/business-logic.types';

export interface PipelineStep {
  id: string;
  name: string;
  type: 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'algorithm_selection' | 'training' | 'validation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  progress?: number;
  details?: Record<string, unknown>;
  securityScore?: number;
}

export interface AutoMLExperiment {
  id: string;
  name: string;
  status: 'configuring' | 'running' | 'completed' | 'failed';
  startTime: string;
  duration?: number;
  pipeline: PipelineStep[];
  bestModel?: {
    algorithm: string;
    accuracy: number;
    securityScore: number;
    explainabilityScore: number;
  };
}

export type GetAutoMLExperimentRequest = BusinessLogicRequest<{ experimentId: string }>;
export type GetAutoMLExperimentResponse = BusinessLogicResponse<AutoMLExperiment>;
