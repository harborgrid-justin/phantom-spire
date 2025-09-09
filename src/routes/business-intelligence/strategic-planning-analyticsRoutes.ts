/**
 * Strategic Planning Analytics API Routes
 * Handles strategic planning analytics reporting and analytics
 */

import { Router } from 'express';
import { StrategicPlanningAnalyticsController } from '../../controllers/business-intelligence/strategic-planning-analyticsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createStrategicPlanningAnalyticsRoutes(): Router {
  const router = Router();
  const controller = new StrategicPlanningAnalyticsController();

  /**
   * @swagger
   * /api/v1/business-intelligence/strategic-planning-analytics:
   *   get:
   *     summary: Get all strategic planning analytics entries
   *     tags: [Business Intelligence]
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
   *         description: Successfully retrieved strategic planning analytics entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/strategic-planning-analytics/{id}:
   *   get:
   *     summary: Get strategic planning analytics entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: strategic planning analytics entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved strategic planning analytics entry
   *       404:
   *         description: strategic planning analytics entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/strategic-planning-analytics:
   *   post:
   *     summary: Create new strategic planning analytics entry
   *     tags: [Business Intelligence]
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
   *         description: strategic planning analytics entry created successfully
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
   * /api/v1/business-intelligence/strategic-planning-analytics/{id}:
   *   put:
   *     summary: Update strategic planning analytics entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: strategic planning analytics entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: strategic planning analytics entry updated successfully
   *       404:
   *         description: strategic planning analytics entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/strategic-planning-analytics/{id}:
   *   delete:
   *     summary: Delete strategic planning analytics entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: strategic planning analytics entry ID
   *     responses:
   *       200:
   *         description: strategic planning analytics entry deleted successfully
   *       404:
   *         description: strategic planning analytics entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/strategic-planning-analytics/analytics:
   *   get:
   *     summary: Get strategic planning analytics analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved strategic planning analytics analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
