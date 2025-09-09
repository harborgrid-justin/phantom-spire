/**
 * Business Forecasting Suite API Routes
 * Handles business forecasting suite reporting and analytics
 */

import { Router } from 'express';
import { BusinessForecastingSuiteController } from '../../controllers/business-intelligence/business-forecasting-suiteController.js';
import { authenticate } from '../../middleware/auth.js';

export function createBusinessForecastingSuiteRoutes(): Router {
  const router = Router();
  const controller = new BusinessForecastingSuiteController();

  /**
   * @swagger
   * /api/v1/business-intelligence/business-forecasting-suite:
   *   get:
   *     summary: Get all business forecasting suite entries
   *     tags: [Business Intelligence]
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
   *         description: Successfully retrieved business forecasting suite entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-forecasting-suite/{id}:
   *   get:
   *     summary: Get business forecasting suite entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business forecasting suite entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved business forecasting suite entry
   *       404:
   *         description: business forecasting suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-forecasting-suite:
   *   post:
   *     summary: Create new business forecasting suite entry
   *     tags: [Business Intelligence]
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
   *         description: business forecasting suite entry created successfully
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
   * /api/v1/business-intelligence/business-forecasting-suite/{id}:
   *   put:
   *     summary: Update business forecasting suite entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business forecasting suite entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: business forecasting suite entry updated successfully
   *       404:
   *         description: business forecasting suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-forecasting-suite/{id}:
   *   delete:
   *     summary: Delete business forecasting suite entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business forecasting suite entry ID
   *     responses:
   *       200:
   *         description: business forecasting suite entry deleted successfully
   *       404:
   *         description: business forecasting suite entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-forecasting-suite/analytics:
   *   get:
   *     summary: Get business forecasting suite analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved business forecasting suite analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
