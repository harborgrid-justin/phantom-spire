/**
 * Performance Analytics Dashboard API Routes
 * Handles performance analytics dashboard reporting and analytics
 */

import { Router } from 'express';
import { PerformanceAnalyticsDashboardController } from '../../controllers/advanced-analytics/performance-analytics-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPerformanceAnalyticsDashboardRoutes(): Router {
  const router = Router();
  const controller = new PerformanceAnalyticsDashboardController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/performance-analytics-dashboard:
   *   get:
   *     summary: Get all performance analytics dashboard entries
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
   *         description: Successfully retrieved performance analytics dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/performance-analytics-dashboard/{id}:
   *   get:
   *     summary: Get performance analytics dashboard entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance analytics dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved performance analytics dashboard entry
   *       404:
   *         description: performance analytics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/performance-analytics-dashboard:
   *   post:
   *     summary: Create new performance analytics dashboard entry
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
   *         description: performance analytics dashboard entry created successfully
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
   * /api/v1/advanced-analytics/performance-analytics-dashboard/{id}:
   *   put:
   *     summary: Update performance analytics dashboard entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance analytics dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: performance analytics dashboard entry updated successfully
   *       404:
   *         description: performance analytics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/performance-analytics-dashboard/{id}:
   *   delete:
   *     summary: Delete performance analytics dashboard entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance analytics dashboard entry ID
   *     responses:
   *       200:
   *         description: performance analytics dashboard entry deleted successfully
   *       404:
   *         description: performance analytics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/performance-analytics-dashboard/analytics:
   *   get:
   *     summary: Get performance analytics dashboard analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved performance analytics dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
