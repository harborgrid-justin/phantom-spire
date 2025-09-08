/**
 * Network Bandwidth Monitor API Routes
 * Bandwidth utilization monitoring and optimization dashboard
 */

import { Router } from 'express';
import { NetworkBandwidthMonitorController } from '../../controllers/network-management/network-bandwidth-monitorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkBandwidthMonitorRoutes(): Router {
  const router = Router();
  const controller = new NetworkBandwidthMonitorController();

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor:
   *   get:
   *     summary: Get all network-bandwidth-monitor entries
   *     tags: [Network Management]
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
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Network Bandwidth Monitor entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor:
   *   post:
   *     summary: Create a new network-bandwidth-monitor entry
   *     tags: [Network Management]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [active, pending, completed]
   *               metadata:
   *                 type: object
   *     responses:
   *       201:
   *         description: Network Bandwidth Monitor entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor/{id}:
   *   get:
   *     summary: Get a specific network-bandwidth-monitor entry
   *     tags: [Network Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Network Bandwidth Monitor entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor/{id}:
   *   put:
   *     summary: Update a network-bandwidth-monitor entry
   *     tags: [Network Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Network Bandwidth Monitor entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor/{id}:
   *   delete:
   *     summary: Delete a network-bandwidth-monitor entry
   *     tags: [Network Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Network Bandwidth Monitor entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-bandwidth-monitor/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-bandwidth-monitor
   *     tags: [Network Management]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Analytics data retrieved successfully
   */
  router.get('/:id/analytics', authenticate, controller.getAnalytics);

  return router;
}
