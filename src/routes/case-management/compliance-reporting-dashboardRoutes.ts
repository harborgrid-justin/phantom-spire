/**
 * Compliance Reporting Dashboard API Routes
 * Handles regulatory reporting and submission tracking
 */

import { Router } from 'express';
import { ComplianceReportingDashboardController } from '../../controllers/case-management/compliance-reporting-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createComplianceReportingDashboardRoutes(): Router {
  const router = Router();
  const controller = new ComplianceReportingDashboardController();

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard:
   *   get:
   *     summary: Get all compliance reporting dashboard entries
   *     tags: [Case Management]
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
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Compliance Reporting Dashboard entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard:
   *   post:
   *     summary: Create a new compliance reporting dashboard entry
   *     tags: [Case Management]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [active, pending, completed]
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Compliance Reporting Dashboard entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard/{id}:
   *   get:
   *     summary: Get a specific compliance reporting dashboard entry
   *     tags: [Case Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Compliance Reporting Dashboard entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard/{id}:
   *   put:
   *     summary: Update a compliance reporting dashboard entry
   *     tags: [Case Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Compliance Reporting Dashboard entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard/{id}:
   *   delete:
   *     summary: Delete a compliance reporting dashboard entry
   *     tags: [Case Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Compliance Reporting Dashboard entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/compliance-reporting-dashboard/{id}/analytics:
   *   get:
   *     summary: Get analytics for compliance reporting dashboard
   *     tags: [Case Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Analytics data retrieved successfully
   */
  router.get('/:id/analytics', authenticate, controller.getAnalytics);

  return router;
}
