/**
 * Data Layer Orchestrator - Main entry point for the modular data layer
 * Provides unified interface for all data layer capabilities
 */

import { logger } from '../utils/logger';
import { ErrorHandler, PerformanceMonitor } from '../utils/serviceUtils';
import { MessageQueueManager } from '../message-queue/core/MessageQueueManager';
import {
  DataIngestionMessageProducer,
  AnalyticsPipelineMessageProducer,
} from '../message-queue/producers/MessageProducers';
import {
  TaskManagerEngine,
  ITaskManager,
  ITask,
  TaskType,
  TaskStatus,
  TaskPriority,
  ITaskQuery,
  ITaskQueryResult,
  TaskManagementSystemFactory,
  CTI_TASK_TEMPLATES,
  TaskManagementUtils,
  DEFAULT_TASK_MANAGER_CONFIG,
} from './tasks';
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
import { EvidenceManagementService } from './evidence/services/EvidenceManagementService';
import { EvidenceAnalyticsEngine } from './evidence/services/EvidenceAnalyticsEngine';
import {
  IEvidenceManager,
  IEvidenceContext,
  ICreateEvidenceRequest,
  IEvidenceQuery,
  IEvidenceSearchResult,
} from './evidence/interfaces/IEvidenceManager';
import {
  IEvidence,
  EvidenceType,
  ClassificationLevel,
} from './evidence/interfaces/IEvidence';
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
  private evidenceManager: EvidenceManagementService;
  private evidenceAnalyticsEngine: EvidenceAnalyticsEngine;
  private taskManager: ITaskManager;
  private dataSources: Map<string, IDataSource> = new Map();
  private connectors: Map<string, IDataConnector> = new Map();
  private pipelines: Map<string, IDataPipeline> = new Map();
  private config: IDataLayerConfig;
  private metrics: IDataLayerMetrics;
  private errorHandler: ErrorHandler;
  private performanceMonitor: PerformanceMonitor;

  // Message Queue Integration
  private messageQueueManager?: MessageQueueManager;
  private dataIngestionProducer?: DataIngestionMessageProducer;
  private analyticsPipelineProducer?: AnalyticsPipelineMessageProducer;

  // Fortune 100 Ingestion Engine Components
  private ingestionEngine?: DataIngestionEngine;
  private pipelineManager?: IngestionPipelineManager;
  private streamProcessor?: StreamProcessor;

  constructor(
    config: IDataLayerConfig,
    messageQueueManager?: MessageQueueManager
  ) {
    this.config = config;
    this.federationEngine = new DataFederationEngine();
    this.analyticsEngine = new AdvancedAnalyticsEngine();
    this.errorHandler = new ErrorHandler();
    this.performanceMonitor = new PerformanceMonitor();

    // Initialize Fortune 100-Grade Evidence Management
    this.evidenceManager = new EvidenceManagementService();
    this.evidenceAnalyticsEngine = new EvidenceAnalyticsEngine(
      this.evidenceManager
    );

    // Initialize Fortune 100-Grade Task Management
    this.taskManager = TaskManagementSystemFactory.createTaskManagerEngine(
      DEFAULT_TASK_MANAGER_CONFIG,
      messageQueueManager
    );

    this.metrics = this.initializeMetrics();

    // Initialize message queue integration if provided
    if (messageQueueManager && config.messageQueue?.enabled) {
      this.messageQueueManager = messageQueueManager;
      this.dataIngestionProducer = new DataIngestionMessageProducer(
        messageQueueManager
      );
      this.analyticsPipelineProducer = new AnalyticsPipelineMessageProducer(
        messageQueueManager
      );
      logger.info('Message queue integration enabled for data layer');
    }

    // Initialize Fortune 100 Ingestion Engine if configured
    if (config.ingestion?.enabled && messageQueueManager) {
      this.initializeIngestionEngine(messageQueueManager);
    }

    logger.info(
      'Data Layer Orchestrator initialized with Fortune 100-Grade Evidence Management'
    );
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

      // Initialize task management system
      if (this.taskManager) {
        await this.taskManager.initialize();
        logger.info('Fortune 100 task management system started');
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
        streamProcessingEnabled:
          this.config.ingestion?.enableRealTimeProcessing,
        taskManagementEnabled: !!this.taskManager,
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
    const measurement = PerformanceMonitor.startMeasurement(
      'data_layer_query',
      {
        queryType: query.type,
        sources: query.sources,
        userId: context.userId,
      }
    );

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
    this.updateQueryMetrics(
      operationResult.executionTime,
      operationResult.success
    );

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

  // ============================================================================
  // FORTUNE 100-GRADE TASK MANAGEMENT INTEGRATION
  // ============================================================================

  /**
   * Create and execute a CTI task using predefined templates
   */
  public async createAndExecuteCTITask(
    templateName: keyof typeof CTI_TASK_TEMPLATES,
    parameters: Record<string, any> = {},
    context: IQueryContext,
    overrides: any = {}
  ): Promise<{ task: ITask; execution: any }> {
    const measurement = this.performanceMonitor.startMeasurement(
      'createAndExecuteCTITask'
    );

    try {
      // Create task from template
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        templateName,
        {
          ...overrides,
          definition: {
            ...overrides.definition,
            parameters: {
              ...parameters,
              ...overrides.definition?.parameters,
            },
          },
          createdBy: context.userId,
          permissions: context.permissions || [],
        }
      );

      // Create the task
      const task = await this.taskManager.createTask(taskDefinition);

      // Execute the task
      const execution = await this.taskManager.executeTask(task.id, {
        userId: context.userId,
        permissions: context.permissions || [],
        environment: 'production',
        securityLevel: 'internal',
        debug: false,
        tracing: true,
        profiling: true,
      });

      logger.info('CTI task created and executed', {
        taskId: task.id,
        template: templateName,
        executionId: execution.id,
        userId: context.userId,
      });

      measurement.end({ success: true });
      return { task, execution };
    } catch (error) {
      measurement.end({ success: false });
      throw ErrorHandler.handleError(error, 'createAndExecuteCTITask');
    }
  }

  /**
   * Execute data ingestion task with pipeline integration
   */
  public async executeDataIngestionTask(
    sourceId: string,
    pipeline: string,
    parameters: Record<string, any>,
    context: IQueryContext
  ): Promise<{ task: ITask; execution: any }> {
    try {
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'THREAT_INTELLIGENCE_INGESTION',
        {
          definition: {
            parameters: {
              sourceId,
              pipeline,
              ...parameters,
            },
          },
          priority: TaskManagementUtils.calculateTaskPriority({
            severity: parameters.severity,
            urgency: parameters.urgency,
            impact: parameters.impact,
          }),
        }
      );

      // Integrate with existing ingestion engine if available
      if (this.ingestionEngine) {
        taskDefinition.definition.parameters.ingestionEngineId =
          this.ingestionEngine.constructor.name;
      }

      return await this.createAndExecuteCTITask(
        'THREAT_INTELLIGENCE_INGESTION',
        parameters,
        context,
        taskDefinition
      );
    } catch (error) {
      throw ErrorHandler.handleError(error, 'executeDataIngestionTask');
    }
  }

  /**
   * Execute evidence collection task with evidence management integration
   */
  public async executeEvidenceCollectionTask(
    sources: string[],
    incidentId: string,
    context: IQueryContext
  ): Promise<{ task: ITask; execution: any; evidenceIds: string[] }> {
    try {
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'INCIDENT_EVIDENCE_COLLECTION',
        {
          definition: {
            parameters: {
              sources,
              incidentId,
              evidenceManagerId: this.evidenceManager.constructor.name,
            },
          },
          priority: 'critical' as TaskPriority,
        }
      );

      const { task, execution } = await this.createAndExecuteCTITask(
        'INCIDENT_EVIDENCE_COLLECTION',
        { sources, incidentId },
        context,
        taskDefinition
      );

      // Create evidence entries for tracking
      const evidenceIds: string[] = [];
      for (const source of sources) {
        const evidence = await this.evidenceManager.createEvidence(
          {
            type: 'IOC Evidence' as EvidenceType,
            title: `Evidence from ${source}`,
            description: `Evidence collected from source: ${source} for incident: ${incidentId}`,
            classification: 'internal' as ClassificationLevel,
            source,
            data: { taskId: task.id, executionId: execution.id },
            metadata: { 
              title: `Evidence from Task ${task.id}`,
              description: `Automatically collected evidence from data ingestion task`,
              severity: 'medium' as const,
              confidence: 80,
              format: 'json',
              collectionTaskId: task.id, 
              incidentId 
            },
          },
          {
            userId: context.userId,
            permissions: context.permissions || [],
          }
        );

        evidenceIds.push(evidence.id);
      }

      logger.info('Evidence collection task created with evidence tracking', {
        taskId: task.id,
        evidenceCount: evidenceIds.length,
        incidentId,
      });

      return { task, execution, evidenceIds };
    } catch (error) {
      throw ErrorHandler.handleError(
        error,
        'executeEvidenceCollectionTask'
      );
    }
  }

  /**
   * Execute threat analysis task with analytics integration
   */
  public async executeThreatAnalysisTask(
    indicators: any[],
    analysisType: string = 'comprehensive',
    context: IQueryContext
  ): Promise<{
    task: ITask;
    execution: any;
    analysisResult?: IAnalyticsResult;
  }> {
    try {
      const taskDefinition = TaskManagementUtils.createTaskFromTemplate(
        'DATA_CORRELATION_ANALYSIS',
        {
          definition: {
            parameters: {
              indicators,
              analysisType,
              analyticsEngineId: this.analyticsEngine.constructor.name,
            },
          },
        }
      );

      const { task, execution } = await this.createAndExecuteCTITask(
        'DATA_CORRELATION_ANALYSIS',
        { indicators, analysisType },
        context,
        taskDefinition
      );

      // Optionally integrate with existing analytics engine
      let analysisResult: IAnalyticsResult | undefined;
      if (this.analyticsEngine && indicators.length > 0) {
        try {
          // Convert indicators to IDataRecord format for threat analysis
          const dataRecords: IDataRecord[] = indicators.map((indicator, index) => ({
            id: `indicator-${index}`,
            type: 'threat_indicator',
            source: 'cti_task',
            timestamp: new Date(),
            data: {
              value: typeof indicator === 'string' ? indicator : indicator.value,
              indicator: indicator,
            },
            metadata: {
              taskId: task.id,
              analysisType: 'threat_analysis',
            },
          }));

          analysisResult = await this.analyticsEngine.analyzeThreats(
            dataRecords,
            [],
            { includeAnomalies: true }
          );
        } catch (analyticsError) {
          logger.warn('Analytics integration failed for task', {
            taskId: task.id,
            error: analyticsError,
          });
        }
      }

      return { task, execution, analysisResult };
    } catch (error) {
      throw ErrorHandler.handleError(error, 'executeThreatAnalysisTask');
    }
  }

  /**
   * Create automated task workflow for incident response
   */
  public async createIncidentResponseWorkflow(
    incidentId: string,
    severity: string,
    affectedSystems: string[],
    context: IQueryContext
  ): Promise<{ tasks: ITask[]; workflowId: string }> {
    try {
      const workflowId = `incident-response-${incidentId}-${Date.now()}`;
      const tasks: ITask[] = [];

      const priority = TaskManagementUtils.calculateTaskPriority({
        severity,
        urgency: 'urgent',
        impact: affectedSystems.length > 5 ? 'high' : 'medium',
      });

      // 1. Evidence Collection Task
      const evidenceTask = await this.taskManager.createTask(
        TaskManagementUtils.createTaskFromTemplate(
          'INCIDENT_EVIDENCE_COLLECTION',
          {
            name: `Evidence Collection - ${incidentId}`,
            priority,
            definition: {
              parameters: {
                sources: affectedSystems,
                incidentId,
                preservationLevel:
                  severity === 'critical' ? 'forensic' : 'standard',
              },
            },
            metadata: { workflowId, incidentId, step: 1 },
          }
        )
      );
      tasks.push(evidenceTask);

      // 2. Threat Analysis Task (depends on evidence collection)
      const analysisTask = await this.taskManager.createTask(
        TaskManagementUtils.createTaskFromTemplate(
          'DATA_CORRELATION_ANALYSIS',
          {
            name: `Threat Analysis - ${incidentId}`,
            priority,
            dependencies: [evidenceTask.id],
            definition: {
              parameters: {
                datasets: [{ source: 'incident_evidence', incidentId }],
                correlationTypes: ['temporal', 'attributional', 'behavioral'],
                threshold: severity === 'critical' ? 0.6 : 0.75,
              },
            },
            metadata: { workflowId, incidentId, step: 2 },
          }
        )
      );
      tasks.push(analysisTask);

      // 3. Alert Task (immediate for critical incidents)
      if (severity === 'critical') {
        const alertTask = await this.taskManager.createTask(
          TaskManagementUtils.createTaskFromTemplate('REAL_TIME_ALERT', {
            name: `Critical Alert - ${incidentId}`,
            priority: 'critical' as TaskPriority,
            definition: {
              parameters: {
                alertType: 'critical_incident',
                severity: 'critical',
                incidentId,
                affectedSystems,
                channels: ['email', 'sms', 'webhook'],
              },
            },
            metadata: { workflowId, incidentId, step: 3 },
          })
        );
        tasks.push(alertTask);

        // Execute alert task immediately
        await this.taskManager.executeTask(alertTask.id, {
          userId: context.userId,
          permissions: context.permissions || [],
          environment: 'production',
          securityLevel: 'restricted',
        });
      }

      // 4. Report Generation Task (depends on analysis)
      const reportTask = await this.taskManager.createTask(
        TaskManagementUtils.createTaskFromTemplate('WEEKLY_THREAT_REPORT', {
          name: `Incident Report - ${incidentId}`,
          priority,
          dependencies: [analysisTask.id],
          definition: {
            parameters: {
              template: 'incident-response-report',
              format: 'pdf',
              incidentId,
              includeEvidence: true,
              includeAnalysis: true,
            },
          },
          metadata: { workflowId, incidentId, step: 4 },
        })
      );
      tasks.push(reportTask);

      // Execute the workflow (evidence collection first)
      await this.taskManager.executeTask(evidenceTask.id, {
        userId: context.userId,
        permissions: context.permissions || [],
        environment: 'production',
        securityLevel: 'restricted',
      });

      logger.info('Incident response workflow created', {
        workflowId,
        incidentId,
        taskCount: tasks.length,
        severity,
        affectedSystems: affectedSystems.length,
      });

      return { tasks, workflowId };
    } catch (error) {
      throw ErrorHandler.handleError(
        error,
        'createIncidentResponseWorkflow'
      );
    }
  }

  /**
   * Query tasks with CTI-specific filters
   */
  public async queryCTITasks(
    filters: Partial<ITaskQuery> = {},
    context: IQueryContext
  ): Promise<ITaskQueryResult> {
    try {
      // Apply security filtering based on user context
      const secureFilters: ITaskQuery = {
        ...filters,
        // Only show tasks the user has permission to see
        createdBy: context.permissions?.includes('admin')
          ? filters.createdBy
          : context.userId,
      };

      return await this.taskManager.queryTasks(secureFilters);
    } catch (error) {
      throw ErrorHandler.handleError(error, 'queryCTITasks');
    }
  }

  /**
   * Get task management system health and metrics
   */
  public async getTaskManagementHealth(): Promise<{
    health: any;
    metrics: any;
    integration: {
      evidenceManagement: boolean;
      dataIngestion: boolean;
      analytics: boolean;
      messageQueue: boolean;
    };
  }> {
    try {
      const health = await this.taskManager.healthCheck();
      const metrics = await this.taskManager.getSystemMetrics();

      return {
        health,
        metrics,
        integration: {
          evidenceManagement: !!this.evidenceManager,
          dataIngestion: !!this.ingestionEngine,
          analytics: !!this.analyticsEngine,
          messageQueue: !!this.messageQueueManager,
        },
      };
    } catch (error) {
      throw ErrorHandler.handleError(error, 'getTaskManagementHealth');
    }
  }

  /**
   * Get the task manager instance for direct access
   */
  public getTaskManager(): ITaskManager {
    return this.taskManager;
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
  private initializeIngestionEngine(
    messageQueueManager: MessageQueueManager
  ): void {
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
    this.ingestionEngine = new DataIngestionEngine(
      ingestionConfig,
      messageQueueManager
    );

    // Initialize pipeline manager
    this.pipelineManager = new IngestionPipelineManager(pipelineConfig);

    // Initialize stream processor if real-time processing is enabled
    if (this.config.ingestion?.enableRealTimeProcessing) {
      this.streamProcessor = new StreamProcessor(streamConfig);
    }

    // Set up integration between components
    IngestionIntegration.integrateWithOrchestrator(this, this.ingestionEngine);

    // Set up monitoring and alerting
    IngestionIntegration.setupMonitoring(this.ingestionEngine, alert => {
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
      const jobId = await this.ingestionEngine.submitJob(
        sourceId,
        pipeline,
        priority
      );
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

  // ============================================================================
  // Fortune 100-Grade Evidence Management API
  // ============================================================================

  /**
   * Get Evidence Manager instance
   */
  public getEvidenceManager(): IEvidenceManager {
    return this.evidenceManager;
  }

  /**
   * Get Evidence Analytics Engine instance
   */
  public getEvidenceAnalyticsEngine(): EvidenceAnalyticsEngine {
    return this.evidenceAnalyticsEngine;
  }

  /**
   * Create new evidence with full chain of custody tracking
   */
  public async createEvidence(
    request: ICreateEvidenceRequest,
    context: IEvidenceContext
  ): Promise<IEvidence> {
    try {
      const evidence = await this.evidenceManager.createEvidence(
        request,
        context
      );

      // Update metrics
      this.metrics.analytics.threatsAnalyzed++;

      logger.info('Evidence created via data layer orchestrator', {
        evidenceId: evidence.id,
        type: evidence.type,
        classification: evidence.classification,
        userId: context.userId,
      });

      return evidence;
    } catch (error) {
      logger.error('Failed to create evidence', {
        sourceType: request.sourceType,
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Search evidence with advanced filtering and access control
   */
  public async searchEvidence(
    query: IEvidenceQuery,
    context: IEvidenceContext
  ): Promise<IEvidenceSearchResult> {
    try {
      const result = await this.evidenceManager.searchEvidence(query, context);

      // Update metrics
      this.metrics.queries.totalExecuted++;

      logger.info('Evidence search completed via data layer orchestrator', {
        resultCount: result.totalCount,
        hasMore: result.hasMore,
        userId: context.userId,
      });

      return result;
    } catch (error) {
      this.metrics.queries.errorRate++;
      logger.error('Failed to search evidence', {
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Perform comprehensive evidence analysis with advanced analytics
   */
  public async analyzeEvidence(
    evidenceIds: string[],
    context: IEvidenceContext,
    options: any = {}
  ): Promise<any> {
    try {
      const result = await this.evidenceAnalyticsEngine.analyzeEvidence(
        evidenceIds,
        context,
        options
      );

      // Update metrics
      this.metrics.analytics.patternsDetected += result.patterns.length;
      this.metrics.analytics.anomaliesFound += result.findings.filter(
        f => f.type === 'anomaly'
      ).length;

      logger.info('Evidence analysis completed via data layer orchestrator', {
        analysisId: result.analysisId,
        evidenceAnalyzed: result.evidenceAnalyzed,
        findingsCount: result.findings.length,
        correlationsCount: result.correlations.length,
        overallRisk: result.riskAssessment.overall_risk,
        userId: context.userId,
      });

      return result;
    } catch (error) {
      logger.error('Failed to analyze evidence', {
        evidenceIds,
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create evidence from IOC data (integration with existing IOC services)
   */
  public async createEvidenceFromIOC(
    iocData: any,
    context: IEvidenceContext
  ): Promise<IEvidence> {
    const request: ICreateEvidenceRequest = {
      type: EvidenceType.IOC_EVIDENCE,
      sourceType: iocData.sourceType || ('internal_detection' as any),
      sourceId: iocData.id || iocData.value,
      sourceSystem: iocData.source || 'phantom-spire',
      data: {
        value: iocData.value,
        type: iocData.type,
        confidence: iocData.confidence,
        severity: iocData.severity,
        tags: iocData.tags,
        sources: iocData.sources,
        firstSeen: iocData.firstSeen,
        lastSeen: iocData.lastSeen,
      },
      metadata: {
        title: `IOC Evidence: ${iocData.value}`,
        description: `Evidence for IOC ${iocData.type}: ${iocData.value}`,
        severity: iocData.severity || 'medium',
        confidence: iocData.confidence || 50,
        format: 'json',
      },
      classification: this.mapSeverityToClassification(iocData.severity),
      tags: iocData.tags || [],
      handling: [
        {
          type: 'retention',
          instruction: 'Retain for threat intelligence purposes',
          authority: 'system',
        },
      ],
    };

    return this.createEvidence(request, context);
  }

  /**
   * Get evidence metrics and statistics
   */
  public async getEvidenceMetrics(timeRange?: { start: Date; end: Date }) {
    try {
      const metrics = await this.evidenceManager.getEvidenceMetrics(timeRange);

      logger.info('Evidence metrics retrieved', {
        totalEvidence: metrics.totalEvidence,
        averageConfidence: metrics.averageConfidence,
        integrityViolations: metrics.custodyMetrics.integrityViolations,
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to retrieve evidence metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate evidence report
   */
  public async generateEvidenceReport(
    query: any,
    context: IEvidenceContext
  ): Promise<any> {
    try {
      const report = await this.evidenceManager.generateEvidenceReport(
        query,
        context
      );

      logger.info('Evidence report generated', {
        title: report.title,
        evidenceCount: report.evidence.length,
        generatedBy: context.userId,
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate evidence report', {
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify evidence integrity
   */
  public async verifyEvidenceIntegrity(
    evidenceId: string,
    context: IEvidenceContext
  ) {
    try {
      const result = await this.evidenceManager.verifyIntegrity(
        evidenceId,
        context
      );

      logger.info('Evidence integrity verification completed', {
        evidenceId,
        isValid: result.isValid,
        algorithm: result.algorithm,
        userId: context.userId,
      });

      return result;
    } catch (error) {
      logger.error('Failed to verify evidence integrity', {
        evidenceId,
        userId: context.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Private helper method to map IOC severity to evidence classification
   */
  private mapSeverityToClassification(severity?: string): ClassificationLevel {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return ClassificationLevel.TLP_RED;
      case 'high':
        return ClassificationLevel.TLP_AMBER;
      case 'medium':
        return ClassificationLevel.TLP_GREEN;
      case 'low':
      default:
        return ClassificationLevel.TLP_WHITE;
    }
  }
}
