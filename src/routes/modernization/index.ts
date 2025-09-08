/**
 * Modernization Main Routes
 * Central routing for all modernization modules
 */

import { Router } from 'express';

// Import all modernization routes
import digitalTransformationDashboardRoutes from './digitalTransformationDashboardRoutes';
import transformationRoadmapPlannerRoutes from './transformationRoadmapPlannerRoutes';
import digitalMaturityAssessorRoutes from './digitalMaturityAssessorRoutes';
import transformationBusinessCaseRoutes from './transformationBusinessCaseRoutes';
import changeManagementPortalRoutes from './changeManagementPortalRoutes';
import stakeholderEngagementHubRoutes from './stakeholderEngagementHubRoutes';
import transformationMetricsCenterRoutes from './transformationMetricsCenterRoutes';
import digitalCultureBuilderRoutes from './digitalCultureBuilderRoutes';
import innovationLabManagerRoutes from './innovationLabManagerRoutes';
import transformationRiskMonitorRoutes from './transformationRiskMonitorRoutes';
import cloudMigrationDashboardRoutes from './cloudMigrationDashboardRoutes';
import cloudReadinessAssessorRoutes from './cloudReadinessAssessorRoutes';
import migrationStrategyPlannerRoutes from './migrationStrategyPlannerRoutes';
import cloudCostOptimizerRoutes from './cloudCostOptimizerRoutes';
import hybridCloudManagerRoutes from './hybridCloudManagerRoutes';
import cloudSecurityCenterRoutes from './cloudSecurityCenterRoutes';
import containerizationHubRoutes from './containerizationHubRoutes';
import cloudNativeArchitectRoutes from './cloudNativeArchitectRoutes';
import migrationAutomationEngineRoutes from './migrationAutomationEngineRoutes';
import cloudGovernancePortalRoutes from './cloudGovernancePortalRoutes';
import legacySystemAnalyzerRoutes from './legacySystemAnalyzerRoutes';
import applicationPortfolioManagerRoutes from './applicationPortfolioManagerRoutes';
import modernizationPathwayAdvisorRoutes from './modernizationPathwayAdvisorRoutes';
import apiModernizationSuiteRoutes from './apiModernizationSuiteRoutes';
import dataModernizationHubRoutes from './dataModernizationHubRoutes';
import mainframeMigrationCenterRoutes from './mainframeMigrationCenterRoutes';
import legacyIntegrationBridgeRoutes from './legacyIntegrationBridgeRoutes';
import modernizationTestingLabRoutes from './modernizationTestingLabRoutes';
import techStackAnalyzerRoutes from './techStackAnalyzerRoutes';
import frameworkMigrationAdvisorRoutes from './frameworkMigrationAdvisorRoutes';
import microservicesArchitectRoutes from './microservicesArchitectRoutes';
import devopsTransformationCenterRoutes from './devopsTransformationCenterRoutes';
import apiFirstDesignStudioRoutes from './apiFirstDesignStudioRoutes';
import cloudNativePlatformRoutes from './cloudNativePlatformRoutes';
import infrastructureAsCodeHubRoutes from './infrastructureAsCodeHubRoutes';
import observabilityPlatformRoutes from './observabilityPlatformRoutes';
import processAutomationCenterRoutes from './processAutomationCenterRoutes';
import workflowDigitizationStudioRoutes from './workflowDigitizationStudioRoutes';
import intelligentDocumentProcessorRoutes from './intelligentDocumentProcessorRoutes';
import customerJourneyOptimizerRoutes from './customerJourneyOptimizerRoutes';
import decisionAutomationEngineRoutes from './decisionAutomationEngineRoutes';
import agileTransformationHubRoutes from './agileTransformationHubRoutes';
import digitalWorkplacePlatformRoutes from './digitalWorkplacePlatformRoutes';
import processMiningAnalyzerRoutes from './processMiningAnalyzerRoutes';
import dataPlatformModernizerRoutes from './dataPlatformModernizerRoutes';
import analyticsTransformationCenterRoutes from './analyticsTransformationCenterRoutes';
import realtimeDataPipelineRoutes from './realtimeDataPipelineRoutes';
import dataGovernanceModernizerRoutes from './dataGovernanceModernizerRoutes';
import selfServiceAnalyticsPlatformRoutes from './selfServiceAnalyticsPlatformRoutes';

const router = Router();

// Digital Transformation Routes (10 modules)
router.use('/digital-transformation/digital-transformation-dashboard', digitalTransformationDashboardRoutes);
router.use('/digital-transformation/transformation-roadmap-planner', transformationRoadmapPlannerRoutes);
router.use('/digital-transformation/digital-maturity-assessor', digitalMaturityAssessorRoutes);
router.use('/digital-transformation/transformation-business-case', transformationBusinessCaseRoutes);
router.use('/digital-transformation/change-management-portal', changeManagementPortalRoutes);
router.use('/digital-transformation/stakeholder-engagement-hub', stakeholderEngagementHubRoutes);
router.use('/digital-transformation/transformation-metrics-center', transformationMetricsCenterRoutes);
router.use('/digital-transformation/digital-culture-builder', digitalCultureBuilderRoutes);
router.use('/digital-transformation/innovation-lab-manager', innovationLabManagerRoutes);
router.use('/digital-transformation/transformation-risk-monitor', transformationRiskMonitorRoutes);

// Cloud Migration Routes (10 modules)
router.use('/cloud-migration/cloud-migration-dashboard', cloudMigrationDashboardRoutes);
router.use('/cloud-migration/cloud-readiness-assessor', cloudReadinessAssessorRoutes);
router.use('/cloud-migration/migration-strategy-planner', migrationStrategyPlannerRoutes);
router.use('/cloud-migration/cloud-cost-optimizer', cloudCostOptimizerRoutes);
router.use('/cloud-migration/hybrid-cloud-manager', hybridCloudManagerRoutes);
router.use('/cloud-migration/cloud-security-center', cloudSecurityCenterRoutes);
router.use('/cloud-migration/containerization-hub', containerizationHubRoutes);
router.use('/cloud-migration/cloud-native-architect', cloudNativeArchitectRoutes);
router.use('/cloud-migration/migration-automation-engine', migrationAutomationEngineRoutes);
router.use('/cloud-migration/cloud-governance-portal', cloudGovernancePortalRoutes);

// Legacy Modernization Routes (8 modules)
router.use('/legacy-modernization/legacy-system-analyzer', legacySystemAnalyzerRoutes);
router.use('/legacy-modernization/application-portfolio-manager', applicationPortfolioManagerRoutes);
router.use('/legacy-modernization/modernization-pathway-advisor', modernizationPathwayAdvisorRoutes);
router.use('/legacy-modernization/api-modernization-suite', apiModernizationSuiteRoutes);
router.use('/legacy-modernization/data-modernization-hub', dataModernizationHubRoutes);
router.use('/legacy-modernization/mainframe-migration-center', mainframeMigrationCenterRoutes);
router.use('/legacy-modernization/legacy-integration-bridge', legacyIntegrationBridgeRoutes);
router.use('/legacy-modernization/modernization-testing-lab', modernizationTestingLabRoutes);

// Technology Stack Modernization Routes (8 modules)
router.use('/tech-stack/tech-stack-analyzer', techStackAnalyzerRoutes);
router.use('/tech-stack/framework-migration-advisor', frameworkMigrationAdvisorRoutes);
router.use('/tech-stack/microservices-architect', microservicesArchitectRoutes);
router.use('/tech-stack/devops-transformation-center', devopsTransformationCenterRoutes);
router.use('/tech-stack/api-first-design-studio', apiFirstDesignStudioRoutes);
router.use('/tech-stack/cloud-native-platform', cloudNativePlatformRoutes);
router.use('/tech-stack/infrastructure-as-code-hub', infrastructureAsCodeHubRoutes);
router.use('/tech-stack/observability-platform', observabilityPlatformRoutes);

// Process Modernization Routes (8 modules)
router.use('/process-modernization/process-automation-center', processAutomationCenterRoutes);
router.use('/process-modernization/workflow-digitization-studio', workflowDigitizationStudioRoutes);
router.use('/process-modernization/intelligent-document-processor', intelligentDocumentProcessorRoutes);
router.use('/process-modernization/customer-journey-optimizer', customerJourneyOptimizerRoutes);
router.use('/process-modernization/decision-automation-engine', decisionAutomationEngineRoutes);
router.use('/process-modernization/agile-transformation-hub', agileTransformationHubRoutes);
router.use('/process-modernization/digital-workplace-platform', digitalWorkplacePlatformRoutes);
router.use('/process-modernization/process-mining-analyzer', processMiningAnalyzerRoutes);

// Data Modernization Routes (5 modules)
router.use('/data-modernization/data-platform-modernizer', dataPlatformModernizerRoutes);
router.use('/data-modernization/analytics-transformation-center', analyticsTransformationCenterRoutes);
router.use('/data-modernization/realtime-data-pipeline', realtimeDataPipelineRoutes);
router.use('/data-modernization/data-governance-modernizer', dataGovernanceModernizerRoutes);
router.use('/data-modernization/self-service-analytics-platform', selfServiceAnalyticsPlatformRoutes);

// Modernization Platform Overview Route
router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Modernization Platform',
    version: '1.0.0',
    categories: {
      'digital-transformation': 10,
      'cloud-migration': 10,
      'legacy-modernization': 8,
      'tech-stack': 8,
      'process-modernization': 8,
      'data-modernization': 5
    },
    totalModules: 49,
    description: 'Comprehensive modernization platform with 49 business-ready modules',
    timestamp: new Date()
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Modernization Platform',
    modules: 49,
    timestamp: new Date()
  });
});

export default router;