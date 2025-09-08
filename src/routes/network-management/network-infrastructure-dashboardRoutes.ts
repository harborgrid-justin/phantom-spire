/**
 * Network Infrastructure Dashboard API Routes
 * Centralized network infrastructure monitoring and management dashboard
 */

import { Router } from 'express';
import { NetworkInfrastructureDashboardController } from '../../controllers/network-management/network-infrastructure-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkInfrastructureDashboardRoutes(): Router {
  const router = Router();
  const controller = new NetworkInfrastructureDashboardController();

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard:
   *   get:
   *     summary: Get all network-infrastructure-dashboard entries
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
   *         description: Network Infrastructure Dashboard entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard:
   *   post:
   *     summary: Create a new network-infrastructure-dashboard entry
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
   *         description: Network Infrastructure Dashboard entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard/{id}:
   *   get:
   *     summary: Get a specific network-infrastructure-dashboard entry
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
   *         description: Network Infrastructure Dashboard entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard/{id}:
   *   put:
   *     summary: Update a network-infrastructure-dashboard entry
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
   *         description: Network Infrastructure Dashboard entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard/{id}:
   *   delete:
   *     summary: Delete a network-infrastructure-dashboard entry
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
   *         description: Network Infrastructure Dashboard entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-infrastructure-dashboard/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-infrastructure-dashboard
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
