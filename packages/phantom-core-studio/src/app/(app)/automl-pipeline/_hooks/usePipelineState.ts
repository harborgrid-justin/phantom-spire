/**
 * Custom Hook for Pipeline State Management
 * Manages pipeline data, selected pipeline, and related state
 */

import { useState, useEffect } from 'react';
import type {
  Pipeline,
  PipelineStep,
  AlgorithmPerformance
} from '../_lib/types';

export const usePipelineState = () => {
  // Core pipeline data
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [algorithmPerformance, setAlgorithmPerformance] = useState<AlgorithmPerformance[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data
  const generateMockData = () => {
    const mockPipelines: Pipeline[] = [
      {
        id: 'pipeline_4',
        name: 'Employee Performance Prediction',
        status: 'pending',
        progress: 0,
        currentStep: 'Ready to Execute',
        algorithm: 'Not Selected',
        accuracy: 0.0,
        startTime: new Date(),
        estimatedTime: 0,
        datasetId: 'dataset_employee_performance'
      },
      {
        id: 'pipeline_1',
        name: 'Customer Churn Prediction',
        status: 'running',
        progress: 65,
        currentStep: 'Feature Engineering',
        algorithm: 'Random Forest',
        accuracy: 0.87,
        startTime: new Date(Date.now() - 1800000),
        estimatedTime: 900000,
        datasetId: 'dataset_customer_churn'
      },
      {
        id: 'pipeline_2',
        name: 'Fraud Detection Model',
        status: 'completed',
        progress: 100,
        currentStep: 'Model Validation',
        algorithm: 'Gradient Boosting',
        accuracy: 0.94,
        startTime: new Date(Date.now() - 3600000),
        estimatedTime: 0,
        datasetId: 'dataset_fraud'
      },
      {
        id: 'pipeline_3',
        name: 'Revenue Forecasting',
        status: 'failed',
        progress: 45,
        currentStep: 'Model Training',
        algorithm: 'XGBoost',
        accuracy: 0.0,
        startTime: new Date(Date.now() - 2400000),
        estimatedTime: 0,
        datasetId: 'dataset_revenue'
      }
    ];

    const mockSteps: PipelineStep[] = [
      { id: 'step_1', name: 'Data Preprocessing', status: 'completed', duration: 30000 },
      { id: 'step_2', name: 'Feature Engineering', status: 'running', duration: 0 },
      { id: 'step_3', name: 'Algorithm Selection', status: 'pending', duration: 0 },
      { id: 'step_4', name: 'Model Training', status: 'pending', duration: 0 },
      { id: 'step_5', name: 'Hyperparameter Tuning', status: 'pending', duration: 0 },
      { id: 'step_6', name: 'Model Validation', status: 'pending', duration: 0 }
    ];

    const mockAlgorithmPerformance: AlgorithmPerformance[] = [
      { 
        algorithm: 'Random Forest', 
        accuracy: 0.87, 
        f1Score: 0.85, 
        precision: 0.88, 
        recall: 0.83, 
        trainingTime: 45000, 
        status: 'completed' 
      },
      { 
        algorithm: 'Gradient Boosting', 
        accuracy: 0.89, 
        f1Score: 0.87, 
        precision: 0.90, 
        recall: 0.85, 
        trainingTime: 62000, 
        status: 'completed' 
      },
      { 
        algorithm: 'XGBoost', 
        accuracy: 0.91, 
        f1Score: 0.89, 
        precision: 0.92, 
        recall: 0.87, 
        trainingTime: 78000, 
        status: 'running' 
      },
      { 
        algorithm: 'Neural Network', 
        accuracy: 0.0, 
        f1Score: 0.0, 
        precision: 0.0, 
        recall: 0.0, 
        trainingTime: 0, 
        status: 'running' 
      }
    ];

    return { mockPipelines, mockSteps, mockAlgorithmPerformance };
  };

  // Fetch pipelines data
  const fetchPipelines = async () => {
    try {
      // In a real app, this would be API calls
      const { mockPipelines, mockSteps, mockAlgorithmPerformance } = generateMockData();
      
      setPipelines(mockPipelines);
      setPipelineSteps(mockSteps);
      setAlgorithmPerformance(mockAlgorithmPerformance);
      
      // Select the first pipeline by default
      setSelectedPipeline(mockPipelines[0] || null);
      setLoading(false);
    } catch {
      setError('Failed to fetch pipeline data');
      setLoading(false);
    }
  };

  // Update pipeline in the list
  const updatePipeline = (pipelineId: string, updates: Partial<Pipeline>) => {
    setPipelines(prev => prev.map(p => 
      p.id === pipelineId ? { ...p, ...updates } : p
    ));
    
    // Update selected pipeline if it matches
    setSelectedPipeline(prev => 
      prev?.id === pipelineId ? { ...prev, ...updates } : prev
    );
  };

  // Add new pipeline
  const addPipeline = (pipeline: Pipeline) => {
    setPipelines(prev => [pipeline, ...prev]);
  };

  // Update pipeline steps
  const updateSteps = (steps: PipelineStep[]) => {
    setPipelineSteps(steps);
  };

  // Select pipeline
  const selectPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
  };

  // Effect for data fetching
  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    // State
    pipelines,
    selectedPipeline,
    pipelineSteps,
    algorithmPerformance,
    loading,
    error,
    
    // Actions
    fetchPipelines,
    updatePipeline,
    addPipeline,
    updateSteps,
    selectPipeline,
    setError,
    setLoading
  };
};
