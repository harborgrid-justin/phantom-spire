# Revolutionary Generic Modules Collection 🚀

**The Future of Plug-and-Play Enterprise Architecture**

This collection contains **7 revolutionary generic modules** that transform Node.js applications into enterprise-grade distributed systems with **ZERO configuration** required.

## 🌟 Revolutionary Features

- **🎯 Zero Configuration**: All modules work perfectly with intelligent defaults
- **🤖 Auto-Discovery**: Automatically detect and configure services from environment
- **🔗 Cross-Module Integration**: Seamless linking between all modules
- **📊 ML-Driven Optimization**: Continuous improvement using machine learning
- **🛡️ Enterprise Patterns**: Fortune 100 fault tolerance and reliability
- **⚡ Real-Time Adaptation**: Auto-adjusts based on performance patterns

## 📦 The 7 Revolutionary Modules

### 🔄 [Circuit Breaker](./circuit-breaker/)
Automatic fault tolerance with zero configuration
- Auto-detects service types and optimal thresholds
- Cross-module coordination for distributed resilience
- ML-driven adaptation based on performance

### 📨 [Message Queue](./message-queue/)  
Enterprise messaging with instant setup
- Auto-creates queues and routing infrastructure
- Built-in resilience with retry and dead letter queues
- Real-time processing with auto-scaling

### ⚖️ [Load Balancer](./load-balancer/)
Intelligent traffic distribution
- Auto-discovers backend servers from environment
- ML-driven server selection strategies
- Health monitoring with automatic failover

### 🏢 [Service Registry](./service-registry/)
Auto-discovering service catalog
- Environment-based service discovery
- Automatic health monitoring and cleanup
- Zero-config registration and discovery

### 🌐 [WebSockets](./websockets/)
Real-time communication made simple
- Auto-starts server with intelligent configuration
- Pre-created channels for common use cases
- Built-in connection management

### 🧠 [Intelligent Router](./intelligent-router/)
ML-driven request routing
- Machine learning route optimization
- Performance-based adaptation
- Auto-discovery of routing patterns

### ⚡ [Event Triggers](./event-triggers/)
Automated workflow orchestration
- Pre-created common triggers for system events
- Cross-module automation and coordination
- System monitoring and auto-recovery

## 🎯 30-Second Enterprise Setup

```javascript
// Import all modules - ZERO configuration needed!
const { createCircuitBreaker } = require('@generic/circuit-breaker');
const { createMessageQueue } = require('@generic/message-queue');
const { autoLoadBalancer } = require('@generic/load-balancer');
const { autoServiceRegistry } = require('@generic/service-registry');
const { autoWebSocketServer } = require('@generic/websockets');
const { autoIntelligentRouter } = require('@generic/intelligent-router');
const { autoEventTriggers } = require('@generic/event-triggers');

// Create enterprise-grade distributed system
const system = {
  circuitBreaker: createCircuitBreaker(),
  messageQueue: createMessageQueue(),
  loadBalancer: autoLoadBalancer(),
  serviceRegistry: autoServiceRegistry(),
  webSocketServer: autoWebSocketServer(),
  router: autoIntelligentRouter(),
  eventTriggers: autoEventTriggers()
};

// That's it! Production-ready distributed system in 30 seconds!
```

## 🔗 Automatic Cross-Module Integration

All modules automatically integrate:
- **Circuit Breakers** ↔️ **Message Queues**: Fault tolerance for messaging
- **Event Triggers** ↔️ **All Modules**: Event-driven coordination  
- **Service Registry** ↔️ **Load Balancer**: Service discovery and routing
- **WebSockets** ↔️ **Message Queue**: Real-time message broadcasting
- **All Modules** ↔️ **Intelligent Monitoring**: Unified observability

## 🚀 Quick Start

### Installation
```bash
npm install @generic/circuit-breaker @generic/message-queue @generic/load-balancer @generic/service-registry @generic/websockets @generic/intelligent-router @generic/event-triggers
```

### Demo
```bash
cd examples
node 30-second-setup-demo.js
```

## 🎉 What Makes This Revolutionary?

1. **Zero Setup Time**: Works immediately with no configuration
2. **Intelligent Defaults**: Smarter than manual configuration  
3. **Auto-Optimization**: Gets better over time automatically
4. **Cross-Module Synergy**: Modules work together seamlessly
5. **Enterprise Patterns**: Battle-tested reliability and performance
6. **ML-Driven**: Uses machine learning for optimal performance

## 📊 Performance Characteristics

- **Setup Time**: Seconds (vs hours for traditional systems)
- **Configuration Required**: 0 lines (vs hundreds/thousands typically)
- **Fault Tolerance**: Built-in (vs manual implementation)
- **Optimization**: Automatic (vs manual tuning)
- **Integration**: Seamless (vs complex manual coordination)
- **Monitoring**: Comprehensive (vs fragmented tooling)

---

**🌟 Experience the future of plug-and-play architecture today!**

## Installation

```bash
npm install @generic/workflow-bpm
```

## Quick Start

### Basic Usage

```typescript
import { WorkflowBPMOrchestrator, IWorkflowDefinition, WorkflowStatus } from '@generic/workflow-bpm';

// Create orchestrator instance
const orchestrator = new WorkflowBPMOrchestrator({
  logger: console // Use console logger, or provide your own
});

// Define a simple workflow
const simpleWorkflow: IWorkflowDefinition = {
  id: 'simple-approval-workflow',
  name: 'Simple Approval Process',
  version: '1.0',
  description: 'A basic approval workflow',
  category: 'approval',
  tags: ['approval', 'review'],
  metadata: {
    author: 'Your Team',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  triggers: [{
    id: 'manual-trigger',
    type: 'manual',
    name: 'Manual Start',
    description: 'Manually triggered workflow',
    enabled: true,
    configuration: {}
  }],
  steps: [
    {
      id: 'review-step',
      name: 'Review Request',
      type: 'human',
      description: 'Human review of the request',
      position: { x: 100, y: 100 },
      configuration: {},
      inputs: {
        request: 'parameters.request'
      },
      outputs: {
        approved: 'approved'
      },
      nextSteps: ['decision-step'],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 3
      },
      humanTask: {
        assignee: 'reviewer@company.com',
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    },
    {
      id: 'decision-step',
      name: 'Approval Decision',
      type: 'decision',
      description: 'Check if approved',
      position: { x: 200, y: 100 },
      configuration: {
        falseSteps: ['reject-step']
      },
      inputs: {
        approved: 'variables.approved'
      },
      outputs: {},
      nextSteps: ['approve-step'],
      conditions: [{
        expression: 'approved === true',
        description: 'Check if request was approved'
      }],
      errorHandling: {
        strategy: 'fail'
      }
    },
    {
      id: 'approve-step',
      name: 'Approve Request',
      type: 'task',
      description: 'Process approval',
      position: { x: 300, y: 50 },
      configuration: {},
      inputs: {
        request: 'parameters.request'
      },
      outputs: {
        result: 'approved'
      },
      nextSteps: [],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 2
      }
    },
    {
      id: 'reject-step',
      name: 'Reject Request',
      type: 'task',
      description: 'Process rejection',
      position: { x: 300, y: 150 },
      configuration: {},
      inputs: {
        request: 'parameters.request'
      },
      outputs: {
        result: 'rejected'
      },
      nextSteps: [],
      errorHandling: {
        strategy: 'retry',
        maxRetries: 2
      }
    }
  ],
  variables: {},
  parameters: {
    request: {
      type: 'object',
      displayName: 'Request Data',
      category: 'Input',
      order: 1,
      description: 'The request to be approved',
      required: true
    }
  },
  sla: {
    responseTime: '1h',
    resolutionTime: '24h'
  },
  security: {
    classification: 'internal',
    requiredRoles: ['approver'],
    requiredPermissions: ['workflow.execute'],
    dataEncryption: false,
    auditLevel: 'basic'
  },
  integrations: {
    taskManagement: {
      enabled: false,
      createTasks: false,
      updateTaskStatus: false,
      taskPriority: 'medium'
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
      evidenceRetention: '1y'
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
      includeVariables: false
    }
  }
};

// Register and start workflow
async function main() {
  // Register the workflow definition
  await orchestrator.registerWorkflowDefinition(simpleWorkflow);
  
  // Start a workflow instance
  const instance = await orchestrator.startWorkflow('simple-approval-workflow', {
    request: {
      id: 'REQ-001',
      title: 'Budget Approval',
      amount: 5000,
      requester: 'john.doe@company.com'
    }
  }, 'system');
  
  console.log('Workflow started:', instance.id);
  
  // Monitor workflow progress
  orchestrator.on('workflow-completed', (completedInstance) => {
    console.log('Workflow completed:', completedInstance.id);
    console.log('Result:', completedInstance.variables);
  });
}

main().catch(console.error);
```

### With Custom Logger

```typescript
import winston from 'winston';
import { WorkflowBPMOrchestrator, ILogger } from '@generic/workflow-bpm';

// Create a custom logger that implements ILogger interface
const customLogger: ILogger = {
  error: (message: string, meta?: any) => winston.error(message, meta),
  warn: (message: string, meta?: any) => winston.warn(message, meta),
  info: (message: string, meta?: any) => winston.info(message, meta),
  debug: (message: string, meta?: any) => winston.debug(message, meta)
};

const orchestrator = new WorkflowBPMOrchestrator({
  logger: customLogger,
  engine: {
    maxConcurrentWorkflows: 10000,
    executionTimeout: 30 * 60 * 1000, // 30 minutes
    optimization: {
      enabled: true,
      mlOptimization: false,
      dynamicScaling: true
    }
  }
});
```

### Integration with External Services

```typescript
import { WorkflowBPMOrchestrator } from '@generic/workflow-bpm';

// Mock external services
class TaskManager {
  async createTask(taskData: any) {
    console.log('Creating task:', taskData);
    return { id: 'task-123', status: 'created' };
  }
  
  on(event: string, handler: (data: any) => void) {
    // Handle task completion events
    if (event === 'task-completed') {
      // Simulate task completion after 5 seconds
      setTimeout(() => {
        handler({
          id: 'task-123',
          status: 'completed',
          result: { approved: true }
        });
      }, 5000);
    }
  }
}

class MessageQueue {
  async subscribe(pattern: string, handler: (message: any) => void) {
    console.log('Subscribed to:', pattern);
  }
  
  async publish(topic: string, message: any) {
    console.log('Published to', topic, ':', message);
  }
}

const orchestrator = new WorkflowBPMOrchestrator({
  integrations: {
    taskManager: new TaskManager(),
    messageQueue: new MessageQueue()
  }
});
```

### Custom Step Handlers

```typescript
import { WorkflowBPMOrchestrator, StepType, IStepHandler, IStepContext, IStepResult } from '@generic/workflow-bpm';

// Create a custom step handler
const emailStepHandler: IStepHandler = {
  type: 'email' as StepType, // You can extend StepType or cast as needed
  
  async execute(step: any, context: IStepContext): Promise<IStepResult> {
    const { stepInputs, services } = context;
    
    try {
      // Send email (mock implementation)
      console.log('Sending email:', {
        to: stepInputs.recipient,
        subject: stepInputs.subject,
        body: stepInputs.body
      });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        outputs: {
          emailSent: true,
          sentAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }
};

// Register custom step handler
const orchestrator = new WorkflowBPMOrchestrator();
orchestrator.workflowEngine.registerStepHandler(emailStepHandler);
```

## Architecture

### Core Components

1. **WorkflowBPMOrchestrator**: Main entry point that coordinates all components
2. **WorkflowEngineCore**: Core execution engine that manages workflow lifecycle
3. **InMemoryWorkflowRepository**: Storage layer for workflow definitions and instances
4. **Step Handlers**: Pluggable handlers for different step types

### Step Types

- **TASK**: Execute business logic or external service calls
- **DECISION**: Conditional branching based on expressions
- **PARALLEL**: Execute multiple steps concurrently
- **SEQUENTIAL**: Execute steps one after another
- **TIMER**: Wait for a specified duration
- **HUMAN**: Require human intervention
- **SCRIPT**: Execute JavaScript expressions
- **MESSAGE**: Send/receive messages
- **SUBPROCESS**: Execute child workflows

### Integration Points

The system provides hooks for integrating with:

- **Task Management Systems**: Create and track tasks
- **Message Queues**: Event-driven workflow triggering
- **Evidence Management**: Collect and preserve execution evidence
- **Issue Tracking**: Link workflows to issues and incidents

## API Reference

### WorkflowBPMOrchestrator

```typescript
class WorkflowBPMOrchestrator extends EventEmitter {
  constructor(config?: IWorkflowBPMConfig);
  
  // Workflow management
  async registerWorkflowDefinition(definition: IWorkflowDefinition): Promise<void>;
  async startWorkflow(workflowId: string, parameters?: Record<string, any>, initiatedBy?: string): Promise<IWorkflowInstance>;
  async pauseWorkflow(instanceId: string): Promise<void>;
  async resumeWorkflow(instanceId: string): Promise<void>;
  async cancelWorkflow(instanceId: string, reason?: string): Promise<void>;
  
  // Instance management
  async getWorkflowInstance(instanceId: string): Promise<IWorkflowInstance>;
  async getWorkflowDefinitions(): Promise<IWorkflowDefinition[]>;
  
  // Monitoring
  getPerformanceMetrics(): any;
  async getSystemHealth(): Promise<any>;
}
```

### Events

The orchestrator emits the following events:

- `workflow-started`: When a workflow begins execution
- `workflow-completed`: When a workflow finishes successfully
- `workflow-failed`: When a workflow fails
- `workflow-paused`: When a workflow is paused
- `workflow-resumed`: When a workflow is resumed
- `workflow-cancelled`: When a workflow is cancelled
- `performance-metrics`: Periodic performance updates

## Configuration

### IWorkflowBPMConfig

```typescript
interface IWorkflowBPMConfig {
  database?: {
    connectionString?: string;
  };
  engine?: {
    maxConcurrentWorkflows?: number;
    memoryLimit?: string;
    executionTimeout?: number;
    checkpointInterval?: number;
    optimization?: {
      enabled: boolean;
      mlOptimization: boolean;
      dynamicScaling: boolean;
    };
    logger?: ILogger;
  };
  integrations?: {
    taskManager?: any;
    messageQueue?: any;
    evidenceManager?: any;
    issueManager?: any;
  };
  performance?: {
    enableOptimization?: boolean;
    enableMLOptimization?: boolean;
    enableDynamicScaling?: boolean;
  };
  logger?: ILogger;
}
```

## Performance & Monitoring

The system provides comprehensive performance monitoring:

```typescript
// Get current performance metrics
const metrics = orchestrator.getPerformanceMetrics();
console.log('Active workflows:', metrics.activeWorkflows);
console.log('Success rate:', metrics.successRate);
console.log('Average execution time:', metrics.averageExecutionTime);

// Get detailed system health
const health = await orchestrator.getSystemHealth();
console.log('System status:', health.status);
console.log('Engine metrics:', health.engine);
```

## Testing

```typescript
import { WorkflowBPMOrchestrator, WorkflowStatus } from '@generic/workflow-bpm';

describe('Workflow BPM', () => {
  let orchestrator: WorkflowBPMOrchestrator;
  
  beforeEach(() => {
    orchestrator = new WorkflowBPMOrchestrator();
  });
  
  test('should start and complete a simple workflow', async () => {
    // Register workflow
    await orchestrator.registerWorkflowDefinition(simpleWorkflow);
    
    // Start workflow
    const instance = await orchestrator.startWorkflow('simple-workflow', { test: true });
    
    // Verify instance was created
    expect(instance.status).toBe(WorkflowStatus.PENDING);
    
    // Wait for completion (in real tests, you'd use proper async handling)
    await new Promise(resolve => {
      orchestrator.once('workflow-completed', resolve);
    });
  });
});
```

## Migration from Phantom Spire

If you're migrating from the original Phantom Spire implementation:

1. **Remove CTI-specific imports**: No more `CTIWorkflowTemplates` or CTI-specific methods
2. **Provide your own logger**: Replace the built-in logger with your implementation
3. **Update workflow definitions**: Remove any CTI-specific step types or configurations
4. **Handle integrations**: Set up your own integration services as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions, please use the GitHub repository issue tracker.