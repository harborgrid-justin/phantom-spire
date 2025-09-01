/**
 * Generic Load Balancer - Revolutionary Plug-and-Play Module
 */

export * from './core/LoadBalancer';
export { LoadBalancer as default } from './core/LoadBalancer';

// Revolutionary zero-config entry points
export const createLoadBalancer = (config?: any) => {
  const { LoadBalancer } = require('./core/LoadBalancer');
  return new LoadBalancer(config || {});
};

export const autoLoadBalancer = () => {
  const { LoadBalancer } = require('./core/LoadBalancer');
  const lb = new LoadBalancer();
  
  // Auto-discover servers from environment
  Object.keys(process.env).forEach(key => {
    if (key.includes('SERVER_URL') || key.includes('BACKEND_URL')) {
      const url = process.env[key];
      if (url) {
        lb.addServer({ url, weight: 1, responseTime: 0 });
      }
    }
  });
  
  return lb;
};