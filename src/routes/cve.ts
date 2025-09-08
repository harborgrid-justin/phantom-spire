/**
 * CVE Routes
 * Comprehensive CVE management API routes
 */

import { Router } from 'express';
import {
  CVEDataController,
  CVEAnalyticsController,
  CVEFeedController,
  CVENotificationController,
  CVEReportController,
  cveValidation,
  searchValidation
} from '../controllers/cveController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     CVE:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique CVE identifier
 *         cveId:
 *           type: string
 *           description: CVE ID (e.g., CVE-2024-1234)
 *         title:
 *           type: string
 *           description: CVE title
 *         description:
 *           type: string
 *           description: CVE description
 *         scoring:
 *           type: object
 *           properties:
 *             cvssV3Score:
 *               type: number
 *             severity:
 *               type: string
 *               enum: [critical, high, medium, low, info]
 *         publishedDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/cve:
 *   get:
 *     summary: Get CVEs with filtering and pagination
 *     tags: [CVE Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string of filter criteria
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: JSON string of sort criteria
 *     responses:
 *       200:
 *         description: CVE list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cves:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CVE'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', searchValidation, CVEDataController.getCVEs);

/**
 * @swagger
 * /api/v1/cve/search:
 *   get:
 *     summary: Search CVEs
 *     tags: [CVE Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', CVEDataController.searchCVEs);

/**
 * @swagger
 * /api/v1/cve/stats:
 *   get:
 *     summary: Get CVE statistics
 *     tags: [CVE Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CVE statistics
 */
router.get('/stats', CVEAnalyticsController.getCVEStats);

/**
 * @swagger
 * /api/v1/cve/analytics/risk:
 *   get:
 *     summary: Get risk analytics
 *     tags: [CVE Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Risk analytics data
 */
router.get('/analytics/risk', CVEAnalyticsController.getRiskAnalytics);

/**
 * @swagger
 * /api/v1/cve/{id}:
 *   get:
 *     summary: Get CVE by ID
 *     tags: [CVE Management]
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
 *         description: CVE details
 *       404:
 *         description: CVE not found
 */
router.get('/:id', CVEDataController.getCVEById);

/**
 * @swagger
 * /api/v1/cve:
 *   post:
 *     summary: Create new CVE
 *     tags: [CVE Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CVE'
 *     responses:
 *       201:
 *         description: CVE created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', cveValidation, CVEDataController.createCVE);

/**
 * @swagger
 * /api/v1/cve/{id}:
 *   put:
 *     summary: Update CVE
 *     tags: [CVE Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CVE ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CVE'
 *     responses:
 *       200:
 *         description: CVE updated successfully
 *       404:
 *         description: CVE not found
 */
router.put('/:id', cveValidation, CVEDataController.updateCVE);

/**
 * @swagger
 * /api/v1/cve/{id}:
 *   delete:
 *     summary: Delete CVE
 *     tags: [CVE Management]
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
 *       204:
 *         description: CVE deleted successfully
 *       404:
 *         description: CVE not found
 */
router.delete('/:id', CVEDataController.deleteCVE);

// CVE Feed Management Routes
/**
 * @swagger
 * /api/v1/cve/feeds:
 *   get:
 *     summary: Get CVE feeds
 *     tags: [CVE Feeds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CVE feeds list
 */
router.get('/feeds', CVEFeedController.getFeeds);

/**
 * @swagger
 * /api/v1/cve/feeds:
 *   post:
 *     summary: Create CVE feed
 *     tags: [CVE Feeds]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Feed created successfully
 */
router.post('/feeds', CVEFeedController.createFeed);

/**
 * @swagger
 * /api/v1/cve/feeds/{id}/sync:
 *   post:
 *     summary: Sync CVE feed
 *     tags: [CVE Feeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feed ID
 *     responses:
 *       200:
 *         description: Feed sync initiated
 */
router.post('/feeds/:id/sync', CVEFeedController.syncFeed);

// CVE Notification Routes
/**
 * @swagger
 * /api/v1/cve/notifications:
 *   get:
 *     summary: Get CVE notifications
 *     tags: [CVE Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 */
router.get('/notifications', CVENotificationController.getNotifications);

/**
 * @swagger
 * /api/v1/cve/notifications:
 *   post:
 *     summary: Create CVE notification
 *     tags: [CVE Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/notifications', CVENotificationController.createNotification);

// CVE Reporting Routes
/**
 * @swagger
 * /api/v1/cve/reports:
 *   get:
 *     summary: Get CVE reports
 *     tags: [CVE Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports list
 */
router.get('/reports', CVEReportController.getReports);

/**
 * @swagger
 * /api/v1/cve/reports:
 *   post:
 *     summary: Generate CVE report
 *     tags: [CVE Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Report generation initiated
 */
router.post('/reports', CVEReportController.generateReport);

export default router;