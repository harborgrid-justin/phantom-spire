/**
 * MongoDB Data Source - Enhanced with graph-like capabilities
 */

import mongoose from 'mongoose';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
  IRelationship
} from '../interfaces/IDataSource.js';
// logger imported for future use

export class MongoDataSource extends BaseDataSource {
  public readonly name = 'MongoDB';
  public readonly type = 'document';
  public readonly capabilities = ['select', 'aggregate', 'graph', 'search', 'stream'];

  private database?: mongoose.Connection;

  constructor(config: { uri: string; database: string } = { uri: 'mongodb://localhost:27017', database: 'phantom-spire' }) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      this.database = mongoose.connection;
      return;
    }

    await mongoose.connect(this.connectionConfig.uri, {
      dbName: this.connectionConfig.database
    });
    
    this.database = mongoose.connection;
  }

  protected async performDisconnect(): Promise<void> {
    if (this.database) {
      await mongoose.disconnect();
      this.database = undefined as any;
    }
  }

  protected async performQuery(query: IQuery, context: IQueryContext): Promise<IQueryResult> {
    switch (query.type) {
      case 'select':
        return this.executeSelectQuery(query, context);
      case 'aggregate':
        return this.executeAggregateQuery(query, context);
      case 'graph':
        return this.executeGraphQuery(query, context);
      case 'search':
        return this.executeSearchQuery(query, context);
      default:
        throw new Error(`Unsupported query type: ${query.type}`);
    }
  }

  protected async *performStream(query: IQuery, context: IQueryContext): AsyncIterable<IDataRecord> {
    const collection = this.getCollection(query.entity || 'data');
    
    const mongoQuery = this.buildMongoQuery(query, context);
    const cursor = collection.find(mongoQuery.filter, mongoQuery.options);
    
    for await (const doc of cursor) {
      yield this.transformToDataRecord(doc, this.name);
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    if (!this.database) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: 'Not connected to database'
      };
    }

    try {
      const startTime = Date.now();
      if (!this.database?.db) {
        throw new Error('Database not connected');
      }
      await this.database.db.admin().ping();
      const responseTime = Date.now() - startTime;
      
      const stats = await this.database.db.stats();
      
      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        metrics: {
          collections: stats.collections,
          documents: stats.objects,
          dataSize: stats.dataSize,
          indexes: stats.indexes
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

  /**
   * Execute a select query
   */
  private async executeSelectQuery(query: IQuery, context: IQueryContext): Promise<IQueryResult> {
    const collection = this.getCollection(query.entity || 'data');
    const mongoQuery = this.buildMongoQuery(query, context);
    
    const [documents, total] = await Promise.all([
      collection.find(mongoQuery.filter, mongoQuery.options).toArray(),
      collection.countDocuments(mongoQuery.filter)
    ]);

    const data = documents.map(doc => this.transformToDataRecord(doc, this.name));

    return {
      data,
      metadata: {
        total,
        hasMore: (query.offset || 0) + (query.limit || documents.length) < total,
        executionTime: 0, // Will be set by base class
        source: this.name
      }
    };
  }

  /**
   * Execute an aggregation query
   */
  private async executeAggregateQuery(query: IQuery, context: IQueryContext): Promise<IQueryResult> {
    const collection = this.getCollection(query.entity || 'data');
    
    const pipeline = this.buildAggregationPipeline(query, context);
    const results = await collection.aggregate(pipeline).toArray();

    return {
      data: results.map(result => this.transformToDataRecord(result, this.name)),
      metadata: {
        total: results.length,
        hasMore: false,
        executionTime: 0,
        source: this.name
      },
      aggregations: results.reduce((acc, result) => {
        if (result._id) {
          acc[result._id] = result;
        }
        return acc;
      }, {} as Record<string, any>)
    };
  }

  /**
   * Execute a graph traversal query
   */
  private async executeGraphQuery(query: IQuery, context: IQueryContext): Promise<IQueryResult> {
    if (!query.traversal) {
      throw new Error('Graph query requires traversal specification');
    }

    const relationships = await this.findRelationships(query, context);
    const nodes = await this.findRelatedNodes(query.traversal.startNodes, relationships, query, context);

    return {
      data: nodes,
      relationships,
      metadata: {
        total: nodes.length,
        hasMore: false,
        executionTime: 0,
        source: this.name
      }
    };
  }

  /**
   * Execute a full-text search query
   */
  private async executeSearchQuery(query: IQuery, _context: IQueryContext): Promise<IQueryResult> {
    if (!query.searchTerm) {
      throw new Error('Search query requires search term');
    }

    const collection = this.getCollection(query.entity || 'data');
    
    // Build text search query
    const searchQuery: any = {
      $text: { $search: query.searchTerm }
    };

    // Apply additional filters
    if (query.filters) {
      Object.assign(searchQuery, query.filters);
    }

    const documents = await collection
      .find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(query.limit || 100)
      .skip(query.offset || 0)
      .toArray();

    const total = await collection.countDocuments(searchQuery);
    const data = documents.map(doc => this.transformToDataRecord(doc, this.name));

    return {
      data,
      metadata: {
        total,
        hasMore: (query.offset || 0) + documents.length < total,
        executionTime: 0,
        source: this.name
      }
    };
  }

  /**
   * Find relationships between entities
   */
  private async findRelationships(query: IQuery, _context: IQueryContext): Promise<IRelationship[]> {
    const relationshipsCollection = this.getCollection('relationships');
    
    const filter: any = {};
    
    if (query.traversal?.startNodes) {
      filter.$or = [
        { sourceId: { $in: query.traversal.startNodes } },
        { targetId: { $in: query.traversal.startNodes } }
      ];
    }

    if (query.traversal?.relationships) {
      filter.type = { $in: query.traversal.relationships };
    }

    const relationships = await relationshipsCollection.find(filter).toArray();
    
    return relationships.map(rel => ({
      id: rel._id.toString(),
      type: rel.type,
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      weight: rel.weight,
      confidence: rel.confidence,
      properties: rel.properties || {},
      createdAt: rel.createdAt || new Date()
    }));
  }

  /**
   * Find nodes related through relationships
   */
  private async findRelatedNodes(
    startNodes: string[],
    relationships: IRelationship[],
    query: IQuery,
    _context: IQueryContext
  ): Promise<IDataRecord[]> {
    const nodeIds = new Set(startNodes);
    const maxDepth = query.traversal?.maxDepth || 2;
    
    // Collect all related node IDs through traversal
    for (let depth = 0; depth < maxDepth; depth++) {
      const currentNodes = Array.from(nodeIds);
      let foundNew = false;
      
      for (const rel of relationships) {
        if (currentNodes.includes(rel.sourceId) && !nodeIds.has(rel.targetId)) {
          nodeIds.add(rel.targetId);
          foundNew = true;
        }
        if (currentNodes.includes(rel.targetId) && !nodeIds.has(rel.sourceId)) {
          nodeIds.add(rel.sourceId);
          foundNew = true;
        }
      }
      
      if (!foundNew) break;
    }

    // Fetch actual node data
    const collection = this.getCollection(query.entity || 'data');
    const nodes = await collection.find({
      id: { $in: Array.from(nodeIds) }  // Use string id instead of MongoDB _id
    }).toArray();

    return nodes.map(node => this.transformToDataRecord(node, this.name));
  }

  /**
   * Build MongoDB query from abstract query
   */
  private buildMongoQuery(query: IQuery, _context: IQueryContext): { filter: any; options: any } {
    const filter = { ...query.filters };
    const options: any = {};

    if (query.projection) {
      options.projection = query.projection.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as Record<string, number>);
    }

    if (query.sort) {
      options.sort = query.sort;
    }

    if (query.limit) {
      options.limit = query.limit;
    }

    if (query.offset) {
      options.skip = query.offset;
    }

    return { filter, options };
  }

  /**
   * Build aggregation pipeline
   */
  private buildAggregationPipeline(query: IQuery, _context: IQueryContext): any[] {
    const pipeline: any[] = [];

    // Match stage
    if (query.filters) {
      pipeline.push({ $match: query.filters });
    }

    // Group stage (simplified aggregation)
    pipeline.push({
      $group: {
        _id: query.entity || 'default',
        count: { $sum: 1 },
        data: { $push: '$$ROOT' }
      }
    });

    // Sort stage
    if (query.sort) {
      pipeline.push({ $sort: query.sort });
    }

    // Limit stage
    if (query.limit) {
      pipeline.push({ $limit: query.limit });
    }

    return pipeline;
  }

  /**
   * Get collection by name
   */
  private getCollection(name: string): mongoose.mongo.Collection {
    if (!this.database?.db) {
      throw new Error('Database not connected');
    }
    return this.database.db.collection(name);
  }
}