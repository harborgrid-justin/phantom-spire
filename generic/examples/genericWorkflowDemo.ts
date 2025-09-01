/**
 * Generic Workflow BPM System Demo
 * Demonstrates how to use the generic workflow system in any Node.js project
 */

import { WorkflowBPMOrchestrator, IWorkflowDefinition, WorkflowStatus, WorkflowPriority, StepType, TriggerType } from '../workflow-bpm';

// Simple demo workflow definition
const approvalWorkflow: IWorkflowDefinition = {
  id: 'document-approval-workflow',
  name: 'Document Approval Process',
  version: '1.0',
  description: 'Generic document approval workflow for any organization',
  category: 'approval',
  tags: ['approval', 'document', 'review'],
  
  metadata: {
    author: 'Generic BPM Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  
  triggers: [{
    id: 'document-submitted',
    type: TriggerType.EVENT,
    name: 'Document Submitted',
    description: 'Triggered when a document is submitted for approval',
    enabled: true,
    configuration: {
      eventType: 'document.submitted'
    }
  }],
  
  steps: [
    {
      id: 'validate-document',
      name: 'Validate Document',
      type: StepType.TASK,
      description: 'Validate document format and requirements',
      position: { x: 100, y: 100 },
      configuration: {
        taskType: 'validation'
      },
      inputs: {
        document: 'parameters.document'
      },
      outputs: {
        isValid: 'isValid',
        validationErrors: 'validationErrors'
      },
      nextSteps: ['approval-decision'],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 2,
        retryDelay: '30s'
      }
    },
    
    {
      id: 'approval-decision',
      name: 'Check if Valid',
      type: StepType.DECISION,
      description: 'Check if document passed validation',
      position: { x: 200, y: 100 },
      configuration: {
        falseSteps: ['reject-document']
      },
      inputs: {
        isValid: 'variables.isValid'
      },
      outputs: {},
      nextSteps: ['assign-reviewer'],
      conditions: [{
        expression: 'isValid === true',
        description: 'Document is valid'
      }],
      errorHandling: {
        strategy: 'fail'
      }
    },
    
    {
      id: 'assign-reviewer',
      name: 'Assign Reviewer',
      type: StepType.HUMAN,
      description: 'Assign document to a reviewer',
      position: { x: 300, y: 50 },
      configuration: {},
      inputs: {
        document: 'parameters.document'
      },
      outputs: {
        reviewer: 'reviewer',
        reviewComments: 'reviewComments',
        approved: 'approved'
      },
      nextSteps: ['final-decision'],
      humanTask: {
        candidateGroups: ['reviewers', 'managers'],
        priority: WorkflowPriority.MEDIUM,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        form: {
          fields: [
            {
              id: 'approved',
              name: 'approved',
              type: 'boolean',
              label: 'Approve Document?',
              required: true
            },
            {
              id: 'comments',
              name: 'reviewComments',
              type: 'text',
              label: 'Review Comments',
              required: false
            }
          ],
          validation: {}
        }
      },
      errorHandling: {
        strategy: 'retry',
        maxRetries: 1
      },
      timeout: '72h'
    },
    
    {
      id: 'final-decision',
      name: 'Final Approval Decision',
      type: StepType.DECISION,
      description: 'Make final approval decision',
      position: { x: 400, y: 50 },
      configuration: {
        falseSteps: ['reject-document']
      },
      inputs: {
        approved: 'variables.approved'
      },
      outputs: {},
      nextSteps: ['approve-document'],
      conditions: [{
        expression: 'approved === true',
        description: 'Document was approved by reviewer'
      }],
      errorHandling: {
        strategy: 'fail'
      }
    },
    
    {
      id: 'approve-document',
      name: 'Approve Document',
      type: StepType.TASK,
      description: 'Process document approval',
      position: { x: 500, y: 25 },
      configuration: {
        taskType: 'approval'
      },
      inputs: {
        document: 'parameters.document',
        reviewer: 'variables.reviewer',
        comments: 'variables.reviewComments'
      },
      outputs: {
        approvalDate: 'approvalDate',
        status: 'status'
      },
      nextSteps: ['send-notification'],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelay: '1m'
      }
    },
    
    {
      id: 'reject-document',
      name: 'Reject Document',
      type: StepType.TASK,
      description: 'Process document rejection',
      position: { x: 500, y: 125 },
      configuration: {
        taskType: 'rejection'
      },
      inputs: {
        document: 'parameters.document',
        reason: 'variables.validationErrors || variables.reviewComments'
      },
      outputs: {
        rejectionDate: 'rejectionDate',
        status: 'status'
      },
      nextSteps: ['send-notification'],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3,
        retryDelay: '1m'
      }
    },
    
    {
      id: 'send-notification',
      name: 'Send Notification',
      type: StepType.TASK,
      description: 'Send approval/rejection notification',
      position: { x: 600, y: 75 },
      configuration: {
        taskType: 'notification'
      },
      inputs: {
        document: 'parameters.document',
        status: 'variables.status',
        comments: 'variables.reviewComments'
      },
      outputs: {
        notificationSent: 'notificationSent'
      },
      nextSteps: [],
      errorHandling: {
        strategy: 'skip' // Don't fail workflow if notification fails
      }
    }
  ],
  
  variables: {
    isValid: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether document passed validation',
      required: true
    },
    approved: {
      type: 'boolean',
      defaultValue: false,
      description: 'Whether document was approved',
      required: true
    }
  },
  
  parameters: {
    document: {
      type: 'object',
      displayName: 'Document',
      category: 'Input',
      order: 1,
      description: 'The document to be approved',
      required: true
    }
  },
  
  sla: {
    responseTime: '2h',
    resolutionTime: '72h',
    maxExecutionTime: '7d'
  },
  
  security: {
    classification: 'internal',
    requiredRoles: ['document-submitter'],
    requiredPermissions: ['workflow.execute'],
    dataEncryption: false,
    auditLevel: 'detailed'
  },
  
  integrations: {
    taskManagement: {
      enabled: true,
      createTasks: true,
      updateTaskStatus: true,
      taskPriority: WorkflowPriority.MEDIUM
    },
    messageQueue: {
      enabled: false,
      publishEvents: false,
      subscribeToEvents: false,
      deadLetterQueue: false
    },
    evidence: {
      enabled: true,
      collectEvidence: true,
      preserveChainOfCustody: true,
      evidenceRetention: '2y'
    },
    issues: {
      enabled: false,
      createIssues: false,
      linkToIssues: false,
      escalationRules: []
    }
  },
  
  monitoring: {
    enabled: true,
    collectMetrics: true,
    alerting: {
      enabled: false,
      channels: [],
      conditions: []
    },
    logging: {
      level: 'info',
      includeStepDetails: true,
      includeVariables: true
    }
  }
};

export async function runGenericWorkflowDemo(): Promise<void> {
  console.log('🚀 Generic Workflow BPM System Demo');
  console.log('=====================================');
  
  try {
    // Initialize the orchestrator
    const orchestrator = new WorkflowBPMOrchestrator({
      logger: {
        error: (msg, meta) => console.error(`❌ ${msg}`, meta),
        warn: (msg, meta) => console.warn(`⚠️ ${msg}`, meta),
        info: (msg, meta) => console.info(`ℹ️ ${msg}`, meta),
        debug: (msg, meta) => console.debug(`🐛 ${msg}`, meta)
      },
      engine: {
        maxConcurrentWorkflows: 100,
        executionTimeout: 5 * 60 * 1000, // 5 minutes for demo
        checkpointInterval: 10000, // 10 seconds
        optimization: {
          enabled: true,
          mlOptimization: false, // Disable for demo
          dynamicScaling: true
        }
      }
    });

    // Set up event listeners
    orchestrator.on('workflow-started', (instance: any) => {
      console.log(`✅ Workflow started: ${instance.id}`);
    });

    orchestrator.on('workflow-completed', (instance: any) => {
      console.log(`🎉 Workflow completed: ${instance.id}`);
      console.log(`   Final status: ${instance.variables.status}`);
      console.log(`   Duration: ${instance.duration}ms`);
    });

    orchestrator.on('workflow-failed', (instance: any, error: Error) => {
      console.log(`💥 Workflow failed: ${instance.id}`);
      console.log(`   Error: ${error.message}`);
    });

    // Register the workflow definition
    console.log('\n📝 Registering workflow definition...');
    await orchestrator.registerWorkflowDefinition(approvalWorkflow);
    
    // Start multiple workflow instances
    console.log('\n🚀 Starting workflow instances...');
    
    const documents = [
      {
        id: 'DOC-001',
        title: 'Project Proposal',
        type: 'proposal',
        submitter: 'alice@company.com',
        content: 'Detailed project proposal document...'
      },
      {
        id: 'DOC-002',
        title: 'Budget Report',
        type: 'financial',
        submitter: 'bob@company.com',
        content: 'Q4 budget analysis report...'
      },
      {
        id: 'DOC-003',
        title: 'Policy Update',
        type: 'policy',
        submitter: 'carol@company.com',
        content: 'Updated remote work policy...'
      }
    ];

    const instances: any[] = [];
    for (let i = 0; i < documents.length; i++) {
      const instance = await orchestrator.startWorkflow(
        'document-approval-workflow',
        { document: documents[i] },
        documents[i].submitter
      );
      instances.push(instance);
      
      console.log(`   📄 Started workflow for ${documents[i].title} (${instance.id})`);
      
      // Small delay between starts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait a bit to let workflows execute
    console.log('\n⏳ Waiting for workflows to execute...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Display system health
    console.log('\n📊 System Health Status:');
    const health = await orchestrator.getSystemHealth();
    console.log(`   Status: ${health.status}`);
    console.log(`   Active workflows: ${health.performance.activeWorkflows}`);
    console.log(`   Total executed: ${health.performance.totalWorkflowsExecuted}`);
    console.log(`   Success rate: ${health.performance.successRate.toFixed(1)}%`);
    
    // Display performance metrics
    console.log('\n📈 Performance Metrics:');
    const metrics = orchestrator.getPerformanceMetrics();
    console.log(`   Average execution time: ${metrics.averageExecutionTime.toFixed(0)}ms`);
    console.log(`   Peak active workflows: ${metrics.peakActiveWorkflows}`);
    console.log(`   Total errors: ${metrics.totalErrors}`);

    // List all workflow definitions
    console.log('\n📚 Available Workflow Definitions:');
    const definitions = await orchestrator.getWorkflowDefinitions();
    definitions.forEach(def => {
      console.log(`   - ${def.name} (${def.id}) v${def.version}`);
      console.log(`     Steps: ${def.steps.length}, Category: ${def.category}`);
    });

    // Check individual workflow instances
    console.log('\n📋 Workflow Instance Status:');
    for (const instance of instances) {
      try {
        const currentInstance = await orchestrator.getWorkflowInstance(instance.id);
        console.log(`   ${currentInstance.id}: ${currentInstance.status}`);
        console.log(`     Current steps: [${currentInstance.currentSteps.join(', ')}]`);
        console.log(`     Completed steps: [${currentInstance.completedSteps.join(', ')}]`);
        if (currentInstance.failedSteps.length > 0) {
          console.log(`     Failed steps: [${currentInstance.failedSteps.join(', ')}]`);
        }
      } catch (error) {
        console.log(`   ${instance.id}: Error getting status - ${(error as Error).message}`);
      }
    }

    console.log('\n✨ Generic Workflow BPM Demo Completed!');
    console.log('\nThis demonstrates:');
    console.log('• Generic workflow engine capable of handling any business process');
    console.log('• No domain-specific dependencies (no CTI/security-specific code)');
    console.log('• Pluggable logger interface for integration with any logging system');
    console.log('• Event-driven architecture for real-time monitoring');
    console.log('• Comprehensive performance metrics and health monitoring');
    console.log('• Enterprise-grade workflow orchestration capabilities');

  } catch (error) {
    console.error('❌ Demo failed:', (error as Error).message);
    console.error((error as Error).stack);
  }
}

// Export for use in other modules
export default runGenericWorkflowDemo;

// Run demo if this file is executed directly
if (require.main === module) {
  runGenericWorkflowDemo().catch(console.error);
}