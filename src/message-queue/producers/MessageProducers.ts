/**
 * Message Producers for Threat Intelligence Operations
 * Enterprise-grade message production for IOC processing, threat analysis, and data ingestion
 */

import { logger } from '../../utils/logger.js';
import { MessageQueueManager } from '../core/MessageQueueManager.js';
import { 
  IMessage, 
  MessagePriority,
  IMessageMetadata 
} from '../interfaces/IMessageQueue.js';
import {
  MessageTypes,
  QueueTopics,
  IIOCEnrichmentRequest,
  IThreatAnalysisRequest,
  IDataIngestionRequest,
  IThreatAlertNotification,
  IAnalyticsPipelineRequest,
  IOCEnrichmentRequestMessage,
  ThreatAnalysisRequestMessage,
  DataIngestionRequestMessage,
  ThreatAlertNotificationMessage,
  AnalyticsPipelineRequestMessage
} from '../interfaces/IMessageTypes.js';
import { IIOC } from '../../models/IOC.js';
import { IQueryContext, IDataRecord } from '../../data-layer/interfaces/IDataSource.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base Message Producer
 * Provides common functionality for all message producers
 */
export abstract class BaseMessageProducer {
  protected readonly queueManager: MessageQueueManager;
  protected readonly serviceName: string;

  constructor(queueManager: MessageQueueManager, serviceName: string) {
    this.queueManager = queueManager;
    this.serviceName = serviceName;
  }

  /**
   * Create base message metadata
   */
  protected createMessageMetadata(
    priority: MessagePriority = MessagePriority.MEDIUM,
    maxRetries: number = 3,
    processingTimeout: number = 30000
  ): IMessageMetadata {
    return {
      source: this.serviceName,
      version: '1.0.0',
      priority,
      retryCount: 0,
      maxRetries,
      processingTimeout,
      tracing: {
        traceId: uuidv4(),
        spanId: uuidv4(),
      },
    };
  }

  /**
   * Create base message structure
   */
  protected createMessage<T>(
    type: string,
    topic: string,
    payload: T,
    metadata?: Partial<IMessageMetadata>,
    headers?: Record<string, string>
  ): Omit<IMessage<T>, 'id' | 'timestamp'> {
    return {
      type,
      topic,
      payload,
      metadata: {
        ...this.createMessageMetadata(),
        ...metadata,
      },
      headers,
      correlationId: uuidv4(),
    };
  }
}

/**
 * IOC Processing Message Producer
 * Handles IOC enrichment, validation, and analysis message production
 */
export class IOCMessageProducer extends BaseMessageProducer {
  constructor(queueManager: MessageQueueManager) {
    super(queueManager, 'IOCMessageProducer');
  }

  /**
   * Publish IOC enrichment request
   */
  public async publishIOCEnrichmentRequest(
    ioc: IIOC,
    enrichmentOptions: {
      includeReputation: boolean;
      includeGeolocation: boolean;
      includeMalwareAnalysis: boolean;
      includeRelationships: boolean;
    },
    context: IQueryContext,
    priority: MessagePriority = MessagePriority.HIGH
  ): Promise<string> {
    try {
      const payload: IIOCEnrichmentRequest = {
        iocId: ioc._id?.toString() || uuidv4(),
        ioc,
        enrichmentOptions,
        context,
      };

      const message = this.createMessage(
        MessageTypes.IOC_ENRICHMENT_REQUEST,
        QueueTopics.IOC_PROCESSING,
        payload,
        {
          priority,
          maxRetries: 3,
          processingTimeout: 60000, // 1 minute for enrichment
        },
        {
          'ioc-type': ioc.type,
          'ioc-value': ioc.value,
          'urgency': priority.toString(),
        }
      );

      const result = await this.queueManager.publish('ioc-processing', message);
      
      logger.info('Published IOC enrichment request', {
        messageId: result.messageId,
        iocId: payload.iocId,
        iocType: ioc.type,
        iocValue: ioc.value,
        priority,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish IOC enrichment request', {
        error,
        iocId: ioc._id,
        iocType: ioc.type,
      });
      throw error;
    }
  }

  /**
   * Publish IOC validation request
   */
  public async publishIOCValidationRequest(
    ioc: IIOC,
    validationRules: string[] = [],
    context: IQueryContext,
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<string> {
    try {
      const payload = {
        iocId: ioc._id?.toString() || uuidv4(),
        ioc,
        validationRules,
        context,
      };

      const message = this.createMessage(
        MessageTypes.IOC_VALIDATION_REQUEST,
        QueueTopics.IOC_PROCESSING,
        payload,
        {
          priority,
          maxRetries: 2,
          processingTimeout: 30000,
        }
      );

      const result = await this.queueManager.publish('ioc-processing', message);
      
      logger.info('Published IOC validation request', {
        messageId: result.messageId,
        iocId: payload.iocId,
        validationRules,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish IOC validation request', error);
      throw error;
    }
  }
}

/**
 * Threat Analysis Message Producer
 * Handles threat analysis, campaign discovery, and attribution requests
 */
export class ThreatAnalysisMessageProducer extends BaseMessageProducer {
  constructor(queueManager: MessageQueueManager) {
    super(queueManager, 'ThreatAnalysisMessageProducer');
  }

  /**
   * Publish threat analysis request
   */
  public async publishThreatAnalysisRequest(
    iocs: IIOC[],
    analysisType: 'campaign' | 'attribution' | 'behavioral' | 'infrastructure',
    options: {
      includePredictions: boolean;
      includeAnomalies: boolean;
      timeWindow: {
        start: Date;
        end: Date;
      };
    },
    context: IQueryContext,
    priority: MessagePriority = MessagePriority.HIGH
  ): Promise<string> {
    try {
      const payload: IThreatAnalysisRequest = {
        analysisId: uuidv4(),
        iocs,
        analysisType,
        options,
        context,
      };

      const message = this.createMessage(
        MessageTypes.THREAT_ANALYSIS_REQUEST,
        QueueTopics.THREAT_ANALYSIS,
        payload,
        {
          priority,
          maxRetries: 2,
          processingTimeout: 300000, // 5 minutes for complex analysis
        },
        {
          'analysis-type': analysisType,
          'ioc-count': iocs.length.toString(),
          'time-window': JSON.stringify(options.timeWindow),
        }
      );

      const result = await this.queueManager.publish('threat-analysis', message);
      
      logger.info('Published threat analysis request', {
        messageId: result.messageId,
        analysisId: payload.analysisId,
        analysisType,
        iocCount: iocs.length,
        priority,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish threat analysis request', error);
      throw error;
    }
  }

  /**
   * Publish campaign discovery request
   */
  public async publishCampaignDiscoveryRequest(
    iocs: IIOC[],
    timeRange: { start: Date; end: Date },
    context: IQueryContext,
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<string> {
    try {
      const payload = {
        discoveryId: uuidv4(),
        iocs,
        timeRange,
        context,
        options: {
          minIOCsPerCampaign: 5,
          maxCampaignAge: 365, // days
          includeTTPs: true,
        },
      };

      const message = this.createMessage(
        MessageTypes.CAMPAIGN_DISCOVERY,
        QueueTopics.THREAT_ANALYSIS,
        payload,
        {
          priority,
          maxRetries: 3,
          processingTimeout: 240000, // 4 minutes
        }
      );

      const result = await this.queueManager.publish('threat-analysis', message);
      
      logger.info('Published campaign discovery request', {
        messageId: result.messageId,
        discoveryId: payload.discoveryId,
        iocCount: iocs.length,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish campaign discovery request', error);
      throw error;
    }
  }
}

/**
 * Data Ingestion Message Producer
 * Handles data ingestion requests for various threat intelligence sources
 */
export class DataIngestionMessageProducer extends BaseMessageProducer {
  constructor(queueManager: MessageQueueManager) {
    super(queueManager, 'DataIngestionMessageProducer');
  }

  /**
   * Publish data ingestion request
   */
  public async publishDataIngestionRequest(
    sourceId: string,
    sourceName: string,
    dataType: string,
    format: 'json' | 'xml' | 'csv' | 'stix' | 'misp',
    data: unknown[],
    batchId: string = uuidv4(),
    validationRules: any[] = [],
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<string> {
    try {
      const payload: IDataIngestionRequest = {
        sourceId,
        sourceName,
        dataType,
        format,
        data,
        metadata: {
          batchId,
          totalRecords: data.length,
          ingestionTimestamp: new Date(),
        },
        validationRules,
      };

      const message = this.createMessage(
        MessageTypes.DATA_INGESTION_REQUEST,
        QueueTopics.DATA_INGESTION,
        payload,
        {
          priority,
          maxRetries: 3,
          processingTimeout: 120000, // 2 minutes per batch
        },
        {
          'source-id': sourceId,
          'source-name': sourceName,
          'data-type': dataType,
          'format': format,
          'record-count': data.length.toString(),
          'batch-id': batchId,
        }
      );

      const result = await this.queueManager.publish('data-ingestion', message);
      
      logger.info('Published data ingestion request', {
        messageId: result.messageId,
        sourceId,
        sourceName,
        dataType,
        format,
        recordCount: data.length,
        batchId,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish data ingestion request', {
        error,
        sourceId,
        sourceName,
        dataType,
        recordCount: data.length,
      });
      throw error;
    }
  }

  /**
   * Publish bulk data ingestion request for large datasets
   */
  public async publishBulkDataIngestionRequest(
    sourceId: string,
    sourceName: string,
    dataType: string,
    format: 'json' | 'xml' | 'csv' | 'stix' | 'misp',
    dataChunks: unknown[][],
    priority: MessagePriority = MessagePriority.LOW
  ): Promise<string[]> {
    const messageIds: string[] = [];

    try {
      const bulkId = uuidv4();
      
      for (let i = 0; i < dataChunks.length; i++) {
        const chunk = dataChunks[i];
        const batchId = `${bulkId}-chunk-${i}`;
        
        const messageId = await this.publishDataIngestionRequest(
          sourceId,
          sourceName,
          dataType,
          format,
          chunk,
          batchId,
          [],
          priority
        );
        
        messageIds.push(messageId);
      }

      logger.info('Published bulk data ingestion request', {
        bulkId,
        sourceId,
        sourceName,
        chunkCount: dataChunks.length,
        totalRecords: dataChunks.reduce((sum, chunk) => sum + chunk.length, 0),
        messageIds,
      });

      return messageIds;
    } catch (error) {
      logger.error('Failed to publish bulk data ingestion request', error);
      throw error;
    }
  }
}

/**
 * Alert Message Producer
 * Handles real-time threat alert notifications
 */
export class AlertMessageProducer extends BaseMessageProducer {
  constructor(queueManager: MessageQueueManager) {
    super(queueManager, 'AlertMessageProducer');
  }

  /**
   * Publish threat alert notification
   */
  public async publishThreatAlert(
    severity: 'critical' | 'high' | 'medium' | 'low' | 'informational',
    title: string,
    description: string,
    threatType: string,
    indicators: IIOC[],
    recommendedActions: Array<{
      action: string;
      priority: number;
      description: string;
      automated: boolean;
    }>,
    affectedSystems: string[] = [],
    tags: string[] = [],
    expirationTime?: Date
  ): Promise<string> {
    try {
      const priority = this.severityToPriority(severity);
      
      const payload: IThreatAlertNotification = {
        alertId: uuidv4(),
        severity,
        title,
        description,
        threatType,
        indicators,
        affectedSystems,
        recommendedActions,
        detectionTime: new Date(),
        expirationTime,
        tags,
      };

      const message = this.createMessage(
        MessageTypes.THREAT_ALERT_NOTIFICATION,
        QueueTopics.REAL_TIME_ALERTS,
        payload,
        {
          priority,
          maxRetries: 5, // Critical alerts need high retry count
          processingTimeout: 10000, // Quick processing for alerts
        },
        {
          'alert-severity': severity,
          'threat-type': threatType,
          'indicator-count': indicators.length.toString(),
          'affected-systems': affectedSystems.length.toString(),
        }
      );

      const result = await this.queueManager.publish('real-time-alerts', message);
      
      logger.info('Published threat alert notification', {
        messageId: result.messageId,
        alertId: payload.alertId,
        severity,
        title,
        threatType,
        indicatorCount: indicators.length,
        affectedSystemsCount: affectedSystems.length,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish threat alert notification', {
        error,
        severity,
        title,
        threatType,
      });
      throw error;
    }
  }

  /**
   * Publish alert escalation
   */
  public async publishAlertEscalation(
    originalAlertId: string,
    escalationReason: string,
    escalationLevel: number,
    assignedAnalysts: string[] = []
  ): Promise<string> {
    try {
      const payload = {
        escalationId: uuidv4(),
        originalAlertId,
        escalationReason,
        escalationLevel,
        assignedAnalysts,
        escalationTime: new Date(),
      };

      const message = this.createMessage(
        MessageTypes.ALERT_ESCALATION,
        QueueTopics.REAL_TIME_ALERTS,
        payload,
        {
          priority: MessagePriority.CRITICAL,
          maxRetries: 5,
          processingTimeout: 10000,
        }
      );

      const result = await this.queueManager.publish('real-time-alerts', message);
      
      logger.info('Published alert escalation', {
        messageId: result.messageId,
        escalationId: payload.escalationId,
        originalAlertId,
        escalationLevel,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish alert escalation', error);
      throw error;
    }
  }

  private severityToPriority(severity: string): MessagePriority {
    switch (severity) {
      case 'critical':
        return MessagePriority.CRITICAL;
      case 'high':
        return MessagePriority.HIGH;
      case 'medium':
        return MessagePriority.MEDIUM;
      case 'low':
        return MessagePriority.LOW;
      case 'informational':
      default:
        return MessagePriority.BACKGROUND;
    }
  }
}

/**
 * Analytics Pipeline Message Producer
 * Handles analytics pipeline execution requests
 */
export class AnalyticsPipelineMessageProducer extends BaseMessageProducer {
  constructor(queueManager: MessageQueueManager) {
    super(queueManager, 'AnalyticsPipelineMessageProducer');
  }

  /**
   * Publish analytics pipeline request
   */
  public async publishAnalyticsPipelineRequest(
    pipelineName: string,
    inputData: IDataRecord[],
    analysisSteps: Array<{
      stepId: string;
      stepType: string;
      configuration: Record<string, unknown>;
      dependencies?: string[];
    }>,
    options: {
      parallelExecution: boolean;
      timeout: number;
      retryOnFailure: boolean;
    },
    context: IQueryContext,
    priority: MessagePriority = MessagePriority.MEDIUM
  ): Promise<string> {
    try {
      const payload: IAnalyticsPipelineRequest = {
        pipelineId: uuidv4(),
        pipelineName,
        inputData,
        analysisSteps,
        options,
        context,
      };

      const message = this.createMessage(
        MessageTypes.ANALYTICS_PIPELINE_REQUEST,
        QueueTopics.ANALYTICS_PIPELINE,
        payload,
        {
          priority,
          maxRetries: options.retryOnFailure ? 3 : 1,
          processingTimeout: options.timeout,
        },
        {
          'pipeline-name': pipelineName,
          'input-records': inputData.length.toString(),
          'analysis-steps': analysisSteps.length.toString(),
          'parallel-execution': options.parallelExecution.toString(),
        }
      );

      const result = await this.queueManager.publish('analytics-pipeline', message);
      
      logger.info('Published analytics pipeline request', {
        messageId: result.messageId,
        pipelineId: payload.pipelineId,
        pipelineName,
        inputRecords: inputData.length,
        analysisSteps: analysisSteps.length,
        priority,
      });

      return result.messageId;
    } catch (error) {
      logger.error('Failed to publish analytics pipeline request', {
        error,
        pipelineName,
        inputRecords: inputData.length,
      });
      throw error;
    }
  }
}
