/**
 * Generic Circuit Breaker - Revolutionary Plug-and-Play Module
 * Zero configuration, automatic fault tolerance for any Node.js project
 */

// Core exports
export * from './interfaces/ICircuitBreaker';
export { CircuitBreaker } from './core/CircuitBreaker';
export { 
  CircuitBreakerFactory, 
  CircuitBreakerRegistry, 
  circuitBreakerFactory, 
  circuitBreakerRegistry 
} from './core/CircuitBreakerFactory';

// Main exports
export { CircuitBreaker as default } from './core/CircuitBreaker';

// Convenience re-exports for better developer experience
export {
  ICircuitBreaker,
  ICircuitBreakerConfig,
  ICircuitBreakerMetrics,
  ICircuitBreakerEvents,
  ICircuitBreakerFactory,
  ICircuitBreakerRegistry,
  CircuitBreakerState
} from './interfaces/ICircuitBreaker';

// Revolutionary zero-config entry point
export const createCircuitBreaker = (serviceName?: string, config?: any) => {
  const { CircuitBreakerFactory } = require('./core/CircuitBreakerFactory');
  return config ? 
    CircuitBreakerFactory.create(serviceName, config) : 
    CircuitBreakerFactory.autoCreate(serviceName);
};

// Global registry access
export const getCircuitBreaker = (serviceName: string) => {
  const { circuitBreakerRegistry } = require('./core/CircuitBreakerFactory');
  return circuitBreakerRegistry.get(serviceName);
};

// Auto-discovery trigger
export const discoverServices = async () => {
  const { circuitBreakerRegistry } = require('./core/CircuitBreakerFactory');
  return await circuitBreakerRegistry.autoDiscover();
};