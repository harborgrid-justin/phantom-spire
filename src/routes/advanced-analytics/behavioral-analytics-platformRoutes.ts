/**
 * Behavioral Analytics Platform API Routes
 * Handles behavioral analytics platform reporting and analytics
 */

import { Router } from 'express';
import { BehavioralAnalyticsPlatformController } from '../../controllers/advanced-analytics/behavioral-analytics-platformController.js';
import { authenticate } from '../../middleware/auth.js';

export function createBehavioralAnalyticsPlatformRoutes(): Router {
  const router = Router();
  const controller = new BehavioralAnalyticsPlatformController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/behavioral-analytics-platform:
   *   get:
   *     summary: Get all behavioral analytics platform entries
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
   *         description: Successfully retrieved behavioral analytics platform entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/behavioral-analytics-platform/{id}:
   *   get:
   *     summary: Get behavioral analytics platform entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: behavioral analytics platform entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved behavioral analytics platform entry
   *       404:
   *         description: behavioral analytics platform entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/behavioral-analytics-platform:
   *   post:
   *     summary: Create new behavioral analytics platform entry
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
   *         description: behavioral analytics platform entry created successfully
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
   * /api/v1/advanced-analytics/behavioral-analytics-platform/{id}:
   *   put:
   *     summary: Update behavioral analytics platform entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: behavioral analytics platform entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: behavioral analytics platform entry updated successfully
   *       404:
   *         description: behavioral analytics platform entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/behavioral-analytics-platform/{id}:
   *   delete:
   *     summary: Delete behavioral analytics platform entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: behavioral analytics platform entry ID
   *     responses:
   *       200:
   *         description: behavioral analytics platform entry deleted successfully
   *       404:
   *         description: behavioral analytics platform entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/behavioral-analytics-platform/analytics:
   *   get:
   *     summary: Get behavioral analytics platform analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved behavioral analytics platform analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
