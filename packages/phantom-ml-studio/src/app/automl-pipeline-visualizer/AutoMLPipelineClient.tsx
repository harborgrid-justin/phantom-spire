/**
 * AutoML Pipeline Client - Main Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Component imports
import PipelineTemplates from './components/PipelineTemplates';
import RecentPipelines from './components/RecentPipelines';
import PipelineOverview from './components/PipelineOverview';
import PipelineSteps from './components/PipelineSteps';
import AlgorithmPerformanceComponent from './components/AlgorithmPerformance';

// Type imports
import type {
  Pipeline,
  PipelineStep,
  AlgorithmPerformance,
  PipelineConfig,
  PipelineTemplate,
  ExecutionState,
  DialogStates,
  NotificationStates
} from './types';

export default function AutoMLPipelineClient() {
  // State management
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [algorithmPerformance, setAlgorithmPerformance] = useState<AlgorithmPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states - for future dialog implementations
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    createDialogOpen: false,
    cloneDialogOpen: false,
    templateDetailsOpen: false,
    draftNameDialog: false,
    estimationDialog: false,
    executionConfirmOpen: false
  });
  
  // Notification states
  const [notificationStates, setNotificationStates] = useState<NotificationStates>({
    showTemplateApplied: false,
    showPipelineCloned: false,
    showDraftSaved: false,
    showCreationError: false,
    showTimeEstimation: false,
    showDatasetPreview: false,
    uploadProgress: false,
    uploadSuccess: false
  });
  
  // Execution states - for future execution monitoring
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    executionPaused: false,
    executionComplete: false,
    executionError: false
  });
  
  // Pipeline configuration - for future create dialog
  const [newPipelineConfig, setNewPipelineConfig] = useState<PipelineConfig>({
    name: '',
    datasetId: '',
    maxTrainingTime: 60,
    algorithms: [],
    objective: '',
    targetColumn: '',
    optimizationMetric: 'accuracy',
    timeConstraint: 60,
    memoryConstraint: 8,
    modelComplexity: 'medium',
    interpretabilityLevel: 'high'
  });

  // Effect for data fetching
  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

  // Data fetching function
  const fetchPipelines = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockPipelines: Pipeline[] = [
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
        },
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
        }
      ];

      const mockSteps: PipelineStep[] = [
        { id: 'step_1', name: 'Data Validation', status: 'completed', duration: 30000 },
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

      setPipelines(mockPipelines);
      setPipelineSteps(mockSteps);
      setAlgorithmPerformance(mockAlgorithmPerformance);
      setSelectedPipeline(mockPipelines[0]);
      setLoading(false);
    } catch {
      setError('Failed to fetch pipeline data');
      setLoading(false);
    }
  };

  // Event handlers
  const handlePipelineSelect = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
  };

  const handlePipelineAction = (pipeline: Pipeline, action: 'start' | 'pause' | 'stop' | 'clone') => {
    console.log(`${action} pipeline ${pipeline.id}`);
    
    if (action === 'clone') {
      setDialogStates(prev => ({ ...prev, cloneDialogOpen: true }));
    } else {
      // Handle other actions
      fetchPipelines();
    }
  };

  const handleTemplateSelect = (template: PipelineTemplate) => {
    // Update configuration with template settings
    setNewPipelineConfig(prev => ({
      ...prev,
      ...template.defaultConfig
    }));
    setNotificationStates(prev => ({ ...prev, showTemplateApplied: true }));
    setTimeout(() => {
      setNotificationStates(prev => ({ ...prev, showTemplateApplied: false }));
    }, 3000);
  };

  const handleShowTemplateDetails = (template: PipelineTemplate) => {
    console.log('Show template details:', template);
    setDialogStates(prev => ({ ...prev, templateDetailsOpen: true }));
  };

  const handleCreatePipeline = () => {
    setDialogStates(prev => ({ ...prev, createDialogOpen: true }));
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchPipelines}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" data-cy="automl-title">
          AutoML Pipeline Visualizer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Create, monitor, and optimize machine learning pipelines with automated model selection
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Pipeline Templates */}
        <Grid size={{ xs: 12 }}>
          <PipelineTemplates
            onCreatePipeline={handleCreatePipeline}
            onTemplateSelect={handleTemplateSelect}
            onShowTemplateDetails={handleShowTemplateDetails}
          />
        </Grid>

        {/* Recent Pipelines */}
        <Grid size={{ xs: 12 }}>
          <RecentPipelines
            pipelines={pipelines}
            selectedPipeline={selectedPipeline}
            onPipelineSelect={handlePipelineSelect}
            onPipelineAction={handlePipelineAction}
          />
        </Grid>

        {/* Pipeline Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PipelineOverview pipeline={selectedPipeline} />
        </Grid>

        {/* Pipeline Steps */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PipelineSteps steps={pipelineSteps} />
        </Grid>

        {/* Algorithm Performance */}
        <Grid size={{ xs: 12 }}>
          <AlgorithmPerformanceComponent performance={algorithmPerformance} />
        </Grid>
      </Grid>

      {/* Notifications */}
      <Snackbar
        open={notificationStates.showTemplateApplied}
        autoHideDuration={3000}
        onClose={() => setNotificationStates(prev => ({ ...prev, showTemplateApplied: false }))}
      >
        <Alert severity="success">Template applied successfully!</Alert>
      </Snackbar>

      <Snackbar
        open={notificationStates.showCreationError}
        autoHideDuration={5000}
        onClose={() => setNotificationStates(prev => ({ ...prev, showCreationError: false }))}
      >
        <Alert severity="error">Failed to create pipeline</Alert>
      </Snackbar>
    </Box>
  );
}