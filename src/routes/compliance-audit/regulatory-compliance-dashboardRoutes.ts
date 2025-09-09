/**
 * Regulatory Compliance Dashboard API Routes
 * Handles regulatory compliance dashboard reporting and analytics
 */

import { Router } from 'express';
import { RegulatoryComplianceDashboardController } from '../../controllers/compliance-audit/regulatory-compliance-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRegulatoryComplianceDashboardRoutes(): Router {
  const router = Router();
  const controller = new RegulatoryComplianceDashboardController();

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-compliance-dashboard:
   *   get:
   *     summary: Get all regulatory compliance dashboard entries
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
   *         description: Successfully retrieved regulatory compliance dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-compliance-dashboard/{id}:
   *   get:
   *     summary: Get regulatory compliance dashboard entry by ID
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory compliance dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved regulatory compliance dashboard entry
   *       404:
   *         description: regulatory compliance dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-compliance-dashboard:
   *   post:
   *     summary: Create new regulatory compliance dashboard entry
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
   *         description: regulatory compliance dashboard entry created successfully
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
   * /api/v1/compliance-audit/regulatory-compliance-dashboard/{id}:
   *   put:
   *     summary: Update regulatory compliance dashboard entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory compliance dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: regulatory compliance dashboard entry updated successfully
   *       404:
   *         description: regulatory compliance dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-compliance-dashboard/{id}:
   *   delete:
   *     summary: Delete regulatory compliance dashboard entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory compliance dashboard entry ID
   *     responses:
   *       200:
   *         description: regulatory compliance dashboard entry deleted successfully
   *       404:
   *         description: regulatory compliance dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-compliance-dashboard/analytics:
   *   get:
   *     summary: Get regulatory compliance dashboard analytics
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved regulatory compliance dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
