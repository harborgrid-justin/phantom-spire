/**
 * Base Data Connector - Abstract foundation for all data connectors
 */

import { logger } from '../../utils/logger.js';
import {
  IDataConnector,
  IConnectorConfig,
  IValidationResult,
  IExtractionRequest,
  IExtractionResult,
  ITransformationRule,
  ILoadResult
} from '../interfaces/IDataConnector.js';
import { IDataRecord, IHealthStatus } from '../interfaces/IDataSource.js';

export abstract class BaseDataConnector implements IDataConnector {
  public abstract readonly name: string;
  public abstract readonly type: string;
  public abstract readonly version: string;
  public abstract readonly supportedFormats: string[];

  protected config?: IConnectorConfig;
  protected connected: boolean = false;
  protected lastError?: Error;

  /**
   * Initialize the connector with configuration
   */
  public async initialize(config: IConnectorConfig): Promise<void> {
    try {
      // Validate configuration
      const validation = await this.validate(config);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      this.config = config;
      await this.performInitialization(config);
      
      logger.info(`Initialized connector: ${this.name}`);
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Failed to initialize connector ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Validate connector configuration
   */
  public async validate(config: IConnectorConfig): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.name) {
      errors.push('Connector name is required');
    }

    if (!config.type) {
      errors.push('Connector type is required');
    }

    if (!config.connection) {
      errors.push('Connection configuration is required');
    }

    // Validate connection config
    if (config.connection) {
      const connectionValidation = await this.validateConnection(config.connection);
      errors.push(...connectionValidation.errors);
      warnings.push(...connectionValidation.warnings);
    }

    // Validate authentication if present
    if (config.authentication) {
      const authValidation = await this.validateAuthentication(config.authentication);
      errors.push(...authValidation.errors);
      warnings.push(...authValidation.warnings);
    }

    // Custom validation by subclasses
    const customValidation = await this.performCustomValidation(config);
    errors.push(...customValidation.errors);
    warnings.push(...customValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Connect to the data source
   */
  public async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('Connector not initialized');
    }

    try {
      await this.performConnect();
      this.connected = true;
      logger.info(`Connected to data source: ${this.name}`);
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Failed to connect to data source: ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Disconnect from the data source
   */
  public async disconnect(): Promise<void> {
    try {
      await this.performDisconnect();
      this.connected = false;
      logger.info(`Disconnected from data source: ${this.name}`);
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Failed to disconnect from data source: ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Extract data from the source
   */
  public async extract(request: IExtractionRequest): Promise<IExtractionResult> {
    if (!this.connected) {
      throw new Error('Connector not connected');
    }

    const startTime = Date.now();
    
    try {
      logger.debug(`Extracting data from ${this.name}`, {
        filters: request.filters,
        batchSize: request.batchSize
      });

      const result = await this.performExtraction(request);
      
      result.metadata.executionTime = Date.now() - startTime;
      
      logger.info(`Extracted ${result.metadata.extracted} records from ${this.name}`, {
        total: result.metadata.total,
        executionTime: result.metadata.executionTime
      });

      return result;
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Extraction failed for ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Transform raw data using transformation rules
   */
  public async transform(
    data: any[],
    transformationRules: ITransformationRule[]
  ): Promise<IDataRecord[]> {
    const startTime = Date.now();
    
    try {
      logger.debug(`Transforming ${data.length} records with ${transformationRules.length} rules`);

      const transformed: IDataRecord[] = [];
      
      for (const rawItem of data) {
        const transformedItem = await this.transformSingleRecord(rawItem, transformationRules);
        if (transformedItem) {
          transformed.push(transformedItem);
        }
      }

      const executionTime = Date.now() - startTime;
      
      logger.info(`Transformed ${transformed.length}/${data.length} records`, {
        executionTime,
        successRate: (transformed.length / data.length) * 100
      });

      return transformed;
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Transformation failed for ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Load data into target system
   */
  public async load(records: IDataRecord[], target: string): Promise<ILoadResult> {
    const startTime = Date.now();
    
    try {
      logger.debug(`Loading ${records.length} records to ${target}`);

      const result = await this.performLoad(records, target);
      
      result.executionTime = Date.now() - startTime;
      
      logger.info(`Loaded ${result.loaded}/${records.length} records to ${target}`, {
        failed: result.failed,
        duplicates: result.duplicates,
        executionTime: result.executionTime
      });

      return result;
    } catch (error) {
      this.lastError = error as Error;
      logger.error(`Load failed for ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Check health status of the connector
   */
  public async healthCheck(): Promise<IHealthStatus> {
    const startTime = Date.now();
    
    try {
      const status = await this.performHealthCheck();
      status.lastCheck = new Date();
      status.responseTime = Date.now() - startTime;
      
      return status;
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        message: (error as Error).message
      };
    }
  }

  /**
   * Get connector statistics
   */
  public getStatistics(): {
    connected: boolean;
    lastError?: string;
    extractionCount: number;
    transformationCount: number;
    loadCount: number;
  } {
    return {
      connected: this.connected,
      ...(this.lastError?.message && { lastError: this.lastError.message }),
      extractionCount: 0, // Would be tracked in production
      transformationCount: 0,
      loadCount: 0
    };
  }

  // Abstract methods to be implemented by concrete connectors
  protected abstract performInitialization(config: IConnectorConfig): Promise<void>;
  protected abstract performConnect(): Promise<void>;
  protected abstract performDisconnect(): Promise<void>;
  protected abstract performExtraction(request: IExtractionRequest): Promise<IExtractionResult>;
  protected abstract performLoad(records: IDataRecord[], target: string): Promise<ILoadResult>;
  protected abstract performHealthCheck(): Promise<IHealthStatus>;

  // Virtual methods that can be overridden
  protected async validateConnection(_connection: any): Promise<IValidationResult> {
    return { isValid: true, errors: [], warnings: [] };
  }

  protected async validateAuthentication(_auth: any): Promise<IValidationResult> {
    return { isValid: true, errors: [], warnings: [] };
  }

  protected async performCustomValidation(_config: IConnectorConfig): Promise<IValidationResult> {
    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * Transform a single record using transformation rules
   */
  protected async transformSingleRecord(
    rawData: any,
    rules: ITransformationRule[]
  ): Promise<IDataRecord | null> {
    try {
      let transformedData = { ...rawData };
      const metadata: Record<string, any> = {
        originalData: rawData,
        transformationsApplied: []
      };

      for (const rule of rules) {
        const ruleResult = await this.applyTransformationRule(transformedData, rule);
        if (ruleResult.success) {
          transformedData = ruleResult.data;
          metadata.transformationsApplied.push(rule.name);
        } else {
          logger.warn(`Transformation rule ${rule.name} failed`, ruleResult.error);
          
          // If rule is critical and fails, skip the record
          if (rule.parameters?.critical) {
            return null;
          }
        }
      }

      // Create standardized data record
      const dataRecord: IDataRecord = {
        id: this.extractId(transformedData),
        type: this.extractType(transformedData),
        source: this.name,
        timestamp: this.extractTimestamp(transformedData),
        data: transformedData,
        metadata,
        provenance: {
          sourceSystem: this.name,
          collectedAt: new Date(),
          transformations: rules.map(rule => ({
            name: rule.name,
            version: '1.0',
            appliedAt: new Date(),
            ...(rule.parameters && { parameters: rule.parameters })
          })),
          quality: {
            completeness: this.calculateCompleteness(transformedData),
            accuracy: 1.0, // Would be calculated based on validation
            consistency: 1.0,
            timeliness: this.calculateTimeliness(transformedData)
          }
        }
      };

      return dataRecord;
    } catch (error) {
      logger.error(`Failed to transform record`, error);
      return null;
    }
  }

  /**
   * Apply a single transformation rule
   */
  protected async applyTransformationRule(
    data: any,
    rule: ITransformationRule
  ): Promise<{ success: boolean; data: any; error?: string }> {
    try {
      switch (rule.type) {
        case 'map':
          return this.applyMappingRule(data, rule);
        case 'filter':
          return this.applyFilterRule(data, rule);
        case 'enrich':
          return this.applyEnrichmentRule(data, rule);
        case 'normalize':
          return this.applyNormalizationRule(data, rule);
        case 'validate':
          return this.applyValidationRule(data, rule);
        default:
          return {
            success: false,
            data,
            error: `Unknown transformation rule type: ${rule.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        data,
        error: (error as Error).message
      };
    }
  }

  /**
   * Apply mapping transformation rule
   */
  protected applyMappingRule(data: any, rule: ITransformationRule): { success: boolean; data: any; error?: string } {
    const result = { ...data };
    
    if (rule.source && rule.target) {
      const sourceValue = this.getNestedValue(data, rule.source);
      if (sourceValue !== undefined) {
        this.setNestedValue(result, rule.target, sourceValue);
      }
    }

    return { success: true, data: result };
  }

  /**
   * Apply filter transformation rule
   */
  protected applyFilterRule(data: any, rule: ITransformationRule): { success: boolean; data: any; error?: string } {
    if (!rule.conditions) {
      return { success: true, data };
    }

    const passes = this.evaluateConditions(data, rule.conditions);
    
    return {
      success: passes,
      data: passes ? data : null
    };
  }

  /**
   * Apply enrichment transformation rule
   */
  protected async applyEnrichmentRule(data: any, rule: ITransformationRule): Promise<{ success: boolean; data: any; error?: string }> {
    // Basic enrichment - add metadata
    const enriched = {
      ...data,
      _enrichment: {
        timestamp: new Date(),
        rule: rule.name,
        connector: this.name
      }
    };

    return { success: true, data: enriched };
  }

  /**
   * Apply normalization transformation rule
   */
  protected applyNormalizationRule(data: any, rule: ITransformationRule): { success: boolean; data: any; error?: string } {
    const normalized = { ...data };
    
    // Normalize common fields
    if (rule.source && normalized[rule.source]) {
      const value = normalized[rule.source];
      
      // Normalize to lowercase if string
      if (typeof value === 'string') {
        normalized[rule.source] = value.toLowerCase().trim();
      }
    }

    return { success: true, data: normalized };
  }

  /**
   * Apply validation transformation rule
   */
  protected applyValidationRule(data: any, rule: ITransformationRule): { success: boolean; data: any; error?: string } {
    if (!rule.conditions) {
      return { success: true, data };
    }

    const isValid = this.evaluateConditions(data, rule.conditions);
    
    return {
      success: isValid,
      data,
      ...(isValid ? {} : { error: `Validation failed for rule: ${rule.name}` })
    };
  }

  // Helper methods
  protected getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  protected setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    
    if (lastKey) {
      target[lastKey] = value;
    }
  }

  protected evaluateConditions(data: any, conditions: Record<string, any>): boolean {
    for (const [field, condition] of Object.entries(conditions)) {
      const value = this.getNestedValue(data, field);
      
      if (typeof condition === 'object') {
        // Handle operators like $eq, $ne, $gt, etc.
        for (const [operator, operand] of Object.entries(condition)) {
          if (!this.evaluateOperator(value, operator, operand)) {
            return false;
          }
        }
      } else {
        // Simple equality check
        if (value !== condition) {
          return false;
        }
      }
    }
    
    return true;
  }

  protected evaluateOperator(value: any, operator: string, operand: any): boolean {
    switch (operator) {
      case '$eq':
        return value === operand;
      case '$ne':
        return value !== operand;
      case '$gt':
        return value > operand;
      case '$gte':
        return value >= operand;
      case '$lt':
        return value < operand;
      case '$lte':
        return value <= operand;
      case '$in':
        return Array.isArray(operand) && operand.includes(value);
      case '$nin':
        return Array.isArray(operand) && !operand.includes(value);
      case '$exists':
        return operand ? value !== undefined : value === undefined;
      case '$regex':
        return typeof value === 'string' && new RegExp(operand).test(value);
      default:
        return true;
    }
  }

  protected extractId(data: any): string {
    return data.id || data._id || data.uuid || this.generateId();
  }

  protected extractType(data: any): string {
    return data.type || data.kind || data.category || 'unknown';
  }

  protected extractTimestamp(data: any): Date {
    const timestamp = data.timestamp || data.createdAt || data.created || data.time;
    
    if (timestamp) {
      return new Date(timestamp);
    }
    
    return new Date();
  }

  protected calculateCompleteness(data: any): number {
    const fields = Object.keys(data);
    const filledFields = fields.filter(field => 
      data[field] !== null && 
      data[field] !== undefined && 
      data[field] !== ''
    );
    
    return fields.length > 0 ? filledFields.length / fields.length : 1.0;
  }

  protected calculateTimeliness(data: any): number {
    const timestamp = this.extractTimestamp(data);
    const now = new Date();
    const ageMs = now.getTime() - timestamp.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    
    // Timeliness decreases with age, but never goes below 0.1
    return Math.max(0.1, Math.exp(-ageHours / 24));
  }

  protected generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}