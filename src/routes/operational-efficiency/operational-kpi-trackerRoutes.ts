/**
 * Operational Kpi Tracker API Routes
 * Handles operational kpi tracker reporting and analytics
 */

import { Router } from 'express';
import { OperationalKpiTrackerController } from '../../controllers/operational-efficiency/operational-kpi-trackerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createOperationalKpiTrackerRoutes(): Router {
  const router = Router();
  const controller = new OperationalKpiTrackerController();

  /**
   * @swagger
   * /api/v1/operational-efficiency/operational-kpi-tracker:
   *   get:
   *     summary: Get all operational kpi tracker entries
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
   *         description: Successfully retrieved operational kpi tracker entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/operational-efficiency/operational-kpi-tracker/{id}:
   *   get:
   *     summary: Get operational kpi tracker entry by ID
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: operational kpi tracker entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved operational kpi tracker entry
   *       404:
   *         description: operational kpi tracker entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/operational-efficiency/operational-kpi-tracker:
   *   post:
   *     summary: Create new operational kpi tracker entry
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
   *         description: operational kpi tracker entry created successfully
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
   * /api/v1/operational-efficiency/operational-kpi-tracker/{id}:
   *   put:
   *     summary: Update operational kpi tracker entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: operational kpi tracker entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: operational kpi tracker entry updated successfully
   *       404:
   *         description: operational kpi tracker entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/operational-efficiency/operational-kpi-tracker/{id}:
   *   delete:
   *     summary: Delete operational kpi tracker entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: operational kpi tracker entry ID
   *     responses:
   *       200:
   *         description: operational kpi tracker entry deleted successfully
   *       404:
   *         description: operational kpi tracker entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/operational-efficiency/operational-kpi-tracker/analytics:
   *   get:
   *     summary: Get operational kpi tracker analytics
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved operational kpi tracker analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
