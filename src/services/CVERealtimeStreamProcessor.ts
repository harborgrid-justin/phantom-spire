/**
 * CVE Real-Time Stream Processor
 * Redis-based streaming processor for real-time CVE data ingestion and processing
 */

import { EventEmitter } from 'events';
import Redis, { RedisOptions } from 'redis';
import { logger } from '../../utils/logger.js';
import { CVE } from '../../types/cve.js';
import { ICVEFeedData } from '../data-layer/ingestion/connectors/CVERealTimeConnector.js';
import { CVERealTimeNotificationService } from './CVERealTimeNotificationService.js';
import { CVEDataService } from '../data-layer/services/CVEDataService.js';

export interface ICVEStreamProcessorConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  
  streaming: {
    streamName: string;
    consumerGroup: string;
    consumerName: string;
    maxRetries: number;
    processingTimeoutMs: number;
    batchSize: number;
  };
  
  processing: {
    enableDeduplication: boolean;
    deduplicationWindowMs: number;
    enableEnrichment: boolean;
    enableRiskScoring: boolean;
    enableCorrelation: boolean;
  };
  
  performance: {
    maxConcurrentProcessing: number;
    bufferSize: number;
    flushIntervalMs: number;
    enableMetrics: boolean;
  };
}

export interface ICVEStreamMessage {
  id: string;
  timestamp: number;
  type: 'new-cve' | 'cve-updated' | 'cve-enriched' | 'cve-scored';
  data: ICVEFeedData;
  metadata: {
    source: string;
    processedAt?: number;
    retryCount?: number;
    correlationId?: string;
  };
}

export interface IStreamProcessingMetrics {
  messagesProcessed: number;
  messagesPerSecond: number;
  processingLatencyMs: number;
  errorRate: number;
  duplicatesDetected: number;
  enrichmentRate: number;
  lastProcessedAt: Date;
}

export class CVERealtimeStreamProcessor extends EventEmitter {
  private config: ICVEStreamProcessorConfig;
  private redisClient: Redis.RedisClientType;
  private subscriberClient: Redis.RedisClientType;
  private publisherClient: Redis.RedisClientType;
  private isRunning = false;
  private processingQueue: ICVEStreamMessage[] = [];
  private metrics: IStreamProcessingMetrics;
  private notificationService?: CVERealTimeNotificationService;
  private cveDataService?: CVEDataService;
  private deduplicationCache: Set<string> = new Set();
  private metricsInterval?: NodeJS.Timeout;
  private flushInterval?: NodeJS.Timeout;

  constructor(
    config: ICVEStreamProcessorConfig,
    notificationService?: CVERealTimeNotificationService,
    cveDataService?: CVEDataService
  ) {
    super();
    this.config = config;
    this.notificationService = notificationService;
    this.cveDataService = cveDataService;

    // Initialize metrics
    this.metrics = {
      messagesProcessed: 0,
      messagesPerSecond: 0,
      processingLatencyMs: 0,
      errorRate: 0,
      duplicatesDetected: 0,
      enrichmentRate: 0,
      lastProcessedAt: new Date(),
    };

    // Initialize Redis clients
    const redisOptions: RedisOptions = {
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
      database: config.redis.db,
    };

    this.redisClient = Redis.createClient(redisOptions);
    this.subscriberClient = Redis.createClient(redisOptions);
    this.publisherClient = Redis.createClient(redisOptions);

    this.setupRedisErrorHandlers();
    
    logger.info('CVE Real-Time Stream Processor initialized', {
      streamName: config.streaming.streamName,
      consumerGroup: config.streaming.consumerGroup,
      batchSize: config.streaming.batchSize,
    });
  }

  /**
   * Start the stream processor
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('CVE Stream Processor already running');
      return;
    }

    try {
      // Connect to Redis
      await Promise.all([
        this.redisClient.connect(),
        this.subscriberClient.connect(),
        this.publisherClient.connect(),
      ]);

      // Setup Redis streams and consumer groups
      await this.setupRedisStreams();

      // Start processing
      this.isRunning = true;
      this.startProcessing();

      // Start metrics collection
      if (this.config.performance.enableMetrics) {
        this.startMetricsCollection();
      }

      // Start buffer flushing
      this.startBufferFlushing();

      this.emit('started');
      logger.info('CVE Real-Time Stream Processor started successfully');

    } catch (error) {
      const errorMessage = `Failed to start CVE Stream Processor: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Stop the stream processor
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('CVE Stream Processor not running');
      return;
    }

    try {
      this.isRunning = false;

      // Clear intervals
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
        this.metricsInterval = undefined;
      }
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
        this.flushInterval = undefined;
      }

      // Process remaining items in queue
      await this.flushProcessingQueue();

      // Disconnect Redis clients
      await Promise.all([
        this.redisClient.disconnect(),
        this.subscriberClient.disconnect(),
        this.publisherClient.disconnect(),
      ]);

      this.emit('stopped');
      logger.info('CVE Real-Time Stream Processor stopped successfully');

    } catch (error) {
      const errorMessage = `Error stopping CVE Stream Processor: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw error;
    }
  }

  /**
   * Process incoming CVE data
   */
  public async processCVEData(cveData: ICVEFeedData): Promise<void> {
    try {
      const message: ICVEStreamMessage = {
        id: this.generateMessageId(),
        timestamp: Date.now(),
        type: 'new-cve',
        data: cveData,
        metadata: {
          source: cveData.source,
          correlationId: `corr_${Date.now()}`,
        },
      };

      // Add to Redis stream
      await this.publishToStream(message);
      
      logger.debug('CVE data added to processing stream', {
        cveId: cveData.cve.cveId,
        source: cveData.source,
        messageId: message.id,
      });

    } catch (error) {
      logger.error('Failed to process CVE data', error);
      throw error;
    }
  }

  /**
   * Get current processing metrics
   */
  public getMetrics(): IStreamProcessingMetrics {
    return { ...this.metrics };
  }

  /**
   * Get stream status
   */
  public async getStreamStatus(): Promise<{
    isRunning: boolean;
    streamLength: number;
    consumerGroupInfo: any;
    queueLength: number;
  }> {
    try {
      const streamInfo = await this.redisClient.xInfoStream(this.config.streaming.streamName);
      const groupInfo = await this.redisClient.xInfoGroups(this.config.streaming.streamName);
      
      return {
        isRunning: this.isRunning,
        streamLength: streamInfo.length,
        consumerGroupInfo: groupInfo,
        queueLength: this.processingQueue.length,
      };
    } catch (error) {
      logger.error('Failed to get stream status', error);
      return {
        isRunning: this.isRunning,
        streamLength: 0,
        consumerGroupInfo: {},
        queueLength: this.processingQueue.length,
      };
    }
  }

  /**
   * Private methods
   */

  private setupRedisErrorHandlers(): void {
    [this.redisClient, this.subscriberClient, this.publisherClient].forEach(client => {
      client.on('error', (error) => {
        logger.error('Redis client error', error);
        this.emit('error', error);
      });

      client.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });

      client.on('ready', () => {
        logger.info('Redis client ready');
      });
    });
  }

  private async setupRedisStreams(): Promise<void> {
    try {
      // Create consumer group if it doesn't exist
      try {
        await this.redisClient.xGroupCreate(
          this.config.streaming.streamName,
          this.config.streaming.consumerGroup,
          '0',
          { MKSTREAM: true }
        );
        logger.info('Consumer group created', {
          streamName: this.config.streaming.streamName,
          consumerGroup: this.config.streaming.consumerGroup,
        });
      } catch (error: any) {
        if (error.message.includes('BUSYGROUP')) {
          logger.info('Consumer group already exists');
        } else {
          throw error;
        }
      }

      // Setup additional streams for different message types
      const streamTypes = ['cve-updates', 'cve-alerts', 'cve-enrichments'];
      for (const streamType of streamTypes) {
        const streamName = `${this.config.redis.keyPrefix}${streamType}`;
        try {
          await this.redisClient.xGroupCreate(
            streamName,
            this.config.streaming.consumerGroup,
            '0',
            { MKSTREAM: true }
          );
        } catch (error: any) {
          if (!error.message.includes('BUSYGROUP')) {
            logger.warn('Failed to create stream', { streamName, error: error.message });
          }
        }
      }

    } catch (error) {
      logger.error('Failed to setup Redis streams', error);
      throw error;
    }
  }

  private startProcessing(): void {
    // Start the main processing loop
    setImmediate(() => this.processMessages());
  }

  private async processMessages(): Promise<void> {
    while (this.isRunning) {
      try {
        // Read messages from stream
        const messages = await this.redisClient.xReadGroup(
          this.config.streaming.consumerGroup,
          this.config.streaming.consumerName,
          [{ key: this.config.streaming.streamName, id: '>' }],
          {
            COUNT: this.config.streaming.batchSize,
            BLOCK: 5000, // 5 second timeout
          }
        );

        if (messages && messages.length > 0) {
          for (const stream of messages) {
            for (const message of stream.messages) {
              await this.handleStreamMessage(stream.name, message.id, message.message);
            }
          }
        }

      } catch (error) {
        if (this.isRunning) {
          logger.error('Error processing messages from stream', error);
          await this.sleep(1000); // Back off on error
        }
      }
    }
  }

  private async handleStreamMessage(
    streamName: string,
    messageId: string,
    messageData: Record<string, string>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Parse message data
      const streamMessage: ICVEStreamMessage = {
        id: messageData.id || messageId,
        timestamp: parseInt(messageData.timestamp) || Date.now(),
        type: (messageData.type as any) || 'new-cve',
        data: JSON.parse(messageData.data),
        metadata: JSON.parse(messageData.metadata || '{}'),
      };

      // Check for duplicates if enabled
      if (this.config.processing.enableDeduplication) {
        const deduplicationKey = this.generateDeduplicationKey(streamMessage.data);
        if (this.deduplicationCache.has(deduplicationKey)) {
          this.metrics.duplicatesDetected++;
          await this.redisClient.xAck(this.config.streaming.streamName, this.config.streaming.consumerGroup, messageId);
          return;
        }
        this.deduplicationCache.add(deduplicationKey);
      }

      // Process the message
      await this.processStreamMessage(streamMessage);

      // Acknowledge message
      await this.redisClient.xAck(this.config.streaming.streamName, this.config.streaming.consumerGroup, messageId);

      // Update metrics
      this.metrics.messagesProcessed++;
      this.metrics.processingLatencyMs = Date.now() - startTime;
      this.metrics.lastProcessedAt = new Date();

    } catch (error) {
      logger.error('Failed to handle stream message', {
        streamName,
        messageId,
        error,
      });

      // Handle retry logic
      await this.handleProcessingError(streamName, messageId, error as Error);
    }
  }

  private async processStreamMessage(message: ICVEStreamMessage): Promise<void> {
    try {
      let processedData = message.data;

      // Enrichment phase
      if (this.config.processing.enableEnrichment) {
        processedData = await this.enrichCVEData(processedData);
        this.metrics.enrichmentRate++;
      }

      // Risk scoring phase
      if (this.config.processing.enableRiskScoring) {
        processedData = await this.calculateRiskScore(processedData);
      }

      // Correlation phase
      if (this.config.processing.enableCorrelation) {
        processedData = await this.correlateWithThreatIntel(processedData);
      }

      // Store processed data
      if (this.cveDataService) {
        await this.storeCVEData(processedData);
      }

      // Send notifications
      if (this.notificationService) {
        await this.notificationService.notifyNewCVE(processedData);
      }

      // Emit processing event
      this.emit('cve-processed', {
        message,
        processedData,
      });

    } catch (error) {
      logger.error('Failed to process stream message', error);
      throw error;
    }
  }

  private async enrichCVEData(cveData: ICVEFeedData): Promise<ICVEFeedData> {
    try {
      // Add threat intelligence enrichment
      const enrichedCVE = { ...cveData.cve };

      // Enrich with exploit information
      if (enrichedCVE.cveId) {
        // Check for known exploits (this would integrate with threat intel sources)
        const exploitInfo = await this.fetchExploitInformation(enrichedCVE.cveId);
        if (exploitInfo) {
          enrichedCVE.exploitInfo = {
            ...enrichedCVE.exploitInfo,
            ...exploitInfo,
          };
        }
      }

      // Enrich with asset impact analysis
      const assetImpacts = await this.analyzeAssetImpact(enrichedCVE);
      if (assetImpacts.length > 0) {
        enrichedCVE.assetImpacts = assetImpacts;
      }

      // Add compliance framework mapping
      const complianceMapping = await this.mapToComplianceFrameworks(enrichedCVE);
      if (complianceMapping) {
        enrichedCVE.compliance = {
          ...enrichedCVE.compliance,
          ...complianceMapping,
        };
      }

      return {
        ...cveData,
        cve: enrichedCVE,
      };

    } catch (error) {
      logger.warn('CVE enrichment failed, continuing with basic data', error);
      return cveData;
    }
  }

  private async calculateRiskScore(cveData: ICVEFeedData): Promise<ICVEFeedData> {
    try {
      const cve = cveData.cve;
      let riskScore = 0;

      // Base score from CVSS
      if (cve.scoring.cvssV3Score) {
        riskScore += (cve.scoring.cvssV3Score / 10) * 40; // Max 40 points
      }

      // Exploit availability
      if (cve.exploitInfo.exploitAvailable) {
        riskScore += 20;
      }
      if (cve.exploitInfo.exploitInWild) {
        riskScore += 20;
      }

      // Asset impact
      if (cve.assetImpacts.length > 0) {
        const criticalAssets = cve.assetImpacts.filter(a => a.criticality === 'critical').length;
        riskScore += Math.min(criticalAssets * 5, 20); // Max 20 points
      }

      // Normalize to 0-100
      riskScore = Math.min(Math.max(riskScore, 0), 100);

      // Determine risk levels
      const businessRisk = riskScore >= 80 ? 'critical' : 
                          riskScore >= 60 ? 'high' :
                          riskScore >= 40 ? 'medium' : 'low';

      const updatedCVE = {
        ...cve,
        riskAssessment: {
          ...cve.riskAssessment,
          riskScore,
          businessRisk: businessRisk as any,
          technicalRisk: businessRisk as any,
          likelihood: cve.exploitInfo.exploitInWild ? 90 : 
                     cve.exploitInfo.exploitAvailable ? 70 : 30,
          riskJustification: `Calculated risk score based on CVSS, exploit availability, and asset impact`,
        },
      };

      return {
        ...cveData,
        cve: updatedCVE,
      };

    } catch (error) {
      logger.warn('Risk scoring failed, using default values', error);
      return cveData;
    }
  }

  private async correlateWithThreatIntel(cveData: ICVEFeedData): Promise<ICVEFeedData> {
    try {
      // This would integrate with other phantom-*-core modules for threat intelligence
      // For now, return the data unchanged
      return cveData;
    } catch (error) {
      logger.warn('Threat intelligence correlation failed', error);
      return cveData;
    }
  }

  private async storeCVEData(cveData: ICVEFeedData): Promise<void> {
    if (this.cveDataService) {
      try {
        const context = {
          userId: 'system',
          organizationId: 'default',
          requestId: `stream_${Date.now()}`,
        };

        // Check if CVE already exists
        const existing = await this.cveDataService.getCVE(cveData.cve.cveId, context);
        
        if (existing) {
          // Update existing CVE
          await this.cveDataService.updateCVE(cveData.cve.cveId, cveData.cve, context);
        } else {
          // Create new CVE
          await this.cveDataService.createCVE(cveData.cve, context);
        }

      } catch (error) {
        logger.error('Failed to store CVE data', error);
        throw error;
      }
    }
  }

  private async publishToStream(message: ICVEStreamMessage): Promise<void> {
    const streamData = {
      id: message.id,
      timestamp: message.timestamp.toString(),
      type: message.type,
      data: JSON.stringify(message.data),
      metadata: JSON.stringify(message.metadata),
    };

    await this.redisClient.xAdd(this.config.streaming.streamName, '*', streamData);
  }

  private async handleProcessingError(
    streamName: string,
    messageId: string,
    error: Error
  ): Promise<void> {
    // Implement retry logic here
    logger.error('Processing error, implementing retry logic', {
      streamName,
      messageId,
      error: error.message,
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateDeduplicationKey(cveData: ICVEFeedData): string {
    return `${cveData.source}_${cveData.cve.cveId}_${cveData.cve.lastModifiedDate}`;
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.calculateMetrics();
    }, 60000); // Every minute
  }

  private startBufferFlushing(): void {
    this.flushInterval = setInterval(() => {
      this.flushProcessingQueue();
    }, this.config.performance.flushIntervalMs);
  }

  private calculateMetrics(): void {
    // Calculate messages per second
    const now = Date.now();
    const timeDiff = (now - this.metrics.lastProcessedAt.getTime()) / 1000;
    if (timeDiff > 0) {
      this.metrics.messagesPerSecond = this.metrics.messagesProcessed / timeDiff;
    }

    // Calculate error rate
    // This would need more sophisticated tracking

    logger.debug('Stream processing metrics updated', this.metrics);
  }

  private async flushProcessingQueue(): Promise<void> {
    if (this.processingQueue.length === 0) {
      return;
    }

    const itemsToProcess = this.processingQueue.splice(0, this.config.performance.batchSize);
    for (const message of itemsToProcess) {
      try {
        await this.processStreamMessage(message);
      } catch (error) {
        logger.error('Failed to process queued message', error);
      }
    }
  }

  private async fetchExploitInformation(cveId: string): Promise<any> {
    // This would integrate with exploit databases
    return null;
  }

  private async analyzeAssetImpact(cve: CVE): Promise<any[]> {
    // This would integrate with asset management systems
    return [];
  }

  private async mapToComplianceFrameworks(cve: CVE): Promise<any> {
    // This would map CVEs to compliance frameworks
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}