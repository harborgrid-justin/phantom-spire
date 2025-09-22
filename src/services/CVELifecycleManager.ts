/**
 * CVE Lifecycle Management Workflow Service
 * Enterprise-grade CVE lifecycle orchestration with automated workflows
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { CVE } from '../types/cve.js';
import { IRiskAssessment } from './CVSSCalculator.js';

export interface ICVEWorkflowConfig {
  // Workflow Settings
  enableAutomation: boolean;
  autoAssignment: boolean;
  escalationEnabled: boolean;
  slaMonitoring: boolean;
  
  // Notification Settings
  notificationChannels: ('email' | 'slack' | 'teams' | 'webhook')[];
  escalationLevels: string[];
  
  // Integration Settings
  ticketingSystem?: {
    type: 'jira' | 'servicenow' | 'remedy';
    endpoint: string;
    credentials: any;
  };
  patchManagement?: {
    type: 'wsus' | 'sccm' | 'jamf' | 'ansible';
    endpoint: string;
    credentials: any;
  };
}

export interface ICVEWorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  assignee?: string;
  dueDate?: Date;
  completedDate?: Date;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  prerequisites?: string[];
  outputs?: any;
  notes?: string;
}

export interface ICVEWorkflowInstance {
  id: string;
  cveId: string;
  workflowType: 'standard' | 'critical' | 'emergency' | 'maintenance';
  status: 'created' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  steps: ICVEWorkflowStep[];
  escalations: ICVEEscalation[];
  approvals: ICVEApproval[];
  metrics: ICVEWorkflowMetrics;
  metadata: {
    triggeredBy: string;
    riskAssessment?: IRiskAssessment;
    businessJustification?: string;
    complianceRequirements?: string[];
  };
}

export interface ICVEEscalation {
  id: string;
  level: number;
  trigger: 'sla-breach' | 'manual' | 'auto' | 'risk-increase';
  escalatedTo: string;
  escalatedAt: Date;
  resolvedAt?: Date;
  reason: string;
  actions: string[];
}

export interface ICVEApproval {
  id: string;
  type: 'patch-deployment' | 'maintenance-window' | 'risk-acceptance' | 'emergency-change';
  requiredApprovers: string[];
  approvers: {
    userId: string;
    approved: boolean;
    approvedAt?: Date;
    comments?: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: Date;
}

export interface ICVEWorkflowMetrics {
  timeToDetection?: number; // hours from CVE publication
  timeToAssessment?: number; // hours from detection to risk assessment
  timeToResponse?: number; // hours from assessment to first action
  timeToRemediation?: number; // hours from response to patch deployment
  slaCompliance: boolean;
  escalationCount: number;
  reworkCount: number;
  totalDuration?: number; // hours
}

export interface ICVEWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  applicableFor: {
    severity: ('Critical' | 'High' | 'Medium' | 'Low')[];
    assetTypes: string[];
    industries: string[];
  };
  steps: Omit<ICVEWorkflowStep, 'status' | 'completedDate' | 'actualDuration' | 'outputs'>[];
  sla: {
    totalDuration: number; // hours
    stepDeadlines: { [stepId: string]: number }; // hours
  };
  automationRules: ICVEAutomationRule[];
}

export interface ICVEAutomationRule {
  id: string;
  name: string;
  condition: string; // JavaScript-like condition
  action: {
    type: 'assign' | 'notify' | 'execute' | 'skip' | 'escalate';
    parameters: any;
  };
  enabled: boolean;
}

export class CVELifecycleManager extends EventEmitter {
  private config: ICVEWorkflowConfig;
  private activeWorkflows: Map<string, ICVEWorkflowInstance> = new Map();
  private templates: Map<string, ICVEWorkflowTemplate> = new Map();
  private automationRules: ICVEAutomationRule[] = [];

  constructor(config: ICVEWorkflowConfig) {
    super();
    this.config = config;
    this.initializeDefaultTemplates();
    this.startSLAMonitoring();
    
    logger.info('CVE Lifecycle Manager initialized', {
      enableAutomation: config.enableAutomation,
      slaMonitoring: config.slaMonitoring,
    });
  }

  /**
   * Start a new CVE workflow
   */
  public async startWorkflow(
    cve: CVE,
    riskAssessment: IRiskAssessment,
    options: {
      templateId?: string;
      priority?: ICVEWorkflowInstance['priority'];
      assignee?: string;
      businessJustification?: string;
    } = {}
  ): Promise<ICVEWorkflowInstance> {
    try {
      // Select appropriate template
      const template = this.selectTemplate(cve, riskAssessment, options.templateId);
      
      // Determine workflow type and priority
      const workflowType = this.determineWorkflowType(riskAssessment);
      const priority = options.priority || this.determinePriority(riskAssessment);

      // Create workflow instance
      const workflow: ICVEWorkflowInstance = {
        id: this.generateWorkflowId(),
        cveId: cve.cveId,
        workflowType,
        status: 'created',
        priority,
        createdAt: new Date(),
        estimatedCompletion: new Date(Date.now() + template.sla.totalDuration * 60 * 60 * 1000),
        steps: template.steps.map(step => ({
          ...step,
          status: 'pending',
          dueDate: new Date(Date.now() + (template.sla.stepDeadlines[step.id] || 24) * 60 * 60 * 1000)
        })),
        escalations: [],
        approvals: [],
        metrics: {
          slaCompliance: true,
          escalationCount: 0,
          reworkCount: 0
        },
        metadata: {
          triggeredBy: options.assignee || 'system',
          riskAssessment,
          businessJustification: options.businessJustification,
          complianceRequirements: riskAssessment.assetContext.dataClassification === 'Restricted' 
            ? ['SOX', 'GDPR', 'HIPAA'] : []
        }
      };

      // Apply automation rules
      if (this.config.enableAutomation) {
        await this.applyAutomationRules(workflow);
      }

      // Store and start workflow
      this.activeWorkflows.set(workflow.id, workflow);
      workflow.status = 'active';
      workflow.startedAt = new Date();

      // Auto-assign if enabled
      if (this.config.autoAssignment && !options.assignee) {
        await this.autoAssignWorkflow(workflow);
      }

      // Send notifications
      await this.sendWorkflowNotification(workflow, 'started');

      // Start first step
      await this.startNextStep(workflow.id);

      this.emit('workflow-started', workflow);
      
      logger.info('CVE workflow started', {
        workflowId: workflow.id,
        cveId: cve.cveId,
        priority,
        workflowType,
      });

      return workflow;

    } catch (error) {
      const errorMessage = `Failed to start CVE workflow for ${cve.cveId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Complete a workflow step
   */
  public async completeStep(
    workflowId: string,
    stepId: string,
    outputs?: any,
    notes?: string
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in workflow ${workflowId}`);
    }

    if (step.status !== 'in-progress') {
      throw new Error(`Step ${stepId} is not in progress`);
    }

    // Complete step
    step.status = 'completed';
    step.completedDate = new Date();
    step.actualDuration = step.completedDate.getTime() - (workflow.startedAt?.getTime() || Date.now());
    step.outputs = outputs;
    step.notes = notes;

    // Update workflow metrics
    this.updateWorkflowMetrics(workflow);

    // Check for workflow completion
    if (this.isWorkflowComplete(workflow)) {
      await this.completeWorkflow(workflowId);
    } else {
      // Start next step
      await this.startNextStep(workflowId);
    }

    this.emit('step-completed', { workflow, step });
    
    logger.info('CVE workflow step completed', {
      workflowId,
      stepId,
      cveId: workflow.cveId,
    });
  }

  /**
   * Escalate a workflow
   */
  public async escalateWorkflow(
    workflowId: string,
    reason: string,
    escalatedTo: string,
    trigger: ICVEEscalation['trigger'] = 'manual'
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const escalation: ICVEEscalation = {
      id: this.generateEscalationId(),
      level: workflow.escalations.length + 1,
      trigger,
      escalatedTo,
      escalatedAt: new Date(),
      reason,
      actions: []
    };

    workflow.escalations.push(escalation);
    workflow.metrics.escalationCount++;

    // Update priority if necessary
    if (escalation.level >= 2 && workflow.priority !== 'P0') {
      workflow.priority = 'P1';
    }

    // Send escalation notifications
    await this.sendEscalationNotification(workflow, escalation);

    this.emit('workflow-escalated', { workflow, escalation });
    
    logger.warn('CVE workflow escalated', {
      workflowId,
      level: escalation.level,
      reason,
      cveId: workflow.cveId,
    });
  }

  /**
   * Get workflow status and metrics
   */
  public getWorkflowStatus(workflowId: string): ICVEWorkflowInstance | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get all active workflows
   */
  public getActiveWorkflows(): ICVEWorkflowInstance[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow statistics
   */
  public getWorkflowStatistics(): {
    totalWorkflows: number;
    activeWorkflows: number;
    completedWorkflows: number;
    averageCompletionTime: number;
    slaComplianceRate: number;
    escalationRate: number;
  } {
    const active = this.activeWorkflows.size;
    const all = Array.from(this.activeWorkflows.values());
    const completed = all.filter(w => w.status === 'completed');
    
    const averageTime = completed.length > 0 
      ? completed.reduce((sum, w) => sum + (w.metrics.totalDuration || 0), 0) / completed.length
      : 0;
    
    const slaCompliant = all.filter(w => w.metrics.slaCompliance).length;
    const escalated = all.filter(w => w.metrics.escalationCount > 0).length;

    return {
      totalWorkflows: all.length,
      activeWorkflows: active,
      completedWorkflows: completed.length,
      averageCompletionTime: averageTime,
      slaComplianceRate: all.length > 0 ? slaCompliant / all.length : 0,
      escalationRate: all.length > 0 ? escalated / all.length : 0
    };
  }

  /**
   * Private helper methods
   */

  private initializeDefaultTemplates(): void {
    // Critical CVE Template
    const criticalTemplate: ICVEWorkflowTemplate = {
      id: 'critical-cve',
      name: 'Critical CVE Response',
      description: 'Emergency response for critical vulnerabilities',
      applicableFor: {
        severity: ['Critical'],
        assetTypes: ['production', 'critical'],
        industries: ['all']
      },
      steps: [
        {
          id: 'assessment',
          name: 'Initial Assessment',
          description: 'Assess vulnerability impact and urgency',
          estimatedDuration: 30
        },
        {
          id: 'notification',
          name: 'Stakeholder Notification',
          description: 'Notify key stakeholders and security team',
          estimatedDuration: 15
        },
        {
          id: 'patch-identification',
          name: 'Patch Identification',
          description: 'Identify and validate available patches',
          estimatedDuration: 60
        },
        {
          id: 'emergency-approval',
          name: 'Emergency Change Approval',
          description: 'Obtain approval for emergency patching',
          estimatedDuration: 120
        },
        {
          id: 'patch-deployment',
          name: 'Patch Deployment',
          description: 'Deploy patches to affected systems',
          estimatedDuration: 240
        },
        {
          id: 'validation',
          name: 'Patch Validation',
          description: 'Validate patch deployment and system functionality',
          estimatedDuration: 60
        },
        {
          id: 'documentation',
          name: 'Documentation',
          description: 'Document actions taken and lessons learned',
          estimatedDuration: 30
        }
      ],
      sla: {
        totalDuration: 8, // 8 hours total
        stepDeadlines: {
          'assessment': 0.5,
          'notification': 1,
          'patch-identification': 2,
          'emergency-approval': 4,
          'patch-deployment': 8,
          'validation': 9,
          'documentation': 10
        }
      },
      automationRules: []
    };

    // Standard CVE Template
    const standardTemplate: ICVEWorkflowTemplate = {
      id: 'standard-cve',
      name: 'Standard CVE Response',
      description: 'Standard workflow for medium to high severity CVEs',
      applicableFor: {
        severity: ['High', 'Medium'],
        assetTypes: ['all'],
        industries: ['all']
      },
      steps: [
        {
          id: 'triage',
          name: 'Vulnerability Triage',
          description: 'Categorize and prioritize vulnerability',
          estimatedDuration: 60
        },
        {
          id: 'impact-analysis',
          name: 'Impact Analysis',
          description: 'Analyze business and technical impact',
          estimatedDuration: 120
        },
        {
          id: 'patch-research',
          name: 'Patch Research',
          description: 'Research available patches and mitigations',
          estimatedDuration: 180
        },
        {
          id: 'testing',
          name: 'Patch Testing',
          description: 'Test patches in development environment',
          estimatedDuration: 480
        },
        {
          id: 'change-approval',
          name: 'Change Management Approval',
          description: 'Submit and obtain change approval',
          estimatedDuration: 720
        },
        {
          id: 'deployment-scheduling',
          name: 'Deployment Scheduling',
          description: 'Schedule patch deployment window',
          estimatedDuration: 60
        },
        {
          id: 'deployment',
          name: 'Patch Deployment',
          description: 'Deploy patches during scheduled window',
          estimatedDuration: 180
        },
        {
          id: 'verification',
          name: 'Post-Deployment Verification',
          description: 'Verify successful deployment and functionality',
          estimatedDuration: 120
        }
      ],
      sla: {
        totalDuration: 72, // 72 hours (3 days)
        stepDeadlines: {
          'triage': 4,
          'impact-analysis': 8,
          'patch-research': 16,
          'testing': 36,
          'change-approval': 60,
          'deployment-scheduling': 64,
          'deployment': 72,
          'verification': 76
        }
      },
      automationRules: []
    };

    this.templates.set(criticalTemplate.id, criticalTemplate);
    this.templates.set(standardTemplate.id, standardTemplate);
  }

  private selectTemplate(
    cve: CVE,
    riskAssessment: IRiskAssessment,
    templateId?: string
  ): ICVEWorkflowTemplate {
    if (templateId) {
      const template = this.templates.get(templateId);
      if (template) return template;
    }

    // Auto-select based on risk level
    if (riskAssessment.riskLevel === 'Critical') {
      return this.templates.get('critical-cve')!;
    } else {
      return this.templates.get('standard-cve')!;
    }
  }

  private determineWorkflowType(riskAssessment: IRiskAssessment): ICVEWorkflowInstance['workflowType'] {
    if (riskAssessment.riskLevel === 'Critical') {
      return 'critical';
    } else if (riskAssessment.threatContext.inWildExploitation) {
      return 'emergency';
    } else {
      return 'standard';
    }
  }

  private determinePriority(riskAssessment: IRiskAssessment): ICVEWorkflowInstance['priority'] {
    return riskAssessment.remediationGuidance.priority;
  }

  private async applyAutomationRules(workflow: ICVEWorkflowInstance): Promise<void> {
    // Apply template-specific automation rules
    const template = Array.from(this.templates.values())
      .find(t => t.applicableFor.severity.includes(workflow.metadata.riskAssessment?.riskLevel || 'Medium'));
    
    if (template) {
      for (const rule of template.automationRules) {
        if (rule.enabled && this.evaluateCondition(rule.condition, workflow)) {
          await this.executeAction(rule.action, workflow);
        }
      }
    }
  }

  private evaluateCondition(condition: string, workflow: ICVEWorkflowInstance): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    try {
      const context = {
        priority: workflow.priority,
        riskLevel: workflow.metadata.riskAssessment?.riskLevel,
        severity: workflow.metadata.riskAssessment?.riskLevel,
        inWildExploitation: workflow.metadata.riskAssessment?.threatContext.inWildExploitation
      };
      
      // This is a simplified evaluator - replace with proper implementation
      return eval(condition.replace(/\b\w+\b/g, match => `context.${match}` || 'false'));
    } catch {
      return false;
    }
  }

  private async executeAction(action: ICVEAutomationRule['action'], workflow: ICVEWorkflowInstance): Promise<void> {
    switch (action.type) {
      case 'assign':
        // Auto-assign workflow
        break;
      case 'notify':
        // Send notification
        break;
      case 'escalate':
        // Auto-escalate
        break;
      default:
        logger.warn('Unknown automation action', { type: action.type });
    }
  }

  private async autoAssignWorkflow(workflow: ICVEWorkflowInstance): Promise<void> {
    // Simple assignment logic - in production, integrate with resource management
    const assignees = ['security-team', 'ops-team', 'dev-team'];
    const assignee = assignees[0]; // Simplified assignment
    
    workflow.steps[0].assignee = assignee;
  }

  private async startNextStep(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    const nextStep = workflow.steps.find(s => s.status === 'pending');
    if (nextStep) {
      nextStep.status = 'in-progress';
      
      // Send step notification
      await this.sendStepNotification(workflow, nextStep, 'started');
    }
  }

  private isWorkflowComplete(workflow: ICVEWorkflowInstance): boolean {
    return workflow.steps.every(s => s.status === 'completed' || s.status === 'skipped');
  }

  private async completeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    workflow.status = 'completed';
    workflow.completedAt = new Date();
    workflow.actualCompletion = new Date();

    // Update final metrics
    this.updateWorkflowMetrics(workflow);

    // Send completion notification
    await this.sendWorkflowNotification(workflow, 'completed');

    this.emit('workflow-completed', workflow);
    
    logger.info('CVE workflow completed', {
      workflowId,
      cveId: workflow.cveId,
      duration: workflow.metrics.totalDuration,
      slaCompliant: workflow.metrics.slaCompliance
    });
  }

  private updateWorkflowMetrics(workflow: ICVEWorkflowInstance): void {
    const now = new Date();
    const startTime = workflow.startedAt || workflow.createdAt;
    
    workflow.metrics.totalDuration = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
    
    // Check SLA compliance
    if (workflow.estimatedCompletion && now > workflow.estimatedCompletion) {
      workflow.metrics.slaCompliance = false;
    }
  }

  private startSLAMonitoring(): void {
    if (!this.config.slaMonitoring) return;

    setInterval(() => {
      this.checkSLABreaches();
    }, 15 * 60 * 1000); // Check every 15 minutes
  }

  private checkSLABreaches(): void {
    const now = new Date();
    
    this.activeWorkflows.forEach(async (workflow) => {
      // Check overall SLA
      if (workflow.estimatedCompletion && now > workflow.estimatedCompletion && workflow.metrics.slaCompliance) {
        workflow.metrics.slaCompliance = false;
        await this.escalateWorkflow(workflow.id, 'SLA breach - overall deadline exceeded', 'manager', 'sla-breach');
      }

      // Check step SLAs
      workflow.steps.forEach(async (step) => {
        if (step.status === 'in-progress' && step.dueDate && now > step.dueDate) {
          await this.escalateWorkflow(workflow.id, `SLA breach - step '${step.name}' overdue`, 'manager', 'sla-breach');
        }
      });
    });
  }

  private async sendWorkflowNotification(workflow: ICVEWorkflowInstance, event: string): Promise<void> {
    // Implementation would send notifications via configured channels
    logger.info('Workflow notification sent', {
      workflowId: workflow.id,
      event,
      channels: this.config.notificationChannels
    });
  }

  private async sendStepNotification(workflow: ICVEWorkflowInstance, step: ICVEWorkflowStep, event: string): Promise<void> {
    // Implementation would send step notifications
    logger.info('Step notification sent', {
      workflowId: workflow.id,
      stepId: step.id,
      event
    });
  }

  private async sendEscalationNotification(workflow: ICVEWorkflowInstance, escalation: ICVEEscalation): Promise<void> {
    // Implementation would send escalation notifications
    logger.info('Escalation notification sent', {
      workflowId: workflow.id,
      escalationLevel: escalation.level,
      escalatedTo: escalation.escalatedTo
    });
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateEscalationId(): string {
    return `escalation_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}