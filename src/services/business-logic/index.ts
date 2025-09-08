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

// New Business Logic Modules (32 additional modules)
export * from './modules';
export { 
  allBusinessLogicModules, 
  newBusinessLogicServiceIds, 
  moduleCategories,
  moduleMetadata 
} from './modules';

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
      // Original services
      'analytics', 'operations', 'admin', 'ioc-management', 
      'threat-intelligence', 'incident', 'hunting', 'feeds',
      'integration', 'repository', 'dashboard', 'analytics-automation',
      'investigation', 'mitre', 'evidence',
      // New Threat Analysis & Intelligence Services
      'advanced-threat-detection', 'threat-intelligence-correlation', 
      'attribution-analysis', 'threat-campaign-tracking',
      'malware-analysis-automation', 'vulnerability-impact-assessment',
      'threat-landscape-monitoring', 'intelligence-quality-scoring',
      // New Security Operations & Response Services
      'incident-response-automation', 'security-orchestration',
      'alert-triage-prioritization', 'forensic-analysis-workflow',
      'containment-strategy', 'recovery-operations',
      'threat-hunting-automation', 'security-metrics-dashboard',
      // New Risk Management & Compliance Services
      'risk-assessment', 'compliance-monitoring',
      'policy-enforcement', 'audit-trail-management',
      'control-effectiveness', 'regulatory-reporting',
      'business-impact-analysis', 'third-party-risk-management',
      // New Enterprise Integration & Automation Services
      'workflow-process-engine', 'data-integration-pipeline',
      'api-gateway-management', 'service-health-monitoring',
      'configuration-management', 'deployment-automation',
      'performance-optimization', 'resource-allocation-engine'
    ];
    return validServices.includes(serviceId);
  }
};