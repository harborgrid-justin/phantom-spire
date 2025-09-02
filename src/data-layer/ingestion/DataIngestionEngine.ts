/**
 * Fortune 100-Grade Data Ingestion Engine
 * Enterprise-level data ingestion orchestrator for competitive cyber threat intelligence
 */

import { logger } from '../../utils/logger.js';
import { EventEmitter } from 'events';
import {
  IDataPipeline,
  IPipelineMetrics,
  IDataConnector,
} from '../interfaces/IDataConnector.js';
import { MessageQueueManager } from '../../message-queue/core/MessageQueueManager.js';
import { DataIngestionMessageProducer } from '../../message-queue/producers/MessageProducers.js';

export interface IIngestionConfig {
  // Core Configuration
  maxConcurrentPipelines: number;
  defaultBatchSize: number;
  retryAttempts: number;
  retryBackoffMs: number;

  // Performance Tuning
  memoryLimitMB: number;
  processingTimeoutMs: number;
  enableParallelProcessing: boolean;

  // Quality Assurance
  enableDataValidation: boolean;
  enableDuplicateDetection: boolean;
  validationRules: IValidationRuleSet[];

  // Monitoring
  enableMetrics: boolean;
  metricsIntervalMs: number;
  alertThresholds: IAlertThresholds;

  // Security
  enableEncryption: boolean;
  auditLevel: 'minimal' | 'standard' | 'comprehensive';
}

export interface IValidationRuleSet {
  name: string;
  type: 'schema' | 'business' | 'quality';
  rules: IValidationRule[];
  failureAction: 'reject' | 'quarantine' | 'log';
}

export interface IValidationRule {
  field: string;
  operator: 'required' | 'type' | 'range' | 'pattern' | 'custom';
  value?: any;
  customValidator?: (value: any) => boolean;
  message: string;
}

export interface IAlertThresholds {
  errorRate: number; // percentage
  processingLatency: number; // milliseconds
  memoryUsage: number; // percentage
  queueDepth: number; // number of messages
}

export interface IIngestionMetrics {
  totalRecordsProcessed: number;
  recordsPerSecond: number;
  errorRate: number;
  averageLatency: number;
  memoryUsageMB: number;
  activePipelines: number;
  queueDepth: number;
  lastUpdated: Date;
}

export interface IIngestionSource {
  id: string;
  name: string;
  type: 'stix' | 'misp' | 'json' | 'xml' | 'csv' | 'rss' | 'api' | 'stream';
  connector: IDataConnector;
  config: Record<string, any>;
  schedule?: ICronSchedule;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ICronSchedule {
  expression: string;
  timezone?: string;
  enabled: boolean;
}

export interface IIngestionJob {
  id: string;
  sourceId: string;
  pipeline: IDataPipeline;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metrics?: IPipelineMetrics;
  errors?: string[];
}

export class DataIngestionEngine extends EventEmitter {
  private config: IIngestionConfig;
  private sources: Map<string, IIngestionSource> = new Map();
  private jobs: Map<string, IIngestionJob> = new Map();
  private runningPipelines: Map<string, IDataPipeline> = new Map();
  private metrics: IIngestionMetrics;
  private messageQueueManager: MessageQueueManager;
  private isRunning = false;
  private metricsInterval?: NodeJS.Timeout;

  constructor(
    config: IIngestionConfig,
    messageQueueManager: MessageQueueManager
  ) {
    super();
    this.config = config;
    this.messageQueueManager = messageQueueManager;

    this.metrics = {
      totalRecordsProcessed: 0,
      recordsPerSecond: 0,
      errorRate: 0,
      averageLatency: 0,
      memoryUsageMB: 0,
      activePipelines: 0,
      queueDepth: 0,
      lastUpdated: new Date(),
    };

    // Initialize error handling
    this.setupErrorHandling();

    // Initialize metrics collection
    if (config.enableMetrics) {
      this.setupMetricsCollection();
    }

    logger.info('DataIngestionEngine initialized', {
      maxConcurrentPipelines: config.maxConcurrentPipelines,
      enableMetrics: config.enableMetrics,
      auditLevel: config.auditLevel,
    });
  }

  /**
   * Start the ingestion engine
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('DataIngestionEngine is already running');
      return;
    }

    try {
      this.isRunning = true;

      // Start metrics collection if enabled
      if (this.config.enableMetrics && !this.metricsInterval) {
        this.metricsInterval = setInterval(
          () => this.collectMetrics(),
          this.config.metricsIntervalMs
        );
      }

      // Initialize message queue connections
      // await this.messageQueueManager.initialize();

      // Start processing queue
      this.startJobProcessor();

      this.emit('started');
      logger.info('DataIngestionEngine started successfully');
    } catch (error) {
      this.isRunning = false;
      const errorMessage = `Failed to start DataIngestionEngine: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the ingestion engine gracefully
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('DataIngestionEngine is not running');
      return;
    }

    try {
      this.isRunning = false;

      // Stop metrics collection
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }

      // Cancel running pipelines gracefully
      await this.cancelAllRunningJobs();

      // Disconnect from message queue
      // await this.messageQueueManager.disconnect();

      this.emit('stopped');
      logger.info('DataIngestionEngine stopped successfully');
    } catch (error) {
      const errorMessage = `Error during DataIngestionEngine shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Register a data source for ingestion
   */
  public async registerSource(source: IIngestionSource): Promise<void> {
    try {
      // Validate source configuration
      await this.validateSourceConfig(source);

      this.sources.set(source.id, source);

      logger.info('Data source registered', {
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        priority: source.priority,
      });

      this.emit('sourceRegistered', source);
    } catch (error) {
      const errorMessage = `Failed to register data source ${source.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Unregister a data source
   */
  public async unregisterSource(sourceId: string): Promise<void> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }

    // Cancel any running jobs for this source
    await this.cancelJobsBySource(sourceId);

    this.sources.delete(sourceId);

    logger.info('Data source unregistered', { sourceId });
    this.emit('sourceUnregistered', sourceId);
  }

  /**
   * Submit an ingestion job
   */
  public async submitJob(
    sourceId: string,
    pipeline: IDataPipeline,
    priority: number = 5
  ): Promise<string> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }

    if (!source.isActive) {
      throw new Error(`Data source ${sourceId} is not active`);
    }

    const jobId = this.generateJobId();
    const job: IIngestionJob = {
      id: jobId,
      sourceId,
      pipeline,
      status: 'pending',
      priority,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    logger.info('Ingestion job submitted', {
      jobId,
      sourceId,
      pipelineName: pipeline.name,
      priority,
    });

    this.emit('jobSubmitted', job);

    // Trigger job processing
    setImmediate(() => this.processNextJob());

    return jobId;
  }

  /**
   * Get current ingestion metrics
   */
  public getMetrics(): IIngestionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get job status
   */
  public getJobStatus(jobId: string): IIngestionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * List all registered sources
   */
  public listSources(): IIngestionSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * List active jobs
   */
  public listActiveJobs(): IIngestionJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.status === 'pending' || job.status === 'running'
    );
  }

  /**
   * Private helper methods
   */

  private setupErrorHandling(): void {
    this.on('error', error => {
      logger.error('DataIngestionEngine error', error);

      if (this.config.auditLevel === 'comprehensive') {
        // Log detailed audit information
        logger.info('Ingestion engine error audit', {
          error: error.message,
          stack: error.stack,
          metrics: this.metrics,
          activeJobs: this.listActiveJobs().length,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  private setupMetricsCollection(): void {
    logger.info('Setting up metrics collection', {
      intervalMs: this.config.metricsIntervalMs,
    });
  }

  private async collectMetrics(): Promise<void> {
    try {
      const startTime = Date.now();

      // Collect basic metrics
      this.metrics.activePipelines = this.runningPipelines.size;
      this.metrics.memoryUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
      this.metrics.lastUpdated = new Date();

      // Check thresholds and emit alerts if needed
      await this.checkAlertThresholds();

      const collectionTime = Date.now() - startTime;
      logger.debug('Metrics collection completed', {
        collectionTimeMs: collectionTime,
      });
    } catch (error) {
      logger.error('Failed to collect metrics', error);
    }
  }

  private async checkAlertThresholds(): Promise<void> {
    const { alertThresholds } = this.config;

    if (this.metrics.errorRate > alertThresholds.errorRate) {
      this.emit('alert', {
        type: 'errorRate',
        message: `Error rate ${this.metrics.errorRate}% exceeds threshold ${alertThresholds.errorRate}%`,
        severity: 'warning',
      });
    }

    if (this.metrics.averageLatency > alertThresholds.processingLatency) {
      this.emit('alert', {
        type: 'latency',
        message: `Processing latency ${this.metrics.averageLatency}ms exceeds threshold ${alertThresholds.processingLatency}ms`,
        severity: 'warning',
      });
    }
  }

  private async validateSourceConfig(source: IIngestionSource): Promise<void> {
    if (!source.id || !source.name || !source.connector) {
      throw new Error('Invalid source configuration: missing required fields');
    }

    if (this.sources.has(source.id)) {
      throw new Error(`Data source with ID ${source.id} already exists`);
    }

    // Validate connector health
    try {
      const health = await source.connector.healthCheck();
      if (health.responseTime !== undefined && health.responseTime > 5000) {
        throw new Error(
          `Source connector health check slow: ${health.responseTime}ms`
        );
      }
    } catch (error) {
      logger.warn('Source connector health check failed during registration', {
        sourceId: source.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private startJobProcessor(): void {
    // This will be implemented to process jobs from the queue
    logger.debug('Job processor started');
  }

  private async processNextJob(): Promise<void> {
    // Implementation for processing the next pending job
    logger.debug('Processing next job');
  }

  private async cancelAllRunningJobs(): Promise<void> {
    const runningJobs = Array.from(this.jobs.values()).filter(
      job => job.status === 'running'
    );

    for (const job of runningJobs) {
      try {
        job.status = 'cancelled';
        this.emit('jobCancelled', job);
        logger.info('Job cancelled during shutdown', { jobId: job.id });
      } catch (error) {
        logger.error('Failed to cancel job during shutdown', {
          jobId: job.id,
          error,
        });
      }
    }
  }

  private async cancelJobsBySource(sourceId: string): Promise<void> {
    const sourceJobs = Array.from(this.jobs.values()).filter(
      job => job.sourceId === sourceId
    );

    for (const job of sourceJobs) {
      if (job.status === 'pending' || job.status === 'running') {
        job.status = 'cancelled';
        this.emit('jobCancelled', job);
        logger.info('Job cancelled due to source unregistration', {
          jobId: job.id,
          sourceId,
        });
      }
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
