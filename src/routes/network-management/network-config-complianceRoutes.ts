/**
 * Network Config Compliance API Routes
 * Network configuration compliance monitoring and enforcement
 */

import { Router } from 'express';
import { NetworkConfigComplianceController } from '../../controllers/network-management/network-config-complianceController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkConfigComplianceRoutes(): Router {
  const router = Router();
  const controller = new NetworkConfigComplianceController();

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance:
   *   get:
   *     summary: Get all network-config-compliance entries
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
   *         description: Network Config Compliance entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance:
   *   post:
   *     summary: Create a new network-config-compliance entry
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
   *         description: Network Config Compliance entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance/{id}:
   *   get:
   *     summary: Get a specific network-config-compliance entry
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
   *         description: Network Config Compliance entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance/{id}:
   *   put:
   *     summary: Update a network-config-compliance entry
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
   *         description: Network Config Compliance entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance/{id}:
   *   delete:
   *     summary: Delete a network-config-compliance entry
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
   *         description: Network Config Compliance entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-config-compliance/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-config-compliance
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
