/**
 * Services Index
 * Central export point for all AutoML pipeline services
 */

export { PipelineService } from './pipelineService';

// Re-export types for convenience
export type {
  Pipeline,
  PipelineStep,
  PipelineConfig
} from '../_lib/types';
