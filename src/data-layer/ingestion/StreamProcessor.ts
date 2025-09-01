/**
 * Stream Processor for Real-Time Data Ingestion
 * Handles high-velocity threat intelligence data streams with backpressure and fault tolerance
 */

import { logger } from '../../utils/logger.js';
import { EventEmitter } from 'events';
import { Transform, Readable, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import {
  IDataPipeline,
  IPipelineResult,
  IDataConnector,
} from '../interfaces/IDataConnector.js';
import { IDataRecord } from '../interfaces/IDataSource.js';

const pipelineAsync = promisify(pipeline);

export interface IStreamConfig {
  // Stream Configuration
  maxConcurrentStreams: number;
  bufferSize: number;
  backpressureThreshold: number;
  flushIntervalMs: number;
  
  // Processing Options
  enableBatching: boolean;
  batchSize: number;
  batchTimeoutMs: number;
  
  // Error Handling
  maxRetries: number;
  retryBackoffMs: number;
  deadLetterQueueSize: number;
  
  // Performance Tuning
  enableCompression: boolean;
  enableDeduplication: boolean;
  deduplicationWindowMs: number;
  
  // Monitoring
  enableMetrics: boolean;
  metricsIntervalMs: number;
}

export interface IStreamMetrics {
  streamsActive: number;
  recordsProcessed: number;
  recordsPerSecond: number;
  bytesProcessed: number;
  bytesPerSecond: number;
  errorRate: number;
  backpressureEvents: number;
  duplicatesFiltered: number;
  avgProcessingLatency: number;
  bufferUtilization: number;
  lastUpdated: Date;
}

export interface IStreamSource {
  id: string;
  name: string;
  type: 'kafka' | 'redis' | 'webhook' | 'file' | 'tcp' | 'websocket';
  config: Record<string, any>;
  connector?: IDataConnector;
  pipeline?: IDataPipeline;
  isActive: boolean;
  priority: number;
}

export interface IStreamSink {
  id: string;
  name: string;
  type: 'database' | 'queue' | 'file' | 'api' | 'elasticsearch';
  config: Record<string, any>;
  connector?: IDataConnector;
  isActive: boolean;
}

export interface IBatchContext {
  batchId: string;
  size: number;
  startTime: Date;
  source: string;
  metadata: Record<string, any>;
}

export interface IStreamRecord {
  id: string;
  timestamp: Date;
  source: string;
  data: any;
  metadata: Record<string, any>;
  retryCount?: number;
}

export class StreamProcessor extends EventEmitter {
  private config: IStreamConfig;
  private sources: Map<string, IStreamSource> = new Map();
  private sinks: Map<string, IStreamSink> = new Map();
  private activeStreams: Map<string, NodeJS.ReadWriteStream> = new Map();
  private metrics: IStreamMetrics;
  private deduplicationCache: Map<string, number> = new Map();
  private deadLetterQueue: IStreamRecord[] = [];
  private isRunning = false;
  private metricsInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: IStreamConfig) {
    super();
    this.config = config;
    
    this.metrics = {
      streamsActive: 0,
      recordsProcessed: 0,
      recordsPerSecond: 0,
      bytesProcessed: 0,
      bytesPerSecond: 0,
      errorRate: 0,
      backpressureEvents: 0,
      duplicatesFiltered: 0,
      avgProcessingLatency: 0,
      bufferUtilization: 0,
      lastUpdated: new Date(),
    };

    // Initialize cleanup intervals
    if (config.enableDeduplication) {
      this.setupDeduplicationCleanup();
    }

    logger.info('StreamProcessor initialized', {
      maxConcurrentStreams: config.maxConcurrentStreams,
      bufferSize: config.bufferSize,
      enableBatching: config.enableBatching,
      batchSize: config.batchSize,
    });
  }

  /**
   * Start the stream processor
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('StreamProcessor is already running');
      return;
    }

    try {
      this.isRunning = true;

      // Start metrics collection if enabled
      if (this.config.enableMetrics) {
        this.metricsInterval = setInterval(
          () => this.collectMetrics(),
          this.config.metricsIntervalMs
        );
      }

      // Start active streams
      await this.startActiveStreams();

      this.emit('started');
      logger.info('StreamProcessor started successfully');

    } catch (error) {
      this.isRunning = false;
      const errorMessage = `Failed to start StreamProcessor: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the stream processor gracefully
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('StreamProcessor is not running');
      return;
    }

    try {
      this.isRunning = false;

      // Stop metrics collection
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }

      // Stop cleanup intervals
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = undefined;
      }

      // Stop all active streams gracefully
      await this.stopActiveStreams();

      this.emit('stopped');
      logger.info('StreamProcessor stopped successfully');

    } catch (error) {
      const errorMessage = `Error during StreamProcessor shutdown: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Register a stream source
   */
  public async registerSource(source: IStreamSource): Promise<void> {
    try {
      this.sources.set(source.id, source);
      
      if (source.isActive && this.isRunning) {
        await this.startStreamForSource(source);
      }

      logger.info('Stream source registered', {
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        priority: source.priority,
        isActive: source.isActive,
      });

      this.emit('sourceRegistered', source);

    } catch (error) {
      const errorMessage = `Failed to register stream source ${source.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Register a stream sink
   */
  public async registerSink(sink: IStreamSink): Promise<void> {
    try {
      this.sinks.set(sink.id, sink);
      
      logger.info('Stream sink registered', {
        sinkId: sink.id,
        sinkName: sink.name,
        sinkType: sink.type,
        isActive: sink.isActive,
      });

      this.emit('sinkRegistered', sink);

    } catch (error) {
      const errorMessage = `Failed to register stream sink ${sink.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Process a stream from source to sink
   */
  public async processStream(
    sourceId: string,
    sinkId: string,
    dataPipeline?: IDataPipeline
  ): Promise<void> {
    const source = this.sources.get(sourceId);
    const sink = this.sinks.get(sinkId);

    if (!source) {
      throw new Error(`Stream source ${sourceId} not found`);
    }

    if (!sink) {
      throw new Error(`Stream sink ${sinkId} not found`);
    }

    const streamId = `${sourceId}->${sinkId}`;

    if (this.activeStreams.has(streamId)) {
      logger.warn('Stream already active', { streamId });
      return;
    }

    try {
      logger.info('Starting stream processing', {
        streamId,
        sourceType: source.type,
        sinkType: sink.type,
      });

      const sourceStream = await this.createSourceStream(source);
      const transformStream = this.createTransformStream(dataPipeline);
      const sinkStream = await this.createSinkStream(sink);

      // Start the pipeline - use pipeline function directly
      await new Promise<void>((resolve, reject) => {
        pipeline(
          sourceStream,
          this.createDeduplicationTransform(),
          this.createBatchingTransform(), 
          transformStream,
          this.createMetricsTransform(),
          sinkStream,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      logger.info('Stream processing completed', { streamId });
      this.emit('streamCompleted', { streamId, sourceId, sinkId });

    } catch (error) {
      const errorMessage = `Stream processing failed for ${streamId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      this.emit('streamError', { streamId, sourceId, sinkId, error });
      throw error;
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  /**
   * Get current stream metrics
   */
  public getMetrics(): IStreamMetrics {
    return { ...this.metrics };
  }

  /**
   * Get dead letter queue contents
   */
  public getDeadLetterQueue(): IStreamRecord[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Process dead letter queue record
   */
  public async retryDeadLetterRecord(recordId: string): Promise<void> {
    const recordIndex = this.deadLetterQueue.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error(`Dead letter record ${recordId} not found`);
    }

    const record = this.deadLetterQueue[recordIndex];
    record.retryCount = (record.retryCount || 0) + 1;

    try {
      // Attempt to reprocess the record
      await this.processRecord(record);
      
      // Remove from dead letter queue on success
      this.deadLetterQueue.splice(recordIndex, 1);
      
      logger.info('Dead letter record retry succeeded', { recordId });

    } catch (error) {
      if (record.retryCount >= this.config.maxRetries) {
        logger.error('Dead letter record retry limit exceeded', { recordId, retryCount: record.retryCount });
      } else {
        logger.warn('Dead letter record retry failed', { recordId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private async startActiveStreams(): Promise<void> {
    const activeSources = Array.from(this.sources.values()).filter(source => source.isActive);
    
    for (const source of activeSources) {
      try {
        await this.startStreamForSource(source);
      } catch (error) {
        logger.error('Failed to start stream for source', {
          sourceId: source.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private async stopActiveStreams(): Promise<void> {
    const streamPromises = Array.from(this.activeStreams.values()).map(stream => {
      return new Promise<void>((resolve) => {
        if ('destroy' in stream && typeof stream.destroy === 'function') {
          stream.destroy();
        }
        resolve();
      });
    });

    await Promise.all(streamPromises);
    this.activeStreams.clear();
  }

  private async startStreamForSource(source: IStreamSource): Promise<void> {
    // This would be implemented based on specific source types
    // For now, just log the intention
    logger.debug('Starting stream for source', {
      sourceId: source.id,
      sourceType: source.type,
    });
  }

  private async createSourceStream(source: IStreamSource): Promise<Readable> {
    // Factory method to create source streams based on type
    switch (source.type) {
      case 'file':
        return this.createFileSourceStream(source);
      case 'webhook':
        return this.createWebhookSourceStream(source);
      case 'tcp':
        return this.createTCPSourceStream(source);
      default:
        throw new Error(`Unsupported source stream type: ${source.type}`);
    }
  }

  private async createSinkStream(sink: IStreamSink): Promise<Writable> {
    // Factory method to create sink streams based on type
    switch (sink.type) {
      case 'database':
        return this.createDatabaseSinkStream(sink);
      case 'file':
        return this.createFileSinkStream(sink);
      case 'api':
        return this.createAPISinkStream(sink);
      default:
        throw new Error(`Unsupported sink stream type: ${sink.type}`);
    }
  }

  private createTransformStream(pipeline?: IDataPipeline): Transform {
    return new Transform({
      objectMode: true,
      transform: async (record: IStreamRecord, encoding, callback) => {
        try {
          let transformedData = record.data;

          if (pipeline) {
            const result = await pipeline.execute(record.data, {
              sourceId: record.source,
              recordId: record.id,
              timestamp: record.timestamp,
            });
            
            if (result.success) {
              transformedData = result.stages[result.stages.length - 1];
            } else {
              throw new Error(`Pipeline execution failed: ${result.errors?.join(', ')}`);
            }
          }

          const transformedRecord: IStreamRecord = {
            ...record,
            data: transformedData,
          };

          callback(null, transformedRecord);

        } catch (error) {
          logger.error('Transform stream error', {
            recordId: record.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          callback(error);
        }
      },
    });
  }

  private createDeduplicationTransform(): Transform {
    if (!this.config.enableDeduplication) {
      return new Transform({ objectMode: true, transform: (chunk, encoding, callback) => callback(null, chunk) });
    }

    return new Transform({
      objectMode: true,
      transform: (record: IStreamRecord, encoding, callback) => {
        const recordHash = this.generateRecordHash(record);
        const now = Date.now();
        
        if (this.deduplicationCache.has(recordHash)) {
          this.metrics.duplicatesFiltered++;
          callback(); // Skip duplicate
          return;
        }

        this.deduplicationCache.set(recordHash, now);
        callback(null, record);
      },
    });
  }

  private createBatchingTransform(): Transform {
    if (!this.config.enableBatching) {
      return new Transform({ objectMode: true, transform: (chunk, encoding, callback) => callback(null, chunk) });
    }

    let batch: IStreamRecord[] = [];
    let batchTimer: NodeJS.Timeout | null = null;

    const flushBatch = (callback: Function) => {
      if (batch.length > 0) {
        const batchContext: IBatchContext = {
          batchId: this.generateBatchId(),
          size: batch.length,
          startTime: new Date(),
          source: batch[0]?.source || 'unknown',
          metadata: { batchSize: batch.length },
        };

        callback(null, { batch: [...batch], context: batchContext });
        batch = [];
      } else {
        callback();
      }

      if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
      }
    };

    return new Transform({
      objectMode: true,
      transform: (record: IStreamRecord, encoding, callback) => {
        batch.push(record);

        if (batch.length >= this.config.batchSize) {
          flushBatch(callback);
        } else {
          if (!batchTimer) {
            batchTimer = setTimeout(() => flushBatch(callback), this.config.batchTimeoutMs);
          }
          callback();
        }
      },
      flush: (callback) => {
        flushBatch(callback);
      },
    });
  }

  private createMetricsTransform(): Transform {
    return new Transform({
      objectMode: true,
      transform: (record: IStreamRecord, encoding, callback) => {
        // Update processing metrics
        this.metrics.recordsProcessed++;
        this.metrics.bytesProcessed += JSON.stringify(record.data).length;
        
        callback(null, record);
      },
    });
  }

  private createFileSourceStream(source: IStreamSource): Readable {
    // Placeholder implementation for file source stream
    return new Readable({
      objectMode: true,
      read() {
        // Implementation would read from file
        this.push(null); // End of stream
      },
    });
  }

  private createWebhookSourceStream(source: IStreamSource): Readable {
    // Placeholder implementation for webhook source stream
    return new Readable({
      objectMode: true,
      read() {
        // Implementation would handle webhook data
        this.push(null); // End of stream
      },
    });
  }

  private createTCPSourceStream(source: IStreamSource): Readable {
    // Placeholder implementation for TCP source stream
    return new Readable({
      objectMode: true,
      read() {
        // Implementation would handle TCP connections
        this.push(null); // End of stream
      },
    });
  }

  private createDatabaseSinkStream(sink: IStreamSink): Writable {
    return new Writable({
      objectMode: true,
      write: async (record: IStreamRecord, encoding, callback) => {
        try {
          // Placeholder implementation for database write
          logger.debug('Writing record to database', { recordId: record.id });
          callback();
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  private createFileSinkStream(sink: IStreamSink): Writable {
    return new Writable({
      objectMode: true,
      write: async (record: IStreamRecord, encoding, callback) => {
        try {
          // Placeholder implementation for file write
          logger.debug('Writing record to file', { recordId: record.id });
          callback();
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  private createAPISinkStream(sink: IStreamSink): Writable {
    return new Writable({
      objectMode: true,
      write: async (record: IStreamRecord, encoding, callback) => {
        try {
          // Placeholder implementation for API write
          logger.debug('Sending record to API', { recordId: record.id });
          callback();
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  private async processRecord(record: IStreamRecord): Promise<void> {
    // Placeholder implementation for record processing
    logger.debug('Processing record', { recordId: record.id });
  }

  private setupDeduplicationCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - this.config.deduplicationWindowMs;
      
      for (const [hash, timestamp] of this.deduplicationCache) {
        if (timestamp < cutoff) {
          this.deduplicationCache.delete(hash);
        }
      }
    }, this.config.deduplicationWindowMs / 4);
  }

  private collectMetrics(): void {
    this.metrics.streamsActive = this.activeStreams.size;
    this.metrics.bufferUtilization = (this.deadLetterQueue.length / this.config.deadLetterQueueSize) * 100;
    this.metrics.lastUpdated = new Date();
    
    // Calculate rates (would be more sophisticated in production)
    const timeDiff = Date.now() - this.metrics.lastUpdated.getTime();
    if (timeDiff > 0) {
      this.metrics.recordsPerSecond = this.metrics.recordsProcessed / (timeDiff / 1000);
      this.metrics.bytesPerSecond = this.metrics.bytesProcessed / (timeDiff / 1000);
    }

    logger.debug('Stream metrics collected', this.metrics);
  }

  private generateRecordHash(record: IStreamRecord): string {
    // Simple hash generation for deduplication
    const data = JSON.stringify({
      source: record.source,
      data: record.data,
    });
    
    return Buffer.from(data).toString('base64').substring(0, 32);
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}