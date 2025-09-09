/**
 * Data Visualization Engine API Routes
 * Handles data visualization engine reporting and analytics
 */

import { Router } from 'express';
import { DataVisualizationEngineController } from '../../controllers/advanced-analytics/data-visualization-engineController.js';
import { authenticate } from '../../middleware/auth.js';

export function createDataVisualizationEngineRoutes(): Router {
  const router = Router();
  const controller = new DataVisualizationEngineController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/data-visualization-engine:
   *   get:
   *     summary: Get all data visualization engine entries
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
   *         description: Successfully retrieved data visualization engine entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/data-visualization-engine/{id}:
   *   get:
   *     summary: Get data visualization engine entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: data visualization engine entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved data visualization engine entry
   *       404:
   *         description: data visualization engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/data-visualization-engine:
   *   post:
   *     summary: Create new data visualization engine entry
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
   *         description: data visualization engine entry created successfully
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
   * /api/v1/advanced-analytics/data-visualization-engine/{id}:
   *   put:
   *     summary: Update data visualization engine entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: data visualization engine entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: data visualization engine entry updated successfully
   *       404:
   *         description: data visualization engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/data-visualization-engine/{id}:
   *   delete:
   *     summary: Delete data visualization engine entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: data visualization engine entry ID
   *     responses:
   *       200:
   *         description: data visualization engine entry deleted successfully
   *       404:
   *         description: data visualization engine entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/data-visualization-engine/analytics:
   *   get:
   *     summary: Get data visualization engine analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved data visualization engine analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
