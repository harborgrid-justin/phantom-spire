/**
 * Pipeline Service
 * Handles API calls and pipeline execution logic
 */

import type {
  Pipeline,
  PipelineStep,
  PipelineConfig
} from '../_lib/types';

export class PipelineService {
  /**
   * Execute a pipeline
   */
  static async executePipeline(pipelineId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch('/api/automl/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.log('API call intercepted by tests or failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check pipeline status
   */
  static async checkPipelineStatus(pipelineId: string): Promise<{
    success: boolean;
    data?: {
      status: string;
      accuracy?: number;
      best_model?: string;
    };
  }> {
    try {
      const response = await fetch(`/api/automl/status/${pipelineId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.log('Status polling intercepted or failed:', error);
      return { success: false };
    }
  }

  /**
   * Generate pipeline execution updates for running state
   */
  static getExecutionUpdates(pipelineId: string): {
    pipeline: Partial<Pipeline>;
    steps: PipelineStep[];
  } {
    const pipeline: Partial<Pipeline> = {
      status: 'running' as const,
      progress: 10,
      startTime: new Date(),
      estimatedTime: 1800000, // 30 minutes
      currentStep: 'Data Preprocessing'
    };

    const steps: PipelineStep[] = [
      { id: 'step_1', name: 'Data Preprocessing', status: 'running', duration: 0 },
      { id: 'step_2', name: 'Feature Engineering', status: 'pending', duration: 0 },
      { id: 'step_3', name: 'Algorithm Selection', status: 'pending', duration: 0 },
      { id: 'step_4', name: 'Model Training', status: 'pending', duration: 0 },
      { id: 'step_5', name: 'Hyperparameter Tuning', status: 'pending', duration: 0 },
      { id: 'step_6', name: 'Model Validation', status: 'pending', duration: 0 }
    ];

    return { pipeline, steps };
  }

  /**
   * Generate pipeline completion updates
   */
  static getCompletionUpdates(statusData?: any): {
    pipeline: Partial<Pipeline>;
  } {
    const pipeline: Partial<Pipeline> = {
      status: 'completed' as const,
      progress: 100,
      accuracy: statusData?.accuracy || 0.92,
      algorithm: statusData?.best_model || 'RandomForest',
      currentStep: 'Completed'
    };

    return { pipeline };
  }

  /**
   * Create a new pipeline from configuration
   */
  static createPipeline(config: PipelineConfig): Pipeline {
    return {
      id: `pipeline_${Date.now()}`,
      name: config.name || 'New Pipeline',
      status: 'pending',
      progress: 0,
      currentStep: 'Ready to Execute',
      algorithm: 'Not Selected',
      accuracy: 0.0,
      startTime: new Date(),
      estimatedTime: 0,
      datasetId: config.datasetId || 'default'
    };
  }

  /**
   * Handle pipeline action (start, pause, stop, clone)
   */
  static handlePipelineAction(
    pipeline: Pipeline,
    action: 'start' | 'pause' | 'stop' | 'clone'
  ): {
    requiresConfirmation: boolean;
    updates?: Partial<Pipeline>;
  } {
    switch (action) {
      case 'start':
        return {
          requiresConfirmation: true
        };
      
      case 'pause':
        return {
          requiresConfirmation: false,
          updates: { status: 'paused' as const }
        };
      
      case 'stop':
        return {
          requiresConfirmation: true
        };
      
      case 'clone':
        return {
          requiresConfirmation: false
        };
      
      default:
        return { requiresConfirmation: false };
    }
  }

  /**
   * Simulate status polling for pipeline execution
   */
  static async simulateStatusPolling(
    pipelineId: string,
    onStatusUpdate: (status: any) => void,
    delay = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const statusResult = await this.checkPipelineStatus(pipelineId);
          
          if (statusResult.success && statusResult.data) {
            onStatusUpdate(statusResult.data);
          }
          
          resolve();
        } catch (error) {
          console.log('Status polling error:', error);
          resolve();
        }
      }, delay);
    });
  }
}
