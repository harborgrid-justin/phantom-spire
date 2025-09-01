/**
 * Revolutionary Service Registry Implementation
 * Zero-configuration service discovery and registration
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface IServiceInstance {
  id: string;
  name: string;
  version: string;
  url: string;
  port: number;
  healthy: boolean;
  metadata: Record<string, any>;
  registeredAt: number;
  lastHeartbeat: number;
}

export class ServiceRegistry extends EventEmitter {
  private services: Map<string, IServiceInstance> = new Map();
  private servicesByName: Map<string, Set<string>> = new Map();

  constructor(config: any = {}) {
    super();
    this.startAutoDiscovery();
    this.startHealthMonitoring();
  }

  register(service: Omit<IServiceInstance, 'id' | 'registeredAt' | 'lastHeartbeat'>): string {
    const id = uuidv4();
    const instance: IServiceInstance = {
      id,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      healthy: true,
      ...service
    };

    this.services.set(id, instance);
    
    if (!this.servicesByName.has(service.name)) {
      this.servicesByName.set(service.name, new Set());
    }
    this.servicesByName.get(service.name)!.add(id);

    this.emit('service-registered', instance);
    console.info(`📝 Service registered: ${service.name} (${id})`);
    
    return id;
  }

  unregister(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (!service) return;

    this.services.delete(serviceId);
    
    const nameSet = this.servicesByName.get(service.name);
    if (nameSet) {
      nameSet.delete(serviceId);
      if (nameSet.size === 0) {
        this.servicesByName.delete(service.name);
      }
    }

    this.emit('service-unregistered', service);
    console.info(`🗑️ Service unregistered: ${service.name} (${serviceId})`);
  }

  discover(serviceName: string): IServiceInstance[] {
    const serviceIds = this.servicesByName.get(serviceName);
    if (!serviceIds) return [];

    return Array.from(serviceIds)
      .map(id => this.services.get(id)!)
      .filter(service => service.healthy);
  }

  getAll(): IServiceInstance[] {
    return Array.from(this.services.values());
  }

  heartbeat(serviceId: string): void {
    const service = this.services.get(serviceId);
    if (service) {
      service.lastHeartbeat = Date.now();
      service.healthy = true;
    }
  }

  private startAutoDiscovery(): void {
    // Auto-discover services from environment
    setInterval(() => {
      this.performAutoDiscovery();
    }, 60000); // Every minute

    // Initial discovery
    this.performAutoDiscovery();
  }

  private performAutoDiscovery(): void {
    // Discover services from environment variables
    Object.keys(process.env).forEach(key => {
      if (key.endsWith('_SERVICE_URL') || key.endsWith('_API_URL')) {
        const serviceName = key.replace(/_SERVICE_URL|_API_URL/, '').toLowerCase().replace(/_/g, '-');
        const url = process.env[key];
        
        if (url && !this.servicesByName.has(serviceName)) {
          try {
            const urlObj = new URL(url);
            this.register({
              name: serviceName,
              version: '1.0.0',
              url,
              port: parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80),
              metadata: {
                discovered: true,
                source: 'environment'
              }
            });
          } catch (error) {
            console.warn(`Failed to auto-register service ${serviceName}:`, error);
          }
        }
      }
    });
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Every 30 seconds
  }

  private performHealthChecks(): void {
    const now = Date.now();
    const staleThreshold = 90000; // 90 seconds

    for (const [id, service] of this.services) {
      if (now - service.lastHeartbeat > staleThreshold) {
        service.healthy = false;
        this.emit('service-unhealthy', service);
        
        // Remove after being unhealthy for too long
        if (now - service.lastHeartbeat > staleThreshold * 2) {
          this.unregister(id);
        }
      }
    }
  }
}