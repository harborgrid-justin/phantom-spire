/**
 * Message Types for Cyber Threat Intelligence Platform
 * Strongly typed messages for Fortune 100-grade threat intelligence operations
 */

import { IMessage } from './IMessageQueue.js';
import { IIOC } from '../../models/IOC.js';
import {
  IDataRecord,
  IQueryContext,
} from '../../data-layer/interfaces/IDataSource.js';
import { IAnalyticsResult } from '../../data-layer/analytics/AdvancedAnalyticsEngine.js';

// IOC-related Messages
export interface IIOCEnrichmentRequest {
  readonly iocId: string;
  readonly ioc: IIOC;
  readonly enrichmentOptions: {
    readonly includeReputation: boolean;
    readonly includeGeolocation: boolean;
    readonly includeMalwareAnalysis: boolean;
    readonly includeRelationships: boolean;
  };
  readonly context: IQueryContext;
}

export interface IIOCEnrichmentResult {
  readonly iocId: string;
  readonly originalIoc: IIOC;
  readonly enrichedData: {
    readonly reputation?: IReputationData;
    readonly geolocation?: IGeolocationData;
    readonly malwareAnalysis?: IMalwareAnalysis;
    readonly relationships?: IRelationshipData[];
  };
  readonly sources: string[];
  readonly confidence: number;
  readonly enrichmentTime: Date;
}

export interface IReputationData {
  readonly score: number;
  readonly categories: string[];
  readonly lastSeen: Date;
  readonly prevalence: number;
  readonly sources: string[];
}

export interface IGeolocationData {
  readonly country: string;
  readonly city?: string;
  readonly coordinates?: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly asn?: number;
  readonly isp?: string;
}

export interface IMalwareAnalysis {
  readonly families: string[];
  readonly signatures: string[];
  readonly behaviors: string[];
  readonly confidence: number;
  readonly analysisDate: Date;
}

export interface IRelationshipData {
  readonly relatedIocId: string;
  readonly relationshipType: string;
  readonly confidence: number;
  readonly evidence: string[];
}

// Threat Analysis Messages
export interface IThreatAnalysisRequest {
  readonly analysisId: string;
  readonly iocs: IIOC[];
  readonly analysisType:
    | 'campaign'
    | 'attribution'
    | 'behavioral'
    | 'infrastructure';
  readonly options: {
    readonly includePredictions: boolean;
    readonly includeAnomalies: boolean;
    readonly timeWindow: {
      readonly start: Date;
      readonly end: Date;
    };
  };
  readonly context: IQueryContext;
}

export interface IThreatAnalysisResult {
  readonly analysisId: string;
  readonly findings: IThreatFinding[];
  readonly campaigns?: ICampaignAnalysis[];
  readonly attributions?: IAttributionAnalysis[];
  readonly predictions?: IPredictionAnalysis[];
  readonly anomalies?: IAnomalyAnalysis[];
  readonly confidence: number;
  readonly analysisTime: Date;
}

export interface IThreatFinding {
  readonly id: string;
  readonly type: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly indicators: IIOC[];
  readonly evidence: string[];
  readonly confidence: number;
}

export interface ICampaignAnalysis {
  readonly campaignId: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly indicators: IIOC[];
  readonly ttps: string[];
  readonly attribution: string[];
  readonly confidence: number;
}

export interface IAttributionAnalysis {
  readonly actorId: string;
  readonly actorName: string;
  readonly confidence: number;
  readonly evidence: string[];
  readonly techniques: string[];
  readonly infrastructure: IIOC[];
}

export interface IPredictionAnalysis {
  readonly predictionType: string;
  readonly probability: number;
  readonly timeframe: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly indicators: IIOC[];
  readonly reasoning: string[];
}

export interface IAnomalyAnalysis {
  readonly anomalyId: string;
  readonly type: string;
  readonly severity: number;
  readonly description: string;
  readonly affectedIndicators: IIOC[];
  readonly detectionTime: Date;
}

// Data Integration Messages
export interface IDataIngestionRequest {
  readonly sourceId: string;
  readonly sourceName: string;
  readonly dataType: string;
  readonly format: 'json' | 'xml' | 'csv' | 'stix' | 'misp';
  readonly data: unknown[];
  readonly metadata: {
    readonly batchId: string;
    readonly totalRecords: number;
    readonly ingestionTimestamp: Date;
  };
  readonly validationRules?: IValidationRule[];
}

export interface IValidationRule {
  readonly field: string;
  readonly rule: string;
  readonly required: boolean;
  readonly defaultValue?: unknown;
}

export interface IDataIngestionResult {
  readonly batchId: string;
  readonly sourceId: string;
  readonly processed: number;
  readonly successful: number;
  readonly failed: number;
  readonly duplicates: number;
  readonly errors: IProcessingError[];
  readonly processedData: IDataRecord[];
  readonly processingTime: number;
}

export interface IProcessingError {
  readonly recordIndex: number;
  readonly field?: string;
  readonly error: string;
  readonly severity: 'error' | 'warning';
  readonly code?: string;
}

// Real-time Alert Messages
export interface IThreatAlertNotification {
  readonly alertId: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  readonly title: string;
  readonly description: string;
  readonly threatType: string;
  readonly indicators: IIOC[];
  readonly affectedSystems?: string[];
  readonly recommendedActions: IRecommendedAction[];
  readonly detectionTime: Date;
  readonly expirationTime?: Date;
  readonly tags: string[];
}

export interface IRecommendedAction {
  readonly action: string;
  readonly priority: number;
  readonly description: string;
  readonly automated: boolean;
}

// Analytics Pipeline Messages
export interface IAnalyticsPipelineRequest {
  readonly pipelineId: string;
  readonly pipelineName: string;
  readonly inputData: IDataRecord[];
  readonly analysisSteps: IAnalysisStep[];
  readonly options: {
    readonly parallelExecution: boolean;
    readonly timeout: number;
    readonly retryOnFailure: boolean;
  };
  readonly context: IQueryContext;
}

export interface IAnalysisStep {
  readonly stepId: string;
  readonly stepType: string;
  readonly configuration: Record<string, unknown>;
  readonly dependencies?: string[];
}

export interface IAnalyticsPipelineResult {
  readonly pipelineId: string;
  readonly executionId: string;
  readonly results: IAnalyticsResult[];
  readonly stepResults: IStepResult[];
  readonly executionTime: number;
  readonly success: boolean;
  readonly errors?: string[];
}

export interface IStepResult {
  readonly stepId: string;
  readonly success: boolean;
  readonly executionTime: number;
  readonly outputData?: IDataRecord[];
  readonly metrics?: Record<string, number>;
  readonly errors?: string[];
}

// Message Type Constants
export const MessageTypes = {
  // IOC Messages
  IOC_ENRICHMENT_REQUEST: 'ioc.enrichment.request',
  IOC_ENRICHMENT_RESULT: 'ioc.enrichment.result',
  IOC_VALIDATION_REQUEST: 'ioc.validation.request',
  IOC_VALIDATION_RESULT: 'ioc.validation.result',

  // Threat Analysis Messages
  THREAT_ANALYSIS_REQUEST: 'threat.analysis.request',
  THREAT_ANALYSIS_RESULT: 'threat.analysis.result',
  CAMPAIGN_DISCOVERY: 'threat.campaign.discovery',
  ATTRIBUTION_ANALYSIS: 'threat.attribution.analysis',

  // Data Integration Messages
  DATA_INGESTION_REQUEST: 'data.ingestion.request',
  DATA_INGESTION_RESULT: 'data.ingestion.result',
  DATA_VALIDATION_REQUEST: 'data.validation.request',
  DATA_VALIDATION_RESULT: 'data.validation.result',

  // Alert Messages
  THREAT_ALERT_NOTIFICATION: 'alert.threat.notification',
  ALERT_ESCALATION: 'alert.escalation',
  ALERT_ACKNOWLEDGMENT: 'alert.acknowledgment',

  // Analytics Pipeline Messages
  ANALYTICS_PIPELINE_REQUEST: 'analytics.pipeline.request',
  ANALYTICS_PIPELINE_RESULT: 'analytics.pipeline.result',
  ANALYTICS_STEP_COMPLETE: 'analytics.step.complete',

  // System Messages
  SYSTEM_HEALTH_CHECK: 'system.health.check',
  SYSTEM_METRICS_UPDATE: 'system.metrics.update',
  SYSTEM_CONFIGURATION_CHANGE: 'system.config.change',
} as const;

// Queue Topic Constants
export const QueueTopics = {
  IOC_PROCESSING: 'ioc.processing',
  THREAT_ANALYSIS: 'threat.analysis',
  DATA_INGESTION: 'data.ingestion',
  REAL_TIME_ALERTS: 'alerts.realtime',
  ANALYTICS_PIPELINE: 'analytics.pipeline',
  SYSTEM_EVENTS: 'system.events',
  DEAD_LETTER: 'dead.letter',
} as const;

// Typed Message Definitions
export type IOCEnrichmentRequestMessage = IMessage<IIOCEnrichmentRequest>;
export type IOCEnrichmentResultMessage = IMessage<IIOCEnrichmentResult>;
export type ThreatAnalysisRequestMessage = IMessage<IThreatAnalysisRequest>;
export type ThreatAnalysisResultMessage = IMessage<IThreatAnalysisResult>;
export type DataIngestionRequestMessage = IMessage<IDataIngestionRequest>;
export type DataIngestionResultMessage = IMessage<IDataIngestionResult>;
export type ThreatAlertNotificationMessage = IMessage<IThreatAlertNotification>;
export type AnalyticsPipelineRequestMessage =
  IMessage<IAnalyticsPipelineRequest>;
export type AnalyticsPipelineResultMessage = IMessage<IAnalyticsPipelineResult>;
