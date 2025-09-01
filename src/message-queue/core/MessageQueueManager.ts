/**
 * Message Queue Manager - Fortune 100 Grade Central Orchestrator
 * Enterprise-level message queue management for cyber threat intelligence
 */

import { logger } from '../../utils/logger';
import { 
  IMessageQueue, 
  IMessage, 
  IQueueConfig, 
  QueueType, 
  MessagePriority,
  IMessageHandler,
  ISubscription,
  ISubscriptionOptions,
  IPublishResult,
  IQueueHealth,
  IQueueMetrics,
  ICircuitBreakerConfig,
  ICircuitBreakerState
} from '../interfaces/IMessageQueue';
import { RedisMessageQueue } from './RedisMessageQueue';
import { v4 as uuidv4 } from 'uuid';

export interface IMessageQueueManagerConfig {
  readonly redis: {
    readonly url: string;
    readonly keyPrefix: string;
    readonly maxConnections: number;
    readonly commandTimeout: number;
  };
  readonly defaultQueueConfig: IQueueConfig;
  readonly circuitBreaker: ICircuitBreakerConfig;
  readonly monitoring: {
    readonly metricsInterval: number;
    readonly healthCheckInterval: number;
    readonly enableTracing: boolean;
  };
  readonly security: {
    readonly enableEncryption: boolean;
    readonly encryptionKey?: string;
    readonly allowedOrigins?: string[];
  };
}

export interface IQueueRegistry {
  readonly [queueName: string]: IMessageQueue;
}

export interface ISubscriptionRegistry {
  readonly [subscriptionId: string]: {
    readonly subscription: ISubscription;
    readonly queue: IMessageQueue;
    readonly handler: IMessageHandler;
    readonly options: ISubscriptionOptions;
  };
}

export interface IMessageQueueManagerMetrics {
  readonly totalQueues: number;
  readonly totalSubscriptions: number;
  readonly totalMessagesPublished: number;
  readonly totalMessagesConsumed: number;
  readonly totalErrors: number;
  readonly uptime: number;
  readonly circuitBreakerState: Record<string, ICircuitBreakerState>;
}

/**
 * Central Message Queue Manager for Enterprise Threat Intelligence Platform
 * 
 * Features:
 * - Multi-queue management with different queue types
 * - Circuit breaker pattern for fault tolerance
 * - Message encryption and tracing
 * - Dead letter queue handling
 * - Comprehensive monitoring and metrics
 * - Enterprise-grade security
 */
export class MessageQueueManager {
  private readonly config: IMessageQueueManagerConfig;
  private readonly queues: IQueueRegistry = {};
  private readonly subscriptions: ISubscriptionRegistry = {};
  private readonly circuitBreakers: Map<string, ICircuitBreakerState> = new Map();
  private isInitialized = false;
  private startTime = Date.now();
  private metrics: IMessageQueueManagerMetrics;
  private metricsInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: IMessageQueueManagerConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.setupEventHandlers();
  }

  /**
   * Initialize the Message Queue Manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Message Queue Manager already initialized');
      return;
    }

    try {
      logger.info('Initializing Message Queue Manager');
      
      // Initialize default queues
      await this.createDefaultQueues();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isInitialized = true;
      
      logger.info('Message Queue Manager initialized successfully', {
        queuesCount: Object.keys(this.queues).length,
        monitoring: this.config.monitoring,
      });
    } catch (error) {
      logger.error('Failed to initialize Message Queue Manager', error);
      throw error;
    }
  }

  /**
   * Shutdown the Message Queue Manager gracefully
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      logger.info('Shutting down Message Queue Manager');
      
      // Stop monitoring
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Shutdown all queues
      const shutdownPromises = Object.values(this.queues).map(queue => 
        queue.shutdown()
      );
      await Promise.all(shutdownPromises);
      
      this.isInitialized = false;
      
      logger.info('Message Queue Manager shut down successfully');
    } catch (error) {
      logger.error('Error during Message Queue Manager shutdown', error);
      throw error;
    }
  }

  /**
   * Create a new message queue
   */
  public async createQueue(
    name: string, 
    type: QueueType = QueueType.PRIORITY,
    config?: Partial<IQueueConfig>
  ): Promise<IMessageQueue> {
    if (this.queues[name]) {
      logger.warn(`Queue ${name} already exists`);
      return this.queues[name];
    }

    try {
      const queueConfig: IQueueConfig = {
        ...this.config.defaultQueueConfig,
        ...config,
      };

      const queue = new RedisMessageQueue(name, type, queueConfig, {
        url: this.config.redis.url,
        keyPrefix: this.config.redis.keyPrefix,
        maxConnections: this.config.redis.maxConnections,
        commandTimeout: this.config.redis.commandTimeout,
      });

      await queue.initialize();
      (this.queues as any)[name] = queue;
      
      // Initialize circuit breaker for this queue
      this.circuitBreakers.set(name, {
        state: 'closed',
        failureCount: 0,
      });

      logger.info(`Created queue: ${name}`, {
        type,
        config: queueConfig,
      });

      return queue;
    } catch (error) {
      logger.error(`Failed to create queue: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get an existing queue
   */
  public getQueue(name: string): IMessageQueue | undefined {
    return this.queues[name];
  }

  /**
   * Publish a message to a queue
   */
  public async publish<T>(
    queueName: string,
    message: Omit<IMessage<T>, 'id' | 'timestamp'>
  ): Promise<IPublishResult> {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const circuitBreaker = this.circuitBreakers.get(queueName);
    if (circuitBreaker?.state === 'open') {
      throw new Error(`Circuit breaker open for queue ${queueName}`);
    }

    try {
      const fullMessage: IMessage<T> = {
        ...message,
        id: uuidv4(),
        timestamp: new Date(),
      };

      // Add tracing if enabled
      if (this.config.monitoring.enableTracing && !fullMessage.metadata.tracing) {
        (fullMessage as any).metadata = {
          ...fullMessage.metadata,
          tracing: {
            traceId: uuidv4(),
            spanId: uuidv4(),
          },
        };
      }

      const result = await queue.publish(fullMessage);
      
      (this.metrics as any).totalMessagesPublished++;
      this.resetCircuitBreaker(queueName);
      
      logger.debug(`Message published to queue ${queueName}`, {
        messageId: result.messageId,
        type: message.type,
        topic: message.topic,
      });

      return result;
    } catch (error) {
      this.handleCircuitBreakerFailure(queueName);
      (this.metrics as any).totalErrors++;
      logger.error(`Failed to publish message to queue ${queueName}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to messages from a queue
   */
  public async subscribe<T>(
    queueName: string,
    topic: string,
    handler: IMessageHandler<T>,
    options?: ISubscriptionOptions
  ): Promise<ISubscription> {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    try {
      const subscription = await queue.subscribe(topic, handler, options);
      
      (this.subscriptions as any)[subscription.id] = {
        subscription,
        queue,
        handler: handler as IMessageHandler<Record<string, unknown>>,
        options: options || {},
      };
      
      logger.info(`Created subscription for queue ${queueName}`, {
        subscriptionId: subscription.id,
        topic,
        options,
      });

      return subscription;
    } catch (error) {
      logger.error(`Failed to create subscription for queue ${queueName}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a queue
   */
  public async unsubscribe(subscriptionId: string): Promise<void> {
    const subscriptionInfo = this.subscriptions[subscriptionId];
    if (!subscriptionInfo) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    try {
      await subscriptionInfo.queue.unsubscribe(subscriptionId);
      delete (this.subscriptions as any)[subscriptionId];
      
      logger.info(`Unsubscribed from subscription ${subscriptionId}`);
    } catch (error) {
      logger.error(`Failed to unsubscribe from subscription ${subscriptionId}`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive health status of all queues
   */
  public async getHealthStatus(): Promise<Record<string, IQueueHealth>> {
    const healthStatus: Record<string, IQueueHealth> = {};
    
    for (const [queueName, queue] of Object.entries(this.queues)) {
      try {
        healthStatus[queueName] = await queue.getQueueHealth();
      } catch (error) {
        healthStatus[queueName] = {
          status: 'unhealthy',
          lastCheck: new Date(),
          uptime: 0,
          connectivity: false,
          memoryUsage: 0,
          issues: [`Health check failed: ${error}`],
        };
      }
    }
    
    return healthStatus;
  }

  /**
   * Get comprehensive metrics for all queues
   */
  public async getMetrics(): Promise<Record<string, IQueueMetrics>> {
    const queueMetrics: Record<string, IQueueMetrics> = {};
    
    for (const [queueName, queue] of Object.entries(this.queues)) {
      try {
        queueMetrics[queueName] = await queue.getQueueMetrics();
      } catch (error) {
        logger.error(`Failed to get metrics for queue ${queueName}`, error);
      }
    }
    
    return queueMetrics;
  }

  /**
   * Get manager-level metrics
   */
  public getManagerMetrics(): IMessageQueueManagerMetrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      circuitBreakerState: Object.fromEntries(this.circuitBreakers.entries()),
    };
  }

  /**
   * Create default queues for the threat intelligence platform
   */
  private async createDefaultQueues(): Promise<void> {
    const defaultQueues = [
      { name: 'ioc-processing', type: QueueType.PRIORITY },
      { name: 'threat-analysis', type: QueueType.PRIORITY },
      { name: 'data-ingestion', type: QueueType.FIFO },
      { name: 'real-time-alerts', type: QueueType.BROADCAST },
      { name: 'analytics-pipeline', type: QueueType.DELAYED },
      { name: 'system-events', type: QueueType.PUB_SUB },
      { name: 'dead-letter', type: QueueType.FIFO },
    ];

    for (const queueDef of defaultQueues) {
      await this.createQueue(queueDef.name, queueDef.type);
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): IMessageQueueManagerMetrics {
    return {
      totalQueues: 0,
      totalSubscriptions: 0,
      totalMessagesPublished: 0,
      totalMessagesConsumed: 0,
      totalErrors: 0,
      uptime: 0,
      circuitBreakerState: {},
    };
  }

  /**
   * Start monitoring intervals
   */
  private startMonitoring(): void {
    // Metrics collection
    if (this.config.monitoring.metricsInterval > 0) {
      this.metricsInterval = setInterval(
        () => this.updateMetrics(),
        this.config.monitoring.metricsInterval
      );
    }

    // Health checks
    if (this.config.monitoring.healthCheckInterval > 0) {
      this.healthCheckInterval = setInterval(
        () => this.performHealthChecks(),
        this.config.monitoring.healthCheckInterval
      );
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    (this.metrics as any).totalQueues = Object.keys(this.queues).length;
    (this.metrics as any).totalSubscriptions = Object.keys(this.subscriptions).length;
    (this.metrics as any).uptime = Date.now() - this.startTime;
  }

  /**
   * Perform health checks on all queues
   */
  private async performHealthChecks(): Promise<void> {
    for (const [queueName, queue] of Object.entries(this.queues)) {
      try {
        const health = await queue.getQueueHealth();
        if (health.status === 'unhealthy') {
          logger.warn(`Queue ${queueName} is unhealthy`, health.issues);
        }
      } catch (error) {
        logger.error(`Health check failed for queue ${queueName}`, error);
      }
    }
  }

  /**
   * Handle circuit breaker failure
   */
  private handleCircuitBreakerFailure(queueName: string): void {
    const circuitBreaker = this.circuitBreakers.get(queueName);
    if (!circuitBreaker) return;

    const updatedState: ICircuitBreakerState = {
      ...circuitBreaker,
      failureCount: circuitBreaker.failureCount + 1,
      lastFailureTime: new Date(),
    };

    if (updatedState.failureCount >= this.config.circuitBreaker.failureThreshold) {
      (updatedState as any).state = 'open';
      (updatedState as any).nextAttempt = new Date(
        Date.now() + this.config.circuitBreaker.recoveryTimeout
      );
      
      logger.warn(`Circuit breaker opened for queue ${queueName}`, {
        failureCount: updatedState.failureCount,
        nextAttempt: updatedState.nextAttempt,
      });
    }

    this.circuitBreakers.set(queueName, updatedState);
  }

  /**
   * Reset circuit breaker on success
   */
  private resetCircuitBreaker(queueName: string): void {
    const circuitBreaker = this.circuitBreakers.get(queueName);
    if (!circuitBreaker) return;

    if (circuitBreaker.failureCount > 0) {
      this.circuitBreakers.set(queueName, {
        state: 'closed',
        failureCount: 0,
      });
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
}