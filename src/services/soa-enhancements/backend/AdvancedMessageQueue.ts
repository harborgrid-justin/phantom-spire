/**
 * Advanced Message Queue Optimizer
 * SOA Improvement #4: High-performance message queue with intelligent routing
 */

import { EventEmitter } from 'events';

export enum MessagePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  URGENT = 5
}

export enum QueueType {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  DELAYED = 'delayed',
  ROUND_ROBIN = 'round-robin',
  SMART_ROUTING = 'smart-routing'
}

export interface Message {
  id: string;
  topic: string;
  payload: any;
  priority: MessagePriority;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
  delayUntil?: Date;
  metadata: Record<string, any>;
}

export interface QueueConfig {
  type: QueueType;
  maxSize: number;
  enableDeadLetter: boolean;
  deadLetterThreshold: number;
  enableMetrics: boolean;
  batchSize: number;
  processingTimeout: number;
}

export interface QueueMetrics {
  messagesProduced: number;
  messagesConsumed: number;
  messagesFailed: number;
  averageProcessingTime: number;
  queueSize: number;
  deadLetterSize: number;
  throughputPerSecond: number;
}

export class AdvancedMessageQueue extends EventEmitter {
  private messages: Message[] = [];
  private deadLetterQueue: Message[] = [];
  private consumers: Map<string, (message: Message) => Promise<void>> = new Map();
  private metrics: QueueMetrics;
  private config: QueueConfig;
  private processingTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  constructor(private queueName: string, config: Partial<QueueConfig> = {}) {
    super();
    this.config = {
      type: QueueType.SMART_ROUTING,
      maxSize: 10000,
      enableDeadLetter: true,
      deadLetterThreshold: 3,
      enableMetrics: true,
      batchSize: 10,
      processingTimeout: 30000,
      ...config
    };

    this.metrics = {
      messagesProduced: 0,
      messagesConsumed: 0,
      messagesFailed: 0,
      averageProcessingTime: 0,
      queueSize: 0,
      deadLetterSize: 0,
      throughputPerSecond: 0
    };

    this.startProcessing();
    this.startMetricsCollection();
  }

  /**
   * Produce message to queue
   */
  async produce(
    topic: string, 
    payload: any, 
    priority: MessagePriority = MessagePriority.NORMAL,
    options: { delay?: number; maxAttempts?: number; metadata?: Record<string, any> } = {}
  ): Promise<string> {
    if (this.messages.length >= this.config.maxSize) {
      throw new Error(`Queue ${this.queueName} is full`);
    }

    const message: Message = {
      id: this.generateMessageId(),
      topic,
      payload,
      priority,
      timestamp: new Date(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      delayUntil: options.delay ? new Date(Date.now() + options.delay) : undefined,
      metadata: options.metadata || {}
    };

    this.insertMessage(message);
    this.metrics.messagesProduced++;
    this.metrics.queueSize = this.messages.length;

    this.emit('message:produced', { messageId: message.id, topic, priority });
    console.log(`📤 Message Queue ${this.queueName}: Produced message ${message.id} for topic ${topic}`);

    return message.id;
  }

  /**
   * Register consumer for specific topic
   */
  consume(topic: string, handler: (message: Message) => Promise<void>): void {
    this.consumers.set(topic, handler);
    this.emit('consumer:registered', { topic, queueName: this.queueName });
    console.log(`📥 Message Queue ${this.queueName}: Registered consumer for topic ${topic}`);
  }

  /**
   * Insert message based on queue type
   */
  private insertMessage(message: Message): void {
    switch (this.config.type) {
      case QueueType.FIFO:
        this.messages.push(message);
        break;
      
      case QueueType.PRIORITY:
        this.insertByPriority(message);
        break;
      
      case QueueType.DELAYED:
        this.insertByDelay(message);
        break;
      
      case QueueType.SMART_ROUTING:
        this.smartInsert(message);
        break;
      
      default:
        this.messages.push(message);
    }
  }

  /**
   * Insert message by priority
   */
  private insertByPriority(message: Message): void {
    let inserted = false;
    for (let i = 0; i < this.messages.length; i++) {
      if (message.priority > this.messages[i].priority) {
        this.messages.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.messages.push(message);
    }
  }

  /**
   * Insert message by delay
   */
  private insertByDelay(message: Message): void {
    if (!message.delayUntil) {
      this.messages.unshift(message);
      return;
    }

    let inserted = false;
    for (let i = 0; i < this.messages.length; i++) {
      const currentDelay = this.messages[i].delayUntil;
      if (!currentDelay || message.delayUntil < currentDelay) {
        this.messages.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.messages.push(message);
    }
  }

  /**
   * Smart insertion based on multiple factors
   */
  private smartInsert(message: Message): void {
    const score = this.calculateMessageScore(message);
    
    let inserted = false;
    for (let i = 0; i < this.messages.length; i++) {
      const currentScore = this.calculateMessageScore(this.messages[i]);
      if (score > currentScore) {
        this.messages.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.messages.push(message);
    }
  }

  /**
   * Calculate message score for smart routing
   */
  private calculateMessageScore(message: Message): number {
    const priorityWeight = 0.4;
    const ageWeight = 0.3;
    const attemptsWeight = 0.2;
    const topicWeight = 0.1;

    const priorityScore = message.priority / 5;
    const ageScore = Math.min(1, (Date.now() - message.timestamp.getTime()) / (5 * 60 * 1000)); // 5 min max
    const attemptsScore = Math.max(0, 1 - (message.attempts / message.maxAttempts));
    const topicScore = this.getTopicPriority(message.topic);

    return (priorityScore * priorityWeight) + 
           (ageScore * ageWeight) + 
           (attemptsScore * attemptsWeight) + 
           (topicScore * topicWeight);
  }

  /**
   * Get topic priority for routing decisions
   */
  private getTopicPriority(topic: string): number {
    const highPriorityTopics = ['security-alert', 'system-critical', 'emergency'];
    const mediumPriorityTopics = ['user-action', 'data-update', 'notification'];
    
    if (highPriorityTopics.some(t => topic.includes(t))) return 1;
    if (mediumPriorityTopics.some(t => topic.includes(t))) return 0.6;
    return 0.3;
  }

  /**
   * Start message processing
   */
  private startProcessing(): void {
    this.processingTimer = setInterval(() => {
      this.processMessages();
    }, 100); // Process every 100ms
  }

  /**
   * Process messages in batch
   */
  private async processMessages(): Promise<void> {
    const batchSize = Math.min(this.config.batchSize, this.messages.length);
    const batch: Message[] = [];

    // Select messages ready for processing
    for (let i = 0; i < this.messages.length && batch.length < batchSize; i++) {
      const message = this.messages[i];
      if (!message.delayUntil || message.delayUntil <= new Date()) {
        batch.push(message);
        this.messages.splice(i, 1);
        i--; // Adjust index after removal
      }
    }

    // Process batch
    for (const message of batch) {
      this.processMessage(message);
    }

    this.metrics.queueSize = this.messages.length;
  }

  /**
   * Process individual message
   */
  private async processMessage(message: Message): Promise<void> {
    const consumer = this.consumers.get(message.topic);
    if (!consumer) {
      console.warn(`📬 No consumer for topic ${message.topic}, moving to dead letter queue`);
      this.moveToDeadLetter(message);
      return;
    }

    const startTime = Date.now();
    message.attempts++;

    try {
      await Promise.race([
        consumer(message),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Processing timeout')), this.config.processingTimeout)
        )
      ]);

      const processingTime = Date.now() - startTime;
      this.updateProcessingTimeMetrics(processingTime);
      this.metrics.messagesConsumed++;

      this.emit('message:processed', { 
        messageId: message.id, 
        topic: message.topic, 
        processingTime 
      });

    } catch (error) {
      console.error(`📬 Failed to process message ${message.id}:`, error);
      this.metrics.messagesFailed++;

      if (message.attempts >= message.maxAttempts) {
        this.moveToDeadLetter(message);
      } else {
        // Retry with exponential backoff
        const delay = Math.pow(2, message.attempts) * 1000;
        message.delayUntil = new Date(Date.now() + delay);
        this.insertMessage(message);
      }

      this.emit('message:failed', { 
        messageId: message.id, 
        topic: message.topic, 
        attempts: message.attempts,
        error: (error as Error).message
      });
    }
  }

  /**
   * Move message to dead letter queue
   */
  private moveToDeadLetter(message: Message): void {
    if (this.config.enableDeadLetter) {
      this.deadLetterQueue.push(message);
      this.metrics.deadLetterSize = this.deadLetterQueue.length;
      this.emit('message:dead-letter', { messageId: message.id, topic: message.topic });
    }
  }

  /**
   * Update processing time metrics
   */
  private updateProcessingTimeMetrics(processingTime: number): void {
    const total = this.metrics.averageProcessingTime * (this.metrics.messagesConsumed - 1);
    this.metrics.averageProcessingTime = (total + processingTime) / this.metrics.messagesConsumed;
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (this.config.enableMetrics) {
      let lastConsumed = 0;
      
      this.metricsTimer = setInterval(() => {
        const currentConsumed = this.metrics.messagesConsumed;
        this.metrics.throughputPerSecond = currentConsumed - lastConsumed;
        lastConsumed = currentConsumed;
        
        this.emit('metrics:updated', this.getMetrics());
      }, 1000);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current metrics
   */
  getMetrics(): QueueMetrics & { queueName: string } {
    return {
      queueName: this.queueName,
      ...this.metrics
    };
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueName: this.queueName,
      config: this.config,
      metrics: this.metrics,
      activeConsumers: Array.from(this.consumers.keys()),
      pendingMessages: this.messages.length,
      deadLetterMessages: this.deadLetterQueue.length
    };
  }

  /**
   * Purge queue
   */
  purge(): void {
    this.messages = [];
    this.deadLetterQueue = [];
    this.metrics.queueSize = 0;
    this.metrics.deadLetterSize = 0;
    this.emit('queue:purged', { queueName: this.queueName });
  }

  /**
   * Stop processing
   */
  stop(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }
}

/**
 * Message Queue Manager for multiple queues
 */
export class MessageQueueManager extends EventEmitter {
  private queues: Map<string, AdvancedMessageQueue> = new Map();

  /**
   * Create or get queue
   */
  getQueue(queueName: string, config?: Partial<QueueConfig>): AdvancedMessageQueue {
    if (!this.queues.has(queueName)) {
      const queue = new AdvancedMessageQueue(queueName, config);
      
      // Forward events
      queue.on('message:produced', (data) => this.emit('message:produced', { queueName, ...data }));
      queue.on('message:processed', (data) => this.emit('message:processed', { queueName, ...data }));
      queue.on('message:failed', (data) => this.emit('message:failed', { queueName, ...data }));
      
      this.queues.set(queueName, queue);
      console.log(`📮 Created queue: ${queueName}`);
    }
    
    return this.queues.get(queueName)!;
  }

  /**
   * Get all queue statistics
   */
  getAllMetrics() {
    const metrics: Record<string, any> = {};
    this.queues.forEach((queue, name) => {
      metrics[name] = queue.getMetrics();
    });
    return metrics;
  }

  /**
   * Broadcast message to multiple queues
   */
  async broadcast(
    queueNames: string[], 
    topic: string, 
    payload: any, 
    priority: MessagePriority = MessagePriority.NORMAL
  ): Promise<string[]> {
    const messageIds: string[] = [];
    
    for (const queueName of queueNames) {
      const queue = this.getQueue(queueName);
      const messageId = await queue.produce(topic, payload, priority);
      messageIds.push(messageId);
    }
    
    return messageIds;
  }

  /**
   * Stop all queues
   */
  stopAll(): void {
    for (const queue of this.queues.values()) {
      queue.stop();
    }
  }
}

// Export singleton manager
export const messageQueueManager = new MessageQueueManager();