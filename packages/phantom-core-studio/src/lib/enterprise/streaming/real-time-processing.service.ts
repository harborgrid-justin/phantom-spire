/**
 * Real-time Processing Pipeline Service
 * High-performance streaming ML predictions with enterprise-grade reliability
 * Supports batch processing, real-time monitoring, alerting, and event processing
 */

import { EventEmitter } from 'events';
import { mlCoreManager } from '../../../../lib/ml-core';
import { persistenceService } from '../../persistence/enterprise-persistence.service';

// ==================== STREAMING TYPES ====================

export interface StreamConfig {
  streamId: string;
  modelId: string;
  inputFormat: 'json' | 'avro' | 'protobuf' | 'csv';
  outputFormat: 'json' | 'avro' | 'protobuf' | 'csv';
  batchSize: number;
  windowSize: number; // milliseconds
  watermarkInterval: number; // milliseconds
  parallelism: number;
  backpressureStrategy: 'drop' | 'buffer' | 'throttle';
  checkpointInterval: number;
  retention: number; // milliseconds
}

export interface StreamMetrics {
  streamId: string;
  timestamp: Date;
  throughput: number; // records/second
  latency: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
  };
  errors: {
    count: number;
    rate: number;
    types: Record<string, number>;
  };
  backpressure: {
    active: boolean;
    level: number; // 0-100%
    strategy: string;
  };
  memory: {
    used: number;
    available: number;
    bufferSize: number;
  };
  predictions: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface BatchJob {
  jobId: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    processed: number;
    errors: number;
    percentage: number;
  };
  performance: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    throughput?: number;
  };
  config: {
    batchSize: number;
    parallelism: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential';
      initialDelay: number;
    };
  };
  results: {
    outputPath?: string;
    summary?: Record<string, unknown>;
    errorLog?: string;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    timeWindow: number; // milliseconds
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: Array<{
    type: 'email' | 'webhook' | 'slack' | 'pagerduty';
    config: Record<string, unknown>;
  }>;
  cooldown: number; // milliseconds to prevent spam
  lastTriggered?: Date;
}

export interface EventProcessorConfig {
  processorId: string;
  eventTypes: string[];
  filters: Record<string, unknown>;
  transformations: Array<{
    type: 'map' | 'filter' | 'aggregate' | 'enrich';
    config: Record<string, unknown>;
  }>;
  sinks: Array<{
    type: 'kafka' | 'webhook' | 'database' | 'file';
    config: Record<string, unknown>;
  }>;
  bufferSize: number;
  flushInterval: number;
}

// ==================== STREAM PROCESSING ENGINE ====================

export class StreamProcessor extends EventEmitter {
  private streamId: string;
  private config: StreamConfig;
  private isRunning = false;
  private buffer: Array<{ data: unknown; timestamp: number; id: string }> = [];
  private metrics: StreamMetrics;
  private lastCheckpoint = Date.now();
  private intervalId?: NodeJS.Timeout;

  constructor(config: StreamConfig) {
    super();
    this.streamId = config.streamId;
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): StreamMetrics {
    return {
      streamId: this.streamId,
      timestamp: new Date(),
      throughput: 0,
      latency: { p50: 0, p95: 0, p99: 0, avg: 0 },
      errors: { count: 0, rate: 0, types: {} },
      backpressure: { active: false, level: 0, strategy: this.config.backpressureStrategy },
      memory: { used: 0, available: 0, bufferSize: 0 },
      predictions: { total: 0, successful: 0, failed: 0 }
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error(`Stream ${this.streamId} is already running`);
    }

    this.isRunning = true;
    this.emit('started', { streamId: this.streamId, timestamp: new Date() });

    // Start processing interval
    this.intervalId = setInterval(() => {
      this.processBuffer();
    }, this.config.windowSize);

    console.log(`🚀 Stream processor ${this.streamId} started`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Process remaining buffer
    if (this.buffer.length > 0) {
      await this.processBuffer();
    }

    this.emit('stopped', { streamId: this.streamId, timestamp: new Date() });
    console.log(`⏹️  Stream processor ${this.streamId} stopped`);
  }

  async ingest(data: unknown): Promise<void> {
    if (!this.isRunning) {
      throw new Error(`Stream ${this.streamId} is not running`);
    }

    // Check backpressure
    if (this.buffer.length >= this.config.batchSize * 2) {
      this.handleBackpressure();
    }

    // Add to buffer with timestamp
    this.buffer.push({
      data,
      timestamp: Date.now(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Process if buffer is full
    if (this.buffer.length >= this.config.batchSize) {
      await this.processBuffer();
    }
  }

  private handleBackpressure(): void {
    const bufferUtilization = this.buffer.length / (this.config.batchSize * 2);
    this.metrics.backpressure.active = true;
    this.metrics.backpressure.level = Math.round(bufferUtilization * 100);

    switch (this.config.backpressureStrategy) {
      case 'drop':
        // Drop oldest records
        const dropCount = Math.floor(this.buffer.length * 0.1);
        this.buffer.splice(0, dropCount);
        this.emit('backpressure', { strategy: 'drop', count: dropCount });
        break;

      case 'buffer':
        // Allow buffer to grow but emit warning
        this.emit('backpressure', { strategy: 'buffer', level: bufferUtilization });
        break;

      case 'throttle':
        // Delay processing
        this.emit('backpressure', { strategy: 'throttle', delay: 100 });
        break;
    }
  }

  private async processBuffer(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer.splice(0, this.config.batchSize);
    const startTime = Date.now();

    try {
      // Process batch in parallel
      const promises = batch.map(item => this.processSingleItem(item));
      const results = await Promise.allSettled(promises);

      // Update metrics
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.metrics.predictions.total += batch.length;
      this.metrics.predictions.successful += successful;
      this.metrics.predictions.failed += failed;

      const endTime = Date.now();
      const latency = endTime - startTime;
      this.updateLatencyMetrics(latency);

      // Emit processing events
      this.emit('batch_processed', {
        batchSize: batch.length,
        successful,
        failed,
        latency,
        timestamp: new Date()
      });

      // Handle failed items
      const failedItems = results
        .map((result, index) => ({ result, item: batch[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ item }) => item);

      if (failedItems.length > 0) {
        this.handleFailedItems(failedItems);
      }

    } catch (error) {
      console.error(`Error processing batch in stream ${this.streamId}:`, error);
      this.emit('error', { error, batchSize: batch.length });
    }

    // Update backpressure status
    if (this.buffer.length < this.config.batchSize) {
      this.metrics.backpressure.active = false;
      this.metrics.backpressure.level = 0;
    }

    // Checkpoint if needed
    if (Date.now() - this.lastCheckpoint >= this.config.checkpointInterval) {
      await this.checkpoint();
    }
  }

  private async processSingleItem(item: { data: unknown; timestamp: number; id: string }): Promise<{
    id: string;
    timestamp: number;
    prediction: unknown;
    processingTime: number;
  }> {
    try {
      const prediction = await mlCoreManager.getPredictions(
        this.config.modelId,
        JSON.stringify(item.data)
      );

      const result = {
        id: item.id,
        timestamp: item.timestamp,
        prediction,
        processingTime: Date.now() - item.timestamp
      };

      this.emit('prediction', result);
      return result;

    } catch (error) {
      this.emit('prediction_error', { item, error });
      throw error;
    }
  }

  private updateLatencyMetrics(latency: number): void {
    // Simple latency tracking - in production, use proper percentile calculation
    this.metrics.latency.avg = (this.metrics.latency.avg + latency) / 2;
    this.metrics.latency.p50 = latency; // Simplified
    this.metrics.latency.p95 = latency * 1.2; // Simplified
    this.metrics.latency.p99 = latency * 1.5; // Simplified
  }

  private async handleFailedItems(failedItems: unknown[]): Promise<void> {
    // Implement retry logic or dead letter queue
    this.emit('failed_items', { count: failedItems.length, items: failedItems });
  }

  private async checkpoint(): Promise<void> {
    try {
      await persistenceService.saveMetrics({
        id: `stream_metrics_${this.streamId}_${Date.now()}`,
        timestamp: new Date(),
        type: 'system',
        metrics: {
          throughput: this.metrics.throughput,
          latency_avg: this.metrics.latency.avg,
          predictions_total: this.metrics.predictions.total,
          predictions_successful: this.metrics.predictions.successful,
          predictions_failed: this.metrics.predictions.failed
        },
        dimensions: {
          streamId: this.streamId,
          modelId: this.config.modelId
        },
        aggregationLevel: 'raw'
      });

      this.lastCheckpoint = Date.now();
      this.emit('checkpoint', { timestamp: new Date() });

    } catch (error) {
      console.warn('Failed to checkpoint stream metrics:', error);
    }
  }

  getMetrics(): StreamMetrics {
    this.metrics.timestamp = new Date();
    this.metrics.memory.bufferSize = this.buffer.length;
    this.metrics.throughput = this.calculateThroughput();
    return { ...this.metrics };
  }

  private calculateThroughput(): number {
    // Calculate records per second over last minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentPredictions = this.buffer.filter(item => item.timestamp > oneMinuteAgo);
    return recentPredictions.length / 60; // per second
  }
}

// ==================== BATCH PROCESSING ENGINE ====================

export class BatchProcessor extends EventEmitter {
  private jobs: Map<string, BatchJob> = new Map();
  private isRunning = false;
  private processingQueue: string[] = [];

  async submitJob(jobConfig: {
    modelId: string;
    dataPath: string;
    outputPath: string;
    batchSize?: number;
    parallelism?: number;
  }): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: BatchJob = {
      jobId,
      modelId: jobConfig.modelId,
      status: 'queued',
      progress: {
        total: 0,
        processed: 0,
        errors: 0,
        percentage: 0
      },
      performance: {
        startTime: new Date()
      },
      config: {
        batchSize: jobConfig.batchSize || 1000,
        parallelism: jobConfig.parallelism || 4,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000
        }
      },
      results: {
        outputPath: jobConfig.outputPath
      }
    };

    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);

    this.emit('job_submitted', { jobId, timestamp: new Date() });

    if (!this.isRunning) {
      this.startProcessing();
    }

    return jobId;
  }

  private async startProcessing(): Promise<void> {
    this.isRunning = true;

    while (this.processingQueue.length > 0) {
      const jobId = this.processingQueue.shift()!;
      await this.processJob(jobId);
    }

    this.isRunning = false;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return;
    }

    try {
      job.status = 'running';
      job.performance.startTime = new Date();

      this.emit('job_started', { jobId, timestamp: new Date() });

      // Simulate batch processing
      // In a real implementation, this would read from dataPath and process in batches
      const totalRecords = 10000; // Would be determined from input data
      job.progress.total = totalRecords;

      for (let i = 0; i < totalRecords; i += job.config.batchSize) {
        const batchEnd = Math.min(i + job.config.batchSize, totalRecords);
        const batchSize = batchEnd - i;

        // Process batch
        try {
          await this.processBatch(job.modelId, batchSize);
          job.progress.processed += batchSize;
        } catch (error) {
          job.progress.errors += batchSize;
          console.warn(`Batch processing error for job ${jobId}:`, error);
        }

        job.progress.percentage = Math.round((job.progress.processed / totalRecords) * 100);

        this.emit('job_progress', {
          jobId,
          progress: job.progress,
          timestamp: new Date()
        });

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      job.status = 'completed';
      job.performance.endTime = new Date();
      job.performance.duration = job.performance.endTime.getTime() - job.performance.startTime.getTime();
      job.performance.throughput = job.progress.processed / (job.performance.duration / 1000);

      this.emit('job_completed', { jobId, job, timestamp: new Date() });

    } catch (error) {
      job.status = 'failed';
      job.results.errorLog = error instanceof Error ? error.message : 'Unknown error';

      this.emit('job_failed', { jobId, error, timestamp: new Date() });
    }
  }

  private async processBatch(modelId: string, batchSize: number): Promise<void> {
    // Simulate batch prediction processing
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      promises.push(
        mlCoreManager.getPredictions(modelId, JSON.stringify([Math.random(), Math.random()]))
      );
    }

    await Promise.allSettled(promises);
  }

  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  listJobs(): BatchJob[] {
    return Array.from(this.jobs.values());
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.status === 'running') {
      job.status = 'cancelled';
      this.emit('job_cancelled', { jobId, timestamp: new Date() });
      return true;
    }

    return false;
  }
}

// ==================== ALERTING ENGINE ====================

export class AlertEngine extends EventEmitter {
  private rules: Map<string, AlertRule> = new Map();
  private metricHistory: Map<string, Array<{ value: number; timestamp: Date }>> = new Map();
  private cooldownTimers: Map<string, NodeJS.Timeout> = new Map();

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule_added', { ruleId: rule.id, timestamp: new Date() });
  }

  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      this.emit('rule_removed', { ruleId, timestamp: new Date() });
    }
    return removed;
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    Object.assign(rule, updates);
    this.emit('rule_updated', { ruleId, timestamp: new Date() });
    return true;
  }

  async checkMetric(metric: string, value: number): Promise<void> {
    const timestamp = new Date();

    // Store metric value
    if (!this.metricHistory.has(metric)) {
      this.metricHistory.set(metric, []);
    }

    const history = this.metricHistory.get(metric)!;
    history.push({ value, timestamp });

    // Keep only recent history
    const cutoff = new Date(Date.now() - 300000); // 5 minutes
    this.metricHistory.set(metric, history.filter(h => h.timestamp > cutoff));

    // Check all rules for this metric
    for (const rule of this.rules.values()) {
      if (rule.enabled && rule.condition.metric === metric) {
        await this.evaluateRule(rule, value, timestamp);
      }
    }
  }

  private async evaluateRule(rule: AlertRule, value: number, timestamp: Date): Promise<void> {
    // Check if rule is in cooldown
    if (this.isInCooldown(rule.id)) {
      return;
    }

    let triggered = false;

    switch (rule.condition.operator) {
      case 'gt':
        triggered = value > rule.condition.threshold;
        break;
      case 'lt':
        triggered = value < rule.condition.threshold;
        break;
      case 'eq':
        triggered = value === rule.condition.threshold;
        break;
      case 'ne':
        triggered = value !== rule.condition.threshold;
        break;
      case 'gte':
        triggered = value >= rule.condition.threshold;
        break;
      case 'lte':
        triggered = value <= rule.condition.threshold;
        break;
    }

    if (triggered) {
      await this.triggerAlert(rule, value, timestamp);
    }
  }

  private async triggerAlert(rule: AlertRule, value: number, timestamp: Date): Promise<void> {
    rule.lastTriggered = timestamp;

    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      metric: rule.condition.metric,
      value,
      threshold: rule.condition.threshold,
      timestamp,
      description: rule.description
    };

    this.emit('alert_triggered', alert);

    // Execute alert actions
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, alert);
      } catch (error) {
        console.error(`Failed to execute alert action ${action.type}:`, error);
      }
    }

    // Set cooldown
    if (rule.cooldown > 0) {
      this.setCooldown(rule.id, rule.cooldown);
    }

    // Save alert to persistence
    try {
      await persistenceService.saveAuditLog({
        id: `alert_${rule.id}_${Date.now()}`,
        timestamp,
        userId: 'system',
        action: 'alert_triggered',
        resource: 'alert_rule',
        resourceId: rule.id,
        details: alert,
        ipAddress: 'system',
        userAgent: 'alert_engine',
        sessionId: 'system',
        result: 'success',
        riskLevel: rule.severity === 'critical' ? 'critical' : 'medium',
        complianceFrameworks: ['internal'],
        retention: new Date(Date.now() + 31536000000) // 1 year
      });
    } catch (error) {
      console.warn('Failed to save alert to audit log:', error);
    }
  }

  private async executeAction(action: {
    type: 'email' | 'webhook' | 'slack' | 'pagerduty';
    config: Record<string, unknown>;
  }, alert: {
    ruleId: string;
    ruleName: string;
    severity: string;
    metric: string;
    value: number;
    threshold: number;
    timestamp: Date;
    description: string;
  }): Promise<void> {
    switch (action.type) {
      case 'email':
        // Would implement email sending
        console.log(`Email alert: ${alert.ruleName}`);
        break;
      case 'webhook':
        // Would implement webhook call
        console.log(`Webhook alert: ${alert.ruleName}`);
        break;
      case 'slack':
        // Would implement Slack notification
        console.log(`Slack alert: ${alert.ruleName}`);
        break;
      case 'pagerduty':
        // Would implement PagerDuty integration
        console.log(`PagerDuty alert: ${alert.ruleName}`);
        break;
    }
  }

  private isInCooldown(ruleId: string): boolean {
    return this.cooldownTimers.has(ruleId);
  }

  private setCooldown(ruleId: string, duration: number): void {
    const timer = setTimeout(() => {
      this.cooldownTimers.delete(ruleId);
    }, duration);

    this.cooldownTimers.set(ruleId, timer);
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId);
  }
}

// ==================== REAL-TIME PROCESSING SERVICE ====================

export class RealTimeProcessingService extends EventEmitter {
  private streamProcessors: Map<string, StreamProcessor> = new Map();
  private batchProcessor: BatchProcessor;
  private alertEngine: AlertEngine;
  private isInitialized = false;

  constructor() {
    super();
    this.batchProcessor = new BatchProcessor();
    this.alertEngine = new AlertEngine();
  }

  async initialize(): Promise<void> {
    try {
      // Set up default alert rules
      this.setupDefaultAlertRules();

      // Set up event forwarding
      this.setupEventForwarding();

      this.isInitialized = true;
      this.emit('initialized');
      console.log('✅ Real-time Processing Service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize real-time processing service:', error);
      throw error;
    }
  }

  private setupDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds 5%',
        enabled: true,
        condition: {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 0.05,
          timeWindow: 300000 // 5 minutes
        },
        severity: 'high',
        actions: [
          { type: 'webhook', config: { url: 'http://localhost:3000/api/alerts' } }
        ],
        cooldown: 300000 // 5 minutes
      },
      {
        id: 'high_latency',
        name: 'High Latency',
        description: 'Alert when average latency exceeds 100ms',
        enabled: true,
        condition: {
          metric: 'latency_avg',
          operator: 'gt',
          threshold: 100,
          timeWindow: 300000
        },
        severity: 'medium',
        actions: [
          { type: 'webhook', config: { url: 'http://localhost:3000/api/alerts' } }
        ],
        cooldown: 600000 // 10 minutes
      }
    ];

    defaultRules.forEach(rule => this.alertEngine.addRule(rule));
  }

  private setupEventForwarding(): void {
    // Forward batch processor events
    this.batchProcessor.on('job_completed', (event) => {
      this.emit('batch_job_completed', event);
    });

    this.batchProcessor.on('job_failed', (event) => {
      this.emit('batch_job_failed', event);
    });

    // Forward alert engine events
    this.alertEngine.on('alert_triggered', (alert) => {
      this.emit('alert_triggered', alert);
    });
  }

  async createStream(config: StreamConfig): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    if (this.streamProcessors.has(config.streamId)) {
      throw new Error(`Stream ${config.streamId} already exists`);
    }

    const processor = new StreamProcessor(config);

    // Set up event forwarding
    processor.on('batch_processed', (event) => {
      this.emit('stream_batch_processed', { streamId: config.streamId, ...event });

      // Check metrics for alerts
      const metrics = processor.getMetrics();
      this.alertEngine.checkMetric('error_rate', metrics.errors.rate);
      this.alertEngine.checkMetric('latency_avg', metrics.latency.avg);
    });

    processor.on('error', (event) => {
      this.emit('stream_error', { streamId: config.streamId, ...event });
    });

    this.streamProcessors.set(config.streamId, processor);
    this.emit('stream_created', { streamId: config.streamId, timestamp: new Date() });

    return config.streamId;
  }

  async startStream(streamId: string): Promise<void> {
    const processor = this.streamProcessors.get(streamId);
    if (!processor) {
      throw new Error(`Stream ${streamId} not found`);
    }

    await processor.start();
    this.emit('stream_started', { streamId, timestamp: new Date() });
  }

  async stopStream(streamId: string): Promise<void> {
    const processor = this.streamProcessors.get(streamId);
    if (!processor) {
      throw new Error(`Stream ${streamId} not found`);
    }

    await processor.stop();
    this.emit('stream_stopped', { streamId, timestamp: new Date() });
  }

  async ingestData(streamId: string, data: unknown): Promise<void> {
    const processor = this.streamProcessors.get(streamId);
    if (!processor) {
      throw new Error(`Stream ${streamId} not found`);
    }

    await processor.ingest(data);
  }

  getStreamMetrics(streamId: string): StreamMetrics | null {
    const processor = this.streamProcessors.get(streamId);
    return processor ? processor.getMetrics() : null;
  }

  getAllStreamMetrics(): Record<string, StreamMetrics> {
    const metrics: Record<string, StreamMetrics> = {};
    for (const [streamId, processor] of this.streamProcessors.entries()) {
      metrics[streamId] = processor.getMetrics();
    }
    return metrics;
  }

  async submitBatchJob(config: {
    modelId: string;
    dataPath: string;
    outputPath: string;
    batchSize?: number;
    parallelism?: number;
  }): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    return this.batchProcessor.submitJob(config);
  }

  getBatchJob(jobId: string): BatchJob | undefined {
    return this.batchProcessor.getJob(jobId);
  }

  listBatchJobs(): BatchJob[] {
    return this.batchProcessor.listJobs();
  }

  async cancelBatchJob(jobId: string): Promise<boolean> {
    return this.batchProcessor.cancelJob(jobId);
  }

  addAlertRule(rule: AlertRule): void {
    this.alertEngine.addRule(rule);
  }

  removeAlertRule(ruleId: string): boolean {
    return this.alertEngine.removeRule(ruleId);
  }

  getAlertRules(): AlertRule[] {
    return this.alertEngine.getRules();
  }

  async checkMetric(metric: string, value: number): Promise<void> {
    await this.alertEngine.checkMetric(metric, value);
  }

  async cleanup(): Promise<void> {
    // Stop all streams
    for (const [streamId, processor] of this.streamProcessors.entries()) {
      try {
        await processor.stop();
      } catch (error) {
        console.warn(`Error stopping stream ${streamId}:`, error);
      }
    }

    this.streamProcessors.clear();
    this.isInitialized = false;
    this.emit('cleanup');
  }
}

// Export singleton instance
export const realTimeProcessingService = new RealTimeProcessingService();
export default realTimeProcessingService;
