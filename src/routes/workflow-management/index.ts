import { Router } from 'express';

// Import all workflow management routes
import { bpmnEditorSuiteRoutes } from './bpmnEditorSuiteRoutes';
import { processAuditManagerRoutes } from './processAuditManagerRoutes';
import { processChangeApproverRoutes } from './processChangeApproverRoutes';
import { processCostAnalyzerRoutes } from './processCostAnalyzerRoutes';
import { processDataPrivacyRoutes } from './processDataPrivacyRoutes';
import { processDocumentationHubRoutes } from './processDocumentationHubRoutes';
import { processErrorHandlerRoutes } from './processErrorHandlerRoutes';
import { processEventHubRoutes } from './processEventHubRoutes';
import { processInstanceMonitorRoutes } from './processInstanceMonitorRoutes';
import { processLibraryManagerRoutes } from './processLibraryManagerRoutes';
import { processLoadBalancerRoutes } from './processLoadBalancerRoutes';
import { processMessageBrokerRoutes } from './processMessageBrokerRoutes';
import { processMiningEngineRoutes } from './processMiningEngineRoutes';
import { processModelRepositoryRoutes } from './processModelRepositoryRoutes';
import { processOptimizationAdvisorRoutes } from './processOptimizationAdvisorRoutes';
import { processPerformanceAnalyzerRoutes } from './processPerformanceAnalyzerRoutes';
import { processPolicyEngineRoutes } from './processPolicyEngineRoutes';
import { processQualityMetricsRoutes } from './processQualityMetricsRoutes';
import { processQueueControllerRoutes } from './processQueueControllerRoutes';
import { processRiskAssessorRoutes } from './processRiskAssessorRoutes';
import { processScalingControllerRoutes } from './processScalingControllerRoutes';
import { processSyncCoordinatorRoutes } from './processSyncCoordinatorRoutes';
import { processValidationEngineRoutes } from './processValidationEngineRoutes';
import { processWebhookManagerRoutes } from './processWebhookManagerRoutes';
import { workflowAccessControlRoutes } from './workflowAccessControlRoutes';
import { workflowAnalyticsDashboardRoutes } from './workflowAnalyticsDashboardRoutes';
import { workflowApiGatewayRoutes } from './workflowApiGatewayRoutes';
import { workflowBottleneckDetectorRoutes } from './workflowBottleneckDetectorRoutes';
import { workflowCheckpointManagerRoutes } from './workflowCheckpointManagerRoutes';
import { workflowCollaborationSpaceRoutes } from './workflowCollaborationSpaceRoutes';
import { workflowComplianceCheckerRoutes } from './workflowComplianceCheckerRoutes';
import { workflowComplianceMonitorRoutes } from './workflowComplianceMonitorRoutes';
import { workflowConnectorManagerRoutes } from './workflowConnectorManagerRoutes';
import { workflowDataPipelineRoutes } from './workflowDataPipelineRoutes';
import { workflowDesignerStudioRoutes } from './workflowDesignerStudioRoutes';
import { workflowEncryptionManagerRoutes } from './workflowEncryptionManagerRoutes';
import { workflowExecutionEngineRoutes } from './workflowExecutionEngineRoutes';
import { workflowGovernancePortalRoutes } from './workflowGovernancePortalRoutes';
import { workflowImpactAnalyzerRoutes } from './workflowImpactAnalyzerRoutes';
import { workflowPredictionServiceRoutes } from './workflowPredictionServiceRoutes';
import { workflowResourceManagerRoutes } from './workflowResourceManagerRoutes';
import { workflowSchedulerServiceRoutes } from './workflowSchedulerServiceRoutes';
import { workflowSecurityScannerRoutes } from './workflowSecurityScannerRoutes';
import { workflowServiceMeshRoutes } from './workflowServiceMeshRoutes';
import { workflowStateManagerRoutes } from './workflowStateManagerRoutes';
import { workflowTemplateManagerRoutes } from './workflowTemplateManagerRoutes';
import { workflowTransformationEngineRoutes } from './workflowTransformationEngineRoutes';
import { workflowTrendTrackerRoutes } from './workflowTrendTrackerRoutes';
import { workflowVersionControlRoutes } from './workflowVersionControlRoutes';

const router = Router();

// Mount all workflow management routes
router.use('/bpmn-editor-suite', bpmnEditorSuiteRoutes);
router.use('/process-audit-manager', processAuditManagerRoutes);
router.use('/process-change-approver', processChangeApproverRoutes);
router.use('/process-cost-analyzer', processCostAnalyzerRoutes);
router.use('/process-data-privacy', processDataPrivacyRoutes);
router.use('/process-documentation-hub', processDocumentationHubRoutes);
router.use('/process-error-handler', processErrorHandlerRoutes);
router.use('/process-event-hub', processEventHubRoutes);
router.use('/process-instance-monitor', processInstanceMonitorRoutes);
router.use('/process-library-manager', processLibraryManagerRoutes);
router.use('/process-load-balancer', processLoadBalancerRoutes);
router.use('/process-message-broker', processMessageBrokerRoutes);
router.use('/process-mining-engine', processMiningEngineRoutes);
router.use('/process-model-repository', processModelRepositoryRoutes);
router.use('/process-optimization-advisor', processOptimizationAdvisorRoutes);
router.use('/process-performance-analyzer', processPerformanceAnalyzerRoutes);
router.use('/process-policy-engine', processPolicyEngineRoutes);
router.use('/process-quality-metrics', processQualityMetricsRoutes);
router.use('/process-queue-controller', processQueueControllerRoutes);
router.use('/process-risk-assessor', processRiskAssessorRoutes);
router.use('/process-scaling-controller', processScalingControllerRoutes);
router.use('/process-sync-coordinator', processSyncCoordinatorRoutes);
router.use('/process-validation-engine', processValidationEngineRoutes);
router.use('/process-webhook-manager', processWebhookManagerRoutes);
router.use('/workflow-access-control', workflowAccessControlRoutes);
router.use('/workflow-analytics-dashboard', workflowAnalyticsDashboardRoutes);
router.use('/workflow-api-gateway', workflowApiGatewayRoutes);
router.use('/workflow-bottleneck-detector', workflowBottleneckDetectorRoutes);
router.use('/workflow-checkpoint-manager', workflowCheckpointManagerRoutes);
router.use('/workflow-collaboration-space', workflowCollaborationSpaceRoutes);
router.use('/workflow-compliance-checker', workflowComplianceCheckerRoutes);
router.use('/workflow-compliance-monitor', workflowComplianceMonitorRoutes);
router.use('/workflow-connector-manager', workflowConnectorManagerRoutes);
router.use('/workflow-data-pipeline', workflowDataPipelineRoutes);
router.use('/workflow-designer-studio', workflowDesignerStudioRoutes);
router.use('/workflow-encryption-manager', workflowEncryptionManagerRoutes);
router.use('/workflow-execution-engine', workflowExecutionEngineRoutes);
router.use('/workflow-governance-portal', workflowGovernancePortalRoutes);
router.use('/workflow-impact-analyzer', workflowImpactAnalyzerRoutes);
router.use('/workflow-prediction-service', workflowPredictionServiceRoutes);
router.use('/workflow-resource-manager', workflowResourceManagerRoutes);
router.use('/workflow-scheduler-service', workflowSchedulerServiceRoutes);
router.use('/workflow-security-scanner', workflowSecurityScannerRoutes);
router.use('/workflow-service-mesh', workflowServiceMeshRoutes);
router.use('/workflow-state-manager', workflowStateManagerRoutes);
router.use('/workflow-template-manager', workflowTemplateManagerRoutes);
router.use('/workflow-transformation-engine', workflowTransformationEngineRoutes);
router.use('/workflow-trend-tracker', workflowTrendTrackerRoutes);
router.use('/workflow-version-control', workflowVersionControlRoutes);

// Health check for workflow management module
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    module: 'workflow-management',
    routes: 49,
    categories: {
      design: 10,
      execution: 10, 
      analytics: 10,
      integration: 9,
      governance: 10
    },
    timestamp: new Date().toISOString()
  });
});

// Module overview endpoint
router.get('/overview', (req, res) => {
  res.status(200).json({
    success: true,
    module: 'workflow-management',
    description: 'Fortune 100-Grade Workflow and BPM System',
    features: [
      'Visual workflow design and modeling',
      'High-performance workflow execution runtime',
      'Comprehensive analytics and intelligence',
      'Enterprise integration capabilities',
      'Advanced governance and security'
    ],
    categories: {
      design: {
        count: 10,
        description: 'Workflow design and modeling tools'
      },
      execution: {
        count: 10,
        description: 'Runtime execution and monitoring'
      },
      analytics: {
        count: 10,
        description: 'Analytics and business intelligence'
      },
      integration: {
        count: 9,
        description: 'System integration and connectivity'
      },
      governance: {
        count: 10,
        description: 'Security and compliance management'
      }
    },
    totalPages: 49,
    generatedAt: new Date().toISOString()
  });
});

export { router as workflowManagementRoutes };
export default router;