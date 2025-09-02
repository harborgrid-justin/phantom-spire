/**
 * Message Queue Utilities - Enterprise-grade helpers and monitoring
 * Provides encryption, tracing, monitoring, and other utility functions
 */

import crypto from 'crypto';
import { logger } from '../../utils/logger.js';
import {
  IMessage,
  IMessageMetadata,
  IMessageEncryption,
  IMessageTracing,
} from '../interfaces/IMessageQueue.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Message Encryption Utility
 * Provides enterprise-grade message encryption and decryption
 */
export class MessageEncryptionUtil {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly encryptionKey: Buffer;

  constructor(encryptionKey?: string) {
    if (encryptionKey) {
      this.encryptionKey = Buffer.from(encryptionKey, 'hex');
    } else {
      // Generate a new key (should be stored securely in production)
      this.encryptionKey = crypto.randomBytes(this.keyLength);
      logger.warn('Generated new encryption key. Store this securely!', {
        key: this.encryptionKey.toString('hex'),
      });
    }
  }

  /**
   * Encrypt message payload
   */
  public encryptMessage<T>(
    message: IMessage<T>
  ): IMessage<{ encryptedPayload: string; iv: string; tag: string }> {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv
      );

      const payloadString = JSON.stringify(message.payload);
      let encrypted = cipher.update(payloadString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      const encryptionMetadata: IMessageEncryption = {
        algorithm: this.algorithm,
        keyId: this.getKeyId(),
        encrypted: true,
      };

      return {
        ...message,
        payload: {
          encryptedPayload: encrypted,
          iv: iv.toString('hex'),
          tag: tag.toString('hex'),
        },
        metadata: {
          ...message.metadata,
          encryption: encryptionMetadata,
        },
      };
    } catch (error) {
      logger.error('Failed to encrypt message', {
        messageId: message.id,
        error,
      });
      throw new Error('Message encryption failed');
    }
  }

  /**
   * Decrypt message payload
   */
  public decryptMessage<T>(
    encryptedMessage: IMessage<{
      encryptedPayload: string;
      iv: string;
      tag: string;
    }>
  ): IMessage<T> {
    try {
      if (!encryptedMessage.metadata.encryption?.encrypted) {
        throw new Error('Message is not encrypted');
      }

      const { encryptedPayload, iv, tag } = encryptedMessage.payload;

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        Buffer.from(iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const originalPayload = JSON.parse(decrypted) as T;

      return {
        ...encryptedMessage,
        payload: originalPayload,
        metadata: {
          ...encryptedMessage.metadata,
          encryption: {
            ...encryptedMessage.metadata.encryption,
            encrypted: false,
          },
        },
      };
    } catch (error) {
      logger.error('Failed to decrypt message', {
        messageId: encryptedMessage.id,
        error,
      });
      throw new Error('Message decryption failed');
    }
  }

  /**
   * Generate key ID for key rotation
   */
  private getKeyId(): string {
    const hash = crypto.createHash('sha256');
    hash.update(this.encryptionKey);
    return hash.digest('hex').substring(0, 16);
  }
}

/**
 * Message Tracing Utility
 * Provides distributed tracing capabilities for message flows
 */
export class MessageTracingUtil {
  private readonly traces = new Map<string, IMessageTrace>();

  /**
   * Start a new trace for a message
   */
  public startTrace(message: IMessage, operationName: string): IMessageTracing {
    const traceId = message.metadata.tracing?.traceId || uuidv4();
    const spanId = uuidv4();
    const parentSpanId = message.metadata.tracing?.spanId;

    const tracing: IMessageTracing = {
      traceId,
      spanId,
      parentSpanId,
      baggage: {
        operation: operationName,
        messageType: message.type,
        topic: message.topic,
        ...message.metadata.tracing?.baggage,
      },
    };

    // Store trace information
    this.traces.set(spanId, {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: Date.now(),
      messageId: message.id,
      messageType: message.type,
      topic: message.topic,
    });

    return tracing;
  }

  /**
   * Finish a trace span
   */
  public finishTrace(spanId: string, success: boolean, error?: Error): void {
    const trace = this.traces.get(spanId);
    if (!trace) {
      logger.warn('Trace not found for span', { spanId });
      return;
    }

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;
    trace.success = success;
    trace.error = error?.message;

    logger.debug('Trace completed', {
      traceId: trace.traceId,
      spanId,
      parentSpanId: trace.parentSpanId,
      operationName: trace.operationName,
      duration,
      success,
      messageType: trace.messageType,
      topic: trace.topic,
    });

    // In a production environment, this would send to a tracing system like Jaeger
    this.sendToTracingSystem(trace);
  }

  /**
   * Get active traces
   */
  public getActiveTraces(): IMessageTrace[] {
    return Array.from(this.traces.values()).filter(trace => !trace.endTime);
  }

  /**
   * Clean up old traces
   */
  public cleanupOldTraces(maxAgeMs: number = 300000): void {
    const cutoff = Date.now() - maxAgeMs;

    for (const [spanId, trace] of this.traces.entries()) {
      if (trace.startTime < cutoff) {
        this.traces.delete(spanId);
      }
    }
  }

  private sendToTracingSystem(trace: IMessageTrace): void {
    // Implementation would send to actual tracing system
    // For now, we'll just store it for monitoring
  }
}

interface IMessageTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
  messageId: string;
  messageType: string;
  topic: string;
}

/**
 * Message Deduplication Utility
 * Provides message deduplication based on content hash and time window
 */
export class MessageDeduplicationUtil {
  private readonly seenMessages = new Map<string, number>();
  private readonly deduplicationWindow: number;

  constructor(deduplicationWindowMs: number = 60000) {
    this.deduplicationWindow = deduplicationWindowMs;

    // Clean up old entries periodically
    setInterval(() => this.cleanup(), deduplicationWindowMs);
  }

  /**
   * Check if message is a duplicate
   */
  public isDuplicate<T>(message: IMessage<T>): boolean {
    const hash = this.getMessageHash(message);
    const now = Date.now();

    const lastSeen = this.seenMessages.get(hash);
    if (lastSeen && now - lastSeen < this.deduplicationWindow) {
      logger.debug('Duplicate message detected', {
        messageId: message.id,
        hash,
        lastSeenAge: now - lastSeen,
      });
      return true;
    }

    // Mark message as seen
    this.seenMessages.set(hash, now);
    return false;
  }

  /**
   * Generate hash for message content
   */
  private getMessageHash<T>(message: IMessage<T>): string {
    const hashInput = {
      type: message.type,
      topic: message.topic,
      payload: message.payload,
    };

    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(hashInput));
    return hash.digest('hex');
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.deduplicationWindow;

    for (const [hash, timestamp] of this.seenMessages.entries()) {
      if (timestamp < cutoff) {
        this.seenMessages.delete(hash);
      }
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalMessages: number;
    oldestMessage: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    const timestamps = Array.from(this.seenMessages.values());

    return {
      totalMessages: this.seenMessages.size,
      oldestMessage: timestamps.length > 0 ? Math.min(...timestamps) : now,
      memoryUsage: JSON.stringify(Object.fromEntries(this.seenMessages)).length,
    };
  }
}

/**
 * Message Queue Monitoring Utility
 * Provides comprehensive monitoring and alerting for message queues
 */
export class MessageQueueMonitor {
  private readonly metrics = new Map<string, IQueueMetrics>();
  private readonly alerts: IAlert[] = [];
  private readonly maxAlerts = 1000;

  /**
   * Record message processing metrics
   */
  public recordMessageProcessed(
    queueName: string,
    messageType: string,
    processingTime: number,
    success: boolean
  ): void {
    const key = `${queueName}:${messageType}`;
    let queueMetrics = this.metrics.get(key);

    if (!queueMetrics) {
      queueMetrics = {
        queueName,
        messageType,
        totalMessages: 0,
        successfulMessages: 0,
        failedMessages: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        minProcessingTime: processingTime,
        maxProcessingTime: processingTime,
        lastProcessed: Date.now(),
      };
    }

    // Update metrics
    queueMetrics.totalMessages++;
    queueMetrics.totalProcessingTime += processingTime;
    queueMetrics.averageProcessingTime =
      queueMetrics.totalProcessingTime / queueMetrics.totalMessages;
    queueMetrics.minProcessingTime = Math.min(
      queueMetrics.minProcessingTime,
      processingTime
    );
    queueMetrics.maxProcessingTime = Math.max(
      queueMetrics.maxProcessingTime,
      processingTime
    );
    queueMetrics.lastProcessed = Date.now();

    if (success) {
      queueMetrics.successfulMessages++;
    } else {
      queueMetrics.failedMessages++;
    }

    this.metrics.set(key, queueMetrics);

    // Check for alerts
    this.checkForAlerts(queueMetrics);
  }

  /**
   * Get metrics for a specific queue
   */
  public getQueueMetrics(queueName: string): IQueueMetrics[] {
    return Array.from(this.metrics.values()).filter(
      metrics => metrics.queueName === queueName
    );
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): IQueueMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): IAlert[] {
    const now = Date.now();
    return this.alerts.filter(
      alert => !alert.resolved && alert.timestamp > now - 3600000
    ); // 1 hour
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
    }
  }

  /**
   * Check for alerts based on metrics
   */
  private checkForAlerts(metrics: IQueueMetrics): void {
    const errorRate = metrics.failedMessages / metrics.totalMessages;
    const now = Date.now();

    // High error rate alert
    if (errorRate > 0.1 && metrics.totalMessages > 10) {
      this.addAlert({
        id: uuidv4(),
        type: 'high_error_rate',
        severity: 'warning',
        message: `High error rate detected for ${metrics.queueName}:${metrics.messageType} - ${(errorRate * 100).toFixed(1)}%`,
        queueName: metrics.queueName,
        messageType: metrics.messageType,
        value: errorRate,
        threshold: 0.1,
        timestamp: now,
        resolved: false,
      });
    }

    // High processing time alert
    if (metrics.averageProcessingTime > 30000) {
      // 30 seconds
      this.addAlert({
        id: uuidv4(),
        type: 'high_processing_time',
        severity: 'warning',
        message: `High average processing time for ${metrics.queueName}:${metrics.messageType} - ${metrics.averageProcessingTime}ms`,
        queueName: metrics.queueName,
        messageType: metrics.messageType,
        value: metrics.averageProcessingTime,
        threshold: 30000,
        timestamp: now,
        resolved: false,
      });
    }
  }

  /**
   * Add an alert
   */
  private addAlert(alert: IAlert): void {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      a =>
        !a.resolved &&
        a.type === alert.type &&
        a.queueName === alert.queueName &&
        a.messageType === alert.messageType
    );

    if (!existingAlert) {
      this.alerts.push(alert);

      // Limit number of alerts
      if (this.alerts.length > this.maxAlerts) {
        this.alerts.splice(0, this.alerts.length - this.maxAlerts);
      }

      logger.warn('Message queue alert triggered', alert);
    }
  }
}

interface IQueueMetrics {
  queueName: string;
  messageType: string;
  totalMessages: number;
  successfulMessages: number;
  failedMessages: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  lastProcessed: number;
}

interface IAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  queueName: string;
  messageType: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * Circuit Breaker Utility
 * Implements circuit breaker pattern for message queue resilience
 */
export class CircuitBreaker {
  private readonly config: ICircuitBreakerConfig;
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private nextAttempt?: number;

  constructor(config: ICircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute operation through circuit breaker
   */
  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (!this.nextAttempt || Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }

      // Try to move to half-open state
      this.state = CircuitBreakerState.HALF_OPEN;
      logger.info('Circuit breaker moved to HALF_OPEN state');
    }

    try {
      const result = await operation();

      // Success - reset circuit breaker
      if (
        this.state === CircuitBreakerState.HALF_OPEN ||
        this.failureCount > 0
      ) {
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get current state
   */
  public getState(): {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureTime?: number;
    nextAttempt?: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
    };
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;

      logger.warn('Circuit breaker moved to OPEN state', {
        failureCount: this.failureCount,
        nextAttempt: this.nextAttempt,
      });
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttempt = undefined;
    this.state = CircuitBreakerState.CLOSED;

    logger.info('Circuit breaker reset to CLOSED state');
  }
}

interface ICircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

// Export utility instances for easy use
export const messageEncryption = new MessageEncryptionUtil();
export const messageTracing = new MessageTracingUtil();
export const messageDeduplication = new MessageDeduplicationUtil();
export const messageQueueMonitor = new MessageQueueMonitor();
