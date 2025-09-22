// Configuration Utilities
// Helper functions for configuration management, validation, and environment loading

import { PhantomCoresConfig } from './index';

export function loadConfigFromEnvironment(): Partial<PhantomCoresConfig> {
  return {
    database: {
      type: (process.env.DB_TYPE as any) || 'mongodb',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '27017'),
      name: process.env.DB_NAME || 'phantom_cores',
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true',
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
      timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
      retryWrites: process.env.DB_RETRY_WRITES !== 'false',
      readPreference: (process.env.DB_READ_PREFERENCE as any) || 'primary',
    },
    security: {
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
      },
      encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        keySize: parseInt(process.env.ENCRYPTION_KEY_SIZE || '32'),
        ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH || '16'),
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        max: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
        skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
      },
      csrf: {
        enabled: process.env.CSRF_ENABLED !== 'false',
        secret: process.env.CSRF_SECRET || 'your-csrf-secret',
      },
      helmet: {
        enabled: process.env.HELMET_ENABLED !== 'false',
        contentSecurityPolicy: process.env.HELMET_CSP !== 'false',
        crossOriginEmbedderPolicy: process.env.HELMET_COEP === 'true',
      },
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      format: (process.env.LOG_FORMAT as any) || 'json',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      enableSyslog: process.env.LOG_SYSLOG === 'true',
      filePath: process.env.LOG_FILE_PATH,
      maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10m',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
      enableAuditLog: process.env.LOG_AUDIT !== 'false',
    },
  };
}

export function validateConfig(config: PhantomCoresConfig): string[] {
  const errors: string[] = [];
  
  // Validate database config
  if (!config.database.host) {
    errors.push('Database host is required');
  }
  if (!config.database.name) {
    errors.push('Database name is required');
  }
  if (config.database.port < 1 || config.database.port > 65535) {
    errors.push('Database port must be between 1 and 65535');
  }
  
  // Validate security config
  if (!config.security.jwt.secret || config.security.jwt.secret === 'your-secret-key') {
    errors.push('JWT secret must be set to a secure value');
  }
  if (config.security.jwt.secret.length < 32) {
    errors.push('JWT secret should be at least 32 characters long');
  }
  
  return errors;
}
