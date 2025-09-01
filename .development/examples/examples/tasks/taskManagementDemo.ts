/**
 * Fortune 100-Grade Task Management System Demo
 * Comprehensive demonstration of enterprise CTI task management capabilities
 */

import {
  TaskManagerEngine,
  TaskHandlerRegistry,
  TaskManagementUtils,
  CTI_TASK_TEMPLATES,
  TaskType,
  TaskPriority,
  DEFAULT_TASK_MANAGER_CONFIG,
} from '../../data-layer/tasks';

import { DataLayerOrchestrator } from '../../data-layer/DataLayerOrchestrator';
import { MessageQueueManager } from '../../message-queue/core/MessageQueueManager';

/**
 * Enterprise Task Management Demo
 * Shows real-world usage patterns for Fortune 100 CTI operations
 */
export class TaskManagementDemo {
  private taskManager: TaskManagerEngine;
  private handlerRegistry: TaskHandlerRegistry;
  private orchestrator?: DataLayerOrchestrator;

  constructor(messageQueueManager?: MessageQueueManager) {
    // Initialize task management system
    this.taskManager = new TaskManagerEngine(
      {
        ...DEFAULT_TASK_MANAGER_CONFIG,
        maxConcurrentTasks: 50,
        taskTimeoutDefault: 300000, // 5 minutes
        logLevel: 'info',
      },
      messageQueueManager
    );

    // Initialize handler registry
    this.handlerRegistry = new TaskHandlerRegistry();

    // Register all built-in CTI handlers
    for (const handler of this.handlerRegistry.getAllHandlers()) {
      this.taskManager.registerHandler(handler);
    }

    // Initialize orchestrator if message queue is available
    if (messageQueueManager) {
      this.orchestrator = new DataLayerOrchestrator(
        {
          analytics: { enableAdvancedAnalytics: true },
          ingestion: { enabled: true },
          taskManagement: { enabled: true },
          messageQueue: { enabled: true },
        },
        messageQueueManager
      );
    }

    console.log('🚀 Fortune 100-Grade Task Management System initialized');
    console.log(`📊 Registered ${this.handlerRegistry.getAllHandlers().length} CTI task handlers`);
  }

  /**
   * Initialize the demo system
   */
  public async initialize(): Promise<void> {
    try {
      console.log('\n🔄 Initializing Task Management System...');

      // Initialize task manager
      await this.taskManager.initialize();
      console.log('✅ Task Manager initialized');

      // Initialize orchestrator if available
      if (this.orchestrator) {
        await this.orchestrator.initialize();
        console.log('✅ Data Layer Orchestrator initialized');
      }

      console.log('🎯 System ready for CTI operations');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Demo 1: Daily IOC Processing Workflow
   */
  public async demonstrateDailyIOCProcessing(): Promise<void> {
    console.log('\n📋 DEMO 1: Daily IOC Processing Workflow');
    console.log('=========================================');

    try {
      // Sample IOCs for processing
      const iocs = [
        '192.168.1.100',
        'malicious.example.com',
        'c99d5b6b7f2e4f1a8b3c2d5e7f9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        'phishing-site.net',
        '10.0.0.50',
      ];

      // Create IOC processing task
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'DAILY_IOC_ANALYSIS',
        {
          definition: {
            parameters: {
              iocs,
              operations: ['validate', 'enrich', 'classify', 'deduplicate'],
              enrichmentSources: ['virustotal', 'alienvault', 'internal'],
              batchSize: 100,
            },
          },
          priority: TaskPriority.HIGH,
          createdBy: 'cti-analyst',
          tags: ['daily', 'automated', 'ioc-processing'],
          metadata: {
            department: 'threat-intelligence',
            automation: true,
            scheduledExecution: true,
          },
        }
      );

      console.log(`📝 Creating IOC processing task for ${iocs.length} indicators...`);
      const task = await this.taskManager.createTask(taskDefinition);
      console.log(`✅ Task created: ${task.id}`);
      console.log(`   Type: ${task.type}`);
      console.log(`   Priority: ${task.priority}`);
      console.log(`   Handler: ${task.definition.handler}`);

      // Execute the task
      console.log('\n▶️  Executing IOC processing task...');
      const execution = await this.taskManager.executeTask(task.id);
      console.log(`🔄 Execution started: ${execution.id}`);
      console.log(`   Status: ${execution.status}`);
      console.log(`   Queued at: ${execution.queuedAt.toISOString()}`);

      // Monitor task progress
      await this.monitorTaskExecution(task.id, 10000);

    } catch (error) {
      console.error('❌ Daily IOC processing demo failed:', error);
    }
  }

  /**
   * Demo 2: Incident Response Workflow
   */
  public async demonstrateIncidentResponseWorkflow(): Promise<void> {
    console.log('\n🚨 DEMO 2: Incident Response Workflow');
    console.log('====================================');

    try {
      const incidentId = `INC-${Date.now()}`;
      const affectedSystems = [
        'web-server-01.company.com',
        'db-server-02.company.com',
        'workstation-analyst.company.com',
      ];

      console.log(`🆔 Incident ID: ${incidentId}`);
      console.log(`🎯 Affected Systems: ${affectedSystems.length} systems`);

      // Use orchestrator for incident workflow if available
      if (this.orchestrator) {
        console.log('\n🎬 Creating comprehensive incident response workflow...');
        
        const { tasks, workflowId } = await this.orchestrator.createIncidentResponseWorkflow(
          incidentId,
          'critical',
          affectedSystems,
          {
            userId: 'incident-commander',
            permissions: ['incident_response', 'evidence_collection', 'threat_analysis'],
          }
        );

        console.log(`✅ Incident workflow created: ${workflowId}`);
        console.log(`📊 Generated ${tasks.length} tasks:`);
        
        tasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.name} (${task.type})`);
          console.log(`      Priority: ${task.priority} | ID: ${task.id}`);
        });

      } else {
        // Manual workflow creation without orchestrator
        console.log('\n🎬 Creating manual incident response workflow...');
        
        const workflows = await this.createIncidentResponseWorkflow(incidentId, affectedSystems);
        console.log(`✅ Created ${workflows.length} workflow tasks`);
      }

    } catch (error) {
      console.error('❌ Incident response workflow demo failed:', error);
    }
  }

  /**
   * Demo 3: Automated Threat Analysis
   */
  public async demonstrateThreatAnalysis(): Promise<void> {
    console.log('\n🔍 DEMO 3: Automated Threat Analysis');
    console.log('===================================');

    try {
      // Sample threat datasets
      const datasets = [
        { source: 'internal_logs', recordCount: 5000, type: 'network_traffic' },
        { source: 'threat_feeds', recordCount: 2500, type: 'ioc_data' },
        { source: 'malware_samples', recordCount: 150, type: 'malware_analysis' },
        { source: 'user_behavior', recordCount: 8000, type: 'behavioral_data' },
      ];

      console.log(`📊 Analyzing ${datasets.length} threat intelligence datasets`);
      console.log(`📈 Total records: ${datasets.reduce((sum, ds) => sum + ds.recordCount, 0)}`);

      // Create correlation analysis task
      const analysisTask = await this.taskManager.createTask(
        TaskManagementUtils.createTaskFromTemplate('DATA_CORRELATION_ANALYSIS', {
          name: 'Multi-Source Threat Correlation Analysis',
          definition: {
            parameters: {
              datasets,
              correlationTypes: ['temporal', 'attributional', 'behavioral'],
              threshold: 0.75,
              includePatterns: true,
              timeWindow: '7d',
              analysis: {
                detectAnomalies: true,
                findCampaigns: true,
                attributionAnalysis: true,
                riskScoring: true,
              },
            },
          },
          priority: TaskPriority.HIGH,
          createdBy: 'threat-analyst',
          tags: ['analysis', 'correlation', 'automated'],
        })
      );

      console.log(`✅ Created threat analysis task: ${analysisTask.id}`);

      // Execute analysis
      console.log('\n🔄 Starting threat correlation analysis...');
      const execution = await this.taskManager.executeTask(analysisTask.id);
      console.log(`⚡ Analysis execution started: ${execution.id}`);

      // Monitor analysis progress
      await this.monitorTaskExecution(analysisTask.id, 15000);

    } catch (error) {
      console.error('❌ Threat analysis demo failed:', error);
    }
  }

  /**
   * Demo 4: Automated Report Generation
   */
  public async demonstrateReportGeneration(): Promise<void> {
    console.log('\n📄 DEMO 4: Automated Report Generation');
    console.log('=====================================');

    try {
      // Create weekly threat report
      const reportTask = await this.taskManager.createTask(
        TaskManagementUtils.createTaskFromTemplate('WEEKLY_THREAT_REPORT', {
          name: 'Executive Threat Intelligence Summary',
          definition: {
            parameters: {
              template: 'executive-summary',
              format: 'pdf',
              timeRange: '7d',
              sections: [
                'executive_summary',
                'threat_landscape',
                'ioc_analysis',
                'incident_summary',
                'recommendations',
                'appendices',
              ],
              includeCharts: true,
              includeTrends: true,
              classification: 'internal',
              recipients: [
                'ciso@company.com',
                'threat-team@company.com',
                'security-leadership@company.com',
              ],
            },
          },
          priority: TaskPriority.NORMAL,
          createdBy: 'report-automation',
          tags: ['report', 'weekly', 'executive'],
        })
      );

      console.log(`📋 Created executive report task: ${reportTask.id}`);
      console.log('📊 Report sections: Executive Summary, Threat Landscape, IOC Analysis');
      console.log('📧 Recipients: CISO, Threat Team, Security Leadership');

      // Execute report generation
      const execution = await this.taskManager.executeTask(reportTask.id);
      console.log(`\n🔄 Report generation started: ${execution.id}`);

      await this.monitorTaskExecution(reportTask.id, 8000);

    } catch (error) {
      console.error('❌ Report generation demo failed:', error);
    }
  }

  /**
   * Demo 5: System Monitoring and Health
   */
  public async demonstrateSystemMonitoring(): Promise<void> {
    console.log('\n📊 DEMO 5: System Monitoring and Health');
    console.log('======================================');

    try {
      // Get system health
      const health = await this.taskManager.healthCheck();
      console.log('\n🏥 System Health Status:');
      console.log(`   Overall Status: ${health.status.toUpperCase()}`);
      console.log(`   Total Tasks: ${health.details.totalTasks}`);
      console.log(`   Running Tasks: ${health.details.runningTasks}`);
      console.log(`   Queue Length: ${health.details.queueLength}`);
      console.log(`   Success Rate: ${(health.details.successRate * 100).toFixed(1)}%`);

      // Get system metrics
      const metrics = await this.taskManager.getSystemMetrics();
      console.log('\n📈 Performance Metrics:');
      console.log(`   Completed Tasks: ${metrics.completedTasks}`);
      console.log(`   Failed Tasks: ${metrics.failedTasks}`);
      console.log(`   Average Execution Time: ${metrics.averageExecutionTime}ms`);
      console.log(`   Active Executions: ${metrics.activeExecutions}`);

      // Query recent tasks
      const recentTasks = await this.taskManager.queryTasks({
        limit: 10,
        sort: [{ field: 'createdAt', direction: 'desc' }],
      });

      console.log(`\n📋 Recent Tasks (${recentTasks.tasks.length}):`);
      recentTasks.tasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.name} | ${task.type} | ${task.status}`);
        console.log(`      Created: ${task.createdAt.toISOString()} | Priority: ${task.priority}`);
      });

      // Get task management health from orchestrator
      if (this.orchestrator) {
        const taskHealth = await this.orchestrator.getTaskManagementHealth();
        console.log('\n🔗 Integration Health:');
        console.log(`   Evidence Management: ${taskHealth.integration.evidenceManagement ? '✅' : '❌'}`);
        console.log(`   Data Ingestion: ${taskHealth.integration.dataIngestion ? '✅' : '❌'}`);
        console.log(`   Analytics: ${taskHealth.integration.analytics ? '✅' : '❌'}`);
        console.log(`   Message Queue: ${taskHealth.integration.messageQueue ? '✅' : '❌'}`);
      }

    } catch (error) {
      console.error('❌ System monitoring demo failed:', error);
    }
  }

  /**
   * Run all demonstrations
   */
  public async runFullDemo(): Promise<void> {
    console.log('\n🎭 STARTING FORTUNE 100-GRADE TASK MANAGEMENT DEMO');
    console.log('==================================================');
    
    try {
      await this.initialize();

      await this.demonstrateDailyIOCProcessing();
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.demonstrateIncidentResponseWorkflow();
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.demonstrateThreatAnalysis();
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.demonstrateReportGeneration();
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.demonstrateSystemMonitoring();

      console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY');
      console.log('==============================');
      console.log('✅ All Fortune 100-grade task management features demonstrated');
      console.log('🚀 System is ready for production CTI operations');

    } catch (error) {
      console.error('\n❌ DEMO FAILED');
      console.error('===============');
      console.error('Error:', error);
    }
  }

  /**
   * Cleanup and shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down Task Management Demo...');
    
    try {
      if (this.orchestrator) {
        await this.orchestrator.shutdown();
        console.log('✅ Data Layer Orchestrator shutdown');
      }

      await this.taskManager.shutdown();
      console.log('✅ Task Manager shutdown');

      console.log('👋 Demo shutdown completed');
    } catch (error) {
      console.error('❌ Shutdown error:', error);
    }
  }

  // Helper methods

  private async monitorTaskExecution(taskId: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.taskManager.getTaskStatus(taskId);
        console.log(`   📊 Task Status: ${status}`);

        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
          // Get final metrics
          try {
            const metrics = await this.taskManager.getTaskMetrics(taskId);
            console.log(`   ⏱️  Execution Time: ${metrics.executionTime}ms`);
            console.log(`   📈 Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
          } catch (metricsError) {
            // Metrics might not be available yet
          }
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('   ❌ Monitoring error:', error);
        break;
      }
    }
  }

  private async createIncidentResponseWorkflow(
    incidentId: string,
    affectedSystems: string[]
  ): Promise<any[]> {
    const tasks = [];

    // Evidence Collection Task
    const evidenceTask = await this.taskManager.createTask(
      TaskManagementUtils.createTaskFromTemplate('INCIDENT_EVIDENCE_COLLECTION', {
        name: `Evidence Collection - ${incidentId}`,
        definition: {
          parameters: {
            sources: affectedSystems,
            incidentId,
            preservationLevel: 'forensic',
            evidenceTypes: ['disk_images', 'memory_dumps', 'network_logs', 'registry_hives'],
          },
        },
        priority: TaskPriority.CRITICAL,
        tags: ['incident', 'evidence', 'forensics'],
      })
    );
    tasks.push(evidenceTask);

    // Threat Analysis Task
    const analysisTask = await this.taskManager.createTask(
      TaskManagementUtils.createTaskFromTemplate('DATA_CORRELATION_ANALYSIS', {
        name: `Threat Analysis - ${incidentId}`,
        definition: {
          parameters: {
            datasets: [{ source: 'incident_evidence', incidentId }],
            correlationTypes: ['temporal', 'attributional'],
            urgency: 'high',
          },
        },
        priority: TaskPriority.CRITICAL,
        dependencies: [evidenceTask.id],
        tags: ['incident', 'analysis'],
      })
    );
    tasks.push(analysisTask);

    // Alert Task
    const alertTask = await this.taskManager.createTask(
      TaskManagementUtils.createTaskFromTemplate('REAL_TIME_ALERT', {
        name: `Critical Incident Alert - ${incidentId}`,
        definition: {
          parameters: {
            alertType: 'critical_incident',
            severity: 'critical',
            incidentId,
            affectedSystems,
            channels: ['email', 'sms', 'webhook'],
          },
        },
        priority: TaskPriority.CRITICAL,
        tags: ['incident', 'alert', 'critical'],
      })
    );
    tasks.push(alertTask);

    return tasks;
  }
}

// Export demo function for easy execution
export async function runTaskManagementDemo(): Promise<void> {
  const demo = new TaskManagementDemo();
  
  try {
    await demo.runFullDemo();
  } finally {
    await demo.shutdown();
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  runTaskManagementDemo().catch(console.error);
}