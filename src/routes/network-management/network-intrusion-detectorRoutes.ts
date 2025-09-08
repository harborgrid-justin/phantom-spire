/**
 * Network Intrusion Detector API Routes
 * Advanced network intrusion detection and prevention system
 */

import { Router } from 'express';
import { NetworkIntrusionDetectorController } from '../../controllers/network-management/network-intrusion-detectorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createNetworkIntrusionDetectorRoutes(): Router {
  const router = Router();
  const controller = new NetworkIntrusionDetectorController();

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector:
   *   get:
   *     summary: Get all network-intrusion-detector entries
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
   *         description: Network Intrusion Detector entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector:
   *   post:
   *     summary: Create a new network-intrusion-detector entry
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
   *         description: Network Intrusion Detector entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector/{id}:
   *   get:
   *     summary: Get a specific network-intrusion-detector entry
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
   *         description: Network Intrusion Detector entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector/{id}:
   *   put:
   *     summary: Update a network-intrusion-detector entry
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
   *         description: Network Intrusion Detector entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector/{id}:
   *   delete:
   *     summary: Delete a network-intrusion-detector entry
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
   *         description: Network Intrusion Detector entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/network-management/network-intrusion-detector/{id}/analytics:
   *   get:
   *     summary: Get analytics for network-intrusion-detector
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
