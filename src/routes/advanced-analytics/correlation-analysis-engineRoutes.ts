/**
 * Correlation Analysis Engine API Routes
 * Handles correlation analysis engine reporting and analytics
 */

import { Router } from 'express';
import { CorrelationAnalysisEngineController } from '../../controllers/advanced-analytics/correlation-analysis-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCorrelationAnalysisEngineRoutes(): Router {
  const router = Router();
  const controller = new CorrelationAnalysisEngineController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine:
   *   get:
   *     summary: Get all correlation analysis engine entries
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, pending, completed, archived]
   *         description: Filter by status
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Successfully retrieved correlation analysis engine entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine/{id}:
   *   get:
   *     summary: Get correlation analysis engine entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: correlation analysis engine entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved correlation analysis engine entry
   *       404:
   *         description: correlation analysis engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine:
   *   post:
   *     summary: Create new correlation analysis engine entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: correlation analysis engine entry created successfully
   *       400:
   *         description: Invalid input data
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine/{id}:
   *   put:
   *     summary: Update correlation analysis engine entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: correlation analysis engine entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: correlation analysis engine entry updated successfully
   *       404:
   *         description: correlation analysis engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine/{id}:
   *   delete:
   *     summary: Delete correlation analysis engine entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: correlation analysis engine entry ID
   *     responses:
   *       200:
   *         description: correlation analysis engine entry deleted successfully
   *       404:
   *         description: correlation analysis engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/correlation-analysis-engine/analytics:
   *   get:
   *     summary: Get correlation analysis engine analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved correlation analysis engine analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
