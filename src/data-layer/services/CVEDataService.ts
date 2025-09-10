/**
 * CVE Data Service - Multi-Database Orchestrator for Phantom CVE Core Plugin
 * Business SaaS-ready service for managing CVE data across multiple stores
 */

import { logger } from '../../utils/logger.js';
import { ErrorHandler, PerformanceMonitor } from '../../utils/serviceUtils.js';
import { MongoDataSource } from '../core/MongoDataSource.js';
import { RedisDataSource } from '../core/RedisDataSource.js';
import { PostgreSQLDataSource } from '../core/PostgreSQLDataSource.js';
import { ElasticsearchDataSource } from '../core/ElasticsearchDataSource.js';
import {
  CVE,
  CVESearchRequest,
  CVESearchResponse,
  CVEStats,
  CVEFeed,
  CVENotification,
  CVEReport,
} from '../../types/cve.js';

export interface CVEDataServiceConfig {
  mongodb?: {
    enabled: boolean;
    config: any;
    role: 'primary' | 'secondary' | 'archive';
  };
  redis?: {
    enabled: boolean;
    config: any;
    role: 'cache' | 'session' | 'realtime';
  };
  postgresql?: {
    enabled: boolean;
    config: any;
    role: 'relational' | 'analytics' | 'reporting';
  };
  elasticsearch?: {
    enabled: boolean;
    config: any;
    role: 'search' | 'analytics' | 'ml';
  };
  dataStrategy?: {
    readPreference: 'primary' | 'cache-first' | 'distributed';
    writeStrategy: 'single' | 'dual' | 'all';
    consistencyLevel: 'eventual' | 'strong' | 'bounded';
    cacheInvalidation: 'immediate' | 'delayed' | 'ttl-based';
  };
}

export interface CVEQueryContext {
  userId: string;
  organizationId: string;
  permissions: string[];
  preferences?: {
    preferredDataSources?: string[];
    cacheStrategy?: string;
    realTimeUpdates?: boolean;
  };
}

/**
 * Multi-database CVE data service for enterprise SaaS readiness
 */
export class CVEDataService {
  private mongoSource?: MongoDataSource;
  private redisSource?: RedisDataSource;
  private postgresSource?: PostgreSQLDataSource;
  private elasticsearchSource?: ElasticsearchDataSource;
  
  private config: CVEDataServiceConfig;
  private errorHandler: ErrorHandler;
  private performanceMonitor: PerformanceMonitor;
  
  private healthStatus: Map<string, any> = new Map();
  private metrics = {
    operations: {
      total: 0,
      successful: 0,
      failed: 0,
    },
    performance: {
      averageReadTime: 0,
      averageWriteTime: 0,
      cacheHitRate: 0,
    },
    dataSources: {
      mongodb: { operations: 0, errors: 0 },
      redis: { operations: 0, errors: 0 },
      postgresql: { operations: 0, errors: 0 },
      elasticsearch: { operations: 0, errors: 0 },
    },
  };

  constructor(config: CVEDataServiceConfig) {
    this.config = {
      dataStrategy: {
        readPreference: 'cache-first',
        writeStrategy: 'dual',
        consistencyLevel: 'eventual',
        cacheInvalidation: 'immediate',
      },
      ...config,
    };

    this.errorHandler = new ErrorHandler();
    this.performanceMonitor = new PerformanceMonitor();

    logger.info('CVE Data Service initialized', {
      enabledSources: this.getEnabledSources(),
      readPreference: this.config.dataStrategy?.readPreference,
      writeStrategy: this.config.dataStrategy?.writeStrategy,
    });
  }

  /**
   * Initialize all configured data sources
   */
  public async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    try {
      // Initialize MongoDB
      if (this.config.mongodb?.enabled) {
        this.mongoSource = new MongoDataSource(this.config.mongodb.config);
        initPromises.push(this.initializeDataSource('mongodb', this.mongoSource));
      }

      // Initialize Redis
      if (this.config.redis?.enabled) {
        this.redisSource = new RedisDataSource(this.config.redis.config);
        initPromises.push(this.initializeDataSource('redis', this.redisSource));
      }

      // Initialize PostgreSQL
      if (this.config.postgresql?.enabled) {
        this.postgresSource = new PostgreSQLDataSource(this.config.postgresql.config);
        initPromises.push(this.initializeDataSource('postgresql', this.postgresSource));
      }

      // Initialize Elasticsearch
      if (this.config.elasticsearch?.enabled) {
        this.elasticsearchSource = new ElasticsearchDataSource(this.config.elasticsearch.config);
        initPromises.push(this.initializeDataSource('elasticsearch', this.elasticsearchSource));
      }

      await Promise.all(initPromises);

      logger.info('CVE Data Service initialization completed', {
        initializedSources: this.getHealthySources(),
      });
    } catch (error) {
      logger.error('CVE Data Service initialization failed', error);
      throw error;
    }
  }

  /**
   * Create a new CVE record across configured data stores
   */
  public async createCVE(cve: Partial<CVE>, context: CVEQueryContext): Promise<CVE> {
    const measurement = this.performanceMonitor.startMeasurement('createCVE');
    
    try {
      // Generate ID if not provided
      const cveId = cve.cveId || cve.id || `CVE-${Date.now()}`;
      const fullCVE: CVE = {
        id: cveId,
        cveId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: context.organizationId,
        createdBy: context.userId,
        updatedBy: context.userId,
        source: 'manual',
        tags: [],
        ...cve,
      } as CVE;

      const writePromises: Promise<any>[] = [];

      // Write to primary sources based on strategy
      switch (this.config.dataStrategy?.writeStrategy) {
        case 'single':
          await this.writeToPrimarySource(fullCVE);
          break;
        
        case 'dual':
          // Write to primary and cache
          if (this.mongoSource) {
            writePromises.push(this.writeToMongo(fullCVE));
          }
          if (this.redisSource) {
            writePromises.push(this.writeToRedis(fullCVE));
          }
          await Promise.all(writePromises);
          break;
        
        case 'all':
          // Write to all available sources
          if (this.mongoSource) writePromises.push(this.writeToMongo(fullCVE));
          if (this.redisSource) writePromises.push(this.writeToRedis(fullCVE));
          if (this.postgresSource) writePromises.push(this.writeToPostgres(fullCVE));
          if (this.elasticsearchSource) writePromises.push(this.writeToElasticsearch(fullCVE));
          
          await Promise.all(writePromises);
          break;
      }

      // Invalidate cache if needed
      if (this.config.dataStrategy?.cacheInvalidation === 'immediate') {
        await this.invalidateCache(cveId);
      }

      this.updateMetrics('create', true);
      measurement.end({ success: true });

      logger.info('CVE created successfully', {
        cveId,
        userId: context.userId,
        writeStrategy: this.config.dataStrategy?.writeStrategy,
      });

      return fullCVE;
    } catch (error) {
      this.updateMetrics('create', false);
      measurement.end({ success: false });
      
      logger.error('Failed to create CVE', {
        cveId: cve.cveId,
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'createCVE');
    }
  }

  /**
   * Get CVE by ID with intelligent source selection
   */
  public async getCVE(cveId: string, context: CVEQueryContext): Promise<CVE | null> {
    const measurement = this.performanceMonitor.startMeasurement('getCVE');
    
    try {
      let cve: CVE | null = null;

      // Apply read preference strategy
      switch (this.config.dataStrategy?.readPreference) {
        case 'cache-first':
          cve = await this.getCVECacheFirst(cveId);
          break;
        
        case 'primary':
          cve = await this.getCVEFromPrimary(cveId);
          break;
        
        case 'distributed':
          cve = await this.getCVEDistributed(cveId);
          break;
      }

      this.updateMetrics('read', cve !== null);
      measurement.end({ success: cve !== null });

      if (cve) {
        logger.debug('CVE retrieved successfully', {
          cveId,
          userId: context.userId,
          readStrategy: this.config.dataStrategy?.readPreference,
        });
      }

      return cve;
    } catch (error) {
      this.updateMetrics('read', false);
      measurement.end({ success: false });
      
      logger.error('Failed to get CVE', {
        cveId,
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'getCVE');
    }
  }

  /**
   * Update CVE with multi-source synchronization
   */
  public async updateCVE(cveId: string, updates: Partial<CVE>, context: CVEQueryContext): Promise<CVE> {
    const measurement = this.performanceMonitor.startMeasurement('updateCVE');
    
    try {
      // Get existing CVE
      const existingCVE = await this.getCVE(cveId, context);
      if (!existingCVE) {
        throw new Error(`CVE not found: ${cveId}`);
      }

      // Merge updates
      const updatedCVE: CVE = {
        ...existingCVE,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: context.userId,
      };

      // Write updates based on strategy
      const writePromises: Promise<any>[] = [];
      
      if (this.mongoSource) writePromises.push(this.writeToMongo(updatedCVE));
      if (this.redisSource) writePromises.push(this.writeToRedis(updatedCVE));
      if (this.postgresSource) writePromises.push(this.writeToPostgres(updatedCVE));
      if (this.elasticsearchSource) writePromises.push(this.writeToElasticsearch(updatedCVE));
      
      await Promise.all(writePromises);

      // Invalidate cache
      await this.invalidateCache(cveId);

      this.updateMetrics('update', true);
      measurement.end({ success: true });

      logger.info('CVE updated successfully', {
        cveId,
        userId: context.userId,
        updatedFields: Object.keys(updates),
      });

      return updatedCVE;
    } catch (error) {
      this.updateMetrics('update', false);
      measurement.end({ success: false });
      
      logger.error('Failed to update CVE', {
        cveId,
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'updateCVE');
    }
  }

  /**
   * Delete CVE from all configured sources
   */
  public async deleteCVE(cveId: string, context: CVEQueryContext): Promise<boolean> {
    const measurement = this.performanceMonitor.startMeasurement('deleteCVE');
    
    try {
      const deletePromises: Promise<any>[] = [];
      
      // Delete from all sources
      if (this.mongoSource) {
        deletePromises.push(this.deleteFromMongo(cveId));
      }
      if (this.redisSource) {
        deletePromises.push(this.deleteFromRedis(cveId));
      }
      if (this.postgresSource) {
        deletePromises.push(this.deleteFromPostgres(cveId));
      }
      if (this.elasticsearchSource) {
        deletePromises.push(this.deleteFromElasticsearch(cveId));
      }

      await Promise.all(deletePromises);

      this.updateMetrics('delete', true);
      measurement.end({ success: true });

      logger.info('CVE deleted successfully', {
        cveId,
        userId: context.userId,
      });

      return true;
    } catch (error) {
      this.updateMetrics('delete', false);
      measurement.end({ success: false });
      
      logger.error('Failed to delete CVE', {
        cveId,
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'deleteCVE');
    }
  }

  /**
   * Search CVEs using the best available search engine
   */
  public async searchCVEs(request: CVESearchRequest, context: CVEQueryContext): Promise<CVESearchResponse> {
    const measurement = this.performanceMonitor.startMeasurement('searchCVEs');
    
    try {
      let result: any;
      
      // Use Elasticsearch for search if available, fallback to other sources
      if (this.elasticsearchSource) {
        result = await this.searchWithElasticsearch(request);
      } else if (this.postgresSource) {
        result = await this.searchWithPostgres(request);
      } else if (this.mongoSource) {
        result = await this.searchWithMongo(request);
      } else {
        throw new Error('No search-capable data source available');
      }

      this.updateMetrics('search', true);
      measurement.end({ success: true });

      logger.debug('CVE search completed', {
        resultCount: result.total,
        userId: context.userId,
        searchEngine: this.elasticsearchSource ? 'elasticsearch' : 'fallback',
      });

      return result;
    } catch (error) {
      this.updateMetrics('search', false);
      measurement.end({ success: false });
      
      logger.error('CVE search failed', {
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'searchCVEs');
    }
  }

  /**
   * Get comprehensive CVE statistics from all sources
   */
  public async getCVEStatistics(context: CVEQueryContext): Promise<CVEStats> {
    const measurement = this.performanceMonitor.startMeasurement('getCVEStatistics');
    
    try {
      // Try to get from cache first
      if (this.redisSource) {
        const cachedStats = await this.redisSource.getCachedCVEStats();
        if (cachedStats) {
          measurement.end({ success: true, cached: true });
          return cachedStats;
        }
      }

      // Compute statistics from primary source
      let stats: CVEStats;
      
      if (this.postgresSource) {
        stats = await this.getStatsFromPostgres();
      } else if (this.elasticsearchSource) {
        stats = await this.getStatsFromElasticsearch();
      } else if (this.mongoSource) {
        stats = await this.getStatsFromMongo();
      } else {
        throw new Error('No data source available for statistics');
      }

      // Cache the results
      if (this.redisSource) {
        await this.redisSource.cacheCVEStats(stats, 300); // 5 minutes
      }

      this.updateMetrics('statistics', true);
      measurement.end({ success: true, cached: false });

      logger.debug('CVE statistics computed', {
        total: stats.total,
        userId: context.userId,
      });

      return stats;
    } catch (error) {
      this.updateMetrics('statistics', false);
      measurement.end({ success: false });
      
      logger.error('Failed to get CVE statistics', {
        userId: context.userId,
        error: (error as Error).message,
      });
      
      throw this.errorHandler.handleError(error, 'getCVEStatistics');
    }
  }

  /**
   * Get service health status
   */
  public async getHealthStatus(): Promise<any> {
    const healthPromises: Promise<any>[] = [];
    const healthResults: any = {};

    if (this.mongoSource) {
      healthPromises.push(
        this.mongoSource.healthCheck().then(status => {
          healthResults.mongodb = status;
          this.healthStatus.set('mongodb', status);
        })
      );
    }

    if (this.redisSource) {
      healthPromises.push(
        this.redisSource.healthCheck().then(status => {
          healthResults.redis = status;
          this.healthStatus.set('redis', status);
        })
      );
    }

    if (this.postgresSource) {
      healthPromises.push(
        this.postgresSource.healthCheck().then(status => {
          healthResults.postgresql = status;
          this.healthStatus.set('postgresql', status);
        })
      );
    }

    if (this.elasticsearchSource) {
      healthPromises.push(
        this.elasticsearchSource.healthCheck().then(status => {
          healthResults.elasticsearch = status;
          this.healthStatus.set('elasticsearch', status);
        })
      );
    }

    await Promise.allSettled(healthPromises);

    const healthySources = Object.values(healthResults).filter(
      (status: any) => status.status === 'healthy'
    ).length;

    const totalSources = Object.keys(healthResults).length;
    const overallHealth = healthySources === totalSources ? 'healthy' : 
                         healthySources > 0 ? 'degraded' : 'unhealthy';

    return {
      overall: overallHealth,
      sources: healthResults,
      metrics: this.metrics,
      configuration: {
        enabledSources: this.getEnabledSources(),
        readPreference: this.config.dataStrategy?.readPreference,
        writeStrategy: this.config.dataStrategy?.writeStrategy,
      },
    };
  }

  /**
   * Get service metrics
   */
  public getMetrics(): any {
    return {
      ...this.metrics,
      healthySources: this.getHealthySources(),
      lastHealthCheck: new Date().toISOString(),
    };
  }

  // Private helper methods

  private async initializeDataSource(name: string, source: any): Promise<void> {
    try {
      await source.connect();
      logger.info(`${name} data source connected successfully`);
    } catch (error) {
      logger.error(`Failed to connect ${name} data source`, error);
      throw error;
    }
  }

  private getEnabledSources(): string[] {
    const sources: string[] = [];
    if (this.config.mongodb?.enabled) sources.push('mongodb');
    if (this.config.redis?.enabled) sources.push('redis');
    if (this.config.postgresql?.enabled) sources.push('postgresql');
    if (this.config.elasticsearch?.enabled) sources.push('elasticsearch');
    return sources;
  }

  private getHealthySources(): string[] {
    const healthy: string[] = [];
    for (const [source, status] of this.healthStatus.entries()) {
      if (status.status === 'healthy') {
        healthy.push(source);
      }
    }
    return healthy;
  }

  // Read strategies
  private async getCVECacheFirst(cveId: string): Promise<CVE | null> {
    // Try Redis cache first
    if (this.redisSource) {
      const cached = await this.redisSource.getCVE(cveId);
      if (cached) {
        this.metrics.performance.cacheHitRate++;
        return cached;
      }
    }

    // Fallback to primary source
    return this.getCVEFromPrimary(cveId);
  }

  private async getCVEFromPrimary(cveId: string): Promise<CVE | null> {
    // Try MongoDB first (if configured as primary)
    if (this.mongoSource) {
      // Implement MongoDB-specific get method
      return null; // Placeholder
    }

    // Try PostgreSQL
    if (this.postgresSource) {
      return this.postgresSource.getCVE(cveId);
    }

    return null;
  }

  private async getCVEDistributed(cveId: string): Promise<CVE | null> {
    const promises: Promise<CVE | null>[] = [];
    
    if (this.redisSource) promises.push(this.redisSource.getCVE(cveId));
    if (this.postgresSource) promises.push(this.postgresSource.getCVE(cveId));
    if (this.elasticsearchSource) promises.push(this.elasticsearchSource.getCVE(cveId));

    const results = await Promise.allSettled(promises);
    
    // Return first successful result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    return null;
  }

  // Write operations
  private async writeToPrimarySource(cve: CVE): Promise<void> {
    if (this.mongoSource) {
      // Implement MongoDB write
      return;
    }
    
    if (this.postgresSource) {
      await this.postgresSource.storeCVE(cve);
      return;
    }
    
    throw new Error('No primary data source available');
  }

  private async writeToMongo(cve: CVE): Promise<void> {
    // Implement MongoDB-specific write
    this.metrics.dataSources.mongodb.operations++;
  }

  private async writeToRedis(cve: CVE): Promise<void> {
    if (this.redisSource) {
      await this.redisSource.storeCVE(cve);
      this.metrics.dataSources.redis.operations++;
    }
  }

  private async writeToPostgres(cve: CVE): Promise<void> {
    if (this.postgresSource) {
      await this.postgresSource.storeCVE(cve);
      this.metrics.dataSources.postgresql.operations++;
    }
  }

  private async writeToElasticsearch(cve: CVE): Promise<void> {
    if (this.elasticsearchSource) {
      await this.elasticsearchSource.indexCVE(cve);
      this.metrics.dataSources.elasticsearch.operations++;
    }
  }

  // Delete operations
  private async deleteFromMongo(cveId: string): Promise<void> {
    // Implement MongoDB-specific delete
    this.metrics.dataSources.mongodb.operations++;
  }

  private async deleteFromRedis(cveId: string): Promise<void> {
    if (this.redisSource) {
      await this.redisSource.deleteCVE(cveId);
      this.metrics.dataSources.redis.operations++;
    }
  }

  private async deleteFromPostgres(cveId: string): Promise<void> {
    // Implement PostgreSQL-specific delete
    this.metrics.dataSources.postgresql.operations++;
  }

  private async deleteFromElasticsearch(cveId: string): Promise<void> {
    if (this.elasticsearchSource) {
      await this.elasticsearchSource.deleteCVE(cveId);
      this.metrics.dataSources.elasticsearch.operations++;
    }
  }

  // Search operations
  private async searchWithElasticsearch(request: CVESearchRequest): Promise<CVESearchResponse> {
    if (!this.elasticsearchSource) {
      throw new Error('Elasticsearch not available');
    }

    const result = await this.elasticsearchSource.searchCVEs(request.filters, {
      from: ((request.pagination?.page || 1) - 1) * (request.pagination?.limit || 20),
      size: request.pagination?.limit || 20,
      sort: request.sort ? [{ [request.sort.field]: { order: request.sort.order } }] : undefined,
    });

    return {
      cves: result.hits,
      total: result.total,
      page: request.pagination?.page || 1,
      limit: request.pagination?.limit || 20,
      totalPages: Math.ceil(result.total / (request.pagination?.limit || 20)),
    };
  }

  private async searchWithPostgres(request: CVESearchRequest): Promise<CVESearchResponse> {
    if (!this.postgresSource) {
      throw new Error('PostgreSQL not available');
    }

    const result = await this.postgresSource.searchCVEs(request.filters || {}, {
      limit: request.pagination?.limit || 20,
      offset: ((request.pagination?.page || 1) - 1) * (request.pagination?.limit || 20),
    });

    return {
      cves: result.cves,
      total: result.total,
      page: request.pagination?.page || 1,
      limit: request.pagination?.limit || 20,
      totalPages: Math.ceil(result.total / (request.pagination?.limit || 20)),
    };
  }

  private async searchWithMongo(request: CVESearchRequest): Promise<CVESearchResponse> {
    // Implement MongoDB search
    return {
      cves: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }

  // Statistics operations
  private async getStatsFromPostgres(): Promise<CVEStats> {
    if (!this.postgresSource) {
      throw new Error('PostgreSQL not available');
    }

    const dbStats = await this.postgresSource.getCVEStatistics();
    
    return {
      total: parseInt(dbStats.total),
      bySeverity: {
        critical: parseInt(dbStats.critical),
        high: parseInt(dbStats.high),
        medium: parseInt(dbStats.medium),
        low: parseInt(dbStats.low),
        info: 0,
      },
      byStatus: {
        new: parseInt(dbStats.new_cves),
        closed: parseInt(dbStats.closed_cves),
      },
      withExploits: parseInt(dbStats.with_exploits),
      withPatches: parseInt(dbStats.with_patches),
      pastDue: 0,
      trending: {
        period: 'last30days',
        newCVEs: parseInt(dbStats.new_cves),
        patchedCVEs: parseInt(dbStats.closed_cves),
        criticalNew: parseInt(dbStats.critical),
      },
      topVendors: [],
      topProducts: [],
    };
  }

  private async getStatsFromElasticsearch(): Promise<CVEStats> {
    if (!this.elasticsearchSource) {
      throw new Error('Elasticsearch not available');
    }

    const analytics = await this.elasticsearchSource.getCVEAnalytics();
    
    return {
      total: analytics.total || 0,
      bySeverity: {
        critical: analytics.severity_distribution?.buckets?.find((b: any) => b.key === 'critical')?.doc_count || 0,
        high: analytics.severity_distribution?.buckets?.find((b: any) => b.key === 'high')?.doc_count || 0,
        medium: analytics.severity_distribution?.buckets?.find((b: any) => b.key === 'medium')?.doc_count || 0,
        low: analytics.severity_distribution?.buckets?.find((b: any) => b.key === 'low')?.doc_count || 0,
        info: analytics.severity_distribution?.buckets?.find((b: any) => b.key === 'info')?.doc_count || 0,
      },
      byStatus: {},
      withExploits: analytics.exploit_status?.buckets?.find((b: any) => b.key === true)?.doc_count || 0,
      withPatches: analytics.patch_status?.buckets?.find((b: any) => b.key === true)?.doc_count || 0,
      pastDue: 0,
      trending: {
        period: 'last30days',
        newCVEs: 0,
        patchedCVEs: 0,
        criticalNew: 0,
      },
      topVendors: analytics.top_vendors?.buckets?.map((b: any) => ({ vendor: b.key, count: b.doc_count })) || [],
      topProducts: analytics.top_products?.buckets?.map((b: any) => ({ product: b.key, count: b.doc_count })) || [],
    };
  }

  private async getStatsFromMongo(): Promise<CVEStats> {
    // Implement MongoDB stats
    return {
      total: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      byStatus: {},
      withExploits: 0,
      withPatches: 0,
      pastDue: 0,
      trending: { period: 'last30days', newCVEs: 0, patchedCVEs: 0, criticalNew: 0 },
      topVendors: [],
      topProducts: [],
    };
  }

  private async invalidateCache(cveId: string): Promise<void> {
    if (this.redisSource) {
      await this.redisSource.deleteCVE(cveId);
    }
  }

  private updateMetrics(operation: string, success: boolean): void {
    this.metrics.operations.total++;
    if (success) {
      this.metrics.operations.successful++;
    } else {
      this.metrics.operations.failed++;
    }
  }
}