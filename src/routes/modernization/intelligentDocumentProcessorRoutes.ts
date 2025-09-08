/**
 * Intelligent Document Processor Routes
 * AI-powered document processing and automation
 */

import { Router } from 'express';
import { IntelligentDocumentProcessorController } from '../../controllers/modernization/intelligentDocumentProcessorController';
import { authMiddleware } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimitMiddleware } from '../../middleware/rateLimit';

const router = Router();
const controller = new IntelligentDocumentProcessorController();

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor:
 *   get:
 *     summary: Get intelligent-document-processor data
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
 *         description: Intelligent Document Processor data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', 
  authMiddleware,
  rateLimitMiddleware(100, 15), // 100 requests per 15 minutes
  controller.getIntelligentDocumentProcessor
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor:
 *   post:
 *     summary: Create new intelligent-document-processor item
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
 *         description: Intelligent Document Processor item created successfully
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
  controller.createIntelligentDocumentProcessorItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor/{id}:
 *   put:
 *     summary: Update intelligent-document-processor item
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
 *         description: Intelligent Document Processor item updated successfully
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
  controller.updateIntelligentDocumentProcessorItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor/{id}:
 *   delete:
 *     summary: Delete intelligent-document-processor item
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
 *         description: Intelligent Document Processor item deleted successfully
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
  controller.deleteIntelligentDocumentProcessorItem
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor/analytics:
 *   get:
 *     summary: Get intelligent-document-processor analytics
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
 *         description: Intelligent Document Processor analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics',
  authMiddleware,
  rateLimitMiddleware(50, 15), // 50 requests per 15 minutes
  controller.getIntelligentDocumentProcessorAnalytics
);

/**
 * @swagger
 * /api/v1/modernization/process-modernization/intelligent-document-processor/health:
 *   get:
 *     summary: Health check for intelligent-document-processor service
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