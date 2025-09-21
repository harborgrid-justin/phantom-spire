/**
 * Type definitions for the Model Builder module
 */

export interface Dataset {
  id: string;
  name: string;
  description: string;
  rows: number;
  columns: number;
  size: string;
  type: 'csv' | 'json' | 'sample';
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: 'classification' | 'regression' | 'clustering' | 'neural-networks';
  description: string;
  pros: string[];
  cons: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedAccuracy: number;
  trainingTime: string;
  inferenceSpeed: string;
}

export interface Column {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'datetime';
  nullCount: number;
  unique: number;
}

export interface ModelBuilderState {
  activeStep: number;
  selectedDataset: Dataset | null;
  selectedFeatures: string[];
  selectedTargetColumn: string;
  selectedAlgorithmCategory: string;
  selectedAlgorithms: AlgorithmInfo[];
  selectedAlgorithm: AlgorithmInfo | null;
  showRecommendations: boolean;
  complexityFilter: string;
  showAlgorithmConfig: boolean;
  validationError: string | null;
}
