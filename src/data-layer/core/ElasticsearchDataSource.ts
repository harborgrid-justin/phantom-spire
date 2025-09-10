/**
 * Elasticsearch Data Source - Full-text search and analytics engine
 */

import { Client } from '@elastic/elasticsearch';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
  IRelationship,
} from '../interfaces/IDataSource.js';
import { logger } from '../../utils/logger.js';

export class ElasticsearchDataSource extends BaseDataSource {
  public readonly name = 'Elasticsearch';
  public readonly type = 'search';
  public readonly capabilities = [
    'select',
    'aggregate',
    'search',
    'stream',
  ];

  private client?: Client;

  constructor(
    config: { 
      node: string;
      auth?: { username: string; password: string };
      tls?: { rejectUnauthorized: boolean };
      requestTimeout?: number;
      maxRetries?: number;
    } = {
      node: 'http://localhost:9200',
      requestTimeout: 30000,
      maxRetries: 3,
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    this.client = new Client({
      node: this.connectionConfig.node,
      auth: this.connectionConfig.auth,
      tls: this.connectionConfig.tls,
      requestTimeout: this.connectionConfig.requestTimeout || 30000,
      maxRetries: this.connectionConfig.maxRetries || 3,
    });

    // Test connection
    await this.client.ping();
  }

  protected async performDisconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
    }
  }

  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    switch (query.type) {
      case 'select':
        return this.executeSelectQuery(query, context);
      case 'aggregate':
        return this.executeAggregateQuery(query, context);
      case 'search':
        return this.executeSearchQuery(query, context);
      default:
        throw new Error(`Unsupported query type: ${query.type}`);
    }
  }

  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || 'incident-data';
    const esQuery = this.buildElasticsearchQuery(query, context);

    // Use scroll API for streaming
    const scrollSearch = await this.client.search({
      index,
      body: esQuery,
      scroll: '1m',
      size: 100,
    });

    let scrollId = scrollSearch._scroll_id;
    let hits = scrollSearch.hits.hits;

    while (hits.length > 0) {
      for (const hit of hits) {
        yield this.transformHitToDataRecord(hit, this.name);
      }

      const scrollResponse = await this.client.scroll({
        scroll: '1m',
        scroll_id: scrollId,
      });

      scrollId = scrollResponse._scroll_id;
      hits = scrollResponse.hits.hits;
    }

    // Clear scroll
    if (scrollId) {
      await this.client.clearScroll({ scroll_id: scrollId });
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    if (!this.client) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: 'Not connected to Elasticsearch',
      };
    }

    try {
      const startTime = Date.now();
      
      // Test connectivity and get cluster health
      const [pingResponse, healthResponse, statsResponse] = await Promise.all([
        this.client.ping(),
        this.client.cluster.health(),
        this.client.cluster.stats()
      ]);

      const responseTime = Date.now() - startTime;
      const clusterHealth = healthResponse;
      const clusterStats = statsResponse;

      const status = clusterHealth.status === 'red' ? 'unhealthy' : 
                   clusterHealth.status === 'yellow' ? 'degraded' : 'healthy';

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        metrics: {
          clusterStatus: clusterHealth.status,
          numberOfNodes: clusterHealth.number_of_nodes,
          numberOfDataNodes: clusterHealth.number_of_data_nodes,
          activePrimaryShards: clusterHealth.active_primary_shards,
          activeShards: clusterHealth.active_shards,
          relocatingShards: clusterHealth.relocating_shards,
          initializingShards: clusterHealth.initializing_shards,
          unassignedShards: clusterHealth.unassigned_shards,
          indicesCount: clusterStats.indices.count,
          docsCount: clusterStats.indices.docs.count,
          storeSize: clusterStats.indices.store.size_in_bytes,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: (error as Error).message,
      };
    }
  }

  /**
   * Execute a select query
   */
  private async executeSelectQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || 'incident-data';
    const esQuery = this.buildElasticsearchQuery(query, context);

    const response = await this.client.search({
      index,
      body: esQuery,
      size: query.limit || 100,
      from: query.offset || 0,
    });

    const hits = response.body.hits.hits;
    const total = typeof response.body.hits.total === 'object' 
      ? response.body.hits.total.value 
      : response.body.hits.total;

    const data = hits.map((hit: any) => this.transformHitToDataRecord(hit, this.name));

    return {
      data,
      metadata: {
        total,
        hasMore: (query.offset || 0) + hits.length < total,
        executionTime: response.body.took || 0,
        source: this.name,
      },
    };
  }

  /**
   * Execute an aggregation query
   */
  private async executeAggregateQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || 'incident-data';
    const esQuery = this.buildElasticsearchQuery(query, context);

    // Add aggregations
    esQuery.aggs = {
      by_type: {
        terms: {
          field: 'type.keyword',
          size: query.limit || 20,
        },
      },
      by_severity: {
        terms: {
          field: 'severity.keyword',
          size: 10,
        },
      },
      by_date: {
        date_histogram: {
          field: 'timestamp',
          calendar_interval: 'day',
        },
      },
    };

    const response = await this.client.search({
      index,
      body: esQuery,
      size: 0, // We only want aggregations
    });

    const aggregations = response.body.aggregations;
    const data: IDataRecord[] = [];

    // Transform aggregation results into data records
    if (aggregations.by_type) {
      aggregations.by_type.buckets.forEach((bucket: any) => {
        data.push(this.transformToDataRecord({
          type: 'aggregation_result',
          aggregation_type: 'by_type',
          key: bucket.key,
          doc_count: bucket.doc_count,
        }, this.name));
      });
    }

    return {
      data,
      metadata: {
        total: data.length,
        hasMore: false,
        executionTime: response.body.took || 0,
        source: this.name,
      },
      aggregations: {
        by_type: aggregations.by_type,
        by_severity: aggregations.by_severity,
        by_date: aggregations.by_date,
      },
    };
  }

  /**
   * Execute a full-text search query
   */
  private async executeSearchQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!query.searchTerm) {
      throw new Error('Search query requires search term');
    }

    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || 'incident-data';
    const searchFields = query.searchFields || [
      'title^3',
      'description^2',
      'content',
      'tags',
      'responder_notes',
    ];

    const esQuery: any = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query.searchTerm,
                fields: searchFields,
                type: 'best_fields',
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [],
        },
      },
      highlight: {
        fields: {
          title: {},
          description: {},
          content: {},
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
      sort: [
        '_score',
        { timestamp: { order: 'desc' } },
      ],
    };

    // Apply filters
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.$gte && value.$lte) {
            esQuery.query.bool.filter.push({
              range: {
                [key]: {
                  gte: value.$gte,
                  lte: value.$lte,
                },
              },
            });
          } else if (value.$in) {
            esQuery.query.bool.filter.push({
              terms: {
                [`${key}.keyword`]: value.$in,
              },
            });
          }
        } else {
          esQuery.query.bool.filter.push({
            term: {
              [`${key}.keyword`]: value,
            },
          });
        }
      });
    }

    // Apply context filters
    if (context.filters) {
      Object.entries(context.filters).forEach(([key, value]) => {
        esQuery.query.bool.filter.push({
          term: {
            [`${key}.keyword`]: value,
          },
        });
      });
    }

    const response = await this.client.search({
      index,
      body: esQuery,
      size: query.limit || 100,
      from: query.offset || 0,
    });

    const hits = response.body.hits.hits;
    const total = typeof response.body.hits.total === 'object' 
      ? response.body.hits.total.value 
      : response.body.hits.total;

    const data = hits.map((hit: any) => {
      const record = this.transformHitToDataRecord(hit, this.name);
      // Add highlight information
      if (hit.highlight) {
        record.metadata = {
          ...record.metadata,
          highlights: hit.highlight,
          score: hit._score,
        };
      }
      return record;
    });

    return {
      data,
      metadata: {
        total,
        hasMore: (query.offset || 0) + hits.length < total,
        executionTime: response.body.took || 0,
        source: this.name,
      },
    };
  }

  /**
   * Build Elasticsearch query from abstract query
   */
  private buildElasticsearchQuery(query: IQuery, context: IQueryContext): any {
    const esQuery: any = {
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
    };

    // Apply query filters
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.$gte && value.$lte) {
            esQuery.query.bool.filter.push({
              range: {
                [key]: {
                  gte: value.$gte,
                  lte: value.$lte,
                },
              },
            });
          } else if (value.$in) {
            esQuery.query.bool.filter.push({
              terms: {
                [`${key}.keyword`]: value.$in,
              },
            });
          }
        } else {
          esQuery.query.bool.filter.push({
            term: {
              [`${key}.keyword`]: value,
            },
          });
        }
      });
    }

    // Apply context filters
    if (context.filters) {
      Object.entries(context.filters).forEach(([key, value]) => {
        esQuery.query.bool.filter.push({
          term: {
            [`${key}.keyword`]: value,
          },
        });
      });
    }

    // If no specific query, match all
    if (esQuery.query.bool.must.length === 0 && esQuery.query.bool.filter.length === 0) {
      esQuery.query = { match_all: {} };
    }

    // Apply sorting
    if (query.sort) {
      esQuery.sort = Object.entries(query.sort).map(([field, direction]) => ({
        [field]: { order: direction === 1 ? 'asc' : 'desc' },
      }));
    }

    // Apply field projection
    if (query.projection) {
      esQuery._source = query.projection;
    }

    return esQuery;
  }

  /**
   * Transform Elasticsearch hit to data record
   */
  private transformHitToDataRecord(hit: any, source: string): IDataRecord {
    return {
      id: hit._id,
      type: hit._source.type || 'incident_data',
      source: source,
      timestamp: hit._source.timestamp ? new Date(hit._source.timestamp) : new Date(),
      data: hit._source,
      metadata: {
        elasticsearchIndex: hit._index,
        elasticsearchType: hit._type,
        elasticsearchScore: hit._score,
        elasticsearchVersion: hit._version,
      },
      relationships: hit._source.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: [],
        quality: {
          completeness: this.calculateCompleteness(hit._source),
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: hit._source.timestamp ? this.calculateTimeliness(new Date(hit._source.timestamp)) : 0.5,
        },
      },
    };
  }

  /**
   * Calculate completeness score based on field presence
   */
  private calculateCompleteness(data: any): number {
    const requiredFields = ['title', 'description', 'type', 'timestamp'];
    const presentFields = requiredFields.filter(field => data[field] != null);
    return presentFields.length / requiredFields.length;
  }

  /**
   * Calculate timeliness score based on data age
   */
  private calculateTimeliness(timestamp: Date): number {
    const now = new Date();
    const ageInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    // Fresh data (< 1 hour) gets score 1.0
    if (ageInHours <= 1) return 1.0;
    // Data older than 7 days gets score 0.0
    if (ageInHours >= 168) return 0.0;
    // Linear decay between 1 hour and 7 days
    return Math.max(0, 1 - (ageInHours / 168));
  }

  /**
   * Elasticsearch-specific utility methods for incident response
   */

  /**
   * Index incident data
   */
  async indexIncidentData(
    incidentId: string,
    data: any,
    index: string = 'incident-data'
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const document = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      indexed_at: new Date().toISOString(),
    };

    await this.client.index({
      index,
      id: incidentId,
      body: document,
    });
  }

  /**
   * Bulk index multiple documents
   */
  async bulkIndexData(
    documents: Array<{ id: string; data: any }>,
    index: string = 'incident-data'
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const body: any[] = [];
    
    documents.forEach(doc => {
      body.push({
        index: {
          _index: index,
          _id: doc.id,
        },
      });
      
      body.push({
        ...doc.data,
        timestamp: doc.data.timestamp || new Date().toISOString(),
        indexed_at: new Date().toISOString(),
      });
    });

    await this.client.bulk({ body });
  }

  /**
   * Create or update index template for incident data
   */
  async createIncidentTemplate(): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const template = {
      index_patterns: ['incident-*'],
      template: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          'index.refresh_interval': '1s',
          analysis: {
            analyzer: {
              incident_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'stop', 'stemmer'],
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'incident_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            description: {
              type: 'text',
              analyzer: 'incident_analyzer',
            },
            type: {
              type: 'keyword',
            },
            severity: {
              type: 'keyword',
            },
            status: {
              type: 'keyword',
            },
            category: {
              type: 'keyword',
            },
            timestamp: {
              type: 'date',
            },
            created_at: {
              type: 'date',
            },
            updated_at: {
              type: 'date',
            },
            indexed_at: {
              type: 'date',
            },
            tags: {
              type: 'keyword',
            },
            responder_notes: {
              type: 'text',
              analyzer: 'incident_analyzer',
            },
            evidence: {
              type: 'nested',
              properties: {
                name: { type: 'text' },
                type: { type: 'keyword' },
                collected_at: { type: 'date' },
                hash: { type: 'keyword' },
              },
            },
            relationships: {
              type: 'nested',
              properties: {
                type: { type: 'keyword' },
                target_id: { type: 'keyword' },
                weight: { type: 'float' },
              },
            },
          },
        },
      },
    };

    await this.client.indices.putIndexTemplate({
      name: 'incident-template',
      body: template,
    });
  }

  /**
   * Search similar incidents using More Like This query
   */
  async findSimilarIncidents(
    incidentId: string,
    index: string = 'incident-data',
    minDocFreq: number = 1,
    maxQueryTerms: number = 25
  ): Promise<IDataRecord[]> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const response = await this.client.search({
      index,
      body: {
        query: {
          more_like_this: {
            fields: ['title', 'description', 'tags'],
            like: [
              {
                _index: index,
                _id: incidentId,
              },
            ],
            min_doc_freq: minDocFreq,
            max_query_terms: maxQueryTerms,
            min_term_freq: 1,
          },
        },
        size: 10,
      },
    });

    return response.body.hits.hits.map((hit: any) => 
      this.transformHitToDataRecord(hit, this.name)
    );
  }
}