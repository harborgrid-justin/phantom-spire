/**
 * Core Message Queue Interfaces - Fortune 100 Grade Architecture
 * Enterprise-level message queue system for cyber threat intelligence
 */

export interface IMessage<T = Record<string, unknown>> {
  readonly id: string;
  readonly type: string;
  readonly topic: string;
  readonly payload: T;
  readonly metadata: IMessageMetadata;
  readonly headers?: Record<string, string>;
  readonly timestamp: Date;
  readonly expirationTime?: Date;
  readonly correlationId?: string;
  readonly replyTo?: string;
}

export interface IMessageMetadata {
  readonly source: string;
  readonly version: string;
  readonly priority: MessagePriority;
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly processingTimeout: number;
  readonly encryption?: IMessageEncryption;
  readonly tracing?: IMessageTracing;
}

export interface IMessageEncryption {
  readonly algorithm: string;
  readonly keyId: string;
  readonly encrypted: boolean;
}

export interface IMessageTracing {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly baggage?: Record<string, string>;
}

export enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  BACKGROUND = 4,
}

export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DEAD_LETTER = 'dead_letter',
  EXPIRED = 'expired',
}

export interface IMessageQueue {
  readonly name: string;
  readonly type: QueueType;
  readonly config: IQueueConfig;

  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  publish<T>(message: IMessage<T>): Promise<IPublishResult>;
  subscribe<T>(
    topic: string,
    handler: IMessageHandler<T>,
    options?: ISubscriptionOptions
  ): Promise<ISubscription>;
  unsubscribe(subscriptionId: string): Promise<void>;
  getQueueHealth(): Promise<IQueueHealth>;
  getQueueMetrics(): Promise<IQueueMetrics>;
}

export interface IQueueConfig {
  readonly maxQueueSize: number;
  readonly messageTtl: number;
  readonly enableDeadLetter: boolean;
  readonly deadLetterTtl: number;
  readonly enableEncryption: boolean;
  readonly enableTracing: boolean;
  readonly enableDeduplication: boolean;
  readonly deduplicationWindow: number;
  readonly persistence: IPersistenceConfig;
  readonly retry: IRetryConfig;
}

export interface IPersistenceConfig {
  readonly enabled: boolean;
  readonly backend: 'redis' | 'mongodb' | 'hybrid';
  readonly replicationFactor?: number;
  readonly durability: 'memory' | 'disk' | 'both';
}

export interface IRetryConfig {
  readonly maxRetries: number;
  readonly backoffStrategy: 'linear' | 'exponential' | 'fixed';
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly multiplier: number;
}

export enum QueueType {
  PRIORITY = 'priority',
  FIFO = 'fifo',
  PUB_SUB = 'pub_sub',
  DELAYED = 'delayed',
  BROADCAST = 'broadcast',
}

export interface IPublishResult {
  readonly messageId: string;
  readonly acknowledged: boolean;
  readonly timestamp: Date;
  readonly queuePosition?: number;
}

export interface IMessageHandler<T = Record<string, unknown>> {
  handle(message: IMessage<T>, context: IMessageContext): Promise<IHandlerResult>;
}

export interface IMessageContext {
  readonly subscriptionId: string;
  readonly deliveryCount: number;
  readonly firstDelivery: Date;
  readonly lastDelivery?: Date;
  readonly acknowledge: () => Promise<void>;
  readonly reject: (requeue?: boolean) => Promise<void>;
  readonly deadLetter: (reason: string) => Promise<void>;
}

export interface IHandlerResult {
  readonly success: boolean;
  readonly error?: Error;
  readonly retryable?: boolean;
  readonly metrics?: Record<string, number>;
}

export interface ISubscriptionOptions {
  readonly autoAck?: boolean;
  readonly prefetchCount?: number;
  readonly maxConcurrency?: number;
  readonly filter?: IMessageFilter;
  readonly deadLetterHandling?: IDeadLetterOptions;
}

export interface IMessageFilter {
  readonly topics?: string[];
  readonly messageTypes?: string[];
  readonly priorities?: MessagePriority[];
  readonly headers?: Record<string, string>;
  readonly customFilter?: (message: IMessage) => boolean;
}

export interface IDeadLetterOptions {
  readonly enabled: boolean;
  readonly maxRetries: number;
  readonly handler?: IMessageHandler;
}

export interface ISubscription {
  readonly id: string;
  readonly topic: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly messageCount: number;
  readonly lastMessageAt?: Date;

  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
}

export interface IQueueHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly lastCheck: Date;
  readonly uptime: number;
  readonly connectivity: boolean;
  readonly memoryUsage: number;
  readonly diskUsage?: number;
  readonly issues: string[];
}

export interface IQueueMetrics {
  readonly messagesPublished: number;
  readonly messagesConsumed: number;
  readonly messagesPending: number;
  readonly messagesDeadLetter: number;
  readonly averageProcessingTime: number;
  readonly throughputPerSecond: number;
  readonly errorRate: number;
  readonly consumerCount: number;
  readonly subscriptionCount: number;
  readonly queueSizeBytes: number;
  readonly oldestMessageAge: number;
}

export interface ICircuitBreakerConfig {
  readonly failureThreshold: number;
  readonly recoveryTimeout: number;
  readonly monitoringPeriod: number;
  readonly halfOpenMaxCalls: number;
}

export interface ICircuitBreakerState {
  readonly state: 'closed' | 'open' | 'half_open';
  readonly failureCount: number;
  readonly lastFailureTime?: Date;
  readonly nextAttempt?: Date;
}