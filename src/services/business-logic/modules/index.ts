/**
 * Business Logic Modules - Main Index
 * Central export for all 32 business logic modules
 */

// Threat Analysis & Intelligence (8 modules)
export * from './threat-analysis';

// Security Operations & Response (8 modules)
export * from './security-operations';

// Risk Management & Compliance (8 modules)
export * from './risk-management';

// Enterprise Integration & Automation (8 modules)
export * from './enterprise-integration';

// Import all rules for registration
import { allThreatAnalysisRules } from './threat-analysis';
import { allSecurityOperationsRules } from './security-operations';
import { allRiskManagementRules } from './risk-management';
import { allEnterpriseIntegrationRules } from './enterprise-integration';

// Aggregate all 32 business logic modules
export const allBusinessLogicModules = [
  ...allThreatAnalysisRules,        // 8 modules
  ...allSecurityOperationsRules,    // 8 modules
  ...allRiskManagementRules,        // 8 modules
  ...allEnterpriseIntegrationRules  // 8 modules
]; // Total: 32 modules

// Service IDs for all new modules
export const newBusinessLogicServiceIds = [
  // Threat Analysis & Intelligence
  'advanced-threat-detection',
  'threat-intelligence-correlation', 
  'attribution-analysis',
  'threat-campaign-tracking',
  'malware-analysis-automation',
  'vulnerability-impact-assessment',
  'threat-landscape-monitoring',
  'intelligence-quality-scoring',
  
  // Security Operations & Response
  'incident-response-automation',
  'security-orchestration',
  'alert-triage-prioritization',
  'forensic-analysis-workflow',
  'containment-strategy',
  'recovery-operations',
  'threat-hunting-automation',
  'security-metrics-dashboard',
  
  // Risk Management & Compliance
  'risk-assessment',
  'compliance-monitoring',
  'policy-enforcement',
  'audit-trail-management',
  'control-effectiveness',
  'regulatory-reporting',
  'business-impact-analysis',
  'third-party-risk-management',
  
  // Enterprise Integration & Automation
  'workflow-process-engine',
  'data-integration-pipeline',
  'api-gateway-management',
  'service-health-monitoring',
  'configuration-management',
  'deployment-automation',
  'performance-optimization',
  'resource-allocation-engine'
];

// Module categories for organization
export const moduleCategories = {
  'threat-analysis': [
    'advanced-threat-detection',
    'threat-intelligence-correlation', 
    'attribution-analysis',
    'threat-campaign-tracking',
    'malware-analysis-automation',
    'vulnerability-impact-assessment',
    'threat-landscape-monitoring',
    'intelligence-quality-scoring'
  ],
  'security-operations': [
    'incident-response-automation',
    'security-orchestration',
    'alert-triage-prioritization',
    'forensic-analysis-workflow',
    'containment-strategy',
    'recovery-operations',
    'threat-hunting-automation',
    'security-metrics-dashboard'
  ],
  'risk-management': [
    'risk-assessment',
    'compliance-monitoring',
    'policy-enforcement',
    'audit-trail-management',
    'control-effectiveness',
    'regulatory-reporting',
    'business-impact-analysis',
    'third-party-risk-management'
  ],
  'enterprise-integration': [
    'workflow-process-engine',
    'data-integration-pipeline',
    'api-gateway-management',
    'service-health-monitoring',
    'configuration-management',
    'deployment-automation',
    'performance-optimization',
    'resource-allocation-engine'
  ]
};

export const moduleMetadata = {
  totalModules: 32,
  categories: 4,
  modulesPerCategory: 8,
  version: '1.0.0',
  description: '32 additional business-ready and customer-ready business logic modules'
};