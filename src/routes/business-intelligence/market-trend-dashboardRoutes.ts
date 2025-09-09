/**
 * Market Trend Dashboard API Routes
 * Handles market trend dashboard reporting and analytics
 */

import { Router } from 'express';
import { MarketTrendDashboardController } from '../../controllers/business-intelligence/market-trend-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createMarketTrendDashboardRoutes(): Router {
  const router = Router();
  const controller = new MarketTrendDashboardController();

  /**
   * @swagger
   * /api/v1/business-intelligence/market-trend-dashboard:
   *   get:
   *     summary: Get all market trend dashboard entries
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
   *         description: Successfully retrieved market trend dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/market-trend-dashboard/{id}:
   *   get:
   *     summary: Get market trend dashboard entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: market trend dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved market trend dashboard entry
   *       404:
   *         description: market trend dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/market-trend-dashboard:
   *   post:
   *     summary: Create new market trend dashboard entry
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
   *         description: market trend dashboard entry created successfully
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
   * /api/v1/business-intelligence/market-trend-dashboard/{id}:
   *   put:
   *     summary: Update market trend dashboard entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: market trend dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: market trend dashboard entry updated successfully
   *       404:
   *         description: market trend dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/market-trend-dashboard/{id}:
   *   delete:
   *     summary: Delete market trend dashboard entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: market trend dashboard entry ID
   *     responses:
   *       200:
   *         description: market trend dashboard entry deleted successfully
   *       404:
   *         description: market trend dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/market-trend-dashboard/analytics:
   *   get:
   *     summary: Get market trend dashboard analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved market trend dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
