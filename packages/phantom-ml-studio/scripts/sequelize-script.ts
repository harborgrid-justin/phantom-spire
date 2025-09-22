/**
 * SEQUELIZE DATABASE CONNECTION FOR SCRIPTS
 * Script-friendly version without server-only restrictions
 */
import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { Op, QueryTypes } from 'sequelize';
import { models, setupAssociations } from '../src/lib/models';

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  logging: boolean;
}

// Sequelize instance
let sequelize: Sequelize | null = null;

/**
 * Get database configuration from environment
 */
function getDatabaseConfig(): DatabaseConfig {
  // Parse connection string
  const connectionString = process.env['DATABASE_URL'] || 
    "postgresql://neondb_owner:npg_yPdfhxv7YbO8@ep-ancient-dream-ad9479e7-pooler.c-2.us-east-1.aws.neon.tech/pilot?sslmode=require&channel_binding=require";

  try {
    const parsed = new URL(connectionString);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1), // Remove leading slash
      username: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require',
      maxConnections: 20,
      logging: true // Always log in scripts
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize Sequelize connection for scripts
 */
export async function initializeSequelizeForScript(): Promise<Sequelize> {
  if (sequelize) {
    return sequelize;
  }

  const config = getDatabaseConfig();

  sequelize = new Sequelize({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    dialect: 'postgres',
    dialectOptions: {
      ssl: config.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: config.maxConnections,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    models: models,
    repositoryMode: true,
    sync: {
      force: false,
      alter: false
    }
  });

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Sequelize database connection established successfully');
    
    // Set up model associations
    setupAssociations();
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }

  return sequelize;
}

/**
 * Get Sequelize instance for scripts
 */
export async function getSequelizeForScript(): Promise<Sequelize> {
  if (!sequelize) {
    return initializeSequelizeForScript();
  }
  return sequelize;
}

/**
 * Close database connections
 */
export async function closeSequelizeForScript(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    console.log('✅ Sequelize connections closed');
  }
}

// Export Sequelize operators for queries
export { Op };
