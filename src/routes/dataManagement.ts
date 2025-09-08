/**
 * Data Management Routes
 * Comprehensive routes for all data management modules
 */

import { Router } from 'express';
import { DataIngestionController } from '../controllers/dataManagement/dataIngestionController.js';
import { DataGovernanceController } from '../controllers/dataManagement/dataGovernanceController.js';
import { DataAnalyticsController } from '../controllers/dataManagement/dataAnalyticsController.js';
import { DataOperationsController } from '../controllers/dataManagement/dataOperationsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * Data Ingestion & Processing Routes (8 endpoints)
 */

/**
 * @swagger
 * /api/v1/data-management/ingestion/sources:
 *   get:
 *     summary: Get data source configuration and status
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data sources retrieved successfully
 */
router.get('/ingestion/sources', DataIngestionController.getDataSources);

/**
 * @swagger
 * /api/v1/data-management/ingestion/streams:
 *   get:
 *     summary: Get real-time data streams status
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data streams retrieved successfully
 */
router.get('/ingestion/streams', DataIngestionController.getRealTimeStreams);

/**
 * @swagger
 * /api/v1/data-management/ingestion/batch-processing:
 *   get:
 *     summary: Get batch processing jobs and status
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Batch processing data retrieved successfully
 */
router.get('/ingestion/batch-processing', DataIngestionController.getBatchProcessing);

/**
 * @swagger
 * /api/v1/data-management/ingestion/transformation:
 *   get:
 *     summary: Get data transformation hub information
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data transformation data retrieved successfully
 */
router.get('/ingestion/transformation', DataIngestionController.getDataTransformation);

/**
 * @swagger
 * /api/v1/data-management/ingestion/quality-validation:
 *   get:
 *     summary: Get data quality validation center information
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quality validation data retrieved successfully
 */
router.get('/ingestion/quality-validation', DataIngestionController.getQualityValidation);

/**
 * @swagger
 * /api/v1/data-management/ingestion/pipeline-monitor:
 *   get:
 *     summary: Get processing pipeline monitoring data
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline monitoring data retrieved successfully
 */
router.get('/ingestion/pipeline-monitor', DataIngestionController.getPipelineMonitor);

/**
 * @swagger
 * /api/v1/data-management/ingestion/format-conversion:
 *   get:
 *     summary: Get format conversion tools and jobs
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Format conversion data retrieved successfully
 */
router.get('/ingestion/format-conversion', DataIngestionController.getFormatConversion);

/**
 * @swagger
 * /api/v1/data-management/ingestion/schema-registry:
 *   get:
 *     summary: Get data schema registry information
 *     tags: [Data Management - Ingestion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schema registry data retrieved successfully
 */
router.get('/ingestion/schema-registry', DataIngestionController.getSchemaRegistry);

/**
 * Data Governance & Compliance Routes (8 endpoints)
 */

/**
 * @swagger
 * /api/v1/data-management/governance/dashboard:
 *   get:
 *     summary: Get data governance dashboard overview
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Governance dashboard data retrieved successfully
 */
router.get('/governance/dashboard', DataGovernanceController.getGovernanceDashboard);

/**
 * @swagger
 * /api/v1/data-management/governance/policy-management:
 *   get:
 *     summary: Get policy management center information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Policy management data retrieved successfully
 */
router.get('/governance/policy-management', DataGovernanceController.getPolicyManagement);

/**
 * @swagger
 * /api/v1/data-management/governance/compliance-monitoring:
 *   get:
 *     summary: Get compliance monitoring status
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance monitoring data retrieved successfully
 */
router.get('/governance/compliance-monitoring', DataGovernanceController.getComplianceMonitoring);

/**
 * @swagger
 * /api/v1/data-management/governance/lineage-tracking:
 *   get:
 *     summary: Get data lineage tracking information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data lineage data retrieved successfully
 */
router.get('/governance/lineage-tracking', DataGovernanceController.getLineageTracking);

/**
 * @swagger
 * /api/v1/data-management/governance/privacy-controls:
 *   get:
 *     summary: Get privacy controls hub information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy controls data retrieved successfully
 */
router.get('/governance/privacy-controls', DataGovernanceController.getPrivacyControls);

/**
 * @swagger
 * /api/v1/data-management/governance/audit-trail:
 *   get:
 *     summary: Get audit trail management information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit trail data retrieved successfully
 */
router.get('/governance/audit-trail', DataGovernanceController.getAuditTrail);

/**
 * @swagger
 * /api/v1/data-management/governance/retention-policies:
 *   get:
 *     summary: Get retention policies information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retention policies data retrieved successfully
 */
router.get('/governance/retention-policies', DataGovernanceController.getRetentionPolicies);

/**
 * @swagger
 * /api/v1/data-management/governance/classification:
 *   get:
 *     summary: Get data classification management information
 *     tags: [Data Management - Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data classification data retrieved successfully
 */
router.get('/governance/classification', DataGovernanceController.getDataClassification);

/**
 * Data Analytics & Insights Routes (8 endpoints)
 */

/**
 * @swagger
 * /api/v1/data-management/analytics/workbench:
 *   get:
 *     summary: Get analytics workbench information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics workbench data retrieved successfully
 */
router.get('/analytics/workbench', DataAnalyticsController.getAnalyticsWorkbench);

/**
 * @swagger
 * /api/v1/data-management/analytics/report-generation:
 *   get:
 *     summary: Get report generation center information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report generation data retrieved successfully
 */
router.get('/analytics/report-generation', DataAnalyticsController.getReportGeneration);

/**
 * @swagger
 * /api/v1/data-management/analytics/dashboard-builder:
 *   get:
 *     summary: Get dashboard builder information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard builder data retrieved successfully
 */
router.get('/analytics/dashboard-builder', DataAnalyticsController.getDashboardBuilder);

/**
 * @swagger
 * /api/v1/data-management/analytics/metrics-kpi:
 *   get:
 *     summary: Get metrics and KPI portal information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics and KPI data retrieved successfully
 */
router.get('/analytics/metrics-kpi', DataAnalyticsController.getMetricsKPI);

/**
 * @swagger
 * /api/v1/data-management/analytics/trend-analysis:
 *   get:
 *     summary: Get trend analysis hub information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend analysis data retrieved successfully
 */
router.get('/analytics/trend-analysis', DataAnalyticsController.getTrendAnalysis);

/**
 * @swagger
 * /api/v1/data-management/analytics/performance-analytics:
 *   get:
 *     summary: Get performance analytics information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance analytics data retrieved successfully
 */
router.get('/analytics/performance-analytics', DataAnalyticsController.getPerformanceAnalytics);

/**
 * @swagger
 * /api/v1/data-management/analytics/data-mining:
 *   get:
 *     summary: Get data mining tools information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data mining data retrieved successfully
 */
router.get('/analytics/data-mining', DataAnalyticsController.getDataMining);

/**
 * @swagger
 * /api/v1/data-management/analytics/predictive-analytics:
 *   get:
 *     summary: Get predictive analytics information
 *     tags: [Data Management - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Predictive analytics data retrieved successfully
 */
router.get('/analytics/predictive-analytics', DataAnalyticsController.getPredictiveAnalytics);

/**
 * Data Operations & Monitoring Routes (8 endpoints)
 */

/**
 * @swagger
 * /api/v1/data-management/operations/health-monitor:
 *   get:
 *     summary: Get data health monitoring information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data health monitoring data retrieved successfully
 */
router.get('/operations/health-monitor', DataOperationsController.getHealthMonitor);

/**
 * @swagger
 * /api/v1/data-management/operations/storage-management:
 *   get:
 *     summary: Get storage management information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage management data retrieved successfully
 */
router.get('/operations/storage-management', DataOperationsController.getStorageManagement);

/**
 * @swagger
 * /api/v1/data-management/operations/backup-recovery:
 *   get:
 *     summary: Get backup and recovery center information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup and recovery data retrieved successfully
 */
router.get('/operations/backup-recovery', DataOperationsController.getBackupRecovery);

/**
 * @swagger
 * /api/v1/data-management/operations/access-control:
 *   get:
 *     summary: Get access control hub information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access control data retrieved successfully
 */
router.get('/operations/access-control', DataOperationsController.getAccessControl);

/**
 * @swagger
 * /api/v1/data-management/operations/integration-status:
 *   get:
 *     summary: Get integration status center information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integration status data retrieved successfully
 */
router.get('/operations/integration-status', DataOperationsController.getIntegrationStatus);

/**
 * @swagger
 * /api/v1/data-management/operations/performance-optimizer:
 *   get:
 *     summary: Get performance optimizer information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance optimizer data retrieved successfully
 */
router.get('/operations/performance-optimizer', DataOperationsController.getPerformanceOptimizer);

/**
 * @swagger
 * /api/v1/data-management/operations/error-management:
 *   get:
 *     summary: Get error management information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Error management data retrieved successfully
 */
router.get('/operations/error-management', DataOperationsController.getErrorManagement);

/**
 * @swagger
 * /api/v1/data-management/operations/capacity-planning:
 *   get:
 *     summary: Get capacity planning information
 *     tags: [Data Management - Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Capacity planning data retrieved successfully
 */
router.get('/operations/capacity-planning', DataOperationsController.getCapacityPlanning);

export default router;