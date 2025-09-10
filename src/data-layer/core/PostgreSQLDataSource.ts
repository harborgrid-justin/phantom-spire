/**
 * PostgreSQL Data Source - Enterprise-grade relational data store
 */

import { Client, Pool, PoolClient } from 'pg';
import { BaseDataSource } from './BaseDataSource.js';
import {
  IDataRecord,
  IQuery,
  IQueryContext,
  IQueryResult,
  IHealthStatus,
} from '../interfaces/IDataSource.js';
import { logger } from '../../utils/logger.js';

export class PostgreSQLDataSource extends BaseDataSource {
  public readonly name = 'PostgreSQL';
  public readonly type = 'relational';
  public readonly capabilities = [
    'select',
    'aggregate',
    'search',
    'stream',
    'transaction',
    'analytics',
  ];

  private pool?: Pool;

  constructor(
    config: { 
      host: string; 
      port: number;
      database: string;
      user: string;
      password: string;
      ssl?: boolean;
      max?: number;
    } = {
      host: 'localhost',
      port: 5432,
      database: 'phantom_spire',
      user: 'postgres',
      password: 'postgres',
      ssl: false,
      max: 20,
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    this.pool = new Pool({
      host: this.connectionConfig.host,
      port: this.connectionConfig.port,
      database: this.connectionConfig.database,
      user: this.connectionConfig.user,
      password: this.connectionConfig.password,
      ssl: this.connectionConfig.ssl,
      max: this.connectionConfig.max || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await this.pool.connect();
    await client.query('SELECT NOW()');
    client.release();
  }

  protected async performDisconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }

  protected async performQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not connected');
    }

    const client = await this.pool.connect();
    
    try {
      switch (query.type) {
        case 'select':
          return await this.handleSelectQuery(query, client);
        case 'aggregate':
          return await this.handleAggregateQuery(query, client);
        case 'search':
          return await this.handleSearchQuery(query, client);
        default:
          throw new Error(`Query type ${query.type} not supported by PostgreSQL data source`);
      }
    } finally {
      client.release();
    }
  }

  private async handleSelectQuery(query: IQuery, client: PoolClient): Promise<IQueryResult> {
    let sql = `SELECT * FROM ${this.escapeIdentifier(query.entity || 'iocs')}`;
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (query.filters && Object.keys(query.filters).length > 0) {
      const conditions: string[] = [];
      for (const [field, value] of Object.entries(query.filters)) {
        conditions.push(`${this.escapeIdentifier(field)} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add ORDER BY
    if (query.sort) {
      const sortClauses: string[] = [];
      for (const [field, direction] of Object.entries(query.sort)) {
        const dir = direction === 1 ? 'ASC' : 'DESC';
        sortClauses.push(`${this.escapeIdentifier(field)} ${dir}`);
      }
      sql += ` ORDER BY ${sortClauses.join(', ')}`;
    }

    // Add LIMIT and OFFSET
    if (query.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(query.limit);
      paramIndex++;
    }

    if (query.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(query.offset);
    }

    const result = await client.query(sql, params);
    
    const data = result.rows.map(row => 
      this.transformToDataRecord(row, 'PostgreSQL')
    );

    return {
      data,
      metadata: {
        total: result.rows.length,
        hasMore: query.limit ? result.rows.length === query.limit : false,
        executionTime: 0,
        source: this.name,
      },
    };
  }

  private async handleAggregateQuery(query: IQuery, client: PoolClient): Promise<IQueryResult> {
    // Basic aggregation support - can be extended
    let sql = `SELECT COUNT(*) as count FROM ${this.escapeIdentifier(query.entity || 'iocs')}`;
    const params: any[] = [];
    let paramIndex = 1;

    if (query.filters && Object.keys(query.filters).length > 0) {
      const conditions: string[] = [];
      for (const [field, value] of Object.entries(query.filters)) {
        conditions.push(`${this.escapeIdentifier(field)} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await client.query(sql, params);
    
    const data = result.rows.map(row => 
      this.transformToDataRecord(row, 'PostgreSQL')
    );

    return {
      data,
      metadata: {
        total: result.rows.length,
        hasMore: false,
        executionTime: 0,
        source: this.name,
      },
      aggregations: result.rows[0] || {},
    };
  }

  private async handleSearchQuery(query: IQuery, client: PoolClient): Promise<IQueryResult> {
    if (!query.searchTerm) {
      throw new Error('Search term is required for search queries');
    }

    const searchFields = query.searchFields || ['data'];
    const searchConditions = searchFields.map((field, index) => 
      `${this.escapeIdentifier(field)}::text ILIKE $${index + 1}`
    );

    const sql = `
      SELECT * FROM ${this.escapeIdentifier(query.entity || 'iocs')}
      WHERE ${searchConditions.join(' OR ')}
      ${query.limit ? `LIMIT ${query.limit}` : ''}
      ${query.offset ? `OFFSET ${query.offset}` : ''}
    `;

    const params = searchFields.map(() => `%${query.searchTerm}%`);
    const result = await client.query(sql, params);
    
    const data = result.rows.map(row => 
      this.transformToDataRecord(row, 'PostgreSQL')
    );

    return {
      data,
      metadata: {
        total: result.rows.length,
        hasMore: query.limit ? result.rows.length === query.limit : false,
        executionTime: 0,
        source: this.name,
      },
    };
  }

  protected async *performStream(
    query: IQuery,
    context: IQueryContext
  ): AsyncIterable<IDataRecord> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not connected');
    }

    const client = await this.pool.connect();
    
    try {
      // Use cursor for streaming large datasets
      const result = await this.performQuery(query, context);
      for (const record of result.data) {
        yield record;
      }
    } finally {
      client.release();
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    try {
      if (!this.pool) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: 0,
          message: 'PostgreSQL pool not connected',
        };
      }

      const startTime = Date.now();
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        lastCheck: new Date(),
        responseTime,
        message: 'PostgreSQL connection successful',
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
   * Execute raw SQL query
   */
  public async executeQuery(sql: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Create tables for IOC storage
   */
  public async createTables(): Promise<void> {
    const createIOCsTable = `
      CREATE TABLE IF NOT EXISTS iocs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        source VARCHAR(100),
        confidence DECIMAL(3,2),
        threat_score DECIMAL(3,2),
        tags TEXT[],
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_iocs_type ON iocs(type);
      CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs(value);
      CREATE INDEX IF NOT EXISTS idx_iocs_source ON iocs(source);
      CREATE INDEX IF NOT EXISTS idx_iocs_created_at ON iocs(created_at);
      CREATE INDEX IF NOT EXISTS idx_iocs_data_gin ON iocs USING GIN(data);
    `;

    const createThreatIntelTable = `
      CREATE TABLE IF NOT EXISTS threat_intelligence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ioc_id UUID REFERENCES iocs(id),
        intel_type VARCHAR(50),
        attribution TEXT,
        techniques TEXT[],
        mitre_tactics TEXT[],
        analysis_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_threat_intel_ioc_id ON threat_intelligence(ioc_id);
      CREATE INDEX IF NOT EXISTS idx_threat_intel_type ON threat_intelligence(intel_type);
    `;

    await this.executeQuery(createIOCsTable);
    await this.executeQuery(createThreatIntelTable);
  }

  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}