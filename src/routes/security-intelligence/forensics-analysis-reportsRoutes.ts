/**
 * Forensics Analysis Reports API Routes
 * Handles forensics analysis reports reporting and analytics
 */

import { Router } from 'express';
import { ForensicsAnalysisReportsController } from '../../controllers/security-intelligence/forensics-analysis-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createForensicsAnalysisReportsRoutes(): Router {
  const router = Router();
  const controller = new ForensicsAnalysisReportsController();

  /**
   * @swagger
   * /api/v1/security-intelligence/forensics-analysis-reports:
   *   get:
   *     summary: Get all forensics analysis reports entries
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
   *         description: Successfully retrieved forensics analysis reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/forensics-analysis-reports/{id}:
   *   get:
   *     summary: Get forensics analysis reports entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: forensics analysis reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved forensics analysis reports entry
   *       404:
   *         description: forensics analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/forensics-analysis-reports:
   *   post:
   *     summary: Create new forensics analysis reports entry
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
   *         description: forensics analysis reports entry created successfully
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
   * /api/v1/security-intelligence/forensics-analysis-reports/{id}:
   *   put:
   *     summary: Update forensics analysis reports entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: forensics analysis reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: forensics analysis reports entry updated successfully
   *       404:
   *         description: forensics analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/forensics-analysis-reports/{id}:
   *   delete:
   *     summary: Delete forensics analysis reports entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: forensics analysis reports entry ID
   *     responses:
   *       200:
   *         description: forensics analysis reports entry deleted successfully
   *       404:
   *         description: forensics analysis reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/forensics-analysis-reports/analytics:
   *   get:
   *     summary: Get forensics analysis reports analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved forensics analysis reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
