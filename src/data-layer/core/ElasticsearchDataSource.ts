/**
 * Elasticsearch Data Source for Phantom CVE Core Plugin
 * Advanced search and analytics for business SaaS readiness
 */

import { Client, ClientOptions } from '@elastic/elasticsearch';
import { logger } from '../../utils/logger.js';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';

export interface ElasticsearchConfig {
  node?: string | string[];
  nodes?: string[];
  auth?: {
    username: string;
    password: string;
  } | {
    apiKey: string;
  };
  ssl?: {
    ca?: string;
    cert?: string;
    key?: string;
    rejectUnauthorized?: boolean;
  };
  maxRetries?: number;
  requestTimeout?: number;
  pingTimeout?: number;
  indexPrefix?: string;
  defaultIndex?: string;
}

/**
 * Elasticsearch Data Source for CVE search, analytics and full-text capabilities
 */
export class ElasticsearchDataSource extends BaseDataSource {
  public readonly name = 'elasticsearch-cve-search';
  public readonly type = 'search-engine';
  public readonly capabilities = [
    'full-text-search',
    'aggregations',
    'analytics',
    'faceted-search',
    'geo-queries',
    'ml-features',
    'real-time-indexing',
    'distributed-search',
  ];

  private client: Client;
  private config: ElasticsearchConfig;
  private indexPrefix: string;
  private defaultIndex: string;

  constructor(config: ElasticsearchConfig = {}) {
    super(config);
    this.config = {
      node: 'http://localhost:9200',
      maxRetries: 3,
      requestTimeout: 30000,
      pingTimeout: 3000,
      indexPrefix: 'phantom-cve',
      defaultIndex: 'cves',
      ...config,
    };

    this.indexPrefix = this.config.indexPrefix!;
    this.defaultIndex = `${this.indexPrefix}-${this.config.defaultIndex}`;

    // Create Elasticsearch client
    const clientConfig: ClientOptions = {
      maxRetries: this.config.maxRetries,
      requestTimeout: this.config.requestTimeout,
      pingTimeout: this.config.pingTimeout,
    };

    if (this.config.node) {
      clientConfig.node = this.config.node;
    } else if (this.config.nodes) {
      clientConfig.nodes = this.config.nodes;
    }

    if (this.config.auth) {
      clientConfig.auth = this.config.auth;
    }

    if (this.config.ssl) {
      clientConfig.ssl = this.config.ssl;
    }

    this.client = new Client(clientConfig);
  }

  /**
   * Connect to Elasticsearch and initialize indices
   */
  protected async performConnect(): Promise<void> {
    try {
      // Test connection
      const pingResult = await this.client.ping();
      
      if (!pingResult) {
        throw new Error('Elasticsearch ping failed');
      }

      // Initialize indices
      await this.initializeIndices();
      
      logger.info(`Connected to Elasticsearch: ${this.config.node}`);
    } catch (error) {
      logger.error('Failed to connect to Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Disconnect from Elasticsearch
   */
  protected async performDisconnect(): Promise<void> {
    try {
      await this.client.close();
      logger.info('Disconnected from Elasticsearch');
    } catch (error) {
      logger.error('Failed to disconnect from Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Execute query against Elasticsearch
   */
  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    const startTime = Date.now();

    try {
      let data: IDataRecord[] = [];
      const metadata: any = {
        source: this.name,
        queryType: query.type,
        executionTime: 0,
      };

      switch (query.type) {
        case 'select':
          data = await this.handleSelectQuery(query, context);
          break;
        case 'search':
          data = await this.handleSearchQuery(query, context);
          break;
        case 'aggregate':
          data = await this.handleAggregateQuery(query, context);
          break;
        case 'graph':
          data = await this.handleGraphQuery(query, context);
          break;
        default:
          throw new Error(`Unsupported query type: ${query.type}`);
      }

      metadata.executionTime = Date.now() - startTime;
      metadata.resultCount = data.length;

      return {
        data,
        metadata,
        relationships: [],
      };
    } catch (error) {
      logger.error('Elasticsearch query execution failed', {
        error: (error as Error).message,
        query: JSON.stringify(query),
      });
      throw error;
    }
  }

  /**
   * Stream data from Elasticsearch using scroll API
   */
  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    const scrollSize = query.limit || 100;
    const esQuery = this.buildElasticsearchQuery(query, context);
    
    try {
      // Initialize scroll
      let response = await this.client.search({
        index: this.getIndexName(query),
        body: esQuery,
        scroll: '1m',
        size: scrollSize,
      });

      while (response.body.hits.hits.length > 0) {
        // Yield current batch
        for (const hit of response.body.hits.hits) {
          yield this.transformToDataRecord(hit, 'elasticsearch');
        }

        // Get next batch
        response = await this.client.scroll({
          scroll_id: response.body._scroll_id,
          scroll: '1m',
        });
      }

      // Clear scroll
      if (response.body._scroll_id) {
        await this.client.clearScroll({
          scroll_id: response.body._scroll_id,
        });
      }
    } catch (error) {
      logger.error('Elasticsearch streaming failed', error);
      throw error;
    }
  }

  /**
   * Perform health check
   */
  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      const [clusterHealth, nodeStats] = await Promise.all([
        this.client.cluster.health(),
        this.client.nodes.stats(),
      ]);

      const healthStatus = clusterHealth.body.status;
      const isHealthy = healthStatus === 'green' || healthStatus === 'yellow';

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0, // Will be set by base class
        details: {
          clusterStatus: healthStatus,
          numberOfNodes: clusterHealth.body.number_of_nodes,
          numberOfDataNodes: clusterHealth.body.number_of_data_nodes,
          activePrimaryShards: clusterHealth.body.active_primary_shards,
          activeShards: clusterHealth.body.active_shards,
          indices: await this.getIndexStats(),
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

  // CVE-specific Elasticsearch operations

  /**
   * Index CVE document in Elasticsearch
   */
  public async indexCVE(cve: any, refresh: boolean = false): Promise<string> {
    try {
      const indexName = this.getIndexName();
      const documentId = cve.id || cve.cveId;
      
      // Prepare document for indexing
      const document = this.prepareCVEDocument(cve);
      
      const response = await this.client.index({
        index: indexName,
        id: documentId,
        body: document,
        refresh: refresh ? 'wait_for' : false,
      });

      logger.debug(`Indexed CVE in Elasticsearch: ${documentId}`, {
        index: indexName,
        result: response.body.result,
      });

      return response.body._id;
    } catch (error) {
      logger.error('Failed to index CVE in Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Bulk index multiple CVEs
   */
  public async bulkIndexCVEs(cves: any[], refresh: boolean = false): Promise<any> {
    try {
      const indexName = this.getIndexName();
      const body = [];

      for (const cve of cves) {
        const documentId = cve.id || cve.cveId;
        const document = this.prepareCVEDocument(cve);

        body.push({
          index: {
            _index: indexName,
            _id: documentId,
          },
        });
        body.push(document);
      }

      const response = await this.client.bulk({
        body,
        refresh: refresh ? 'wait_for' : false,
      });

      const errors = response.body.items.filter((item: any) => item.index?.error);
      
      if (errors.length > 0) {
        logger.warn(`Bulk index completed with ${errors.length} errors`, { errors });
      }

      logger.info(`Bulk indexed ${cves.length} CVEs`, {
        took: response.body.took,
        errors: errors.length,
      });

      return response.body;
    } catch (error) {
      logger.error('Bulk index CVEs failed', error);
      throw error;
    }
  }

  /**
   * Search CVEs with advanced Elasticsearch features
   */
  public async searchCVEs(
    searchQuery: any,
    options: {
      from?: number;
      size?: number;
      sort?: any[];
      aggregations?: any;
      highlight?: any;
      filters?: any;
    } = {}
  ): Promise<any> {
    try {
      const indexName = this.getIndexName();
      
      const body: any = {
        query: this.buildSearchQuery(searchQuery, options.filters),
        from: options.from || 0,
        size: options.size || 10,
      };

      if (options.sort) {
        body.sort = options.sort;
      } else {
        body.sort = [{ publishedDate: { order: 'desc' } }];
      }

      if (options.aggregations) {
        body.aggs = options.aggregations;
      }

      if (options.highlight) {
        body.highlight = options.highlight;
      } else {
        body.highlight = {
          fields: {
            title: {},
            description: {},
            'affectedProducts.product': {},
          },
        };
      }

      const response = await this.client.search({
        index: indexName,
        body,
      });

      return {
        hits: response.body.hits.hits.map((hit: any) => ({
          ...hit._source,
          _score: hit._score,
          _highlight: hit.highlight,
        })),
        total: response.body.hits.total.value,
        aggregations: response.body.aggregations,
        took: response.body.took,
      };
    } catch (error) {
      logger.error('CVE search failed', error);
      throw error;
    }
  }

  /**
   * Get CVE by ID
   */
  public async getCVE(cveId: string): Promise<any | null> {
    try {
      const response = await this.client.get({
        index: this.getIndexName(),
        id: cveId,
      });

      return response.body._source;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      logger.error('Failed to get CVE from Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Delete CVE from Elasticsearch
   */
  public async deleteCVE(cveId: string): Promise<boolean> {
    try {
      const response = await this.client.delete({
        index: this.getIndexName(),
        id: cveId,
        refresh: 'wait_for',
      });

      return response.body.result === 'deleted';
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      logger.error('Failed to delete CVE from Elasticsearch', error);
      throw error;
    }
  }

  /**
   * Get CVE analytics and aggregations
   */
  public async getCVEAnalytics(): Promise<any> {
    try {
      const response = await this.client.search({
        index: this.getIndexName(),
        size: 0,
        body: {
          aggs: {
            severity_distribution: {
              terms: {
                field: 'scoring.severity.keyword',
                size: 10,
              },
            },
            cvss_score_stats: {
              stats: {
                field: 'scoring.cvssV3Score',
              },
            },
            monthly_trends: {
              date_histogram: {
                field: 'publishedDate',
                calendar_interval: 'month',
                format: 'yyyy-MM',
              },
            },
            top_vendors: {
              terms: {
                field: 'affectedProducts.vendor.keyword',
                size: 10,
              },
            },
            top_products: {
              terms: {
                field: 'affectedProducts.product.keyword',
                size: 10,
              },
            },
            exploit_status: {
              terms: {
                field: 'exploitInfo.exploitAvailable',
              },
            },
            patch_status: {
              terms: {
                field: 'patchInfo.patchAvailable',
              },
            },
          },
        },
      });

      return response.body.aggregations;
    } catch (error) {
      logger.error('Failed to get CVE analytics', error);
      throw error;
    }
  }

  /**
   * Perform advanced text search with ML features
   */
  public async advancedTextSearch(
    query: string,
    options: {
      fields?: string[];
      fuzziness?: string | number;
      minimumShouldMatch?: string;
      boost?: Record<string, number>;
    } = {}
  ): Promise<any> {
    const searchBody = {
      query: {
        multi_match: {
          query,
          fields: options.fields || [
            'title^2',
            'description',
            'affectedProducts.product^1.5',
            'affectedProducts.vendor',
            'weaknesses.description',
          ],
          type: 'best_fields',
          fuzziness: options.fuzziness || 'AUTO',
          minimum_should_match: options.minimumShouldMatch || '75%',
        },
      },
      highlight: {
        fields: {
          title: {},
          description: {},
          'affectedProducts.product': {},
        },
      },
      suggest: {
        text: query,
        cve_suggest: {
          term: {
            field: 'title',
          },
        },
      },
    };

    const response = await this.client.search({
      index: this.getIndexName(),
      body: searchBody,
    });

    return {
      hits: response.body.hits.hits,
      total: response.body.hits.total.value,
      suggestions: response.body.suggest,
    };
  }

  // Private helper methods

  private async initializeIndices(): Promise<void> {
    const indexName = this.getIndexName();
    
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      
      if (!exists.body) {
        await this.createCVEIndex(indexName);
        logger.info(`Created Elasticsearch index: ${indexName}`);
      } else {
        logger.debug(`Elasticsearch index already exists: ${indexName}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch indices', error);
      throw error;
    }
  }

  private async createCVEIndex(indexName: string): Promise<void> {
    const mapping = {
      mappings: {
        properties: {
          cveId: { type: 'keyword' },
          title: { 
            type: 'text',
            analyzer: 'standard',
            fields: { keyword: { type: 'keyword' } },
          },
          description: { 
            type: 'text',
            analyzer: 'standard',
          },
          publishedDate: { type: 'date' },
          lastModifiedDate: { type: 'date' },
          scoring: {
            properties: {
              cvssV3Score: { type: 'float' },
              cvssV2Score: { type: 'float' },
              severity: { 
                type: 'keyword',
                fields: { text: { type: 'text' } },
              },
              baseSeverity: { type: 'keyword' },
            },
          },
          affectedProducts: {
            type: 'nested',
            properties: {
              vendor: { 
                type: 'keyword',
                fields: { text: { type: 'text' } },
              },
              product: { 
                type: 'keyword',
                fields: { text: { type: 'text' } },
              },
              versions: { type: 'keyword' },
              platforms: { type: 'keyword' },
            },
          },
          references: {
            type: 'nested',
            properties: {
              url: { type: 'keyword' },
              name: { type: 'text' },
              source: { type: 'keyword' },
              type: { type: 'keyword' },
              tags: { type: 'keyword' },
            },
          },
          weaknesses: {
            type: 'nested',
            properties: {
              cweId: { type: 'keyword' },
              description: { type: 'text' },
            },
          },
          exploitInfo: {
            properties: {
              exploitAvailable: { type: 'boolean' },
              exploitInWild: { type: 'boolean' },
              exploitabilityLevel: { type: 'keyword' },
              publicExploits: { type: 'integer' },
            },
          },
          patchInfo: {
            properties: {
              patchAvailable: { type: 'boolean' },
              patchDate: { type: 'date' },
              patchComplexity: { type: 'keyword' },
            },
          },
          riskAssessment: {
            properties: {
              businessRisk: { type: 'keyword' },
              technicalRisk: { type: 'keyword' },
              riskScore: { type: 'integer' },
              financialImpact: { type: 'long' },
            },
          },
          workflow: {
            properties: {
              status: { type: 'keyword' },
              priority: { type: 'keyword' },
              assignedTo: { type: 'keyword' },
              dueDate: { type: 'date' },
            },
          },
          source: { type: 'keyword' },
          tags: { type: 'keyword' },
          metadata: { type: 'object', enabled: false },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
          analyzer: {
            cve_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'stop', 'snowball'],
            },
          },
        },
      },
    };

    await this.client.indices.create({
      index: indexName,
      body: mapping,
    });
  }

  private getIndexName(query?: IQuery): string {
    return query?.filters?.index || this.defaultIndex;
  }

  private prepareCVEDocument(cve: any): any {
    return {
      cveId: cve.cveId || cve.id,
      title: cve.title,
      description: cve.description,
      publishedDate: cve.publishedDate,
      lastModifiedDate: cve.lastModifiedDate,
      scoring: cve.scoring,
      affectedProducts: cve.affectedProducts || [],
      references: cve.references || [],
      weaknesses: cve.weaknesses || [],
      exploitInfo: cve.exploitInfo,
      patchInfo: cve.patchInfo,
      riskAssessment: cve.riskAssessment,
      workflow: cve.workflow,
      source: cve.source,
      tags: cve.tags || [],
      metadata: cve.metadata,
      createdAt: cve.createdAt || new Date().toISOString(),
      updatedAt: cve.updatedAt || new Date().toISOString(),
      indexedAt: new Date().toISOString(),
    };
  }

  private buildElasticsearchQuery(query: IQuery, context: IQueryContext): any {
    const esQuery: any = {
      query: { match_all: {} },
    };

    if (query.filters) {
      const boolQuery: any = { bool: { must: [] } };

      if (query.filters.search) {
        boolQuery.bool.must.push({
          multi_match: {
            query: query.filters.search,
            fields: ['title^2', 'description', 'affectedProducts.product'],
          },
        });
      }

      if (query.filters.severity) {
        boolQuery.bool.must.push({
          term: { 'scoring.severity.keyword': query.filters.severity },
        });
      }

      if (query.filters.exploitAvailable !== undefined) {
        boolQuery.bool.must.push({
          term: { 'exploitInfo.exploitAvailable': query.filters.exploitAvailable },
        });
      }

      if (boolQuery.bool.must.length > 0) {
        esQuery.query = boolQuery;
      }
    }

    return esQuery;
  }

  private buildSearchQuery(searchQuery: any, filters?: any): any {
    const query: any = { bool: { must: [] } };

    if (typeof searchQuery === 'string') {
      query.bool.must.push({
        multi_match: {
          query: searchQuery,
          fields: ['title^2', 'description', 'affectedProducts.product^1.5'],
          fuzziness: 'AUTO',
        },
      });
    } else if (searchQuery.query) {
      query.bool.must.push(searchQuery.query);
    }

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query.bool.must.push({ term: { [field]: value } });
        }
      });
    }

    return query.bool.must.length > 0 ? query : { match_all: {} };
  }

  private async handleSelectQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    const esQuery = this.buildElasticsearchQuery(query, context);
    
    const response = await this.client.search({
      index: this.getIndexName(query),
      body: {
        query: esQuery.query,
        size: query.limit || 10,
        from: query.offset || 0,
      },
    });

    return response.body.hits.hits.map((hit: any) => 
      this.transformToDataRecord(hit, 'elasticsearch')
    );
  }

  private async handleSearchQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    const searchResult = await this.searchCVEs(query.filters?.search || '', {
      from: query.offset,
      size: query.limit,
      filters: query.filters,
    });

    return searchResult.hits.map((hit: any) => 
      this.transformToDataRecord({ _source: hit }, 'elasticsearch')
    );
  }

  private async handleAggregateQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    const analytics = await this.getCVEAnalytics();
    return [this.transformToDataRecord({ _source: analytics }, 'elasticsearch-aggregate')];
  }

  private async handleGraphQuery(query: IQuery, context: IQueryContext): Promise<IDataRecord[]> {
    // Simple graph query implementation for shared products
    const response = await this.client.search({
      index: this.getIndexName(query),
      size: 0,
      body: {
        aggs: {
          product_relationships: {
            nested: { path: 'affectedProducts' },
            aggs: {
              products: {
                terms: {
                  field: 'affectedProducts.product.keyword',
                  size: query.limit || 100,
                },
                aggs: {
                  cves: {
                    reverse_nested: {},
                    aggs: {
                      cve_ids: {
                        terms: { field: 'cveId.keyword' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const relationships = response.body.aggregations.product_relationships.products.buckets;
    return relationships.map((bucket: any) => 
      this.transformToDataRecord({ _source: bucket }, 'elasticsearch-graph')
    );
  }

  private async getIndexStats(): Promise<any> {
    try {
      const response = await this.client.indices.stats({
        index: `${this.indexPrefix}-*`,
      });
      
      return Object.keys(response.body.indices).map(index => ({
        name: index,
        docsCount: response.body.indices[index].total.docs.count,
        storeSize: response.body.indices[index].total.store.size_in_bytes,
      }));
    } catch (error) {
      logger.warn('Failed to get index stats', error);
      return [];
    }
  }

  protected transformToDataRecord(hit: any, source: string): IDataRecord {
    const data = hit._source || hit;
    
    return {
      id: hit._id || data.cveId || data.id || this.generateId(),
      type: data.type || 'cve',
      source: this.name,
      timestamp: data.publishedDate || data.createdAt || new Date(),
      data: data,
      metadata: {
        score: hit._score,
        highlight: hit._highlight,
        index: hit._index,
        ...(data.metadata || {}),
      },
      relationships: data.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: ['elasticsearch-index'],
        quality: {
          completeness: hit._score ? hit._score / 10 : 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: 1.0,
        },
      },
    };
  }
}