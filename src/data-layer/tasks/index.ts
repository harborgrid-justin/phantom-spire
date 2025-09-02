/**
 * Task Management System - Index
 * Fortune 100-Grade Task Management Architecture Entry Point
 */

// Core interfaces
export * from './interfaces/ITaskManager.js';

// Core implementation
import {
  TaskManagerEngine,
  DEFAULT_TASK_MANAGER_CONFIG,
} from './core/TaskManagerEngine.js';
import { TaskHandlerRegistry } from './handlers/TaskHandlers.js';

export {
  TaskManagerEngine,
  DEFAULT_TASK_MANAGER_CONFIG,
} from './core/TaskManagerEngine.js';

// Built-in handlers
export {
  BaseTaskHandler,
  DataIngestionTaskHandler,
  ThreatAnalysisTaskHandler,
  IOCProcessingTaskHandler,
  EvidenceCollectionTaskHandler,
  ReportGenerationTaskHandler,
  AlertingTaskHandler,
  DataEnrichmentTaskHandler,
  CorrelationAnalysisTaskHandler,
  TaskHandlerRegistry,
} from './handlers/TaskHandlers.js';

// Default configuration for common CTI task types
export const DEFAULT_CTI_TASK_CONFIGURATIONS = {
  DATA_INGESTION: {
    timeout: 300000, // 5 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential' as const,
      initialDelay: 1000,
      maxDelay: 30000,
      multiplier: 2,
      retryConditions: ['NETWORK_ERROR', 'TIMEOUT', 'TEMPORARY_FAILURE'],
    },
    resources: {
      memory: 1024, // 1GB
      cpu: 1, // 1 CPU unit
      disk: 500, // 500MB
    },
  },

  THREAT_ANALYSIS: {
    timeout: 600000, // 10 minutes
    retryPolicy: {
      maxAttempts: 2,
      backoffStrategy: 'linear' as const,
      initialDelay: 2000,
      maxDelay: 60000,
      retryConditions: ['API_ERROR', 'ANALYSIS_TIMEOUT'],
    },
    resources: {
      memory: 2048, // 2GB
      cpu: 2, // 2 CPU units
      networkBandwidth: 50, // 50 Mbps
    },
  },

  IOC_PROCESSING: {
    timeout: 180000, // 3 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential' as const,
      initialDelay: 500,
      maxDelay: 10000,
      multiplier: 2,
      retryConditions: ['VALIDATION_ERROR', 'ENRICHMENT_FAILURE'],
    },
    resources: {
      memory: 512, // 512MB
      cpu: 0.5, // 0.5 CPU units
    },
  },

  EVIDENCE_COLLECTION: {
    timeout: 900000, // 15 minutes
    retryPolicy: {
      maxAttempts: 2,
      backoffStrategy: 'fixed' as const,
      initialDelay: 5000,
      maxDelay: 5000,
      retryConditions: ['COLLECTION_FAILURE', 'INTEGRITY_CHECK_FAILURE'],
    },
    resources: {
      memory: 1024, // 1GB
      cpu: 1, // 1 CPU unit
      disk: 2048, // 2GB for evidence storage
    },
  },

  REPORT_GENERATION: {
    timeout: 600000, // 10 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential' as const,
      initialDelay: 1000,
      maxDelay: 30000,
      multiplier: 2,
      retryConditions: ['TEMPLATE_ERROR', 'GENERATION_FAILURE'],
    },
    resources: {
      memory: 1024, // 1GB
      cpu: 1, // 1 CPU unit
      disk: 100, // 100MB for report files
    },
  },

  ALERTING: {
    timeout: 30000, // 30 seconds
    retryPolicy: {
      maxAttempts: 5,
      backoffStrategy: 'exponential' as const,
      initialDelay: 1000,
      maxDelay: 10000,
      multiplier: 1.5,
      retryConditions: ['DELIVERY_FAILURE', 'NETWORK_ERROR'],
    },
    resources: {
      memory: 256, // 256MB
      cpu: 0.2, // 0.2 CPU units
      networkBandwidth: 10, // 10 Mbps
    },
  },

  DATA_ENRICHMENT: {
    timeout: 120000, // 2 minutes
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'linear' as const,
      initialDelay: 2000,
      maxDelay: 10000,
      retryConditions: ['API_RATE_LIMIT', 'ENRICHMENT_SOURCE_ERROR'],
    },
    resources: {
      memory: 512, // 512MB
      cpu: 0.5, // 0.5 CPU units
      networkBandwidth: 20, // 20 Mbps
    },
  },

  CORRELATION_ANALYSIS: {
    timeout: 1200000, // 20 minutes
    retryPolicy: {
      maxAttempts: 2,
      backoffStrategy: 'fixed' as const,
      initialDelay: 10000,
      maxDelay: 10000,
      retryConditions: ['ANALYSIS_TIMEOUT', 'MEMORY_ERROR'],
    },
    resources: {
      memory: 4096, // 4GB
      cpu: 4, // 4 CPU units
    },
  },
};

/**
 * Task Management System Factory
 * Creates and configures a complete task management system
 */
export class TaskManagementSystemFactory {
  public static createTaskManagerEngine(
    config?: Partial<any>,
    messageQueueManager?: any
  ): TaskManagerEngine {
    const engine = new TaskManagerEngine(config, messageQueueManager);

    // Register built-in handlers
    const handlerRegistry = new TaskHandlerRegistry();

    // Initialize with CTI-specific configurations
    for (const handler of handlerRegistry.getAllHandlers()) {
      engine.registerHandler(handler);
    }

    return engine;
  }

  public static getTaskConfigurationForType(taskType: string): any {
    const configKey =
      taskType.toUpperCase() as keyof typeof DEFAULT_CTI_TASK_CONFIGURATIONS;
    return (
      DEFAULT_CTI_TASK_CONFIGURATIONS[configKey] ||
      DEFAULT_CTI_TASK_CONFIGURATIONS.DATA_INGESTION
    );
  }
}

/**
 * Common CTI Task Templates
 * Pre-defined task templates for common CTI operations
 */
export const CTI_TASK_TEMPLATES = {
  DAILY_IOC_ANALYSIS: {
    name: 'Daily IOC Analysis',
    type: 'ioc_processing' as const,
    priority: 'high' as const,
    definition: {
      handler: 'IOCProcessingHandler',
      parameters: {
        operations: ['validate', 'enrich', 'classify', 'deduplicate'],
        enrichment: true,
        sources: ['internal', 'external'],
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.IOC_PROCESSING,
    },
    tags: ['daily', 'ioc', 'analysis'],
    schedule: {
      type: 'recurring' as const,
      cronExpression: '0 2 * * *', // Daily at 2 AM
      timezone: 'UTC',
    },
  },

  THREAT_INTELLIGENCE_INGESTION: {
    name: 'Threat Intelligence Feed Ingestion',
    type: 'data_ingestion' as const,
    priority: 'normal' as const,
    definition: {
      handler: 'DataIngestionHandler',
      parameters: {
        pipeline: 'threat-intel-pipeline',
        batchSize: 1000,
        format: 'stix',
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.DATA_INGESTION,
    },
    tags: ['ingestion', 'threat-intel', 'automated'],
  },

  INCIDENT_EVIDENCE_COLLECTION: {
    name: 'Incident Evidence Collection',
    type: 'evidence_collection' as const,
    priority: 'critical' as const,
    definition: {
      handler: 'EvidenceCollectionHandler',
      parameters: {
        types: ['digital', 'network', 'behavioral'],
        preservationLevel: 'forensic',
        chainOfCustody: true,
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.EVIDENCE_COLLECTION,
    },
    tags: ['incident', 'evidence', 'forensics'],
  },

  WEEKLY_THREAT_REPORT: {
    name: 'Weekly Threat Intelligence Report',
    type: 'report_generation' as const,
    priority: 'normal' as const,
    definition: {
      handler: 'ReportGenerationHandler',
      parameters: {
        template: 'weekly-threat-summary',
        format: 'pdf',
        includeCharts: true,
        includeTrends: true,
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.REPORT_GENERATION,
    },
    tags: ['report', 'weekly', 'threat-intel'],
    schedule: {
      type: 'recurring' as const,
      cronExpression: '0 8 * * 1', // Weekly on Monday at 8 AM
      timezone: 'UTC',
    },
  },

  REAL_TIME_ALERT: {
    name: 'Real-time Threat Alert',
    type: 'alerting' as const,
    priority: 'critical' as const,
    definition: {
      handler: 'AlertingHandler',
      parameters: {
        alertType: 'threat_detection',
        severity: 'high',
        channels: ['email', 'sms', 'webhook'],
        immediate: true,
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.ALERTING,
    },
    tags: ['alert', 'real-time', 'critical'],
  },

  DATA_CORRELATION_ANALYSIS: {
    name: 'Multi-source Data Correlation',
    type: 'correlation_analysis' as const,
    priority: 'high' as const,
    definition: {
      handler: 'CorrelationAnalysisHandler',
      parameters: {
        correlationTypes: ['temporal', 'attributional', 'behavioral'],
        threshold: 0.75,
        includePatterns: true,
      },
      ...DEFAULT_CTI_TASK_CONFIGURATIONS.CORRELATION_ANALYSIS,
    },
    tags: ['correlation', 'analysis', 'multi-source'],
  },
};

/**
 * Enterprise Task Management Utilities
 * Helper functions for Fortune 100-grade task management operations
 */
export class TaskManagementUtils {
  /**
   * Create a task from a template
   */
  public static createTaskFromTemplate(
    templateName: keyof typeof CTI_TASK_TEMPLATES,
    overrides: any = {}
  ): any {
    const template = CTI_TASK_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Task template '${templateName}' not found`);
    }

    return {
      ...template,
      ...overrides,
      definition: {
        ...template.definition,
        ...overrides.definition,
        parameters: {
          ...template.definition.parameters,
          ...overrides.definition?.parameters,
        },
      },
      metadata: {
        template: templateName,
        createdAt: new Date().toISOString(),
        ...overrides.metadata,
      },
    };
  }

  /**
   * Generate task dependencies based on workflow
   */
  public static generateTaskDependencies(workflow: string): string[] {
    const workflows: Record<string, string[]> = {
      'incident-response': [
        'evidence-collection',
        'threat-analysis',
        'ioc-processing',
        'report-generation',
        'alerting',
      ],
      'threat-intelligence': [
        'data-ingestion',
        'data-enrichment',
        'correlation-analysis',
        'report-generation',
      ],
      'daily-operations': [
        'data-ingestion',
        'ioc-processing',
        'threat-analysis',
        'alerting',
      ],
    };

    return workflows[workflow] || [];
  }

  /**
   * Calculate task priority based on context
   */
  public static calculateTaskPriority(context: {
    severity?: string;
    urgency?: string;
    impact?: string;
    source?: string;
  }): 'critical' | 'high' | 'normal' | 'low' {
    const { severity, urgency, impact } = context;

    if (severity === 'critical' || urgency === 'immediate') {
      return 'critical';
    }

    if (severity === 'high' || urgency === 'urgent' || impact === 'high') {
      return 'high';
    }

    if (severity === 'medium' || urgency === 'normal') {
      return 'normal';
    }

    return 'low';
  }

  /**
   * Estimate task completion time based on parameters
   */
  public static estimateTaskDuration(
    taskType: string,
    parameters: any
  ): number {
    const baseTimeouts: Record<string, number> = {
      data_ingestion: 300000, // 5 minutes
      threat_analysis: 600000, // 10 minutes
      ioc_processing: 180000, // 3 minutes
      evidence_collection: 900000, // 15 minutes
      report_generation: 600000, // 10 minutes
      alerting: 30000, // 30 seconds
      data_enrichment: 120000, // 2 minutes
      correlation_analysis: 1200000, // 20 minutes
    };

    const baseTimeout = baseTimeouts[taskType] || 300000;

    // Adjust based on data volume
    if (parameters.recordCount) {
      return baseTimeout + parameters.recordCount * 100; // +100ms per record
    }

    if (parameters.dataSize) {
      return baseTimeout + parameters.dataSize * 10; // +10ms per byte
    }

    return baseTimeout;
  }
}
