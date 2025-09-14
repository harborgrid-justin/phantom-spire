import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module format
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  NODE_ENV: string;
  PORT: number;
  
  // Multi-Database Support (All 5 required for enterprise)
  MONGODB_URI: string;
  POSTGRESQL_URI: string;
  MYSQL_URI: string;
  REDIS_URL: string;
  ELASTICSEARCH_URI: string;
  
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BCRYPT_ROUNDS: number;
  API_VERSION: string;

  // Enterprise Cache Management
  CACHE_ENABLED: boolean;
  CACHE_MEMORY_MAX_SIZE: number;
  CACHE_MEMORY_TTL: number;
  CACHE_REDIS_TTL: number;
  CACHE_REDIS_PREFIX: string;
  CACHE_MONITORING_ENABLED: boolean;
  CACHE_MONITORING_INTERVAL: number;

  // Enterprise State Management
  STATE_ENABLED: boolean;
  STATE_PERSISTENCE_ENABLED: boolean;
  STATE_PERSISTENCE_STRATEGY: string;
  STATE_SYNC_INTERVAL: number;
  STATE_VERSIONING_ENABLED: boolean;
  STATE_VERSIONING_MAX_VERSIONS: number;
  STATE_MONITORING_ENABLED: boolean;
  STATE_MONITORING_INTERVAL: number;
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Multi-Database Support (Enterprise requirement)
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/phantom-spire',
  POSTGRESQL_URI:
    process.env.POSTGRESQL_URI || 'postgresql://localhost:5432/phantom-spire',
  MYSQL_URI:
    process.env.MYSQL_URI || 'mysql://localhost:3306/phantom-spire',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  ELASTICSEARCH_URI:
    process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
    
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000',
    10
  ), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    10
  ),
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  API_VERSION: 'v1',

  // Enterprise Cache Management
  CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false',
  CACHE_MEMORY_MAX_SIZE: parseInt(
    process.env.CACHE_MEMORY_MAX_SIZE || '10000',
    10
  ),
  CACHE_MEMORY_TTL: parseInt(process.env.CACHE_MEMORY_TTL || '300000', 10), // 5 minutes
  CACHE_REDIS_TTL: parseInt(process.env.CACHE_REDIS_TTL || '1800000', 10), // 30 minutes
  CACHE_REDIS_PREFIX:
    process.env.CACHE_REDIS_PREFIX || 'phantomspire:enterprise:',
  CACHE_MONITORING_ENABLED: process.env.CACHE_MONITORING_ENABLED !== 'false',
  CACHE_MONITORING_INTERVAL: parseInt(
    process.env.CACHE_MONITORING_INTERVAL || '30000',
    10
  ), // 30 seconds

  // Enterprise State Management
  STATE_ENABLED: process.env.STATE_ENABLED !== 'false',
  STATE_PERSISTENCE_ENABLED: process.env.STATE_PERSISTENCE_ENABLED !== 'false',
  STATE_PERSISTENCE_STRATEGY:
    process.env.STATE_PERSISTENCE_STRATEGY || 'hybrid',
  STATE_SYNC_INTERVAL: parseInt(process.env.STATE_SYNC_INTERVAL || '60000', 10), // 1 minute
  STATE_VERSIONING_ENABLED: process.env.STATE_VERSIONING_ENABLED !== 'false',
  STATE_VERSIONING_MAX_VERSIONS: parseInt(
    process.env.STATE_VERSIONING_MAX_VERSIONS || '50',
    10
  ),
  STATE_MONITORING_ENABLED: process.env.STATE_MONITORING_ENABLED !== 'false',
  STATE_MONITORING_INTERVAL: parseInt(
    process.env.STATE_MONITORING_INTERVAL || '60000',
    10
  ), // 1 minute
};
