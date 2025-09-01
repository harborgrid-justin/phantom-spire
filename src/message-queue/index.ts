/**
 * Message Queue Module - Main Export File
 * Enterprise-grade message queue system for cyber threat intelligence
 */

// Core interfaces
export * from './interfaces/IMessageQueue';
export * from './interfaces/IMessageTypes';

// Core implementations
export { MessageQueueManager } from './core/MessageQueueManager';
export { RedisMessageQueue } from './core/RedisMessageQueue';

// Import for internal use
import { MessageQueueManager } from './core/MessageQueueManager';

// Producers
export {
  BaseMessageProducer,
  IOCMessageProducer,
  ThreatAnalysisMessageProducer,
  DataIngestionMessageProducer,
  AlertMessageProducer,
  AnalyticsPipelineMessageProducer,
} from './producers/MessageProducers';

// Consumers
export {
  BaseMessageConsumer,
  IOCEnrichmentRequestConsumer,
  IOCValidationRequestConsumer,
  ThreatAnalysisRequestConsumer,
  DataIngestionRequestConsumer,
  ThreatAlertNotificationConsumer,
} from './consumers/MessageConsumers';

// Utilities
export {
  MessageEncryptionUtil,
  MessageTracingUtil,
  MessageDeduplicationUtil,
  MessageQueueMonitor,
  CircuitBreaker,
  messageEncryption,
  messageTracing,
  messageDeduplication,
  messageQueueMonitor,
} from './utils/MessageQueueUtils';

// Configuration factory
import { config } from '../config/config';
import { IMessageQueueManagerConfig } from './core/MessageQueueManager';
import {
  IQueueConfig,
  MessagePriority,
  QueueType,
} from './interfaces/IMessageQueue';

/**
 * Create default message queue manager configuration
 */
export function createDefaultMessageQueueConfig(): IMessageQueueManagerConfig {
  const defaultQueueConfig: IQueueConfig = {
    maxQueueSize: 10000,
    messageTtl: 86400000, // 24 hours
    enableDeadLetter: true,
    deadLetterTtl: 604800000, // 7 days
    enableEncryption: false, // Enable in production
    enableTracing: true,
    enableDeduplication: true,
    deduplicationWindow: 60000, // 1 minute
    persistence: {
      enabled: true,
      backend: 'redis',
      durability: 'both',
    },
    retry: {
      maxRetries: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 60000,
      multiplier: 2,
    },
  };

  const messageQueueManagerConfig: IMessageQueueManagerConfig = {
    redis: {
      url: config.REDIS_URL,
      keyPrefix: 'phantom-spire:mq',
      maxConnections: 10,
      commandTimeout: 5000,
    },
    defaultQueueConfig,
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000,
      halfOpenMaxCalls: 3,
    },
    monitoring: {
      metricsInterval: 30000, // 30 seconds
      healthCheckInterval: 60000, // 1 minute
      enableTracing: true,
    },
    security: {
      enableEncryption: config.NODE_ENV === 'production',
      encryptionKey: process.env.MESSAGE_QUEUE_ENCRYPTION_KEY,
      allowedOrigins: ['localhost', '127.0.0.1'],
    },
  };

  return messageQueueManagerConfig;
}

/**
 * Message Queue Service Factory
 * Creates and configures the complete message queue system
 */
export class MessageQueueServiceFactory {
  private static instance?: MessageQueueServiceFactory;
  private messageQueueManager?: MessageQueueManager;

  private constructor() {}

  public static getInstance(): MessageQueueServiceFactory {
    if (!this.instance) {
      this.instance = new MessageQueueServiceFactory();
    }
    return this.instance;
  }

  /**
   * Initialize the message queue system
   */
  public async initialize(
    customConfig?: Partial<IMessageQueueManagerConfig>
  ): Promise<MessageQueueManager> {
    if (this.messageQueueManager) {
      return this.messageQueueManager;
    }

    const config = {
      ...createDefaultMessageQueueConfig(),
      ...customConfig,
    };

    this.messageQueueManager = new MessageQueueManager(config);
    await this.messageQueueManager.initialize();

    return this.messageQueueManager;
  }

  /**
   * Get the message queue manager instance
   */
  public getMessageQueueManager(): MessageQueueManager {
    if (!this.messageQueueManager) {
      throw new Error(
        'Message queue system not initialized. Call initialize() first.'
      );
    }
    return this.messageQueueManager;
  }

  /**
   * Shutdown the message queue system
   */
  public async shutdown(): Promise<void> {
    if (this.messageQueueManager) {
      await this.messageQueueManager.shutdown();
      this.messageQueueManager = undefined;
    }
  }
}

// Constants for easy import
export const MESSAGE_QUEUE_TOPICS = {
  IOC_PROCESSING: 'ioc.processing',
  THREAT_ANALYSIS: 'threat.analysis',
  DATA_INGESTION: 'data.ingestion',
  REAL_TIME_ALERTS: 'alerts.realtime',
  ANALYTICS_PIPELINE: 'analytics.pipeline',
  SYSTEM_EVENTS: 'system.events',
  DEAD_LETTER: 'dead.letter',
} as const;

export const MESSAGE_TYPES = {
  // IOC Messages
  IOC_ENRICHMENT_REQUEST: 'ioc.enrichment.request',
  IOC_ENRICHMENT_RESULT: 'ioc.enrichment.result',
  IOC_VALIDATION_REQUEST: 'ioc.validation.request',
  IOC_VALIDATION_RESULT: 'ioc.validation.result',

  // Threat Analysis Messages
  THREAT_ANALYSIS_REQUEST: 'threat.analysis.request',
  THREAT_ANALYSIS_RESULT: 'threat.analysis.result',
  CAMPAIGN_DISCOVERY: 'threat.campaign.discovery',
  ATTRIBUTION_ANALYSIS: 'threat.attribution.analysis',

  // Data Integration Messages
  DATA_INGESTION_REQUEST: 'data.ingestion.request',
  DATA_INGESTION_RESULT: 'data.ingestion.result',
  DATA_VALIDATION_REQUEST: 'data.validation.request',
  DATA_VALIDATION_RESULT: 'data.validation.result',

  // Alert Messages
  THREAT_ALERT_NOTIFICATION: 'alert.threat.notification',
  ALERT_ESCALATION: 'alert.escalation',
  ALERT_ACKNOWLEDGMENT: 'alert.acknowledgment',

  // Analytics Pipeline Messages
  ANALYTICS_PIPELINE_REQUEST: 'analytics.pipeline.request',
  ANALYTICS_PIPELINE_RESULT: 'analytics.pipeline.result',
  ANALYTICS_STEP_COMPLETE: 'analytics.step.complete',

  // System Messages
  SYSTEM_HEALTH_CHECK: 'system.health.check',
  SYSTEM_METRICS_UPDATE: 'system.metrics.update',
  SYSTEM_CONFIGURATION_CHANGE: 'system.config.change',
} as const;

export const MESSAGE_PRIORITIES = {
  CRITICAL: MessagePriority.CRITICAL,
  HIGH: MessagePriority.HIGH,
  MEDIUM: MessagePriority.MEDIUM,
  LOW: MessagePriority.LOW,
  BACKGROUND: MessagePriority.BACKGROUND,
} as const;

export const QUEUE_TYPES = {
  PRIORITY: QueueType.PRIORITY,
  FIFO: QueueType.FIFO,
  PUB_SUB: QueueType.PUB_SUB,
  DELAYED: QueueType.DELAYED,
  BROADCAST: QueueType.BROADCAST,
} as const;
