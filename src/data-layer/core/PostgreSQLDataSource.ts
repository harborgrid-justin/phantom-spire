/**
 * PostgreSQL Data Source for Phantom CVE Core Plugin
 * ACID-compliant relational storage for business SaaS readiness
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../../utils/logger.js';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';

export interface PostgreSQLConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean | object;
  max?: number; // Maximum number of clients in the pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  schema?: string;
}

/**
 * PostgreSQL Data Source for CVE relational data and complex queries
 */
export class PostgreSQLDataSource extends BaseDataSource {
  public readonly name = 'postgresql-cve-db';
  public readonly type = 'relational';
  public readonly capabilities = [
    'sql',
    'transactions',
    'joins',
    'aggregations',
    'full-text-search',
    'json-queries',
    'constraints',
    'indexing',
  ];

  private pool: Pool;
  private config: PostgreSQLConfig;
  private schema: string;

  constructor(config: PostgreSQLConfig = {}) {
    super(config);
    this.config = {
      host: 'localhost',
      port: 5432,
      database: 'phantom_spire',
      user: 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      schema: 'cve_data',
      ...config,
    };

    this.schema = this.config.schema!;

    // Create connection pool
    const poolConfig: any = {};
    
    if (this.config.connectionString) {
      poolConfig.connectionString = this.config.connectionString;
    } else {
      poolConfig.host = this.config.host;
      poolConfig.port = this.config.port;
      poolConfig.database = this.config.database;
      poolConfig.user = this.config.user;
      poolConfig.password = this.config.password;
    }

    poolConfig.max = this.config.max;
    poolConfig.idleTimeoutMillis = this.config.idleTimeoutMillis;
    poolConfig.connectionTimeoutMillis = this.config.connectionTimeoutMillis;

    if (this.config.ssl) {
      poolConfig.ssl = this.config.ssl;
    }

    this.pool = new Pool(poolConfig);

    // Setup error handling
    this.pool.on('error', (error) => {
      logger.error('PostgreSQL pool error', { error: error.message });
    });

    this.pool.on('connect', (client) => {
      logger.debug('PostgreSQL client connected to pool');
    });

    this.pool.on('remove', (client) => {
      logger.debug('PostgreSQL client removed from pool');
    });
  }

  /**
   * Connect to PostgreSQL and initialize schema
   */
  protected async performConnect(): Promise<void> {
    try {
      // Test connection
      const client = await this.pool.connect();
      
      try {
        // Create schema if it doesn't exist
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.schema}`);
        
        // Initialize CVE tables
        await this.initializeTables(client);
        
        logger.info(`Connected to PostgreSQL: ${this.config.host}:${this.config.port}/${this.config.database}`);
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL', error);
      throw error;
    }
  }

  /**
   * Disconnect from PostgreSQL
   */
  protected async performDisconnect(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Disconnected from PostgreSQL');
    } catch (error) {
      logger.error('Failed to disconnect from PostgreSQL', error);
      throw error;
    }
  }

  /**
   * Execute query against PostgreSQL
   */
  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    const startTime = Date.now();
    const client = await this.pool.connect();

    try {
      let data: IDataRecord[] = [];
      const metadata: any = {
        source: this.name,
        queryType: query.type,
        executionTime: 0,
      };

      switch (query.type) {
        case 'select':
          data = await this.handleSelectQuery(query, context, client);
          break;
        case 'search':
          data = await this.handleSearchQuery(query, context, client);
          break;
        case 'aggregate':
          data = await this.handleAggregateQuery(query, context, client);
          break;
        case 'graph':
          data = await this.handleGraphQuery(query, context, client);
          break;
        default:
          throw new Error(`Unsupported query type: ${query.type}`);
      }

      metadata.executionTime = Date.now() - startTime;
      metadata.resultCount = data.length;

      return {
        data,
        metadata,
        relationships: await this.findRelationships(data, client),
      };
    } catch (error) {
      logger.error('PostgreSQL query execution failed', {
        error: (error as Error).message,
        query: JSON.stringify(query),
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Stream data from PostgreSQL
   */
  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    const client = await this.pool.connect();

    try {
      const { sqlQuery, params } = this.buildSQLQuery(query, context);
      
      // Use cursor for streaming large result sets
      const cursorName = `cve_cursor_${Date.now()}`;
      await client.query('BEGIN');
      await client.query(`DECLARE ${cursorName} CURSOR FOR ${sqlQuery}`, params);

      let hasMore = true;
      const batchSize = query.limit || 100;

      while (hasMore) {
        const result = await client.query(`FETCH ${batchSize} FROM ${cursorName}`);
        
        if (result.rows.length === 0) {
          hasMore = false;
        } else {
          for (const row of result.rows) {
            yield this.transformToDataRecord(row, 'postgresql');
          }
        }
      }

      await client.query(`CLOSE ${cursorName}`);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      logger.error('PostgreSQL streaming failed', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Perform health check
   */
  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT NOW(), version()');
        const stats = await this.getConnectionStats();
        
        return {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: 0, // Will be set by base class
          details: {
            serverTime: result.rows[0].now,
            version: result.rows[0].version,
            ...stats,
          },
        };
      } finally {
        client.release();
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: (error as Error).message,
      };
    }
  }

  // CVE-specific PostgreSQL operations

  /**
   * Store CVE data in PostgreSQL
   */
  public async storeCVE(cve: any): Promise<string> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Insert main CVE record
      const cveResult = await client.query(
        `INSERT INTO ${this.schema}.cves (
          cve_id, title, description, published_date, last_modified_date,
          cvss_v3_score, cvss_v2_score, severity, base_severity,
          exploit_available, exploit_in_wild, patch_available,
          business_risk, technical_risk, risk_score,
          workflow_status, priority, assigned_to,
          source, tags, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW()
        ) 
        ON CONFLICT (cve_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          last_modified_date = EXCLUDED.last_modified_date,
          cvss_v3_score = EXCLUDED.cvss_v3_score,
          cvss_v2_score = EXCLUDED.cvss_v2_score,
          severity = EXCLUDED.severity,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING id`,
        [
          cve.cveId || cve.id,
          cve.title,
          cve.description,
          cve.publishedDate,
          cve.lastModifiedDate,
          cve.scoring?.cvssV3Score,
          cve.scoring?.cvssV2Score,
          cve.scoring?.severity,
          cve.scoring?.baseSeverity,
          cve.exploitInfo?.exploitAvailable || false,
          cve.exploitInfo?.exploitInWild || false,
          cve.patchInfo?.patchAvailable || false,
          cve.riskAssessment?.businessRisk,
          cve.riskAssessment?.technicalRisk,
          cve.riskAssessment?.riskScore,
          cve.workflow?.status,
          cve.workflow?.priority,
          cve.workflow?.assignedTo,
          cve.source,
          JSON.stringify(cve.tags || []),
          JSON.stringify(cve),
        ]
      );

      const cveDbId = cveResult.rows[0].id;

      // Insert affected products
      if (cve.affectedProducts && Array.isArray(cve.affectedProducts)) {
        await this.insertAffectedProducts(client, cveDbId, cve.affectedProducts);
      }

      // Insert references
      if (cve.references && Array.isArray(cve.references)) {
        await this.insertReferences(client, cveDbId, cve.references);
      }

      // Insert weaknesses (CWEs)
      if (cve.weaknesses && Array.isArray(cve.weaknesses)) {
        await this.insertWeaknesses(client, cveDbId, cve.weaknesses);
      }

      await client.query('COMMIT');
      
      logger.debug(`Stored CVE in PostgreSQL: ${cve.cveId || cve.id}`);
      return cveDbId;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to store CVE in PostgreSQL', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve CVE by ID
   */
  public async getCVE(cveId: string): Promise<any | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `SELECT * FROM ${this.schema}.cves WHERE cve_id = $1`,
        [cveId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const cve = result.rows[0];
      
      // Enrich with related data
      const [products, references, weaknesses] = await Promise.all([
        this.getAffectedProducts(client, cve.id),
        this.getReferences(client, cve.id),
        this.getWeaknesses(client, cve.id),
      ]);

      return this.buildCVEObject(cve, products, references, weaknesses);
    } finally {
      client.release();
    }
  }

  /**
   * Search CVEs with complex criteria
   */
  public async searchCVEs(criteria: any, pagination: any = {}): Promise<{ cves: any[], total: number }> {
    const client = await this.pool.connect();

    try {
      const { sqlQuery, countQuery, params } = this.buildSearchQuery(criteria, pagination);
      
      const [dataResult, countResult] = await Promise.all([
        client.query(sqlQuery, params),
        client.query(countQuery, params.slice(0, -2)), // Remove LIMIT and OFFSET params for count
      ]);

      const cves = await Promise.all(
        dataResult.rows.map(async (row) => {
          const [products, references, weaknesses] = await Promise.all([
            this.getAffectedProducts(client, row.id),
            this.getReferences(client, row.id),
            this.getWeaknesses(client, row.id),
          ]);
          return this.buildCVEObject(row, products, references, weaknesses);
        })
      );

      return {
        cves,
        total: parseInt(countResult.rows[0].count),
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get CVE statistics from PostgreSQL
   */
  public async getCVEStatistics(): Promise<any> {
    const client = await this.pool.connect();

    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high,
          COUNT(*) FILTER (WHERE severity = 'medium') as medium,
          COUNT(*) FILTER (WHERE severity = 'low') as low,
          COUNT(*) FILTER (WHERE exploit_available = true) as with_exploits,
          COUNT(*) FILTER (WHERE patch_available = true) as with_patches,
          COUNT(*) FILTER (WHERE workflow_status = 'new') as new_cves,
          COUNT(*) FILTER (WHERE workflow_status = 'closed') as closed_cves,
          AVG(cvss_v3_score) as avg_cvss_v3,
          AVG(risk_score) as avg_risk_score
        FROM ${this.schema}.cves
      `;

      const result = await client.query(statsQuery);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Execute complex analytics queries
   */
  public async executeAnalyticsQuery(query: string, params: any[] = []): Promise<any[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Private helper methods

  private async initializeTables(client: PoolClient): Promise<void> {
    // Create CVEs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.cves (
        id SERIAL PRIMARY KEY,
        cve_id VARCHAR(20) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        published_date TIMESTAMP,
        last_modified_date TIMESTAMP,
        cvss_v3_score DECIMAL(3,1),
        cvss_v2_score DECIMAL(3,1),
        severity VARCHAR(20),
        base_severity VARCHAR(20),
        exploit_available BOOLEAN DEFAULT FALSE,
        exploit_in_wild BOOLEAN DEFAULT FALSE,
        patch_available BOOLEAN DEFAULT FALSE,
        business_risk VARCHAR(20),
        technical_risk VARCHAR(20),
        risk_score INTEGER,
        workflow_status VARCHAR(50),
        priority VARCHAR(10),
        assigned_to VARCHAR(255),
        source VARCHAR(100),
        tags JSONB,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create affected products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.affected_products (
        id SERIAL PRIMARY KEY,
        cve_id INTEGER REFERENCES ${this.schema}.cves(id) ON DELETE CASCADE,
        vendor VARCHAR(255),
        product VARCHAR(255),
        versions JSONB,
        platforms JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create references table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.references (
        id SERIAL PRIMARY KEY,
        cve_id INTEGER REFERENCES ${this.schema}.cves(id) ON DELETE CASCADE,
        url TEXT,
        name VARCHAR(255),
        source VARCHAR(100),
        type VARCHAR(50),
        tags JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create weaknesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.weaknesses (
        id SERIAL PRIMARY KEY,
        cve_id INTEGER REFERENCES ${this.schema}.cves(id) ON DELETE CASCADE,
        cwe_id VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await this.createIndexes(client);
  }

  private async createIndexes(client: PoolClient): Promise<void> {
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_cves_cve_id ON ${this.schema}.cves(cve_id)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_severity ON ${this.schema}.cves(severity)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_status ON ${this.schema}.cves(workflow_status)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_published ON ${this.schema}.cves(published_date)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_cvss_v3 ON ${this.schema}.cves(cvss_v3_score)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_risk_score ON ${this.schema}.cves(risk_score)`,
      `CREATE INDEX IF NOT EXISTS idx_cves_tags ON ${this.schema}.cves USING GIN(tags)`,
      `CREATE INDEX IF NOT EXISTS idx_affected_products_vendor ON ${this.schema}.affected_products(vendor)`,
      `CREATE INDEX IF NOT EXISTS idx_affected_products_product ON ${this.schema}.affected_products(product)`,
      `CREATE INDEX IF NOT EXISTS idx_references_type ON ${this.schema}.references(type)`,
      `CREATE INDEX IF NOT EXISTS idx_weaknesses_cwe ON ${this.schema}.weaknesses(cwe_id)`,
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        logger.warn(`Failed to create index: ${indexQuery}`, error);
      }
    }
  }

  private async handleSelectQuery(
    query: IQuery,
    context: IQueryContext,
    client: PoolClient
  ): Promise<IDataRecord[]> {
    const { sqlQuery, params } = this.buildSQLQuery(query, context);
    const result = await client.query(sqlQuery, params);
    
    return result.rows.map(row => this.transformToDataRecord(row, 'postgresql'));
  }

  private async handleSearchQuery(
    query: IQuery,
    context: IQueryContext,
    client: PoolClient
  ): Promise<IDataRecord[]> {
    const { sqlQuery, params } = this.buildSearchQuery(query.filters || {}, { 
      limit: query.limit, 
      offset: query.offset 
    });
    
    const result = await client.query(sqlQuery, params);
    return result.rows.map(row => this.transformToDataRecord(row, 'postgresql'));
  }

  private async handleAggregateQuery(
    query: IQuery,
    context: IQueryContext,
    client: PoolClient
  ): Promise<IDataRecord[]> {
    // Handle different aggregation types
    const aggregationType = query.filters?.aggregationType || 'count';
    let sqlQuery: string;
    let params: any[] = [];

    switch (aggregationType) {
      case 'severity_distribution':
        sqlQuery = `
          SELECT severity, COUNT(*) as count 
          FROM ${this.schema}.cves 
          GROUP BY severity 
          ORDER BY 
            CASE severity 
              WHEN 'critical' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 
            END
        `;
        break;
      
      case 'monthly_trends':
        sqlQuery = `
          SELECT 
            DATE_TRUNC('month', published_date) as month,
            COUNT(*) as count,
            AVG(cvss_v3_score) as avg_cvss
          FROM ${this.schema}.cves 
          WHERE published_date >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', published_date)
          ORDER BY month
        `;
        break;
      
      default:
        sqlQuery = `SELECT COUNT(*) as total FROM ${this.schema}.cves`;
    }

    const result = await client.query(sqlQuery, params);
    return result.rows.map(row => this.transformToDataRecord(row, 'postgresql-aggregate'));
  }

  private async handleGraphQuery(
    query: IQuery,
    context: IQueryContext,
    client: PoolClient
  ): Promise<IDataRecord[]> {
    // Simple graph query for CVE relationships
    const graphQuery = `
      WITH cve_relationships AS (
        SELECT 
          c1.cve_id as source_cve,
          c2.cve_id as target_cve,
          'shared_product' as relationship_type
        FROM ${this.schema}.cves c1
        JOIN ${this.schema}.affected_products ap1 ON c1.id = ap1.cve_id
        JOIN ${this.schema}.affected_products ap2 ON ap1.vendor = ap2.vendor AND ap1.product = ap2.product
        JOIN ${this.schema}.cves c2 ON ap2.cve_id = c2.id
        WHERE c1.id != c2.id
        LIMIT ${query.limit || 100}
      )
      SELECT * FROM cve_relationships
    `;

    const result = await client.query(graphQuery);
    return result.rows.map(row => this.transformToDataRecord(row, 'postgresql-graph'));
  }

  private buildSQLQuery(query: IQuery, context: IQueryContext): { sqlQuery: string; params: any[] } {
    let sqlQuery = `SELECT * FROM ${this.schema}.cves`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramCount = 0;

    // Build WHERE clause
    if (query.filters) {
      if (query.filters.id) {
        conditions.push(`cve_id = $${++paramCount}`);
        params.push(query.filters.id);
      }
      
      if (query.filters.severity) {
        conditions.push(`severity = $${++paramCount}`);
        params.push(query.filters.severity);
      }
      
      if (query.filters.status) {
        conditions.push(`workflow_status = $${++paramCount}`);
        params.push(query.filters.status);
      }
    }

    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add ORDER BY
    if (query.sort) {
      sqlQuery += ` ORDER BY ${query.sort.field} ${query.sort.order || 'ASC'}`;
    } else {
      sqlQuery += ` ORDER BY published_date DESC`;
    }

    // Add LIMIT and OFFSET
    if (query.limit) {
      sqlQuery += ` LIMIT $${++paramCount}`;
      params.push(query.limit);
    }
    
    if (query.offset) {
      sqlQuery += ` OFFSET $${++paramCount}`;
      params.push(query.offset);
    }

    return { sqlQuery, params };
  }

  private buildSearchQuery(criteria: any, pagination: any): { sqlQuery: string; countQuery: string; params: any[] } {
    let sqlQuery = `SELECT * FROM ${this.schema}.cves`;
    let countQuery = `SELECT COUNT(*) as count FROM ${this.schema}.cves`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramCount = 0;

    // Build conditions based on criteria
    if (criteria.severity) {
      if (Array.isArray(criteria.severity)) {
        conditions.push(`severity = ANY($${++paramCount})`);
        params.push(criteria.severity);
      } else {
        conditions.push(`severity = $${++paramCount}`);
        params.push(criteria.severity);
      }
    }

    if (criteria.cvssScore) {
      if (criteria.cvssScore.min) {
        conditions.push(`cvss_v3_score >= $${++paramCount}`);
        params.push(criteria.cvssScore.min);
      }
      if (criteria.cvssScore.max) {
        conditions.push(`cvss_v3_score <= $${++paramCount}`);
        params.push(criteria.cvssScore.max);
      }
    }

    if (criteria.exploitAvailable !== undefined) {
      conditions.push(`exploit_available = $${++paramCount}`);
      params.push(criteria.exploitAvailable);
    }

    if (criteria.patchAvailable !== undefined) {
      conditions.push(`patch_available = $${++paramCount}`);
      params.push(criteria.patchAvailable);
    }

    if (criteria.searchText) {
      conditions.push(`(title ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`);
      params.push(`%${criteria.searchText}%`);
      params.push(`%${criteria.searchText}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      sqlQuery += whereClause;
      countQuery += whereClause;
    }

    // Add ordering
    sqlQuery += ` ORDER BY published_date DESC`;

    // Add pagination
    if (pagination.limit) {
      sqlQuery += ` LIMIT $${++paramCount}`;
      params.push(pagination.limit);
    }
    
    if (pagination.offset) {
      sqlQuery += ` OFFSET $${++paramCount}`;
      params.push(pagination.offset);
    }

    return { sqlQuery, countQuery, params };
  }

  private async insertAffectedProducts(client: PoolClient, cveId: number, products: any[]): Promise<void> {
    for (const product of products) {
      await client.query(
        `INSERT INTO ${this.schema}.affected_products (cve_id, vendor, product, versions, platforms) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          cveId,
          product.vendor,
          product.product,
          JSON.stringify(product.versions || []),
          JSON.stringify(product.platforms || []),
        ]
      );
    }
  }

  private async insertReferences(client: PoolClient, cveId: number, references: any[]): Promise<void> {
    for (const ref of references) {
      await client.query(
        `INSERT INTO ${this.schema}.references (cve_id, url, name, source, type, tags) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          cveId,
          ref.url,
          ref.name,
          ref.source,
          ref.type,
          JSON.stringify(ref.tags || []),
        ]
      );
    }
  }

  private async insertWeaknesses(client: PoolClient, cveId: number, weaknesses: any[]): Promise<void> {
    for (const weakness of weaknesses) {
      await client.query(
        `INSERT INTO ${this.schema}.weaknesses (cve_id, cwe_id, description) 
         VALUES ($1, $2, $3)`,
        [cveId, weakness.cweId, weakness.description]
      );
    }
  }

  private async getAffectedProducts(client: PoolClient, cveId: number): Promise<any[]> {
    const result = await client.query(
      `SELECT * FROM ${this.schema}.affected_products WHERE cve_id = $1`,
      [cveId]
    );
    
    return result.rows.map(row => ({
      vendor: row.vendor,
      product: row.product,
      versions: row.versions,
      platforms: row.platforms,
    }));
  }

  private async getReferences(client: PoolClient, cveId: number): Promise<any[]> {
    const result = await client.query(
      `SELECT * FROM ${this.schema}.references WHERE cve_id = $1`,
      [cveId]
    );
    
    return result.rows.map(row => ({
      url: row.url,
      name: row.name,
      source: row.source,
      type: row.type,
      tags: row.tags,
    }));
  }

  private async getWeaknesses(client: PoolClient, cveId: number): Promise<any[]> {
    const result = await client.query(
      `SELECT * FROM ${this.schema}.weaknesses WHERE cve_id = $1`,
      [cveId]
    );
    
    return result.rows.map(row => ({
      cweId: row.cwe_id,
      description: row.description,
    }));
  }

  private buildCVEObject(cve: any, products: any[], references: any[], weaknesses: any[]): any {
    return {
      id: cve.id,
      cveId: cve.cve_id,
      title: cve.title,
      description: cve.description,
      publishedDate: cve.published_date,
      lastModifiedDate: cve.last_modified_date,
      scoring: {
        cvssV3Score: cve.cvss_v3_score,
        cvssV2Score: cve.cvss_v2_score,
        severity: cve.severity,
        baseSeverity: cve.base_severity,
      },
      exploitInfo: {
        exploitAvailable: cve.exploit_available,
        exploitInWild: cve.exploit_in_wild,
      },
      patchInfo: {
        patchAvailable: cve.patch_available,
      },
      riskAssessment: {
        businessRisk: cve.business_risk,
        technicalRisk: cve.technical_risk,
        riskScore: cve.risk_score,
      },
      workflow: {
        status: cve.workflow_status,
        priority: cve.priority,
        assignedTo: cve.assigned_to,
      },
      source: cve.source,
      tags: cve.tags,
      affectedProducts: products,
      references: references,
      weaknesses: weaknesses,
      metadata: cve.metadata,
      createdAt: cve.created_at,
      updatedAt: cve.updated_at,
    };
  }

  private async findRelationships(data: IDataRecord[], client: PoolClient): Promise<any[]> {
    // Simple relationship discovery based on shared products
    const relationships: any[] = [];
    
    if (data.length > 1) {
      for (let i = 0; i < data.length - 1; i++) {
        for (let j = i + 1; j < data.length; j++) {
          const cve1 = data[i];
          const cve2 = data[j];
          
          // Check for shared products
          const sharedProducts = await client.query(`
            SELECT DISTINCT ap1.vendor, ap1.product
            FROM ${this.schema}.affected_products ap1
            JOIN ${this.schema}.affected_products ap2 ON ap1.vendor = ap2.vendor AND ap1.product = ap2.product
            JOIN ${this.schema}.cves c1 ON ap1.cve_id = c1.id
            JOIN ${this.schema}.cves c2 ON ap2.cve_id = c2.id
            WHERE c1.cve_id = $1 AND c2.cve_id = $2
          `, [cve1.id, cve2.id]);
          
          if (sharedProducts.rows.length > 0) {
            relationships.push({
              source: cve1.id,
              target: cve2.id,
              type: 'shared_product',
              strength: 0.7,
              metadata: {
                sharedProducts: sharedProducts.rows,
              },
            });
          }
        }
      }
    }
    
    return relationships;
  }

  private async getConnectionStats(): Promise<any> {
    try {
      const totalConnections = this.pool.totalCount;
      const idleConnections = this.pool.idleCount;
      const waitingClients = this.pool.waitingCount;

      return {
        totalConnections,
        idleConnections,
        waitingClients,
        activeConnections: totalConnections - idleConnections,
      };
    } catch (error) {
      logger.warn('Failed to get connection stats', error);
      return {};
    }
  }

  protected transformToDataRecord(rawData: any, source: string): IDataRecord {
    return {
      id: rawData.cve_id || rawData.id || this.generateId(),
      type: rawData.type || 'cve',
      source: this.name,
      timestamp: rawData.published_date || rawData.created_at || new Date(),
      data: rawData,
      metadata: {
        table: 'cves',
        schema: this.schema,
        ...(rawData.metadata || {}),
      },
      relationships: rawData.relationships || [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: ['postgresql-query'],
        quality: {
          completeness: 1.0,
          accuracy: 1.0,
          consistency: 1.0,
          timeliness: 1.0,
        },
      },
    };
  }
}