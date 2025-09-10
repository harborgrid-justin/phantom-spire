/**
 * PostgreSQL Data Source - Relational database support for structured data
 */

import { Pool, Client } from 'pg';
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

export class PostgreSQLDataSource extends BaseDataSource {
  public readonly name = 'PostgreSQL';
  public readonly type = 'relational';
  public readonly capabilities = [
    'select',
    'aggregate',
    'search',
    'stream',
  ];

  private pool?: Pool;

  constructor(
    config: { 
      connectionString: string;
      ssl?: boolean;
      max?: number;
      idleTimeoutMillis?: number;
      connectionTimeoutMillis?: number;
    } = {
      connectionString: 'postgresql://postgres:phantom_secure_pass@localhost:5432/phantom_spire',
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  ) {
    super(config);
  }

  protected async performConnect(): Promise<void> {
    this.pool = new Pool({
      connectionString: this.connectionConfig.connectionString,
      ssl: this.connectionConfig.ssl,
      max: this.connectionConfig.max || 20,
      idleTimeoutMillis: this.connectionConfig.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: this.connectionConfig.connectionTimeoutMillis || 5000,
    });

    // Test connection
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();

    // Setup error handling
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err);
    });
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
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const { sql, params } = this.buildSelectSQL(query, context);
      const result = await client.query(sql, params);
      
      for (const row of result.rows) {
        yield this.transformRowToDataRecord(row, this.name);
      }
    } finally {
      client.release();
    }
  }

  protected async performHealthCheck(): Promise<IHealthStatus> {
    if (!this.pool) {
      return {
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: 0,
        message: 'Not connected to database',
      };
    }

    try {
      const startTime = Date.now();
      const client = await this.pool.connect();
      
      try {
        // Test basic connectivity and get database stats
        const [pingResult, statsResult] = await Promise.all([
          client.query('SELECT 1'),
          client.query(`
            SELECT 
              (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
              (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
              (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
          `)
        ]);

        const responseTime = Date.now() - startTime;
        const stats = statsResult.rows[0];

        return {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime,
          metrics: {
            tableCount: parseInt(stats.table_count),
            maxConnections: parseInt(stats.max_connections),
            activeConnections: parseInt(stats.active_connections),
            poolTotalCount: this.pool.totalCount,
            poolIdleCount: this.pool.idleCount,
            poolWaitingCount: this.pool.waitingCount,
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

  /**
   * Execute a select query
   */
  private async executeSelectQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const { sql, params } = this.buildSelectSQL(query, context);
      const countSql = this.buildCountSQL(query, context);

      const [result, countResult] = await Promise.all([
        client.query(sql, params),
        client.query(countSql.sql, countSql.params)
      ]);

      const data = result.rows.map(row =>
        this.transformRowToDataRecord(row, this.name)
      );

      const total = parseInt(countResult.rows[0].count);

      return {
        data,
        metadata: {
          total,
          hasMore: (query.offset || 0) + (query.limit || result.rows.length) < total,
          executionTime: 0, // Will be set by base class
          source: this.name,
        },
      };
    } finally {
      client.release();
    }
  }

  /**
   * Execute an aggregation query
   */
  private async executeAggregateQuery(
    query: IQuery,
    context: IQueryContext
  ): Promise<IQueryResult> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const { sql, params } = this.buildAggregateSQL(query, context);
      const result = await client.query(sql, params);

      return {
        data: result.rows.map(row =>
          this.transformRowToDataRecord(row, this.name)
        ),
        metadata: {
          total: result.rows.length,
          hasMore: false,
          executionTime: 0,
          source: this.name,
        },
        aggregations: result.rows.reduce((acc, row) => {
          if (row.group_key) {
            acc[row.group_key] = row;
          }
          return acc;
        }, {} as Record<string, any>),
      };
    } finally {
      client.release();
    }
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

    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const tableName = query.entity || 'incident_data';
      const searchFields = query.searchFields || ['title', 'description', 'content'];
      
      // Build full-text search query using PostgreSQL's text search
      const searchConditions = searchFields.map((field, index) => 
        `${field} ILIKE $${index + 2}`
      ).join(' OR ');

      const searchParams = [`%${query.searchTerm}%`];
      searchFields.forEach(() => searchParams.push(`%${query.searchTerm}%`));

      let sql = `
        SELECT *, 
               ts_rank(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')), 
                      plainto_tsquery('english', $1)) as relevance_score
        FROM ${tableName}
        WHERE ${searchConditions}
      `;

      // Apply additional filters
      let paramIndex = searchParams.length + 1;
      if (query.filters) {
        const filterConditions: string[] = [];
        Object.entries(query.filters).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle complex filters (e.g., date ranges)
            if (value.$gte && value.$lte) {
              filterConditions.push(`${key} BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
              searchParams.push(value.$gte, value.$lte);
              paramIndex += 2;
            }
          } else {
            filterConditions.push(`${key} = $${paramIndex}`);
            searchParams.push(value);
            paramIndex++;
          }
        });

        if (filterConditions.length > 0) {
          sql += ` AND ${filterConditions.join(' AND ')}`;
        }
      }

      sql += ` ORDER BY relevance_score DESC`;

      if (query.limit) {
        sql += ` LIMIT ${query.limit}`;
      }

      if (query.offset) {
        sql += ` OFFSET ${query.offset}`;
      }

      const result = await client.query(sql, searchParams);
      const data = result.rows.map(row =>
        this.transformRowToDataRecord(row, this.name)
      );

      // Get total count for search
      const countSql = `
        SELECT COUNT(*) as count
        FROM ${tableName}
        WHERE ${searchConditions}
      `;
      const countResult = await client.query(countSql, searchParams.slice(1, searchFields.length + 1));
      const total = parseInt(countResult.rows[0].count);

      return {
        data,
        metadata: {
          total,
          hasMore: (query.offset || 0) + result.rows.length < total,
          executionTime: 0,
          source: this.name,
        },
      };
    } finally {
      client.release();
    }
  }

  /**
   * Build SELECT SQL query
   */
  private buildSelectSQL(query: IQuery, context: IQueryContext): { sql: string; params: any[] } {
    const tableName = query.entity || 'incident_data';
    const params: any[] = [];
    let paramIndex = 1;

    // Build SELECT clause
    let selectClause = '*';
    if (query.projection && query.projection.length > 0) {
      selectClause = query.projection.join(', ');
    }

    let sql = `SELECT ${selectClause} FROM ${tableName}`;

    // Build WHERE clause
    const whereConditions: string[] = [];
    
    // Apply query filters
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.$gte && value.$lte) {
            whereConditions.push(`${key} BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            params.push(value.$gte, value.$lte);
            paramIndex += 2;
          } else if (value.$in) {
            const placeholders = value.$in.map(() => `$${paramIndex++}`).join(', ');
            whereConditions.push(`${key} IN (${placeholders})`);
            params.push(...value.$in);
          }
        } else {
          whereConditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });
    }

    // Apply context filters
    if (context.filters) {
      Object.entries(context.filters).forEach(([key, value]) => {
        whereConditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      });
    }

    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    if (query.sort) {
      const sortClauses = Object.entries(query.sort).map(([field, direction]) =>
        `${field} ${direction === 1 ? 'ASC' : 'DESC'}`
      );
      sql += ` ORDER BY ${sortClauses.join(', ')}`;
    }

    // Add LIMIT and OFFSET
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }

    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    return { sql, params };
  }

  /**
   * Build COUNT SQL for total records
   */
  private buildCountSQL(query: IQuery, context: IQueryContext): { sql: string; params: any[] } {
    const tableName = query.entity || 'incident_data';
    const params: any[] = [];
    let paramIndex = 1;

    let sql = `SELECT COUNT(*) as count FROM ${tableName}`;

    // Build WHERE clause (same as select but without LIMIT/OFFSET)
    const whereConditions: string[] = [];
    
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          if (value.$gte && value.$lte) {
            whereConditions.push(`${key} BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            params.push(value.$gte, value.$lte);
            paramIndex += 2;
          } else if (value.$in) {
            const placeholders = value.$in.map(() => `$${paramIndex++}`).join(', ');
            whereConditions.push(`${key} IN (${placeholders})`);
            params.push(...value.$in);
          }
        } else {
          whereConditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      });
    }

    if (context.filters) {
      Object.entries(context.filters).forEach(([key, value]) => {
        whereConditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      });
    }

    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    return { sql, params };
  }

  /**
   * Build aggregate SQL query
   */
  private buildAggregateSQL(query: IQuery, context: IQueryContext): { sql: string; params: any[] } {
    const tableName = query.entity || 'incident_data';
    const params: any[] = [];
    let paramIndex = 1;

    // Simple aggregation - group by entity type and count
    let sql = `
      SELECT 
        COALESCE(type, 'unknown') as group_key,
        COUNT(*) as count,
        MIN(created_at) as earliest_date,
        MAX(created_at) as latest_date
      FROM ${tableName}
    `;

    // Apply filters
    const whereConditions: string[] = [];
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        whereConditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      });
    }

    if (context.filters) {
      Object.entries(context.filters).forEach(([key, value]) => {
        whereConditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      });
    }

    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    sql += ` GROUP BY COALESCE(type, 'unknown') ORDER BY count DESC`;

    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }

    return { sql, params };
  }

  /**
   * Transform PostgreSQL row to data record
   */
  private transformRowToDataRecord(row: any, source: string): IDataRecord {
    return {
      id: row.id || row.uuid || this.generateId(),
      type: row.type || 'incident_data',
      source: source,
      timestamp: row.timestamp || row.created_at || new Date(),
      data: row,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : {},
      relationships: [],
      provenance: {
        sourceSystem: this.name,
        collectedAt: new Date(),
        transformations: [],
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