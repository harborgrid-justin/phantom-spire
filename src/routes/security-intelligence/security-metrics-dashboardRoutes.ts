/**
 * Security Metrics Dashboard API Routes
 * Handles security metrics dashboard reporting and analytics
 */

import { Router } from 'express';
import { SecurityMetricsDashboardController } from '../../controllers/security-intelligence/security-metrics-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createSecurityMetricsDashboardRoutes(): Router {
  const router = Router();
  const controller = new SecurityMetricsDashboardController();

  /**
   * @swagger
   * /api/v1/security-intelligence/security-metrics-dashboard:
   *   get:
   *     summary: Get all security metrics dashboard entries
   *     tags: [Security Intelligence]
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
   *         description: Successfully retrieved security metrics dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/security-metrics-dashboard/{id}:
   *   get:
   *     summary: Get security metrics dashboard entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: security metrics dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved security metrics dashboard entry
   *       404:
   *         description: security metrics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/security-metrics-dashboard:
   *   post:
   *     summary: Create new security metrics dashboard entry
   *     tags: [Security Intelligence]
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
   *         description: security metrics dashboard entry created successfully
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
   * /api/v1/security-intelligence/security-metrics-dashboard/{id}:
   *   put:
   *     summary: Update security metrics dashboard entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: security metrics dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: security metrics dashboard entry updated successfully
   *       404:
   *         description: security metrics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/security-metrics-dashboard/{id}:
   *   delete:
   *     summary: Delete security metrics dashboard entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: security metrics dashboard entry ID
   *     responses:
   *       200:
   *         description: security metrics dashboard entry deleted successfully
   *       404:
   *         description: security metrics dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/security-metrics-dashboard/analytics:
   *   get:
   *     summary: Get security metrics dashboard analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved security metrics dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
