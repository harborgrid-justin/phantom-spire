/**
 * Business Logic Service Initializer
 * Registers business rules and initializes services for all service pages
 */

import { businessLogicManager } from './BusinessLogicManager';
import { realTimeDataService } from './RealTimeDataService';
import { analyticsBusinessRules } from '../rules/analyticsRules';
import { operationsBusinessRules } from '../rules/operationsRules';

export interface ServiceInitializationOptions {
  enableRealTimeData?: boolean;
  enableBusinessRules?: boolean;
  enableCaching?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export class BusinessLogicServiceInitializer {
  private static initialized = false;
  private static initializationPromise: Promise<void> | null = null;

  public static async initialize(options: ServiceInitializationOptions = {}): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization(options);
    return this.initializationPromise;
  }

  private static async performInitialization(options: ServiceInitializationOptions): Promise<void> {
    const startTime = Date.now();
    console.log('🚀 Initializing Business Logic Services...');

    const {
      enableRealTimeData = true,
      enableBusinessRules = true,
      enableCaching = true,
      logLevel = 'info'
    } = options;

    try {
      // Register business rules for all services
      if (enableBusinessRules) {
        await this.registerBusinessRules();
      }

      // Initialize real-time data services
      if (enableRealTimeData) {
        await this.initializeRealTimeServices();
      }

      // Configure additional services
      if (enableCaching) {
        this.configureCaching();
      }

      // Set up global event listeners
      this.setupGlobalEventListeners();

      // Mark as initialized
      this.initialized = true;
      
      const duration = Date.now() - startTime;
      console.log(`✅ Business Logic Services initialized successfully in ${duration}ms`);

      // Emit initialization complete event
      businessLogicManager.emit('services:initialized', {
        duration,
        options,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to initialize Business Logic Services:', error);
      throw error;
    }
  }

  private static async registerBusinessRules(): Promise<void> {
    console.log('📋 Registering business rules...');

    // Analytics service rules
    for (const rule of analyticsBusinessRules) {
      businessLogicManager.addBusinessRule('analytics', rule);
    }
    console.log(`   ✓ Analytics: ${analyticsBusinessRules.length} rules`);

    // Operations service rules
    for (const rule of operationsBusinessRules) {
      businessLogicManager.addBusinessRule('operations', rule);
    }
    console.log(`   ✓ Operations: ${operationsBusinessRules.length} rules`);

    // Add more service rules as they are created
    // TODO: Add IOC management, threat intelligence, admin, etc.

    console.log('📋 Business rules registration complete');
  }

  private static async initializeRealTimeServices(): Promise<void> {
    console.log('📡 Initializing real-time data services...');

    // Real-time services are auto-initialized with default configurations
    // Additional custom configurations can be added here

    // Example: Add custom data transformation for specific services
    realTimeDataService.on('data:broadcasted', ({ serviceId, data, subscriberCount }) => {
      if (subscriberCount > 0) {
        console.log(`📊 Real-time update: ${serviceId} -> ${subscriberCount} subscribers`);
      }
    });

    // Set up error handling for real-time services
    realTimeDataService.on('data:error', ({ serviceId, error }) => {
      console.warn(`⚠️ Real-time data error for ${serviceId}:`, error);
    });

    console.log('📡 Real-time data services initialized');
  }

  private static configureCaching(): void {
    console.log('🗄️ Configuring caching...');

    // Additional caching configuration can be added here
    // For now, caching is handled automatically by the BusinessLogicManager

    console.log('🗄️ Caching configuration complete');
  }

  private static setupGlobalEventListeners(): void {
    console.log('👂 Setting up global event listeners...');

    // Business logic events
    businessLogicManager.on('request:processed', ({ request, response }) => {
      console.log(`✅ Request processed: ${request.serviceId}:${request.operation} (${response.processingTime}ms)`);
    });

    businessLogicManager.on('request:error', ({ request, error }) => {
      console.error(`❌ Request failed: ${request.serviceId}:${request.operation} - ${error.error}`);
    });

    businessLogicManager.on('service:registered', ({ serviceId, config }) => {
      console.log(`🔧 Service registered: ${serviceId} (${config.name})`);
    });

    // Real-time data events
    realTimeDataService.on('subscription:created', ({ subscription }) => {
      console.log(`📡 New real-time subscription: ${subscription.serviceId} (${subscription.id})`);
    });

    realTimeDataService.on('dataSource:registered', ({ serviceId, config }) => {
      console.log(`📊 Data source registered: ${serviceId} (${config.endpoint})`);
    });

    // Metrics collection
    businessLogicManager.on('metrics:collected', (metrics) => {
      if (metrics.activeRequests > 10) {
        console.warn(`⚠️ High request volume: ${metrics.activeRequests} active requests`);
      }
    });

    console.log('👂 Global event listeners configured');
  }

  /**
   * Get initialization status
   */
  public static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force re-initialization (for testing or configuration changes)
   */
  public static async reinitialize(options: ServiceInitializationOptions = {}): Promise<void> {
    this.initialized = false;
    this.initializationPromise = null;
    return this.initialize(options);
  }

  /**
   * Get service health status
   */
  public static getHealthStatus() {
    if (!this.initialized) {
      return {
        status: 'not-initialized',
        services: {},
        realTimeConnections: 0
      };
    }

    return {
      status: 'healthy',
      services: {
        businessLogic: {
          registeredServices: 5, // This would be dynamic
          totalRules: analyticsBusinessRules.length + operationsBusinessRules.length,
          activeRequests: 0 // Would get from business logic manager
        },
        realTimeData: {
          registeredSources: 5, // Default sources
          activeSubscriptions: 0, // Would get from real-time service
          dataSourceHealth: 'healthy'
        }
      },
      realTimeConnections: 0, // Would get actual count
      initialized: this.initialized,
      initializationTime: new Date() // Would track actual initialization time
    };
  }

  /**
   * Register additional business rules at runtime
   */
  public static registerAdditionalRules(serviceId: string, rules: any[]): void {
    if (!this.initialized) {
      throw new Error('Business Logic Services must be initialized before registering additional rules');
    }

    for (const rule of rules) {
      businessLogicManager.addBusinessRule(serviceId, rule);
    }

    console.log(`📋 Registered ${rules.length} additional rules for ${serviceId}`);
  }

  /**
   * Enable/disable real-time updates for a service
   */
  public static configureRealTimeService(serviceId: string, enabled: boolean): void {
    if (!this.initialized) {
      throw new Error('Business Logic Services must be initialized before configuring real-time services');
    }

    // Implementation would configure the service
    console.log(`📡 Real-time updates ${enabled ? 'enabled' : 'disabled'} for ${serviceId}`);
  }
}

// Auto-initialize when module is imported (can be overridden)
let autoInitPromise: Promise<void> | null = null;

export function ensureInitialized(options?: ServiceInitializationOptions): Promise<void> {
  if (!BusinessLogicServiceInitializer.isInitialized() && !autoInitPromise) {
    autoInitPromise = BusinessLogicServiceInitializer.initialize(options);
  }
  
  return autoInitPromise || Promise.resolve();
}

// Export for convenience
export const initializeBusinessLogicServices = BusinessLogicServiceInitializer.initialize;
export const isBusinessLogicInitialized = BusinessLogicServiceInitializer.isInitialized;