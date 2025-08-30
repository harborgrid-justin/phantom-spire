/**
 * Fortune 100-Grade Data Ingestion Engine - Usage Examples and Demo
 * Demonstrates enterprise-level threat intelligence data ingestion capabilities
 */

import { logger } from '../utils/logger';
import { MessageQueueManager } from '../message-queue/core/MessageQueueManager';
import {
  DataIngestionEngine,
  IngestionPipelineManager,
  StreamProcessor,
  STIXConnector,
  MISPConnector,
  IngestionFactory,
  IngestionConfigBuilder,
  DEFAULT_INGESTION_CONFIG,
  DEFAULT_STIX_CONFIG,
  DEFAULT_MISP_CONFIG,
} from '../data-layer/ingestion';

/**
 * Enterprise Threat Intelligence Ingestion Demo
 */
export class EnterpriseIngestionDemo {
  private messageQueueManager: MessageQueueManager;
  private ingestionEngine?: DataIngestionEngine;
  private streamProcessor?: StreamProcessor;
  private pipelineManager?: IngestionPipelineManager;

  constructor() {
    // Initialize message queue manager for enterprise deployment
    this.messageQueueManager = new MessageQueueManager({
      provider: 'redis',
      connectionOptions: {
        host: 'localhost',
        port: 6379,
      },
      enableClustering: true,
      enablePersistence: true,
    });
  }

  /**
   * Demonstrate high-volume threat intelligence ingestion
   */
  public async demonstrateHighVolumeIngestion(): Promise<void> {
    logger.info(
      '=== Fortune 100 High-Volume Threat Intelligence Ingestion Demo ==='
    );

    try {
      // Create high-performance ingestion engine
      const config = IngestionConfigBuilder.createHighVolumeConfig();
      this.ingestionEngine = new DataIngestionEngine(
        config,
        this.messageQueueManager
      );

      // Start the ingestion engine
      await this.ingestionEngine.start();

      // Register STIX threat intelligence source
      const stixConnector = IngestionFactory.createSTIXConnector(
        'primary-stix-feed',
        'https://threat-intel.example.com/stix/v2.1',
        'your-api-token-here'
      );

      await this.ingestionEngine.registerSource({
        id: 'stix-primary-001',
        name: 'Primary STIX 2.1 Threat Feed',
        type: 'stix',
        connector: stixConnector,
        isActive: true,
        priority: 'critical',
        config: {
          extractRelationships: true,
          supportedTypes: [
            'indicator',
            'malware',
            'threat-actor',
            'attack-pattern',
            'campaign',
          ],
        },
      });

      // Register MISP threat intelligence source
      const mispConnector = IngestionFactory.createMISPConnector(
        'misp-feed',
        'https://misp.example.com',
        'your-misp-auth-key'
      );

      await this.ingestionEngine.registerSource({
        id: 'misp-primary-001',
        name: 'Primary MISP Instance',
        type: 'misp',
        connector: mispConnector,
        isActive: true,
        priority: 'high',
        config: {
          extractAttributes: true,
          extractObjects: true,
          extractGalaxy: true,
          threatLevelFilter: [1, 2, 3], // High to Medium threat levels
        },
      });

      // Create and execute ingestion pipeline
      const pipeline = this.createThreatIntelligencePipeline();

      // Submit ingestion jobs
      const stixJobId = await this.ingestionEngine.submitJob(
        'stix-primary-001',
        pipeline,
        9
      );
      const mispJobId = await this.ingestionEngine.submitJob(
        'misp-primary-001',
        pipeline,
        8
      );

      logger.info('Ingestion jobs submitted', { stixJobId, mispJobId });

      // Monitor ingestion progress
      await this.monitorIngestionProgress();

      // Display final metrics
      const metrics = this.ingestionEngine.getMetrics();
      logger.info('High-volume ingestion completed', {
        totalRecordsProcessed: metrics.totalRecordsProcessed,
        averageLatency: metrics.averageLatency,
        recordsPerSecond: metrics.recordsPerSecond,
        errorRate: metrics.errorRate,
      });
    } catch (error) {
      logger.error('High-volume ingestion demo failed', error);
      throw error;
    }
  }

  /**
   * Demonstrate real-time threat intelligence stream processing
   */
  public async demonstrateRealTimeProcessing(): Promise<void> {
    logger.info('=== Real-Time Threat Intelligence Stream Processing Demo ===');

    try {
      // Create real-time configuration
      const config = IngestionConfigBuilder.createRealTimeConfig();
      this.streamProcessor = new StreamProcessor(config);

      // Start stream processor
      await this.streamProcessor.start();

      // Register real-time threat feed stream
      await this.streamProcessor.registerSource({
        id: 'realtime-threat-stream',
        name: 'Real-Time Threat Intelligence Stream',
        type: 'websocket',
        config: {
          endpoint: 'wss://feeds.threatintel.com/realtime',
          authentication: {
            type: 'bearer',
            token: 'your-stream-token',
          },
        },
        isActive: true,
        priority: 10,
      });

      // Register database sink for processed data
      await this.streamProcessor.registerSink({
        id: 'threat-database',
        name: 'Threat Intelligence Database',
        type: 'database',
        config: {
          type: 'mongodb',
          connectionString: 'mongodb://localhost:27017/threat_intel',
          collection: 'indicators',
        },
        isActive: true,
      });

      // Process stream from source to sink
      await this.streamProcessor.processStream(
        'realtime-threat-stream',
        'threat-database'
      );

      // Display stream metrics
      const streamMetrics = this.streamProcessor.getMetrics();
      logger.info('Real-time processing metrics', {
        streamsActive: streamMetrics.streamsActive,
        recordsPerSecond: streamMetrics.recordsPerSecond,
        backpressureEvents: streamMetrics.backpressureEvents,
        duplicatesFiltered: streamMetrics.duplicatesFiltered,
      });
    } catch (error) {
      logger.error('Real-time processing demo failed', error);
      throw error;
    }
  }

  /**
   * Demonstrate enterprise security features
   */
  public async demonstrateSecurityFeatures(): Promise<void> {
    logger.info('=== Enterprise Security Features Demo ===');

    try {
      // Create secure configuration
      const config = IngestionConfigBuilder.createSecureConfig();
      const secureEngine = new DataIngestionEngine(
        config,
        this.messageQueueManager
      );

      // Set up comprehensive audit logging
      secureEngine.on('jobSubmitted', job => {
        logger.info('AUDIT: Ingestion job submitted', {
          jobId: job.id,
          sourceId: job.sourceId,
          timestamp: new Date().toISOString(),
          user: 'system', // Would come from authentication context
        });
      });

      secureEngine.on('jobCompleted', job => {
        logger.info('AUDIT: Ingestion job completed', {
          jobId: job.id,
          sourceId: job.sourceId,
          recordsProcessed: job.metrics?.recordsProcessed,
          timestamp: new Date().toISOString(),
        });
      });

      // Set up security alerts
      secureEngine.on('alert', alert => {
        logger.warn('SECURITY ALERT', {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          timestamp: new Date().toISOString(),
        });
      });

      await secureEngine.start();

      logger.info('Security features configured', {
        encryptionEnabled: config.enableEncryption,
        auditLevel: config.auditLevel,
        dataValidationEnabled: config.enableDataValidation,
      });
    } catch (error) {
      logger.error('Security features demo failed', error);
      throw error;
    }
  }

  /**
   * Create a comprehensive threat intelligence processing pipeline
   */
  private createThreatIntelligencePipeline(): any {
    if (!this.pipelineManager) {
      this.pipelineManager = new IngestionPipelineManager({
        maxConcurrentStages: 10,
        stageTimeoutMs: 120000,
        enableCheckpointing: true,
        checkpointIntervalMs: 30000,
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
      });
    }

    return this.pipelineManager.createPipeline('threat-intelligence-etl', [
      {
        name: 'extract-indicators',
        type: 'extract',
        config: {
          extractionRules: [
            { field: 'indicators', type: 'array' },
            { field: 'relationships', type: 'array' },
            { field: 'metadata', type: 'object' },
          ],
        },
        parallel: false,
        retryable: true,
      },
      {
        name: 'validate-schema',
        type: 'validate',
        config: {
          requiredFields: ['type', 'value', 'source'],
          schemaValidation: true,
          qualityChecks: [
            'duplicate_detection',
            'confidence_validation',
            'freshness_check',
          ],
        },
        dependencies: ['extract-indicators'],
        parallel: false,
        retryable: true,
      },
      {
        name: 'normalize-format',
        type: 'transform',
        config: {
          rules: [
            {
              name: 'standardize-types',
              type: 'map',
              source: 'type',
              target: 'indicator_type',
              expression: 'standardizeIndicatorType(value)',
            },
            {
              name: 'extract-confidence',
              type: 'map',
              source: 'labels',
              target: 'confidence',
              expression: 'extractConfidenceFromLabels(value)',
            },
            {
              name: 'add-metadata',
              type: 'enrich',
              parameters: {
                ingestion_timestamp: '{{ now }}',
                processing_pipeline: 'threat-intelligence-etl',
                version: '1.0',
              },
            },
          ],
        },
        dependencies: ['validate-schema'],
        parallel: true,
        retryable: true,
      },
      {
        name: 'enrich-context',
        type: 'enrich',
        config: {
          enrichmentSources: [
            'reputation-databases',
            'geolocation-services',
            'malware-analysis',
          ],
          batchSize: 100,
          timeoutMs: 30000,
        },
        dependencies: ['normalize-format'],
        parallel: true,
        retryable: true,
      },
      {
        name: 'load-database',
        type: 'load',
        config: {
          destination: 'threat-intelligence-db',
          batchSize: 500,
          upsertMode: true,
          indexFields: ['type', 'value', 'source'],
        },
        dependencies: ['enrich-context'],
        parallel: false,
        retryable: true,
      },
    ]);
  }

  /**
   * Monitor ingestion progress and display real-time metrics
   */
  private async monitorIngestionProgress(): Promise<void> {
    const monitoringInterval = 5000; // 5 seconds
    let monitoringRounds = 0;
    const maxRounds = 12; // Monitor for 1 minute

    const monitor = setInterval(() => {
      if (!this.ingestionEngine || monitoringRounds >= maxRounds) {
        clearInterval(monitor);
        return;
      }

      const metrics = this.ingestionEngine.getMetrics();
      const activeJobs = this.ingestionEngine.listActiveJobs();

      logger.info('Ingestion Progress Update', {
        round: monitoringRounds + 1,
        activeJobs: activeJobs.length,
        recordsProcessed: metrics.totalRecordsProcessed,
        recordsPerSecond: metrics.recordsPerSecond,
        errorRate: metrics.errorRate,
        memoryUsage: `${metrics.memoryUsageMB.toFixed(1)}MB`,
        activePipelines: metrics.activePipelines,
      });

      monitoringRounds++;
    }, monitoringInterval);

    // Wait for monitoring to complete
    await new Promise(resolve =>
      setTimeout(resolve, monitoringInterval * maxRounds)
    );
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    logger.info('Cleaning up ingestion demo resources');

    try {
      if (this.ingestionEngine) {
        await this.ingestionEngine.stop();
      }

      if (this.streamProcessor) {
        await this.streamProcessor.stop();
      }

      // Note: MessageQueueManager cleanup would be handled by the application
      logger.info('Ingestion demo cleanup completed');
    } catch (error) {
      logger.error('Error during ingestion demo cleanup', error);
    }
  }
}

/**
 * Run the complete Fortune 100 ingestion demonstration
 */
export async function runEnterpriseIngestionDemo(): Promise<void> {
  logger.info(
    '🚀 Starting Fortune 100-Grade Data Ingestion Engine Demonstration'
  );

  const demo = new EnterpriseIngestionDemo();

  try {
    // Demonstrate high-volume batch ingestion
    await demo.demonstrateHighVolumeIngestion();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demonstrate real-time stream processing
    await demo.demonstrateRealTimeProcessing();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demonstrate enterprise security features
    await demo.demonstrateSecurityFeatures();

    logger.info(
      '✅ Fortune 100 ingestion demonstration completed successfully'
    );
  } catch (error) {
    logger.error('❌ Fortune 100 ingestion demonstration failed', error);
    throw error;
  } finally {
    await demo.cleanup();
  }
}

/**
 * Configuration examples for different deployment scenarios
 */
export const DEPLOYMENT_EXAMPLES = {
  // Fortune 500 Financial Institution
  financialInstitution: {
    ingestion: {
      enabled: true,
      engineConfig: {
        ...IngestionConfigBuilder.createSecureConfig(),
        maxConcurrentPipelines: 25,
        defaultBatchSize: 2000,
        memoryLimitMB: 4096,
        alertThresholds: {
          errorRate: 1, // Very low tolerance
          processingLatency: 30000,
          memoryUsage: 75,
          queueDepth: 5000,
        },
      },
      enableSTIX: true,
      enableMISP: true,
      enableRealTimeProcessing: true,
    },
  },

  // Large Technology Company
  technologyCompany: {
    ingestion: {
      enabled: true,
      engineConfig: IngestionConfigBuilder.createHighVolumeConfig(),
      enableSTIX: true,
      enableMISP: true,
      enableRealTimeProcessing: true,
      streamConfig: {
        maxConcurrentStreams: 200,
        bufferSize: 50000,
        batchSize: 1000,
        enableDeduplication: true,
      },
    },
  },

  // Government Agency
  governmentAgency: {
    ingestion: {
      enabled: true,
      engineConfig: {
        ...IngestionConfigBuilder.createSecureConfig(),
        auditLevel: 'comprehensive',
        enableEncryption: true,
        maxConcurrentPipelines: 15,
        validationRules: [
          {
            name: 'Classification Validation',
            type: 'business',
            rules: [
              {
                field: 'classification',
                operator: 'required',
                message: 'Classification level is mandatory',
              },
              {
                field: 'source_reliability',
                operator: 'required',
                message: 'Source reliability assessment required',
              },
            ],
            failureAction: 'quarantine',
          },
        ],
      },
      enableSTIX: true,
      enableMISP: false, // Restricted environment
      enableRealTimeProcessing: false, // Batch processing preferred
    },
  },
};

// Export the demo runner for use in examples
if (require.main === module) {
  runEnterpriseIngestionDemo()
    .then(() => {
      logger.info('Demo completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Demo failed', error);
      process.exit(1);
    });
}
