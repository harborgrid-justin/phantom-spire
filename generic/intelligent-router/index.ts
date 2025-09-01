/**
 * Generic Intelligent Router - Revolutionary Plug-and-Play Module
 */

export * from './core/IntelligentRouter';
export { IntelligentRouter as default } from './core/IntelligentRouter';

// Revolutionary zero-config entry points
export const createIntelligentRouter = (config?: any) => {
  const { IntelligentRouter } = require('./core/IntelligentRouter');
  return new IntelligentRouter(config || {});
};

export const autoIntelligentRouter = () => {
  const { IntelligentRouter } = require('./core/IntelligentRouter');
  const router = new IntelligentRouter({ enableML: true, autoOptimize: true });
  
  // Auto-create common routes from environment
  if (process.env.API_BASE_URL) {
    router.addRoute({
      path: '/api/*',
      method: '*',
      target: process.env.API_BASE_URL,
      weight: 10,
      priority: 1,
      conditions: [],
      metadata: { autoCreated: true }
    });
  }
  
  return router;
};