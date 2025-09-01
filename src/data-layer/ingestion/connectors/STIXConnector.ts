/**
 * STIX Connector - Structured Threat Information eXpression format support
 * Handles STIX 2.0/2.1 JSON format for threat intelligence data ingestion
 */

import { logger } from '../../../utils/logger.js';
import {
  IDataConnector,
  IConnectorConfig,
  IValidationResult,
  IExtractionRequest,
  IExtractionResult,
  ILoadResult,
} from '../../interfaces/IDataConnector.js';
import { IHealthStatus, IDataRecord } from '../../interfaces/IDataSource.js';
import axios, { AxiosInstance } from 'axios';

export interface ISTIXConnectorConfig extends IConnectorConfig {
  // STIX-specific configuration
  version: '2.0' | '2.1';
  validateSchema: boolean;
  extractRelationships: boolean;
  supportedTypes: string[];
  
  // Data source configuration
  endpoint?: string;
  authentication?: {
    type: 'bearer' | 'basic' | 'apikey';
    credentials: Record<string, string>;
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  
  // Processing options
  batchSize: number;
  timeout: number;
  retryAttempts: number;
}

export interface ISTIXBundle {
  type: 'bundle';
  id: string;
  objects: ISTIXObject[];
  spec_version?: string;
}

export interface ISTIXObject {
  type: string;
  id: string;
  created?: string;
  modified?: string;
  spec_version?: string;
  [key: string]: any;
}

export interface ISTIXRelationship {
  type: 'relationship';
  id: string;
  relationship_type: string;
  source_ref: string;
  target_ref: string;
  created: string;
  modified?: string;
}

export interface ISTIXIndicator extends ISTIXObject {
  type: 'indicator';
  pattern: string;
  labels: string[];
  valid_from: string;
  valid_until?: string;
}

export interface ISTIXMalware extends ISTIXObject {
  type: 'malware';
  name: string;
  labels: string[];
  is_family?: boolean;
}

export interface ISTIXThreatActor extends ISTIXObject {
  type: 'threat-actor';
  name: string;
  labels: string[];
  aliases?: string[];
}

export class STIXConnector implements IDataConnector {
  public readonly name: string;
  public readonly type = 'stix';
  public readonly version = '1.0.0';
  public readonly supportedFormats = ['json', 'stix'];
  public readonly capabilities: string[] = [
    'extract',
    'validate',
    'transform',
    'relationships'
  ];

  private config: ISTIXConnectorConfig;
  private httpClient?: AxiosInstance;
  private isConnected = false;

  constructor(name: string, config: ISTIXConnectorConfig) {
    this.name = name;
    this.config = config;
    
    if (config.endpoint) {
      this.setupHttpClient();
    }

    logger.info('STIXConnector initialized', {
      name: this.name,
      version: config.version,
      endpoint: config.endpoint,
      supportedTypes: config.supportedTypes,
    });
  }

  /**
   * Initialize the connector with configuration
   */
  public async initialize(config: IConnectorConfig): Promise<void> {
    this.config = { ...this.config, ...config } as ISTIXConnectorConfig;
    
    if (this.config.endpoint) {
      this.setupHttpClient();
    }
    
    logger.info('STIXConnector initialized', {
      name: this.name,
      endpoint: this.config.endpoint,
    });
  }

  /**
   * Transform data using transformation rules  
   */
  public async transform(data: any[], transformationRules: any[]): Promise<any[]> {
    // Basic transformation for STIX data
    return data.map(item => ({
      id: item.id,
      type: 'stix-object',
      source: 'stix',
      timestamp: new Date(item.created || item.modified || new Date()),
      data: item,
    }));
  }

  /**
   * Connect to the STIX data source
   */
  public async connect(): Promise<void> {
    try {
      if (this.config.endpoint && this.httpClient) {
        // Test connection with a simple request
        await this.httpClient.get('/health', { timeout: 5000 });
      }
      
      this.isConnected = true;
      logger.info('STIXConnector connected successfully', { name: this.name });
      
    } catch (error) {
      this.isConnected = false;
      const errorMessage = `Failed to connect STIXConnector ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnect from the STIX data source
   */
  public async disconnect(): Promise<void> {
    this.isConnected = false;
    logger.info('STIXConnector disconnected', { name: this.name });
  }

  /**
   * Check health of the STIX connector
   */
  public async healthCheck(): Promise<IHealthStatus> {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      if (this.config.endpoint && this.httpClient) {
        await this.httpClient.get('/health', { timeout: 5000 });
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy' as const,
        lastCheck: new Date(),
        responseTime,
        message: `${this.name} connector is healthy`,
        metrics: {
          connectorType: 1,
          version: parseFloat(this.config.version),
          endpointReachable: 1,
        },
      };

    } catch (error) {
      issues.push(error instanceof Error ? error.message : 'Unknown health check error');
      
      return {
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown health check error',
        metrics: {
          connectorType: 0,
          errorOccurred: 1,
        },
      };
    }
  }

  /**
   * Extract STIX data from source
   */
  public async extract(request: IExtractionRequest): Promise<IExtractionResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting STIX data extraction', {
        connector: this.name,
        source: request.source,
        batchSize: request.batchSize || this.config.batchSize,
      });

      let data: ISTIXObject[] = [];

      if (this.config.endpoint && this.httpClient) {
        // Extract from remote STIX endpoint
        data = await this.extractFromEndpoint(request);
      } else if (request.query && typeof request.query === 'string') {
        // Parse STIX from JSON string
        data = this.parseSTIXJson(request.query);
      } else {
        throw new Error('No valid STIX source provided');
      }

      // Filter by supported types
      const filteredData = this.config.supportedTypes.length > 0
        ? data.filter(obj => this.config.supportedTypes.includes(obj.type))
        : data;

      // Extract relationships if configured
      const relationships = this.config.extractRelationships 
        ? this.extractRelationships(filteredData)
        : [];

      const executionTime = Date.now() - startTime;

      logger.info('STIX extraction completed', {
        connector: this.name,
        totalObjects: data.length,
        filteredObjects: filteredData.length,
        relationships: relationships.length,
        executionTime,
      });

      return {
        data: filteredData,
        metadata: {
          total: data.length,
          extracted: filteredData.length,
          hasMore: false, // Would be implemented for pagination
          executionTime,
        },
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = `STIX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      logger.error(errorMessage, {
        connector: this.name,
        executionTime,
        error: error instanceof Error ? error.stack : error,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Validate STIX data structure
   */
  public async validate(data: any): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (!data) {
        errors.push('No data provided for validation');
        return { isValid: false, errors, warnings: [] };
      }

      // Handle both single objects and bundles
      const objects = this.normalizeToObjects(data);

      for (const obj of objects) {
        const objErrors = this.validateSTIXObject(obj as ISTIXObject);
        errors.push(...objErrors);
      }

      // Check STIX version consistency
      const versions = new Set(objects.map(obj => obj.spec_version).filter(Boolean));
      if (versions.size > 1) {
        warnings.push(`Mixed STIX versions detected: ${Array.from(versions).join(', ')}`);
      }

      logger.debug('STIX validation completed', {
        connector: this.name,
        objectCount: objects.length,
        errorCount: errors.length,
        warningCount: warnings.length,
      });

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : [],
        warnings: warnings.length > 0 ? warnings : [],
      };

    } catch (error) {
      const errorMessage = `STIX validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      
      return {
        isValid: false,
        errors: [errorMessage],
        warnings: [],
      };
    }
  }

  /**
   * Load processed STIX data to destination
   */
  public async load(records: IDataRecord[], target: string): Promise<ILoadResult> {
    const startTime = Date.now();
    const objects = records.map(record => record.data);
    
    try {
      logger.info('Starting STIX data load', {
        connector: this.name,
        objectCount: objects.length,
        target: target,
      });

      let loaded = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const obj of objects) {
        try {
          // Transform STIX object to internal format
          const transformedObj = this.transformSTIXObject(obj as ISTIXObject);
          
          // In a real implementation, this would save to database or send to another system
          // For now, we'll just log the successful transformation
          logger.debug('STIX object loaded', {
            id: obj.id,
            type: obj.type,
          });
          
          loaded++;
        } catch (error) {
          failed++;
          const errorMessage = `Failed to load STIX object ${obj.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          logger.warn(errorMessage);
        }
      }

      const executionTime = Date.now() - startTime;

      logger.info('STIX data load completed', {
        connector: this.name,
        loaded,
        failed,
        executionTime,
      });

      return {
        loaded,
        failed,
        errors,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = `STIX load failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      logger.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Private helper methods
   */

  private setupHttpClient(): void {
    this.httpClient = axios.create({
      baseURL: this.config.endpoint,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Setup authentication
    if (this.config.authentication) {
      const auth = this.config.authentication;
      
      switch (auth.type) {
        case 'bearer':
          if (auth.token) {
            this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
          }
          break;
        case 'basic':
          if (auth.username && auth.password) {
            this.httpClient.defaults.auth = {
              username: auth.username,
              password: auth.password,
            };
          }
          break;
        case 'apikey':
          if (auth.apiKey && auth.apiKeyHeader) {
            this.httpClient.defaults.headers.common[auth.apiKeyHeader] = auth.apiKey;
          }
          break;
      }
    }

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.debug('STIX HTTP request', {
          method: config.method,
          url: config.url,
          connector: this.name,
        });
        return config;
      },
      (error) => {
        logger.error('STIX HTTP request error', error);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug('STIX HTTP response', {
          status: response.status,
          dataLength: JSON.stringify(response.data).length,
          connector: this.name,
        });
        return response;
      },
      (error) => {
        logger.error('STIX HTTP response error', {
          status: error.response?.status,
          message: error.message,
          connector: this.name,
        });
        return Promise.reject(error);
      }
    );
  }

  private async extractFromEndpoint(request: IExtractionRequest): Promise<ISTIXObject[]> {
    if (!this.httpClient) {
      throw new Error('HTTP client not configured');
    }

    const response = await this.httpClient.get('/objects', {
      params: request.query,
    });

    if (response.data.type === 'bundle') {
      return response.data.objects || [];
    }

    return Array.isArray(response.data) ? response.data : [response.data];
  }

  private parseSTIXJson(jsonString: string): ISTIXObject[] {
    try {
      const data = JSON.parse(jsonString);
      return this.normalizeToObjects(data);
    } catch (error) {
      throw new Error(`Failed to parse STIX JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeToObjects(data: any): ISTIXObject[] {
    if (!data) {
      return [];
    }

    if (data.type === 'bundle') {
      return data.objects || [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'object' && data.type) {
      return [data];
    }

    throw new Error('Invalid STIX data format');
  }

  private validateSTIXObject(obj: ISTIXObject): string[] {
    const errors: string[] = [];

    // Basic STIX object validation
    if (!obj.type) {
      errors.push('STIX object missing required "type" field');
    }

    if (!obj.id) {
      errors.push('STIX object missing required "id" field');
    } else if (!this.isValidSTIXIdentifier(obj.id)) {
      errors.push(`Invalid STIX identifier format: ${obj.id}`);
    }

    // Type-specific validation
    switch (obj.type) {
      case 'indicator':
        errors.push(...this.validateIndicator(obj as ISTIXIndicator));
        break;
      case 'malware':
        errors.push(...this.validateMalware(obj as ISTIXMalware));
        break;
      case 'threat-actor':
        errors.push(...this.validateThreatActor(obj as ISTIXThreatActor));
        break;
      // Add more type-specific validations as needed
    }

    return errors;
  }

  private validateIndicator(indicator: ISTIXIndicator): string[] {
    const errors: string[] = [];

    if (!indicator.pattern) {
      errors.push('Indicator missing required "pattern" field');
    }

    if (!indicator.labels || indicator.labels.length === 0) {
      errors.push('Indicator missing required "labels" field');
    }

    if (!indicator.valid_from) {
      errors.push('Indicator missing required "valid_from" field');
    }

    return errors;
  }

  private validateMalware(malware: ISTIXMalware): string[] {
    const errors: string[] = [];

    if (!malware.name) {
      errors.push('Malware missing required "name" field');
    }

    if (!malware.labels || malware.labels.length === 0) {
      errors.push('Malware missing required "labels" field');
    }

    return errors;
  }

  private validateThreatActor(actor: ISTIXThreatActor): string[] {
    const errors: string[] = [];

    if (!actor.name) {
      errors.push('Threat Actor missing required "name" field');
    }

    if (!actor.labels || actor.labels.length === 0) {
      errors.push('Threat Actor missing required "labels" field');
    }

    return errors;
  }

  private isValidSTIXIdentifier(id: string): boolean {
    // STIX identifier format: type--uuid
    const stixIdPattern = /^[a-z][a-z-]+[a-z]--[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    return stixIdPattern.test(id);
  }

  private extractRelationships(objects: ISTIXObject[]): ISTIXRelationship[] {
    return objects.filter(obj => obj.type === 'relationship') as ISTIXRelationship[];
  }

  private detectSTIXVersion(objects: ISTIXObject[]): string {
    const versions = objects
      .map(obj => obj.spec_version)
      .filter(Boolean);
    
    if (versions.length === 0) {
      return this.config.version;
    }
    
    // Return most common version
    const versionCounts = versions.reduce((acc, version) => {
      acc[version] = (acc[version] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(versionCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  private transformSTIXObject(obj: ISTIXObject): any {
    // Transform STIX object to internal threat intelligence format
    const base = {
      id: obj.id,
      type: obj.type,
      created: obj.created,
      modified: obj.modified,
      spec_version: obj.spec_version,
      source: 'stix',
      connector: this.name,
      ingested_at: new Date().toISOString(),
    };

    // Add type-specific transformations
    switch (obj.type) {
      case 'indicator':
        const indicator = obj as ISTIXIndicator;
        return {
          ...base,
          pattern: indicator.pattern,
          labels: indicator.labels,
          valid_from: indicator.valid_from,
          valid_until: indicator.valid_until,
          confidence: this.extractConfidence(indicator),
        };

      case 'malware':
        const malware = obj as ISTIXMalware;
        return {
          ...base,
          name: malware.name,
          labels: malware.labels,
          is_family: malware.is_family,
        };

      case 'threat-actor':
        const actor = obj as ISTIXThreatActor;
        return {
          ...base,
          name: actor.name,
          labels: actor.labels,
          aliases: actor.aliases,
        };

      default:
        return { ...base, data: obj };
    }
  }

  private extractConfidence(obj: any): number {
    // Extract confidence from STIX object, defaulting to medium confidence
    if (obj.confidence !== undefined) {
      return obj.confidence;
    }
    
    // Derive confidence from labels or other fields
    const labels = obj.labels || [];
    if (labels.includes('high-confidence')) return 85;
    if (labels.includes('medium-confidence')) return 65;
    if (labels.includes('low-confidence')) return 35;
    
    return 50; // Default medium confidence
  }
}