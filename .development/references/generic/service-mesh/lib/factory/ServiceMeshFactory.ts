/**
 * Service Mesh Factory
 * Provides convenient factory methods for creating service mesh instances
 */

import { ServiceMesh, DEFAULT_SERVICE_MESH_CONFIG } from '../core/ServiceMesh';
import { IServiceMeshConfiguration, LoadBalancingStrategy } from '../interfaces/IServiceMesh';

export class ServiceMeshFactory {
  /**
   * Create a basic service mesh with default configuration
   */
  static create(config?: Partial<IServiceMeshConfiguration>): ServiceMesh {
    const finalConfig = config 
      ? { ...DEFAULT_SERVICE_MESH_CONFIG, ...config }
      : DEFAULT_SERVICE_MESH_CONFIG;
    
    return new ServiceMesh(finalConfig);
  }

  /**
   * Create a high-performance service mesh optimized for Fortune 100 workloads
   */
  static createHighPerformance(): ServiceMesh {
    const config: IServiceMeshConfiguration = {
      ...DEFAULT_SERVICE_MESH_CONFIG,
      registry: {
        heartbeatInterval: 15000,    // 15 seconds - more frequent health checks
        instanceTimeout: 45000,      // 45 seconds - faster failure detection  
        cleanupInterval: 30000       // 30 seconds - more frequent cleanup
      },
      loadBalancer: {
        defaultStrategy: 'least-connections',
        healthCheckRequired: true
      },
      circuitBreaker: {
        failureThreshold: 3,         // Lower threshold for faster failure detection
        recoveryTimeout: 30000,      // 30 seconds - faster recovery attempts
        successThreshold: 2          // Lower success threshold
      },
      observability: {
        metricsInterval: 5000,       // 5 seconds - more frequent metrics
        tracesSampling: 0.2,         // 20% sampling for better visibility
        retentionPeriod: 7200000     // 2 hours retention
      }
    };

    return new ServiceMesh(config);
  }

  /**
   * Create a lightweight service mesh for development and testing
   */
  static createDevelopment(): ServiceMesh {
    const config: IServiceMeshConfiguration = {
      ...DEFAULT_SERVICE_MESH_CONFIG,
      registry: {
        heartbeatInterval: 60000,    // 60 seconds - less frequent for dev
        instanceTimeout: 180000,     // 3 minutes - more lenient
        cleanupInterval: 120000      // 2 minutes
      },
      loadBalancer: {
        defaultStrategy: 'round-robin',
        healthCheckRequired: false   // More lenient for dev
      },
      circuitBreaker: {
        failureThreshold: 10,        // Higher threshold for dev
        recoveryTimeout: 120000,     // 2 minutes
        successThreshold: 5
      },
      observability: {
        metricsInterval: 30000,      // 30 seconds
        tracesSampling: 1.0,         // 100% sampling for dev
        retentionPeriod: 1800000     // 30 minutes retention
      }
    };

    return new ServiceMesh(config);
  }

  /**
   * Create a secure service mesh with enhanced security policies
   */
  static createSecure(): ServiceMesh {
    const config: IServiceMeshConfiguration = {
      ...DEFAULT_SERVICE_MESH_CONFIG,
      security: {
        defaultEncryption: true,
        certificateValidation: true,
        rateLimitingEnabled: true
      },
      loadBalancer: {
        defaultStrategy: 'hash', // More predictable routing for security
        healthCheckRequired: true
      }
    };

    return new ServiceMesh(config);
  }

  /**
   * Create a service mesh with custom load balancing strategy
   */
  static createWithLoadBalancer(strategy: LoadBalancingStrategy): ServiceMesh {
    const config: IServiceMeshConfiguration = {
      ...DEFAULT_SERVICE_MESH_CONFIG,
      loadBalancer: {
        defaultStrategy: strategy,
        healthCheckRequired: true
      }
    };

    return new ServiceMesh(config);
  }
}