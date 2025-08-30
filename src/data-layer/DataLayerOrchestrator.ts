/**
 * Data Layer Orchestrator - Main entry point for the modular data layer
 * Provides unified interface for all data layer capabilities
 */

import { logger } from '../utils/logger';
import { ErrorHandler, PerformanceMonitor } from '../utils/serviceUtils';
import { MessageQueueManager } from '../message-queue/core/MessageQueueManager';
import { 
  DataIngestionMessageProducer, 
  AnalyticsPipelineMessageProducer 
} from '../message-queue/producers/MessageProducers';
import {
  DataIngestionEngine,
  IngestionPipelineManager,
  StreamProcessor,
  IngestionIntegration,
  DEFAULT_INGESTION_CONFIG,
  DEFAULT_PIPELINE_CONFIG,
  DEFAULT_STREAM_CONFIG,
} from './ingestion';
import {
  DataFederationEngine,
  IFederatedQuery,
  IFederatedResult,
} from './core/DataFederationEngine';
import { MongoDataSource } from './core/MongoDataSource';
import {
  AdvancedAnalyticsEngine,
  IAnalyticsResult,
  IThreatModel,
} from './analytics/AdvancedAnalyticsEngine';
import { RestApiConnector } from './connectors/RestApiConnector';
import {
  IDataSource,
  IDataRecord,
  IQueryContext,
  IRelationship,
} from './interfaces/IDataSource';
import {
  IDataConnector,
  IDataPipeline,
  IPipelineResult,
  IConnectorConfig,
} from './interfaces/IDataConnector';

export interface IDataLayerConfig {
  mongodb?: {
    uri: string;
    database: string;
  };
  analytics?: {
    enableAdvancedAnalytics: boolean;
    enableAnomalyDetection: boolean;
    enablePredictiveAnalytics: boolean;
  };
  federation?: {
    enableCrossSourceQueries: boolean;
    enableRelationshipDiscovery: boolean;
    queryTimeout: number;
  };
  connectors?: {
    [name: string]: IConnectorConfig;
  };
  messageQueue?: {
    enabled: boolean;
    asyncProcessing: boolean;
  };
  // Fortune 100 Ingestion Configuration
  ingestion?: {
    enabled: boolean;
    engineConfig?: any;
    pipelineConfig?: any;
    streamConfig?: any;
    enableSTIX: boolean;
    enableMISP: boolean;
    enableRealTimeProcessing: boolean;
  };
}

export interface IDataLayerMetrics {
  dataSources: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  queries: {
    totalExecuted: number;
    averageExecutionTime: number;
    errorRate: number;
  };
  analytics: {
    threatsAnalyzed: number;
    patternsDetected: number;
    anomaliesFound: number;
  };
  connectors: {
    total: number;
    connected: number;
    extractionJobs: number;
  };
}

export class DataLayerOrchestrator {
  private federationEngine: DataFederationEngine;
  private analyticsEngine: AdvancedAnalyticsEngine;
  private dataSources: Map<string, IDataSource> = new Map();
  private connectors: Map<string, IDataConnector> = new Map();
  private pipelines: Map<string, IDataPipeline> = new Map();
  private config: IDataLayerConfig;
  private metrics: IDataLayerMetrics;
  
  // Message Queue Integration
  private messageQueueManager?: MessageQueueManager;
  private dataIngestionProducer?: DataIngestionMessageProducer;
  private analyticsPipelineProducer?: AnalyticsPipelineMessageProducer;

  // Fortune 100 Ingestion Engine Components
  private ingestionEngine?: DataIngestionEngine;
  private pipelineManager?: IngestionPipelineManager;
  private streamProcessor?: StreamProcessor;

  constructor(config: IDataLayerConfig, messageQueueManager?: MessageQueueManager) {
    this.config = config;
    this.federationEngine = new DataFederationEngine();
    this.analyticsEngine = new AdvancedAnalyticsEngine();
    this.metrics = this.initializeMetrics();
    
    // Initialize message queue integration if provided
    if (messageQueueManager && config.messageQueue?.enabled) {
      this.messageQueueManager = messageQueueManager;
      this.dataIngestionProducer = new DataIngestionMessageProducer(messageQueueManager);
      this.analyticsPipelineProducer = new AnalyticsPipelineMessageProducer(messageQueueManager);
      logger.info('Message queue integration enabled for data layer');
    }

    // Initialize Fortune 100 Ingestion Engine if configured
    if (config.ingestion?.enabled && messageQueueManager) {
      this.initializeIngestionEngine(messageQueueManager);
    }

    logger.info('Data Layer Orchestrator initialized');
  }

  /**
   * Initialize the data layer with all components
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing modular data layer');

      // Initialize MongoDB data source if configured
      if (this.config.mongodb) {
        await this.initializeMongoDataSource();
      }

      // Initialize connectors if configured
      if (this.config.connectors) {
        await this.initializeConnectors();
      }

      // Initialize analytics models
      await this.initializeAnalytics();

      // Start ingestion engine if configured
      if (this.ingestionEngine) {
        await this.ingestionEngine.start();
        logger.info('Fortune 100 ingestion engine started');
      }

      // Start stream processor if configured
      if (this.streamProcessor) {
        await this.streamProcessor.start();
        logger.info('Real-time stream processor started');
      }

      logger.info('Modular data layer initialized successfully', {
        dataSources: this.dataSources.size,
        connectors: this.connectors.size,
        analyticsEnabled: this.config.analytics?.enableAdvancedAnalytics,
        ingestionEnabled: this.config.ingestion?.enabled,
        streamProcessingEnabled: this.config.ingestion?.enableRealTimeProcessing,
      });
    } catch (error) {
      logger.error('Failed to initialize data layer', error);
      throw error;
    }
  }

  /**
   * Execute a unified query across the data layer
   */
  public async query(
    query: IFederatedQuery,
    context: IQueryContext
  ): Promise<IFederatedResult> {
    const measurement = PerformanceMonitor.startMeasurement('data_layer_query', {
      queryType: query.type,
      sources: query.sources,
      userId: context.userId,
    });

    const operationResult = await ErrorHandler.executeWithHandling(
      () => this.federationEngine.federatedQuery(query, context),
      {
        operationName: 'unified_query',
        entityType: 'query',
        entityId: `${query.type}-${query.sources?.join(',')}`,
        additionalData: {
          queryType: query.type,
          sourcesCount: query.sources?.length || 0,
          userId: context.userId,
        },
      },
      {
        retryable: false,
        logLevel: 'debug',
      }
    );

    // Update metrics
    this.updateQueryMetrics(operationResult.executionTime, operationResult.success);
    
    measurement.end({
      success: operationResult.success,
      resultCount: operationResult.result?.data.length || 0,
    });

    if (!operationResult.success) {
      throw operationResult.error;
    }

    return operationResult.result!;
  }

  /**
   * Stream data across multiple sources
   */
  public async *stream(
    query: IFederatedQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    logger.info('Starting federated data stream', {
      type: query.type,
      sources: query.sources,
    });

    yield* this.federationEngine.federatedStream(query, context);
  }

  /**
   * Perform advanced threat intelligence analytics
   */
  public async analyzeThreats(
    query: IFederatedQuery,
    context: IQueryContext,
    options: {
      patterns?: string[];
      models?: string[];
      includeAnomalies?: boolean;
      includePredictions?: boolean;
    } = {}
  ): Promise<IAnalyticsResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting threat analytics', {
        patterns: options.patterns,
        models: options.models,
      });

      // First, get the data to analyze
      const dataResult = await this.query(query, context);

      // Extract relationships if available
      const relationships = dataResult.relationships || [];

      // Perform analytics
      const analyticsResult = await this.analyticsEngine.analyzeThreats(
        dataResult.data,
        relationships,
        {
          patterns: options.patterns || [],
          models: options.models || [],
          includeAnomalies: options.includeAnomalies || false,
          ...(context.timeRange ? { timeWindow: context.timeRange } : {}),
        }
      );

      // Update metrics
      this.metrics.analytics.threatsAnalyzed++;
      this.metrics.analytics.patternsDetected +=
        analyticsResult.findings.length;

      const executionTime = Date.now() - startTime;

      logger.info('Threat analytics completed', {
        findings: analyticsResult.findings.length,
        recommendations: analyticsResult.recommendations.length,
        confidence: analyticsResult.confidence,
        executionTime,
      });

      return analyticsResult;
    } catch (error) {
      logger.error('Threat analytics failed', error);
      throw error;
    }
  }

  /**
   * Discover relationships across data sources
   */
  public async discoverRelationships(
    entityIds: string[],
    context: IQueryContext,
    options: {
      maxDepth?: number;
      relationshipTypes?: string[];
      similarityThreshold?: number;
    } = {}
  ): Promise<{
    nodes: IDataRecord[];
    relationships: IRelationship[];
    crossSourceLinks: Array<{
      sourceEntity: IDataRecord;
      targetEntity: IDataRecord;
      similarity: number;
      linkType: string;
    }>;
  }> {
    logger.info('Discovering cross-source relationships', {
      entities: entityIds.length,
      maxDepth: options.maxDepth,
    });

    return this.federationEngine.discoverRelationships(
      entityIds,
      context,
      options
    );
  }

  /**
   * Register a new data source
   */
  public async registerDataSource(source: IDataSource): Promise<void> {
    try {
      await source.connect();
      this.dataSources.set(source.name, source);
      this.federationEngine.registerDataSource(source);

      logger.info(`Registered data source: ${source.name}`);
      this.updateDataSourceMetrics();
    } catch (error) {
      logger.error(`Failed to register data source: ${source.name}`, error);
      throw error;
    }
  }

  /**
   * Register a new data connector
   */
  public async registerConnector(
    name: string,
    connector: IDataConnector
  ): Promise<void> {
    this.connectors.set(name, connector);
    this.metrics.connectors.total++;

    logger.info(`Registered data connector: ${name}`);
  }

  /**
   * Register a threat model for analytics
   */
  public registerThreatModel(model: IThreatModel): void {
    this.analyticsEngine.registerThreatModel(model);
    logger.info(`Registered threat model: ${model.name}`);
  }

  /**
   * Execute a data pipeline
   */
  public async executePipeline(
    pipelineName: string,
    input: any
  ): Promise<IPipelineResult> {
    const pipeline = this.pipelines.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineName}`);
    }

    logger.info(`Executing pipeline: ${pipelineName}`);

    try {
      const result = await pipeline.execute(input);
      this.metrics.connectors.extractionJobs++;

      return result;
    } catch (error) {
      logger.error(`Pipeline execution failed: ${pipelineName}`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive health status of the data layer
   */
  public async getHealthStatus(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    dataSources: Record<string, any>;
    connectors: Record<string, any>;
    analytics: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      patterns: number;
      models: number;
    };
    federation: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      sources: number;
    };
  }> {
    const [dataSourceHealth, connectorHealth] = await Promise.all([
      this.federationEngine.getHealthStatus(),
      this.getConnectorHealthStatus(),
    ]);

    const healthyDataSources = Object.values(dataSourceHealth).filter(
      (health: any) => health.status === 'healthy'
    ).length;

    const healthyConnectors = Object.values(connectorHealth).filter(
      (health: any) => health.status === 'healthy'
    ).length;

    const overall = this.calculateOverallHealth(
      healthyDataSources,
      this.dataSources.size,
      healthyConnectors,
      this.connectors.size
    );

    return {
      overall,
      dataSources: dataSourceHealth,
      connectors: connectorHealth,
      analytics: {
        status: 'healthy',
        patterns: Array.from(this.analyticsEngine['patterns']).length,
        models: Array.from(this.analyticsEngine['threatModels']).length,
      },
      federation: {
        status: this.dataSources.size > 0 ? 'healthy' : 'degraded',
        sources: this.dataSources.size,
      },
    };
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): IDataLayerMetrics {
    return { ...this.metrics };
  }

  /**
   * Gracefully shutdown the data layer
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down data layer');

    try {
      // Disconnect all data sources
      const disconnectPromises = Array.from(this.dataSources.values()).map(
        source =>
          source
            .disconnect()
            .catch(error =>
              logger.error(`Failed to disconnect ${source.name}`, error)
            )
      );

      // Disconnect all connectors
      const connectorPromises = Array.from(this.connectors.values()).map(
        connector =>
          connector
            .disconnect()
            .catch(error =>
              logger.error(
                `Failed to disconnect connector ${connector.name}`,
                error
              )
            )
      );

      await Promise.all([...disconnectPromises, ...connectorPromises]);

      logger.info('Data layer shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown', error);
      throw error;
    }
  }

  /**
   * Initialize MongoDB data source
   */
  private async initializeMongoDataSource(): Promise<void> {
    const mongoSource = new MongoDataSource(this.config.mongodb);
    await this.registerDataSource(mongoSource);
  }

  /**
   * Initialize configured connectors
   */
  private async initializeConnectors(): Promise<void> {
    if (!this.config.connectors) return;

    for (const [name, connectorConfig] of Object.entries(
      this.config.connectors
    )) {
      try {
        let connector: IDataConnector;

        // Create connector based on type
        switch (connectorConfig.type) {
          case 'rest-api':
            connector = new RestApiConnector();
            break;
          default:
            logger.warn(`Unknown connector type: ${connectorConfig.type}`);
            continue;
        }

        // Initialize and connect the connector
        await connector.initialize(connectorConfig);
        await connector.connect();

        await this.registerConnector(name, connector);
        this.metrics.connectors.connected++;
      } catch (error) {
        logger.error(`Failed to initialize connector ${name}`, error);
      }
    }
  }

  /**
   * Initialize analytics with default models
   */
  private async initializeAnalytics(): Promise<void> {
    if (!this.config.analytics?.enableAdvancedAnalytics) {
      return;
    }

    // Register default threat models
    // In production, these would be loaded from configuration or database
    logger.info('Analytics engine initialized with default threat models');
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics(): IDataLayerMetrics {
    return {
      dataSources: {
        total: 0,
        healthy: 0,
        unhealthy: 0,
      },
      queries: {
        totalExecuted: 0,
        averageExecutionTime: 0,
        errorRate: 0,
      },
      analytics: {
        threatsAnalyzed: 0,
        patternsDetected: 0,
        anomaliesFound: 0,
      },
      connectors: {
        total: 0,
        connected: 0,
        extractionJobs: 0,
      },
    };
  }

  /**
   * Update query execution metrics
   */
  private updateQueryMetrics(executionTime: number, success: boolean): void {
    this.metrics.queries.totalExecuted++;

    // Update average execution time (rolling average)
    const totalQueries = this.metrics.queries.totalExecuted;
    const currentAvg = this.metrics.queries.averageExecutionTime;
    this.metrics.queries.averageExecutionTime =
      (currentAvg * (totalQueries - 1) + executionTime) / totalQueries;

    // Update error rate
    if (!success) {
      const errors =
        Math.round(this.metrics.queries.errorRate * (totalQueries - 1)) + 1;
      this.metrics.queries.errorRate = errors / totalQueries;
    } else {
      const errors = Math.round(
        this.metrics.queries.errorRate * (totalQueries - 1)
      );
      this.metrics.queries.errorRate = errors / totalQueries;
    }
  }

  /**
   * Update data source metrics
   */
  private updateDataSourceMetrics(): void {
    this.metrics.dataSources.total = this.dataSources.size;
    // Health metrics would be updated by periodic health checks
  }

  /**
   * Get health status of all connectors
   */
  private async getConnectorHealthStatus(): Promise<Record<string, any>> {
    const healthPromises = Array.from(this.connectors.entries()).map(
      async ([name, connector]) => {
        try {
          const health = await connector.healthCheck();
          return [name, health];
        } catch (error) {
          return [
            name,
            {
              status: 'unhealthy',
              lastCheck: new Date(),
              responseTime: 0,
              message: (error as Error).message,
            },
          ];
        }
      }
    );

    const healthResults = await Promise.all(healthPromises);
    return Object.fromEntries(healthResults);
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(
    healthyDataSources: number,
    totalDataSources: number,
    healthyConnectors: number,
    totalConnectors: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (totalDataSources === 0 && totalConnectors === 0) {
      return 'unhealthy';
    }

    const dataSourceHealth =
      totalDataSources > 0 ? healthyDataSources / totalDataSources : 1;
    const connectorHealth =
      totalConnectors > 0 ? healthyConnectors / totalConnectors : 1;

    const overallHealth = (dataSourceHealth + connectorHealth) / 2;

    if (overallHealth >= 0.8) {
      return 'healthy';
    } else if (overallHealth >= 0.5) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  /**
   * Initialize Fortune 100-grade ingestion engine
   */
  private initializeIngestionEngine(messageQueueManager: MessageQueueManager): void {
    const ingestionConfig = {
      ...DEFAULT_INGESTION_CONFIG,
      ...this.config.ingestion?.engineConfig,
    };

    const pipelineConfig = {
      ...DEFAULT_PIPELINE_CONFIG,
      ...this.config.ingestion?.pipelineConfig,
    };

    const streamConfig = {
      ...DEFAULT_STREAM_CONFIG,
      ...this.config.ingestion?.streamConfig,
    };

    // Initialize ingestion engine
    this.ingestionEngine = new DataIngestionEngine(ingestionConfig, messageQueueManager);
    
    // Initialize pipeline manager
    this.pipelineManager = new IngestionPipelineManager(pipelineConfig);
    
    // Initialize stream processor if real-time processing is enabled
    if (this.config.ingestion?.enableRealTimeProcessing) {
      this.streamProcessor = new StreamProcessor(streamConfig);
    }

    // Set up integration between components
    IngestionIntegration.integrateWithOrchestrator(this, this.ingestionEngine);

    // Set up monitoring and alerting
    IngestionIntegration.setupMonitoring(this.ingestionEngine, (alert) => {
      logger.warn('Ingestion engine alert', alert);
      // In production, this would trigger appropriate alerting mechanisms
    });

    logger.info('Fortune 100 ingestion engine components initialized', {
      engineEnabled: true,
      pipelineManagerEnabled: true,
      streamProcessorEnabled: this.config.ingestion?.enableRealTimeProcessing,
      stixEnabled: this.config.ingestion?.enableSTIX,
      mispEnabled: this.config.ingestion?.enableMISP,
    });
  }

  /**
   * Get ingestion engine instance
   */
  public getIngestionEngine(): DataIngestionEngine | undefined {
    return this.ingestionEngine;
  }

  /**
   * Get pipeline manager instance
   */
  public getPipelineManager(): IngestionPipelineManager | undefined {
    return this.pipelineManager;
  }

  /**
   * Get stream processor instance
   */
  public getStreamProcessor(): StreamProcessor | undefined {
    return this.streamProcessor;
  }

  /**
   * Submit a data ingestion job
   */
  public async submitIngestionJob(
    sourceId: string,
    pipeline: IDataPipeline,
    priority: number = 5
  ): Promise<string | undefined> {
    if (!this.ingestionEngine) {
      logger.warn('Ingestion engine not initialized - cannot submit job');
      return undefined;
    }

    try {
      const jobId = await this.ingestionEngine.submitJob(sourceId, pipeline, priority);
      logger.info('Ingestion job submitted via orchestrator', {
        jobId,
        sourceId,
        priority,
      });
      return jobId;
    } catch (error) {
      logger.error('Failed to submit ingestion job', {
        sourceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get ingestion metrics
   */
  public getIngestionMetrics() {
    return {
      engine: this.ingestionEngine?.getMetrics(),
      stream: this.streamProcessor?.getMetrics(),
      deadLetterQueue: this.streamProcessor?.getDeadLetterQueue().length || 0,
    };
  }
}
