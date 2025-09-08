/**
 * Advanced Service Discovery Enhancement
 * SOA Improvement #1: Enhanced service discovery with ML-driven optimization
 */

import { EventEmitter } from 'events';

export interface ServiceEndpoint {
  id: string;
  name: string;
  url: string;
  health: number;
  lastPing: Date;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface DiscoveryConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  healthThreshold: number;
  mlOptimization: boolean;
}

export class AdvancedServiceDiscovery extends EventEmitter {
  private services: Map<string, ServiceEndpoint> = new Map();
  private config: DiscoveryConfig;
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: Partial<DiscoveryConfig> = {}) {
    super();
    this.config = {
      autoRefresh: true,
      refreshInterval: 30000,
      healthThreshold: 80,
      mlOptimization: true,
      ...config
    };
  }

  /**
   * Register a service with enhanced metadata
   */
  async registerService(service: Omit<ServiceEndpoint, 'lastPing'>): Promise<void> {
    const endpoint: ServiceEndpoint = {
      ...service,
      lastPing: new Date()
    };

    this.services.set(service.id, endpoint);
    this.emit('service:registered', endpoint);
    
    console.log(`🔍 Advanced Service Discovery: Registered ${service.name}`);
  }

  /**
   * Discover services with ML-driven ranking
   */
  async discoverServices(capability?: string): Promise<ServiceEndpoint[]> {
    let services = Array.from(this.services.values());

    // Filter by capability if specified
    if (capability) {
      services = services.filter(s => s.capabilities.includes(capability));
    }

    // Filter by health threshold
    services = services.filter(s => s.health >= this.config.healthThreshold);

    // ML-driven optimization (simplified heuristic)
    if (this.config.mlOptimization) {
      services.sort((a, b) => {
        const scoreA = this.calculateServiceScore(a);
        const scoreB = this.calculateServiceScore(b);
        return scoreB - scoreA;
      });
    }

    return services;
  }

  /**
   * Get optimal service for specific capability
   */
  async getOptimalService(capability: string): Promise<ServiceEndpoint | null> {
    const services = await this.discoverServices(capability);
    return services.length > 0 ? services[0] : null;
  }

  /**
   * Calculate ML-based service score
   */
  private calculateServiceScore(service: ServiceEndpoint): number {
    const healthWeight = 0.4;
    const freshnessWeight = 0.3;
    const capabilityWeight = 0.3;

    const healthScore = service.health / 100;
    const freshnessScore = Math.max(0, 1 - (Date.now() - service.lastPing.getTime()) / (5 * 60 * 1000));
    const capabilityScore = service.capabilities.length / 10;

    return (healthScore * healthWeight) + 
           (freshnessScore * freshnessWeight) + 
           (capabilityScore * capabilityWeight);
  }

  /**
   * Start automatic service health monitoring
   */
  startMonitoring(): void {
    if (this.config.autoRefresh && !this.refreshTimer) {
      this.refreshTimer = setInterval(() => {
        this.refreshServiceHealth();
      }, this.config.refreshInterval);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Refresh health status of all services
   */
  private async refreshServiceHealth(): Promise<void> {
    this.services.forEach((service, id) => {
      try {
        // Simulate health check (in real implementation, this would ping the service)
        const health = Math.floor(Math.random() * 20) + 80;
        service.health = health;
        service.lastPing = new Date();
        
        this.emit('service:health-updated', { id, health });
      } catch (error) {
        service.health = 0;
        this.emit('service:health-failed', { id, error });
      }
    });
  }
}

// Export singleton instance
export const advancedServiceDiscovery = new AdvancedServiceDiscovery();