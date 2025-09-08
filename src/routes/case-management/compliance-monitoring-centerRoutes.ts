/**
 * Compliance Monitoring Center API Routes
 * Handles regulatory compliance tracking and monitoring
 */

import { Router } from 'express';
import { ComplianceMonitoringCenterController } from '../../controllers/case-management/compliance-monitoring-centerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createComplianceMonitoringCenterRoutes(): Router {
  const router = Router();
  const controller = new ComplianceMonitoringCenterController();

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center:
   *   get:
   *     summary: Get all compliance monitoring center entries
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
   *         description: Compliance Monitoring Center entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center:
   *   post:
   *     summary: Create a new compliance monitoring center entry
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
   *         description: Compliance Monitoring Center entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center/{id}:
   *   get:
   *     summary: Get a specific compliance monitoring center entry
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
   *         description: Compliance Monitoring Center entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center/{id}:
   *   put:
   *     summary: Update a compliance monitoring center entry
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
   *         description: Compliance Monitoring Center entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center/{id}:
   *   delete:
   *     summary: Delete a compliance monitoring center entry
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
   *         description: Compliance Monitoring Center entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/compliance-monitoring-center/{id}/analytics:
   *   get:
   *     summary: Get analytics for compliance monitoring center
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
