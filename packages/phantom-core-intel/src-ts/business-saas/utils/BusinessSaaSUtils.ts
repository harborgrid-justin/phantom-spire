/**
 * Business SaaS Utilities
 * Helper functions and utilities for the Business SaaS extension
 */

import { IBusinessSaaSConfig, IQuotaConfig, IFeatureConfig } from '../config/BusinessSaaSConfig.js';
import { IBusinessSaaSQuery, IBusinessSaaSResult } from '../types/BusinessSaaSTypes.js';

export class BusinessSaaSUtils {
  /**
   * Validate Business SaaS configuration
   */
  static validateConfig(config: IBusinessSaaSConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate tenant ID
    if (!config.tenantId || config.tenantId.trim() === '') {
      errors.push('Tenant ID is required');
    }

    // Validate data store configuration
    if (!config.dataStore) {
      errors.push('Data store configuration is required');
    } else {
      const dataStoreCount = Object.keys(config.dataStore).length;
      if (dataStoreCount === 0) {
        errors.push('At least one data store must be configured');
      }

      // Validate MongoDB config if present
      if (config.dataStore.mongodb) {
        if (!config.dataStore.mongodb.uri) {
          errors.push('MongoDB URI is required');
        }
        if (!config.dataStore.mongodb.database) {
          errors.push('MongoDB database name is required');
        }
      }

      // Validate PostgreSQL config if present
      if (config.dataStore.postgresql) {
        if (!config.dataStore.postgresql.connectionString) {
          errors.push('PostgreSQL connection string is required');
        }
      }

      // Validate Redis config if present
      if (config.dataStore.redis) {
        if (!config.dataStore.redis.url) {
          errors.push('Redis URL is required');
        }
      }

      // Validate Elasticsearch config if present
      if (config.dataStore.elasticsearch) {
        if (!config.dataStore.elasticsearch.node) {
          errors.push('Elasticsearch node is required');
        }
      }
    }

    // Validate quotas
    if (config.quotas) {
      if (config.quotas.maxIndicators <= 0) {
        errors.push('Max indicators must be greater than 0');
      }
      if (config.quotas.maxThreatActors <= 0) {
        errors.push('Max threat actors must be greater than 0');
      }
      if (config.quotas.maxApiRequestsPerHour <= 0) {
        errors.push('Max API requests per hour must be greater than 0');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Merge configurations with defaults
   */
  static mergeWithDefaults(config: Partial<IBusinessSaaSConfig>): IBusinessSaaSConfig {
    const defaultConfig: IBusinessSaaSConfig = {
      tenantId: 'default',
      dataStore: {},
      features: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
        ssoIntegration: false,
        auditLogging: true,
        dataExport: true,
        multiTenancy: true,
        workflowAutomation: true,
        threatIntelligenceFeeds: true,
      },
      quotas: {
        maxIndicators: 10000,
        maxThreatActors: 1000,
        maxCampaigns: 500,
        maxReports: 100,
        maxDataSize: 10737418240, // 10GB
        maxApiRequestsPerHour: 1000,
        maxConcurrentUsers: 100,
        maxRetentionDays: 365,
        maxExportSize: 1073741824, // 1GB
      },
    };

    return this.deepMerge(defaultConfig, config);
  }

  /**
   * Generate tenant-scoped entity ID
   */
  static generateTenantScopedId(tenantId: string, entityType: string, id?: string): string {
    const entityId = id || this.generateId();
    return `${tenantId}:${entityType}:${entityId}`;
  }

  /**
   * Parse tenant-scoped entity ID
   */
  static parseTenantScopedId(scopedId: string): { tenantId: string; entityType: string; id: string } | null {
    const parts = scopedId.split(':');
    if (parts.length !== 3) {
      return null;
    }
    return {
      tenantId: parts[0],
      entityType: parts[1],
      id: parts[2],
    };
  }

  /**
   * Validate query parameters
   */
  static validateQuery(query: IBusinessSaaSQuery): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!query.tenantId || query.tenantId.trim() === '') {
      errors.push('Tenant ID is required in query');
    }

    if (query.pagination) {
      if (query.pagination.page < 1) {
        errors.push('Page number must be greater than 0');
      }
      if (query.pagination.limit < 1 || query.pagination.limit > 1000) {
        errors.push('Limit must be between 1 and 1000');
      }
    }

    if (query.sorting) {
      for (const sort of query.sorting) {
        if (!sort.field || sort.field.trim() === '') {
          errors.push('Sort field cannot be empty');
        }
        if (!['asc', 'desc'].includes(sort.direction)) {
          errors.push('Sort direction must be "asc" or "desc"');
        }
      }
    }

    if (query.dateRange) {
      if (query.dateRange.start >= query.dateRange.end) {
        errors.push('Date range start must be before end');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Sanitize query for security
   */
  static sanitizeQuery(query: IBusinessSaaSQuery): IBusinessSaaSQuery {
    const sanitized = { ...query };

    // Remove potentially dangerous fields from filters
    if (sanitized.filters) {
      const dangerousFields = ['$where', '$expr', '$function', 'eval', 'script'];
      for (const field of dangerousFields) {
        delete sanitized.filters[field];
      }
    }

    // Limit projection to prevent data exposure
    if (sanitized.projection && sanitized.projection.length > 50) {
      sanitized.projection = sanitized.projection.slice(0, 50);
    }

    // Sanitize search text
    if (sanitized.searchText) {
      sanitized.searchText = sanitized.searchText
        .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
        .trim()
        .substring(0, 500); // Limit length
    }

    return sanitized;
  }

  /**
   * Calculate quota usage percentage
   */
  static calculateQuotaUsage(current: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min(100, (current / limit) * 100);
  }

  /**
   * Check if quota is near limit
   */
  static isQuotaNearLimit(current: number, limit: number, threshold: number = 80): boolean {
    const usage = this.calculateQuotaUsage(current, limit);
    return usage >= threshold;
  }

  /**
   * Format data size in human-readable format
   */
  static formatDataSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Generate cache key for tenant data
   */
  static generateCacheKey(tenantId: string, entityType: string, identifier: string): string {
    return `business-saas:${tenantId}:${entityType}:${identifier}`;
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse<T>(error: string, code?: string): IBusinessSaaSResult<T> {
    return {
      success: false,
      data: [],
      total: 0,
      hasMore: false,
      error,
      metadata: {
        queryTime: 0,
        cacheHit: false,
        dataSource: [],
        tenantId: '',
      },
    };
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse<T>(
    data: T[],
    total: number,
    hasMore: boolean,
    metadata?: any
  ): IBusinessSaaSResult<T> {
    return {
      success: true,
      data,
      total,
      hasMore,
      metadata: {
        queryTime: 0,
        cacheHit: false,
        dataSource: [],
        tenantId: '',
        ...metadata,
      },
    };
  }

  /**
   * Extract entity IDs from result data
   */
  static extractEntityIds<T extends { id: string }>(result: IBusinessSaaSResult<T>): string[] {
    return result.data.map(item => item.id);
  }

  /**
   * Group results by field
   */
  static groupResultsByField<T>(
    data: T[],
    field: keyof T
  ): Record<string, T[]> {
    return data.reduce((groups, item) => {
      const key = String(item[field]);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Apply date range filter to data
   */
  static applyDateRangeFilter<T extends { created_at?: Date; updated_at?: Date }>(
    data: T[],
    dateRange: { start: Date; end: Date; field?: string }
  ): T[] {
    const field = dateRange.field || 'created_at';
    return data.filter(item => {
      const date = item[field as keyof T] as Date;
      if (!date) return true; // Include items without date
      return date >= dateRange.start && date <= dateRange.end;
    });
  }

  /**
   * Calculate retention expiry date
   */
  static calculateRetentionExpiry(createdAt: Date, retentionDays: number): Date {
    const expiry = new Date(createdAt);
    expiry.setDate(expiry.getDate() + retentionDays);
    return expiry;
  }

  /**
   * Check if data is expired based on retention policy
   */
  static isDataExpired(createdAt: Date, retentionDays: number): boolean {
    const expiry = this.calculateRetentionExpiry(createdAt, retentionDays);
    return new Date() > expiry;
  }

  /**
   * Mask sensitive data in object
   */
  static maskSensitiveData(obj: any, sensitiveFields: string[] = ['password', 'token', 'key', 'secret']): any {
    if (!obj || typeof obj !== 'object') return obj;

    const masked = { ...obj };
    
    for (const [key, value] of Object.entries(masked)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive && typeof value === 'string') {
        masked[key] = '***';
      } else if (typeof value === 'object') {
        masked[key] = this.maskSensitiveData(value, sensitiveFields);
      }
    }

    return masked;
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix?: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    const id = `${timestamp}-${random}`;
    return prefix ? `${prefix}-${id}` : id;
  }

  /**
   * Deep merge two objects
   */
  static deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue as any;
        }
      }
    }

    return result;
  }

  /**
   * Check if value is a plain object
   */
  static isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), waitMs);
    };
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limitMs: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limitMs);
      }
    };
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    func: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await func();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (i === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Create tenant audit log entry
   */
  static createAuditLogEntry(
    tenantId: string,
    action: string,
    entityType: string,
    entityId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): any {
    return {
      tenantId,
      action,
      entityType,
      entityId,
      userId: userId || 'system',
      timestamp: new Date(),
      metadata: metadata || {},
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}