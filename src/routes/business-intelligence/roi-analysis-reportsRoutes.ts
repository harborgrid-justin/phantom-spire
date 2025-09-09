/**
 * Roi Analysis Reports API Routes
 * Handles roi analysis reports reporting and analytics
 */

import { Router } from 'express';
import { RoiAnalysisReportsController } from '../../controllers/business-intelligence/roi-analysis-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRoiAnalysisReportsRoutes(): Router {
  const router = Router();
  const controller = new RoiAnalysisReportsController();

  /**
   * @swagger
   * /api/v1/business-intelligence/roi-analysis-reports:
   *   get:
   *     summary: Get all roi analysis reports entries
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
   *         description: Successfully retrieved roi analysis reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/business-intelligence/roi-analysis-reports/{id}:
   *   get:
   *     summary: Get roi analysis reports entry by ID
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: roi analysis reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved roi analysis reports entry
   *       404:
   *         description: roi analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/business-intelligence/roi-analysis-reports:
   *   post:
   *     summary: Create new roi analysis reports entry
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
   *         description: roi analysis reports entry created successfully
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
   * /api/v1/business-intelligence/roi-analysis-reports/{id}:
   *   put:
   *     summary: Update roi analysis reports entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: roi analysis reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: roi analysis reports entry updated successfully
   *       404:
   *         description: roi analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/business-intelligence/roi-analysis-reports/{id}:
   *   delete:
   *     summary: Delete roi analysis reports entry
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: roi analysis reports entry ID
   *     responses:
   *       200:
   *         description: roi analysis reports entry deleted successfully
   *       404:
   *         description: roi analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/business-intelligence/roi-analysis-reports/analytics:
   *   get:
   *     summary: Get roi analysis reports analytics
   *     tags: [Business Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved roi analysis reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
