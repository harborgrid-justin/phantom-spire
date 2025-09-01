/**
 * Revolutionary Message Queue Implementation
 * Zero-configuration event processing with automatic setup
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  IMessageQueue,
  IMessage,
  IMessageHandler,
  IQueueConfig,
  ISubscription,
  ISubscriptionOptions,
  IMessageQueueMetrics,
  IMessageQueueEvents,
  IQueueHealth,
  MessagePriority,
  QueueType
} from '../interfaces/IMessageQueue';

export class MessageQueue extends EventEmitter implements IMessageQueue {
  private queues: Map<string, IMessage[]> = new Map();
  private subscriptions: Map<string, ISubscription> = new Map();
  private topicSubscriptions: Map<string, Set<string>> = new Map();
  private metrics: Map<string, IMessageQueueMetrics> = new Map();
  private processingInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private isStarted = false;
  
  private readonly config: Required<IQueueConfig>;
  private readonly startTime = Date.now();
  private linkedModules: Map<string, any> = new Map();
  
  constructor(config: Partial<IQueueConfig> = {}) {
    super();
    
    // Revolutionary auto-configuration
    this.config = {
      name: config.name || this.autoDetectQueueName(),
      type: config.type || this.autoDetectQueueType(),
      autoCreate: config.autoCreate ?? true,
      autoLink: config.autoLink ?? true,
      autoDiscovery: config.autoDiscovery ?? true,
      maxSize: config.maxSize || this.getIntelligentMaxSize(),
      retentionTime: config.retentionTime || 3600000, // 1 hour
      deadLetterQueue: config.deadLetterQueue || 'dlq',
      persistent: config.persistent ?? false,
      concurrency: config.concurrency || this.getOptimalConcurrency(),
      circuitBreaker: config.circuitBreaker ?? true
    };
    
    this.setupAutoConfiguration();
    this.initializeDefaultQueues();
    
    if (this.config.autoDiscovery) {
      this.startAutoDiscovery();
    }
  }
  
  /** Publish message to topic/queue */
  async publish<T>(
    topic: string, 
    payload: T, 
    options: Partial<IMessage['metadata']> = {}
  ): Promise<string> {
    if (!this.isStarted) {
      await this.start();
    }
    
    const message: IMessage<T> = {
      id: uuidv4(),
      topic,
      payload,
      metadata: {
        timestamp: Date.now(),
        source: this.config.name,
        priority: options.priority || MessagePriority.NORMAL,
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        timeout: options.timeout || 30000,
        correlationId: options.correlationId,
        replyTo: options.replyTo,
        headers: options.headers || {},
        ...options
      }
    };
    
    // Auto-create queue if needed
    if (this.config.autoCreate && !this.queues.has(topic)) {
      await this.createQueue(topic);
    }
    
    // Add to appropriate queue based on type
    this.addMessageToQueue(topic, message);
    
    // Update metrics
    this.updateMetrics(topic, 'published');
    
    this.emit('message-published', message);
    console.debug(`📨 Message published to ${topic}:`, message.id);
    
    return message.id;
  }
  
  /** Subscribe to topic/queue */
  async subscribe<T>(
    topic: string, 
    handler: IMessageHandler<T>, 
    options: ISubscriptionOptions = {}
  ): Promise<string> {
    if (!this.isStarted) {
      await this.start();
    }
    
    const subscription: ISubscription = {
      id: uuidv4(),
      topic,
      handler,
      options: {
        autoAck: options.autoAck ?? true,
        autoRetry: options.autoRetry ?? true,
        maxRetries: options.maxRetries || 3,
        consumerGroup: options.consumerGroup || 'default',
        filter: options.filter,
        batchSize: options.batchSize || 1,
        ...options
      }
    };
    
    this.subscriptions.set(subscription.id, subscription);
    
    if (!this.topicSubscriptions.has(topic)) {
      this.topicSubscriptions.set(topic, new Set());
    }
    this.topicSubscriptions.get(topic)!.add(subscription.id);
    
    // Auto-create queue if needed
    if (this.config.autoCreate && !this.queues.has(topic)) {
      await this.createQueue(topic);
    }
    
    this.emit('subscriber-added', subscription);
    console.info(`🔔 Subscribed to ${topic}:`, subscription.id);
    
    return subscription.id;
  }
  
  /** Unsubscribe from topic/queue */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;
    
    this.subscriptions.delete(subscriptionId);
    
    const topicSubs = this.topicSubscriptions.get(subscription.topic);
    if (topicSubs) {
      topicSubs.delete(subscriptionId);
      if (topicSubs.size === 0) {
        this.topicSubscriptions.delete(subscription.topic);
      }
    }
    
    this.emit('subscriber-removed', subscriptionId);
    console.info(`🔕 Unsubscribed:`, subscriptionId);
  }
  
  /** Create queue with configuration */
  async createQueue(name: string, config: IQueueConfig = {}): Promise<void> {
    if (!this.queues.has(name)) {
      this.queues.set(name, []);
      this.initializeMetrics(name);
      
      this.emit('queue-created', name, config);
      console.info(`📦 Queue created: ${name}`);
    }
  }
  
  /** Delete queue */
  async deleteQueue(name: string): Promise<void> {
    this.queues.delete(name);
    this.metrics.delete(name);
    
    // Remove subscriptions for this queue
    const subscriptionsToRemove = Array.from(this.subscriptions.entries())
      .filter(([_, sub]) => sub.topic === name)
      .map(([id]) => id);
    
    for (const id of subscriptionsToRemove) {
      await this.unsubscribe(id);
    }
    
    console.info(`🗑️  Queue deleted: ${name}`);
  }
  
  /** Get queue metrics */
  async getMetrics(queueName?: string): Promise<IMessageQueueMetrics> {
    if (queueName) {
      return this.metrics.get(queueName) || this.createDefaultMetrics();
    }
    
    // Return aggregated metrics for all queues
    const allMetrics = Array.from(this.metrics.values());
    return {
      totalMessages: allMetrics.reduce((sum, m) => sum + m.totalMessages, 0),
      processedMessages: allMetrics.reduce((sum, m) => sum + m.processedMessages, 0),
      failedMessages: allMetrics.reduce((sum, m) => sum + m.failedMessages, 0),
      pendingMessages: allMetrics.reduce((sum, m) => sum + m.pendingMessages, 0),
      subscriberCount: this.subscriptions.size,
      averageProcessingTime: allMetrics.length > 0 
        ? allMetrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / allMetrics.length 
        : 0,
      throughputPerSecond: allMetrics.reduce((sum, m) => sum + m.throughputPerSecond, 0),
      errorRate: allMetrics.length > 0
        ? allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length
        : 0,
      queueSize: allMetrics.reduce((sum, m) => sum + m.queueSize, 0)
    };
  }
  
  /** Get health status */
  async getHealth(): Promise<IQueueHealth> {
    const metrics = await this.getMetrics();
    const issues: string[] = [];
    let score = 100;
    
    // Health checks
    if (metrics.errorRate > 10) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`);
      score -= 30;
    }
    
    if (metrics.pendingMessages > this.config.maxSize * 0.8) {
      issues.push(`Queue near capacity: ${metrics.pendingMessages}/${this.config.maxSize}`);
      score -= 20;
    }
    
    if (metrics.averageProcessingTime > 10000) {
      issues.push(`High processing time: ${metrics.averageProcessingTime}ms`);
      score -= 15;
    }
    
    if (!this.isStarted) {
      issues.push('Message queue not started');
      score -= 50;
    }
    
    return {
      healthy: score > 70,
      score: Math.max(0, score),
      issues,
      metrics,
      uptime: Date.now() - this.startTime
    };
  }
  
  /** Start message queue */
  async start(): Promise<void> {
    if (this.isStarted) return;
    
    this.isStarted = true;
    this.startMessageProcessing();
    this.startHealthChecks();
    
    // Auto-link with circuit breaker if available
    if (this.config.circuitBreaker) {
      await this.setupCircuitBreaker();
    }
    
    console.info(`🚀 Message Queue started: ${this.config.name}`);
  }
  
  /** Stop message queue */
  async stop(): Promise<void> {
    this.isStarted = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    console.info(`🛑 Message Queue stopped: ${this.config.name}`);
  }
  
  /** Purge queue */
  async purge(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.length = 0;
      this.resetMetrics(queueName);
      console.info(`🧹 Queue purged: ${queueName}`);
    }
  }
  
  /** Auto-link with other modules */
  linkWith(moduleType: string, instance: any): void {
    this.linkedModules.set(moduleType, instance);
    
    // Auto-setup integrations based on module type
    if (moduleType === 'circuit-breaker') {
      this.setupCircuitBreakerIntegration(instance);
    } else if (moduleType === 'service-registry') {
      this.setupServiceRegistryIntegration(instance);
    } else if (moduleType === 'event-triggers') {
      this.setupEventTriggersIntegration(instance);
    }
    
    console.info(`🔗 Linked with ${moduleType} module`);
  }
  
  // Private methods
  
  private addMessageToQueue(topic: string, message: IMessage): void {
    let queue = this.queues.get(topic);
    if (!queue) {
      queue = [];
      this.queues.set(topic, queue);
    }
    
    // Add message based on queue type
    switch (this.config.type) {
      case QueueType.PRIORITY:
        this.insertByPriority(queue, message);
        break;
      case QueueType.FIFO:
      default:
        queue.push(message);
        break;
    }
    
    // Check queue size limits
    if (queue.length > this.config.maxSize) {
      this.emit('queue-full', topic, queue.length);
      
      // Move oldest message to dead letter queue
      const oldMessage = queue.shift();
      if (oldMessage) {
        this.moveToDeadLetterQueue(oldMessage);
      }
    }
  }
  
  private insertByPriority(queue: IMessage[], message: IMessage): void {
    let inserted = false;
    for (let i = 0; i < queue.length; i++) {
      if (message.metadata.priority > queue[i].metadata.priority) {
        queue.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      queue.push(message);
    }
  }
  
  private startMessageProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processMessages();
    }, 100); // Process every 100ms
  }
  
  private async processMessages(): Promise<void> {
    for (const [topic, queue] of this.queues) {
      const subscribers = this.topicSubscriptions.get(topic);
      if (!subscribers || subscribers.size === 0 || queue.length === 0) {
        continue;
      }
      
      // Process messages with configured concurrency
      const messagesToProcess = queue.splice(0, Math.min(this.config.concurrency, queue.length));
      
      for (const message of messagesToProcess) {
        this.processMessage(message, subscribers);
      }
    }
  }
  
  private async processMessage(message: IMessage, subscriberIds: Set<string>): Promise<void> {
    const startTime = Date.now();
    
    for (const subscriberId of subscriberIds) {
      const subscription = this.subscriptions.get(subscriberId);
      if (!subscription) continue;
      
      // Apply message filter if configured
      if (subscription.options.filter && !subscription.options.filter(message)) {
        continue;
      }
      
      try {
        await subscription.handler(message);
        
        const processingTime = Date.now() - startTime;
        this.updateMetrics(message.topic, 'consumed', processingTime);
        this.emit('message-consumed', message, processingTime);
        
      } catch (error) {
        await this.handleMessageFailure(message, error as Error, subscription);
      }
    }
  }
  
  private async handleMessageFailure(
    message: IMessage, 
    error: Error, 
    subscription: ISubscription
  ): Promise<void> {
    this.updateMetrics(message.topic, 'failed');
    this.emit('message-failed', message, error);
    
    // Auto-retry if configured
    if (subscription.options.autoRetry && 
        message.metadata.retryCount < message.metadata.maxRetries) {
      
      message.metadata.retryCount++;
      this.emit('message-retry', message, message.metadata.retryCount);
      
      // Add back to queue with delay
      setTimeout(() => {
        this.addMessageToQueue(message.topic, message);
      }, Math.pow(2, message.metadata.retryCount) * 1000); // Exponential backoff
      
    } else {
      // Move to dead letter queue
      this.moveToDeadLetterQueue(message, error);
    }
  }
  
  private moveToDeadLetterQueue(message: IMessage, error?: Error): void {
    const dlqMessage = {
      ...message,
      topic: this.config.deadLetterQueue,
      metadata: {
        ...message.metadata,
        originalTopic: message.topic,
        failureReason: error?.message || 'Queue overflow',
        failureTime: Date.now()
      }
    };
    
    this.addMessageToQueue(this.config.deadLetterQueue, dlqMessage);
    console.warn(`💀 Message moved to DLQ:`, message.id);
  }
  
  private updateMetrics(topic: string, operation: 'published' | 'consumed' | 'failed', processingTime?: number): void {
    let metrics = this.metrics.get(topic);
    if (!metrics) {
      metrics = this.createDefaultMetrics();
      this.metrics.set(topic, metrics);
    }
    
    switch (operation) {
      case 'published':
        metrics.totalMessages++;
        break;
      case 'consumed':
        metrics.processedMessages++;
        if (processingTime) {
          metrics.averageProcessingTime = 
            (metrics.averageProcessingTime * (metrics.processedMessages - 1) + processingTime) / 
            metrics.processedMessages;
        }
        break;
      case 'failed':
        metrics.failedMessages++;
        break;
    }
    
    // Update derived metrics
    metrics.pendingMessages = this.queues.get(topic)?.length || 0;
    metrics.queueSize = metrics.pendingMessages;
    metrics.errorRate = metrics.totalMessages > 0 
      ? (metrics.failedMessages / metrics.totalMessages) * 100 
      : 0;
  }
  
  private createDefaultMetrics(): IMessageQueueMetrics {
    return {
      totalMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      pendingMessages: 0,
      subscriberCount: 0,
      averageProcessingTime: 0,
      throughputPerSecond: 0,
      errorRate: 0,
      queueSize: 0
    };
  }
  
  private initializeMetrics(queueName: string): void {
    this.metrics.set(queueName, this.createDefaultMetrics());
  }
  
  private resetMetrics(queueName: string): void {
    this.metrics.set(queueName, this.createDefaultMetrics());
  }
  
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.getHealth();
      this.emit('health-check', health);
      
      if (!health.healthy) {
        console.warn('🏥 Message Queue health issues:', health.issues);
      }
    }, 30000); // Every 30 seconds
  }
  
  private setupAutoConfiguration(): void {
    // Auto-optimize based on usage patterns
    setInterval(() => {
      this.optimizeConfiguration();
    }, 300000); // Every 5 minutes
  }
  
  private optimizeConfiguration(): void {
    // Auto-adjust concurrency based on performance
    const avgProcessingTime = Array.from(this.metrics.values())
      .reduce((sum, m) => sum + m.averageProcessingTime, 0) / this.metrics.size;
    
    if (avgProcessingTime > 5000 && this.config.concurrency > 1) {
      this.config.concurrency = Math.max(1, this.config.concurrency - 1);
      console.debug(`Auto-optimized concurrency to ${this.config.concurrency}`);
    } else if (avgProcessingTime < 1000 && this.config.concurrency < 10) {
      this.config.concurrency++;
      console.debug(`Auto-optimized concurrency to ${this.config.concurrency}`);
    }
  }
  
  private initializeDefaultQueues(): void {
    // Create standard queues
    ['events', 'tasks', 'notifications', this.config.deadLetterQueue].forEach(queue => {
      this.queues.set(queue, []);
      this.initializeMetrics(queue);
    });
  }
  
  private startAutoDiscovery(): void {
    setInterval(() => {
      this.performAutoDiscovery();
    }, 60000); // Every minute
  }
  
  private performAutoDiscovery(): void {
    const discoveredQueues = this.discoverQueuesFromEnvironment();
    if (discoveredQueues.length > 0) {
      this.emit('auto-discovery', discoveredQueues);
      
      // Auto-create discovered queues
      discoveredQueues.forEach(async (queueName) => {
        if (!this.queues.has(queueName)) {
          await this.createQueue(queueName);
        }
      });
    }
  }
  
  private discoverQueuesFromEnvironment(): string[] {
    const queues: Set<string> = new Set();
    
    // Check environment variables
    Object.keys(process.env).forEach(key => {
      if (key.includes('QUEUE_') || key.includes('TOPIC_') || key.includes('_QUEUE')) {
        const queueName = key.toLowerCase()
          .replace('queue_', '')
          .replace('topic_', '')
          .replace('_queue', '')
          .replace(/_/g, '-');
        queues.add(queueName);
      }
    });
    
    return Array.from(queues);
  }
  
  private autoDetectQueueName(): string {
    return process.env.QUEUE_NAME || 
           process.env.SERVICE_NAME + '-queue' || 
           'auto-queue-' + Date.now();
  }
  
  private autoDetectQueueType(): QueueType {
    if (process.env.QUEUE_TYPE) {
      return process.env.QUEUE_TYPE as QueueType;
    }
    
    // Auto-detect based on service name
    const serviceName = (process.env.SERVICE_NAME || '').toLowerCase();
    if (serviceName.includes('notification') || serviceName.includes('alert')) {
      return QueueType.PRIORITY;
    } else if (serviceName.includes('event') || serviceName.includes('log')) {
      return QueueType.TOPIC;
    }
    
    return QueueType.FIFO; // Default
  }
  
  private getIntelligentMaxSize(): number {
    const serviceName = (process.env.SERVICE_NAME || '').toLowerCase();
    
    if (serviceName.includes('high-volume') || serviceName.includes('streaming')) {
      return 100000;
    } else if (serviceName.includes('notification')) {
      return 50000;
    } else if (serviceName.includes('task')) {
      return 10000;
    }
    
    return 1000; // Default
  }
  
  private getOptimalConcurrency(): number {
    const cpuCount = require('os').cpus().length;
    return Math.min(cpuCount * 2, 10); // Max 10 concurrent processors
  }
  
  private async setupCircuitBreaker(): Promise<void> {
    try {
      const { createCircuitBreaker } = require('@generic/circuit-breaker');
      const breaker = createCircuitBreaker(`${this.config.name}-mq`);
      this.linkWith('circuit-breaker', breaker);
    } catch (error) {
      console.debug('Circuit breaker module not available, skipping integration');
    }
  }
  
  private setupCircuitBreakerIntegration(circuitBreaker: any): void {
    // Integrate circuit breaker with message processing
    const originalProcessMessage = this.processMessage.bind(this);
    
    this.processMessage = async (message: IMessage, subscriberIds: Set<string>) => {
      try {
        await circuitBreaker.execute(() => originalProcessMessage(message, subscriberIds));
      } catch (error) {
        console.warn('Circuit breaker prevented message processing:', (error as Error).message);
        // Move message back to queue for later processing
        this.addMessageToQueue(message.topic, message);
      }
    };
  }
  
  private setupServiceRegistryIntegration(serviceRegistry: any): void {
    // Register queue as a service
    serviceRegistry.register?.(`mq-${this.config.name}`, {
      type: 'message-queue',
      healthy: true,
      metadata: {
        queueType: this.config.type,
        maxSize: this.config.maxSize,
        topics: Array.from(this.queues.keys())
      }
    });
  }
  
  private setupEventTriggersIntegration(eventTriggers: any): void {
    // Auto-create event triggers for queue events
    eventTriggers.createTrigger?.('queue-full', {
      condition: (data: any) => data.size > this.config.maxSize * 0.9,
      action: () => console.warn('Queue approaching capacity limit')
    });
  }
  
  // Enhanced event emitter
  on<K extends keyof IMessageQueueEvents>(
    event: K,
    listener: IMessageQueueEvents[K]
  ): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof IMessageQueueEvents>(
    event: K,
    ...args: Parameters<IMessageQueueEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}