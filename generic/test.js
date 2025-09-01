/**
 * Basic test to verify the generic workflow BPM module works correctly
 */

const { WorkflowBPMOrchestrator, StepType, TriggerType, WorkflowStatus } = require('./dist');

// Simple test workflow
const testWorkflow = {
  id: 'simple-test-workflow',
  name: 'Simple Test Workflow',
  version: '1.0',
  description: 'A basic test workflow',
  category: 'test',
  tags: ['test'],
  metadata: {
    author: 'Test',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  triggers: [{
    id: 'manual',
    type: TriggerType.MANUAL,
    name: 'Manual',
    description: 'Manual trigger',
    enabled: true,
    configuration: {}
  }],
  steps: [{
    id: 'simple-task',
    name: 'Simple Task',
    type: StepType.TASK,
    description: 'A simple task',
    position: { x: 0, y: 0 },
    configuration: {},
    inputs: {
      testInput: 'parameters.testValue'
    },
    outputs: {
      result: 'result'
    },
    nextSteps: [],
    errorHandling: {
      strategy: 'fail'
    }
  }],
  variables: {},
  parameters: {
    testValue: {
      type: 'string',
      displayName: 'Test Value',
      category: 'Input',
      order: 1,
      description: 'A test value',
      required: true
    }
  },
  sla: {
    maxExecutionTime: '5m'
  },
  security: {
    classification: 'public',
    requiredRoles: [],
    requiredPermissions: [],
    dataEncryption: false,
    auditLevel: 'none'
  },
  integrations: {
    taskManagement: {
      enabled: false,
      createTasks: false,
      updateTaskStatus: false,
      taskPriority: 'low'
    },
    messageQueue: {
      enabled: false,
      publishEvents: false,
      subscribeToEvents: false,
      deadLetterQueue: false
    },
    evidence: {
      enabled: false,
      collectEvidence: false,
      preserveChainOfCustody: false,
      evidenceRetention: '1d'
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
      includeStepDetails: false,
      includeVariables: false
    }
  }
};

async function testGenericWorkflow() {
  console.log('🧪 Testing Generic Workflow BPM Module');
  console.log('======================================');
  
  try {
    // Create orchestrator
    const orchestrator = new WorkflowBPMOrchestrator({
      logger: {
        error: (msg, meta) => console.error(`ERROR: ${msg}`, meta),
        warn: (msg, meta) => console.warn(`WARN: ${msg}`, meta),
        info: (msg, meta) => console.info(`INFO: ${msg}`, meta),
        debug: (msg, meta) => console.debug(`DEBUG: ${msg}`, meta)
      }
    });

    console.log('✅ Orchestrator created successfully');

    // Register workflow
    await orchestrator.registerWorkflowDefinition(testWorkflow);
    console.log('✅ Workflow definition registered');

    // Start workflow
    const instance = await orchestrator.startWorkflow('simple-test-workflow', {
      testValue: 'Hello World!'
    });
    console.log('✅ Workflow started:', instance.id);

    // Wait for completion
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Workflow timed out'));
      }, 10000);

      orchestrator.on('workflow-completed', (completedInstance) => {
        if (completedInstance.id === instance.id) {
          clearTimeout(timeout);
          console.log('✅ Workflow completed successfully');
          resolve();
        }
      });

      orchestrator.on('workflow-failed', (failedInstance, error) => {
        if (failedInstance.id === instance.id) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });

    // Get final instance state
    const finalInstance = await orchestrator.getWorkflowInstance(instance.id);
    console.log('📊 Final Status:', finalInstance.status);
    console.log('📊 Completed Steps:', finalInstance.completedSteps);
    console.log('📊 Variables:', finalInstance.variables);

    // Get system health
    const health = await orchestrator.getSystemHealth();
    console.log('📊 System Health:', {
      status: health.status,
      totalExecuted: health.performance.totalWorkflowsExecuted,
      successRate: health.performance.successRate
    });

    console.log('\n🎉 Generic Workflow BPM Module Test Completed Successfully!');
    console.log('The module is working correctly and can be used in any Node.js project.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGenericWorkflow();