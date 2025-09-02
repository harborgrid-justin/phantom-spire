/**
 * Task Management System Integration Tests
 * Fortune 100-Grade Task Management Architecture Validation
 */

import {
  TaskManagerEngine,
  ITaskManager,
  TaskType,
  TaskStatus,
  TaskPriority,
  CTI_TASK_TEMPLATES,
  TaskManagementUtils,
  DEFAULT_TASK_MANAGER_CONFIG,
  TaskHandlerRegistry,
} from '../../data-layer/tasks.js';

describe('Fortune 100-Grade Task Management System', () => {
  let taskManager: ITaskManager;
  let handlerRegistry: TaskHandlerRegistry;

  beforeAll(async () => {
    // Initialize task management system
    taskManager = new TaskManagerEngine(DEFAULT_TASK_MANAGER_CONFIG);
    handlerRegistry = new TaskHandlerRegistry();

    // Register built-in handlers
    for (const handler of handlerRegistry.getAllHandlers()) {
      (taskManager as TaskManagerEngine).registerHandler(handler);
    }

    // Initialize the system
    await (taskManager as TaskManagerEngine).initialize();
  });

  afterAll(async () => {
    // Shutdown the system
    if (taskManager) {
      await (taskManager as TaskManagerEngine).shutdown();
    }
  });

  describe('Core Task Management', () => {
    it('should create and execute a basic IOC processing task', async () => {
      // Create task from template
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'DAILY_IOC_ANALYSIS',
        {
          definition: {
            parameters: {
              iocs: ['192.168.1.100', 'malicious.example.com', 'hash123456'],
              operations: ['validate', 'enrich', 'classify'],
            },
          },
          createdBy: 'test-user',
          metadata: { testRun: true },
        }
      );

      // Create the task
      const task = await taskManager.createTask(taskDefinition);

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.name).toBe('Daily IOC Analysis');
      expect(task.type).toBe(TaskType.IOC_PROCESSING);
      expect(task.status).toBe(TaskStatus.CREATED);
      expect(task.createdBy).toBe('test-user');

      // Execute the task
      const execution = await taskManager.executeTask(task.id);

      expect(execution).toBeDefined();
      expect(execution.taskId).toBe(task.id);
      expect(execution.status).toBe(TaskStatus.QUEUED);

      // Wait a moment for processing to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get task status
      const status = await taskManager.getTaskStatus(task.id);
      expect([
        TaskStatus.QUEUED,
        TaskStatus.RUNNING,
        TaskStatus.COMPLETED,
      ]).toContain(status);
    }, 15000);

    it('should create and execute a threat analysis task', async () => {
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'DATA_CORRELATION_ANALYSIS',
        {
          definition: {
            parameters: {
              datasets: [
                { source: 'feed1', recordCount: 1000 },
                { source: 'feed2', recordCount: 500 },
              ],
              correlationTypes: ['temporal', 'attributional'],
              threshold: 0.8,
            },
          },
          priority: TaskPriority.HIGH,
          createdBy: 'test-analyst',
        }
      );

      const task = await taskManager.createTask(taskDefinition);

      expect(task.type).toBe(TaskType.CORRELATION_ANALYSIS);
      expect(task.priority).toBe(TaskPriority.HIGH);

      const execution = await taskManager.executeTask(task.id);
      expect(execution).toBeDefined();
    }, 10000);

    it('should handle task cancellation', async () => {
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'THREAT_INTELLIGENCE_INGESTION',
        {
          definition: {
            parameters: {
              source: 'test-feed',
              pipeline: 'test-pipeline',
              recordCount: 10000, // Large task for cancellation test
            },
          },
          createdBy: 'test-user',
        }
      );

      const task = await taskManager.createTask(taskDefinition);
      const execution = await taskManager.executeTask(task.id);

      // Cancel the task immediately
      const cancelled = await taskManager.cancelTask(task.id);
      expect(cancelled).toBe(true);

      const finalStatus = await taskManager.getTaskStatus(task.id);
      expect(finalStatus).toBe(TaskStatus.CANCELLED);
    }, 10000);

    it('should query tasks with filters', async () => {
      // Create multiple tasks
      const tasks = [];
      for (let i = 0; i < 3; i++) {
        const taskDef = TaskManagementUtils.createTaskFromTemplate(
          'REAL_TIME_ALERT',
          {
            name: `Test Alert ${i}`,
            definition: {
              parameters: {
                alertType: 'test_alert',
                severity: i === 0 ? 'critical' : 'high',
                recipients: ['test@example.com'],
              },
            },
            tags: ['test', `batch-${Math.floor(i / 2)}`],
            createdBy: 'test-user',
          }
        );

        const task = await taskManager.createTask(taskDef);
        tasks.push(task);
      }

      // Query with type filter
      const alertTasks = await taskManager.queryTasks({
        types: [TaskType.ALERTING],
        limit: 10,
      });

      expect(alertTasks.tasks.length).toBeGreaterThanOrEqual(3);
      expect(alertTasks.tasks.every(t => t.type === TaskType.ALERTING)).toBe(
        true
      );

      // Query with tag filter
      const taggedTasks = await taskManager.queryTasks({
        tags: ['test'],
        limit: 10,
      });

      expect(taggedTasks.tasks.length).toBeGreaterThanOrEqual(3);
      expect(taggedTasks.tasks.every(t => t.tags.includes('test'))).toBe(true);
    }, 15000);

    it('should search tasks by text', async () => {
      // Create a task with distinctive name
      const taskDef = TaskManagementUtils.createTaskFromTemplate(
        'WEEKLY_THREAT_REPORT',
        {
          name: 'Unique Searchable Report Task',
          definition: {
            parameters: {
              template: 'test-template',
              format: 'pdf',
            },
          },
          tags: ['searchable', 'unique'],
          createdBy: 'test-user',
        }
      );

      const task = await taskManager.createTask(taskDef);

      // Search for the task
      const searchResults = await taskManager.searchTasks('Unique Searchable', {
        fields: ['name', 'tags'],
        limit: 10,
      });

      expect(searchResults.tasks.length).toBeGreaterThanOrEqual(1);
      const foundTask = searchResults.tasks.find(t => t.id === task.id);
      expect(foundTask).toBeDefined();
    }, 10000);
  });

  describe('Task Handlers', () => {
    it('should have all built-in CTI handlers registered', () => {
      const allHandlers = handlerRegistry.getAllHandlers();

      expect(allHandlers.length).toBeGreaterThanOrEqual(8);

      // Check for specific CTI handlers
      const handlerNames = allHandlers.map(h => h.name);
      expect(handlerNames).toContain('DataIngestionHandler');
      expect(handlerNames).toContain('ThreatAnalysisHandler');
      expect(handlerNames).toContain('IOCProcessingHandler');
      expect(handlerNames).toContain('EvidenceCollectionHandler');
      expect(handlerNames).toContain('ReportGenerationHandler');
      expect(handlerNames).toContain('AlertingHandler');
      expect(handlerNames).toContain('DataEnrichmentHandler');
      expect(handlerNames).toContain('CorrelationAnalysisHandler');
    });

    it('should get handlers for specific task types', () => {
      const iocHandlers = handlerRegistry.getHandlersForType(
        TaskType.IOC_PROCESSING
      );
      expect(iocHandlers.length).toBeGreaterThanOrEqual(1);
      expect(iocHandlers[0].supportedTypes).toContain(TaskType.IOC_PROCESSING);

      const threatHandlers = handlerRegistry.getHandlersForType(
        TaskType.THREAT_ANALYSIS
      );
      expect(threatHandlers.length).toBeGreaterThanOrEqual(1);
      expect(threatHandlers[0].supportedTypes).toContain(
        TaskType.THREAT_ANALYSIS
      );
    });
  });

  describe('Task Templates and Utilities', () => {
    it('should create tasks from all available templates', () => {
      const templates = Object.keys(
        CTI_TASK_TEMPLATES
      ) as (keyof typeof CTI_TASK_TEMPLATES)[];

      expect(templates.length).toBeGreaterThanOrEqual(6);

      for (const templateName of templates) {
        const taskDef = TaskManagementUtils.createTaskFromTemplate(
          templateName,
          {
            createdBy: 'test-user',
          }
        );

        expect(taskDef).toBeDefined();
        expect(taskDef.name).toBeDefined();
        expect(taskDef.type).toBeDefined();
        expect(taskDef.definition).toBeDefined();
        expect(taskDef.definition.handler).toBeDefined();
        expect(taskDef.definition.parameters).toBeDefined();
        expect(taskDef.metadata.template).toBe(templateName);
      }
    });

    it('should calculate task priorities correctly', () => {
      expect(
        TaskManagementUtils.calculateTaskPriority({
          severity: 'critical',
          urgency: 'immediate',
        })
      ).toBe('critical');

      expect(
        TaskManagementUtils.calculateTaskPriority({
          severity: 'high',
          urgency: 'urgent',
        })
      ).toBe('high');

      expect(
        TaskManagementUtils.calculateTaskPriority({
          severity: 'medium',
        })
      ).toBe('normal');

      expect(TaskManagementUtils.calculateTaskPriority({})).toBe('low');
    });

    it('should generate workflow dependencies', () => {
      const incidentDeps =
        TaskManagementUtils.generateTaskDependencies('incident-response');
      expect(incidentDeps).toContain('evidence-collection');
      expect(incidentDeps).toContain('threat-analysis');
      expect(incidentDeps).toContain('report-generation');

      const threatIntelDeps = TaskManagementUtils.generateTaskDependencies(
        'threat-intelligence'
      );
      expect(threatIntelDeps).toContain('data-ingestion');
      expect(threatIntelDeps).toContain('correlation-analysis');
    });

    it('should estimate task durations', () => {
      const iocDuration = TaskManagementUtils.estimateTaskDuration(
        'ioc_processing',
        { recordCount: 1000 }
      );
      expect(iocDuration).toBeGreaterThan(180000); // Base + record processing time

      const ingestionDuration = TaskManagementUtils.estimateTaskDuration(
        'data_ingestion',
        { dataSize: 1000000 }
      );
      expect(ingestionDuration).toBeGreaterThan(300000); // Base + data size processing time
    });
  });

  describe('System Health and Metrics', () => {
    it('should report system health', async () => {
      const health = await taskManager.healthCheck();

      expect(health).toBeDefined();
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.details).toBeDefined();
      expect(typeof health.details.totalTasks).toBe('number');
      expect(typeof health.details.runningTasks).toBe('number');
    });

    it('should provide system metrics', async () => {
      const metrics = await taskManager.getSystemMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalTasks).toBe('number');
      expect(typeof metrics.completedTasks).toBe('number');
      expect(typeof metrics.failedTasks).toBe('number');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle invalid task creation gracefully', async () => {
      // Try to create task with missing required fields
      await expect(
        taskManager.createTask({
          name: 'Invalid Task',
          // Missing type and definition
        } as any)
      ).rejects.toThrow();
    });

    it('should handle non-existent task operations gracefully', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(taskManager.getTask(nonExistentId)).resolves.toBeNull();
      await expect(taskManager.executeTask(nonExistentId)).rejects.toThrow();
      await expect(taskManager.deleteTask(nonExistentId)).resolves.toBe(false);
    });
  });
});
