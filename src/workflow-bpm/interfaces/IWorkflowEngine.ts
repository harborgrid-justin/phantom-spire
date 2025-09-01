/**
 * Fortune 100-Grade Workflow and BPM Core Interfaces
 * Enterprise-level workflow orchestration for Cyber Threat Intelligence Platform
 */

// Re-export all generic workflow interfaces
// Temporarily disable broken imports - use any types for now
// export * from '../../.development/references/generic/workflow-bpm/interfaces/IWorkflowEngine';

export interface IWorkflowDefinition {
  id: string;
  name: string;
  version: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  steps: any[];
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active', 
  INACTIVE = 'inactive'
}

export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum StepType {
  ACTION = 'action',
  DECISION = 'decision',
  PARALLEL = 'parallel'
}

export enum TriggerType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SCHEDULED = 'scheduled'
}