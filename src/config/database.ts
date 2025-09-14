import mongoose from 'mongoose';
import { Client as ESClient } from '@elastic/elasticsearch';
import { createClient as createRedisClient } from 'redis';
import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

// Database connection instances
export let elasticsearchClient: ESClient;
export let redisClient: any;
export let mysqlPool: mysql.Pool;
export let postgresPool: PgPool;

export async function connectDatabase(): Promise<void> {
  try {
    logger.info('🔄 Initializing multi-database connections...');

    // MongoDB Connection
    logger.info('📂 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    logger.info('✅ MongoDB connected successfully');

    // PostgreSQL Connection
    logger.info('📂 Connecting to PostgreSQL...');
    postgresPool = new PgPool({
      connectionString: config.POSTGRESQL_URI,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    await postgresPool.connect();
    logger.info('✅ PostgreSQL connected successfully');

    // MySQL Connection  
    logger.info('📂 Connecting to MySQL...');
    mysqlPool = mysql.createPool({
      uri: config.MYSQL_URI,
      connectionLimit: 20,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
    });
    // Test connection
    const mysqlConnection = await mysqlPool.getConnection();
    mysqlConnection.release();
    logger.info('✅ MySQL connected successfully');

    // Redis Connection
    logger.info('📂 Connecting to Redis...');
    redisClient = createRedisClient({
      url: config.REDIS_URL,
      retry_max_delay: 5000,
      retry_unfulfilled_commands: true,
    });
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');

    // Elasticsearch Connection
    logger.info('📂 Connecting to Elasticsearch...');
    elasticsearchClient = new ESClient({
      node: config.ELASTICSEARCH_URI,
      maxRetries: 3,
      requestTimeout: 60000,
      sniffOnStart: true,
    });
    await elasticsearchClient.ping();
    logger.info('✅ Elasticsearch connected successfully');

    logger.info('🚀 All enterprise databases connected successfully');

    // Set up connection monitoring
    setupConnectionMonitoring();

  } catch (error) {
    logger.error('❌ Failed to connect to databases:', error);
    throw error;
  }
}

function setupConnectionMonitoring(): void {
  // MongoDB monitoring
  mongoose.connection.on('error', error => {
    logger.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // PostgreSQL monitoring
  postgresPool.on('error', (error) => {
    logger.error('PostgreSQL pool error:', error);
  });

  // Redis monitoring
  redisClient.on('error', (error: Error) => {
    logger.error('Redis connection error:', error);
  });

  redisClient.on('disconnect', () => {
    logger.warn('Redis disconnected');
  });

  // Elasticsearch monitoring (automatic in v8)
  logger.info('✅ Database connection monitoring enabled');

  // Graceful shutdown handlers
  setupGracefulShutdown();
}

function setupGracefulShutdown(): void {
  const gracefulClose = async () => {
    logger.info('🔄 Closing database connections gracefully...');
    
    try {
      await mongoose.connection.close();
      logger.info('✅ MongoDB connection closed');
      
      await postgresPool.end();
      logger.info('✅ PostgreSQL connection closed');
      
      await mysqlPool.end();
      logger.info('✅ MySQL connection closed');
      
      await redisClient.quit();
      logger.info('✅ Redis connection closed');
      
      await elasticsearchClient.close();
      logger.info('✅ Elasticsearch connection closed');
      
      logger.info('✅ All database connections closed successfully');
    } catch (error) {
      logger.error('❌ Error during database shutdown:', error);
    }
    
    process.exit(0);
  };

  process.on('SIGINT', gracefulClose);
  process.on('SIGTERM', gracefulClose);
}
