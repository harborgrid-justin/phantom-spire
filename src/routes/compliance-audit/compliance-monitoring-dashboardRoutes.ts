/**
 * Compliance Monitoring Dashboard API Routes
 * Handles compliance monitoring dashboard reporting and analytics
 */

import { Router } from 'express';
import { ComplianceMonitoringDashboardController } from '../../controllers/compliance-audit/compliance-monitoring-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createComplianceMonitoringDashboardRoutes(): Router {
  const router = Router();
  const controller = new ComplianceMonitoringDashboardController();

  /**
   * @swagger
   * /api/v1/compliance-audit/compliance-monitoring-dashboard:
   *   get:
   *     summary: Get all compliance monitoring dashboard entries
   *     tags: [Compliance Audit]
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
   *         description: Successfully retrieved compliance monitoring dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/compliance-audit/compliance-monitoring-dashboard/{id}:
   *   get:
   *     summary: Get compliance monitoring dashboard entry by ID
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: compliance monitoring dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved compliance monitoring dashboard entry
   *       404:
   *         description: compliance monitoring dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/compliance-audit/compliance-monitoring-dashboard:
   *   post:
   *     summary: Create new compliance monitoring dashboard entry
   *     tags: [Compliance Audit]
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
   *         description: compliance monitoring dashboard entry created successfully
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
   * /api/v1/compliance-audit/compliance-monitoring-dashboard/{id}:
   *   put:
   *     summary: Update compliance monitoring dashboard entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: compliance monitoring dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: compliance monitoring dashboard entry updated successfully
   *       404:
   *         description: compliance monitoring dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/compliance-audit/compliance-monitoring-dashboard/{id}:
   *   delete:
   *     summary: Delete compliance monitoring dashboard entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: compliance monitoring dashboard entry ID
   *     responses:
   *       200:
   *         description: compliance monitoring dashboard entry deleted successfully
   *       404:
   *         description: compliance monitoring dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/compliance-audit/compliance-monitoring-dashboard/analytics:
   *   get:
   *     summary: Get compliance monitoring dashboard analytics
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved compliance monitoring dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
