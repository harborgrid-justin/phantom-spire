/**
 * Regulatory Reporting Engine API Routes
 * Handles regulatory reporting engine reporting and analytics
 */

import { Router } from 'express';
import { RegulatoryReportingEngineController } from '../../controllers/compliance-audit/regulatory-reporting-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRegulatoryReportingEngineRoutes(): Router {
  const router = Router();
  const controller = new RegulatoryReportingEngineController();

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-reporting-engine:
   *   get:
   *     summary: Get all regulatory reporting engine entries
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
   *         description: Successfully retrieved regulatory reporting engine entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-reporting-engine/{id}:
   *   get:
   *     summary: Get regulatory reporting engine entry by ID
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory reporting engine entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved regulatory reporting engine entry
   *       404:
   *         description: regulatory reporting engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-reporting-engine:
   *   post:
   *     summary: Create new regulatory reporting engine entry
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
   *         description: regulatory reporting engine entry created successfully
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
   * /api/v1/compliance-audit/regulatory-reporting-engine/{id}:
   *   put:
   *     summary: Update regulatory reporting engine entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory reporting engine entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: regulatory reporting engine entry updated successfully
   *       404:
   *         description: regulatory reporting engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-reporting-engine/{id}:
   *   delete:
   *     summary: Delete regulatory reporting engine entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: regulatory reporting engine entry ID
   *     responses:
   *       200:
   *         description: regulatory reporting engine entry deleted successfully
   *       404:
   *         description: regulatory reporting engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/compliance-audit/regulatory-reporting-engine/analytics:
   *   get:
   *     summary: Get regulatory reporting engine analytics
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved regulatory reporting engine analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
