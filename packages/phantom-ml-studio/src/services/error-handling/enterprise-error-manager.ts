/**
 * Enterprise Error Handling and Retry System
 * Advanced error management with intelligent retry strategies
 * Circuit breaker patterns and comprehensive error recovery
 */

import { EventEmitter } from 'events';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  jitter: boolean;
  retryCondition?: (error: any, attemptNumber: number) => boolean;
  onRetry?: (error: any, attemptNumber: number) => void;
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // number of failures to open circuit
  resetTimeout: number; // milliseconds to wait before trying again
  monitoringPeriod: number; // milliseconds to monitor for failures
  expectedErrors?: string[]; // error types that don't count as failures
}

export interface ErrorClassification {
  type: 'transient' | 'permanent' | 'timeout' | 'network' | 'authentication' | 'authorization' | 'validation' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  category: string;
  description: string;
}

export interface ErrorContext {
  operation: string;
  service: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: Error;
  classification: ErrorClassification;
  context: ErrorContext;
  stackTrace: string;
  environment: {
    nodeVersion: string;
    platform: string;
    memory: NodeJS.MemoryUsage;
    uptime: number;
  };
  attempts: number;
  resolved: boolean;
  resolutionTime?: Date;
  tags: string[];
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;
  private config: CircuitBreakerConfig;
  private successCount: number = 0;

  constructor(config: CircuitBreakerConfig) {
    super();
    this.config = config;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.nextAttemptTime && Date.now() < this.nextAttemptTime.getTime()) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.emit('state_changed', CircuitBreakerState.HALF_OPEN);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.successCount++;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
      this.emit('state_changed', CircuitBreakerState.CLOSED);
    }
  }

  private onFailure(error: any): void {
    // Check if this error should count as a failure
    if (this.isExpectedError(error)) {
      return;
    }

    this.failures++;
    this.lastFailureTime = new Date();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);
      this.emit('state_changed', CircuitBreakerState.OPEN);
    }
  }

  private isExpectedError(error: any): boolean {
    if (!this.config.expectedErrors) return false;
    return this.config.expectedErrors.includes(error.constructor.name);
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats(): {
    state: CircuitBreakerState;
    failures: number;
    successes: number;
    lastFailureTime?: Date;
    nextAttemptTime?: Date;
  } {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    this.emit('reset');
  }
}

/**
 * Advanced retry mechanism with exponential backoff
 */
export class EnterpriseRetryManager {
  private activeRetries: Map<string, {
    attempts: number;
    startTime: Date;
    lastError: any;
  }> = new Map();

  constructor() {}

  async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context?: { operationId?: string; operationName?: string }
  ): Promise<T> {
    const operationId = context?.operationId || `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let lastError: any;
    let attempt = 0;

    // Track retry session
    this.activeRetries.set(operationId, {
      attempts: 0,
      startTime: new Date(),
      lastError: null
    });

    try {
      while (attempt <= config.maxRetries) {
        try {
          const result = await operation();
          this.activeRetries.delete(operationId);
          return result;
        } catch (error) {
          lastError = error;
          attempt++;
          
          // Update tracking
          const retryInfo = this.activeRetries.get(operationId)!;
          retryInfo.attempts = attempt;
          retryInfo.lastError = error;

          // Check if we should retry
          if (attempt > config.maxRetries || 
              (config.retryCondition && !config.retryCondition(error, attempt))) {
            break;
          }

          // Calculate delay
          const delay = this.calculateDelay(config, attempt);
          
          // Call retry callback
          if (config.onRetry) {
            config.onRetry(error, attempt);
          }

          // Wait before retry
          await this.sleep(delay);
        }
      }
    } finally {
      this.activeRetries.delete(operationId);
    }

    throw lastError;
  }

  private calculateDelay(config: RetryConfig, attempt: number): number {
    let delay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1);
    delay = Math.min(delay, config.maxDelay);
    
    if (config.jitter) {
      // Add jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getActiveRetries(): Array<{
    operationId: string;
    attempts: number;
    duration: number;
    lastError: any;
  }> {
    const results: Array<{
      operationId: string;
      attempts: number;
      duration: number;
      lastError: any;
    }> = [];

    for (const [operationId, info] of this.activeRetries.entries()) {
      results.push({
        operationId,
        attempts: info.attempts,
        duration: Date.now() - info.startTime.getTime(),
        lastError: info.lastError?.message || null
      });
    }

    return results;
  }
}

/**
 * Comprehensive error classification system
 */
export class ErrorClassifier {
  private static classificationRules: Array<{
    predicate: (error: any) => boolean;
    classification: ErrorClassification;
  }> = [
    // Network errors
    {
      predicate: (error) => error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT',
      classification: {
        type: 'network',
        severity: 'high',
        retryable: true,
        category: 'connectivity',
        description: 'Network connectivity issue'
      }
    },
    // Timeout errors
    {
      predicate: (error) => error.code === 'TIMEOUT' || error.message?.includes('timeout'),
      classification: {
        type: 'timeout',
        severity: 'medium',
        retryable: true,
        category: 'performance',
        description: 'Operation timed out'
      }
    },
    // Authentication errors
    {
      predicate: (error) => error.status === 401 || error.message?.includes('unauthorized'),
      classification: {
        type: 'authentication',
        severity: 'high',
        retryable: false,
        category: 'security',
        description: 'Authentication failed'
      }
    },
    // Authorization errors
    {
      predicate: (error) => error.status === 403 || error.message?.includes('forbidden'),
      classification: {
        type: 'authorization',
        severity: 'medium',
        retryable: false,
        category: 'security',
        description: 'Authorization failed'
      }
    },
    // Validation errors
    {
      predicate: (error) => error.status === 400 || error.name === 'ValidationError',
      classification: {
        type: 'validation',
        severity: 'low',
        retryable: false,
        category: 'user_input',
        description: 'Input validation failed'
      }
    },
    // System errors
    {
      predicate: (error) => error.status >= 500 || error.code === 'EMFILE' || error.code === 'ENOMEM',
      classification: {
        type: 'system',
        severity: 'critical',
        retryable: true,
        category: 'infrastructure',
        description: 'System resource issue'
      }
    },
    // Database errors
    {
      predicate: (error) => error.name?.includes('Database') || error.code?.startsWith('ER_') || error.code?.startsWith('SQLITE_'),
      classification: {
        type: 'system',
        severity: 'high',
        retryable: true,
        category: 'database',
        description: 'Database operation failed'
      }
    }
  ];

  static classify(error: any): ErrorClassification {
    for (const rule of this.classificationRules) {
      if (rule.predicate(error)) {
        return rule.classification;
      }
    }

    // Default classification
    return {
      type: 'system',
      severity: 'medium',
      retryable: false,
      category: 'unknown',
      description: 'Unclassified error'
    };
  }

  static addCustomRule(
    predicate: (error: any) => boolean,
    classification: ErrorClassification
  ): void {
    this.classificationRules.unshift({ predicate, classification });
  }
}

/**
 * Comprehensive error management system
 */
export class EnterpriseErrorManager extends EventEmitter {
  private errorReports: ErrorReport[] = [];
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryManager: EnterpriseRetryManager;
  private maxReports = 10000;

  constructor() {
    super();
    this.retryManager = new EnterpriseRetryManager();
  }

  /**
   * Handle error with comprehensive processing
   */
  async handleError(
    error: any,
    context: ErrorContext,
    options?: {
      notify?: boolean;
      retry?: RetryConfig;
      circuitBreaker?: string;
      tags?: string[];
    }
  ): Promise<ErrorReport> {
    const classification = ErrorClassifier.classify(error);
    
    const report: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error: error instanceof Error ? error : new Error(String(error)),
      classification,
      context,
      stackTrace: error?.stack || new Error().stack || 'No stack trace available',
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      attempts: 1,
      resolved: false,
      tags: options?.tags || []
    };

    // Store error report
    this.addErrorReport(report);

    // Emit events
    this.emit('error_occurred', report);
    
    if (classification.severity === 'critical') {
      this.emit('critical_error', report);
    }

    // Handle notifications
    if (options?.notify !== false) {
      await this.notifyError(report);
    }

    return report;
  }

  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options?: {
      retry?: RetryConfig;
      circuitBreaker?: string;
      timeout?: number;
      tags?: string[];
    }
  ): Promise<T> {
    // Wrap in circuit breaker if specified
    if (options?.circuitBreaker) {
      const circuitBreaker = this.getOrCreateCircuitBreaker(options.circuitBreaker);
      const originalOperation = operation;
      operation = () => circuitBreaker.execute(originalOperation);
    }

    // Wrap in timeout if specified
    if (options?.timeout) {
      const originalOperation = operation;
      operation = () => Promise.race([
        originalOperation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timeout after ${options.timeout}ms`)), options.timeout)
        )
      ]);
    }

    // Execute with retry if specified
    if (options?.retry) {
      try {
        return await this.retryManager.withRetry(operation, options.retry, {
          operationName: context.operation
        });
      } catch (error) {
        await this.handleError(error, context, { tags: options.tags });
        throw error;
      }
    } else {
      try {
        return await operation();
      } catch (error) {
        await this.handleError(error, context, { tags: options.tags });
        throw error;
      }
    }
  }

  /**
   * Get or create circuit breaker
   */
  private getOrCreateCircuitBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 300000
      };
      
      const circuitBreaker = new CircuitBreaker(config || defaultConfig);
      circuitBreaker.on('state_changed', (state) => {
        this.emit('circuit_breaker_state_changed', { name, state });
      });
      
      this.circuitBreakers.set(name, circuitBreaker);
    }
    
    return this.circuitBreakers.get(name)!;
  }

  /**
   * Add error report
   */
  private addErrorReport(report: ErrorReport): void {
    this.errorReports.push(report);
    
    // Keep only recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }
  }

  /**
   * Notify about error (placeholder for actual notification system)
   */
  private async notifyError(report: ErrorReport): Promise<void> {
    // In production, this would integrate with notification services
    // like Slack, PagerDuty, email, etc.
    
    if (report.classification.severity === 'critical') {
      console.error('CRITICAL ERROR:', {
        id: report.id,
        error: report.error.message,
        operation: report.context.operation,
        service: report.context.service
      });
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(timeFrame?: { start: Date; end: Date }): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    errorRate: number;
    mttr: number; // Mean Time To Resolution in minutes
    topErrors: Array<{ error: string; count: number; lastOccurrence: Date }>;
  } {
    let filteredReports = this.errorReports;
    
    if (timeFrame) {
      filteredReports = this.errorReports.filter(
        report => report.context.timestamp >= timeFrame.start && 
                 report.context.timestamp <= timeFrame.end
      );
    }

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const errorCounts: Record<string, { count: number; lastOccurrence: Date }> = {};
    
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const report of filteredReports) {
      // Count by type
      byType[report.classification.type] = (byType[report.classification.type] || 0) + 1;
      
      // Count by severity
      bySeverity[report.classification.severity] = (bySeverity[report.classification.severity] || 0) + 1;
      
      // Count by category
      byCategory[report.classification.category] = (byCategory[report.classification.category] || 0) + 1;
      
      // Count error occurrences
      const errorKey = report.error.message;
      if (!errorCounts[errorKey]) {
        errorCounts[errorKey] = { count: 0, lastOccurrence: report.context.timestamp };
      }
      errorCounts[errorKey].count++;
      if (report.context.timestamp > errorCounts[errorKey].lastOccurrence) {
        errorCounts[errorKey].lastOccurrence = report.context.timestamp;
      }
      
      // Calculate resolution time
      if (report.resolved && report.resolutionTime) {
        totalResolutionTime += report.resolutionTime.getTime() - report.context.timestamp.getTime();
        resolvedCount++;
      }
    }

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([error, data]) => ({
        error: error.substring(0, 100), // Limit length
        count: data.count,
        lastOccurrence: data.lastOccurrence
      }));

    const mttr = resolvedCount > 0 ? (totalResolutionTime / resolvedCount) / (1000 * 60) : 0; // minutes
    const errorRate = filteredReports.length; // errors per time period

    return {
      total: filteredReports.length,
      byType,
      bySeverity,
      byCategory,
      errorRate,
      mttr,
      topErrors
    };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Array<{
    name: string;
    state: CircuitBreakerState;
    failures: number;
    successes: number;
    lastFailureTime?: Date;
  }> {
    const statuses: Array<{
      name: string;
      state: CircuitBreakerState;
      failures: number;
      successes: number;
      lastFailureTime?: Date;
    }> = [];

    for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
      const stats = circuitBreaker.getStats();
      statuses.push({
        name,
        state: stats.state,
        failures: stats.failures,
        successes: stats.successes,
        lastFailureTime: stats.lastFailureTime
      });
    }

    return statuses;
  }

  /**
   * Get recent error reports
   */
  getRecentErrors(limit: number = 50): ErrorReport[] {
    return this.errorReports
      .slice(-limit)
      .reverse(); // Most recent first
  }

  /**
   * Resolve error report
   */
  resolveError(reportId: string, resolution?: string): boolean {
    const report = this.errorReports.find(r => r.id === reportId);
    if (report && !report.resolved) {
      report.resolved = true;
      report.resolutionTime = new Date();
      if (resolution) {
        report.tags.push(`resolution:${resolution}`);
      }
      
      this.emit('error_resolved', report);
      return true;
    }
    
    return false;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker) {
      circuitBreaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Get comprehensive error health report
   */
  getHealthReport(): {
    overall: 'healthy' | 'warning' | 'critical';
    score: number; // 0-100
    issues: string[];
    metrics: {
      errorRate: number;
      criticalErrors: number;
      openCircuitBreakers: number;
      activeRetries: number;
      mttr: number;
    };
    recommendations: string[];
  } {
    const stats = this.getErrorStatistics();
    const circuitBreakers = this.getCircuitBreakerStatus();
    const activeRetries = this.retryManager.getActiveRetries();
    
    let score = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    const recentErrors = this.errorReports.filter(
      r => r.context.timestamp.getTime() > Date.now() - 60 * 60 * 1000 // Last hour
    );
    
    if (recentErrors.length > 100) {
      score -= 30;
      issues.push('High error rate');
      recommendations.push('Investigate root cause of frequent errors');
    }

    // Check critical errors
    const criticalErrors = recentErrors.filter(r => r.classification.severity === 'critical');
    if (criticalErrors.length > 0) {
      score -= 40;
      issues.push(`${criticalErrors.length} critical errors`);
      recommendations.push('Address critical errors immediately');
    }

    // Check circuit breakers
    const openCircuitBreakers = circuitBreakers.filter(cb => cb.state === CircuitBreakerState.OPEN);
    if (openCircuitBreakers.length > 0) {
      score -= 25;
      issues.push(`${openCircuitBreakers.length} open circuit breakers`);
      recommendations.push('Fix services with open circuit breakers');
    }

    // Check active retries
    if (activeRetries.length > 10) {
      score -= 15;
      issues.push('Many active retry operations');
      recommendations.push('Monitor retry patterns for optimization opportunities');
    }

    score = Math.max(0, score);

    let overall: 'healthy' | 'warning' | 'critical';
    if (score >= 80) overall = 'healthy';
    else if (score >= 60) overall = 'warning';
    else overall = 'critical';

    return {
      overall,
      score,
      issues,
      metrics: {
        errorRate: recentErrors.length,
        criticalErrors: criticalErrors.length,
        openCircuitBreakers: openCircuitBreakers.length,
        activeRetries: activeRetries.length,
        mttr: stats.mttr
      },
      recommendations
    };
  }
}

/**
 * Utility functions for common retry configurations
 */
export const RetryConfigs = {
  // Quick operations with fast retry
  fast: {
    maxRetries: 3,
    initialDelay: 100,
    maxDelay: 1000,
    backoffFactor: 2,
    jitter: true
  } as RetryConfig,

  // Standard API operations
  standard: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true
  } as RetryConfig,

  // Long operations with patient retry
  patient: {
    maxRetries: 10,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffFactor: 1.5,
    jitter: true
  } as RetryConfig,

  // Network operations
  network: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error, attempt) => {
      const classification = ErrorClassifier.classify(error);
      return classification.type === 'network' || classification.type === 'timeout';
    }
  } as RetryConfig,

  // Database operations
  database: {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error, attempt) => {
      const classification = ErrorClassifier.classify(error);
      return classification.retryable && classification.category === 'database';
    }
  } as RetryConfig
};

/**
 * Factory function
 */
export function createErrorManager(): EnterpriseErrorManager {
  return new EnterpriseErrorManager();
}

// Export singleton instance
export const errorManager = createErrorManager();