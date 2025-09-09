/**
 * Efficiency Benchmarking API Routes
 * Handles efficiency benchmarking reporting and analytics
 */

import { Router } from 'express';
import { EfficiencyBenchmarkingController } from '../../controllers/operational-efficiency/efficiency-benchmarkingController.js';
import { authenticate } from '../../middleware/auth.js';

export function createEfficiencyBenchmarkingRoutes(): Router {
  const router = Router();
  const controller = new EfficiencyBenchmarkingController();

  /**
   * @swagger
   * /api/v1/operational-efficiency/efficiency-benchmarking:
   *   get:
   *     summary: Get all efficiency benchmarking entries
   *     tags: [Operational Efficiency]
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
   *         description: Successfully retrieved efficiency benchmarking entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/operational-efficiency/efficiency-benchmarking/{id}:
   *   get:
   *     summary: Get efficiency benchmarking entry by ID
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: efficiency benchmarking entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved efficiency benchmarking entry
   *       404:
   *         description: efficiency benchmarking entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/operational-efficiency/efficiency-benchmarking:
   *   post:
   *     summary: Create new efficiency benchmarking entry
   *     tags: [Operational Efficiency]
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
   *         description: efficiency benchmarking entry created successfully
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
   * /api/v1/operational-efficiency/efficiency-benchmarking/{id}:
   *   put:
   *     summary: Update efficiency benchmarking entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: efficiency benchmarking entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: efficiency benchmarking entry updated successfully
   *       404:
   *         description: efficiency benchmarking entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/operational-efficiency/efficiency-benchmarking/{id}:
   *   delete:
   *     summary: Delete efficiency benchmarking entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: efficiency benchmarking entry ID
   *     responses:
   *       200:
   *         description: efficiency benchmarking entry deleted successfully
   *       404:
   *         description: efficiency benchmarking entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/operational-efficiency/efficiency-benchmarking/analytics:
   *   get:
   *     summary: Get efficiency benchmarking analytics
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved efficiency benchmarking analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
