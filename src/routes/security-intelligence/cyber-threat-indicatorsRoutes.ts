/**
 * Cyber Threat Indicators API Routes
 * Handles cyber threat indicators reporting and analytics
 */

import { Router } from 'express';
import { CyberThreatIndicatorsController } from '../../controllers/security-intelligence/cyber-threat-indicatorsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCyberThreatIndicatorsRoutes(): Router {
  const router = Router();
  const controller = new CyberThreatIndicatorsController();

  /**
   * @swagger
   * /api/v1/security-intelligence/cyber-threat-indicators:
   *   get:
   *     summary: Get all cyber threat indicators entries
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
   *         description: Successfully retrieved cyber threat indicators entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/cyber-threat-indicators/{id}:
   *   get:
   *     summary: Get cyber threat indicators entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: cyber threat indicators entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved cyber threat indicators entry
   *       404:
   *         description: cyber threat indicators entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/cyber-threat-indicators:
   *   post:
   *     summary: Create new cyber threat indicators entry
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
   *         description: cyber threat indicators entry created successfully
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
   * /api/v1/security-intelligence/cyber-threat-indicators/{id}:
   *   put:
   *     summary: Update cyber threat indicators entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: cyber threat indicators entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: cyber threat indicators entry updated successfully
   *       404:
   *         description: cyber threat indicators entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/cyber-threat-indicators/{id}:
   *   delete:
   *     summary: Delete cyber threat indicators entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: cyber threat indicators entry ID
   *     responses:
   *       200:
   *         description: cyber threat indicators entry deleted successfully
   *       404:
   *         description: cyber threat indicators entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/cyber-threat-indicators/analytics:
   *   get:
   *     summary: Get cyber threat indicators analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved cyber threat indicators analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
