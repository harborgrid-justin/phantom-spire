/**
 * Data Connector Interfaces for Multi-Source Integration
 */

import { IDataRecord, IHealthStatus } from './IDataSource.js';
import type { IQuery } from './IDataSource.js';

export interface IDataConnector {
  readonly name: string;
  readonly type: string;
  readonly version: string;
  readonly supportedFormats: string[];
  
  initialize(config: IConnectorConfig): Promise<void>;
  validate(config: IConnectorConfig): Promise<IValidationResult>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  extract(request: IExtractionRequest): Promise<IExtractionResult>;
  transform(data: any[], transformationRules: ITransformationRule[]): Promise<IDataRecord[]>;
  load(records: IDataRecord[], target: string): Promise<ILoadResult>;
  healthCheck(): Promise<IHealthStatus>;
}

export interface IConnectorConfig {
  name: string;
  type: string;
  connection: IConnectionConfig;
  authentication?: IAuthConfig;
  options?: Record<string, any>;
  retryPolicy?: IRetryPolicy;
  timeout?: number;
}

export interface IConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  url?: string;
  path?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
}

export interface IAuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2' | 'certificate' | 'authkey';
  credentials: Record<string, string>;
}

export interface IRetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
}

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IExtractionRequest {
  source?: string;
  query?: IQuery;
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  batchSize?: number;
  format?: string;
}

export interface IExtractionResult {
  data: any[];
  metadata: {
    total: number;
    extracted: number;
    hasMore: boolean;
    nextToken?: string;
    executionTime: number;
  };
  errors?: string[];
}

export interface ITransformationRule {
  name: string;
  type: 'map' | 'filter' | 'enrich' | 'normalize' | 'validate';
  source: string;
  target?: string;
  expression?: string;
  parameters?: Record<string, any>;
  conditions?: Record<string, any>;
}

export interface ILoadResult {
  loaded: number;
  failed: number;
  errors: string[];
  duplicates?: number;
  executionTime: number;
}

export interface IDataPipeline {
  readonly name: string;
  readonly stages: IPipelineStage[];
  
  execute(input: any, context?: any): Promise<IPipelineResult>;
  validate(): Promise<IValidationResult>;
  monitor(): Promise<IPipelineMetrics>;
}

export interface IPipelineStage {
  name: string;
  type: 'extract' | 'transform' | 'load' | 'validate' | 'enrich';
  connector?: IDataConnector;
  config: Record<string, any>;
  dependencies?: string[];
  parallel?: boolean;
  retryable?: boolean;
}

export interface IPipelineResult {
  success: boolean;
  stages: IPipelineStageResult[];
  totalTime: number;
  recordsProcessed: number;
  errors?: string[];
}

export interface IPipelineStageResult {
  stageName: string;
  success: boolean;
  executionTime: number;
  recordsProcessed: number;
  errors?: string[];
  metrics?: Record<string, number>;
}

export interface IPipelineMetrics {
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-1
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  throughput: number; // records per second
  errors: number;
  warnings: number;
}