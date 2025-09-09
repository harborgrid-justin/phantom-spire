/**
 * Real Time Analytics Hub API Routes
 * Handles real time analytics hub reporting and analytics
 */

import { Router } from 'express';
import { RealTimeAnalyticsHubController } from '../../controllers/advanced-analytics/real-time-analytics-hubController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRealTimeAnalyticsHubRoutes(): Router {
  const router = Router();
  const controller = new RealTimeAnalyticsHubController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/real-time-analytics-hub:
   *   get:
   *     summary: Get all real time analytics hub entries
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
   *         description: Successfully retrieved real time analytics hub entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/real-time-analytics-hub/{id}:
   *   get:
   *     summary: Get real time analytics hub entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: real time analytics hub entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved real time analytics hub entry
   *       404:
   *         description: real time analytics hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/real-time-analytics-hub:
   *   post:
   *     summary: Create new real time analytics hub entry
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
   *         description: real time analytics hub entry created successfully
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
   * /api/v1/advanced-analytics/real-time-analytics-hub/{id}:
   *   put:
   *     summary: Update real time analytics hub entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: real time analytics hub entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: real time analytics hub entry updated successfully
   *       404:
   *         description: real time analytics hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/real-time-analytics-hub/{id}:
   *   delete:
   *     summary: Delete real time analytics hub entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: real time analytics hub entry ID
   *     responses:
   *       200:
   *         description: real time analytics hub entry deleted successfully
   *       404:
   *         description: real time analytics hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/real-time-analytics-hub/analytics:
   *   get:
   *     summary: Get real time analytics hub analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved real time analytics hub analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
