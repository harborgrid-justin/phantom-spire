/**
 * Penetration Testing Results API Routes
 * Handles penetration testing results reporting and analytics
 */

import { Router } from 'express';
import { PenetrationTestingResultsController } from '../../controllers/security-intelligence/penetration-testing-resultsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPenetrationTestingResultsRoutes(): Router {
  const router = Router();
  const controller = new PenetrationTestingResultsController();

  /**
   * @swagger
   * /api/v1/security-intelligence/penetration-testing-results:
   *   get:
   *     summary: Get all penetration testing results entries
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
   *         description: Successfully retrieved penetration testing results entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/security-intelligence/penetration-testing-results/{id}:
   *   get:
   *     summary: Get penetration testing results entry by ID
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: penetration testing results entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved penetration testing results entry
   *       404:
   *         description: penetration testing results entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/security-intelligence/penetration-testing-results:
   *   post:
   *     summary: Create new penetration testing results entry
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
   *         description: penetration testing results entry created successfully
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
   * /api/v1/security-intelligence/penetration-testing-results/{id}:
   *   put:
   *     summary: Update penetration testing results entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: penetration testing results entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: penetration testing results entry updated successfully
   *       404:
   *         description: penetration testing results entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/security-intelligence/penetration-testing-results/{id}:
   *   delete:
   *     summary: Delete penetration testing results entry
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: penetration testing results entry ID
   *     responses:
   *       200:
   *         description: penetration testing results entry deleted successfully
   *       404:
   *         description: penetration testing results entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/security-intelligence/penetration-testing-results/analytics:
   *   get:
   *     summary: Get penetration testing results analytics
   *     tags: [Security Intelligence]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved penetration testing results analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
