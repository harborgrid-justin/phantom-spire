/**
 * Predictive Modeling Reports API Routes
 * Handles predictive modeling reports reporting and analytics
 */

import { Router } from 'express';
import { PredictiveModelingReportsController } from '../../controllers/advanced-analytics/predictive-modeling-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPredictiveModelingReportsRoutes(): Router {
  const router = Router();
  const controller = new PredictiveModelingReportsController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/predictive-modeling-reports:
   *   get:
   *     summary: Get all predictive modeling reports entries
   *     tags: [Advanced Analytics]
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
   *         description: Successfully retrieved predictive modeling reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/predictive-modeling-reports/{id}:
   *   get:
   *     summary: Get predictive modeling reports entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: predictive modeling reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved predictive modeling reports entry
   *       404:
   *         description: predictive modeling reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/predictive-modeling-reports:
   *   post:
   *     summary: Create new predictive modeling reports entry
   *     tags: [Advanced Analytics]
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
   *         description: predictive modeling reports entry created successfully
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
   * /api/v1/advanced-analytics/predictive-modeling-reports/{id}:
   *   put:
   *     summary: Update predictive modeling reports entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: predictive modeling reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: predictive modeling reports entry updated successfully
   *       404:
   *         description: predictive modeling reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/predictive-modeling-reports/{id}:
   *   delete:
   *     summary: Delete predictive modeling reports entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: predictive modeling reports entry ID
   *     responses:
   *       200:
   *         description: predictive modeling reports entry deleted successfully
   *       404:
   *         description: predictive modeling reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/predictive-modeling-reports/analytics:
   *   get:
   *     summary: Get predictive modeling reports analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved predictive modeling reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
