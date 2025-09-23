/**
 * Enterprise Database Connection Pooling System
 * Advanced connection management with intelligent pooling strategies
 * Supports PostgreSQL, MySQL, MongoDB with performance optimization
 */

import { EventEmitter } from 'events';
import { Pool as PostgreSQLPool, PoolClient, PoolConfig } from 'pg';
import { createPool as createMySQLPool, Pool as MySQLPool, PoolConnection } from 'mysql2/promise';
import { MongoClient, MongoClientOptions, Db } from 'mongodb';

export interface ConnectionPoolConfig {
  postgresql?: {
    enabled: boolean;
    connectionString?: string;
    poolConfig: PoolConfig;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
      exponentialBackoff: boolean;
    };
  };
  mysql?: {
    enabled: boolean;
    config: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
      connectionLimit: number;
      acquireTimeout: number;
      timeout: number;
      reconnect: boolean;
    };
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
    };
  };
  mongodb?: {
    enabled: boolean;
    connectionString: string;
    options: MongoClientOptions;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
    };
  };
  monitoring: {
    enabled: boolean;
    interval: number; // milliseconds
    slowQueryThreshold: number; // milliseconds
    connectionLeakTimeout: number; // milliseconds
  };
  performance: {
    enableQueryOptimization: boolean;
    enableConnectionReuse: boolean;
    enablePreparedStatements: boolean;
    maxIdleTime: number; // milliseconds
  };
}

export interface ConnectionStats {
  postgresql?: {
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
    waitingClients: number;
    averageAcquireTime: number;
    slowQueries: number;
    errors: number;
  };
  mysql?: {
    totalConnections: number;
    activeConnections: number;
    queuedConnections: number;
    averageQueryTime: number;
    slowQueries: number;
    connectionErrors: number;
  };
  mongodb?: {
    activeConnections: number;
    availableConnections: number;
    currentOpCount: number;
    averageCommandTime: number;
    slowOperations: number;
    connectionErrors: number;
  };
  overall: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageQueryTime: number;
    connectionsCreated: number;
    connectionsDestroyed: number;
    healthScore: number; // 0-100
  };
}

export interface QueryMetrics {
  id: string;
  database: 'postgresql' | 'mysql' | 'mongodb';
  query: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  connectionId?: string;
  error?: string;
  rowsAffected?: number;
  parameters?: any[];
}

export interface ConnectionHealth {
  database: string;
  status: 'healthy' | 'warning' | 'critical';
  connectionCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastError?: string;
  uptime: number;
}

/**
 * Enterprise database connection pool manager
 */
export class EnterpriseDatabasePoolManager extends EventEmitter {
  private config: ConnectionPoolConfig;
  private postgresPool?: PostgreSQLPool;
  private mysqlPool?: MySQLPool;
  private mongoClient?: MongoClient;
  private mongoDB?: Db;
  
  private queryMetrics: QueryMetrics[] = [];
  private connectionLeaks: Map<string, { timestamp: Date; stack: string }> = new Map();
  private isMonitoring = false;
  private startTime = Date.now();
  
  private stats: ConnectionStats = {
    overall: {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      connectionsCreated: 0,
      connectionsDestroyed: 0,
      healthScore: 100
    }
  };

  constructor(config: ConnectionPoolConfig) {
    super();
    this.config = config;
    this.initialize();
  }

  /**
   * Initialize all database connections
   */
  private async initialize(): Promise<void> {
    try {
      if (this.config.postgresql?.enabled) {
        await this.initializePostgreSQL();
      }
      
      if (this.config.mysql?.enabled) {
        await this.initializeMySql();
      }
      
      if (this.config.mongodb?.enabled) {
        await this.initializeMongoDB();
      }

      if (this.config.monitoring.enabled) {
        this.startMonitoring();
      }

      this.emit('initialized');
    } catch (error) {
      this.emit('initialization_error', error);
      throw error;
    }
  }

  /**
   * Initialize PostgreSQL connection pool
   */
  private async initializePostgreSQL(): Promise<void> {
    const pgConfig = this.config.postgresql!;
    
    this.postgresPool = new PostgreSQLPool({
      connectionString: pgConfig.connectionString,
      ...pgConfig.poolConfig,
      // Enhanced configuration
      max: pgConfig.poolConfig.max || 20,
      min: pgConfig.poolConfig.min || 5,
      idleTimeoutMillis: pgConfig.poolConfig.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: pgConfig.poolConfig.connectionTimeoutMillis || 5000,
      maxUses: 7500, // Rotate connections after 7500 uses
      allowExitOnIdle: true
    });

    // Connection event handlers
    this.postgresPool.on('connect', (client) => {
      this.stats.overall.connectionsCreated++;
      this.emit('postgresql_connect', client);
    });

    this.postgresPool.on('remove', (client) => {
      this.stats.overall.connectionsDestroyed++;
      this.emit('postgresql_disconnect', client);
    });

    this.postgresPool.on('error', (error) => {
      this.emit('postgresql_error', error);
    });

    // Test the connection
    const testClient = await this.postgresPool.connect();
    await testClient.query('SELECT 1');
    testClient.release();

    this.emit('postgresql_ready');
  }

  /**
   * Initialize MySQL connection pool
   */
  private async initializeMySql(): Promise<void> {
    const mysqlConfig = this.config.mysql!;
    
    this.mysqlPool = createMySQLPool({
      ...mysqlConfig.config,
      // Enhanced configuration
      queueLimit: 100,
      maxIdle: 10,
      idleTimeout: 600000, // 10 minutes
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // Test the connection
    const testConnection = await this.mysqlPool.getConnection();
    await testConnection.execute('SELECT 1');
    testConnection.release();

    this.emit('mysql_ready');
  }

  /**
   * Initialize MongoDB connection
   */
  private async initializeMongoDB(): Promise<void> {
    const mongoConfig = this.config.mongodb!;
    
    this.mongoClient = new MongoClient(mongoConfig.connectionString, {
      ...mongoConfig.options,
      // Enhanced configuration
      maxPoolSize: mongoConfig.options.maxPoolSize || 20,
      minPoolSize: mongoConfig.options.minPoolSize || 5,
      maxIdleTimeMS: mongoConfig.options.maxIdleTimeMS || 30000,
      serverSelectionTimeoutMS: mongoConfig.options.serverSelectionTimeoutMS || 5000,
      monitorCommands: true
    });

    await this.mongoClient.connect();
    this.mongoDB = this.mongoClient.db();

    // Command monitoring
    this.mongoClient.on('commandStarted', (event) => {
      this.emit('mongodb_command_started', event);
    });

    this.mongoClient.on('commandSucceeded', (event) => {
      this.recordMongoQuery(event.commandName, event.duration, true);
    });

    this.mongoClient.on('commandFailed', (event) => {
      this.recordMongoQuery(event.commandName, event.duration, false, event.failure);
    });

    this.emit('mongodb_ready');
  }

  /**
   * Execute PostgreSQL query with connection pooling
   */
  async executePostgreSQLQuery<T = any>(
    query: string,
    parameters?: any[],
    options?: {
      timeout?: number;
      retries?: number;
      useTransaction?: boolean;
    }
  ): Promise<{ rows: T[]; rowCount: number; duration: number }> {
    if (!this.postgresPool) {
      throw new Error('PostgreSQL pool not initialized');
    }

    const startTime = Date.now();
    const queryId = `pg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let client: PoolClient | undefined;
    
    try {
      // Acquire connection with timeout
      client = await this.acquirePostgreSQLConnection(options?.timeout);
      
      // Track connection lease
      this.trackConnectionLease(queryId, 'postgresql');
      
      // Execute query
      const result = options?.useTransaction 
        ? await this.executeInTransaction(client, query, parameters)
        : await client.query(query, parameters);
      
      const duration = Date.now() - startTime;
      
      // Record metrics
      this.recordQueryMetrics({
        id: queryId,
        database: 'postgresql',
        query: this.sanitizeQuery(query),
        duration,
        success: true,
        timestamp: new Date(),
        connectionId: client.processID?.toString(),
        rowsAffected: result.rowCount || 0,
        parameters
      });

      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        duration
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.recordQueryMetrics({
        id: queryId,
        database: 'postgresql',
        query: this.sanitizeQuery(query),
        duration,
        success: false,
        timestamp: new Date(),
        error: error.message,
        parameters
      });

      // Retry logic
      if (options?.retries && options.retries > 0) {
        return this.executePostgreSQLQuery(query, parameters, {
          ...options,
          retries: options.retries - 1
        });
      }

      throw error;

    } finally {
      if (client) {
        client.release();
        this.releaseConnectionLease(queryId);
      }
    }
  }

  /**
   * Execute MySQL query with connection pooling
   */
  async executeMySQLQuery<T = any>(
    query: string,
    parameters?: any[],
    options?: {
      timeout?: number;
      retries?: number;
      useTransaction?: boolean;
    }
  ): Promise<{ rows: T[]; affectedRows: number; duration: number }> {
    if (!this.mysqlPool) {
      throw new Error('MySQL pool not initialized');
    }

    const startTime = Date.now();
    const queryId = `mysql_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let connection: PoolConnection | undefined;
    
    try {
      connection = await this.mysqlPool.getConnection();
      this.trackConnectionLease(queryId, 'mysql');

      if (options?.timeout) {
        (connection as any).timeout = options.timeout;
      }

      const [rows, fields] = options?.useTransaction
        ? await this.executeMySQLInTransaction(connection, query, parameters)
        : await connection.execute(query, parameters);

      const duration = Date.now() - startTime;
      const affectedRows = Array.isArray(rows) ? rows.length : (rows as any).affectedRows || 0;

      this.recordQueryMetrics({
        id: queryId,
        database: 'mysql',
        query: this.sanitizeQuery(query),
        duration,
        success: true,
        timestamp: new Date(),
        connectionId: connection.threadId?.toString(),
        rowsAffected: affectedRows,
        parameters
      });

      return {
        rows: rows as T[],
        affectedRows,
        duration
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.recordQueryMetrics({
        id: queryId,
        database: 'mysql',
        query: this.sanitizeQuery(query),
        duration,
        success: false,
        timestamp: new Date(),
        error: error.message,
        parameters
      });

      if (options?.retries && options.retries > 0) {
        return this.executeMySQLQuery(query, parameters, {
          ...options,
          retries: options.retries - 1
        });
      }

      throw error;

    } finally {
      if (connection) {
        connection.release();
        this.releaseConnectionLease(queryId);
      }
    }
  }

  /**
   * Execute MongoDB operation
   */
  async executeMongoOperation<T = any>(
    collectionName: string,
    operation: string,
    ...args: any[]
  ): Promise<{ result: T; duration: number }> {
    if (!this.mongoDB) {
      throw new Error('MongoDB not initialized');
    }

    const startTime = Date.now();
    const queryId = `mongo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const collection = this.mongoDB.collection(collectionName);
      const operationMethod = (collection as any)[operation];
      
      if (!operationMethod) {
        throw new Error(`Unknown MongoDB operation: ${operation}`);
      }

      const result = await operationMethod.apply(collection, args);
      const duration = Date.now() - startTime;

      this.recordQueryMetrics({
        id: queryId,
        database: 'mongodb',
        query: `${collectionName}.${operation}`,
        duration,
        success: true,
        timestamp: new Date(),
        parameters: args
      });

      return { result, duration };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.recordQueryMetrics({
        id: queryId,
        database: 'mongodb',
        query: `${collectionName}.${operation}`,
        duration,
        success: false,
        timestamp: new Date(),
        error: error.message,
        parameters: args
      });

      throw error;
    }
  }

  /**
   * Get comprehensive connection statistics
   */
  async getConnectionStats(): Promise<ConnectionStats> {
    const stats: ConnectionStats = { ...this.stats };

    if (this.postgresPool) {
      stats.postgresql = {
        totalConnections: this.postgresPool.totalCount,
        idleConnections: this.postgresPool.idleCount,
        activeConnections: this.postgresPool.totalCount - this.postgresPool.idleCount,
        waitingClients: this.postgresPool.waitingCount,
        averageAcquireTime: this.calculateAverageAcquireTime('postgresql'),
        slowQueries: this.countSlowQueries('postgresql'),
        errors: this.countErrors('postgresql')
      };
    }

    if (this.mysqlPool) {
      stats.mysql = {
        totalConnections: (this.mysqlPool as any)._allConnections?.length || 0,
        activeConnections: (this.mysqlPool as any)._activeConnections?.length || 0,
        queuedConnections: (this.mysqlPool as any)._queue?.length || 0,
        averageQueryTime: this.calculateAverageQueryTime('mysql'),
        slowQueries: this.countSlowQueries('mysql'),
        connectionErrors: this.countErrors('mysql')
      };
    }

    if (this.mongoClient) {
      const serverDescription = this.mongoClient.topology?.description;
      stats.mongodb = {
        activeConnections: serverDescription?.servers?.size || 0,
        availableConnections: 0, // Would need additional monitoring
        currentOpCount: 0,
        averageCommandTime: this.calculateAverageQueryTime('mongodb'),
        slowOperations: this.countSlowQueries('mongodb'),
        connectionErrors: this.countErrors('mongodb')
      };
    }

    // Update overall statistics
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    stats.overall = {
      totalQueries: this.queryMetrics.length,
      successfulQueries: this.queryMetrics.filter(m => m.success).length,
      failedQueries: this.queryMetrics.filter(m => !m.success).length,
      averageQueryTime: this.calculateOverallAverageQueryTime(),
      connectionsCreated: this.stats.overall.connectionsCreated,
      connectionsDestroyed: this.stats.overall.connectionsDestroyed,
      healthScore: this.calculateHealthScore(stats)
    };

    return stats;
  }

  /**
   * Get connection health status
   */
  async getConnectionHealth(): Promise<ConnectionHealth[]> {
    const health: ConnectionHealth[] = [];
    const stats = await this.getConnectionStats();

    if (this.config.postgresql?.enabled) {
      const pgStats = stats.postgresql!;
      health.push({
        database: 'postgresql',
        status: this.determineHealthStatus(pgStats.errors, pgStats.slowQueries, pgStats.averageAcquireTime),
        connectionCount: pgStats.totalConnections,
        averageResponseTime: pgStats.averageAcquireTime,
        errorRate: (pgStats.errors / (stats.overall.totalQueries || 1)) * 100,
        uptime: Date.now() - this.startTime
      });
    }

    if (this.config.mysql?.enabled) {
      const mysqlStats = stats.mysql!;
      health.push({
        database: 'mysql',
        status: this.determineHealthStatus(mysqlStats.connectionErrors, mysqlStats.slowQueries, mysqlStats.averageQueryTime),
        connectionCount: mysqlStats.totalConnections,
        averageResponseTime: mysqlStats.averageQueryTime,
        errorRate: (mysqlStats.connectionErrors / (stats.overall.totalQueries || 1)) * 100,
        uptime: Date.now() - this.startTime
      });
    }

    if (this.config.mongodb?.enabled) {
      const mongoStats = stats.mongodb!;
      health.push({
        database: 'mongodb',
        status: this.determineHealthStatus(mongoStats.connectionErrors, mongoStats.slowOperations, mongoStats.averageCommandTime),
        connectionCount: mongoStats.activeConnections,
        averageResponseTime: mongoStats.averageCommandTime,
        errorRate: (mongoStats.connectionErrors / (stats.overall.totalQueries || 1)) * 100,
        uptime: Date.now() - this.startTime
      });
    }

    return health;
  }

  /**
   * Private helper methods
   */
  private async acquirePostgreSQLConnection(timeout?: number): Promise<PoolClient> {
    if (timeout) {
      return Promise.race([
        this.postgresPool!.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), timeout)
        )
      ]);
    }
    return this.postgresPool!.connect();
  }

  private async executeInTransaction(
    client: PoolClient,
    query: string,
    parameters?: any[]
  ): Promise<any> {
    try {
      await client.query('BEGIN');
      const result = await client.query(query, parameters);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  private async executeMySQLInTransaction(
    connection: PoolConnection,
    query: string,
    parameters?: any[]
  ): Promise<any> {
    try {
      await connection.beginTransaction();
      const result = await connection.execute(query, parameters);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  private trackConnectionLease(queryId: string, database: string): void {
    if (this.config.monitoring.enabled) {
      this.connectionLeaks.set(queryId, {
        timestamp: new Date(),
        stack: new Error().stack || ''
      });

      // Clean up potential leaks
      setTimeout(() => {
        if (this.connectionLeaks.has(queryId)) {
          this.emit('connection_leak_detected', {
            queryId,
            database,
            duration: Date.now() - this.connectionLeaks.get(queryId)!.timestamp.getTime()
          });
        }
      }, this.config.monitoring.connectionLeakTimeout);
    }
  }

  private releaseConnectionLease(queryId: string): void {
    this.connectionLeaks.delete(queryId);
  }

  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);
    
    // Keep only recent metrics to prevent memory growth
    if (this.queryMetrics.length > 10000) {
      this.queryMetrics = this.queryMetrics.slice(-10000);
    }

    // Emit for real-time monitoring
    this.emit('query_executed', metrics);

    // Check for slow queries
    if (metrics.duration > this.config.monitoring.slowQueryThreshold) {
      this.emit('slow_query_detected', metrics);
    }
  }

  private recordMongoQuery(command: string, duration: number, success: boolean, error?: any): void {
    this.recordQueryMetrics({
      id: `mongo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      database: 'mongodb',
      query: command,
      duration,
      success,
      timestamp: new Date(),
      error: error?.message
    });
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query for logging
    return query
      .replace(/password/s*=/s*'[^']*'/gi, "password='***'")
      .replace(/password/s*=/s*"[^"]*"/gi, 'password="***"')
      .substring(0, 200); // Limit length
  }

  private calculateAverageAcquireTime(database: string): number {
    const recentMetrics = this.queryMetrics
      .filter(m => m.database === database && m.timestamp.getTime() > Date.now() - 5 * 60 * 1000)
      .slice(-100);
    
    if (recentMetrics.length === 0) return 0;
    
    return recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  }

  private calculateAverageQueryTime(database: string): number {
    return this.calculateAverageAcquireTime(database); // Same calculation for now
  }

  private calculateOverallAverageQueryTime(): number {
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp.getTime() > Date.now() - 5 * 60 * 1000
    );
    
    if (recentMetrics.length === 0) return 0;
    
    return recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  }

  private countSlowQueries(database: string): number {
    return this.queryMetrics.filter(
      m => m.database === database && 
           m.duration > this.config.monitoring.slowQueryThreshold &&
           m.timestamp.getTime() > Date.now() - 60 * 60 * 1000 // Last hour
    ).length;
  }

  private countErrors(database: string): number {
    return this.queryMetrics.filter(
      m => m.database === database && 
           !m.success &&
           m.timestamp.getTime() > Date.now() - 60 * 60 * 1000 // Last hour
    ).length;
  }

  private calculateHealthScore(stats: ConnectionStats): number {
    let score = 100;
    
    // Penalize high error rates
    const errorRate = stats.overall.failedQueries / (stats.overall.totalQueries || 1);
    if (errorRate > 0.05) score -= 30; // More than 5% error rate
    else if (errorRate > 0.01) score -= 15; // More than 1% error rate
    
    // Penalize slow average response times
    if (stats.overall.averageQueryTime > 1000) score -= 25; // Slower than 1 second
    else if (stats.overall.averageQueryTime > 500) score -= 10; // Slower than 500ms
    
    return Math.max(0, score);
  }

  private determineHealthStatus(errors: number, slowQueries: number, avgTime: number): 'healthy' | 'warning' | 'critical' {
    if (errors > 50 || slowQueries > 20 || avgTime > 2000) return 'critical';
    if (errors > 20 || slowQueries > 10 || avgTime > 1000) return 'warning';
    return 'healthy';
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    const monitor = async () => {
      if (!this.isMonitoring) return;
      
      try {
        const stats = await this.getConnectionStats();
        this.emit('stats_updated', stats);
        
        // Check for issues
        if (stats.overall.healthScore < 70) {
          this.emit('health_warning', stats);
        }
        
      } catch (error) {
        this.emit('monitoring_error', error);
      }
      
      setTimeout(monitor, this.config.monitoring.interval);
    };
    
    monitor();
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    this.isMonitoring = false;
    
    const promises: Promise<void>[] = [];
    
    if (this.postgresPool) {
      promises.push(this.postgresPool.end());
    }
    
    if (this.mysqlPool) {
      promises.push(this.mysqlPool.end());
    }
    
    if (this.mongoClient) {
      promises.push(this.mongoClient.close());
    }

    await Promise.all(promises);
    this.emit('closed');
  }
}

/**
 * Factory function
 */
export function createDatabasePoolManager(config: ConnectionPoolConfig): EnterpriseDatabasePoolManager {
  return new EnterpriseDatabasePoolManager(config);
}

// Default configuration
export const defaultPoolConfig: ConnectionPoolConfig = {
  postgresql: {
    enabled: false,
    poolConfig: {
      max: 20,
      min: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    }
  },
  mysql: {
    enabled: false,
    config: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'phantom',
      connectionLimit: 20,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    }
  },
  mongodb: {
    enabled: false,
    connectionString: 'mongodb://localhost:27017',
    options: {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000
    }
  },
  monitoring: {
    enabled: true,
    interval: 30000,
    slowQueryThreshold: 1000,
    connectionLeakTimeout: 300000
  },
  performance: {
    enableQueryOptimization: true,
    enableConnectionReuse: true,
    enablePreparedStatements: true,
    maxIdleTime: 600000
  }
};