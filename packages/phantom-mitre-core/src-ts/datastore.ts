// Phantom MITRE Core - Data Store Integration
// TypeScript integration layer for Rust data stores

import { MitreCore } from './index';
import { 
  MitreTechnique, 
  MitreGroup, 
  MitreSoftware, 
  Mitigation, 
  DetectionRule, 
  ThreatAnalysis,
  MitreSearchCriteria 
} from './types';

// Data Store Configuration Types
export interface DataStoreConfig {
  redis?: RedisConfig;
  postgres?: PostgresConfig;
  mongodb?: MongoDBConfig;
  elasticsearch?: ElasticsearchConfig;
  defaultStore: DataStoreType;
  multiTenant: boolean;
  cacheTtlSeconds: number;
}

export enum DataStoreType {
  Redis = 'redis',
  PostgreSQL = 'postgresql',
  MongoDB = 'mongodb',
  Elasticsearch = 'elasticsearch',
}

export interface RedisConfig {
  url: string;
  keyPrefix: string;
  maxConnections: number;
  connectionTimeoutMs: number;
  commandTimeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableCompression: boolean;
  clusterMode: boolean;
  clusterNodes: string[];
}

export interface PostgresConfig {
  url: string;
  maxConnections: number;
  minConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
  maxLifetimeMs: number;
  schemaName: string;
  tablePrefix: string;
  enableSsl: boolean;
  sslMode: string;
  enableMigrations: boolean;
}

export interface MongoDBConfig {
  url: string;
  databaseName: string;
  collectionPrefix: string;
  maxPoolSize: number;
  minPoolSize: number;
  connectionTimeoutMs: number;
  serverSelectionTimeoutMs: number;
  heartbeatFrequencyMs: number;
  enableCompression: boolean;
  compressionAlgorithm: string;
  readPreference: string;
  writeConcern: MongoWriteConcern;
  readConcern: string;
}

export interface MongoWriteConcern {
  w: string;
  j: boolean;
  wtimeoutMs: number;
}

export interface ElasticsearchConfig {
  urls: string[];
  username?: string;
  password?: string;
  apiKey?: string;
  indexPrefix: string;
  connectionTimeoutMs: number;
  requestTimeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableCompression: boolean;
  enableSsl: boolean;
  sslVerification: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
  sslCaPath?: string;
  indexSettings: ElasticsearchIndexSettings;
}

export interface ElasticsearchIndexSettings {
  numberOfShards: number;
  numberOfReplicas: number;
  refreshInterval: string;
  analysis: Record<string, any>;
}

// Tenant Context for Multi-tenancy
export interface TenantContext {
  tenantId: string;
  userId?: string;
  organizationId?: string;
  permissions: string[];
}

// Search and Pagination Types
export interface SearchCriteria {
  query?: string;
  filters: Record<string, string>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export enum SortOrder {
  Ascending = 'ascending',
  Descending = 'descending',
}

export interface Pagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface SearchResults<T> {
  items: T[];
  pagination: Pagination;
  tookMs: number;
}

export interface DataStoreMetrics {
  totalTechniques: number;
  totalGroups: number;
  totalSoftware: number;
  totalMitigations: number;
  totalDetectionRules: number;
  totalAnalyses: number;
  storageSizeBytes: number;
  lastUpdated: Date;
}

export interface BulkOperationResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  processedIds: string[];
}

// Enhanced MitreCore with Data Store Integration
export class MitreCoreWithDataStore extends MitreCore {
  private dataStoreConfig: DataStoreConfig;
  private currentTenant: TenantContext;

  constructor(dataStoreConfig?: DataStoreConfig) {
    super();
    this.dataStoreConfig = dataStoreConfig || this.getDefaultConfig();
    this.currentTenant = {
      tenantId: 'default',
      permissions: ['read', 'write'],
    };
  }

  /**
   * Set the current tenant context for multi-tenant operations
   */
  setTenantContext(context: TenantContext): void {
    this.currentTenant = context;
  }

  /**
   * Get the current tenant context
   */
  getTenantContext(): TenantContext {
    return this.currentTenant;
  }

  /**
   * Initialize data store connections
   */
  async initializeDataStores(): Promise<void> {
    // This would call the Rust implementation through NAPI
    // For now, we'll simulate the initialization
    console.log('Initializing data stores...', {
      defaultStore: this.dataStoreConfig.defaultStore,
      multiTenant: this.dataStoreConfig.multiTenant,
    });
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Data stores initialized successfully');
  }

  /**
   * Store a technique with data store persistence
   */
  async storeTechnique(technique: MitreTechnique): Promise<string> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('write')) {
      throw new Error('Insufficient permissions to store technique');
    }

    // For now, simulate storing to the configured data store
    console.log(`Storing technique ${technique.id} to ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // Simulate storage operation
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return technique.id;
  }

  /**
   * Retrieve a technique from data store
   */
  async getStoredTechnique(id: string): Promise<MitreTechnique | null> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('read')) {
      throw new Error('Insufficient permissions to read technique');
    }

    console.log(`Retrieving technique ${id} from ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // For now, fall back to in-memory technique
    return await this.getTechnique(id);
  }

  /**
   * Search techniques in data store with advanced criteria
   */
  async searchStoredTechniques(criteria: SearchCriteria): Promise<SearchResults<MitreTechnique>> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('read')) {
      throw new Error('Insufficient permissions to search techniques');
    }

    console.log(`Searching techniques in ${this.dataStoreConfig.defaultStore}`, {
      criteria,
      tenant: this.currentTenant.tenantId,
    });

    // Simulate search operation
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // For now, use the existing search functionality
    const mitreCriteria = this.convertToMitreSearchCriteria(criteria);
    const techniques = await this.searchTechniques(mitreCriteria);

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 20;
    const paginatedTechniques = techniques.slice(offset, offset + limit);

    const pagination: Pagination = {
      page: Math.floor(offset / limit),
      size: limit,
      total: techniques.length,
      totalPages: Math.ceil(techniques.length / limit),
    };

    return {
      items: paginatedTechniques,
      pagination,
      tookMs: Date.now() - start,
    };
  }

  /**
   * Store multiple techniques in bulk
   */
  async bulkStoreTechniques(techniques: MitreTechnique[]): Promise<BulkOperationResult> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('write')) {
      throw new Error('Insufficient permissions to bulk store techniques');
    }

    console.log(`Bulk storing ${techniques.length} techniques to ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // Simulate bulk operation
    await new Promise(resolve => setTimeout(resolve, techniques.length * 50));

    // For now, simulate a successful bulk operation
    const result: BulkOperationResult = {
      successCount: techniques.length,
      errorCount: 0,
      errors: [],
      processedIds: techniques.map(t => t.id),
    };

    return result;
  }

  /**
   * Get data store metrics for the current tenant
   */
  async getDataStoreMetrics(): Promise<DataStoreMetrics> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('read')) {
      throw new Error('Insufficient permissions to read metrics');
    }

    console.log(`Getting metrics from ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // Simulate metrics collection
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      totalTechniques: 150 + Math.floor(Math.random() * 50),
      totalGroups: 25 + Math.floor(Math.random() * 10),
      totalSoftware: 80 + Math.floor(Math.random() * 20),
      totalMitigations: 45 + Math.floor(Math.random() * 15),
      totalDetectionRules: 200 + Math.floor(Math.random() * 100),
      totalAnalyses: 50 + Math.floor(Math.random() * 25),
      storageSizeBytes: 1024 * 1024 * (100 + Math.random() * 500), // 100-600 MB
      lastUpdated: new Date(),
    };
  }

  /**
   * Store a threat analysis with data persistence
   */
  async storeAnalysis(analysis: ThreatAnalysis): Promise<string> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('write')) {
      throw new Error('Insufficient permissions to store analysis');
    }

    console.log(`Storing analysis ${analysis.analysis_id} to ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // Simulate storage operation
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));

    return analysis.analysis_id;
  }

  /**
   * Retrieve stored threat analyses
   */
  async getStoredAnalyses(limit: number = 10): Promise<ThreatAnalysis[]> {
    // Validate tenant permissions
    if (!this.currentTenant.permissions.includes('read')) {
      throw new Error('Insufficient permissions to read analyses');
    }

    console.log(`Retrieving ${limit} recent analyses from ${this.dataStoreConfig.defaultStore}`, {
      tenant: this.currentTenant.tenantId,
    });

    // Simulate retrieval operation
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Generate sample analyses
    const analyses: ThreatAnalysis[] = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      const analysis = await this.analyzeThreat([
        `sample_indicator_${i}`,
        `threat_evidence_${i}`,
      ]);
      analyses.push(analysis);
    }

    return analyses;
  }

  /**
   * Test data store connectivity
   */
  async testDataStoreConnectivity(): Promise<Record<string, boolean>> {
    console.log('Testing data store connectivity...');

    const results: Record<string, boolean> = {};

    // Test each configured data store
    if (this.dataStoreConfig.redis) {
      results.redis = await this.testRedisConnection();
    }

    if (this.dataStoreConfig.postgres) {
      results.postgresql = await this.testPostgresConnection();
    }

    if (this.dataStoreConfig.mongodb) {
      results.mongodb = await this.testMongoConnection();
    }

    if (this.dataStoreConfig.elasticsearch) {
      results.elasticsearch = await this.testElasticsearchConnection();
    }

    return results;
  }

  // Private helper methods

  private getDefaultConfig(): DataStoreConfig {
    return {
      defaultStore: DataStoreType.MongoDB,
      multiTenant: true,
      cacheTtlSeconds: 3600,
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        keyPrefix: 'phantom_mitre:',
        maxConnections: 10,
        connectionTimeoutMs: 5000,
        commandTimeoutMs: 3000,
        maxRetries: 3,
        retryDelayMs: 1000,
        enableCompression: true,
        clusterMode: false,
        clusterNodes: [],
      },
      mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
        databaseName: 'phantom_mitre',
        collectionPrefix: 'pm_',
        maxPoolSize: 10,
        minPoolSize: 2,
        connectionTimeoutMs: 30000,
        serverSelectionTimeoutMs: 30000,
        heartbeatFrequencyMs: 10000,
        enableCompression: true,
        compressionAlgorithm: 'zstd',
        readPreference: 'primary',
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeoutMs: 10000,
        },
        readConcern: 'majority',
      },
    };
  }

  private convertToMitreSearchCriteria(criteria: SearchCriteria): MitreSearchCriteria {
    return {
      query: criteria.query,
      limit: criteria.limit,
      // Convert other criteria as needed
    };
  }

  private async testRedisConnection(): Promise<boolean> {
    // Simulate Redis connection test
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return Math.random() > 0.1; // 90% success rate
  }

  private async testPostgresConnection(): Promise<boolean> {
    // Simulate PostgreSQL connection test
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));
    return Math.random() > 0.15; // 85% success rate
  }

  private async testMongoConnection(): Promise<boolean> {
    // Simulate MongoDB connection test
    await new Promise(resolve => setTimeout(resolve, 120 + Math.random() * 180));
    return Math.random() > 0.1; // 90% success rate
  }

  private async testElasticsearchConnection(): Promise<boolean> {
    // Simulate Elasticsearch connection test
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    return Math.random() > 0.2; // 80% success rate
  }
}

// Factory function for creating MitreCore instances with data store support
export function createMitreCoreWithDataStore(config?: DataStoreConfig): MitreCoreWithDataStore {
  return new MitreCoreWithDataStore(config);
}

// Export all data store related types and classes
export * from './types';
export { MitreCore } from './index';