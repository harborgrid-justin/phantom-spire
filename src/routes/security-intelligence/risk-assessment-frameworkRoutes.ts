/**
 * Risk Assessment Framework API Routes
 * Handles risk assessment framework reporting and analytics
 */

import { Router } from 'express';
import { RiskAssessmentFrameworkController } from '../../controllers/security-intelligence/risk-assessment-frameworkController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRiskAssessmentFrameworkRoutes(): Router {
  const router = Router();
  const controller = new RiskAssessmentFrameworkController();

  /**
   * @swagger
   * /api/v1/security-intelligence/risk-assessment-framework:
   *   get:
   *     summary: Get all risk assessment framework entries
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
   *         description: Successfully retrieved risk assessment framework entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/risk-assessment-framework/{id}:
   *   get:
   *     summary: Get risk assessment framework entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: risk assessment framework entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved risk assessment framework entry
   *       404:
   *         description: risk assessment framework entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/risk-assessment-framework:
   *   post:
   *     summary: Create new risk assessment framework entry
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
   *         description: risk assessment framework entry created successfully
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
   * /api/v1/security-intelligence/risk-assessment-framework/{id}:
   *   put:
   *     summary: Update risk assessment framework entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: risk assessment framework entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: risk assessment framework entry updated successfully
   *       404:
   *         description: risk assessment framework entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/risk-assessment-framework/{id}:
   *   delete:
   *     summary: Delete risk assessment framework entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: risk assessment framework entry ID
   *     responses:
   *       200:
   *         description: risk assessment framework entry deleted successfully
   *       404:
   *         description: risk assessment framework entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/risk-assessment-framework/analytics:
   *   get:
   *     summary: Get risk assessment framework analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved risk assessment framework analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
