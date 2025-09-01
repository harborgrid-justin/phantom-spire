/**
 * Enterprise Service Mesh for Node.js
 * Fortune 100-Grade Service Infrastructure Layer
 * 
 * A comprehensive service mesh implementation providing enterprise-level
 * service discovery, load balancing, circuit breaking, traffic management,
 * security policies, and observability for microservice architectures.
 * 
 * @version 1.0.0
 * @author Phantom Spire Team
 * @license MIT
 */

// Core Service Mesh Components
export {
  ServiceMesh,
  ServiceRegistry,
  LoadBalancer,
  CircuitBreaker,
  DEFAULT_SERVICE_MESH_CONFIG,
  createServiceInstance
} from './lib/core/ServiceMesh';

// Service Mesh Interfaces
export * from './lib/interfaces/IServiceMesh';

// Re-export main classes for convenience
export {
  ServiceMesh as Mesh,
  ServiceRegistry as Registry,
  LoadBalancer as Balancer,
  CircuitBreaker as Breaker
} from './lib/core/ServiceMesh';

/**
 * Quick Start Factory Functions
 */
export { ServiceMeshFactory } from './lib/factory/ServiceMeshFactory';

/**
 * Version information
 */
export const VERSION = '1.0.0';