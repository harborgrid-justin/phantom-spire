/**
 * Customer Insights Dashboard API Routes
 * Handles customer insights dashboard reporting and analytics
 */

import { Router } from 'express';
import { CustomerInsightsDashboardController } from '../../controllers/business-intelligence/customer-insights-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCustomerInsightsDashboardRoutes(): Router {
  const router = Router();
  const controller = new CustomerInsightsDashboardController();

  /**
   * @swagger
   * /api/v1/business-intelligence/customer-insights-dashboard:
   *   get:
   *     summary: Get all customer insights dashboard entries
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
   *         description: Successfully retrieved customer insights dashboard entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/customer-insights-dashboard/{id}:
   *   get:
   *     summary: Get customer insights dashboard entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: customer insights dashboard entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved customer insights dashboard entry
   *       404:
   *         description: customer insights dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/customer-insights-dashboard:
   *   post:
   *     summary: Create new customer insights dashboard entry
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
   *         description: customer insights dashboard entry created successfully
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
   * /api/v1/business-intelligence/customer-insights-dashboard/{id}:
   *   put:
   *     summary: Update customer insights dashboard entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: customer insights dashboard entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: customer insights dashboard entry updated successfully
   *       404:
   *         description: customer insights dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/customer-insights-dashboard/{id}:
   *   delete:
   *     summary: Delete customer insights dashboard entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: customer insights dashboard entry ID
   *     responses:
   *       200:
   *         description: customer insights dashboard entry deleted successfully
   *       404:
   *         description: customer insights dashboard entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/customer-insights-dashboard/analytics:
   *   get:
   *     summary: Get customer insights dashboard analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved customer insights dashboard analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
