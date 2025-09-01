/**
 * Generic Service Registry - Revolutionary Plug-and-Play Module
 */

export * from './core/ServiceRegistry';
export { ServiceRegistry as default } from './core/ServiceRegistry';

// Revolutionary zero-config entry points
export const createServiceRegistry = (config?: any) => {
  const { ServiceRegistry } = require('./core/ServiceRegistry');
  return new ServiceRegistry(config || {});
};

export const autoServiceRegistry = () => {
  const { ServiceRegistry } = require('./core/ServiceRegistry');
  const registry = new ServiceRegistry();
  
  // Auto-register current service if environment is set
  if (process.env.SERVICE_NAME && process.env.SERVICE_PORT) {
    registry.register({
      name: process.env.SERVICE_NAME,
      version: process.env.SERVICE_VERSION || '1.0.0',
      url: `http://localhost:${process.env.SERVICE_PORT}`,
      port: parseInt(process.env.SERVICE_PORT),
      metadata: {
        autoRegistered: true,
        pid: process.pid
      }
    });
  }
  
  return registry;
};