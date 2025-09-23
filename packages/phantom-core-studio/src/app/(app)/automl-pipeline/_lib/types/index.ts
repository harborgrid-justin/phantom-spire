/**
 * Types and interfaces for AutoML Pipeline Visualizer
 * Phantom Spire Enterprise ML Platform
 */

export interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'pending';
  progress: number;
  currentStep: string;
  algorithm: string;
  accuracy: number;
  startTime: Date;
  estimatedTime: number;
  datasetId: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: number;
  metrics?: Record<string, number>;
}

export interface AlgorithmPerformance {
  algorithm: string;
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  trainingTime: number;
  status: 'completed' | 'running' | 'failed';
}

export interface PipelineConfig {
  name: string;
  datasetId: string;
  maxTrainingTime: number;
  algorithms: string[];
  objective: string;
  targetColumn: string;
  optimizationMetric: string;
  timeConstraint: number;
  memoryConstraint: number;
  modelComplexity: string;
  interpretabilityLevel: string;
  preprocessing?: {
    scaling: boolean;
    encoding: boolean;
    missingValues: string;
    featureSelection: boolean;
  };
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  algorithms: string[];
  defaultConfig: Partial<PipelineConfig>;
}

export interface ExecutionState {
  isExecuting: boolean;
  executionPaused: boolean;
  executionComplete: boolean;
  executionError: boolean;
}

export interface DialogStates {
  createDialogOpen: boolean;
  cloneDialogOpen: boolean;
  templateDetailsOpen: boolean;
  draftNameDialog: boolean;
  estimationDialog: boolean;
  executionConfirmOpen: boolean;
}

export interface NotificationStates {
  showTemplateApplied: boolean;
  showPipelineCloned: boolean;
  showDraftSaved: boolean;
  showCreationError: boolean;
  showTimeEstimation: boolean;
  showDatasetPreview: boolean;
  uploadProgress: boolean;
  uploadSuccess: boolean;
}

export type WizardStep = 0 | 1 | 2 | 3;