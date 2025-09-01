/**
 * Revolutionary Message Queue Interfaces
 * Zero-configuration event processing and messaging
 */

export interface IMessage<T = any> {
  id: string;
  topic: string;
  payload: T;
  metadata: {
    timestamp: number;
    source: string;
    priority: MessagePriority;
    retryCount: number;
    maxRetries: number;
    timeout: number;
    correlationId?: string;
    replyTo?: string;
    headers: Record<string, any>;
  };
}

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export enum QueueType {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  TOPIC = 'topic',
  FANOUT = 'fanout',
  DIRECT = 'direct'
}

export interface IMessageHandler<T = any> {
  (message: IMessage<T>): Promise<void>;
}

export interface IQueueConfig {
  /** Queue name */
  name?: string;
  /** Queue type */
  type?: QueueType;
  /** Auto-create if not exists */
  autoCreate?: boolean;
  /** Auto-link with other modules */
  autoLink?: boolean;
  /** Enable auto-discovery */
  autoDiscovery?: boolean;
  /** Maximum queue size */
  maxSize?: number;
  /** Message retention time (ms) */
  retentionTime?: number;
  /** Dead letter queue name */
  deadLetterQueue?: string;
  /** Enable persistence */
  persistent?: boolean;
  /** Consumer concurrency */
  concurrency?: number;
  /** Enable circuit breaker */
  circuitBreaker?: boolean;
}

export interface ISubscription {
  id: string;
  topic: string;
  handler: IMessageHandler;
  options: ISubscriptionOptions;
}

export interface ISubscriptionOptions {
  /** Auto-acknowledge messages */
  autoAck?: boolean;
  /** Retry failed messages */
  autoRetry?: boolean;
  /** Maximum retries */
  maxRetries?: number;
  /** Consumer group */
  consumerGroup?: string;
  /** Message filtering */
  filter?: (message: IMessage) => boolean;
  /** Batch size for processing */
  batchSize?: number;
}

export interface IMessageQueueMetrics {
  totalMessages: number;
  processedMessages: number;
  failedMessages: number;
  pendingMessages: number;
  subscriberCount: number;
  averageProcessingTime: number;
  throughputPerSecond: number;
  errorRate: number;
  queueSize: number;
}

export interface IMessageQueueEvents {
  'message-published': (message: IMessage) => void;
  'message-consumed': (message: IMessage, processingTime: number) => void;
  'message-failed': (message: IMessage, error: Error) => void;
  'message-retry': (message: IMessage, attempt: number) => void;
  'subscriber-added': (subscription: ISubscription) => void;
  'subscriber-removed': (subscriptionId: string) => void;
  'queue-created': (queueName: string, config: IQueueConfig) => void;
  'queue-full': (queueName: string, size: number) => void;
  'auto-discovery': (queues: string[]) => void;
  'health-check': (health: IQueueHealth) => void;
}

export interface IQueueHealth {
  healthy: boolean;
  score: number;
  issues: string[];
  metrics: IMessageQueueMetrics;
  uptime: number;
}

export interface IMessageQueue {
  /** Publish message to topic/queue */
  publish<T>(topic: string, payload: T, options?: Partial<IMessage['metadata']>): Promise<string>;
  
  /** Subscribe to topic/queue */
  subscribe<T>(topic: string, handler: IMessageHandler<T>, options?: ISubscriptionOptions): Promise<string>;
  
  /** Unsubscribe from topic/queue */
  unsubscribe(subscriptionId: string): Promise<void>;
  
  /** Create queue with configuration */
  createQueue(name: string, config?: IQueueConfig): Promise<void>;
  
  /** Delete queue */
  deleteQueue(name: string): Promise<void>;
  
  /** Get queue metrics */
  getMetrics(queueName?: string): Promise<IMessageQueueMetrics>;
  
  /** Get health status */
  getHealth(): Promise<IQueueHealth>;
  
  /** Start message queue */
  start(): Promise<void>;
  
  /** Stop message queue */
  stop(): Promise<void>;
  
  /** Purge queue */
  purge(queueName: string): Promise<void>;
  
  /** Auto-link with other modules */
  linkWith(moduleType: string, instance: any): void;
}

export interface IMessageQueueFactory {
  /** Create message queue with auto-configuration */
  create(config?: Partial<IQueueConfig>): IMessageQueue;
  
  /** Create for specific use case */
  createForUseCase(useCase: 'events' | 'tasks' | 'notifications' | 'streaming' | 'rpc', name?: string): IMessageQueue;
  
  /** Get or create singleton instance */
  getInstance(name?: string, config?: Partial<IQueueConfig>): IMessageQueue;
  
  /** Revolutionary zero-config creation */
  autoCreate(name?: string): IMessageQueue;
}

export interface IMessageQueueRegistry {
  /** Register message queue instance */
  register(name: string, queue: IMessageQueue): void;
  
  /** Get message queue by name */
  get(name: string): IMessageQueue | undefined;
  
  /** Get all registered queues */
  getAll(): Map<string, IMessageQueue>;
  
  /** Auto-discover message queues */
  autoDiscover(): Promise<void>;
  
  /** Get overall system health */
  getSystemHealth(): Promise<{
    healthy: boolean;
    totalQueues: number;
    healthyQueues: number;
    totalMessages: number;
    overallThroughput: number;
  }>;
}