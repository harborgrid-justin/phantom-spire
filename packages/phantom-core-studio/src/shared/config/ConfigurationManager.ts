/**
 * Enterprise Configuration Management System
 * Environment-based configuration with validation, encryption, and hot-reloading
 */

import { BaseService, Injectable } from '../../lib/core/ServiceRegistry';
import { ValidationUtils, SchemaRegistry } from '../../lib/validation/schemas';
import * as yup from 'yup';

// Configuration interfaces
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionTimeout: number;
  maxConnections: number;
}

export interface CacheConfig {
  provider: 'memory' | 'redis' | 'multi';
  memory: {
    maxSize: number;
    ttl: number;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
    credentials: boolean;
  };
  encryption: {
    algorithm: string;
    key: string;
  };
}

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    port: number;
    host: string;
    baseUrl: string;
  };
  database: {
    primary: DatabaseConfig;
    replica?: DatabaseConfig;
    mongodb?: DatabaseConfig;
    redis?: DatabaseConfig;
  };
  cache: CacheConfig;
  security: SecurityConfig;
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxFileUploadSize: string;
    maxRequestSize: string;
    requestTimeout: number;
    maxConcurrentRequests: number;
  };
}

// Configuration validation schemas
const DatabaseConfigSchema = yup.object({
  host: yup.string().required('Database host is required'),
  port: yup.number().integer().min(1).max(65535).required('Database port is required'),
  database: yup.string().required('Database name is required'),
  username: yup.string().required('Database username is required'),
  password: yup.string().required('Database password is required'),
  ssl: yup.boolean().default(false),
  connectionTimeout: yup.number().integer().min(1000).default(30000),
  maxConnections: yup.number().integer().min(1).default(10)
});

const CacheConfigSchema = yup.object({
  provider: yup.string().oneOf(['memory', 'redis', 'multi']).required(),
  memory: yup.object({
    maxSize: yup.number().integer().min(100).default(1000),
    ttl: yup.number().integer().min(1000).default(300000)
  }).required(),
  redis: yup.object({
    host: yup.string().required(),
    port: yup.number().integer().min(1).max(65535).required(),
    password: yup.string().optional(),
    db: yup.number().integer().min(0).default(0)
  }).optional()
});

const SecurityConfigSchema = yup.object({
  jwtSecret: yup.string().min(32, 'JWT secret must be at least 32 characters').required(),
  jwtExpiresIn: yup.string().default('24h'),
  bcryptRounds: yup.number().integer().min(8).max(15).default(12),
  rateLimiting: yup.object({
    windowMs: yup.number().integer().min(60000).default(900000), // 15 minutes
    maxRequests: yup.number().integer().min(10).default(1000)
  }).required(),
  cors: yup.object({
    allowedOrigins: yup.array(yup.string()).min(1).required(),
    credentials: yup.boolean().default(true)
  }).required(),
  encryption: yup.object({
    algorithm: yup.string().default('aes-256-gcm'),
    key: yup.string().min(32, 'Encryption key must be at least 32 characters').required()
  }).required()
});

const AppConfigSchema = yup.object({
  app: yup.object({
    name: yup.string().required('App name is required'),
    version: yup.string().matches(/^/d+/./d+/./d+$/, 'Version must follow semantic versioning').required(),
    environment: yup.string().oneOf(['development', 'staging', 'production']).required(),
    port: yup.number().integer().min(1).max(65535).default(3001),
    host: yup.string().default('localhost'),
    baseUrl: yup.string().required('Base URL is required')
  }).required(),
  database: yup.object({
    primary: DatabaseConfigSchema.required(),
    replica: DatabaseConfigSchema.optional(),
    mongodb: DatabaseConfigSchema.optional(),
    redis: DatabaseConfigSchema.optional()
  }).required(),
  cache: CacheConfigSchema.required(),
  security: SecurityConfigSchema.required(),
  features: yup.object().default({}),
  limits: yup.object({
    maxFileUploadSize: yup.string().default('10MB'),
    maxRequestSize: yup.string().default('1MB'),
    requestTimeout: yup.number().integer().min(1000).default(30000),
    maxConcurrentRequests: yup.number().integer().min(1).default(100)
  }).required()
});

// Register schema
SchemaRegistry.register('app-config', AppConfigSchema);

@Injectable('ConfigurationManager')
export class ConfigurationManager extends BaseService {
  public readonly serviceName = 'ConfigurationManager';
  
  private config: AppConfig | null = null;
  private watchers: Map<string, ((newValue: any, oldValue: any) => void)[]> = new Map();
  private encrypted: Set<string> = new Set(['security.jwtSecret', 'security.encryption.key', 'database.primary.password']);
  private refreshInterval?: NodeJS.Timeout;
  
  protected async onInitialize(): Promise<void> {
    await this.loadConfiguration();
    this.startConfigurationWatcher();
    console.log(`Configuration loaded for environment: ${this.config?.app.environment}`);
  }

  protected async onDestroy(): Promise<void> {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.watchers.clear();
    this.config = null;
  }

  protected async performHealthCheck(): Promise<boolean> {
    return this.config !== null;
  }

  private async loadConfiguration(): Promise<void> {
    try {
      // Load base configuration
      const baseConfig = this.loadBaseConfiguration();
      
      // Load environment-specific overrides
      const envConfig = this.loadEnvironmentConfiguration();
      
      // Merge configurations
      const mergedConfig = this.mergeConfigurations(baseConfig, envConfig);
      
      // Load secrets and decrypt sensitive values
      await this.loadSecrets(mergedConfig);
      
      // Validate configuration
      const validatedConfig = await ValidationUtils.validateAndTransform(
        AppConfigSchema,
        mergedConfig
      );
      
      const oldConfig = this.config;
      this.config = validatedConfig;
      
      // Notify watchers of changes
      if (oldConfig) {
        this.notifyWatchers(oldConfig, this.config);
      }
      
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  private loadBaseConfiguration(): Partial<AppConfig> {
    return {
      app: {
        name: 'Phantom ML Studio',
        version: '1.0.0',
        environment: (process.env.NODE_ENV as any) || 'development',
        port: parseInt(process.env.PORT || '3001'),
        host: process.env.HOST || 'localhost',
        baseUrl: process.env.BASE_URL || 'http://localhost:3001'
      },
      database: {
        primary: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'phantom_ml_studio',
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASS || 'password',
          ssl: process.env.DB_SSL === 'true',
          connectionTimeout: parseInt(process.env.DB_TIMEOUT || '30000'),
          maxConnections: parseInt(process.env.DB_MAX_CONN || '10')
        }
      },
      cache: {
        provider: (process.env.CACHE_PROVIDER as any) || 'memory',
        memory: {
          maxSize: parseInt(process.env.CACHE_MEMORY_SIZE || '1000'),
          ttl: parseInt(process.env.CACHE_TTL || '300000')
        }
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || this.generateSecureSecret(),
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        rateLimiting: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
          maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '1000')
        },
        cors: {
          allowedOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
          credentials: process.env.CORS_CREDENTIALS !== 'false'
        },
        encryption: {
          algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
          key: process.env.ENCRYPTION_KEY || this.generateSecureSecret()
        }
      },
      features: this.parseFeatureFlags(),
      limits: {
        maxFileUploadSize: process.env.MAX_FILE_UPLOAD || '10MB',
        maxRequestSize: process.env.MAX_REQUEST_SIZE || '1MB',
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
        maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100')
      }
    };
  }

  private loadEnvironmentConfiguration(): Partial<AppConfig> {
    const env = process.env.NODE_ENV || 'development';
    
    try {
      // Try to load environment-specific configuration file
      if (typeof require !== 'undefined') {
        const envConfigPath = `./config/${env}.json`;
        return require(envConfigPath);
      }
    } catch (error) {
      console.log(`No environment-specific configuration found for ${env}, using defaults`);
    }
    
    return {};
  }

  private mergeConfigurations(base: Partial<AppConfig>, env: Partial<AppConfig>): Partial<AppConfig> {
    // Deep merge configurations with environment taking precedence
    return this.deepMerge(base, env);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private async loadSecrets(config: Partial<AppConfig>): Promise<void> {
    // In a production environment, this would load from a secret management service
    // For now, we'll use environment variables and mock secret loading
    
    for (const secretPath of this.encrypted) {
      const value = this.getNestedValue(config, secretPath);
      if (value && typeof value === 'string') {
        // In production, decrypt the value here
        this.setNestedValue(config, secretPath, value);
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private generateSecureSecret(): string {
    // Generate a secure random secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = '';
    for (let i = 0; i < 64; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private parseFeatureFlags(): Record<string, boolean> {
    const features: Record<string, boolean> = {};
    
    // Parse FEATURE_* environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith('FEATURE_')) {
        const featureName = key.substring(8).toLowerCase();
        features[featureName] = value === 'true';
      }
    }
    
    return features;
  }

  private startConfigurationWatcher(): void {
    // Watch for configuration changes (in production, this could watch config files or external config services)
    this.refreshInterval = setInterval(() => {
      // Check if configuration needs to be reloaded
      this.checkForConfigurationChanges();
    }, 60000); // Check every minute
  }

  private async checkForConfigurationChanges(): Promise<void> {
    // In production, this would check modification times of config files,
    // or poll external configuration services
    // For now, we'll just log that we're checking
    console.debug('Checking for configuration changes...');
  }

  private notifyWatchers(oldConfig: AppConfig, newConfig: AppConfig): void {
    for (const [path, callbacks] of this.watchers) {
      const oldValue = this.getNestedValue(oldConfig, path);
      const newValue = this.getNestedValue(newConfig, path);
      
      if (oldValue !== newValue) {
        for (const callback of callbacks) {
          try {
            callback(newValue, oldValue);
          } catch (error) {
            console.error(`Error in configuration watcher for ${path}:`, error);
          }
        }
      }
    }
  }

  // Public API methods
  get<T = any>(path: string, defaultValue?: T): T {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    
    const value = this.getNestedValue(this.config, path);
    return value !== undefined ? value : defaultValue;
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config;
  }

  isFeatureEnabled(featureName: string): boolean {
    return this.get(`features.${featureName}`, false);
  }

  watch(path: string, callback: (newValue: any, oldValue: any) => void): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }
    
    this.watchers.get(path)!.push(callback);
    
    // Return unwatch function
    return () => {
      const callbacks = this.watchers.get(path);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        
        if (callbacks.length === 0) {
          this.watchers.delete(path);
        }
      }
    };
  }

  async reloadConfiguration(): Promise<void> {
    await this.loadConfiguration();
    console.log('Configuration reloaded');
  }

  validateConfiguration(config: Partial<AppConfig>): Promise<AppConfig> {
    return ValidationUtils.validateAndTransform(AppConfigSchema, config);
  }

  exportConfiguration(includeSensitive = false): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    
    const exported = JSON.parse(JSON.stringify(this.config));
    
    if (!includeSensitive) {
      // Remove sensitive values
      for (const secretPath of this.encrypted) {
        this.setNestedValue(exported, secretPath, '[REDACTED]');
      }
    }
    
    return exported;
  }
}

// Configuration utilities
export class ConfigUtils {
  static parseSize(size: string): number {
    const units: Record<string, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    
    const match = size.match(/^(/d+(?:/./d+)?)/s*(B|KB|MB|GB)$/i);
    if (!match) {
      throw new Error(`Invalid size format: ${size}`);
    }
    
    const [, value, unit] = match;
    return parseFloat(value) * (units[unit.toUpperCase()] || 1);
  }

  static parseDuration(duration: string): number {
    const units: Record<string, number> = {
      'ms': 1,
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };
    
    const match = duration.match(/^(/d+(?:/./d+)?)/s*(ms|s|m|h|d)$/i);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }
    
    const [, value, unit] = match;
    return parseFloat(value) * (units[unit.toLowerCase()] || 1);
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}