/**
 * Enterprise Configuration Management System
 * Centralized configuration with environment validation, secrets management, and hot reloading
 */

import { z } from 'zod';
import { ValidationUtils } from '../../lib/utils/validation';

// Configuration source types
export enum ConfigSource {
  ENVIRONMENT = 'environment',
  FILE = 'file',
  REMOTE = 'remote',
  OVERRIDE = 'override',
  DEFAULT = 'default',
}

// Configuration entry metadata
export interface ConfigEntry<T = unknown> {
  key: string;
  value: T;
  source: ConfigSource;
  sensitive: boolean;
  description?: string;
  lastModified: Date;
  validation?: z.ZodSchema<T>;
  transformers?: Array<(value: unknown) => unknown>;
}

// Configuration change event
export interface ConfigChangeEvent<T = unknown> {
  key: string;
  oldValue?: T;
  newValue: T;
  source: ConfigSource;
  timestamp: Date;
}

// Configuration watcher callback
export type ConfigWatcher<T = unknown> = (event: ConfigChangeEvent<T>) => void | Promise<void>;

// Environment validation schema
const EnvironmentSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('phantom-ml-studio'),
  APP_VERSION: z.string().default('1.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('localhost'),
  
  // API Configuration
  API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  API_TIMEOUT: z.coerce.number().int().min(1000).max(300000).default(30000),
  API_RATE_LIMIT_REQUESTS: z.coerce.number().int().min(1).default(1000),
  API_RATE_LIMIT_WINDOW: z.coerce.number().int().min(1).default(900000), // 15 minutes
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ELASTICSEARCH_URL: z.string().optional(),
  
  // Security
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  CORS_ORIGIN: z.string().default('*'),
  ALLOWED_HOSTS: z.string().default('localhost'),
  
  // ML Services
  HUGGINGFACE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ML_MODEL_CACHE_SIZE: z.coerce.number().int().min(100).default(1000),
  ML_MAX_BATCH_SIZE: z.coerce.number().int().min(1).max(10000).default(1000),
  ML_TIMEOUT: z.coerce.number().int().min(1000).default(300000),
  
  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Monitoring & Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),
  ENABLE_METRICS: z.coerce.boolean().default(true),
  METRICS_PORT: z.coerce.number().int().min(1).max(65535).default(9090),
  SENTRY_DSN: z.string().optional(),
  
  // Features
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  ENABLE_CACHING: z.coerce.boolean().default(true),
  ENABLE_COMPRESSION: z.coerce.boolean().default(true),
  ENABLE_HTTPS_ONLY: z.coerce.boolean().default(false),
  ENABLE_API_DOCS: z.coerce.boolean().default(true),
  
  // Performance
  MAX_REQUEST_SIZE: z.coerce.number().int().min(1024).default(10 * 1024 * 1024), // 10MB
  MAX_UPLOAD_SIZE: z.coerce.number().int().min(1024).default(100 * 1024 * 1024), // 100MB
  CACHE_TTL: z.coerce.number().int().min(1).default(300), // 5 minutes
  SESSION_TIMEOUT: z.coerce.number().int().min(60).default(3600), // 1 hour
  
  // External Services
  WEBHOOK_SECRET: z.string().optional(),
  NOTIFICATION_EMAIL: z.string().email().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  
  // Development
  DEBUG: z.coerce.boolean().default(false),
  MOCK_SERVICES: z.coerce.boolean().default(false),
  HOT_RELOAD: z.coerce.boolean().default(true),
});

// Configuration interface
export interface AppConfig {
  // Application
  nodeEnv: string;
  appName: string;
  appVersion: string;
  port: number;
  host: string;
  
  // API
  api: {
    baseUrl: string;
    timeout: number;
    rateLimit: {
      requests: number;
      window: number;
    };
  };
  
  // Database
  database: {
    url?: string;
    mongodb?: string;
    redis?: string;
    elasticsearch?: string;
  };
  
  // Security
  security: {
    jwtSecret?: string;
    jwtExpiresIn: string;
    encryptionKey?: string;
    corsOrigin: string;
    allowedHosts: string[];
  };
  
  // ML Services
  ml: {
    huggingfaceApiKey?: string;
    openaiApiKey?: string;
    modelCacheSize: number;
    maxBatchSize: number;
    timeout: number;
  };
  
  // Storage
  storage: {
    provider: string;
    bucket?: string;
    region?: string;
    credentials: {
      accessKeyId?: string;
      secretAccessKey?: string;
    };
  };
  
  // Monitoring
  monitoring: {
    logLevel: string;
    logFormat: string;
    enableMetrics: boolean;
    metricsPort: number;
    sentryDsn?: string;
  };
  
  // Features
  features: {
    analytics: boolean;
    caching: boolean;
    compression: boolean;
    httpsOnly: boolean;
    apiDocs: boolean;
  };
  
  // Performance
  performance: {
    maxRequestSize: number;
    maxUploadSize: number;
    cacheTtl: number;
    sessionTimeout: number;
  };
  
  // External Services
  external: {
    webhookSecret?: string;
    notificationEmail?: string;
    slackWebhookUrl?: string;
  };
  
  // Development
  development: {
    debug: boolean;
    mockServices: boolean;
    hotReload: boolean;
  };
}

// Enterprise Configuration Manager
export class EnterpriseConfigManager {
  private static instance: EnterpriseConfigManager;
  
  private config: Map<string, ConfigEntry> = new Map();
  private watchers: Map<string, Set<ConfigWatcher>> = new Map();
  private secretKeys = new Set<string>();
  private isInitialized = false;
  private hotReloadEnabled = true;
  private configSources: ConfigSource[] = [
    ConfigSource.ENVIRONMENT,
    ConfigSource.FILE,
    ConfigSource.REMOTE,
  ];
  
  private constructor() {}
  
  static getInstance(): EnterpriseConfigManager {
    if (!EnterpriseConfigManager.instance) {
      EnterpriseConfigManager.instance = new EnterpriseConfigManager();
    }
    return EnterpriseConfigManager.instance;
  }
  
  // Initialize configuration manager
  async initialize(options: {
    validateEnvironment?: boolean;
    loadFromFile?: boolean;
    configFilePath?: string;
    enableHotReload?: boolean;
    remoteConfigUrl?: string;
  } = {}): Promise<void> {
    const {
      validateEnvironment = true,
      loadFromFile = true,
      configFilePath = '.env',
      enableHotReload = true,
      remoteConfigUrl,
    } = options;
    
    try {
      // Load environment variables
      if (validateEnvironment) {
        await this.loadEnvironmentConfig();
      }
      
      // Load from file
      if (loadFromFile) {
        await this.loadFileConfig(configFilePath);
      }
      
      // Load from remote source
      if (remoteConfigUrl) {
        await this.loadRemoteConfig(remoteConfigUrl);
      }
      
      // Enable hot reloading
      this.hotReloadEnabled = enableHotReload;
      if (enableHotReload && loadFromFile) {
        this.setupHotReload(configFilePath);
      }
      
      this.isInitialized = true;
      console.log(`✅ Configuration manager initialized with ${this.config.size} entries`);
      
    } catch (error) {
      console.error('❌ Failed to initialize configuration manager:', error);
      throw error;
    }
  }
  
  // Get configuration value
  get<T = unknown>(key: string, defaultValue?: T): T {
    const entry = this.config.get(key);
    
    if (!entry) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Configuration key '${key}' not found`);
    }
    
    return entry.value as T;
  }
  
  // Get configuration value safely
  getSafe<T = unknown>(key: string, defaultValue?: T): T | undefined {
    try {
      return this.get<T>(key, defaultValue);
    } catch {
      return defaultValue;
    }
  }
  
  // Set configuration value
  set<T = unknown>(
    key: string,
    value: T,
    options: {
      source?: ConfigSource;
      sensitive?: boolean;
      description?: string;
      validation?: z.ZodSchema<T>;
      notify?: boolean;
    } = {}
  ): void {
    const {
      source = ConfigSource.OVERRIDE,
      sensitive = false,
      description,
      validation,
      notify = true,
    } = options;
    
    const oldEntry = this.config.get(key);
    const oldValue = oldEntry?.value;
    
    // Validate if schema provided
    if (validation) {
      try {
        value = ValidationUtils.validate(validation, value);
      } catch (error) {
        throw new Error(`Invalid value for config key '${key}': ${error.message}`);
      }
    }
    
    // Mark as sensitive if needed
    if (sensitive) {
      this.secretKeys.add(key);
    }
    
    const entry: ConfigEntry<T> = {
      key,
      value,
      source,
      sensitive,
      description,
      lastModified: new Date(),
      validation,
    };
    
    this.config.set(key, entry);
    
    // Notify watchers
    if (notify && (oldValue !== value)) {
      this.notifyWatchers(key, {
        key,
        oldValue,
        newValue: value,
        source,
        timestamp: new Date(),
      });
    }
  }
  
  // Check if key exists
  has(key: string): boolean {
    return this.config.has(key);
  }
  
  // Delete configuration key
  delete(key: string, notify = true): boolean {
    const entry = this.config.get(key);
    const deleted = this.config.delete(key);
    
    if (deleted && notify && entry) {
      this.notifyWatchers(key, {
        key,
        oldValue: entry.value,
        newValue: undefined as any,
        source: ConfigSource.OVERRIDE,
        timestamp: new Date(),
      });
    }
    
    return deleted;
  }
  
  // Get all configuration keys
  keys(): string[] {
    return Array.from(this.config.keys());
  }
  
  // Get configuration entries by source
  getBySource(source: ConfigSource): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const [key, entry] of this.config) {
      if (entry.source === source) {
        result[key] = entry.sensitive ? '[REDACTED]' : entry.value;
      }
    }
    
    return result;
  }
  
  // Get configuration summary
  getSummary(): {
    total: number;
    bySource: Record<ConfigSource, number>;
    sensitive: number;
    lastModified: Date;
  } {
    const bySource: Record<ConfigSource, number> = {
      [ConfigSource.ENVIRONMENT]: 0,
      [ConfigSource.FILE]: 0,
      [ConfigSource.REMOTE]: 0,
      [ConfigSource.OVERRIDE]: 0,
      [ConfigSource.DEFAULT]: 0,
    };
    
    let sensitive = 0;
    let lastModified = new Date(0);
    
    for (const entry of this.config.values()) {
      bySource[entry.source]++;
      if (entry.sensitive) sensitive++;
      if (entry.lastModified > lastModified) {
        lastModified = entry.lastModified;
      }
    }
    
    return {
      total: this.config.size,
      bySource,
      sensitive,
      lastModified,
    };
  }
  
  // Watch for configuration changes
  watch<T = unknown>(key: string, callback: ConfigWatcher<T>): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    
    const keyWatchers = this.watchers.get(key)!;
    keyWatchers.add(callback as ConfigWatcher);
    
    // Return unwatch function
    return () => {
      keyWatchers.delete(callback as ConfigWatcher);
      if (keyWatchers.size === 0) {
        this.watchers.delete(key);
      }
    };
  }
  
  // Watch for any configuration change
  watchAll(callback: ConfigWatcher): () => void {
    return this.watch('*', callback);
  }
  
  // Get typed configuration object
  getTypedConfig(): AppConfig {
    return {
      nodeEnv: this.get('NODE_ENV'),
      appName: this.get('APP_NAME'),
      appVersion: this.get('APP_VERSION'),
      port: this.get('PORT'),
      host: this.get('HOST'),
      
      api: {
        baseUrl: this.get('API_BASE_URL'),
        timeout: this.get('API_TIMEOUT'),
        rateLimit: {
          requests: this.get('API_RATE_LIMIT_REQUESTS'),
          window: this.get('API_RATE_LIMIT_WINDOW'),
        },
      },
      
      database: {
        url: this.getSafe('DATABASE_URL'),
        mongodb: this.getSafe('MONGODB_URI'),
        redis: this.getSafe('REDIS_URL'),
        elasticsearch: this.getSafe('ELASTICSEARCH_URL'),
      },
      
      security: {
        jwtSecret: this.getSafe('JWT_SECRET'),
        jwtExpiresIn: this.get('JWT_EXPIRES_IN'),
        encryptionKey: this.getSafe('ENCRYPTION_KEY'),
        corsOrigin: this.get('CORS_ORIGIN'),
        allowedHosts: this.get('ALLOWED_HOSTS').split(','),
      },
      
      ml: {
        huggingfaceApiKey: this.getSafe('HUGGINGFACE_API_KEY'),
        openaiApiKey: this.getSafe('OPENAI_API_KEY'),
        modelCacheSize: this.get('ML_MODEL_CACHE_SIZE'),
        maxBatchSize: this.get('ML_MAX_BATCH_SIZE'),
        timeout: this.get('ML_TIMEOUT'),
      },
      
      storage: {
        provider: this.get('STORAGE_PROVIDER'),
        bucket: this.getSafe('STORAGE_BUCKET'),
        region: this.getSafe('STORAGE_REGION'),
        credentials: {
          accessKeyId: this.getSafe('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.getSafe('AWS_SECRET_ACCESS_KEY'),
        },
      },
      
      monitoring: {
        logLevel: this.get('LOG_LEVEL'),
        logFormat: this.get('LOG_FORMAT'),
        enableMetrics: this.get('ENABLE_METRICS'),
        metricsPort: this.get('METRICS_PORT'),
        sentryDsn: this.getSafe('SENTRY_DSN'),
      },
      
      features: {
        analytics: this.get('ENABLE_ANALYTICS'),
        caching: this.get('ENABLE_CACHING'),
        compression: this.get('ENABLE_COMPRESSION'),
        httpsOnly: this.get('ENABLE_HTTPS_ONLY'),
        apiDocs: this.get('ENABLE_API_DOCS'),
      },
      
      performance: {
        maxRequestSize: this.get('MAX_REQUEST_SIZE'),
        maxUploadSize: this.get('MAX_UPLOAD_SIZE'),
        cacheTtl: this.get('CACHE_TTL'),
        sessionTimeout: this.get('SESSION_TIMEOUT'),
      },
      
      external: {
        webhookSecret: this.getSafe('WEBHOOK_SECRET'),
        notificationEmail: this.getSafe('NOTIFICATION_EMAIL'),
        slackWebhookUrl: this.getSafe('SLACK_WEBHOOK_URL'),
      },
      
      development: {
        debug: this.get('DEBUG'),
        mockServices: this.get('MOCK_SERVICES'),
        hotReload: this.get('HOT_RELOAD'),
      },
    };
  }
  
  // Private methods
  
  private async loadEnvironmentConfig(): Promise<void> {
    try {
      const envVars = ValidationUtils.validate(EnvironmentSchema, process.env);
      
      for (const [key, value] of Object.entries(envVars)) {
        const sensitive = this.isSensitiveKey(key);
        this.set(key, value, {
          source: ConfigSource.ENVIRONMENT,
          sensitive,
          notify: false,
        });
      }
      
      console.log(`📊 Loaded ${Object.keys(envVars).length} environment variables`);
      
    } catch (error) {
      throw new Error(`Environment validation failed: ${error.message}`);
    }
  }
  
  private async loadFileConfig(filePath: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Skip file loading on client side
        return;
      }
      
      const fs = await import('fs');
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Configuration file '${filePath}' not found, skipping`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('/n');
      let loaded = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const [key, ...valueParts] = trimmed.split('=');
        if (!key || valueParts.length === 0) continue;
        
        const value = valueParts.join('=').replace(/^["'](.*)["']$/, '$1');
        const sensitive = this.isSensitiveKey(key);
        
        // Don't override environment variables
        if (!this.has(key)) {
          this.set(key, value, {
            source: ConfigSource.FILE,
            sensitive,
            notify: false,
          });
          loaded++;
        }
      }
      
      console.log(`📁 Loaded ${loaded} configuration entries from '${filePath}'`);
      
    } catch (error) {
      console.warn(`⚠️  Failed to load file config from '${filePath}':`, error.message);
    }
  }
  
  private async loadRemoteConfig(url: string): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': `${this.get('APP_NAME', 'phantom-ml-studio')}/${this.get('APP_VERSION', '1.0.0')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const remoteConfig = await response.json();
      let loaded = 0;
      
      for (const [key, value] of Object.entries(remoteConfig)) {
        const sensitive = this.isSensitiveKey(key);
        
        // Don't override local configuration
        if (!this.has(key)) {
          this.set(key, value, {
            source: ConfigSource.REMOTE,
            sensitive,
            notify: false,
          });
          loaded++;
        }
      }
      
      console.log(`🌐 Loaded ${loaded} configuration entries from remote source`);
      
    } catch (error) {
      console.warn(`⚠️  Failed to load remote config from '${url}':`, error.message);
    }
  }
  
  private setupHotReload(filePath: string): void {
    if (typeof window !== 'undefined') {
      // Skip hot reload on client side
      return;
    }
    
    try {
      const fs = require('fs');
      
      fs.watchFile(filePath, { interval: 1000 }, async () => {
        try {
          console.log(`🔄 Configuration file changed, reloading...`);
          await this.loadFileConfig(filePath);
        } catch (error) {
          console.error(`❌ Failed to reload configuration:`, error);
        }
      });
      
      console.log(`👁️  Watching '${filePath}' for changes`);
      
    } catch (error) {
      console.warn(`⚠️  Failed to setup hot reload:`, error.message);
    }
  }
  
  private isSensitiveKey(key: string): boolean {
    const sensitivePatterns = [
      /secret/i,
      /password/i,
      /token/i,
      /key$/i,
      /^api_key/i,
      /credential/i,
      /private/i,
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(key));
  }
  
  private async notifyWatchers<T>(key: string, event: ConfigChangeEvent<T>): Promise<void> {
    const keyWatchers = this.watchers.get(key) || new Set();
    const globalWatchers = this.watchers.get('*') || new Set();
    const allWatchers = new Set([...keyWatchers, ...globalWatchers]);
    
    const notifications = Array.from(allWatchers).map(async (watcher) => {
      try {
        await watcher(event);
      } catch (error) {
        console.error(`Configuration watcher failed for key '${key}':`, error);
      }
    });
    
    await Promise.allSettled(notifications);
  }
}

// Export singleton instance
export const config = EnterpriseConfigManager.getInstance();

// Utility functions
export const ConfigUtils = {
  // Parse environment variable with type coercion
  parseEnv<T>(key: string, defaultValue: T, parser: (value: string) => T = (v) => v as unknown as T): T {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    
    try {
      return parser(value);
    } catch (error) {
      console.warn(`Failed to parse environment variable '${key}':`, error);
      return defaultValue;
    }
  },
  
  // Parse boolean environment variable
  parseBool(key: string, defaultValue = false): boolean {
    return ConfigUtils.parseEnv(key, defaultValue, (value) => {
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    });
  },
  
  // Parse number environment variable
  parseNumber(key: string, defaultValue = 0): number {
    return ConfigUtils.parseEnv(key, defaultValue, (value) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
    });
  },
  
  // Parse JSON environment variable
  parseJSON<T>(key: string, defaultValue: T): T {
    return ConfigUtils.parseEnv(key, defaultValue, (value) => {
      return JSON.parse(value);
    });
  },
  
  // Get configuration with validation
  getValidated<T>(key: string, schema: z.ZodSchema<T>, defaultValue?: T): T {
    const value = config.get(key, defaultValue);
    return ValidationUtils.validate(schema, value);
  },
};

// Initialize configuration on module load
if (typeof window === 'undefined') {
  // Server-side initialization
  config.initialize().catch((error) => {
    console.error('Failed to initialize configuration:', error);
  });
}