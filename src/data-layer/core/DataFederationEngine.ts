/**
 * Data Federation Engine - Unified query interface across multiple data sources
 * Provides Palantir-like data virtualization capabilities
 */

import { logger } from '../../utils/logger';
import {
  IDataSource,
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IRelationship
} from '../interfaces/IDataSource';

export interface IFederatedQuery extends IQuery {
  sources?: string[]; // Specific sources to query
  fusion?: 'union' | 'join' | 'intersection'; // How to combine results
  joinKeys?: string[]; // Keys to join on
  ranking?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface IFederatedResult extends IQueryResult {
  sourceBreakdown: Record<string, {
    count: number;
    executionTime: number;
    errors?: string[];
  }>;
  fusionMetadata?: {
    strategy: string;
    duplicatesRemoved: number;
    joinedRecords: number;
  };
}

export class DataFederationEngine {
  private dataSources: Map<string, IDataSource> = new Map();
  private defaultTimeout = 30000; // 30 seconds

  /**
   * Register a data source
   */
  public registerDataSource(source: IDataSource): void {
    this.dataSources.set(source.name, source);
    logger.info(`Registered data source: ${source.name}`);
  }

  /**
   * Unregister a data source
   */
  public unregisterDataSource(name: string): void {
    this.dataSources.delete(name);
    logger.info(`Unregistered data source: ${name}`);
  }

  /**
   * Get list of registered data sources
   */
  public getDataSources(): IDataSource[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Execute a federated query across multiple data sources
   */
  public async federatedQuery(
    query: IFederatedQuery,
    context: IQueryContext
  ): Promise<IFederatedResult> {
    const startTime = Date.now();
    
    // Determine which sources to query
    const sourcesToQuery = this.determineSources(query);
    
    logger.info(`Executing federated query across ${sourcesToQuery.length} sources`, {
      sources: sourcesToQuery.map(s => s.name),
      queryType: query.type
    });

    // Execute queries in parallel
    const sourceResults = await this.executeParallelQueries(sourcesToQuery, query, context);
    
    // Fuse results based on strategy
    const fusedResult = await this.fuseResults(sourceResults, query);
    
    // Calculate federation metadata
    const sourceBreakdown = this.calculateSourceBreakdown(sourceResults);
    
    const totalExecutionTime = Date.now() - startTime;
    
    logger.info(`Federated query completed`, {
      totalTime: totalExecutionTime,
      totalResults: fusedResult.data.length,
      sourcesQueried: sourcesToQuery.length
    });

    return {
      ...fusedResult,
      metadata: {
        ...fusedResult.metadata,
        executionTime: totalExecutionTime,
        source: 'Federation'
      },
      sourceBreakdown,
      fusionMetadata: {
        strategy: query.fusion || 'union',
        duplicatesRemoved: 0, // Will be calculated during fusion
        joinedRecords: 0
      }
    };
  }

  /**
   * Stream federated data from multiple sources
   */
  public async *federatedStream(
    query: IFederatedQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    const sourcesToQuery = this.determineSources(query);
    
    // Create async iterators for each source
    const sourceStreams = sourcesToQuery.map(async function* (source) {
      try {
        yield* source.stream(query, context);
      } catch (error) {
        logger.error(`Stream error from source ${source.name}`, error);
      }
    });

    // Yield results as they arrive from any source
    for await (const record of this.mergeStreams(sourceStreams)) {
      yield record;
    }
  }

  /**
   * Get health status of all data sources
   */
  public async getHealthStatus(): Promise<Record<string, any>> {
    const healthPromises = Array.from(this.dataSources.entries()).map(async ([name, source]) => {
      try {
        const health = await Promise.race([
          source.healthCheck(),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        return [name, health];
      } catch (error) {
        return [name, {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 5000,
          message: (error as Error).message
        }];
      }
    });

    const healthResults = await Promise.all(healthPromises);
    
    return Object.fromEntries(healthResults);
  }

  /**
   * Perform cross-source relationship discovery
   */
  public async discoverRelationships(
    entityIds: string[],
    context: IQueryContext,
    options: {
      maxDepth?: number;
      relationshipTypes?: string[];
      similarityThreshold?: number;
    } = {}
  ): Promise<{
    nodes: IDataRecord[];
    relationships: IRelationship[];
    crossSourceLinks: Array<{
      sourceEntity: IDataRecord;
      targetEntity: IDataRecord;
      similarity: number;
      linkType: string;
    }>;
  }> {
    const { maxDepth = 2, similarityThreshold = 0.8 } = options;
    
    // Find entities across all sources
    const entityQuery: IFederatedQuery = {
      type: 'select',
      filters: { id: { $in: entityIds } }
    };
    
    const entityResult = await this.federatedQuery(entityQuery, context);
    
    // Find relationships within each source
    const relationshipQuery: IFederatedQuery = {
      type: 'graph',
      traversal: {
        startNodes: entityIds,
        maxDepth,
        ...(options.relationshipTypes && { relationships: options.relationshipTypes })
      }
    };
    
    const graphResult = await this.federatedQuery(relationshipQuery, context);
    
    // Discover cross-source relationships
    const crossSourceLinks = await this.findCrossSourceLinks(
      entityResult.data,
      similarityThreshold
    );
    
    return {
      nodes: graphResult.data,
      relationships: graphResult.relationships || [],
      crossSourceLinks
    };
  }

  /**
   * Determine which sources to query based on query parameters
   */
  private determineSources(query: IFederatedQuery): IDataSource[] {
    if (query.sources && query.sources.length > 0) {
      return query.sources
        .map(name => this.dataSources.get(name))
        .filter(source => source !== undefined) as IDataSource[];
    }

    // Query all sources that support the query type
    return Array.from(this.dataSources.values()).filter(source =>
      source.capabilities.includes(query.type)
    );
  }

  /**
   * Execute queries in parallel across multiple sources
   */
  private async executeParallelQueries(
    sources: IDataSource[],
    query: IQuery,
    context: IQueryContext
  ): Promise<Array<{ source: IDataSource; result: IQueryResult; error?: Error }>> {
    const queryPromises = sources.map(async (source) => {
      try {
        const result = await Promise.race([
          source.query(query, context),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), this.defaultTimeout)
          )
        ]);
        return { source, result };
      } catch (error) {
        logger.error(`Query failed for source ${source.name}`, error);
        return { source, result: this.createEmptyResult(), error: error as Error };
      }
    });

    return Promise.all(queryPromises);
  }

  /**
   * Fuse results from multiple sources
   */
  private async fuseResults(
    sourceResults: Array<{ source: IDataSource; result: IQueryResult; error?: Error }>,
    query: IFederatedQuery
  ): Promise<IQueryResult> {
    const strategy = query.fusion || 'union';
    const successfulResults = sourceResults.filter(sr => !sr.error);
    
    switch (strategy) {
      case 'union':
        return this.unionResults(successfulResults);
      case 'join':
        return this.joinResults(successfulResults, query.joinKeys || ['id']);
      case 'intersection':
        return this.intersectionResults(successfulResults, query.joinKeys || ['id']);
      default:
        throw new Error(`Unsupported fusion strategy: ${strategy}`);
    }
  }

  /**
   * Union all results (combine all records)
   */
  private unionResults(
    sourceResults: Array<{ source: IDataSource; result: IQueryResult }>
  ): IQueryResult {
    const allData: IDataRecord[] = [];
    const allRelationships: IRelationship[] = [];
    let totalCount = 0;

    for (const { result } of sourceResults) {
      allData.push(...result.data);
      if (result.relationships) {
        allRelationships.push(...result.relationships);
      }
      totalCount += result.metadata.total;
    }

    // Remove duplicates based on ID
    const uniqueData = this.removeDuplicateRecords(allData);
    const uniqueRelationships = this.removeDuplicateRelationships(allRelationships);

    return {
      data: uniqueData,
      relationships: uniqueRelationships,
      metadata: {
        total: uniqueData.length,
        hasMore: false,
        executionTime: 0,
        source: 'Federation'
      }
    };
  }

  /**
   * Join results based on common keys
   */
  private joinResults(
    sourceResults: Array<{ source: IDataSource; result: IQueryResult }>,
    joinKeys: string[]
  ): IQueryResult {
    if (sourceResults.length < 2) {
      return sourceResults[0]?.result || this.createEmptyResult();
    }

    const [first, ...rest] = sourceResults;
    if (!first) {
      return this.createEmptyResult();
    }
    let joinedData = first.result.data;

    for (const { result } of rest) {
      joinedData = this.performJoin(joinedData, result.data, joinKeys);
    }

    return {
      data: joinedData,
      metadata: {
        total: joinedData.length,
        hasMore: false,
        executionTime: 0,
        source: 'Federation'
      }
    };
  }

  /**
   * Intersection of results based on common keys
   */
  private intersectionResults(
    sourceResults: Array<{ source: IDataSource; result: IQueryResult }>,
    joinKeys: string[]
  ): IQueryResult {
    if (sourceResults.length === 0) {
      return this.createEmptyResult();
    }

    const [first, ...rest] = sourceResults;
    if (!first) {
      return this.createEmptyResult();
    }
    let intersectionData = first.result.data;

    for (const { result } of rest) {
      intersectionData = this.performIntersection(intersectionData, result.data, joinKeys);
    }

    return {
      data: intersectionData,
      metadata: {
        total: intersectionData.length,
        hasMore: false,
        executionTime: 0,
        source: 'Federation'
      }
    };
  }

  /**
   * Remove duplicate records based on ID
   */
  private removeDuplicateRecords(records: IDataRecord[]): IDataRecord[] {
    const seen = new Set<string>();
    return records.filter(record => {
      if (seen.has(record.id)) {
        return false;
      }
      seen.add(record.id);
      return true;
    });
  }

  /**
   * Remove duplicate relationships
   */
  private removeDuplicateRelationships(relationships: IRelationship[]): IRelationship[] {
    const seen = new Set<string>();
    return relationships.filter(rel => {
      const key = `${rel.sourceId}-${rel.type}-${rel.targetId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Perform inner join on two datasets
   */
  private performJoin(left: IDataRecord[], right: IDataRecord[], keys: string[]): IDataRecord[] {
    const rightMap = new Map<string, IDataRecord[]>();
    
    // Index right dataset
    for (const record of right) {
      const keyValue = this.extractKeyValue(record, keys);
      if (!rightMap.has(keyValue)) {
        rightMap.set(keyValue, []);
      }
      rightMap.get(keyValue)!.push(record);
    }

    // Join with left dataset
    const joined: IDataRecord[] = [];
    for (const leftRecord of left) {
      const keyValue = this.extractKeyValue(leftRecord, keys);
      const rightRecords = rightMap.get(keyValue);
      
      if (rightRecords) {
        for (const rightRecord of rightRecords) {
          joined.push({
            ...leftRecord,
            data: { ...leftRecord.data, ...rightRecord.data },
            relationships: [
              ...(leftRecord.relationships || []),
              ...(rightRecord.relationships || [])
            ]
          });
        }
      }
    }

    return joined;
  }

  /**
   * Perform intersection on two datasets
   */
  private performIntersection(left: IDataRecord[], right: IDataRecord[], keys: string[]): IDataRecord[] {
    const rightKeys = new Set(right.map(record => this.extractKeyValue(record, keys)));
    
    return left.filter(record => 
      rightKeys.has(this.extractKeyValue(record, keys))
    );
  }

  /**
   * Extract key value from record for joining
   */
  private extractKeyValue(record: IDataRecord, keys: string[]): string {
    return keys.map(key => {
      const value = record.data[key] || record[key as keyof IDataRecord];
      return value?.toString() || '';
    }).join('|');
  }

  /**
   * Find cross-source entity links based on similarity
   */
  private async findCrossSourceLinks(
    entities: IDataRecord[],
    threshold: number
  ): Promise<Array<{
    sourceEntity: IDataRecord;
    targetEntity: IDataRecord;
    similarity: number;
    linkType: string;
  }>> {
    const links: Array<{
      sourceEntity: IDataRecord;
      targetEntity: IDataRecord;
      similarity: number;
      linkType: string;
    }> = [];

    // Group entities by source
    const entitiesBySource = entities.reduce((acc, entity) => {
      if (!acc[entity.source]) {
        acc[entity.source] = [];
      }
      acc[entity.source]!.push(entity);
      return acc;
    }, {} as Record<string, IDataRecord[]>);

    const sources = Object.keys(entitiesBySource);
    
    // Compare entities between different sources
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = sources[i];
        const source2 = sources[j];
        
        if (!source1 || !source2) continue;
        
        const entities1 = entitiesBySource[source1];
        const entities2 = entitiesBySource[source2];
        
        if (!entities1 || !entities2) continue;
        
        for (const entity1 of entities1) {
          for (const entity2 of entities2) {
            const similarity = this.calculateSimilarity(entity1, entity2);
            
            if (similarity >= threshold) {
              links.push({
                sourceEntity: entity1,
                targetEntity: entity2,
                similarity,
                linkType: 'similar_entity'
              });
            }
          }
        }
      }
    }

    return links;
  }

  /**
   * Calculate similarity between two entities
   */
  private calculateSimilarity(entity1: IDataRecord, entity2: IDataRecord): number {
    // Simple Jaccard similarity on common fields
    const fields1 = new Set(Object.keys(entity1.data));
    const fields2 = new Set(Object.keys(entity2.data));
    
    const intersection = new Set([...fields1].filter(x => fields2.has(x)));
    const union = new Set([...fields1, ...fields2]);
    
    if (union.size === 0) return 0;
    
    let matchingValues = 0;
    for (const field of intersection) {
      if (entity1.data[field] === entity2.data[field]) {
        matchingValues++;
      }
    }
    
    return matchingValues / union.size;
  }

  /**
   * Calculate source breakdown metrics
   */
  private calculateSourceBreakdown(
    sourceResults: Array<{ source: IDataSource; result: IQueryResult; error?: Error }>
  ): Record<string, { count: number; executionTime: number; errors?: string[] }> {
    const breakdown: Record<string, { count: number; executionTime: number; errors?: string[] }> = {};
    
    for (const { source, result, error } of sourceResults) {
      breakdown[source.name] = {
        count: result.data.length,
        executionTime: result.metadata.executionTime,
        ...(error && { errors: [error.message] })
      };
    }
    
    return breakdown;
  }

  /**
   * Merge multiple async streams
   */
  private async *mergeStreams(streams: Array<AsyncIterable<IDataRecord>>): AsyncIterable<IDataRecord> {
    const iterators = streams.map(stream => stream[Symbol.asyncIterator]());
    const pending = new Set(iterators);
    
    while (pending.size > 0) {
      const promises = Array.from(pending).map(async (iterator, index) => {
        try {
          const result = await iterator.next();
          return { iterator, result, index };
        } catch (error) {
          pending.delete(iterator);
          return null;
        }
      });
      
      const settled = await Promise.allSettled(promises);
      
      for (const result of settled) {
        if (result.status === 'fulfilled' && result.value) {
          const { iterator, result: iterResult } = result.value;
          
          if (iterResult.done) {
            pending.delete(iterator);
          } else {
            yield iterResult.value;
          }
        }
      }
    }
  }

  /**
   * Create empty result
   */
  private createEmptyResult(): IQueryResult {
    return {
      data: [],
      metadata: {
        total: 0,
        hasMore: false,
        executionTime: 0,
        source: 'Empty'
      }
    };
  }
}