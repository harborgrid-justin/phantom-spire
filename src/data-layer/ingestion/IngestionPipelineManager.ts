/**
 * Ingestion Pipeline Manager
 * Orchestrates ETL operations for Fortune 100-grade data ingestion
 */

import { logger } from '../../utils/logger';
import { EventEmitter } from 'events';
import {
  IDataPipeline,
  IPipelineResult,
  IPipelineMetrics,
  IPipelineStage,
  IPipelineStageResult,
  IValidationResult,
  IDataConnector,
  IExtractionRequest,
  IExtractionResult,
  ITransformationRule,
  ILoadResult,
} from '../interfaces/IDataConnector';
import { IDataRecord } from '../interfaces/IDataSource';

export interface IPipelineConfig {
  maxConcurrentStages: number;
  stageTimeoutMs: number;
  enableCheckpointing: boolean;
  checkpointIntervalMs: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    exponentialBackoff: boolean;
  };
  validation: {
    enableSchemaValidation: boolean;
    enableDataQualityChecks: boolean;
    failFast: boolean;
  };
}

export interface IPipelineContext {
  pipelineId: string;
  executionId: string;
  startTime: Date;
  metadata: Record<string, any>;
  checkpoints: IPipelineCheckpoint[];
}

export interface IPipelineCheckpoint {
  stageId: string;
  stageName: string;
  timestamp: Date;
  recordsProcessed: number;
  data: any;
  state: Record<string, any>;
}

export interface IStageExecutionContext {
  stageIndex: number;
  stage: IPipelineStage;
  pipelineContext: IPipelineContext;
  inputData: any;
  previousResults: IPipelineStageResult[];
}

export class IngestionPipelineManager extends EventEmitter {
  private config: IPipelineConfig;
  private runningPipelines: Map<string, IPipelineExecution> = new Map();
  private stageRegistry: Map<string, IStageProcessor> = new Map();

  constructor(config: IPipelineConfig) {
    super();
    this.config = config;
    this.initializeStageRegistry();
    
    logger.info('IngestionPipelineManager initialized', {
      maxConcurrentStages: config.maxConcurrentStages,
      enableCheckpointing: config.enableCheckpointing,
    });
  }

  /**
   * Execute a data pipeline
   */
  public async executePipeline(
    pipeline: IDataPipeline,
    inputData: any,
    context?: Record<string, any>
  ): Promise<IPipelineResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    const pipelineContext: IPipelineContext = {
      pipelineId: pipeline.name,
      executionId,
      startTime: new Date(),
      metadata: context || {},
      checkpoints: [],
    };

    logger.info('Starting pipeline execution', {
      pipelineId: pipeline.name,
      executionId,
      stageCount: pipeline.stages.length,
    });

    const execution: IPipelineExecution = {
      id: executionId,
      pipeline,
      context: pipelineContext,
      status: 'running',
      startTime: new Date(),
      stageResults: [],
    };

    this.runningPipelines.set(executionId, execution);
    this.emit('pipelineStarted', execution);

    try {
      // Validate pipeline before execution
      const validationResult = await pipeline.validate();
      if (!validationResult.isValid && this.config.validation.failFast) {
        throw new Error(`Pipeline validation failed: ${validationResult.errors?.join(', ')}`);
      }

      // Execute stages sequentially or in parallel based on dependencies
      const stageResults = await this.executeStages(pipeline.stages, inputData, pipelineContext);
      
      const totalTime = Date.now() - startTime;
      const totalRecords = stageResults.reduce((sum, result) => sum + result.recordsProcessed, 0);

      const result: IPipelineResult = {
        success: stageResults.every(result => result.success),
        stages: stageResults,
        totalTime,
        recordsProcessed: totalRecords,
        errors: stageResults
          .filter(result => result.errors && result.errors.length > 0)
          .flatMap(result => result.errors || []),
      };

      execution.status = result.success ? 'completed' : 'failed';
      execution.endTime = new Date();
      execution.result = result;

      logger.info('Pipeline execution completed', {
        pipelineId: pipeline.name,
        executionId,
        success: result.success,
        totalTime,
        recordsProcessed: totalRecords,
      });

      this.emit('pipelineCompleted', execution);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = errorMessage;

      logger.error('Pipeline execution failed', {
        pipelineId: pipeline.name,
        executionId,
        error: errorMessage,
      });

      this.emit('pipelineFailed', execution);
      throw error;

    } finally {
      this.runningPipelines.delete(executionId);
    }
  }

  /**
   * Create a new pipeline with validation
   */
  public createPipeline(
    name: string,
    stages: IPipelineStage[]
  ): IDataPipeline {
    return new IngestionPipeline(name, stages, this.config);
  }

  /**
   * Get metrics for a running pipeline
   */
  public getPipelineMetrics(executionId: string): IPipelineMetrics | undefined {
    const execution = this.runningPipelines.get(executionId);
    if (!execution) {
      return undefined;
    }

    const now = Date.now();
    const executionTime = now - execution.startTime.getTime();
    const recordsProcessed = execution.stageResults.reduce(
      (sum, result) => sum + result.recordsProcessed, 
      0
    );

    return {
      status: execution.status === 'cancelled' ? 'paused' : execution.status,
      progress: execution.stageResults.length / execution.pipeline.stages.length,
      startTime: execution.startTime,
      recordsProcessed,
      throughput: recordsProcessed / (executionTime / 1000) || 0,
      errors: execution.stageResults.filter(r => !r.success).length,
      warnings: 0, // Would be calculated from stage results
    };
  }

  /**
   * List all running pipelines
   */
  public getRunningPipelines(): string[] {
    return Array.from(this.runningPipelines.keys());
  }

  /**
   * Cancel a running pipeline
   */
  public async cancelPipeline(executionId: string): Promise<void> {
    const execution = this.runningPipelines.get(executionId);
    if (!execution) {
      throw new Error(`Pipeline execution ${executionId} not found`);
    }

    execution.status = 'cancelled';
    logger.info('Pipeline execution cancelled', {
      pipelineId: execution.pipeline.name,
      executionId,
    });

    this.emit('pipelineCancelled', execution);
    this.runningPipelines.delete(executionId);
  }

  /**
   * Private methods for stage execution
   */

  private async executeStages(
    stages: IPipelineStage[],
    inputData: any,
    pipelineContext: IPipelineContext
  ): Promise<IPipelineStageResult[]> {
    const results: IPipelineStageResult[] = [];
    let currentData = inputData;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      // Check for parallel execution opportunity
      if (stage.parallel && i > 0) {
        // Execute this stage in parallel with compatible stages
        currentData = await this.executeStageParallel(stage, currentData, {
          stageIndex: i,
          stage,
          pipelineContext,
          inputData: currentData,
          previousResults: results,
        });
      } else {
        // Execute stage sequentially
        const stageResult = await this.executeStage({
          stageIndex: i,
          stage,
          pipelineContext,
          inputData: currentData,
          previousResults: results,
        });

        results.push(stageResult);
        
        // Update input data for next stage
        if (stageResult.success && stage.type !== 'validate') {
          currentData = (stageResult as any).outputData || currentData;
        }

        // Create checkpoint if enabled
        if (this.config.enableCheckpointing) {
          await this.createCheckpoint(pipelineContext, stage, stageResult, currentData);
        }

        // Fail fast if stage failed and validation is strict
        if (!stageResult.success && this.config.validation.failFast) {
          throw new Error(`Stage ${stage.name} failed: ${stageResult.errors?.join(', ')}`);
        }
      }
    }

    return results;
  }

  private async executeStage(
    context: IStageExecutionContext
  ): Promise<IPipelineStageResult> {
    const { stage, inputData } = context;
    const startTime = Date.now();

    logger.debug('Executing pipeline stage', {
      stageName: stage.name,
      stageType: stage.type,
      pipelineId: context.pipelineContext.pipelineId,
    });

    try {
      const processor = this.stageRegistry.get(stage.type);
      if (!processor) {
        throw new Error(`No processor found for stage type: ${stage.type}`);
      }

      const result = await Promise.race([
        processor.process(stage, inputData, context),
        this.createTimeoutPromise(this.config.stageTimeoutMs),
      ]);

      const executionTime = Date.now() - startTime;

      return {
        stageName: stage.name,
        success: true,
        executionTime,
        recordsProcessed: this.countRecords(result),
        ...result,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Stage execution failed', {
        stageName: stage.name,
        error: errorMessage,
        executionTime,
      });

      return {
        stageName: stage.name,
        success: false,
        executionTime,
        recordsProcessed: 0,
        errors: [errorMessage],
      };
    }
  }

  private async executeStageParallel(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    // Simplified parallel execution - in production this would be more sophisticated
    const result = await this.executeStage(context);
    return (result as any).outputData || inputData;
  }

  private async createCheckpoint(
    pipelineContext: IPipelineContext,
    stage: IPipelineStage,
    result: IPipelineStageResult,
    data: any
  ): Promise<void> {
    const checkpoint: IPipelineCheckpoint = {
      stageId: stage.name,
      stageName: stage.name,
      timestamp: new Date(),
      recordsProcessed: result.recordsProcessed,
      data: this.serializeCheckpointData(data),
      state: { stageConfig: stage.config },
    };

    pipelineContext.checkpoints.push(checkpoint);
    
    logger.debug('Pipeline checkpoint created', {
      pipelineId: pipelineContext.pipelineId,
      stageName: stage.name,
      recordsProcessed: result.recordsProcessed,
    });
  }

  private initializeStageRegistry(): void {
    // Register built-in stage processors
    this.stageRegistry.set('extract', new ExtractionStageProcessor());
    this.stageRegistry.set('transform', new TransformationStageProcessor());
    this.stageRegistry.set('load', new LoadStageProcessor());
    this.stageRegistry.set('validate', new ValidationStageProcessor());
    this.stageRegistry.set('enrich', new EnrichmentStageProcessor());

    logger.debug('Stage registry initialized', {
      processorCount: this.stageRegistry.size,
    });
  }

  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Stage execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private countRecords(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    }
    if (data && typeof data === 'object' && 'length' in data) {
      return data.length;
    }
    return data ? 1 : 0;
  }

  private serializeCheckpointData(data: any): any {
    // In production, this would handle large datasets more efficiently
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return { type: 'serialization_error', size: JSON.stringify(data).length };
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Concrete Pipeline Implementation
 */
class IngestionPipeline implements IDataPipeline {
  public readonly name: string;
  public readonly stages: IPipelineStage[];
  private config: IPipelineConfig;

  constructor(name: string, stages: IPipelineStage[], config: IPipelineConfig) {
    this.name = name;
    this.stages = stages;
    this.config = config;
  }

  public async execute(input: any, context?: any): Promise<IPipelineResult> {
    // This would be handled by the PipelineManager
    throw new Error('Pipeline execution should be handled by IngestionPipelineManager');
  }

  public async validate(): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate stage configuration
    for (const stage of this.stages) {
      if (!stage.name || !stage.type) {
        errors.push(`Stage missing required fields: name=${stage.name}, type=${stage.type}`);
      }

      // Validate dependencies
      if (stage.dependencies) {
        for (const dependency of stage.dependencies) {
          if (!this.stages.find(s => s.name === dependency)) {
            errors.push(`Stage ${stage.name} depends on non-existent stage: ${dependency}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : [],
      warnings: warnings.length > 0 ? warnings : [],
    };
  }

  public async monitor(): Promise<IPipelineMetrics> {
    // Basic static metrics for pipeline definition
    return {
      status: 'completed',
      progress: 1,
      startTime: new Date(),
      recordsProcessed: 0,
      throughput: 0,
      errors: 0,
      warnings: 0,
    };
  }
}

/**
 * Stage Processors
 */
interface IStageProcessor {
  process(stage: IPipelineStage, inputData: any, context: IStageExecutionContext): Promise<any>;
}

class ExtractionStageProcessor implements IStageProcessor {
  public async process(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    // Extract data using the configured connector
    if (stage.connector) {
      const extractionRequest: IExtractionRequest = {
        source: stage.config.source || 'default',
        query: stage.config.query || {},
        batchSize: stage.config.batchSize || 1000,
        format: stage.config.format,
      };

      const result = await stage.connector.extract(extractionRequest);
      return { outputData: result.data, metadata: result.metadata };
    }

    return { outputData: inputData };
  }
}

class TransformationStageProcessor implements IStageProcessor {
  public async process(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    const rules = stage.config.rules as ITransformationRule[] || [];
    let transformedData = Array.isArray(inputData) ? inputData : [inputData];

    for (const rule of rules) {
      transformedData = this.applyTransformationRule(transformedData, rule);
    }

    return { outputData: transformedData };
  }

  private applyTransformationRule(data: any[], rule: ITransformationRule): any[] {
    switch (rule.type) {
      case 'map':
        return data.map(item => this.mapFields(item, rule));
      case 'filter':
        return data.filter(item => this.filterItem(item, rule));
      case 'enrich':
        return data.map(item => this.enrichItem(item, rule));
      default:
        return data;
    }
  }

  private mapFields(item: any, rule: ITransformationRule): any {
    const result = { ...item };
    if (rule.source && rule.target) {
      result[rule.target] = item[rule.source];
    }
    return result;
  }

  private filterItem(item: any, rule: ITransformationRule): boolean {
    // Simple condition evaluation
    if (rule.conditions) {
      for (const [field, expectedValue] of Object.entries(rule.conditions)) {
        if (item[field] !== expectedValue) {
          return false;
        }
      }
    }
    return true;
  }

  private enrichItem(item: any, rule: ITransformationRule): any {
    const enriched = { ...item };
    if (rule.parameters) {
      Object.assign(enriched, rule.parameters);
    }
    return enriched;
  }
}

class LoadStageProcessor implements IStageProcessor {
  public async process(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    // Load data using the configured connector
    if (stage.connector) {
      const records = Array.isArray(inputData) ? inputData : [inputData];
      const target = typeof stage.config.target === 'string' ? stage.config.target : 'default';
      const result = await stage.connector.load(records, target);
      return { loadResult: result };
    }

    return { outputData: inputData };
  }
}

class ValidationStageProcessor implements IStageProcessor {
  public async process(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    const data = Array.isArray(inputData) ? inputData : [inputData];
    const errors: string[] = [];
    let validRecords = 0;

    for (const record of data) {
      if (this.validateRecord(record, stage.config)) {
        validRecords++;
      } else {
        errors.push(`Validation failed for record: ${JSON.stringify(record).substring(0, 100)}`);
      }
    }

    return {
      outputData: inputData,
      validationResult: {
        totalRecords: data.length,
        validRecords,
        errors,
      },
    };
  }

  private validateRecord(record: any, config: any): boolean {
    // Simple validation - would be more sophisticated in production
    const requiredFields = config.requiredFields || [];
    return requiredFields.every((field: string) => record[field] !== undefined);
  }
}

class EnrichmentStageProcessor implements IStageProcessor {
  public async process(
    stage: IPipelineStage,
    inputData: any,
    context: IStageExecutionContext
  ): Promise<any> {
    // Simple enrichment - would integrate with external services in production
    const data = Array.isArray(inputData) ? inputData : [inputData];
    
    const enrichedData = data.map(record => ({
      ...record,
      enriched: true,
      enrichmentTimestamp: new Date().toISOString(),
      pipelineId: context.pipelineContext.pipelineId,
    }));

    return { outputData: enrichedData };
  }
}

/**
 * Pipeline execution tracking
 */
interface IPipelineExecution {
  id: string;
  pipeline: IDataPipeline;
  context: IPipelineContext;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  stageResults: IPipelineStageResult[];
  result?: IPipelineResult;
  error?: string;
}