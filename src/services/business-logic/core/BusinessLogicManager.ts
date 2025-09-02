/**
 * Unified Business Logic Manager
 * Central hub for managing interactive business logic across all service pages
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessLogicRequest {
  id: string;
  serviceId: string;
  operation: string;
  payload: any;
  userId?: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface BusinessLogicResponse {
  id: string;
  requestId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
  processingTime: number;
  metadata?: Record<string, any>;
}

export interface BusinessRule {
  id: string;
  serviceId: string;
  operation: string;
  validator: (request: BusinessLogicRequest) => Promise<ValidationResult>;
  processor: (request: BusinessLogicRequest) => Promise<any>;
  enabled: boolean;
  priority: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}

export interface ServiceConfiguration {
  id: string;
  name: string;
  enabled: boolean;
  realTimeUpdates: boolean;
  validationRules: BusinessRule[];
  cacheConfig?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  rateLimiting?: {
    enabled: boolean;
    requestsPerMinute: number;
  };
}

export class BusinessLogicManager extends EventEmitter {
  private static instance: BusinessLogicManager;
  private services: Map<string, ServiceConfiguration> = new Map();
  private businessRules: Map<string, BusinessRule[]> = new Map();
  private activeRequests: Map<string, BusinessLogicRequest> = new Map();
  private requestHistory: BusinessLogicRequest[] = [];
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();

  private constructor() {
    super();
    this.initializeDefaultServices();
    this.setupRequestProcessing();
  }

  public static getInstance(): BusinessLogicManager {
    if (!BusinessLogicManager.instance) {
      BusinessLogicManager.instance = new BusinessLogicManager();
    }
    return BusinessLogicManager.instance;
  }

  /**
   * Register a service with business logic capabilities
   */
  public registerService(config: ServiceConfiguration): void {
    this.services.set(config.id, config);
    this.businessRules.set(config.id, config.validationRules || []);
    
    this.emit('service:registered', { serviceId: config.id, config });
    console.log(`🔧 Business Logic Manager: Registered service ${config.id}`);
  }

  /**
   * Process a business logic request
   */
  public async processRequest(request: BusinessLogicRequest): Promise<BusinessLogicResponse> {
    const startTime = Date.now();
    
    try {
      // Add to active requests
      this.activeRequests.set(request.id, request);
      
      // Check cache first
      const cacheKey = `${request.serviceId}:${request.operation}:${JSON.stringify(request.payload)}`;
      const cachedResult = this.getCachedResult(cacheKey);
      
      if (cachedResult) {
        this.emit('request:cache-hit', { request, cachedResult });
        return this.createResponse(request, true, cachedResult, startTime);
      }

      // Validate request
      const validationResult = await this.validateRequest(request);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Process business rules
      const result = await this.processBusinessRules(request);
      
      // Cache result if configured
      this.cacheResult(cacheKey, result, request.serviceId);
      
      // Create response
      const response = this.createResponse(request, true, result, startTime);
      
      this.emit('request:processed', { request, response });
      return response;

    } catch (error) {
      const errorResponse = this.createResponse(
        request, 
        false, 
        null, 
        startTime, 
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      this.emit('request:error', { request, error: errorResponse });
      return errorResponse;
      
    } finally {
      // Clean up
      this.activeRequests.delete(request.id);
      this.requestHistory.push(request);
      
      // Keep history manageable
      if (this.requestHistory.length > 1000) {
        this.requestHistory = this.requestHistory.slice(-500);
      }
    }
  }

  /**
   * Add a business rule to a service
   */
  public addBusinessRule(serviceId: string, rule: BusinessRule): void {
    const rules = this.businessRules.get(serviceId) || [];
    rules.push(rule);
    rules.sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
    this.businessRules.set(serviceId, rules);
    
    this.emit('rule:added', { serviceId, rule });
  }

  /**
   * Enable real-time updates for a service
   */
  public enableRealTimeUpdates(serviceId: string, callback: (data: any) => void): () => void {
    const eventName = `realtime:${serviceId}`;
    this.on(eventName, callback);
    
    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * Emit real-time update
   */
  public emitRealTimeUpdate(serviceId: string, data: any): void {
    this.emit(`realtime:${serviceId}`, data);
    this.emit('realtime:global', { serviceId, data });
  }

  /**
   * Get service statistics
   */
  public getServiceStats(serviceId: string): any {
    const service = this.services.get(serviceId);
    if (!service) return null;

    const serviceRequests = this.requestHistory.filter(req => req.serviceId === serviceId);
    const recentRequests = serviceRequests.filter(
      req => Date.now() - req.timestamp.getTime() < 300000 // Last 5 minutes
    );

    return {
      serviceId,
      serviceName: service.name,
      enabled: service.enabled,
      totalRequests: serviceRequests.length,
      recentRequests: recentRequests.length,
      averageResponseTime: this.calculateAverageResponseTime(serviceId),
      errorRate: this.calculateErrorRate(serviceId),
      businessRules: this.businessRules.get(serviceId)?.length || 0,
      cacheHitRate: this.calculateCacheHitRate(serviceId)
    };
  }

  private initializeDefaultServices(): void {
    // Initialize default service configurations
    const defaultServices: ServiceConfiguration[] = [
      {
        id: 'analytics',
        name: 'Analytics & Reporting',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 300000, maxSize: 100 }
      },
      {
        id: 'operations',
        name: 'Real-time Operations',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 60000, maxSize: 200 }
      },
      {
        id: 'admin',
        name: 'Administration',
        enabled: true,
        realTimeUpdates: false,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 600000, maxSize: 50 }
      },
      {
        id: 'ioc-management',
        name: 'IOC Management',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 180000, maxSize: 300 }
      },
      {
        id: 'threat-intelligence',
        name: 'Threat Intelligence',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 240000, maxSize: 150 }
      },
      {
        id: 'incident',
        name: 'Incident Response',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 120000, maxSize: 200 }
      },
      {
        id: 'hunting',
        name: 'Threat Hunting',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 180000, maxSize: 100 }
      },
      {
        id: 'feeds',
        name: 'Feed Management',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 300000, maxSize: 150 }
      },
      {
        id: 'integration',
        name: 'Integration Platform',
        enabled: true,
        realTimeUpdates: false,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 600000, maxSize: 50 }
      },
      {
        id: 'repository',
        name: 'Threat Intelligence Repository',
        enabled: true,
        realTimeUpdates: false,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 900000, maxSize: 200 }
      },
      {
        id: 'dashboard',
        name: 'Dashboard',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 60000, maxSize: 100 }
      },
      {
        id: 'analytics-automation',
        name: 'Analytics Automation',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 240000, maxSize: 100 }
      },
      {
        id: 'investigation',
        name: 'Investigation',
        enabled: true,
        realTimeUpdates: true,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 180000, maxSize: 150 }
      },
      {
        id: 'mitre',
        name: 'MITRE ATT&CK',
        enabled: true,
        realTimeUpdates: false,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 3600000, maxSize: 100 }
      },
      {
        id: 'evidence',
        name: 'Evidence Management',
        enabled: true,
        realTimeUpdates: false,
        validationRules: [],
        cacheConfig: { enabled: true, ttl: 1800000, maxSize: 200 }
      }
    ];

    defaultServices.forEach(service => this.registerService(service));
  }

  private setupRequestProcessing(): void {
    // Set up periodic cache cleanup
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Every minute

    // Set up metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  private async validateRequest(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic validation
    if (!request.serviceId) {
      result.errors.push('Service ID is required');
    }

    if (!request.operation) {
      result.errors.push('Operation is required');
    }

    // Service-specific validation
    const service = this.services.get(request.serviceId);
    if (!service) {
      result.errors.push(`Service ${request.serviceId} not found`);
    } else if (!service.enabled) {
      result.errors.push(`Service ${request.serviceId} is disabled`);
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  private async processBusinessRules(request: BusinessLogicRequest): Promise<any> {
    const rules = this.businessRules.get(request.serviceId) || [];
    const applicableRules = rules.filter(rule => 
      rule.enabled && rule.operation === request.operation
    );

    let result = request.payload;

    for (const rule of applicableRules) {
      try {
        const validation = await rule.validator(request);
        if (!validation.isValid) {
          throw new Error(`Business rule validation failed: ${validation.errors.join(', ')}`);
        }

        result = await rule.processor({ ...request, payload: result });
      } catch (error) {
        console.error(`Business rule ${rule.id} failed:`, error);
        throw error;
      }
    }

    return result;
  }

  private createResponse(
    request: BusinessLogicRequest,
    success: boolean,
    data: any,
    startTime: number,
    error?: string
  ): BusinessLogicResponse {
    return {
      id: uuidv4(),
      requestId: request.id,
      success,
      data,
      error,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      metadata: {
        serviceId: request.serviceId,
        operation: request.operation,
        priority: request.priority
      }
    };
  }

  private getCachedResult(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheResult(cacheKey: string, data: any, serviceId: string): void {
    const service = this.services.get(serviceId);
    const cacheConfig = service?.cacheConfig;
    
    if (cacheConfig?.enabled) {
      this.cache.set(cacheKey, {
        data,
        timestamp: new Date(),
        ttl: cacheConfig.ttl
      });

      // Manage cache size
      if (this.cache.size > (cacheConfig.maxSize || 100)) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp.getTime() > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private collectMetrics(): void {
    const metrics = {
      totalServices: this.services.size,
      activeRequests: this.activeRequests.size,
      totalRequests: this.requestHistory.length,
      cacheSize: this.cache.size,
      timestamp: new Date()
    };

    this.emit('metrics:collected', metrics);
  }

  private calculateAverageResponseTime(serviceId: string): number {
    const serviceRequests = this.requestHistory
      .filter(req => req.serviceId === serviceId)
      .slice(-100); // Last 100 requests

    if (serviceRequests.length === 0) return 0;

    const totalTime = serviceRequests.reduce((sum, req) => {
      // Estimate processing time based on timestamp differences
      return sum + 100; // Placeholder
    }, 0);

    return totalTime / serviceRequests.length;
  }

  private calculateErrorRate(serviceId: string): number {
    const serviceRequests = this.requestHistory
      .filter(req => req.serviceId === serviceId)
      .slice(-100);

    if (serviceRequests.length === 0) return 0;

    // This would need to be tracked properly in a real implementation
    return 0.02; // 2% error rate placeholder
  }

  private calculateCacheHitRate(serviceId: string): number {
    // This would need proper tracking in a real implementation
    return 0.75; // 75% cache hit rate placeholder
  }
}

// Export singleton instance
export const businessLogicManager = BusinessLogicManager.getInstance();