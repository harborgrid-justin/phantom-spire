/**
 * MISP Connector - Malware Information Sharing Platform format support
 * Handles MISP JSON format for threat intelligence data ingestion
 */

import { logger } from '../../../utils/logger';
import {
  IDataConnector,
  IConnectorConfig,
  IValidationResult,
  IExtractionRequest,
  IExtractionResult,
  ILoadResult,
} from '../../interfaces/IDataConnector';
import { IHealthStatus } from '../../interfaces/IDataSource';
import axios, { AxiosInstance } from 'axios';

export interface IMISPConnectorConfig extends IConnectorConfig {
  // MISP-specific configuration
  version: string;
  validateStructure: boolean;
  extractAttributes: boolean;
  extractObjects: boolean;
  extractGalaxy: boolean;
  
  // Data source configuration
  endpoint?: string;
  authentication?: {
    type: 'authkey' | 'basic';
    authkey?: string;
    username?: string;
    password?: string;
  };
  
  // Processing options
  batchSize: number;
  timeout: number;
  retryAttempts: number;
  
  // Filtering options
  published?: boolean;
  eventTypes?: string[];
  threatLevelFilter?: number[];
  analysisFilter?: number[];
  distributionFilter?: number[];
}

export interface IMISPEvent {
  id: string;
  orgc_id: string;
  org_id: string;
  date: string;
  threat_level_id: string;
  info: string;
  published: boolean;
  uuid: string;
  attribute_count: string;
  analysis: string;
  timestamp: string;
  distribution: string;
  proposal_email_lock: boolean;
  locked: boolean;
  publish_timestamp: string;
  sharing_group_id?: string;
  disable_correlation: boolean;
  extends_uuid?: string;
  Org: IMISPOrganization;
  Orgc: IMISPOrganization;
  Attribute?: IMISPAttribute[];
  Object?: IMISPObject[];
  Galaxy?: IMISPGalaxy[];
  EventTag?: IMISPEventTag[];
}

export interface IMISPOrganization {
  id: string;
  name: string;
  uuid: string;
  local?: boolean;
}

export interface IMISPAttribute {
  id: string;
  event_id: string;
  object_id: string;
  object_relation?: string;
  category: string;
  type: string;
  value: string;
  to_ids: boolean;
  uuid: string;
  timestamp: string;
  distribution: string;
  sharing_group_id?: string;
  comment: string;
  deleted: boolean;
  disable_correlation: boolean;
  first_seen?: string;
  last_seen?: string;
  Tag?: IMISPTag[];
}

export interface IMISPObject {
  id: string;
  name: string;
  meta_category: string;
  description: string;
  template_uuid: string;
  template_version: string;
  event_id: string;
  uuid: string;
  timestamp: string;
  distribution: string;
  sharing_group_id?: string;
  comment: string;
  deleted: boolean;
  first_seen?: string;
  last_seen?: string;
  Attribute: IMISPAttribute[];
  ObjectReference?: IMISPObjectReference[];
}

export interface IMISPObjectReference {
  id: string;
  uuid: string;
  timestamp: string;
  object_id: string;
  referenced_uuid: string;
  referenced_id: string;
  referenced_type: string;
  relationship_type: string;
  comment: string;
  deleted: boolean;
}

export interface IMISPGalaxy {
  id: string;
  uuid: string;
  name: string;
  type: string;
  description: string;
  version: string;
  icon?: string;
  namespace: string;
  enabled: boolean;
  local_only: boolean;
  GalaxyCluster: IMISPGalaxyCluster[];
}

export interface IMISPGalaxyCluster {
  id: string;
  uuid: string;
  collection_uuid: string;
  type: string;
  value: string;
  tag_name: string;
  description: string;
  galaxy_id: string;
  source: string;
  authors: string[];
  version: string;
  distribution: string;
  sharing_group_id?: string;
  default: boolean;
  locked: boolean;
  published: boolean;
  deleted: boolean;
  GalaxyElement?: IMISPGalaxyElement[];
}

export interface IMISPGalaxyElement {
  id: string;
  galaxy_cluster_id: string;
  key: string;
  value: string;
}

export interface IMISPTag {
  id: string;
  name: string;
  colour: string;
  exportable: boolean;
  org_id?: string;
  user_id?: string;
  hide_tag: boolean;
  numerical_value?: number;
  is_galaxy: boolean;
  is_custom_galaxy: boolean;
  local_only: boolean;
}

export interface IMISPEventTag {
  id: string;
  event_id: string;
  tag_id: string;
  local: boolean;
  relationship_type?: string;
  Tag: IMISPTag;
}

export class MISPConnector implements IDataConnector {
  public readonly name: string;
  public readonly type = 'misp';
  public readonly capabilities: string[] = [
    'extract',
    'validate',
    'transform',
    'relationships',
    'attributes',
    'objects',
    'galaxy'
  ];

  private config: IMISPConnectorConfig;
  private httpClient?: AxiosInstance;
  private isConnected = false;

  constructor(name: string, config: IMISPConnectorConfig) {
    this.name = name;
    this.config = config;
    
    if (config.endpoint) {
      this.setupHttpClient();
    }

    logger.info('MISPConnector initialized', {
      name: this.name,
      endpoint: config.endpoint,
      extractAttributes: config.extractAttributes,
      extractObjects: config.extractObjects,
      extractGalaxy: config.extractGalaxy,
    });
  }

  /**
   * Connect to the MISP data source
   */
  public async connect(): Promise<void> {
    try {
      if (this.config.endpoint && this.httpClient) {
        // Test connection with MISP version endpoint
        await this.httpClient.get('/servers/getVersion');
      }
      
      this.isConnected = true;
      logger.info('MISPConnector connected successfully', { name: this.name });
      
    } catch (error) {
      this.isConnected = false;
      const errorMessage = `Failed to connect MISPConnector ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnect from the MISP data source
   */
  public async disconnect(): Promise<void> {
    this.isConnected = false;
    logger.info('MISPConnector disconnected', { name: this.name });
  }

  /**
   * Check health of the MISP connector
   */
  public async healthCheck(): Promise<IHealthStatus> {
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      if (this.config.endpoint && this.httpClient) {
        const response = await this.httpClient.get('/servers/getVersion', { timeout: 5000 });
        const version = response.data.version;
        
        const responseTime = Date.now() - startTime;

        return {
          isHealthy: true,
          lastCheck: new Date(),
          responseTime,
          details: {
            connector: this.name,
            type: this.type,
            endpoint: this.config.endpoint,
            mispVersion: version,
          },
        };
      }

      return {
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          connector: this.name,
          type: this.type,
          mode: 'offline',
        },
      };

    } catch (error) {
      issues.push(error instanceof Error ? error.message : 'Unknown health check error');
      
      return {
        isHealthy: false,
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        issues,
        details: {
          connector: this.name,
          type: this.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Extract MISP data from source
   */
  public async extract(request: IExtractionRequest): Promise<IExtractionResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting MISP data extraction', {
        connector: this.name,
        source: request.source,
        batchSize: request.batchSize || this.config.batchSize,
      });

      let events: IMISPEvent[] = [];

      if (this.config.endpoint && this.httpClient) {
        // Extract from remote MISP instance
        events = await this.extractFromEndpoint(request);
      } else if (request.query && typeof request.query === 'string') {
        // Parse MISP from JSON string
        events = this.parseMISPJson(request.query);
      } else {
        throw new Error('No valid MISP source provided');
      }

      // Apply filters
      const filteredEvents = this.applyFilters(events);

      // Extract attributes and objects if configured
      const extractedData = this.extractEventData(filteredEvents);

      const executionTime = Date.now() - startTime;

      logger.info('MISP extraction completed', {
        connector: this.name,
        totalEvents: events.length,
        filteredEvents: filteredEvents.length,
        extractedItems: extractedData.length,
        executionTime,
      });

      return {
        data: extractedData,
        metadata: {
          total: events.length,
          extracted: extractedData.length,
          hasMore: false, // Would be implemented for pagination
          executionTime,
          eventCount: filteredEvents.length,
          mispVersion: this.config.version,
        },
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = `MISP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      logger.error(errorMessage, {
        connector: this.name,
        executionTime,
        error: error instanceof Error ? error.stack : error,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Validate MISP data structure
   */
  public async validate(data: any): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (!data) {
        errors.push('No data provided for validation');
        return { valid: false, errors };
      }

      const events = this.normalizeToEvents(data);

      for (const event of events) {
        const eventErrors = this.validateMISPEvent(event);
        errors.push(...eventErrors);
      }

      // Check for data quality issues
      const qualityWarnings = this.performQualityChecks(events);
      warnings.push(...qualityWarnings);

      logger.debug('MISP validation completed', {
        connector: this.name,
        eventCount: events.length,
        errorCount: errors.length,
        warningCount: warnings.length,
      });

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

    } catch (error) {
      const errorMessage = `MISP validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      
      return {
        valid: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Load processed MISP data to destination
   */
  public async load(data: any, config: Record<string, any>): Promise<ILoadResult> {
    const startTime = Date.now();
    const items = Array.isArray(data) ? data : [data];
    
    try {
      logger.info('Starting MISP data load', {
        connector: this.name,
        itemCount: items.length,
      });

      let loaded = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          // Transform MISP item to internal format
          const transformedItem = this.transformMISPItem(item);
          
          // In a real implementation, this would save to database or send to another system
          logger.debug('MISP item loaded', {
            id: item.id || item.uuid,
            type: item.type || 'event',
          });
          
          loaded++;
        } catch (error) {
          failed++;
          const errorMessage = `Failed to load MISP item: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          logger.warn(errorMessage);
        }
      }

      const executionTime = Date.now() - startTime;

      logger.info('MISP data load completed', {
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
      const errorMessage = `MISP load failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
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
        case 'authkey':
          if (auth.authkey) {
            this.httpClient.defaults.headers.common['Authorization'] = auth.authkey;
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
      }
    }

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.debug('MISP HTTP request', {
          method: config.method,
          url: config.url,
          connector: this.name,
        });
        return config;
      },
      (error) => {
        logger.error('MISP HTTP request error', error);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        logger.debug('MISP HTTP response', {
          status: response.status,
          dataLength: JSON.stringify(response.data).length,
          connector: this.name,
        });
        return response;
      },
      (error) => {
        logger.error('MISP HTTP response error', {
          status: error.response?.status,
          message: error.message,
          connector: this.name,
        });
        return Promise.reject(error);
      }
    );
  }

  private async extractFromEndpoint(request: IExtractionRequest): Promise<IMISPEvent[]> {
    if (!this.httpClient) {
      throw new Error('HTTP client not configured');
    }

    const searchParams = {
      limit: request.batchSize || this.config.batchSize,
      ...request.query,
    };

    // Apply configuration filters
    if (this.config.published !== undefined) {
      searchParams.published = this.config.published;
    }
    if (this.config.eventTypes) {
      searchParams.type = this.config.eventTypes;
    }
    if (this.config.threatLevelFilter) {
      searchParams.threat_level_id = this.config.threatLevelFilter;
    }

    const response = await this.httpClient.post('/events/restSearch', searchParams);
    
    if (response.data.response) {
      return response.data.response.map((item: any) => item.Event);
    }

    return [];
  }

  private parseMISPJson(jsonString: string): IMISPEvent[] {
    try {
      const data = JSON.parse(jsonString);
      return this.normalizeToEvents(data);
    } catch (error) {
      throw new Error(`Failed to parse MISP JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private normalizeToEvents(data: any): IMISPEvent[] {
    if (!data) {
      return [];
    }

    if (data.response) {
      return data.response.map((item: any) => item.Event);
    }

    if (data.Event) {
      return [data.Event];
    }

    if (Array.isArray(data)) {
      return data.map(item => item.Event || item);
    }

    if (typeof data === 'object' && data.uuid) {
      return [data];
    }

    throw new Error('Invalid MISP data format');
  }

  private applyFilters(events: IMISPEvent[]): IMISPEvent[] {
    let filteredEvents = events;

    // Filter by published status
    if (this.config.published !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.published === this.config.published);
    }

    // Filter by threat level
    if (this.config.threatLevelFilter && this.config.threatLevelFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        this.config.threatLevelFilter!.includes(parseInt(event.threat_level_id))
      );
    }

    // Filter by analysis level
    if (this.config.analysisFilter && this.config.analysisFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        this.config.analysisFilter!.includes(parseInt(event.analysis))
      );
    }

    // Filter by distribution level
    if (this.config.distributionFilter && this.config.distributionFilter.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        this.config.distributionFilter!.includes(parseInt(event.distribution))
      );
    }

    return filteredEvents;
  }

  private extractEventData(events: IMISPEvent[]): any[] {
    const extractedData: any[] = [];

    for (const event of events) {
      // Add the event itself
      extractedData.push({
        type: 'event',
        source: 'misp',
        ...event,
      });

      // Extract attributes if configured
      if (this.config.extractAttributes && event.Attribute) {
        for (const attribute of event.Attribute) {
          extractedData.push({
            type: 'attribute',
            source: 'misp',
            event_id: event.id,
            ...attribute,
          });
        }
      }

      // Extract objects if configured
      if (this.config.extractObjects && event.Object) {
        for (const object of event.Object) {
          extractedData.push({
            type: 'object',
            source: 'misp',
            event_id: event.id,
            ...object,
          });
        }
      }

      // Extract galaxy information if configured
      if (this.config.extractGalaxy && event.Galaxy) {
        for (const galaxy of event.Galaxy) {
          extractedData.push({
            type: 'galaxy',
            source: 'misp',
            event_id: event.id,
            ...galaxy,
          });
        }
      }
    }

    return extractedData;
  }

  private validateMISPEvent(event: IMISPEvent): string[] {
    const errors: string[] = [];

    // Basic MISP event validation
    if (!event.uuid) {
      errors.push('MISP event missing required "uuid" field');
    }

    if (!event.info) {
      errors.push('MISP event missing required "info" field');
    }

    if (!event.date) {
      errors.push('MISP event missing required "date" field');
    }

    if (!event.Org || !event.Orgc) {
      errors.push('MISP event missing organization information');
    }

    // Validate attributes if present
    if (event.Attribute) {
      for (const attribute of event.Attribute) {
        const attrErrors = this.validateAttribute(attribute);
        errors.push(...attrErrors);
      }
    }

    return errors;
  }

  private validateAttribute(attribute: IMISPAttribute): string[] {
    const errors: string[] = [];

    if (!attribute.uuid) {
      errors.push(`MISP attribute missing required "uuid" field`);
    }

    if (!attribute.type) {
      errors.push(`MISP attribute ${attribute.uuid} missing required "type" field`);
    }

    if (!attribute.value) {
      errors.push(`MISP attribute ${attribute.uuid} missing required "value" field`);
    }

    if (!attribute.category) {
      errors.push(`MISP attribute ${attribute.uuid} missing required "category" field`);
    }

    return errors;
  }

  private performQualityChecks(events: IMISPEvent[]): string[] {
    const warnings: string[] = [];

    // Check for events without attributes
    const eventsWithoutAttributes = events.filter(event => !event.Attribute || event.Attribute.length === 0);
    if (eventsWithoutAttributes.length > 0) {
      warnings.push(`${eventsWithoutAttributes.length} events have no attributes`);
    }

    // Check for unpublished events
    const unpublishedEvents = events.filter(event => !event.published);
    if (unpublishedEvents.length > 0) {
      warnings.push(`${unpublishedEvents.length} events are unpublished`);
    }

    // Check for old events
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oldEvents = events.filter(event => new Date(event.date) < oneYearAgo);
    if (oldEvents.length > 0) {
      warnings.push(`${oldEvents.length} events are older than one year`);
    }

    return warnings;
  }

  private transformMISPItem(item: any): any {
    // Transform MISP item to internal threat intelligence format
    const base = {
      source: 'misp',
      connector: this.name,
      ingested_at: new Date().toISOString(),
    };

    switch (item.type) {
      case 'event':
        return {
          ...base,
          id: item.uuid,
          type: 'event',
          info: item.info,
          date: item.date,
          published: item.published,
          threat_level: parseInt(item.threat_level_id),
          analysis: parseInt(item.analysis),
          distribution: parseInt(item.distribution),
          organization: item.Org?.name,
          orgc: item.Orgc?.name,
          attribute_count: parseInt(item.attribute_count || '0'),
        };

      case 'attribute':
        return {
          ...base,
          id: item.uuid,
          type: 'attribute',
          event_id: item.event_id,
          category: item.category,
          attribute_type: item.type,
          value: item.value,
          to_ids: item.to_ids,
          comment: item.comment,
          distribution: parseInt(item.distribution),
        };

      case 'object':
        return {
          ...base,
          id: item.uuid,
          type: 'object',
          event_id: item.event_id,
          name: item.name,
          meta_category: item.meta_category,
          description: item.description,
          template_uuid: item.template_uuid,
          template_version: item.template_version,
        };

      case 'galaxy':
        return {
          ...base,
          id: item.uuid,
          type: 'galaxy',
          event_id: item.event_id,
          name: item.name,
          galaxy_type: item.type,
          description: item.description,
          version: item.version,
          namespace: item.namespace,
        };

      default:
        return { ...base, data: item };
    }
  }
}