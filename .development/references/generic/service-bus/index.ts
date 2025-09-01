/**
 * Generic Service Bus - Main Export
 * Reusable plug-and-play service bus for any Node.js project
 */

// Core exports
export * from './interfaces/IServiceBus';
export { ServiceBus } from './core/ServiceBus';

// Main export
export { ServiceBus as default } from './core/ServiceBus';

// Convenience re-exports
export {
  IServiceBus,
  IServiceDefinition,
  IServiceRequest,
  IServiceResponse,
  IRequestContext,
  IRoutingRule,
  IMessageTransformation,
  IServiceBusMetrics,
  IServiceHealth,
  IServiceBusConfig,
  ILogger,
  IMessageQueue,
  IServiceBusPlugin
} from './interfaces/IServiceBus';