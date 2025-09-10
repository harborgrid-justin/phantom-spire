/**
 * CVE Data Service Configuration
 * Business SaaS-ready configuration for multi-database support
 */

import { logger } from '../utils/logger.js';
import { CVEDataServiceConfig } from '../data-layer/services/CVEDataService.js';

export interface PhantomCVECoreConfig {
  // Multi-database configuration
  databases: {
    mongodb?: {
      enabled: boolean;
      uri: string;
      database: string;
      role: 'primary' | 'secondary' | 'archive';
    };
    redis?: {
      enabled: boolean;
      url?: string;
      host?: string;
      port?: number;
      password?: string;
      database?: number;
      role: 'cache' | 'session' | 'realtime';
    };
    postgresql?: {
      enabled: boolean;
      connectionString?: string;
      host?: string;
      port?: number;
      database?: string;
      user?: string;
      password?: string;
      ssl?: boolean;
      role: 'relational' | 'analytics' | 'reporting';
    };
    elasticsearch?: {
      enabled: boolean;
      node?: string | string[];
      auth?: {
        username: string;
        password: string;
      } | {
        apiKey: string;
      };
      ssl?: {
        rejectUnauthorized?: boolean;
      };
      role: 'search' | 'analytics' | 'ml';
    };
  };
  
  // Data strategy configuration
  dataStrategy?: {
    readPreference: 'primary' | 'cache-first' | 'distributed';
    writeStrategy: 'single' | 'dual' | 'all';
    consistencyLevel: 'eventual' | 'strong' | 'bounded';
    cacheInvalidation: 'immediate' | 'delayed' | 'ttl-based';
  };

  // Business SaaS features
  saasFeatures?: {
    multiTenancy: boolean;
    dataRetention: number; // days
    auditLogging: boolean;
    encryption: boolean;
    backups: boolean;
  };
}

/**
 * Load configuration from environment variables with business SaaS defaults
 */
export function loadCVECoreConfig(): PhantomCVECoreConfig {
  const config: PhantomCVECoreConfig = {
    databases: {},
    dataStrategy: {
      readPreference: (process.env.CVE_READ_PREFERENCE as any) || 'cache-first',
      writeStrategy: (process.env.CVE_WRITE_STRATEGY as any) || 'dual',
      consistencyLevel: (process.env.CVE_CONSISTENCY_LEVEL as any) || 'eventual',
      cacheInvalidation: (process.env.CVE_CACHE_INVALIDATION as any) || 'immediate',
    },
    saasFeatures: {
      multiTenancy: process.env.CVE_MULTI_TENANCY === 'true',
      dataRetention: parseInt(process.env.CVE_DATA_RETENTION || '365'),
      auditLogging: process.env.CVE_AUDIT_LOGGING !== 'false',
      encryption: process.env.CVE_ENCRYPTION !== 'false',
      backups: process.env.CVE_BACKUPS !== 'false',
    },
  };

  // MongoDB Configuration
  if (process.env.MONGODB_URI || process.env.MONGO_URI) {
    config.databases.mongodb = {
      enabled: process.env.CVE_MONGODB_ENABLED !== 'false',
      uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017',
      database: process.env.MONGODB_DATABASE || process.env.MONGO_DATABASE || 'phantom_spire',
      role: (process.env.CVE_MONGODB_ROLE as any) || 'primary',
    };
  }

  // Redis Configuration
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    config.databases.redis = {
      enabled: process.env.CVE_REDIS_ENABLED !== 'false',
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DATABASE || '0'),
      role: (process.env.CVE_REDIS_ROLE as any) || 'cache',
    };
  }

  // PostgreSQL Configuration
  if (process.env.POSTGRESQL_URI || process.env.POSTGRES_URI || process.env.DATABASE_URL) {
    config.databases.postgresql = {
      enabled: process.env.CVE_POSTGRESQL_ENABLED !== 'false',
      connectionString: process.env.POSTGRESQL_URI || process.env.POSTGRES_URI || process.env.DATABASE_URL,
      host: process.env.POSTGRES_HOST || process.env.POSTGRESQL_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || process.env.POSTGRESQL_PORT || '5432'),
      database: process.env.POSTGRES_DB || process.env.POSTGRESQL_DB || 'phantom_spire',
      user: process.env.POSTGRES_USER || process.env.POSTGRESQL_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || process.env.POSTGRESQL_PASSWORD,
      ssl: process.env.POSTGRES_SSL === 'true' || process.env.POSTGRESQL_SSL === 'true',
      role: (process.env.CVE_POSTGRESQL_ROLE as any) || 'relational',
    };
  }

  // Elasticsearch Configuration
  if (process.env.ELASTICSEARCH_URL || process.env.ELASTIC_URL) {
    const elasticConfig: any = {
      enabled: process.env.CVE_ELASTICSEARCH_ENABLED !== 'false',
      node: process.env.ELASTICSEARCH_URL || process.env.ELASTIC_URL || 'http://localhost:9200',
      role: (process.env.CVE_ELASTICSEARCH_ROLE as any) || 'search',
    };

    // Authentication
    if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
      elasticConfig.auth = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      };
    } else if (process.env.ELASTICSEARCH_API_KEY) {
      elasticConfig.auth = {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
      };
    }

    // SSL Configuration
    if (process.env.ELASTICSEARCH_SSL !== 'false') {
      elasticConfig.ssl = {
        rejectUnauthorized: process.env.ELASTICSEARCH_SSL_VERIFY !== 'false',
      };
    }

    config.databases.elasticsearch = elasticConfig;
  }

  logger.info('CVE Core configuration loaded', {
    enabledDatabases: Object.keys(config.databases).filter(db => 
      config.databases[db as keyof typeof config.databases]?.enabled
    ),
    readPreference: config.dataStrategy?.readPreference,
    writeStrategy: config.dataStrategy?.writeStrategy,
    saasFeatures: config.saasFeatures,
  });

  return config;
}

/**
 * Convert PhantomCVECoreConfig to CVEDataServiceConfig
 */
export function toCVEDataServiceConfig(config: PhantomCVECoreConfig): CVEDataServiceConfig {
  const dataServiceConfig: CVEDataServiceConfig = {
    dataStrategy: config.dataStrategy,
  };

  // MongoDB configuration
  if (config.databases.mongodb?.enabled) {
    dataServiceConfig.mongodb = {
      enabled: true,
      config: {
        uri: config.databases.mongodb.uri,
        database: config.databases.mongodb.database,
      },
      role: config.databases.mongodb.role,
    };
  }

  // Redis configuration
  if (config.databases.redis?.enabled) {
    dataServiceConfig.redis = {
      enabled: true,
      config: {
        url: config.databases.redis.url,
        host: config.databases.redis.host,
        port: config.databases.redis.port,
        password: config.databases.redis.password,
        database: config.databases.redis.database,
        keyPrefix: 'phantom:cve:',
        ttl: 3600, // 1 hour default
      },
      role: config.databases.redis.role,
    };
  }

  // PostgreSQL configuration
  if (config.databases.postgresql?.enabled) {
    dataServiceConfig.postgresql = {
      enabled: true,
      config: {
        connectionString: config.databases.postgresql.connectionString,
        host: config.databases.postgresql.host,
        port: config.databases.postgresql.port,
        database: config.databases.postgresql.database,
        user: config.databases.postgresql.user,
        password: config.databases.postgresql.password,
        ssl: config.databases.postgresql.ssl,
        schema: 'cve_data',
      },
      role: config.databases.postgresql.role,
    };
  }

  // Elasticsearch configuration
  if (config.databases.elasticsearch?.enabled) {
    dataServiceConfig.elasticsearch = {
      enabled: true,
      config: {
        node: config.databases.elasticsearch.node,
        auth: config.databases.elasticsearch.auth,
        ssl: config.databases.elasticsearch.ssl,
        indexPrefix: 'phantom-cve',
        defaultIndex: 'cves',
      },
      role: config.databases.elasticsearch.role,
    };
  }

  return dataServiceConfig;
}

/**
 * Validate configuration for business SaaS readiness
 */
export function validateConfiguration(config: PhantomCVECoreConfig): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  const enabledDatabases = Object.keys(config.databases).filter(db => 
    config.databases[db as keyof typeof config.databases]?.enabled
  );

  // Check for at least one database
  if (enabledDatabases.length === 0) {
    errors.push('At least one database must be enabled for CVE data storage');
  }

  // Business SaaS readiness checks
  if (enabledDatabases.length === 1) {
    warnings.push('Single database configuration may not provide optimal performance for business SaaS workloads');
    recommendations.push('Consider enabling Redis for caching and PostgreSQL for analytics');
  }

  if (!config.databases.redis?.enabled) {
    warnings.push('Redis is not enabled - caching and real-time features will be limited');
    recommendations.push('Enable Redis for improved performance and real-time capabilities');
  }

  if (!config.databases.elasticsearch?.enabled) {
    warnings.push('Elasticsearch is not enabled - advanced search capabilities will be limited');
    recommendations.push('Enable Elasticsearch for full-text search and advanced analytics');
  }

  if (!config.databases.postgresql?.enabled) {
    warnings.push('PostgreSQL is not enabled - relational queries and reporting may be limited');
    recommendations.push('Enable PostgreSQL for ACID compliance and complex reporting');
  }

  // Data strategy validation
  if (config.dataStrategy?.writeStrategy === 'single' && enabledDatabases.length > 1) {
    warnings.push('Write strategy is set to "single" but multiple databases are enabled');
    recommendations.push('Consider "dual" or "all" write strategy for better reliability');
  }

  // SaaS features validation
  if (!config.saasFeatures?.auditLogging) {
    warnings.push('Audit logging is disabled - may not meet compliance requirements');
  }

  if (!config.saasFeatures?.encryption) {
    warnings.push('Encryption is disabled - data security may be compromised');
  }

  if (!config.saasFeatures?.backups) {
    warnings.push('Backups are disabled - data loss risk is high');
  }

  const isValid = errors.length === 0;

  if (isValid) {
    logger.info('CVE Core configuration validation passed', {
      enabledDatabases,
      warnings: warnings.length,
      recommendations: recommendations.length,
    });
  } else {
    logger.error('CVE Core configuration validation failed', {
      errors,
      warnings,
    });
  }

  return {
    isValid,
    warnings,
    errors,
    recommendations,
  };
}

/**
 * Get configuration summary for business SaaS readiness assessment
 */
export function getConfigurationSummary(config: PhantomCVECoreConfig): any {
  const enabledDatabases = Object.keys(config.databases).filter(db => 
    config.databases[db as keyof typeof config.databases]?.enabled
  );

  return {
    businessSaasReadiness: {
      level: enabledDatabases.length >= 3 ? 'enterprise' : 
             enabledDatabases.length >= 2 ? 'professional' : 'basic',
      score: Math.min(100, (enabledDatabases.length * 25) + 
             (config.saasFeatures?.multiTenancy ? 10 : 0) +
             (config.saasFeatures?.auditLogging ? 10 : 0) +
             (config.saasFeatures?.encryption ? 10 : 0) +
             (config.saasFeatures?.backups ? 5 : 0)),
      features: {
        multiDatabase: enabledDatabases.length > 1,
        intelligentCaching: config.databases.redis?.enabled || false,
        advancedSearch: config.databases.elasticsearch?.enabled || false,
        relationalAnalytics: config.databases.postgresql?.enabled || false,
        documentStorage: config.databases.mongodb?.enabled || false,
        realTimeUpdates: config.databases.redis?.enabled || false,
        auditLogging: config.saasFeatures?.auditLogging || false,
        encryption: config.saasFeatures?.encryption || false,
        backups: config.saasFeatures?.backups || false,
      },
    },
    databases: {
      enabled: enabledDatabases,
      total: enabledDatabases.length,
      roles: Object.fromEntries(
        enabledDatabases.map(db => [
          db, 
          config.databases[db as keyof typeof config.databases]?.role
        ])
      ),
    },
    dataStrategy: config.dataStrategy,
    capabilities: [
      ...(config.databases.mongodb?.enabled ? ['document-storage', 'flexible-schema'] : []),
      ...(config.databases.redis?.enabled ? ['high-performance-cache', 'real-time-pubsub'] : []),
      ...(config.databases.postgresql?.enabled ? ['acid-compliance', 'complex-queries', 'reporting'] : []),
      ...(config.databases.elasticsearch?.enabled ? ['full-text-search', 'advanced-analytics', 'ml-ready'] : []),
    ],
  };
}