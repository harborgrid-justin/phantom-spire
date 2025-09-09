/**
 * Policy Adherence Reports API Routes
 * Handles policy adherence reports reporting and analytics
 */

import { Router } from 'express';
import { PolicyAdherenceReportsController } from '../../controllers/compliance-audit/policy-adherence-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPolicyAdherenceReportsRoutes(): Router {
  const router = Router();
  const controller = new PolicyAdherenceReportsController();

  /**
   * @swagger
   * /api/v1/compliance-audit/policy-adherence-reports:
   *   get:
   *     summary: Get all policy adherence reports entries
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
   *         description: Successfully retrieved policy adherence reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/compliance-audit/policy-adherence-reports/{id}:
   *   get:
   *     summary: Get policy adherence reports entry by ID
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: policy adherence reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved policy adherence reports entry
   *       404:
   *         description: policy adherence reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/compliance-audit/policy-adherence-reports:
   *   post:
   *     summary: Create new policy adherence reports entry
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
   *         description: policy adherence reports entry created successfully
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
   * /api/v1/compliance-audit/policy-adherence-reports/{id}:
   *   put:
   *     summary: Update policy adherence reports entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: policy adherence reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: policy adherence reports entry updated successfully
   *       404:
   *         description: policy adherence reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/compliance-audit/policy-adherence-reports/{id}:
   *   delete:
   *     summary: Delete policy adherence reports entry
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: policy adherence reports entry ID
   *     responses:
   *       200:
   *         description: policy adherence reports entry deleted successfully
   *       404:
   *         description: policy adherence reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/compliance-audit/policy-adherence-reports/analytics:
   *   get:
   *     summary: Get policy adherence reports analytics
   *     tags: [Compliance Audit]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved policy adherence reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
