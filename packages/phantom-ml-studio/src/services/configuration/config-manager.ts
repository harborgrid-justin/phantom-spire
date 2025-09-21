/**
 * Enterprise Configuration Management System
 * Environment-aware configuration with validation and hot-reloading
 * Supports multiple configuration sources with priority hierarchy
 */

import { EventEmitter } from 'events';
import { existsSync, readFileSync, watchFile } from 'fs';
import { resolve, join } from 'path';
import * as process from 'process';

export interface ConfigurationSource {
  name: string;
  priority: number; // Higher priority overrides lower
  type: 'file' | 'environment' | 'remote' | 'database' | 'vault';
  watchable: boolean;
}

export interface ConfigurationValidator<T = any> {
  path: string;
  validator: (value: T) => boolean | string; // true if valid, error message if invalid
  required?: boolean;
  defaultValue?: T;
}

export interface ConfigurationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    defaultValue?: any;
    validators?: ConfigurationValidator[];
    description?: string;
    sensitive?: boolean; // For masking in logs
    environment?: string[]; // Which environments this applies to
  };
}

export interface EnvironmentConfig {
  development: Record<string, any>;
  staging: Record<string, any>;
  production: Record<string, any>;
  test: Record<string, any>;
}

export interface ConfigurationChangeEvent {
  path: string;
  oldValue: any;
  newValue: any;
  source: string;
  timestamp: Date;
}

/**
 * Enterprise configuration manager with validation and hot-reloading
 */
export class EnterpriseConfigurationManager extends EventEmitter {
  private config: Record<string, any> = {};
  private sources: Map<string, ConfigurationSource> = new Map();
  private validators: ConfigurationValidator[] = [];
  private schema?: ConfigurationSchema;
  private environment: string;
  private watchers: Map<string, any> = new Map(); // File watchers
  private frozen = false;

  constructor(
    environment: string = process.env.NODE_ENV || 'development',
    configDir: string = './config'
  ) {
    super();
    this.environment = environment;
    this.registerDefaultSources(configDir);
  }

  /**
   * Register a configuration source
   */
  registerSource(source: ConfigurationSource): void {
    this.sources.set(source.name, source);
    this.emit('source_registered', source);
  }

  /**
   * Set configuration schema for validation
   */
  setSchema(schema: ConfigurationSchema): void {
    this.schema = schema;
    this.validateConfiguration();
  }

  /**
   * Add configuration validator
   */
  addValidator(validator: ConfigurationValidator): void {
    this.validators.push(validator);
  }

  /**
   * Load configuration from all sources
   */
  async loadConfiguration(): Promise<void> {
    const configs: Array<{ source: string; config: Record<string, any>; priority: number }> = [];

    // Load from all sources
    for (const [name, source] of this.sources.entries()) {
      try {
        let sourceConfig: Record<string, any> = {};

        switch (source.type) {
          case 'file':
            sourceConfig = await this.loadFromFile(name);
            break;
          case 'environment':
            sourceConfig = this.loadFromEnvironment();
            break;
          case 'remote':
            sourceConfig = await this.loadFromRemote(name);
            break;
          case 'database':
            sourceConfig = await this.loadFromDatabase(name);
            break;
          case 'vault':
            sourceConfig = await this.loadFromVault(name);
            break;
        }

        if (Object.keys(sourceConfig).length > 0) {
          configs.push({
            source: name,
            config: sourceConfig,
            priority: source.priority
          });
        }

        // Set up watching if supported
        if (source.watchable && !this.frozen) {
          this.setupWatcher(name, source);
        }

      } catch (error) {
        this.emit('source_load_error', {
          source: name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Merge configurations by priority (higher priority wins)
    configs.sort((a, b) => a.priority - b.priority);
    
    for (const { config } of configs) {
      this.config = this.deepMerge(this.config, config);
    }

    // Apply schema defaults
    this.applySchemaDefaults();

    // Validate configuration
    this.validateConfiguration();

    this.emit('configuration_loaded', {
      sources: configs.map(c => c.source),
      environment: this.environment
    });
  }

  /**
   * Get configuration value with type safety
   */
  get<T = any>(path: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.config, path);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set configuration value
   */
  set(path: string, value: any, source: string = 'runtime'): void {
    if (this.frozen) {
      throw new Error('Configuration is frozen and cannot be modified');
    }

    const oldValue = this.get(path);
    this.setNestedValue(this.config, path, value);

    // Validate the change
    this.validatePath(path, value);

    const changeEvent: ConfigurationChangeEvent = {
      path,
      oldValue,
      newValue: value,
      source,
      timestamp: new Date()
    };

    this.emit('configuration_changed', changeEvent);
    this.emit(`configuration_changed:${path}`, changeEvent);
  }

  /**
   * Check if configuration has a value
   */
  has(path: string): boolean {
    return this.getNestedValue(this.config, path) !== undefined;
  }

  /**
   * Get all configuration as immutable copy
   */
  getAll(): Readonly<Record<string, any>> {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Freeze configuration to prevent runtime changes
   */
  freeze(): void {
    this.frozen = true;
    this.stopAllWatchers();
    this.emit('configuration_frozen');
  }

  /**
   * Unfreeze configuration to allow changes
   */
  unfreeze(): void {
    this.frozen = false;
    this.emit('configuration_unfrozen');
  }

  /**
   * Reload configuration from sources
   */
  async reload(): Promise<void> {
    if (this.frozen) {
      throw new Error('Cannot reload frozen configuration');
    }

    const oldConfig = JSON.parse(JSON.stringify(this.config));
    this.config = {};
    
    await this.loadConfiguration();
    
    this.emit('configuration_reloaded', {
      oldConfig,
      newConfig: this.config
    });
  }

  /**
   * Get configuration for specific environment
   */
  getEnvironmentConfig(): Record<string, any> {
    return this.get(`environments.${this.environment}`, {});
  }

  /**
   * Get masked configuration (sensitive values hidden)
   */
  getMaskedConfiguration(): Record<string, any> {
    const masked = JSON.parse(JSON.stringify(this.config));
    
    if (this.schema) {
      for (const [key, schemaItem] of Object.entries(this.schema)) {
        if (schemaItem.sensitive && this.has(key)) {
          this.setNestedValue(masked, key, '***MASKED***');
        }
      }
    }

    // Also mask common sensitive patterns
    const sensitivePatterns = ['password', 'secret', 'key', 'token', 'credential'];
    this.maskSensitiveValues(masked, sensitivePatterns);

    return masked;
  }

  /**
   * Validate entire configuration
   */
  validateConfiguration(): void {
    const errors: string[] = [];

    // Schema validation
    if (this.schema) {
      for (const [path, schemaItem] of Object.entries(this.schema)) {
        const value = this.get(path);
        
        // Check required values
        if (schemaItem.required && (value === undefined || value === null)) {
          // Check if this applies to current environment
          if (!schemaItem.environment || schemaItem.environment.includes(this.environment)) {
            errors.push(`Required configuration '${path}' is missing`);
          }
        }

        // Type validation
        if (value !== undefined) {
          if (!this.validateType(value, schemaItem.type)) {
            errors.push(`Configuration '${path}' must be of type ${schemaItem.type}, got ${typeof value}`);
          }
        }

        // Schema validators
        if (schemaItem.validators) {
          for (const validator of schemaItem.validators) {
            const result = validator.validator(value);
            if (typeof result === 'string') {
              errors.push(`Configuration '${path}': ${result}`);
            }
          }
        }
      }
    }

    // Custom validators
    for (const validator of this.validators) {
      const value = this.get(validator.path);
      const result = validator.validator(value);
      
      if (typeof result === 'string') {
        errors.push(`Configuration '${validator.path}': ${result}`);
      } else if (!result && validator.required && value === undefined) {
        errors.push(`Required configuration '${validator.path}' is missing`);
      }
    }

    if (errors.length > 0) {
      const error = new Error(`Configuration validation failed:\n${errors.join('\n')}`);
      this.emit('validation_error', { errors });
      throw error;
    }

    this.emit('validation_success');
  }

  /**
   * Get configuration health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    sources: Array<{
      name: string;
      status: 'available' | 'unavailable' | 'error';
      lastLoaded?: Date;
      error?: string;
    }>;
    validation: {
      isValid: boolean;
      errors: string[];
    };
    watchers: number;
    frozen: boolean;
    environment: string;
  } {
    const sourceStatuses = Array.from(this.sources.keys()).map(name => ({
      name,
      status: 'available' as const,
      lastLoaded: new Date()
    }));

    let validationErrors: string[] = [];
    let isValid = true;

    try {
      this.validateConfiguration();
    } catch (error) {
      isValid = false;
      if (error instanceof Error) {
        validationErrors = error.message.split('\n').slice(1); // Remove first line
      }
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (!isValid) status = 'critical';
    else if (sourceStatuses.some(s => s.status === 'error')) status = 'warning';

    return {
      status,
      sources: sourceStatuses,
      validation: {
        isValid,
        errors: validationErrors
      },
      watchers: this.watchers.size,
      frozen: this.frozen,
      environment: this.environment
    };
  }

  /**
   * Private methods
   */
  private registerDefaultSources(configDir: string): void {
    // Environment variables (highest priority)
    this.registerSource({
      name: 'environment',
      priority: 100,
      type: 'environment',
      watchable: false
    });

    // Environment-specific config file
    const envConfigPath = join(configDir, `${this.environment}.json`);
    if (existsSync(envConfigPath)) {
      this.registerSource({
        name: `${this.environment}_config`,
        priority: 80,
        type: 'file',
        watchable: true
      });
    }

    // Default config file
    const defaultConfigPath = join(configDir, 'default.json');
    if (existsSync(defaultConfigPath)) {
      this.registerSource({
        name: 'default_config',
        priority: 60,
        type: 'file',
        watchable: true
      });
    }

    // Package.json config section
    const packageJsonPath = './package.json';
    if (existsSync(packageJsonPath)) {
      this.registerSource({
        name: 'package_json',
        priority: 40,
        type: 'file',
        watchable: true
      });
    }
  }

  private async loadFromFile(sourceName: string): Promise<Record<string, any>> {
    let filePath: string;

    switch (sourceName) {
      case 'default_config':
        filePath = resolve('./config/default.json');
        break;
      case `${this.environment}_config`:
        filePath = resolve(`./config/${this.environment}.json`);
        break;
      case 'package_json':
        filePath = resolve('./package.json');
        break;
      default:
        throw new Error(`Unknown file source: ${sourceName}`);
    }

    if (!existsSync(filePath)) {
      return {};
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      
      // For package.json, extract config section
      if (sourceName === 'package_json') {
        return parsed.config || {};
      }
      
      return parsed;
    } catch (error: any) {
      throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
    }
  }

  private loadFromEnvironment(): Record<string, any> {
    const config: Record<string, any> = {};

    // Load all environment variables with specific prefixes
    const prefixes = ['PHANTOM_', 'ML_STUDIO_', 'APP_'];
    
    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined) continue;

      const hasPrefix = prefixes.some(prefix => key.startsWith(prefix));
      if (!hasPrefix) continue;

      // Convert environment variable to config path
      // e.g., PHANTOM_DATABASE_HOST -> database.host
      const configPath = key
        .toLowerCase()
        .replace(/^(phantom_|ml_studio_|app_)/, '')
        .replace(/_/g, '.');

      // Parse value (try JSON, fallback to string)
      let parsedValue: any = value;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(Number(value))) parsedValue = Number(value);
      }

      this.setNestedValue(config, configPath, parsedValue);
    }

    return config;
  }

  private async loadFromRemote(sourceName: string): Promise<Record<string, any>> {
    // Placeholder for remote configuration loading
    // In production, this would fetch from configuration services like:
    // - AWS Parameter Store
    // - Azure App Configuration
    // - Google Cloud Config
    // - Consul KV
    // - etcd
    
    return {};
  }

  private async loadFromDatabase(sourceName: string): Promise<Record<string, any>> {
    // Placeholder for database configuration loading
    // In production, this would query configuration from database
    
    return {};
  }

  private async loadFromVault(sourceName: string): Promise<Record<string, any>> {
    // Placeholder for vault/secrets management integration
    // In production, this would fetch from:
    // - HashiCorp Vault
    // - AWS Secrets Manager
    // - Azure Key Vault
    // - Google Secret Manager
    
    return {};
  }

  private setupWatcher(sourceName: string, source: ConfigurationSource): void {
    if (source.type !== 'file') return;

    let filePath: string;
    switch (sourceName) {
      case 'default_config':
        filePath = resolve('./config/default.json');
        break;
      case `${this.environment}_config`:
        filePath = resolve(`./config/${this.environment}.json`);
        break;
      case 'package_json':
        filePath = resolve('./package.json');
        break;
      default:
        return;
    }

    if (!existsSync(filePath)) return;

    const watcher = watchFile(filePath, { interval: 1000 }, async () => {
      try {
        this.emit('file_changed', { source: sourceName, file: filePath });
        await this.reload();
      } catch (error) {
        this.emit('reload_error', {
          source: sourceName,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

    this.watchers.set(sourceName, watcher);
  }

  private stopAllWatchers(): void {
    for (const [sourceName, watcher] of this.watchers.entries()) {
      if (watcher && typeof watcher.close === 'function') {
        watcher.close();
      }
    }
    this.watchers.clear();
  }

  private applySchemaDefaults(): void {
    if (!this.schema) return;

    for (const [path, schemaItem] of Object.entries(this.schema)) {
      if (schemaItem.defaultValue !== undefined && !this.has(path)) {
        this.setNestedValue(this.config, path, schemaItem.defaultValue);
      }
    }
  }

  private validatePath(path: string, value: any): void {
    if (!this.schema) return;

    const schemaItem = this.schema[path];
    if (!schemaItem) return;

    if (!this.validateType(value, schemaItem.type)) {
      throw new Error(`Configuration '${path}' must be of type ${schemaItem.type}, got ${typeof value}`);
    }

    if (schemaItem.validators) {
      for (const validator of schemaItem.validators) {
        const result = validator.validator(value);
        if (typeof result === 'string') {
          throw new Error(`Configuration '${path}': ${result}`);
        }
      }
    }
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined || current[key] === null) {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private maskSensitiveValues(obj: any, sensitivePatterns: string[]): void {
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitivePatterns.some(pattern => lowerKey.includes(pattern));
      
      if (isSensitive && typeof value === 'string') {
        obj[key] = '***MASKED***';
      } else if (typeof value === 'object' && value !== null) {
        this.maskSensitiveValues(value, sensitivePatterns);
      }
    }
  }
}

/**
 * Default configuration schema for phantom-ml-studio
 */
export const defaultConfigurationSchema: ConfigurationSchema = {
  'app.name': {
    type: 'string',
    required: true,
    defaultValue: 'phantom-ml-studio',
    description: 'Application name'
  },
  'app.version': {
    type: 'string',
    required: true,
    description: 'Application version'
  },
  'app.environment': {
    type: 'string',
    required: true,
    defaultValue: 'development',
    validators: [{
      path: 'app.environment',
      validator: (value) => ['development', 'staging', 'production', 'test'].includes(value) || 'Must be one of: development, staging, production, test'
    }],
    description: 'Runtime environment'
  },
  'server.port': {
    type: 'number',
    required: true,
    defaultValue: 3000,
    validators: [{
      path: 'server.port',
      validator: (value) => (value >= 1024 && value <= 65535) || 'Port must be between 1024 and 65535'
    }],
    description: 'Server port number'
  },
  'server.host': {
    type: 'string',
    required: true,
    defaultValue: 'localhost',
    description: 'Server host address'
  },
  'database.url': {
    type: 'string',
    required: true,
    sensitive: true,
    description: 'Database connection URL'
  },
  'security.jwtSecret': {
    type: 'string',
    required: true,
    sensitive: true,
    environment: ['staging', 'production'],
    validators: [{
      path: 'security.jwtSecret',
      validator: (value) => (typeof value === 'string' && value.length >= 32) || 'JWT secret must be at least 32 characters'
    }],
    description: 'JWT signing secret'
  },
  'ml.gpu.enabled': {
    type: 'boolean',
    defaultValue: false,
    description: 'Enable GPU acceleration for ML operations'
  },
  'monitoring.enabled': {
    type: 'boolean',
    defaultValue: true,
    description: 'Enable system monitoring'
  },
  'cache.enabled': {
    type: 'boolean',
    defaultValue: true,
    description: 'Enable caching system'
  },
  'cache.redis.url': {
    type: 'string',
    sensitive: true,
    description: 'Redis connection URL for caching'
  }
};

/**
 * Factory function
 */
export function createConfigurationManager(
  environment?: string,
  configDir?: string
): EnterpriseConfigurationManager {
  return new EnterpriseConfigurationManager(environment, configDir);
}

/**
 * Global configuration instance
 */
export const configManager = createConfigurationManager();

// Apply default schema
configManager.setSchema(defaultConfigurationSchema);