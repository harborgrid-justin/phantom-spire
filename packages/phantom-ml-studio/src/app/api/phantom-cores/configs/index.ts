// Phantom Cores Centralized Configuration Management
// All configuration, constants, settings, and environment-specific configs

// ================================
// RE-EXPORT EXISTING CONSTANTS
// ================================
// Maintain backward compatibility while centralizing configuration
export * from '../constants';

// ================================
// CONFIGURATION CATEGORIES
// ================================

// API Configuration
export * from './api';

// Database Configuration  
export * from './database';

// Security Configuration
export * from './security';

// Performance Configuration
export * from './performance';

// External Services Configuration
export * from './external-services';

// Environment Configuration
export * from './environment';

// Logging Configuration
export * from './logging';

// Cache Configuration
export * from './cache';

// Rate Limiting Configuration
export * from './rate-limiting';

// Feature Flags Configuration
export * from './feature-flags';

// ================================
// CONFIGURATION UTILITIES
// ================================
export * from './utils';

// ================================
// CONFIGURATION VALIDATION
// ================================
export * from './validation';

// ================================
// MAIN CONFIGURATION OBJECT
// ================================

export interface PhantomCoresConfig {
  // API Settings
  api: {
    version: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableCompression: boolean;
    enableCors: boolean;
    corsOrigins: string[];
    maxRequestSize: string;
    enableSwagger: boolean;
  };

  // Database Settings
  database: {
    type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
    host: string;
    port: number;
    name: string;
    username?: string;
    password?: string;
    ssl: boolean;
    poolSize: number;
    timeout: number;
    retryWrites: boolean;
    readPreference: 'primary' | 'secondary' | 'nearest';
  };

  // Security Settings
  security: {
    jwt: {
      secret: string;
      expiresIn: string;
      refreshExpiresIn: string;
      algorithm: string;
    };
    encryption: {
      algorithm: string;
      keySize: number;
      ivLength: number;
    };
    rateLimit: {
      windowMs: number;
      max: number;
      skipSuccessfulRequests: boolean;
      skipFailedRequests: boolean;
    };
    csrf: {
      enabled: boolean;
      secret: string;
    };
    helmet: {
      enabled: boolean;
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
    };
  };

  // External Services
  externalServices: {
    threatIntel: {
      enabled: boolean;
      apiKey?: string;
      baseUrl: string;
      timeout: number;
      retryAttempts: number;
    };
    malwareAnalysis: {
      enabled: boolean;
      apiKey?: string;
      baseUrl: string;
      timeout: number;
      retryAttempts: number;
    };
    cveDatabase: {
      enabled: boolean;
      apiKey?: string;
      baseUrl: string;
      timeout: number;
      retryAttempts: number;
    };
  };

  // Performance Settings
  performance: {
    cache: {
      enabled: boolean;
      ttl: number;
      maxKeys: number;
      checkPeriod: number;
    };
    compression: {
      enabled: boolean;
      level: number;
      threshold: number;
    };
    monitoring: {
      enabled: boolean;
      sampleRate: number;
      slowQueryThreshold: number;
    };
  };

  // Logging Settings
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    format: 'json' | 'text';
    enableConsole: boolean;
    enableFile: boolean;
    enableSyslog: boolean;
    filePath?: string;
    maxFileSize: string;
    maxFiles: number;
    enableAuditLog: boolean;
  };

  // Environment Settings
  environment: {
    name: 'development' | 'staging' | 'production' | 'test';
    debug: boolean;
    enableMetrics: boolean;
    enableHealthCheck: boolean;
    enableProfiling: boolean;
  };

  // Feature Flags
  features: {
    enableAdvancedThreatDetection: boolean;
    enableMLAnalysis: boolean;
    enableRealtimeAlerts: boolean;
    enableBehavioralAnalysis: boolean;
    enableThreatHunting: boolean;
    enableIncidentResponse: boolean;
    enableForensics: boolean;
    enableCompliance: boolean;
    enableRiskAssessment: boolean;
  };
}

// ================================
// DEFAULT CONFIGURATION
// ================================

export const DEFAULT_CONFIG: PhantomCoresConfig = {
  api: {
    version: '1.0.0',
    baseUrl: '/api/phantom-cores',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableCors: true,
    corsOrigins: ['http://localhost:3000'],
    maxRequestSize: '10mb',
    enableSwagger: false,
  },

  database: {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    name: 'phantom_cores',
    ssl: false,
    poolSize: 10,
    timeout: 30000,
    retryWrites: true,
    readPreference: 'primary',
  },

  security: {
    jwt: {
      secret: 'your-secret-key',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      algorithm: 'HS256',
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keySize: 32,
      ivLength: 16,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    csrf: {
      enabled: true,
      secret: 'your-csrf-secret',
    },
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
    },
  },

  externalServices: {
    threatIntel: {
      enabled: true,
      baseUrl: 'https://api.threatintel.com',
      timeout: 15000,
      retryAttempts: 2,
    },
    malwareAnalysis: {
      enabled: true,
      baseUrl: 'https://api.malwareanalysis.com',
      timeout: 30000,
      retryAttempts: 2,
    },
    cveDatabase: {
      enabled: true,
      baseUrl: 'https://cve.mitre.org',
      timeout: 10000,
      retryAttempts: 3,
    },
  },

  performance: {
    cache: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxKeys: 1000,
      checkPeriod: 60, // 1 minute
    },
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024, // 1KB
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.1, // 10%
      slowQueryThreshold: 1000, // 1 second
    },
  },

  logging: {
    level: 'info',
    format: 'json',
    enableConsole: true,
    enableFile: false,
    enableSyslog: false,
    maxFileSize: '10m',
    maxFiles: 5,
    enableAuditLog: true,
  },

  environment: {
    name: 'development',
    debug: true,
    enableMetrics: true,
    enableHealthCheck: true,
    enableProfiling: false,
  },

  features: {
    enableAdvancedThreatDetection: true,
    enableMLAnalysis: true,
    enableRealtimeAlerts: true,
    enableBehavioralAnalysis: true,
    enableThreatHunting: true,
    enableIncidentResponse: true,
    enableForensics: true,
    enableCompliance: true,
    enableRiskAssessment: true,
  },
};

// ================================
// ENVIRONMENT-SPECIFIC CONFIGS
// ================================

export const PRODUCTION_OVERRIDES: Partial<PhantomCoresConfig> = {
  environment: {
    name: 'production',
    debug: false,
    enableMetrics: true,
    enableHealthCheck: true,
    enableProfiling: false,
  },
  logging: {
    level: 'warn',
    format: 'json',
    enableConsole: false,
    enableFile: true,
    enableSyslog: true,
    filePath: '/var/log/phantom-cores/app.log',
    maxFileSize: '100m',
    maxFiles: 10,
    enableAuditLog: true,
  },
  security: {
    jwt: {
      secret: process.env['JWT_SECRET'] || 'production-secret-key',
      expiresIn: '5m',
      refreshExpiresIn: '24h',
      algorithm: 'HS256',
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keySize: 32,
      ivLength: 16,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 500, // More restrictive in production
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    csrf: {
      enabled: true,
      secret: 'production-csrf-secret',
    },
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
    },
  },
  performance: {
    cache: {
      enabled: true,
      ttl: 600, // 10 minutes
      maxKeys: 10000,
      checkPeriod: 300, // 5 minutes
    },
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024,
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.1,
      slowQueryThreshold: 1000,
    },
  },
};

export const STAGING_OVERRIDES: Partial<PhantomCoresConfig> = {
  environment: {
    name: 'staging',
    debug: false,
    enableMetrics: true,
    enableHealthCheck: true,
    enableProfiling: true,
  },
  logging: {
    level: 'debug',
    format: 'json',
    enableConsole: true,
    enableFile: true,
    enableSyslog: false,
    filePath: '/tmp/phantom-cores-staging.log',
    maxFileSize: '50m',
    maxFiles: 3,
    enableAuditLog: true,
  },
};

export const TEST_OVERRIDES: Partial<PhantomCoresConfig> = {
  environment: {
    name: 'test',
    debug: true,
    enableMetrics: false,
    enableHealthCheck: false,
    enableProfiling: false,
  },
  logging: {
    level: 'error',
    format: 'text',
    enableConsole: false,
    enableFile: false,
    enableSyslog: false,
    maxFileSize: '1m',
    maxFiles: 1,
    enableAuditLog: false,
  },
  database: {
    type: 'sqlite',
    host: ':memory:',
    port: 0,
    name: 'test_phantom_cores',
    ssl: false,
    poolSize: 1,
    timeout: 5000,
    retryWrites: false,
    readPreference: 'primary',
  },
  performance: {
    cache: {
      enabled: false,
      ttl: 0,
      maxKeys: 0,
      checkPeriod: 0,
    },
    compression: {
      enabled: false,
      level: 1,
      threshold: 0,
    },
    monitoring: {
      enabled: false,
      sampleRate: 0,
      slowQueryThreshold: 0,
    },
  },
};

// ================================
// TYPE EXPORTS
// ================================

export type ConfigEnvironment = 'development' | 'staging' | 'production' | 'test';
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogFormat = 'json' | 'text';
export type ReadPreference = 'primary' | 'secondary' | 'nearest';
