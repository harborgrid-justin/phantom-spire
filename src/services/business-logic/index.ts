/**
 * Business Logic Services - Main Index
 * Unified export for all business logic functionality
 */

// Core services
export { 
  BusinessLogicManager, 
  businessLogicManager,
  type BusinessLogicRequest,
  type BusinessLogicResponse,
  type BusinessRule,
  type ValidationResult,
  type ServiceConfiguration
} from './core/BusinessLogicManager';

export { 
  RealTimeDataService, 
  realTimeDataService,
  type RealTimeDataConfig,
  type RealTimeSubscription,
  type DataSourceMetrics
} from './core/RealTimeDataService';

// Service Initializer
export {
  BusinessLogicServiceInitializer,
  initializeBusinessLogicServices,
  isBusinessLogicInitialized,
  ensureInitialized,
  type ServiceInitializationOptions
} from './core/ServiceInitializer';

// Hooks
export {
  useBusinessLogic,
  useRealTimeData,
  useServicePage,
  useFormValidation,
  type UseBusinessLogicOptions,
  type BusinessLogicState,
  type UseRealTimeDataOptions,
  type RealTimeDataState
} from './hooks/useBusinessLogic';

// Business Rules
export { analyticsBusinessRules } from './rules/analyticsRules';
export { operationsBusinessRules } from './rules/operationsRules';

// Utility function to initialize business logic for a service page
export function initializeServicePage(serviceId: string, options?: {
  realTimeEnabled?: boolean;
  validationEnabled?: boolean;
  cacheEnabled?: boolean;
}) {
  console.log(`🚀 Initializing business logic for ${serviceId}`);
  
  // Ensure business logic services are initialized
  import('./core/ServiceInitializer').then(({ ensureInitialized }) => {
    return ensureInitialized().then(() => {
      console.log(`✅ Business logic ready for ${serviceId}`);
    }).catch(error => {
      console.error(`❌ Failed to initialize business logic for ${serviceId}:`, error);
    });
  }).catch(error => {
    console.error(`❌ Failed to load service initializer for ${serviceId}:`, error);
  });
  
  return {
    serviceId,
    initialized: true,
    options: options || {}
  };
}

// Export commonly used utilities
export const BusinessLogicUtils = {
  generateRequestId: () => {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  formatError: (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  },
  
  isValidServiceId: (serviceId: string) => {
    const validServices = [
      'analytics', 'operations', 'admin', 'ioc-management', 
      'threat-intelligence', 'incident', 'hunting', 'feeds',
      'integration', 'repository', 'dashboard', 'analytics-automation',
      'investigation', 'mitre', 'evidence'
    ];
    return validServices.includes(serviceId);
  }
};