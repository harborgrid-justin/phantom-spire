/**
 * Performance Monitoring Hub API Routes
 * Handles performance monitoring hub reporting and analytics
 */

import { Router } from 'express';
import { PerformanceMonitoringHubController } from '../../controllers/operational-efficiency/performance-monitoring-hubController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPerformanceMonitoringHubRoutes(): Router {
  const router = Router();
  const controller = new PerformanceMonitoringHubController();

  /**
   * @swagger
   * /api/v1/operational-efficiency/performance-monitoring-hub:
   *   get:
   *     summary: Get all performance monitoring hub entries
   *     tags: [Operational Efficiency]
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
   *         description: Successfully retrieved performance monitoring hub entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/operational-efficiency/performance-monitoring-hub/{id}:
   *   get:
   *     summary: Get performance monitoring hub entry by ID
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance monitoring hub entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved performance monitoring hub entry
   *       404:
   *         description: performance monitoring hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/operational-efficiency/performance-monitoring-hub:
   *   post:
   *     summary: Create new performance monitoring hub entry
   *     tags: [Operational Efficiency]
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
   *         description: performance monitoring hub entry created successfully
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
   * /api/v1/operational-efficiency/performance-monitoring-hub/{id}:
   *   put:
   *     summary: Update performance monitoring hub entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance monitoring hub entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: performance monitoring hub entry updated successfully
   *       404:
   *         description: performance monitoring hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/operational-efficiency/performance-monitoring-hub/{id}:
   *   delete:
   *     summary: Delete performance monitoring hub entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: performance monitoring hub entry ID
   *     responses:
   *       200:
   *         description: performance monitoring hub entry deleted successfully
   *       404:
   *         description: performance monitoring hub entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/operational-efficiency/performance-monitoring-hub/analytics:
   *   get:
   *     summary: Get performance monitoring hub analytics
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved performance monitoring hub analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
