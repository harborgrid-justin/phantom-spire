/**
 * REST API Data Connector - For connecting to REST-based threat intelligence feeds
 */

import axios from 'axios';
// Local types for Axios to avoid import issues
type AxiosInstance = any;
type AxiosRequestConfig = any;
import { BaseDataConnector } from './BaseDataConnector';
import {
  IConnectorConfig,
  IValidationResult,
  IExtractionRequest,
  IExtractionResult,
  ILoadResult
} from '../interfaces/IDataConnector';
import { IDataRecord, IHealthStatus } from '../interfaces/IDataSource';
import { logger } from '../../utils/logger';

export interface IRestApiConfig extends IConnectorConfig {
  connection: {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
  };
  endpoints: {
    data?: string;
    health?: string;
    count?: string;
  };
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    limitParam?: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
    maxPageSize?: number;
  };
  rateLimit?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
}

export class RestApiConnector extends BaseDataConnector {
  public readonly name = 'REST-API';
  public readonly type = 'rest-api';
  public readonly version = '1.0.0';
  public readonly supportedFormats = ['json', 'xml'];

  private httpClient?: AxiosInstance;
  private rateLimiter?: {
    lastRequest: number;
    requestCount: number;
    windowStart: number;
  };

  protected async performInitialization(config: IConnectorConfig): Promise<void> {
    const restConfig = config as IRestApiConfig;
    
    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: restConfig.connection.baseUrl,
      timeout: restConfig.connection.timeout || 30000,
      headers: {
        'User-Agent': `PhantomSpire-DataConnector/${this.version}`,
        'Accept': 'application/json',
        ...restConfig.connection.headers
      }
    });

    // Setup authentication
    if (config.authentication) {
      this.setupAuthentication(config.authentication);
    }

    // Setup rate limiting
    if (restConfig.rateLimit) {
      this.setupRateLimit(restConfig.rateLimit);
    }

    // Setup request/response interceptors
    this.setupInterceptors();
  }

  protected async performConnect(): Promise<void> {
    if (!this.httpClient) {
      throw new Error('HTTP client not initialized');
    }

    // Test connection with health endpoint or basic request
    const config = this.config as IRestApiConfig;
    const healthEndpoint = config.endpoints?.health || '/health';
    
    try {
      await this.httpClient.get(healthEndpoint);
    } catch (error) {
      // If health endpoint fails, try a basic request to the data endpoint
      const dataEndpoint = config.endpoints?.data || '/';
      await this.httpClient.head(dataEndpoint);
    }
  }

  protected async performDisconnect(): Promise<void> {
    // REST APIs don't typically need explicit disconnection
    // Just reset the client
    this.httpClient = undefined;
  }

  protected async performExtraction(request: IExtractionRequest): Promise<IExtractionResult> {
    if (!this.httpClient) {
      throw new Error('HTTP client not connected');
    }

    const config = this.config as IRestApiConfig;
    const endpoint = config.endpoints?.data || '/data';
    
    const requestConfig: AxiosRequestConfig = {
      method: 'GET',
      url: endpoint,
      params: {
        ...config.connection.queryParams,
        ...this.buildQueryParams(request)
      }
    };

    // Apply rate limiting
    await this.enforceRateLimit();

    const startTime = Date.now();
    const response = await this.httpClient.request(requestConfig);
    
    const data = response.data;
    let extractedRecords: any[];
    
    // Handle different response structures
    if (Array.isArray(data)) {
      extractedRecords = data;
    } else if (data.data && Array.isArray(data.data)) {
      extractedRecords = data.data;
    } else if (data.items && Array.isArray(data.items)) {
      extractedRecords = data.items;
    } else if (data.results && Array.isArray(data.results)) {
      extractedRecords = data.results;
    } else {
      extractedRecords = [data];
    }

    // Handle pagination
    const hasMore = this.determineHasMore(data, extractedRecords.length, request.batchSize);
    const nextToken = this.extractNextToken(data);
    
    return {
      data: extractedRecords,
      metadata: {
        total: data.total || data.count || extractedRecords.length,
        extracted: extractedRecords.length,
        hasMore,
        ...(nextToken && { nextToken }),
        executionTime: Date.now() - startTime
      },
      errors: []
    };
  }

  protected async performLoad(records: IDataRecord[], target: string): Promise<ILoadResult> {
    if (!this.httpClient) {
      throw new Error('HTTP client not connected');
    }

    let loaded = 0;
    let failed = 0;
    const errors: string[] = [];

    // Load records in batches
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        await this.enforceRateLimit();
        
        const response = await this.httpClient.post(target, {
          records: batch.map(r => r.data)
        });
        
        if (response.status >= 200 && response.status < 300) {
          loaded += batch.length;
        } else {
          failed += batch.length;
          errors.push(`Batch failed with status ${response.status}`);
        }
      } catch (error) {
        failed += batch.length;
        errors.push(`Batch failed: ${(error as Error).message}`);
        logger.error(`Failed to load batch`, error);
      }
    }

    return {
      loaded,
      failed,
      errors,
      executionTime: 0 // Will be set by base class
    };
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    if (!this.httpClient) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: 'HTTP client not initialized'
      };
    }

    const config = this.config as IRestApiConfig;
    const healthEndpoint = config.endpoints?.health || '/health';
    
    try {
      const startTime = Date.now();
      const response = await this.httpClient.get(healthEndpoint, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.status < 400 ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        responseTime,
        metrics: {
          statusCode: response.status,
          responseSize: JSON.stringify(response.data).length
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: (error as Error).message
      };
    }
  }

  protected override async validateConnection(connection: any): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!connection.baseUrl) {
      errors.push('Base URL is required');
    } else {
      try {
        new URL(connection.baseUrl);
      } catch {
        errors.push('Base URL must be a valid URL');
      }
    }

    if (connection.timeout && (connection.timeout < 1000 || connection.timeout > 300000)) {
      warnings.push('Timeout should be between 1000ms and 300000ms');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  protected override async validateAuthentication(auth: any): Promise<IValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (auth.type) {
      case 'bearer':
        if (!auth.credentials.token) {
          errors.push('Bearer token is required');
        }
        break;
      case 'apikey':
        if (!auth.credentials.key) {
          errors.push('API key is required');
        }
        if (!auth.credentials.header && !auth.credentials.param) {
          errors.push('API key header name or parameter name is required');
        }
        break;
      case 'basic':
        if (!auth.credentials.username || !auth.credentials.password) {
          errors.push('Username and password are required for basic auth');
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Setup authentication for HTTP client
   */
  private setupAuthentication(auth: any): void {
    if (!this.httpClient) return;

    switch (auth.type) {
      case 'bearer':
        this.httpClient.defaults.headers.common['Authorization'] = 
          `Bearer ${auth.credentials.token}`;
        break;
      
      case 'apikey':
        if (auth.credentials.header) {
          this.httpClient.defaults.headers.common[auth.credentials.header] = 
            auth.credentials.key;
        }
        if (auth.credentials.param) {
          this.httpClient.defaults.params = {
            ...this.httpClient.defaults.params,
            [auth.credentials.param]: auth.credentials.key
          };
        }
        break;
      
      case 'basic':
        this.httpClient.defaults.auth = {
          username: auth.credentials.username,
          password: auth.credentials.password
        };
        break;
    }
  }

  /**
   * Setup rate limiting
   */
  private setupRateLimit(_rateLimit: NonNullable<IRestApiConfig['rateLimit']>): void {
    this.rateLimiter = {
      lastRequest: 0,
      requestCount: 0,
      windowStart: Date.now()
    };
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors(): void {
    if (!this.httpClient) return;

    // Request interceptor for logging and rate limiting
    this.httpClient.interceptors.request.use(
      (config: any) => {
        logger.debug(`Making HTTP request`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params
        });
        return config;
      },
      (error: any) => {
        logger.error(`HTTP request failed`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.httpClient.interceptors.response.use(
      (response: any) => {
        logger.debug(`HTTP response received`, {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      (error: any) => {
        logger.error(`HTTP response error`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Build query parameters for extraction request
   */
  private buildQueryParams(request: IExtractionRequest): Record<string, any> {
    const params: Record<string, any> = {};
    const config = this.config as IRestApiConfig;

    // Add filters as query parameters
    if (request.filters) {
      Object.assign(params, request.filters);
    }

    // Add time range filters
    if (request.timeRange) {
      params.start_time = request.timeRange.start.toISOString();
      params.end_time = request.timeRange.end.toISOString();
    }

    // Add pagination parameters
    if (config.pagination) {
      const batchSize = request.batchSize || config.pagination.maxPageSize || 100;
      
      switch (config.pagination.type) {
        case 'offset':
          params[config.pagination.limitParam || 'limit'] = batchSize;
          if (request.query?.offset) {
            params[config.pagination.offsetParam || 'offset'] = request.query.offset;
          }
          break;
        
        case 'page':
          params[config.pagination.limitParam || 'page_size'] = batchSize;
          if (request.query?.offset) {
            const page = Math.floor(request.query.offset / batchSize) + 1;
            params[config.pagination.pageParam || 'page'] = page;
          }
          break;
        
        case 'cursor':
          params[config.pagination.limitParam || 'limit'] = batchSize;
          // Cursor would be handled separately in pagination logic
          break;
      }
    }

    return params;
  }

  /**
   * Enforce rate limiting before making requests
   */
  private async enforceRateLimit(): Promise<void> {
    if (!this.rateLimiter) return;

    const config = this.config as IRestApiConfig;
    const rateLimit = config.rateLimit;
    if (!rateLimit) return;

    const now = Date.now();
    const windowDuration = 60000; // 1 minute window

    // Reset window if needed
    if (now - this.rateLimiter.windowStart > windowDuration) {
      this.rateLimiter.windowStart = now;
      this.rateLimiter.requestCount = 0;
    }

    // Check rate limits
    let delay = 0;

    if (rateLimit.requestsPerSecond) {
      const minInterval = 1000 / rateLimit.requestsPerSecond;
      const timeSinceLastRequest = now - this.rateLimiter.lastRequest;
      if (timeSinceLastRequest < minInterval) {
        delay = Math.max(delay, minInterval - timeSinceLastRequest);
      }
    }

    if (rateLimit.requestsPerMinute) {
      const windowRequests = this.rateLimiter.requestCount;
      if (windowRequests >= rateLimit.requestsPerMinute) {
        delay = Math.max(delay, windowDuration - (now - this.rateLimiter.windowStart));
      }
    }

    if (delay > 0) {
      logger.debug(`Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.rateLimiter.lastRequest = Date.now();
    this.rateLimiter.requestCount++;
  }

  /**
   * Determine if there are more records to fetch
   */
  private determineHasMore(
    responseData: any,
    extractedCount: number,
    batchSize?: number
  ): boolean {
    // Check explicit pagination fields
    if (responseData.hasMore !== undefined) {
      return responseData.hasMore;
    }
    
    if (responseData.has_more !== undefined) {
      return responseData.has_more;
    }
    
    if (responseData.pagination?.hasMore !== undefined) {
      return responseData.pagination.hasMore;
    }

    // If we got exactly the batch size, likely there are more
    if (batchSize && extractedCount === batchSize) {
      return true;
    }

    // Check if total count indicates more records
    if (responseData.total && responseData.offset !== undefined) {
      return responseData.offset + extractedCount < responseData.total;
    }

    return false;
  }

  /**
   * Extract next token for cursor-based pagination
   */
  private extractNextToken(responseData: any): string | undefined {
    return responseData.nextToken || 
           responseData.next_token || 
           responseData.pagination?.nextToken ||
           responseData.pagination?.next_cursor;
  }
}