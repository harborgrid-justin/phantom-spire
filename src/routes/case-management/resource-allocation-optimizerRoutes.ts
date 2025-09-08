/**
 * Resource Allocation Optimizer API Routes
 * Handles ai-driven resource optimization for investigations
 */

import { Router } from 'express';
import { ResourceAllocationOptimizerController } from '../../controllers/case-management/resource-allocation-optimizerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceAllocationOptimizerRoutes(): Router {
  const router = Router();
  const controller = new ResourceAllocationOptimizerController();

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer:
   *   get:
   *     summary: Get all resource allocation optimizer entries
   *     tags: [Case Management]
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
   *         description: Resource Allocation Optimizer entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer:
   *   post:
   *     summary: Create a new resource allocation optimizer entry
   *     tags: [Case Management]
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
   *         description: Resource Allocation Optimizer entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer/{id}:
   *   get:
   *     summary: Get a specific resource allocation optimizer entry
   *     tags: [Case Management]
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
   *         description: Resource Allocation Optimizer entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer/{id}:
   *   put:
   *     summary: Update a resource allocation optimizer entry
   *     tags: [Case Management]
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
   *         description: Resource Allocation Optimizer entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer/{id}:
   *   delete:
   *     summary: Delete a resource allocation optimizer entry
   *     tags: [Case Management]
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
   *         description: Resource Allocation Optimizer entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/resource-allocation-optimizer/{id}/analytics:
   *   get:
   *     summary: Get analytics for resource allocation optimizer
   *     tags: [Case Management]
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
