/**
 * Fortune 100-Grade Workflow and BPM System - Main Export
 * Enterprise-level workflow orchestration for Cyber Threat Intelligence Platform
 */

export * from './interfaces/IWorkflowEngine';
export * from './core/WorkflowEngine';
export * from './repository/InMemoryWorkflowRepository';
export * from './templates/CTIWorkflowTemplates';
export { WorkflowBPMOrchestrator, IWorkflowBPMConfig } from './WorkflowBPMOrchestrator';

// Main export
export { WorkflowBPMOrchestrator as default } from './WorkflowBPMOrchestrator';

// Convenience exports
export {
  WorkflowStatus,
  WorkflowPriority,
  StepType,
  TriggerType
} from './interfaces/IWorkflowEngine';

export {
  CTI_WORKFLOW_TEMPLATES,
  APT_RESPONSE_WORKFLOW,
  MALWARE_ANALYSIS_WORKFLOW
} from './templates/CTIWorkflowTemplates';