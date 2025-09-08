/**
 * Network Lifecycle Manager API Routes
 * End-to-end network infrastructure lifecycle management
 */

import { Router } from 'express';
import { NetworkLifecycleManagerController } from '../../controllers/network-management/network-lifecycle-managerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkLifecycleManagerRoutes(): Router {
  const router = Router();
  const controller = new NetworkLifecycleManagerController();

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager:
   *   get:
   *     summary: Get all network-lifecycle-manager entries
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
   *         description: Network Lifecycle Manager entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager:
   *   post:
   *     summary: Create a new network-lifecycle-manager entry
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
   *         description: Network Lifecycle Manager entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager/{id}:
   *   get:
   *     summary: Get a specific network-lifecycle-manager entry
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
   *         description: Network Lifecycle Manager entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager/{id}:
   *   put:
   *     summary: Update a network-lifecycle-manager entry
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
   *         description: Network Lifecycle Manager entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager/{id}:
   *   delete:
   *     summary: Delete a network-lifecycle-manager entry
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
   *         description: Network Lifecycle Manager entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-lifecycle-manager/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-lifecycle-manager
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
