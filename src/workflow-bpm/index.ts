/**
 * Fortune 100-Grade Workflow and BPM System - Main Export
 * Enterprise-level workflow orchestration for Cyber Threat Intelligence Platform
 */

export * from './interfaces/IWorkflowEngine.js';
export * from './core/WorkflowEngine.js';
export * from './repository/InMemoryWorkflowRepository.js';
export * from './templates/CTIWorkflowTemplates.js';
export {
  WorkflowBPMOrchestrator,
  IWorkflowBPMConfig,
} from './WorkflowBPMOrchestrator.js';

// Main export
export { WorkflowBPMOrchestrator as default } from './WorkflowBPMOrchestrator.js';

// Convenience exports
export {
  WorkflowStatus,
  WorkflowPriority,
  StepType,
  TriggerType,
} from './interfaces/IWorkflowEngine.js';

export {
  CTI_WORKFLOW_TEMPLATES,
  APT_RESPONSE_WORKFLOW,
  MALWARE_ANALYSIS_WORKFLOW,
} from './templates/CTIWorkflowTemplates.js';
