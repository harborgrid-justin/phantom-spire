/**
 * Governance Metrics Suite API Routes
 * Handles governance metrics suite reporting and analytics
 */

import { Router } from 'express';
import { GovernanceMetricsSuiteController } from '../../controllers/compliance-audit/governance-metrics-suiteController.js';
import { authenticate } from '../../middleware/auth.js';

export function createGovernanceMetricsSuiteRoutes(): Router {
  const router = Router();
  const controller = new GovernanceMetricsSuiteController();

  /**
   * @swagger
   * /api/v1/compliance-audit/governance-metrics-suite:
   *   get:
   *     summary: Get all governance metrics suite entries
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
   *         description: Successfully retrieved governance metrics suite entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/compliance-audit/governance-metrics-suite/{id}:
   *   get:
   *     summary: Get governance metrics suite entry by ID
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: governance metrics suite entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved governance metrics suite entry
   *       404:
   *         description: governance metrics suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/compliance-audit/governance-metrics-suite:
   *   post:
   *     summary: Create new governance metrics suite entry
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
   *         description: governance metrics suite entry created successfully
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
   * /api/v1/compliance-audit/governance-metrics-suite/{id}:
   *   put:
   *     summary: Update governance metrics suite entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: governance metrics suite entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: governance metrics suite entry updated successfully
   *       404:
   *         description: governance metrics suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/compliance-audit/governance-metrics-suite/{id}:
   *   delete:
   *     summary: Delete governance metrics suite entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: governance metrics suite entry ID
   *     responses:
   *       200:
   *         description: governance metrics suite entry deleted successfully
   *       404:
   *         description: governance metrics suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/compliance-audit/governance-metrics-suite/analytics:
   *   get:
   *     summary: Get governance metrics suite analytics
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved governance metrics suite analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
