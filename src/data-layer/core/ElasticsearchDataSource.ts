/**
 * Elasticsearch Data Source - Advanced search and analytics capabilities
 */

import { Client } from '@elastic/elasticsearch';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
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
    'analytics',
    'fulltext',
  ];

  private client?: Client;

  constructor(
    config: { 
      node: string;
      auth?: {
        username: string;
        password: string;
      };
      tls?: {
        rejectUnauthorized: boolean;
      };
      defaultIndex?: string;
    } = {
      node: 'http://localhost:9200',
      defaultIndex: 'phantom-spire-iocs',
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    const clientConfig: any = {
      node: this.connectionConfig.node,
    };

    if (this.connectionConfig.auth) {
      clientConfig.auth = this.connectionConfig.auth;
    }

    if (this.connectionConfig.tls) {
      clientConfig.tls = this.connectionConfig.tls;
    }

    this.client = new Client(clientConfig);

    // Test the connection
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
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || this.connectionConfig.defaultIndex || 'phantom-spire-iocs';

    switch (query.type) {
      case 'select':
        return await this.handleSelectQuery(query, index);
      case 'search':
        return await this.handleSearchQuery(query, index);
      case 'aggregate':
        return await this.handleAggregateQuery(query, index);
      default:
        throw new Error(`Query type ${query.type} not supported by Elasticsearch data source`);
    }
  }

  private async handleSelectQuery(query: IQuery, index: string): Promise<IQueryResult> {
    const body: any = {
      query: {
        bool: {
          must: []
        }
      }
    };

    // Build filters
    if (query.filters && Object.keys(query.filters).length > 0) {
      for (const [field, value] of Object.entries(query.filters)) {
        body.query.bool.must.push({
          term: { [field]: value }
        });
      }
    } else {
      body.query = { match_all: {} };
    }

    // Add sorting
    if (query.sort) {
      body.sort = Object.entries(query.sort).map(([field, direction]) => ({
        [field]: { order: direction === 1 ? 'asc' : 'desc' }
      }));
    }

    const response = await this.client!.search({
      index,
      body,
      size: query.limit || 100,
      from: query.offset || 0,
    });

    const data = response.body.hits.hits.map((hit: any) => 
      this.transformToDataRecord({ ...hit._source, _id: hit._id }, 'Elasticsearch')
    );

    return {
      data,
      metadata: {
        total: response.body.hits.total.value,
        hasMore: (query.offset || 0) + data.length < response.body.hits.total.value,
        executionTime: response.body.took,
        source: this.name,
      },
    };
  }

  private async handleSearchQuery(query: IQuery, index: string): Promise<IQueryResult> {
    if (!query.searchTerm) {
      throw new Error('Search term is required for search queries');
    }

    const body: any = {
      query: {
        multi_match: {
          query: query.searchTerm,
          fields: query.searchFields || ['*'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        }
      },
      highlight: {
        fields: {}
      }
    };

    // Add highlight fields
    if (query.searchFields) {
      query.searchFields.forEach(field => {
        body.highlight.fields[field] = {};
      });
    } else {
      body.highlight.fields['*'] = {};
    }

    const response = await this.client!.search({
      index,
      body,
      size: query.limit || 100,
      from: query.offset || 0,
    });

    const data = response.body.hits.hits.map((hit: any) => {
      const record = this.transformToDataRecord(
        { ...hit._source, _id: hit._id, _score: hit._score }, 
        'Elasticsearch'
      );
      
      if (hit.highlight) {
        record.metadata = { ...record.metadata, highlight: hit.highlight };
      }
      
      return record;
    });

    return {
      data,
      metadata: {
        total: response.body.hits.total.value,
        hasMore: (query.offset || 0) + data.length < response.body.hits.total.value,
        executionTime: response.body.took,
        source: this.name,
      },
    };
  }

  private async handleAggregateQuery(query: IQuery, index: string): Promise<IQueryResult> {
    const body: any = {
      size: 0,
      aggs: {
        threat_types: {
          terms: { field: 'type.keyword' }
        },
        threat_sources: {
          terms: { field: 'source.keyword' }
        },
        threat_score_stats: {
          stats: { field: 'threat_score' }
        },
        timeline: {
          date_histogram: {
            field: 'created_at',
            calendar_interval: 'day'
          }
        }
      }
    };

    // Add filters if present
    if (query.filters && Object.keys(query.filters).length > 0) {
      body.query = {
        bool: {
          must: Object.entries(query.filters).map(([field, value]) => ({
            term: { [field]: value }
          }))
        }
      };
    }

    const response = await this.client!.search({
      index,
      body,
    });

    return {
      data: [],
      metadata: {
        total: 0,
        hasMore: false,
        executionTime: response.body.took,
        source: this.name,
      },
      aggregations: response.body.aggregations,
    };
  }

  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const index = query.entity || this.connectionConfig.defaultIndex || 'phantom-spire-iocs';
    
    // Use scroll API for streaming large datasets
    let scrollId: string | undefined;
    const scrollSize = 1000;

    try {
      const initialResponse = await this.client.search({
        index,
        scroll: '5m',
        size: scrollSize,
        body: {
          query: query.filters ? {
            bool: {
              must: Object.entries(query.filters).map(([field, value]) => ({
                term: { [field]: value }
              }))
            }
          } : { match_all: {} }
        }
      });

      scrollId = initialResponse.body._scroll_id;
      
      for (const hit of initialResponse.body.hits.hits) {
        yield this.transformToDataRecord(
          { ...hit._source, _id: hit._id }, 
          'Elasticsearch'
        );
      }

      while (scrollId) {
        const scrollResponse = await this.client.scroll({
          scroll_id: scrollId,
          scroll: '5m',
        });

        if (scrollResponse.body.hits.hits.length === 0) {
          break;
        }

        scrollId = scrollResponse.body._scroll_id;

        for (const hit of scrollResponse.body.hits.hits) {
          yield this.transformToDataRecord(
            { ...hit._source, _id: hit._id }, 
            'Elasticsearch'
          );
        }
      }
    } finally {
      if (scrollId) {
        await this.client.clearScroll({ scroll_id: scrollId }).catch(() => {
          // Ignore errors when clearing scroll
        });
      }
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      if (!this.client) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          message: 'Elasticsearch client not connected',
        };
      }

      const startTime = Date.now();
      const response = await this.client.cluster.health();
      const responseTime = Date.now() - startTime;

      const clusterStatus = response.body.status;
      const status = clusterStatus === 'red' ? 'unhealthy' : 
                   clusterStatus === 'yellow' ? 'degraded' : 'healthy';

      return {
        status,
        lastCheck: new Date(),
        responseTime,
        message: `Elasticsearch cluster status: ${clusterStatus}`,
        metrics: {
          active_primary_shards: response.body.active_primary_shards,
          active_shards: response.body.active_shards,
          number_of_nodes: response.body.number_of_nodes,
          number_of_data_nodes: response.body.number_of_data_nodes,
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
   * Index a document in Elasticsearch
   */
  public async indexDocument(index: string, id: string, document: any): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    await this.client.index({
      index,
      id,
      body: document,
      refresh: 'wait_for',
    });
  }

  /**
   * Bulk index documents
   */
  public async bulkIndex(index: string, documents: Array<{ id: string; data: any }>): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const body = documents.flatMap(doc => [
      { index: { _index: index, _id: doc.id } },
      doc.data
    ]);

    await this.client.bulk({
      body,
      refresh: 'wait_for',
    });
  }

  /**
   * Create index with IOC mapping
   */
  public async createIndex(index: string): Promise<void> {
    if (!this.client) {
      throw new Error('Elasticsearch client not connected');
    }

    const indexExists = await this.client.indices.exists({ index });
    
    if (!indexExists.body) {
      await this.client.indices.create({
        index,
        body: {
          mappings: {
            properties: {
              type: { type: 'keyword' },
              value: { type: 'text', analyzer: 'standard' },
              source: { type: 'keyword' },
              confidence: { type: 'float' },
              threat_score: { type: 'float' },
              tags: { type: 'keyword' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' },
              analysis_data: { type: 'object' },
              attribution: { type: 'text' },
              techniques: { type: 'keyword' },
              mitre_tactics: { type: 'keyword' },
              geolocation: {
                type: 'object',
                properties: {
                  country: { type: 'keyword' },
                  city: { type: 'keyword' },
                  coordinates: { type: 'geo_point' }
                }
              }
            }
          },
          settings: {
            number_of_shards: 3,
            number_of_replicas: 1,
            refresh_interval: '5s'
          }
        }
      });
    }
  }
}