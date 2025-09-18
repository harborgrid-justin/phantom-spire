/**
 * Types and interfaces for Training Page
 * Phantom Spire Enterprise ML Platform
 */

export type HyperparameterValue = string | number | boolean;

export interface TrainingJob {
  id: string;
  name: string;
  algorithm: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  progress: number;
  dataset: string;
  target: string;
  features: string[];
  hyperparameters: Record<string, HyperparameterValue>;
  metrics?: {
    accuracy?: number;
    f1Score?: number;
    precision?: number;
    recall?: number;
    rmse?: number;
    mae?: number;
  };
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  logUrl?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  size: number;
  rows: number;
  columns: number;
  features: string[];
  target?: string;
  type: 'classification' | 'regression' | 'clustering';
  quality: 'high' | 'medium' | 'low';
  lastModified: Date;
}

export interface Algorithm {
  name: string;
  displayName: string;
  type: 'classification' | 'regression' | 'clustering';
  description: string;
  hyperparameters: HyperparameterConfig[];
  complexity: 'low' | 'medium' | 'high';
  interpretability: 'high' | 'medium' | 'low';
  trainingTime: 'fast' | 'medium' | 'slow';
}

export interface HyperparameterConfig {
  name: string;
  displayName: string;
  type: 'int' | 'float' | 'string' | 'bool' | 'select';
  default: HyperparameterValue;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description: string;
  advanced?: boolean;
}

// Feature types for detailed feature configuration
export interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'datetime' | 'text';
  importance: number; // 0-1
  missingPercentage: number; // 0-1
  uniqueValues?: number;
  dataType: string;
  nullable: boolean;
  statistics?: {
    min?: number;
    max?: number;
    mean?: number;
    std?: number;
    mode?: string;
    categories?: string[];
  };
}

// Feature engineering configuration
export interface FeatureEngineering {
  scaling: boolean;
  scalingMethod: 'standard' | 'minmax' | 'robust' | 'normalizer';
  encoding: boolean;
  encodingMethod: 'onehot' | 'label' | 'target' | 'ordinal';
  polynomialFeatures: boolean;
  polynomialDegree: number;
  pca: boolean;
  pcaComponents: number; // 0-1 (percentage of variance to preserve)
}

// Enhanced hyperparameter interface for algorithm selection
export interface Hyperparameter {
  name: string;
  displayName: string;
  type: 'int' | 'float' | 'categorical' | 'boolean';
  default: HyperparameterValue;
  description: string;
  range?: {
    min?: number;
    max?: number;
    options?: string[];
  };
  advanced?: boolean;
}

export interface TrainingConfig {
  modelName: string;
  dataset: Dataset | null;
  algorithm: string;
  targetColumn: string;
  selectedFeatures: string[];
  hyperparameters: Record<string, HyperparameterValue>;
  autoML: boolean;
  crossValidation: boolean;
  testSize: number;
  randomState: number;
  maxTrainingTime?: number;
  earlyStoppingEnabled?: boolean;
}

export interface TrainingProgress {
  epoch?: number;
  totalEpochs?: number;
  loss?: number;
  validationLoss?: number;
  currentMetric?: number;
  bestMetric?: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

export interface ValidationResults {
  crossValidationScores?: number[];
  meanScore?: number;
  stdScore?: number;
  bestParams?: Record<string, HyperparameterValue>;
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface TrainingStep {
  id: number;
  label: string;
  description: string;
  optional?: boolean;
}

export const TRAINING_STEPS: TrainingStep[] = [
  {
    id: 0,
    label: 'Select Dataset',
    description: 'Choose and configure your training dataset'
  },
  {
    id: 1,
    label: 'Choose Algorithm',
    description: 'Select the machine learning algorithm'
  },
  {
    id: 2,
    label: 'Configure Features',
    description: 'Select target and input features'
  },
  {
    id: 3,
    label: 'Set Parameters',
    description: 'Configure hyperparameters and training options'
  },
  {
    id: 4,
    label: 'Review & Train',
    description: 'Review configuration and start training'
  }
];