/**
 * Business Metrics Overview API Routes
 * Handles business metrics overview reporting and analytics
 */

import { Router } from 'express';
import { BusinessMetricsOverviewController } from '../../controllers/business-intelligence/business-metrics-overviewController.js';
import { authenticate } from '../../middleware/auth.js';

export function createBusinessMetricsOverviewRoutes(): Router {
  const router = Router();
  const controller = new BusinessMetricsOverviewController();

  /**
   * @swagger
   * /api/v1/business-intelligence/business-metrics-overview:
   *   get:
   *     summary: Get all business metrics overview entries
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
   *         description: Successfully retrieved business metrics overview entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-metrics-overview/{id}:
   *   get:
   *     summary: Get business metrics overview entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business metrics overview entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved business metrics overview entry
   *       404:
   *         description: business metrics overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-metrics-overview:
   *   post:
   *     summary: Create new business metrics overview entry
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
   *         description: business metrics overview entry created successfully
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
   * /api/v1/business-intelligence/business-metrics-overview/{id}:
   *   put:
   *     summary: Update business metrics overview entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business metrics overview entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: business metrics overview entry updated successfully
   *       404:
   *         description: business metrics overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-metrics-overview/{id}:
   *   delete:
   *     summary: Delete business metrics overview entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: business metrics overview entry ID
   *     responses:
   *       200:
   *         description: business metrics overview entry deleted successfully
   *       404:
   *         description: business metrics overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/business-metrics-overview/analytics:
   *   get:
   *     summary: Get business metrics overview analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved business metrics overview analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
