/**
 * Generic Workflow and BPM System - Main Export
 * Enterprise-level workflow orchestration for any Node.js project
 */

export * from './interfaces/IWorkflowEngine';
export * from './core/WorkflowEngine';
export * from './repository/InMemoryWorkflowRepository';
export * from './repository/MongoWorkflowRepository';
export { WorkflowBPMOrchestrator, IWorkflowBPMConfig } from './WorkflowBPMOrchestrator';

// Main export
export { WorkflowBPMOrchestrator as default } from './WorkflowBPMOrchestrator';

// Convenience exports
export {
  WorkflowStatus,
  WorkflowPriority,
  StepType,
  TriggerType,
  IWorkflowDefinition,
  IWorkflowInstance,
  IWorkflowEngine,
  IWorkflowRepository,
  ILogger
} from './interfaces/IWorkflowEngine';

export {
  WorkflowEngineCore,
  IWorkflowEngineConfig
} from './core/WorkflowEngine';

export {
  InMemoryWorkflowRepository
} from './repository/InMemoryWorkflowRepository';

export {
  MongoWorkflowRepository
} from './repository/MongoWorkflowRepository';