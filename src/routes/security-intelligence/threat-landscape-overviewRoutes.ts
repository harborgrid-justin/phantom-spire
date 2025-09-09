/**
 * Threat Landscape Overview API Routes
 * Handles threat landscape overview reporting and analytics
 */

import { Router } from 'express';
import { ThreatLandscapeOverviewController } from '../../controllers/security-intelligence/threat-landscape-overviewController.js';
import { authenticate } from '../../middleware/auth.js';

export function createThreatLandscapeOverviewRoutes(): Router {
  const router = Router();
  const controller = new ThreatLandscapeOverviewController();

  /**
   * @swagger
   * /api/v1/security-intelligence/threat-landscape-overview:
   *   get:
   *     summary: Get all threat landscape overview entries
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
   *         description: Successfully retrieved threat landscape overview entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/threat-landscape-overview/{id}:
   *   get:
   *     summary: Get threat landscape overview entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: threat landscape overview entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved threat landscape overview entry
   *       404:
   *         description: threat landscape overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/threat-landscape-overview:
   *   post:
   *     summary: Create new threat landscape overview entry
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
   *         description: threat landscape overview entry created successfully
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
   * /api/v1/security-intelligence/threat-landscape-overview/{id}:
   *   put:
   *     summary: Update threat landscape overview entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: threat landscape overview entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: threat landscape overview entry updated successfully
   *       404:
   *         description: threat landscape overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/threat-landscape-overview/{id}:
   *   delete:
   *     summary: Delete threat landscape overview entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: threat landscape overview entry ID
   *     responses:
   *       200:
   *         description: threat landscape overview entry deleted successfully
   *       404:
   *         description: threat landscape overview entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/threat-landscape-overview/analytics:
   *   get:
   *     summary: Get threat landscape overview analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved threat landscape overview analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
