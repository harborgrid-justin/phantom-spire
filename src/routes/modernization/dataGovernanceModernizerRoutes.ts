/**
 * Data Governance Modernizer Routes
 * Modern data governance and compliance framework
 */

import { Router } from 'express';
import { DataGovernanceModernizerController } from '../../controllers/modernization/dataGovernanceModernizerController';
import { authMiddleware } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';

const router = Router();
const controller = new DataGovernanceModernizerController();

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer:
 *   get:
 *     summary: Get data-governance-modernizer data
 *     tags: [Modernization - data-modernization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of items to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Data Governance Modernizer data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware,
  rateLimitMiddleware(100, 15), // 100 requests per 15 minutes
  controller.getDataGovernanceModernizer
);

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer:
 *   post:
 *     summary: Create new data-governance-modernizer item
 *     tags: [Modernization - data-modernization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Data Governance Modernizer item created successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authMiddleware,
  rateLimitMiddleware(20, 15), // 20 requests per 15 minutes
  validateRequest(['name', 'description']),
  controller.createDataGovernanceModernizerItem
);

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer/{id}:
 *   put:
 *     summary: Update data-governance-modernizer item
 *     tags: [Modernization - data-modernization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
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
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, failed, draft, in-progress]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: Data Governance Modernizer item updated successfully
 *       400:
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authMiddleware,
  rateLimitMiddleware(30, 15), // 30 requests per 15 minutes
  controller.updateDataGovernanceModernizerItem
);

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer/{id}:
 *   delete:
 *     summary: Delete data-governance-modernizer item
 *     tags: [Modernization - data-modernization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Data Governance Modernizer item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authMiddleware,
  rateLimitMiddleware(10, 15), // 10 requests per 15 minutes
  controller.deleteDataGovernanceModernizerItem
);

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer/analytics:
 *   get:
 *     summary: Get data-governance-modernizer analytics
 *     tags: [Modernization - data-modernization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Time range for analytics
 *       - in: query
 *         name: metrics
 *         schema:
 *           type: string
 *         description: Specific metrics to include
 *     responses:
 *       200:
 *         description: Data Governance Modernizer analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics',
  authMiddleware,
  rateLimitMiddleware(50, 15), // 50 requests per 15 minutes
  controller.getDataGovernanceModernizerAnalytics
);

/**
 * @swagger
 * /api/v1/modernization/data-modernization/data-governance-modernizer/health:
 *   get:
 *     summary: Health check for data-governance-modernizer service
 *     tags: [Modernization - data-modernization]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health',
  rateLimitMiddleware(200, 15), // 200 requests per 15 minutes
  controller.healthCheck
);

export default router;