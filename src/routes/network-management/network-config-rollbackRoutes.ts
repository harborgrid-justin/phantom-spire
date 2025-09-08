/**
 * Network Config Rollback API Routes
 * Network configuration rollback and disaster recovery system
 */

import { Router } from 'express';
import { NetworkConfigRollbackController } from '../../controllers/network-management/network-config-rollbackController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkConfigRollbackRoutes(): Router {
  const router = Router();
  const controller = new NetworkConfigRollbackController();

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback:
   *   get:
   *     summary: Get all network-config-rollback entries
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
   *         description: Network Config Rollback entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback:
   *   post:
   *     summary: Create a new network-config-rollback entry
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
   *         description: Network Config Rollback entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback/{id}:
   *   get:
   *     summary: Get a specific network-config-rollback entry
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
   *         description: Network Config Rollback entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback/{id}:
   *   put:
   *     summary: Update a network-config-rollback entry
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
   *         description: Network Config Rollback entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback/{id}:
   *   delete:
   *     summary: Delete a network-config-rollback entry
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
   *         description: Network Config Rollback entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-config-rollback/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-config-rollback
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
