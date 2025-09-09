/**
 * Anomaly Detection Reports API Routes
 * Handles anomaly detection reports reporting and analytics
 */

import { Router } from 'express';
import { AnomalyDetectionReportsController } from '../../controllers/advanced-analytics/anomaly-detection-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createAnomalyDetectionReportsRoutes(): Router {
  const router = Router();
  const controller = new AnomalyDetectionReportsController();

  /**
   * @swagger
   * /api/v1/advanced-analytics/anomaly-detection-reports:
   *   get:
   *     summary: Get all anomaly detection reports entries
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
   *         description: Successfully retrieved anomaly detection reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/advanced-analytics/anomaly-detection-reports/{id}:
   *   get:
   *     summary: Get anomaly detection reports entry by ID
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: anomaly detection reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved anomaly detection reports entry
   *       404:
   *         description: anomaly detection reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/advanced-analytics/anomaly-detection-reports:
   *   post:
   *     summary: Create new anomaly detection reports entry
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
   *         description: anomaly detection reports entry created successfully
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
   * /api/v1/advanced-analytics/anomaly-detection-reports/{id}:
   *   put:
   *     summary: Update anomaly detection reports entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: anomaly detection reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: anomaly detection reports entry updated successfully
   *       404:
   *         description: anomaly detection reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/advanced-analytics/anomaly-detection-reports/{id}:
   *   delete:
   *     summary: Delete anomaly detection reports entry
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: anomaly detection reports entry ID
   *     responses:
   *       200:
   *         description: anomaly detection reports entry deleted successfully
   *       404:
   *         description: anomaly detection reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/advanced-analytics/anomaly-detection-reports/analytics:
   *   get:
   *     summary: Get anomaly detection reports analytics
   *     tags: [Advanced Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved anomaly detection reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
