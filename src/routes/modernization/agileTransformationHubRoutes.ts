/**
 * Agile Transformation Hub Routes
 * Agile methodology adoption and team transformation
 */

import { Router } from 'express';
import { AgileTransformationHubController } from '../../controllers/modernization/agileTransformationHubController';
import { authMiddleware } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';

const router = Router();
const controller = new AgileTransformationHubController();

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub:
 *   get:
 *     summary: Get agile-transformation-hub data
 *     tags: [Modernization - process-modernization]
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
 *         description: Agile Transformation Hub data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware,
  rateLimitMiddleware(100, 15), // 100 requests per 15 minutes
  controller.getAgileTransformationHub
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub:
 *   post:
 *     summary: Create new agile-transformation-hub item
 *     tags: [Modernization - process-modernization]
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
 *         description: Agile Transformation Hub item created successfully
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
  controller.createAgileTransformationHubItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub/{id}:
 *   put:
 *     summary: Update agile-transformation-hub item
 *     tags: [Modernization - process-modernization]
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
 *         description: Agile Transformation Hub item updated successfully
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
  controller.updateAgileTransformationHubItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub/{id}:
 *   delete:
 *     summary: Delete agile-transformation-hub item
 *     tags: [Modernization - process-modernization]
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
 *         description: Agile Transformation Hub item deleted successfully
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
  controller.deleteAgileTransformationHubItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub/analytics:
 *   get:
 *     summary: Get agile-transformation-hub analytics
 *     tags: [Modernization - process-modernization]
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
 *         description: Agile Transformation Hub analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics',
  authMiddleware,
  rateLimitMiddleware(50, 15), // 50 requests per 15 minutes
  controller.getAgileTransformationHubAnalytics
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/agile-transformation-hub/health:
 *   get:
 *     summary: Health check for agile-transformation-hub service
 *     tags: [Modernization - process-modernization]
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