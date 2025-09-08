/**
 * Cloud Cost Optimizer Routes
 * Cloud cost optimization and FinOps management
 */

import { Router } from 'express';
import { CloudCostOptimizerController } from '../../controllers/modernization/cloudCostOptimizerController';
import { authMiddleware } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';

const router = Router();
const controller = new CloudCostOptimizerController();

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer:
 *   get:
 *     summary: Get cloud-cost-optimizer data
 *     tags: [Modernization - cloud-migration]
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
 *         description: Cloud Cost Optimizer data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware,
  rateLimitMiddleware(100, 15), // 100 requests per 15 minutes
  controller.getCloudCostOptimizer
);

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer:
 *   post:
 *     summary: Create new cloud-cost-optimizer item
 *     tags: [Modernization - cloud-migration]
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
 *         description: Cloud Cost Optimizer item created successfully
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
  controller.createCloudCostOptimizerItem
);

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer/{id}:
 *   put:
 *     summary: Update cloud-cost-optimizer item
 *     tags: [Modernization - cloud-migration]
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
 *         description: Cloud Cost Optimizer item updated successfully
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
  controller.updateCloudCostOptimizerItem
);

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer/{id}:
 *   delete:
 *     summary: Delete cloud-cost-optimizer item
 *     tags: [Modernization - cloud-migration]
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
 *         description: Cloud Cost Optimizer item deleted successfully
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
  controller.deleteCloudCostOptimizerItem
);

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer/analytics:
 *   get:
 *     summary: Get cloud-cost-optimizer analytics
 *     tags: [Modernization - cloud-migration]
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
 *         description: Cloud Cost Optimizer analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics',
  authMiddleware,
  rateLimitMiddleware(50, 15), // 50 requests per 15 minutes
  controller.getCloudCostOptimizerAnalytics
);

/**
 * @swagger
 * /api/v1/modernization/cloud-migration/cloud-cost-optimizer/health:
 *   get:
 *     summary: Health check for cloud-cost-optimizer service
 *     tags: [Modernization - cloud-migration]
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