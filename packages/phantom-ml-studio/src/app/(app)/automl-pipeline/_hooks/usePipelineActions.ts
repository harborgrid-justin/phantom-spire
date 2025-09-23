/**
 * Custom Hook for Pipeline Actions
 * Handles pipeline execution, control actions, and template operations
 */

import { useState } from 'react';
import { PipelineService } from '../_services/pipelineService';
import type {
  Pipeline,
  PipelineTemplate,
  PipelineConfig
} from '../_lib/types';

interface UsePipelineActionsProps {
  selectedPipeline: Pipeline | null;
  updatePipeline: (pipelineId: string, updates: Partial<Pipeline>) => void;
  addPipeline: (pipeline: Pipeline) => void;
  updateSteps: (steps: any[]) => void;
  startExecution: () => void;
  completeExecution: () => void;
  failExecution: () => void;
  pauseExecution: () => void;
  resumeExecution: () => void;
  showNotification: (name: any, duration?: number) => void;
  openDialog: (name: any) => void;
  closeDialog: (name: any) => void;
  openCancelDialog: () => void;
  openSaveResultsDialog: () => void;
}

export const usePipelineActions = ({
  selectedPipeline,
  updatePipeline,
  addPipeline,
  updateSteps,
  startExecution,
  completeExecution,
  failExecution,
  pauseExecution,
  resumeExecution,
  showNotification,
  openDialog,
  closeDialog,
  openCancelDialog,
  openSaveResultsDialog
}: UsePipelineActionsProps) => {
  // Pipeline configuration for new pipelines
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

  // Template selection handler
  const handleTemplateSelect = (template: PipelineTemplate) => {
    setNewPipelineConfig(prev => ({
      ...prev,
      ...template.defaultConfig
    }));
    showNotification('showTemplateApplied', 3000);
  };

  // Show template details handler
  const handleShowTemplateDetails = (template: PipelineTemplate) => {
    console.log('Show template details:', template);
    openDialog('templateDetailsOpen');
  };

  // Create pipeline handler
  const handleCreatePipeline = () => {
    openDialog('createDialogOpen');
  };

  // Pipeline created handler
  const handlePipelineCreated = (config: PipelineConfig) => {
    const newPipeline = PipelineService.createPipeline(config);
    addPipeline(newPipeline);
    closeDialog('createDialogOpen');
    showNotification('showDraftSaved', 3000);
  };

  // Pipeline action handler
  const handlePipelineAction = (pipeline: Pipeline, action: 'start' | 'pause' | 'stop' | 'clone') => {
    console.log(`${action} pipeline ${pipeline.id}`);
    
    const actionResult = PipelineService.handlePipelineAction(pipeline, action);
    
    if (action === 'clone') {
      openDialog('cloneDialogOpen');
    } else if (action === 'pause' && actionResult.updates) {
      updatePipeline(pipeline.id, actionResult.updates);
      pauseExecution();
      showNotification('showPipelineCloned', 3000);
    }
  };

  // Execute pipeline handler
  const handleExecutePipeline = () => {
    if (selectedPipeline) {
      openDialog('executionConfirmOpen');
    }
  };

  // Confirm execution handler
  const handleConfirmExecution = async () => {
    if (!selectedPipeline) return;
    
    closeDialog('executionConfirmOpen');
    
    try {
      const result = await PipelineService.executePipeline(selectedPipeline.id);
      
      if (result.success) {
        // Update pipeline to running state
        const { pipeline: pipelineUpdates, steps } = PipelineService.getExecutionUpdates(selectedPipeline.id);
        updatePipeline(selectedPipeline.id, pipelineUpdates);
        updateSteps(steps);
        startExecution();
        showNotification('showTimeEstimation', 3000);
        
        // Simulate status polling
        PipelineService.simulateStatusPolling(
          selectedPipeline.id,
          (statusData) => {
            if (statusData.status === 'completed') {
              const { pipeline: completionUpdates } = PipelineService.getCompletionUpdates(statusData);
              updatePipeline(selectedPipeline.id, completionUpdates);
              completeExecution();
            }
          }
        );
      } else {
        throw new Error(result.message || 'Execution failed');
      }
    } catch (error) {
      updatePipeline(selectedPipeline.id, { status: 'failed' });
      failExecution();
      showNotification('showCreationError', 5000);
    }
  };

  // Pause pipeline handler
  const handlePausePipeline = () => {
    if (selectedPipeline && selectedPipeline.status === 'running') {
      updatePipeline(selectedPipeline.id, { status: 'paused' });
      pauseExecution();
      showNotification('showPipelineCloned', 3000);
    }
  };

  // Resume pipeline handler
  const handleResumePipeline = () => {
    if (selectedPipeline && selectedPipeline.status === 'paused') {
      updatePipeline(selectedPipeline.id, { status: 'running' });
      resumeExecution();
    }
  };

  // Stop pipeline handler
  const handleStopPipeline = () => {
    if (selectedPipeline && (selectedPipeline.status === 'running' || selectedPipeline.status === 'paused')) {
      openCancelDialog();
    }
  };

  // Confirm cancel handler
  const handleConfirmCancel = () => {
    if (selectedPipeline) {
      updatePipeline(selectedPipeline.id, { status: 'failed' });
      showNotification('showCreationError', 3000);
    }
  };

  // Save results handler
  const handleSaveResults = (name: string) => {
    console.log('Saving results with name:', name);
    showNotification('showDraftSaved', 3000);
  };

  return {
    // State
    newPipelineConfig,
    setNewPipelineConfig,
    
    // Handlers
    handleTemplateSelect,
    handleShowTemplateDetails,
    handleCreatePipeline,
    handlePipelineCreated,
    handlePipelineAction,
    handleExecutePipeline,
    handleConfirmExecution,
    handlePausePipeline,
    handleResumePipeline,
    handleStopPipeline,
    handleConfirmCancel,
    handleSaveResults
  };
};
