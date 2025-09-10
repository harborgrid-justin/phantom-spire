/**
 * Business SaaS Extension for phantom-intel-core
 * Provides enterprise-grade multi-tenant threat intelligence capabilities
 * with comprehensive data store support
 */

export * from './BusinessSaaSIntelCore.js';
export * from './config/BusinessSaaSConfig.js';
export * from './services/MultiTenantManager.js';
export * from './services/DataStoreIntegration.js';
export * from './services/RealTimeManager.js';
export * from './services/AnalyticsEngine.js';
export * from './types/BusinessSaaSTypes.js';
export * from './utils/BusinessSaaSUtils.js';

// Main factory function
export { createBusinessSaaSIntelCore } from './BusinessSaaSIntelCore.js';