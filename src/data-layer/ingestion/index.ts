/**
 * Data Layer Ingestion Module - Index
 * Exports all Fortune 100-grade data ingestion components
 */

// Core Components
export { DataIngestionEngine } from './DataIngestionEngine.js';
export { IngestionPipelineManager } from './IngestionPipelineManager.js';
export { StreamProcessor } from './StreamProcessor.js';

// Specialized Connectors
import { STIXConnector } from './connectors/STIXConnector.js';
import { MISPConnector } from './connectors/MISPConnector.js';
import { DataIngestionEngine } from './DataIngestionEngine.js';

export { STIXConnector } from './connectors/STIXConnector.js';
export { MISPConnector } from './connectors/MISPConnector.js';

// Type Definitions
export type {
  IIngestionConfig,
  IValidationRuleSet,
  IValidationRule,
  IAlertThresholds,
  IIngestionMetrics,
  IIngestionSource,
  ICronSchedule,
  IIngestionJob,
} from './DataIngestionEngine.js';

export type {
  IPipelineConfig,
  IPipelineContext,
  IPipelineCheckpoint,
  IStageExecutionContext,
} from './IngestionPipelineManager.js';

export type {
  IStreamConfig,
  IStreamMetrics,
  IStreamSource,
  IStreamSink,
  IBatchContext,
  IStreamRecord,
} from './StreamProcessor.js';

export type {
  ISTIXConnectorConfig,
  ISTIXBundle,
  ISTIXObject,
  ISTIXRelationship,
  ISTIXIndicator,
  ISTIXMalware,
  ISTIXThreatActor,
} from './connectors/STIXConnector.js';

export type {
  IMISPConnectorConfig,
  IMISPEvent,
  IMISPAttribute,
  IMISPObject,
  IMISPGalaxy,
  IMISPOrganization,
} from './connectors/MISPConnector.js';

/**
 * Default configurations for Fortune 100 deployment
 */
export const DEFAULT_INGESTION_CONFIG = {
  // Core Configuration
  maxConcurrentPipelines: 50,
  defaultBatchSize: 1000,
  retryAttempts: 3,
  retryBackoffMs: 5000,

  // Performance Tuning
  memoryLimitMB: 2048,
  processingTimeoutMs: 300000, // 5 minutes
  enableParallelProcessing: true,

  // Quality Assurance
  enableDataValidation: true,
  enableDuplicateDetection: true,
  validationRules: [
    {
      name: 'Required Fields Validation',
      type: 'schema' as const,
      rules: [
        {
          field: 'type',
          operator: 'required' as const,
          message: 'Type field is required',
        },
        {
          field: 'value',
          operator: 'required' as const,
          message: 'Value field is required',
        },
      ],
      failureAction: 'reject' as const,
    },
  ],

  // Monitoring
  enableMetrics: true,
  metricsIntervalMs: 30000,
  alertThresholds: {
    errorRate: 5, // 5%
    processingLatency: 60000, // 1 minute
    memoryUsage: 80, // 80%
    queueDepth: 10000,
  },

  // Security
  enableEncryption: true,
  auditLevel: 'comprehensive' as const,
};

export const DEFAULT_PIPELINE_CONFIG = {
  maxConcurrentStages: 20,
  stageTimeoutMs: 120000, // 2 minutes
  enableCheckpointing: true,
  checkpointIntervalMs: 60000,
  retryPolicy: {
    maxRetries: 3,
    backoffMs: 2000,
    exponentialBackoff: true,
  },
  validation: {
    enableSchemaValidation: true,
    enableDataQualityChecks: true,
    failFast: false,
  },
};

export const DEFAULT_STREAM_CONFIG = {
  // Stream Configuration
  maxConcurrentStreams: 100,
  bufferSize: 10000,
  backpressureThreshold: 8000,
  flushIntervalMs: 5000,

  // Processing Options
  enableBatching: true,
  batchSize: 500,
  batchTimeoutMs: 10000,

  // Error Handling
  maxRetries: 5,
  retryBackoffMs: 1000,
  deadLetterQueueSize: 1000,

  // Performance Tuning
  enableCompression: true,
  enableDeduplication: true,
  deduplicationWindowMs: 300000, // 5 minutes

  // Monitoring
  enableMetrics: true,
  metricsIntervalMs: 15000,
};

export const DEFAULT_STIX_CONFIG = {
  name: 'default-stix',
  version: '2.1',
  validateSchema: true,
  extractRelationships: true,
  supportedTypes: [
    'indicator',
    'malware',
    'threat-actor',
    'attack-pattern',
    'campaign',
    'intrusion-set',
    'tool',
    'vulnerability',
  ],
  batchSize: 1000,
  timeout: 30000,
  retryAttempts: 3,
};

export const DEFAULT_MISP_CONFIG = {
  name: 'default-misp',
  version: '2.4',
  validateStructure: true,
  extractAttributes: true,
  extractObjects: true,
  extractGalaxy: true,
  published: true,
  batchSize: 500,
  timeout: 30000,
  retryAttempts: 3,
  threatLevelFilter: [1, 2, 3], // High to Medium threat levels
  analysisFilter: [1, 2], // Complete and Ongoing analysis
  distributionFilter: [0, 1, 2, 3], // All distribution levels
};

/**
 * Utility functions for ingestion configuration
 */
export class IngestionConfigBuilder {
  /**
   * Create optimized configuration for high-volume ingestion
   */
  public static createHighVolumeConfig() {
    return {
      ...DEFAULT_INGESTION_CONFIG,
      maxConcurrentPipelines: 100,
      defaultBatchSize: 5000,
      memoryLimitMB: 8192,
      enableParallelProcessing: true,
      alertThresholds: {
        errorRate: 2,
        processingLatency: 30000,
        memoryUsage: 85,
        queueDepth: 50000,
      },
    };
  }

  /**
   * Create configuration for real-time processing
   */
  public static createRealTimeConfig() {
    return {
      ...DEFAULT_INGESTION_CONFIG,
      defaultBatchSize: 100,
      processingTimeoutMs: 30000,
      metricsIntervalMs: 10000,
      alertThresholds: {
        errorRate: 1,
        processingLatency: 5000,
        memoryUsage: 70,
        queueDepth: 1000,
      },
    };
  }

  /**
   * Create configuration for enterprise security requirements
   */
  public static createSecureConfig() {
    return {
      ...DEFAULT_INGESTION_CONFIG,
      enableEncryption: true,
      auditLevel: 'comprehensive' as const,
      enableDataValidation: true,
      validationRules: [
        {
          name: 'Security Validation',
          type: 'business' as const,
          rules: [
            {
              field: 'confidence',
              operator: 'range' as const,
              value: [0, 100],
              message: 'Confidence must be between 0 and 100',
            },
            {
              field: 'source',
              operator: 'required' as const,
              message: 'Source attribution is required',
            },
          ],
          failureAction: 'quarantine' as const,
        },
      ],
    };
  }

  /**
   * Create configuration for batch processing
   */
  public static createBatchConfig() {
    return {
      ...DEFAULT_INGESTION_CONFIG,
      maxConcurrentPipelines: 20,
      defaultBatchSize: 10000,
      processingTimeoutMs: 600000, // 10 minutes
      enableParallelProcessing: true,
      metricsIntervalMs: 60000,
    };
  }
}

/**
 * Factory functions for creating pre-configured components
 */
export class IngestionFactory {
  /**
   * Create a STIX connector with default configuration
   */
  public static createSTIXConnector(
    name: string,
    endpoint?: string,
    authToken?: string
  ): STIXConnector {
    const config: any = { ...DEFAULT_STIX_CONFIG, name };

    if (endpoint) {
      config.endpoint = endpoint;
    }

    if (authToken) {
      config.authentication = {
        type: 'bearer',
        credentials: { token: authToken },
        token: authToken,
      };
    }

    return new STIXConnector(name, config);
  }

  /**
   * Create a MISP connector with default configuration
   */
  public static createMISPConnector(
    name: string,
    endpoint?: string,
    authKey?: string
  ): MISPConnector {
    const config: any = { ...DEFAULT_MISP_CONFIG, name };

    if (endpoint) {
      config.endpoint = endpoint;
    }

    if (authKey) {
      config.authentication = {
        type: 'authkey',
        credentials: { authkey: authKey },
        authkey: authKey,
      };
    }

    return new MISPConnector(name, config);
  }

  /**
   * Create a high-performance ingestion engine
   */
  public static createHighPerformanceEngine(
    messageQueueManager: any
  ): DataIngestionEngine {
    const config = IngestionConfigBuilder.createHighVolumeConfig();
    return new DataIngestionEngine(config, messageQueueManager);
  }

  /**
   * Create a real-time ingestion engine
   */
  public static createRealTimeEngine(
    messageQueueManager: any
  ): DataIngestionEngine {
    const config = IngestionConfigBuilder.createRealTimeConfig();
    return new DataIngestionEngine(config, messageQueueManager);
  }
}

/**
 * Integration helpers
 */
export class IngestionIntegration {
  /**
   * Integrate ingestion engine with existing data layer orchestrator
   */
  public static integrateWithOrchestrator(
    orchestrator: any,
    ingestionEngine: DataIngestionEngine
  ): void {
    // Set up event handlers for integration
    ingestionEngine.on('jobCompleted', job => {
      orchestrator.emit('dataIngested', {
        jobId: job.id,
        sourceId: job.sourceId,
        recordsProcessed: job.metrics?.recordsProcessed || 0,
      });
    });

    ingestionEngine.on('error', error => {
      orchestrator.emit('ingestionError', error);
    });

    ingestionEngine.on('alert', alert => {
      orchestrator.emit('ingestionAlert', alert);
    });
  }

  /**
   * Set up monitoring and alerting integration
   */
  public static setupMonitoring(
    ingestionEngine: DataIngestionEngine,
    alertCallback: (alert: any) => void
  ): void {
    ingestionEngine.on('alert', alertCallback);

    // Set up periodic health checks
    setInterval(() => {
      const metrics = ingestionEngine.getMetrics();

      if (metrics.errorRate > 10) {
        alertCallback({
          type: 'high_error_rate',
          message: `High error rate detected: ${metrics.errorRate}%`,
          severity: 'critical',
          metrics,
        });
      }
    }, 60000); // Check every minute
  }
}
