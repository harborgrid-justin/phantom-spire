/**
 * TypeScript Bridge for Unified Data Layer
 * 
 * Bridges between the Rust unified data layer and TypeScript data layer interfaces
 */

import {
  IDataSource,
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
  IRelationship,
} from '../interfaces/IDataSource.js';

/**
 * Universal data record that can represent any type of threat intelligence data
 */
export interface UniversalDataRecord {
  id: string;
  recordType: string; // "ioc", "technique", "incident", etc.
  sourcePlugin: string; // "phantom-ioc-core", "phantom-mitre-core", etc.
  data: Record<string, any>; // Raw data
  metadata: Record<string, any>;
  relationships: DataRelationship[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  tenantId?: string;
}

/**
 * Represents relationships between data records
 */
export interface DataRelationship {
  id: string;
  relationshipType: string; // "uses", "targets", "mitigates", etc.
  sourceId: string;
  targetId: string;
  confidence?: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

/**
 * Query context for multi-tenant and permission-aware operations
 */
export interface UnifiedQueryContext {
  tenantId?: string;
  userId?: string;
  permissions: string[];
  filters: Record<string, any>;
  includeRelationships: boolean;
}

/**
 * Search query for unified data operations
 */
export interface UnifiedQuery {
  recordTypes?: string[]; // Filter by record types
  sourcePlugins?: string[]; // Filter by source plugins
  textQuery?: string; // Full-text search
  filters: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDesc: boolean;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Query result with pagination and metadata
 */
export interface UnifiedQueryResult {
  records: UniversalDataRecord[];
  relationships: DataRelationship[];
  totalCount?: number;
  queryTimeMs: number;
  pagination?: {
    page: number;
    size: number;
    totalPages: number;
  };
}

/**
 * Health status for unified data stores
 */
export interface UnifiedHealthStatus {
  healthy: boolean;
  responseTimeMs: number;
  message?: string;
  capabilities: string[];
  metrics: Record<string, any>;
  lastCheck: Date;
}

/**
 * Result of bulk operations
 */
export interface BulkOperationResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  processedIds: string[];
  operationTimeMs: number;
}

/**
 * Unified data store interface that bridges to Rust implementations
 */
export interface UnifiedDataStore {
  readonly storeId: string;
  readonly capabilities: string[];
  
  initialize(): Promise<void>;
  close(): Promise<void>;
  healthCheck(): Promise<UnifiedHealthStatus>;
  
  storeRecord(record: UniversalDataRecord, context: UnifiedQueryContext): Promise<string>;
  getRecord(id: string, context: UnifiedQueryContext): Promise<UniversalDataRecord | null>;
  updateRecord(record: UniversalDataRecord, context: UnifiedQueryContext): Promise<void>;
  deleteRecord(id: string, context: UnifiedQueryContext): Promise<void>;
  queryRecords(query: UnifiedQuery, context: UnifiedQueryContext): Promise<UnifiedQueryResult>;
  
  storeRelationship(relationship: DataRelationship, context: UnifiedQueryContext): Promise<string>;
  getRelationships(recordId: string, context: UnifiedQueryContext): Promise<DataRelationship[]>;
  
  bulkStoreRecords(records: UniversalDataRecord[], context: UnifiedQueryContext): Promise<BulkOperationResult>;
}

/**
 * Plugin registry for managing multiple data stores
 */
export class UnifiedDataStoreRegistry {
  private stores = new Map<string, UnifiedDataStore>();
  private primaryStore?: string;
  
  /**
   * Register a data store
   */
  async registerStore(store: UnifiedDataStore): Promise<void> {
    await store.initialize();
    
    this.stores.set(store.storeId, store);
    
    // Set as primary if first store
    if (!this.primaryStore) {
      this.primaryStore = store.storeId;
    }
  }
  
  /**
   * Get a store by ID
   */
  getStore(storeId: string): UnifiedDataStore | undefined {
    return this.stores.get(storeId);
  }
  
  /**
   * Get the primary store
   */
  getPrimaryStore(): UnifiedDataStore | undefined {
    if (this.primaryStore) {
      return this.stores.get(this.primaryStore);
    }
    return undefined;
  }
  
  /**
   * List all registered stores
   */
  listStores(): string[] {
    return Array.from(this.stores.keys());
  }
  
  /**
   * Cross-plugin query that searches across all stores
   */
  async crossPluginQuery(query: UnifiedQuery, context: UnifiedQueryContext): Promise<UnifiedQueryResult> {
    const allRecords: UniversalDataRecord[] = [];
    const allRelationships: DataRelationship[] = [];
    let totalQueryTime = 0;
    let totalCount = 0;
    
    const storePromises = Array.from(this.stores.values()).map(async (store) => {
      try {
        const result = await store.queryRecords(query, context);
        return result;
      } catch (error) {
        console.error(`Store ${store.storeId} query failed:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(storePromises);
    
    for (const result of results) {
      if (result) {
        allRecords.push(...result.records);
        allRelationships.push(...result.relationships);
        totalQueryTime += result.queryTimeMs;
        if (result.totalCount) {
          totalCount += result.totalCount;
        }
      }
    }
    
    // Apply global limit if specified
    if (query.limit) {
      allRecords.splice(query.limit);
    }
    
    return {
      records: allRecords,
      relationships: allRelationships,
      totalCount,
      queryTimeMs: totalQueryTime,
      pagination: undefined, // TODO: Implement cross-store pagination
    };
  }
  
  /**
   * Health check for all registered stores
   */
  async healthCheckAll(): Promise<Map<string, UnifiedHealthStatus>> {
    const healthResults = new Map<string, UnifiedHealthStatus>();
    
    const healthPromises = Array.from(this.stores.entries()).map(async ([storeId, store]) => {
      try {
        const health = await store.healthCheck();
        return [storeId, health] as const;
      } catch (error) {
        return [storeId, {
          healthy: false,
          responseTimeMs: 0,
          message: `Health check failed: ${error}`,
          capabilities: [] as string[],
          metrics: {},
          lastCheck: new Date(),
        }] as const;
      }
    });
    
    const results = await Promise.all(healthPromises);
    
    for (const [storeId, health] of results) {
      healthResults.set(storeId, health);
    }
    
    return healthResults;
  }
}

/**
 * Adapter that implements IDataSource interface using UnifiedDataStore
 */
export class UnifiedDataSourceAdapter implements IDataSource {
  public readonly name: string;
  public readonly type: string = 'unified';
  public readonly capabilities: string[];
  
  private unifiedStore: UnifiedDataStore;
  private defaultContext: UnifiedQueryContext;
  
  constructor(unifiedStore: UnifiedDataStore, name?: string) {
    this.unifiedStore = unifiedStore;
    this.name = name || `unified-${unifiedStore.storeId}`;
    this.capabilities = unifiedStore.capabilities;
    this.defaultContext = {
      permissions: ['read', 'write'],
      filters: {},
      includeRelationships: true,
    };
  }
  
  async connect(): Promise<void> {
    await this.unifiedStore.initialize();
  }
  
  async disconnect(): Promise<void> {
    await this.unifiedStore.close();
  }
  
  async query(query: IQuery, context: IQueryContext): Promise<IQueryResult> {
    // Convert IQuery to UnifiedQuery
    const unifiedQuery: UnifiedQuery = {
      textQuery: (query as any).textQuery,
      filters: query.filters || {},
      limit: query.limit,
      offset: query.offset,
      sortBy: (query as any).sortBy,
      sortDesc: (query as any).sortOrder === 'desc',
      timeRange: (query as any).timeRange ? {
        start: new Date((query as any).timeRange.start),
        end: new Date((query as any).timeRange.end),
      } : undefined,
    };
    
    // Convert IQueryContext to UnifiedQueryContext
    const unifiedContext: UnifiedQueryContext = {
      tenantId: context.userId, // Map userId to tenantId for simplicity
      userId: context.userId,
      permissions: context.permissions || ['read'],
      filters: context.filters || {},
      includeRelationships: true,
    };
    
    const result = await this.unifiedStore.queryRecords(unifiedQuery, unifiedContext);
    
    // Convert UnifiedQueryResult to IQueryResult
    const records: IDataRecord[] = result.records.map(r => ({
      id: r.id,
      type: r.recordType,
      source: r.sourcePlugin,
      timestamp: r.createdAt,
      data: r.data,
      metadata: r.metadata,
      relationships: r.relationships.map(rel => ({
        id: rel.id,
        type: rel.relationshipType,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        weight: rel.confidence,
        confidence: rel.confidence,
        properties: rel.metadata,
        createdAt: rel.createdAt,
      })),
    }));
    
    return {
      data: records,
      metadata: {
        total: result.totalCount || 0,
        executionTime: result.queryTimeMs,
        source: this.name,
        hasMore: result.totalCount ? records.length < result.totalCount : false,
      },
      relationships: result.relationships.map(rel => ({
        id: rel.id,
        type: rel.relationshipType,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        weight: rel.confidence,
        confidence: rel.confidence,
        properties: rel.metadata,
        createdAt: rel.createdAt,
      })),
    };
  }
  
  stream(query: IQuery, context: IQueryContext): AsyncIterable<IDataRecord> {
    // For now, implement streaming as a simple query and yield results
    const self = this;
    
    return {
      async *[Symbol.asyncIterator]() {
        const result = await self.query(query, context);
        for (const record of result.data) {
          yield record;
        }
      }
    };
  }
  
  async healthCheck(): Promise<IHealthStatus> {
    const health = await this.unifiedStore.healthCheck();
    
    return {
      status: health.healthy ? 'healthy' : 'unhealthy',
      lastCheck: health.lastCheck,
      responseTime: health.responseTimeMs,
      message: health.message,
      metrics: health.metrics,
    };
  }
}

/**
 * Factory for creating unified data stores from different plugin adapters
 */
export class UnifiedDataStoreFactory {
  /**
   * Create a unified registry with adapters for all available plugins
   */
  static async createRegistry(): Promise<UnifiedDataStoreRegistry> {
    const registry = new UnifiedDataStoreRegistry();
    
    // This would be implemented by calling into Rust to create actual adapters
    // For now, we'll return an empty registry
    
    return registry;
  }
  
  /**
   * Create a data source that provides unified access to all plugins
   */
  static async createUnifiedDataSource(name: string = 'unified-phantom-spire'): Promise<IDataSource> {
    const registry = await this.createRegistry();
    
    // Create a virtual store that delegates to the registry
    const virtualStore: UnifiedDataStore = {
      storeId: 'virtual-unified',
      capabilities: ['cross_plugin_query', 'unified_interface'],
      
      async initialize() {
        // Registry is already initialized
      },
      
      async close() {
        // Close all stores in registry
        const stores = registry.listStores();
        for (const storeId of stores) {
          const store = registry.getStore(storeId);
          if (store) {
            await store.close();
          }
        }
      },
      
      async healthCheck() {
        const healthResults = await registry.healthCheckAll();
        const allHealthy = Array.from(healthResults.values()).every(h => h.healthy);
        const totalResponseTime = Array.from(healthResults.values())
          .reduce((sum, h) => sum + h.responseTimeMs, 0);
        
        return {
          healthy: allHealthy,
          responseTimeMs: totalResponseTime,
          message: allHealthy ? 'All plugins healthy' : 'Some plugins unhealthy',
          capabilities: this.capabilities,
          metrics: {
            pluginCount: healthResults.size,
            healthyCount: Array.from(healthResults.values()).filter(h => h.healthy).length,
          },
          lastCheck: new Date(),
        };
      },
      
      async storeRecord(record, context) {
        const primaryStore = registry.getPrimaryStore();
        if (!primaryStore) {
          throw new Error('No primary store available');
        }
        return primaryStore.storeRecord(record, context);
      },
      
      async getRecord(id, context) {
        // Try all stores until we find the record
        for (const storeId of registry.listStores()) {
          const store = registry.getStore(storeId);
          if (store) {
            const record = await store.getRecord(id, context);
            if (record) {
              return record;
            }
          }
        }
        return null;
      },
      
      async updateRecord(record, context) {
        // Update in the store that originally contained the record
        const sourceStore = registry.getStore(record.sourcePlugin);
        if (sourceStore) {
          return sourceStore.updateRecord(record, context);
        }
        
        // Fallback to primary store
        const primaryStore = registry.getPrimaryStore();
        if (primaryStore) {
          return primaryStore.updateRecord(record, context);
        }
        
        throw new Error('No suitable store found for update');
      },
      
      async deleteRecord(id, context) {
        // Try to delete from all stores
        let deleted = false;
        for (const storeId of registry.listStores()) {
          const store = registry.getStore(storeId);
          if (store) {
            try {
              await store.deleteRecord(id, context);
              deleted = true;
            } catch {
              // Continue trying other stores
            }
          }
        }
        
        if (!deleted) {
          throw new Error(`Record ${id} not found in any store`);
        }
      },
      
      async queryRecords(query, context) {
        return registry.crossPluginQuery(query, context);
      },
      
      async storeRelationship(relationship, context) {
        const primaryStore = registry.getPrimaryStore();
        if (!primaryStore) {
          throw new Error('No primary store available');
        }
        return primaryStore.storeRelationship(relationship, context);
      },
      
      async getRelationships(recordId, context) {
        const allRelationships: DataRelationship[] = [];
        
        for (const storeId of registry.listStores()) {
          const store = registry.getStore(storeId);
          if (store) {
            try {
              const relationships = await store.getRelationships(recordId, context);
              allRelationships.push(...relationships);
            } catch {
              // Continue with other stores
            }
          }
        }
        
        return allRelationships;
      },
      
      async bulkStoreRecords(records, context) {
        // Distribute records to appropriate stores based on their source plugin
        const storeGroups = new Map<string, UniversalDataRecord[]>();
        
        for (const record of records) {
          const targetStore = registry.getStore(record.sourcePlugin) || registry.getPrimaryStore();
          if (targetStore) {
            const storeId = targetStore.storeId;
            if (!storeGroups.has(storeId)) {
              storeGroups.set(storeId, []);
            }
            storeGroups.get(storeId)!.push(record);
          }
        }
        
        // Execute bulk operations in parallel
        const results = await Promise.all(
          Array.from(storeGroups.entries()).map(async ([storeId, storeRecords]) => {
            const store = registry.getStore(storeId);
            if (store) {
              return store.bulkStoreRecords(storeRecords, context);
            }
            return {
              successCount: 0,
              errorCount: storeRecords.length,
              errors: [`Store ${storeId} not found`],
              processedIds: [],
              operationTimeMs: 0,
            };
          })
        );
        
        // Aggregate results
        const aggregated: BulkOperationResult = {
          successCount: results.reduce((sum, r) => sum + r.successCount, 0),
          errorCount: results.reduce((sum, r) => sum + r.errorCount, 0),
          errors: results.flatMap(r => r.errors),
          processedIds: results.flatMap(r => r.processedIds),
          operationTimeMs: Math.max(...results.map(r => r.operationTimeMs)),
        };
        
        return aggregated;
      },
    };
    
    return new UnifiedDataSourceAdapter(virtualStore, name);
  }
}