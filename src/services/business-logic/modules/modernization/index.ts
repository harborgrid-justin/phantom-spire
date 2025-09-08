/**
 * Modernization Business Logic Modules Index
 * Exports all modernization business logic services
 */

// Digital Transformation Business Logic
export { default as DigitalTransformationDashboardBusinessLogic } from './DigitalTransformationDashboardBusinessLogic';
export { default as TransformationRoadmapPlannerBusinessLogic } from './TransformationRoadmapPlannerBusinessLogic';
export { default as DigitalMaturityAssessorBusinessLogic } from './DigitalMaturityAssessorBusinessLogic';
export { default as TransformationBusinessCaseBusinessLogic } from './TransformationBusinessCaseBusinessLogic';
export { default as ChangeManagementPortalBusinessLogic } from './ChangeManagementPortalBusinessLogic';
export { default as StakeholderEngagementHubBusinessLogic } from './StakeholderEngagementHubBusinessLogic';
export { default as TransformationMetricsCenterBusinessLogic } from './TransformationMetricsCenterBusinessLogic';
export { default as DigitalCultureBuilderBusinessLogic } from './DigitalCultureBuilderBusinessLogic';
export { default as InnovationLabManagerBusinessLogic } from './InnovationLabManagerBusinessLogic';
export { default as TransformationRiskMonitorBusinessLogic } from './TransformationRiskMonitorBusinessLogic';

// Cloud Migration Business Logic
export { default as CloudMigrationDashboardBusinessLogic } from './CloudMigrationDashboardBusinessLogic';
export { default as CloudReadinessAssessorBusinessLogic } from './CloudReadinessAssessorBusinessLogic';
export { default as MigrationStrategyPlannerBusinessLogic } from './MigrationStrategyPlannerBusinessLogic';
export { default as CloudCostOptimizerBusinessLogic } from './CloudCostOptimizerBusinessLogic';
export { default as HybridCloudManagerBusinessLogic } from './HybridCloudManagerBusinessLogic';
export { default as CloudSecurityCenterBusinessLogic } from './CloudSecurityCenterBusinessLogic';
export { default as ContainerizationHubBusinessLogic } from './ContainerizationHubBusinessLogic';
export { default as CloudNativeArchitectBusinessLogic } from './CloudNativeArchitectBusinessLogic';
export { default as MigrationAutomationEngineBusinessLogic } from './MigrationAutomationEngineBusinessLogic';
export { default as CloudGovernancePortalBusinessLogic } from './CloudGovernancePortalBusinessLogic';

// Legacy Modernization Business Logic
export { default as LegacySystemAnalyzerBusinessLogic } from './LegacySystemAnalyzerBusinessLogic';
export { default as ApplicationPortfolioManagerBusinessLogic } from './ApplicationPortfolioManagerBusinessLogic';
export { default as ModernizationPathwayAdvisorBusinessLogic } from './ModernizationPathwayAdvisorBusinessLogic';
export { default as ApiModernizationSuiteBusinessLogic } from './ApiModernizationSuiteBusinessLogic';
export { default as DataModernizationHubBusinessLogic } from './DataModernizationHubBusinessLogic';
export { default as MainframeMigrationCenterBusinessLogic } from './MainframeMigrationCenterBusinessLogic';
export { default as LegacyIntegrationBridgeBusinessLogic } from './LegacyIntegrationBridgeBusinessLogic';
export { default as ModernizationTestingLabBusinessLogic } from './ModernizationTestingLabBusinessLogic';

// Technology Stack Business Logic
export { default as TechStackAnalyzerBusinessLogic } from './TechStackAnalyzerBusinessLogic';
export { default as FrameworkMigrationAdvisorBusinessLogic } from './FrameworkMigrationAdvisorBusinessLogic';
export { default as MicroservicesArchitectBusinessLogic } from './MicroservicesArchitectBusinessLogic';
export { default as DevopsTransformationCenterBusinessLogic } from './DevopsTransformationCenterBusinessLogic';
export { default as ApiFirstDesignStudioBusinessLogic } from './ApiFirstDesignStudioBusinessLogic';
export { default as CloudNativePlatformBusinessLogic } from './CloudNativePlatformBusinessLogic';
export { default as InfrastructureAsCodeHubBusinessLogic } from './InfrastructureAsCodeHubBusinessLogic';
export { default as ObservabilityPlatformBusinessLogic } from './ObservabilityPlatformBusinessLogic';

// Process Modernization Business Logic
export { default as ProcessAutomationCenterBusinessLogic } from './ProcessAutomationCenterBusinessLogic';
export { default as WorkflowDigitizationStudioBusinessLogic } from './WorkflowDigitizationStudioBusinessLogic';
export { default as IntelligentDocumentProcessorBusinessLogic } from './IntelligentDocumentProcessorBusinessLogic';
export { default as CustomerJourneyOptimizerBusinessLogic } from './CustomerJourneyOptimizerBusinessLogic';
export { default as DecisionAutomationEngineBusinessLogic } from './DecisionAutomationEngineBusinessLogic';
export { default as AgileTransformationHubBusinessLogic } from './AgileTransformationHubBusinessLogic';
export { default as DigitalWorkplacePlatformBusinessLogic } from './DigitalWorkplacePlatformBusinessLogic';
export { default as ProcessMiningAnalyzerBusinessLogic } from './ProcessMiningAnalyzerBusinessLogic';

// Data Modernization Business Logic
export { default as DataPlatformModernizerBusinessLogic } from './DataPlatformModernizerBusinessLogic';
export { default as AnalyticsTransformationCenterBusinessLogic } from './AnalyticsTransformationCenterBusinessLogic';
export { default as RealtimeDataPipelineBusinessLogic } from './RealtimeDataPipelineBusinessLogic';
export { default as DataGovernanceModernizerBusinessLogic } from './DataGovernanceModernizerBusinessLogic';
export { default as SelfServiceAnalyticsPlatformBusinessLogic } from './SelfServiceAnalyticsPlatformBusinessLogic';

/**
 * Modernization Business Logic Registry
 * Maps service IDs to their respective business logic classes
 */
export const modernizationBusinessLogicRegistry = {
  // Digital Transformation
  'digital-transformation-dashboard': DigitalTransformationDashboardBusinessLogic,
  'transformation-roadmap-planner': TransformationRoadmapPlannerBusinessLogic,
  'digital-maturity-assessor': DigitalMaturityAssessorBusinessLogic,
  'transformation-business-case': TransformationBusinessCaseBusinessLogic,
  'change-management-portal': ChangeManagementPortalBusinessLogic,
  'stakeholder-engagement-hub': StakeholderEngagementHubBusinessLogic,
  'transformation-metrics-center': TransformationMetricsCenterBusinessLogic,
  'digital-culture-builder': DigitalCultureBuilderBusinessLogic,
  'innovation-lab-manager': InnovationLabManagerBusinessLogic,
  'transformation-risk-monitor': TransformationRiskMonitorBusinessLogic,

  // Cloud Migration
  'cloud-migration-dashboard': CloudMigrationDashboardBusinessLogic,
  'cloud-readiness-assessor': CloudReadinessAssessorBusinessLogic,
  'migration-strategy-planner': MigrationStrategyPlannerBusinessLogic,
  'cloud-cost-optimizer': CloudCostOptimizerBusinessLogic,
  'hybrid-cloud-manager': HybridCloudManagerBusinessLogic,
  'cloud-security-center': CloudSecurityCenterBusinessLogic,
  'containerization-hub': ContainerizationHubBusinessLogic,
  'cloud-native-architect': CloudNativeArchitectBusinessLogic,
  'migration-automation-engine': MigrationAutomationEngineBusinessLogic,
  'cloud-governance-portal': CloudGovernancePortalBusinessLogic,

  // Legacy Modernization
  'legacy-system-analyzer': LegacySystemAnalyzerBusinessLogic,
  'application-portfolio-manager': ApplicationPortfolioManagerBusinessLogic,
  'modernization-pathway-advisor': ModernizationPathwayAdvisorBusinessLogic,
  'api-modernization-suite': ApiModernizationSuiteBusinessLogic,
  'data-modernization-hub': DataModernizationHubBusinessLogic,
  'mainframe-migration-center': MainframeMigrationCenterBusinessLogic,
  'legacy-integration-bridge': LegacyIntegrationBridgeBusinessLogic,
  'modernization-testing-lab': ModernizationTestingLabBusinessLogic,

  // Technology Stack
  'tech-stack-analyzer': TechStackAnalyzerBusinessLogic,
  'framework-migration-advisor': FrameworkMigrationAdvisorBusinessLogic,
  'microservices-architect': MicroservicesArchitectBusinessLogic,
  'devops-transformation-center': DevopsTransformationCenterBusinessLogic,
  'api-first-design-studio': ApiFirstDesignStudioBusinessLogic,
  'cloud-native-platform': CloudNativePlatformBusinessLogic,
  'infrastructure-as-code-hub': InfrastructureAsCodeHubBusinessLogic,
  'observability-platform': ObservabilityPlatformBusinessLogic,

  // Process Modernization
  'process-automation-center': ProcessAutomationCenterBusinessLogic,
  'workflow-digitization-studio': WorkflowDigitizationStudioBusinessLogic,
  'intelligent-document-processor': IntelligentDocumentProcessorBusinessLogic,
  'customer-journey-optimizer': CustomerJourneyOptimizerBusinessLogic,
  'decision-automation-engine': DecisionAutomationEngineBusinessLogic,
  'agile-transformation-hub': AgileTransformationHubBusinessLogic,
  'digital-workplace-platform': DigitalWorkplacePlatformBusinessLogic,
  'process-mining-analyzer': ProcessMiningAnalyzerBusinessLogic,

  // Data Modernization
  'data-platform-modernizer': DataPlatformModernizerBusinessLogic,
  'analytics-transformation-center': AnalyticsTransformationCenterBusinessLogic,
  'realtime-data-pipeline': RealtimeDataPipelineBusinessLogic,
  'data-governance-modernizer': DataGovernanceModernizerBusinessLogic,
  'self-service-analytics-platform': SelfServiceAnalyticsPlatformBusinessLogic,
};

/**
 * Get business logic service by ID
 */
export function getModernizationBusinessLogic(serviceId: string) {
  const BusinessLogicClass = modernizationBusinessLogicRegistry[serviceId];
  if (!BusinessLogicClass) {
    throw new Error(`Unknown modernization service: ${serviceId}`);
  }
  return new BusinessLogicClass();
}

/**
 * Get all available modernization service IDs
 */
export function getAvailableModernizationServices(): string[] {
  return Object.keys(modernizationBusinessLogicRegistry);
}

/**
 * Modernization Platform Categories
 */
export const modernizationCategories = {
  'digital-transformation': {
    name: 'Digital Transformation',
    description: 'Strategic digital transformation and organizational change management',
    icon: '🚀',
    moduleCount: 10
  },
  'cloud-migration': {
    name: 'Cloud Migration & Adoption',
    description: 'Cloud migration strategies, hybrid cloud management, and cloud-native architecture',
    icon: '☁️',
    moduleCount: 10
  },
  'legacy-modernization': {
    name: 'Legacy System Modernization',
    description: 'Legacy system assessment, application portfolio management, and modernization pathways',
    icon: '🔄',
    moduleCount: 8
  },
  'tech-stack': {
    name: 'Technology Stack Modernization',
    description: 'Modern technology adoption, microservices architecture, and DevOps transformation',
    icon: '⚙️',
    moduleCount: 8
  },
  'process-modernization': {
    name: 'Process & Workflow Modernization',
    description: 'Business process automation, workflow digitization, and intelligent document processing',
    icon: '🤖',
    moduleCount: 8
  },
  'data-modernization': {
    name: 'Data & Analytics Modernization',
    description: 'Modern data platforms, real-time analytics, and self-service business intelligence',
    icon: '📊',
    moduleCount: 5
  }
};

/**
 * Total modernization modules count
 */
export const totalModernizationModules = Object.values(modernizationCategories)
  .reduce((total, category) => total + category.moduleCount, 0);

export default {
  registry: modernizationBusinessLogicRegistry,
  getBusinessLogic: getModernizationBusinessLogic,
  getAvailableServices: getAvailableModernizationServices,
  categories: modernizationCategories,
  totalModules: totalModernizationModules
};