/**
 * Real-time Data Service
 * Provides real-time data updates for all service pages
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface RealTimeDataConfig {
  serviceId: string;
  endpoint: string;
  updateInterval: number;
  maxRetries: number;
  transformData?: (data: any) => any;
  validateData?: (data: any) => boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

export interface RealTimeSubscription {
  id: string;
  serviceId: string;
  callback: (data: any) => void;
  active: boolean;
  lastUpdate: Date | null;
  errorCount: number;
}

export interface DataSourceMetrics {
  serviceId: string;
  successCount: number;
  errorCount: number;
  lastSuccess: Date | null;
  lastError: Date | null;
  averageResponseTime: number;
  currentSubscribers: number;
}

export class RealTimeDataService extends EventEmitter {
  private static instance: RealTimeDataService;
  private dataSources: Map<string, RealTimeDataConfig> = new Map();
  private subscriptions: Map<string, RealTimeSubscription> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private metrics: Map<string, DataSourceMetrics> = new Map();
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();

  private constructor() {
    super();
    this.initializeDefaultDataSources();
    this.setupMetricsCollection();
  }

  public static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  /**
   * Register a real-time data source
   */
  public registerDataSource(config: RealTimeDataConfig): void {
    this.dataSources.set(config.serviceId, config);
    
    this.metrics.set(config.serviceId, {
      serviceId: config.serviceId,
      successCount: 0,
      errorCount: 0,
      lastSuccess: null,
      lastError: null,
      averageResponseTime: 0,
      currentSubscribers: 0
    });

    console.log(`📡 Real-time Data Service: Registered data source for ${config.serviceId}`);
    this.emit('dataSource:registered', { serviceId: config.serviceId, config });
  }

  /**
   * Subscribe to real-time data updates
   */
  public subscribe(
    serviceId: string, 
    callback: (data: any) => void
  ): () => void {
    const subscription: RealTimeSubscription = {
      id: uuidv4(),
      serviceId,
      callback,
      active: true,
      lastUpdate: null,
      errorCount: 0
    };

    this.subscriptions.set(subscription.id, subscription);
    
    // Update metrics
    const metrics = this.metrics.get(serviceId);
    if (metrics) {
      metrics.currentSubscribers++;
    }

    // Start data fetching if this is the first subscriber
    if (this.getActiveSubscriptions(serviceId).length === 1) {
      this.startDataFetching(serviceId);
    }

    console.log(`📡 New subscription for ${serviceId}: ${subscription.id}`);
    this.emit('subscription:created', { subscription });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(subscription.id);
    };
  }

  /**
   * Unsubscribe from updates
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);

      // Update metrics
      const metrics = this.metrics.get(subscription.serviceId);
      if (metrics && metrics.currentSubscribers > 0) {
        metrics.currentSubscribers--;
      }

      // Stop data fetching if no active subscribers
      if (this.getActiveSubscriptions(subscription.serviceId).length === 0) {
        this.stopDataFetching(subscription.serviceId);
      }

      console.log(`📡 Unsubscribed from ${subscription.serviceId}: ${subscriptionId}`);
      this.emit('subscription:removed', { subscription });
    }
  }

  /**
   * Manually trigger data update
   */
  public async triggerUpdate(serviceId: string): Promise<void> {
    const config = this.dataSources.get(serviceId);
    if (!config) {
      throw new Error(`Data source not found: ${serviceId}`);
    }

    await this.fetchAndBroadcastData(serviceId, config);
  }

  /**
   * Get metrics for a service
   */
  public getMetrics(serviceId: string): DataSourceMetrics | null {
    return this.metrics.get(serviceId) || null;
  }

  /**
   * Get all service metrics
   */
  public getAllMetrics(): Record<string, DataSourceMetrics> {
    const result: Record<string, DataSourceMetrics> = {};
    this.metrics.forEach((metrics, serviceId) => {
      result[serviceId] = metrics;
    });
    return result;
  }

  private initializeDefaultDataSources(): void {
    const defaultSources: RealTimeDataConfig[] = [
      {
        serviceId: 'analytics',
        endpoint: '/api/analytics/realtime',
        updateInterval: 30000,
        maxRetries: 3,
        cacheEnabled: true,
        cacheTTL: 15000,
        transformData: (data) => ({
          ...data,
          timestamp: new Date(),
          processed: true
        }),
        validateData: (data) => data && typeof data === 'object'
      },
      {
        serviceId: 'operations',
        endpoint: '/api/operations/status',
        updateInterval: 10000,
        maxRetries: 5,
        cacheEnabled: true,
        cacheTTL: 5000,
        transformData: (data) => ({
          ...data,
          systemHealth: data.health || 'unknown',
          lastChecked: new Date()
        })
      },
      {
        serviceId: 'admin',
        endpoint: '/api/admin/system-stats',
        updateInterval: 60000,
        maxRetries: 3,
        cacheEnabled: true,
        cacheTTL: 30000
      },
      {
        serviceId: 'ioc-management',
        endpoint: '/api/iocs/stats',
        updateInterval: 20000,
        maxRetries: 4,
        cacheEnabled: true,
        cacheTTL: 10000
      },
      {
        serviceId: 'threat-intelligence',
        endpoint: '/api/threat-intel/updates',
        updateInterval: 15000,
        maxRetries: 4,
        cacheEnabled: true,
        cacheTTL: 8000
      }
    ];

    defaultSources.forEach(source => this.registerDataSource(source));
  }

  private setupMetricsCollection(): void {
    // Collect and emit metrics every minute
    setInterval(() => {
      const allMetrics = this.getAllMetrics();
      this.emit('metrics:collected', allMetrics);
    }, 60000);

    // Clean up old cache entries
    setInterval(() => {
      this.cleanupCache();
    }, 30000);
  }

  private getActiveSubscriptions(serviceId: string): RealTimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.serviceId === serviceId && sub.active
    );
  }

  private startDataFetching(serviceId: string): void {
    const config = this.dataSources.get(serviceId);
    if (!config) return;

    // Clear any existing interval
    this.stopDataFetching(serviceId);

    // Start new interval
    const interval = setInterval(async () => {
      try {
        await this.fetchAndBroadcastData(serviceId, config);
      } catch (error) {
        console.error(`Error fetching data for ${serviceId}:`, error);
        this.updateErrorMetrics(serviceId);
      }
    }, config.updateInterval);

    this.intervals.set(serviceId, interval);
    
    // Immediate first fetch
    this.fetchAndBroadcastData(serviceId, config).catch(error => {
      console.error(`Initial fetch failed for ${serviceId}:`, error);
    });

    console.log(`📡 Started data fetching for ${serviceId} (interval: ${config.updateInterval}ms)`);
  }

  private stopDataFetching(serviceId: string): void {
    const interval = this.intervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(serviceId);
      console.log(`📡 Stopped data fetching for ${serviceId}`);
    }
  }

  private async fetchAndBroadcastData(serviceId: string, config: RealTimeDataConfig): Promise<void> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = `${serviceId}:data`;
      const cachedData = this.getCachedData(cacheKey);
      
      let data;
      if (cachedData) {
        data = cachedData;
        this.emit('cache:hit', { serviceId, cacheKey });
      } else {
        // Simulate API call - in real implementation, use actual HTTP client
        data = await this.simulateDataFetch(serviceId, config);
        
        // Cache the data if configured
        if (config.cacheEnabled && config.cacheTTL) {
          this.cacheData(cacheKey, data, config.cacheTTL);
        }
      }

      // Validate data if validator provided
      if (config.validateData && !config.validateData(data)) {
        throw new Error(`Data validation failed for ${serviceId}`);
      }

      // Transform data if transformer provided
      if (config.transformData) {
        data = config.transformData(data);
      }

      // Broadcast to all active subscribers
      const subscriptions = this.getActiveSubscriptions(serviceId);
      subscriptions.forEach(sub => {
        try {
          sub.callback(data);
          sub.lastUpdate = new Date();
          sub.errorCount = 0;
        } catch (error) {
          console.error(`Error in subscription callback for ${serviceId}:`, error);
          sub.errorCount++;
          
          // Remove subscription if too many errors
          if (sub.errorCount > 5) {
            this.unsubscribe(sub.id);
          }
        }
      });

      // Update success metrics
      this.updateSuccessMetrics(serviceId, Date.now() - startTime);
      
      this.emit('data:broadcasted', { 
        serviceId, 
        subscriberCount: subscriptions.length, 
        data 
      });

    } catch (error) {
      this.updateErrorMetrics(serviceId);
      this.emit('data:error', { serviceId, error });
      throw error;
    }
  }

  private async simulateDataFetch(serviceId: string, config: RealTimeDataConfig): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    // Generate mock data based on service type
    switch (serviceId) {
      case 'analytics':
        return {
          totalIOCs: Math.floor(Math.random() * 1000) + 5000,
          activeThreats: Math.floor(Math.random() * 50) + 20,
          processedToday: Math.floor(Math.random() * 200) + 100,
          threatLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          trends: {
            iocGrowth: Math.floor(Math.random() * 20) - 10,
            threatIncrease: Math.floor(Math.random() * 15) - 5
          }
        };

      case 'operations':
        return {
          systemStatus: 'operational',
          cpuUsage: Math.floor(Math.random() * 40) + 30,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          activeConnections: Math.floor(Math.random() * 100) + 200,
          queueSize: Math.floor(Math.random() * 50),
          health: Math.random() > 0.9 ? 'warning' : 'healthy'
        };

      case 'admin':
        return {
          totalUsers: Math.floor(Math.random() * 10) + 150,
          activeUsers: Math.floor(Math.random() * 20) + 45,
          systemUptime: Date.now() - Math.floor(Math.random() * 86400000),
          diskUsage: Math.floor(Math.random() * 30) + 60,
          backupStatus: 'completed',
          securityAlerts: Math.floor(Math.random() * 5)
        };

      case 'ioc-management':
        return {
          newIOCs: Math.floor(Math.random() * 20) + 5,
          validatedIOCs: Math.floor(Math.random() * 30) + 10,
          flaggedIOCs: Math.floor(Math.random() * 8) + 2,
          enrichmentQueue: Math.floor(Math.random() * 15),
          confidence: {
            high: Math.floor(Math.random() * 50) + 100,
            medium: Math.floor(Math.random() * 80) + 150,
            low: Math.floor(Math.random() * 40) + 50
          }
        };

      case 'threat-intelligence':
        return {
          newThreats: Math.floor(Math.random() * 15) + 8,
          analyzedFeeds: Math.floor(Math.random() * 10) + 25,
          correlatedEvents: Math.floor(Math.random() * 20) + 12,
          mlScoring: {
            processed: Math.floor(Math.random() * 100) + 200,
            highRisk: Math.floor(Math.random() * 10) + 5,
            pending: Math.floor(Math.random() * 30) + 15
          }
        };

      default:
        return {
          timestamp: new Date(),
          status: 'active',
          data: `Mock data for ${serviceId}`
        };
    }
  }

  private getCachedData(cacheKey: string): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheData(cacheKey: string, data: any, ttl: number): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: new Date(),
      ttl
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp.getTime() > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private updateSuccessMetrics(serviceId: string, responseTime: number): void {
    const metrics = this.metrics.get(serviceId);
    if (metrics) {
      metrics.successCount++;
      metrics.lastSuccess = new Date();
      metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
    }
  }

  private updateErrorMetrics(serviceId: string): void {
    const metrics = this.metrics.get(serviceId);
    if (metrics) {
      metrics.errorCount++;
      metrics.lastError = new Date();
    }
  }
}

// Export singleton instance
export const realTimeDataService = RealTimeDataService.getInstance();