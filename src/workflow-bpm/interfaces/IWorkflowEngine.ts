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
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: {
    author?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  triggers?: any[];
  steps: any[];
  parameters?: Record<string, any>;
  sla?: any;
  security?: any;
  integrations?: any;
  monitoring?: any;
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active', 
  INACTIVE = 'inactive'
}

export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum StepType {
  ACTION = 'action',
  DECISION = 'decision',
  PARALLEL = 'parallel',
  TASK = 'task',
  SEQUENTIAL = 'sequential',
  HUMAN = 'human',
  MESSAGE = 'message'
}

export enum TriggerType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SCHEDULED = 'scheduled',
  EVENT = 'event'
}

export interface IWorkflowInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  parameters: Record<string, any>;
  initiatedBy: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  currentStep: number;
  steps: any[];
  error?: string;
}