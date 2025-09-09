/**
 * Advanced CVE Routes
 * Extended CVE management API routes for enterprise features
 */

import { Router } from 'express';
import {
  CVEEnrichmentController,
  CVEWorkflowController,
  CVEComplianceController,
  CVEAssetController,
  CVEMetricsController,
} from '../controllers/cveAdvancedController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * CVE Enrichment Routes
 */

/**
 * @swagger
 * /api/v1/cve-advanced/enrich/{id}:
 *   post:
 *     summary: Enrich CVE with external data
 *     tags: [CVE Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     responses:
 *       200:
 *         description: CVE enrichment completed
 */
router.post('/enrich/:id', CVEEnrichmentController.enrichCVE);

/**
 * @swagger
 * /api/v1/cve-advanced/enrich/bulk:
 *   post:
 *     summary: Bulk enrich multiple CVEs
 *     tags: [CVE Enrichment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cveIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk enrichment initiated
 */
router.post('/enrich/bulk', CVEEnrichmentController.bulkEnrichCVEs);

/**
 * @swagger
 * /api/v1/cve-advanced/enrich/status/{jobId}:
 *   get:
 *     summary: Get enrichment job status
 *     tags: [CVE Enrichment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrichment job ID
 *     responses:
 *       200:
 *         description: Enrichment status
 */
router.get(
  '/enrich/status/:jobId',
  CVEEnrichmentController.getEnrichmentStatus
);

/**
 * CVE Workflow Automation Routes
 */

/**
 * @swagger
 * /api/v1/cve-advanced/workflows:
 *   post:
 *     summary: Create automated workflow
 *     tags: [CVE Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               triggers:
 *                 type: array
 *               actions:
 *                 type: array
 *     responses:
 *       201:
 *         description: Workflow created successfully
 */
router.post('/workflows', CVEWorkflowController.createWorkflow);

/**
 * @swagger
 * /api/v1/cve-advanced/workflows/{id}/execute:
 *   post:
 *     summary: Execute workflow
 *     tags: [CVE Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow execution initiated
 */
router.post('/workflows/:id/execute', CVEWorkflowController.executeWorkflow);

/**
 * @swagger
 * /api/v1/cve-advanced/workflows/analytics:
 *   get:
 *     summary: Get workflow analytics
 *     tags: [CVE Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workflow analytics data
 */
router.get('/workflows/analytics', CVEWorkflowController.getWorkflowAnalytics);

/**
 * CVE Compliance Routes
 */

/**
 * @swagger
 * /api/v1/cve-advanced/compliance/status:
 *   get:
 *     summary: Get compliance status
 *     tags: [CVE Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: framework
 *         schema:
 *           type: string
 *         description: Compliance framework filter
 *     responses:
 *       200:
 *         description: Compliance status data
 */
router.get('/compliance/status', CVEComplianceController.getComplianceStatus);

/**
 * @swagger
 * /api/v1/cve-advanced/compliance/reports:
 *   post:
 *     summary: Generate compliance report
 *     tags: [CVE Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               framework:
 *                 type: string
 *               format:
 *                 type: string
 *               includeEvidence:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Compliance report generation initiated
 */
router.post(
  '/compliance/reports',
  CVEComplianceController.generateComplianceReport
);

/**
 * @swagger
 * /api/v1/cve-advanced/compliance/mapping/{cveId}:
 *   get:
 *     summary: Map CVE to compliance frameworks
 *     tags: [CVE Compliance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cveId
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     responses:
 *       200:
 *         description: CVE compliance framework mappings
 */
router.get(
  '/compliance/mapping/:cveId',
  CVEComplianceController.mapCVEToFrameworks
);

/**
 * CVE Asset Management Routes
 */

/**
 * @swagger
 * /api/v1/cve-advanced/assets/impact/{cveId}:
 *   get:
 *     summary: Get asset impact analysis
 *     tags: [CVE Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cveId
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     responses:
 *       200:
 *         description: Asset impact analysis
 */
router.get('/assets/impact/:cveId', CVEAssetController.getAssetImpact);

/**
 * @swagger
 * /api/v1/cve-advanced/assets/{assetId}/cve/{cveId}/status:
 *   put:
 *     summary: Update asset vulnerability status
 *     tags: [CVE Asset Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *       - in: path
 *         name: cveId
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               remediationMethod:
 *                 type: string
 *               completedDate:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset status updated successfully
 */
router.put(
  '/assets/:assetId/cve/:cveId/status',
  CVEAssetController.updateAssetStatus
);

/**
 * @swagger
 * /api/v1/cve-advanced/assets/summary:
 *   get:
 *     summary: Get asset vulnerability summary
 *     tags: [CVE Asset Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset vulnerability summary
 */
router.get('/assets/summary', CVEAssetController.getAssetVulnerabilitySummary);

/**
 * CVE Metrics and Analytics Routes
 */

/**
 * @swagger
 * /api/v1/cve-advanced/metrics:
 *   get:
 *     summary: Get CVE metrics and KPIs
 *     tags: [CVE Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *         description: Time range for metrics
 *     responses:
 *       200:
 *         description: CVE metrics data
 */
router.get('/metrics', CVEMetricsController.getCVEMetrics);

/**
 * @swagger
 * /api/v1/cve-advanced/metrics/export:
 *   post:
 *     summary: Export metrics data
 *     tags: [CVE Metrics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *               timeRange:
 *                 type: string
 *               includeCharts:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Metrics export initiated
 */
router.post('/metrics/export', CVEMetricsController.exportMetrics);

export default router;
