/**
 * Business Logic Modules - Main Index
 * Central export for all 40 business logic modules + 32 SOA enhancements
 */

// Threat Analysis & Intelligence (8 modules)
export * from './threat-analysis';

// Security Operations & Response (8 modules)
export * from './security-operations';

// Risk Management & Compliance (8 modules)
export * from './risk-management';

// Enterprise Integration & Automation (9 modules) - includes new AI/ML engine
export * from './enterprise-integration';

// Workflow Management (49 modules) - comprehensive BPM system
export * from './workflow-management';

// User Management (49 modules) - comprehensive user management system
export * from './user-management';

// XDR (Extended Detection and Response) (49 modules) - comprehensive XDR platform
export * from './xdr';

// Cost Systems Engineering (1 centralized module) - standardized cost systems
export * from './cost-systems-engineering';

// Windmill GitHub Repository Features (32 modules) - comprehensive GitHub automation
export * from './windmill';

// Import all rules for registration
import { allThreatAnalysisRules } from './threat-analysis';
import { allSecurityOperationsRules } from './security-operations';
import { allRiskManagementRules } from './risk-management';
import { allEnterpriseIntegrationRules } from './enterprise-integration';
import { allWorkflowManagementBusinessLogic } from './workflow-management';
import { allXDRBusinessLogicRules } from './xdr';

// Import SOA enhancements metadata
import { 
  soaEnhancementServices,
  allSOAEnhancements,
  allSOAEnhancementIds
} from '../../soa-enhancements/index.js';

// Aggregate all business logic modules with XDR
export const allBusinessLogicModules = [
  ...allThreatAnalysisRules,        // 8 modules
  ...allSecurityOperationsRules,    // 8 modules
  ...allRiskManagementRules,        // 8 modules
  ...allEnterpriseIntegrationRules, // 9 modules (8 original + 1 new AI/ML)
  ...allXDRBusinessLogicRules       // 49 XDR modules
]; // Total: 82 business logic modules

// Combined with SOA enhancements for total platform services
export const allPlatformServices = [
  ...allBusinessLogicModules,       // 82 business logic modules (including 49 XDR)
  ...soaEnhancementServices         // 32 SOA enhancement services
]; // Total: 114 platform services

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
  'resource-allocation-engine',
  'advanced-aiml-integration-engine'
];

// Complete service ID list including SOA enhancements
export const allServiceIds = [
  ...newBusinessLogicServiceIds,    // 33 business logic services
  ...allSOAEnhancementIds          // 32 SOA enhancement services
]; // Total: 65 service IDs

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
    'resource-allocation-engine',
    'advanced-aiml-integration-engine'
  ],
  'windmill': [
    'automated-branch-management',
    'repository-template-engine', 
    'issue-auto-classification',
    'pr-review-automation',
    'dependency-update-manager',
    'release-automation-hub',
    'repository-health-monitor',
    'code-migration-assistant',
    'pipeline-orchestrator',
    'build-status-dashboard',
    'test-automation-manager',
    'deployment-strategy-engine',
    'environment-configuration',
    'performance-benchmarking',
    'rollback-management',
    'infrastructure-as-code',
    'code-quality-analyzer',
    'security-scanning-hub',
    'license-compliance-manager',
    'code-coverage-tracker',
    'vulnerability-assessment',
    'code-review-analytics',
    'technical-debt-monitor',
    'documentation-generator',
    'team-productivity-analytics',
    'project-timeline-manager',
    'communication-hub',
    'knowledge-base-manager',
    'onboarding-automation',
    'workflow-templates',
    'integration-manager',
    'reporting-dashboard'
  ]
};

export const moduleMetadata = {
  totalModules: 72, // 40 business logic + 32 windmill features
  businessLogicModules: 40,
  windmillFeatures: 32,
  categories: 5,
  modulesPerCategory: [8, 8, 8, 9, 32], // Added windmill features
  version: '3.0.0',
  description: '72 precision-engineered modules (40 business logic + 32 windmill GitHub features) with complete frontend-backend integration'
};