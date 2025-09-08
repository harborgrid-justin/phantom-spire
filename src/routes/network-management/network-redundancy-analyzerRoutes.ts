/**
 * Network Redundancy Analyzer API Routes
 * Network redundancy analysis and high availability planning
 */

import { Router } from 'express';
import { NetworkRedundancyAnalyzerController } from '../../controllers/network-management/network-redundancy-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkRedundancyAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new NetworkRedundancyAnalyzerController();

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer:
   *   get:
   *     summary: Get all network-redundancy-analyzer entries
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
   *         description: Network Redundancy Analyzer entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer:
   *   post:
   *     summary: Create a new network-redundancy-analyzer entry
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
   *         description: Network Redundancy Analyzer entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer/{id}:
   *   get:
   *     summary: Get a specific network-redundancy-analyzer entry
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
   *         description: Network Redundancy Analyzer entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer/{id}:
   *   put:
   *     summary: Update a network-redundancy-analyzer entry
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
   *         description: Network Redundancy Analyzer entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer/{id}:
   *   delete:
   *     summary: Delete a network-redundancy-analyzer entry
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
   *         description: Network Redundancy Analyzer entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-redundancy-analyzer/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-redundancy-analyzer
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
