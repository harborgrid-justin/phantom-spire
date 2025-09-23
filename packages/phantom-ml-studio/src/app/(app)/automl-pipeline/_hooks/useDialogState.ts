/**
 * Custom Hook for Dialog and Notification State Management
 * Manages all dialog states and notification states for the AutoML pipeline
 */

import { useState } from 'react';
import type {
  DialogStates,
  NotificationStates,
  ExecutionState
} from '../_lib/types';

export const useDialogState = () => {
  // Dialog states
  const [dialogStates, setDialogStates] = useState<DialogStates>({
    createDialogOpen: false,
    cloneDialogOpen: false,
    templateDetailsOpen: false,
    draftNameDialog: false,
    estimationDialog: false,
    executionConfirmOpen: false
  });
  
  // Additional execution dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saveResultsDialogOpen, setSaveResultsDialogOpen] = useState(false);
  
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
  
  // Execution state
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    executionPaused: false,
    executionComplete: false,
    executionError: false
  });

  // Dialog control functions
  const openDialog = (dialogName: keyof DialogStates) => {
    setDialogStates(prev => ({ ...prev, [dialogName]: true }));
  };

  const closeDialog = (dialogName: keyof DialogStates) => {
    setDialogStates(prev => ({ ...prev, [dialogName]: false }));
  };

  const openCancelDialog = () => setCancelDialogOpen(true);
  const closeCancelDialog = () => setCancelDialogOpen(false);
  
  const openSaveResultsDialog = () => setSaveResultsDialogOpen(true);
  const closeSaveResultsDialog = () => setSaveResultsDialogOpen(false);

  // Notification control functions
  const showNotification = (notificationName: keyof NotificationStates, duration = 3000) => {
    setNotificationStates(prev => ({ ...prev, [notificationName]: true }));
    
    if (duration > 0) {
      setTimeout(() => {
        setNotificationStates(prev => ({ ...prev, [notificationName]: false }));
      }, duration);
    }
  };

  const hideNotification = (notificationName: keyof NotificationStates) => {
    setNotificationStates(prev => ({ ...prev, [notificationName]: false }));
  };

  // Execution state control functions
  const startExecution = () => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: true,
      executionError: false,
      executionComplete: false,
      executionPaused: false
    }));
  };

  const pauseExecution = () => {
    setExecutionState(prev => ({ ...prev, executionPaused: true }));
  };

  const resumeExecution = () => {
    setExecutionState(prev => ({ ...prev, executionPaused: false }));
  };

  const completeExecution = () => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      executionComplete: true,
      executionError: false,
      executionPaused: false
    }));
  };

  const failExecution = () => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      executionError: true,
      executionComplete: false,
      executionPaused: false
    }));
  };

  const resetExecution = () => {
    setExecutionState({
      isExecuting: false,
      executionPaused: false,
      executionComplete: false,
      executionError: false
    });
  };

  return {
    // States
    dialogStates,
    cancelDialogOpen,
    saveResultsDialogOpen,
    notificationStates,
    executionState,
    
    // Dialog actions
    openDialog,
    closeDialog,
    openCancelDialog,
    closeCancelDialog,
    openSaveResultsDialog,
    closeSaveResultsDialog,
    setDialogStates,
    
    // Notification actions
    showNotification,
    hideNotification,
    setNotificationStates,
    
    // Execution actions
    startExecution,
    pauseExecution,
    resumeExecution,
    completeExecution,
    failExecution,
    resetExecution,
    setExecutionState
  };
};
