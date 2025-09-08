/**
 * Resource Utilization Dashboard API Routes
 * Handles resource usage optimization analytics
 */

import { Router } from 'express';
import { ResourceUtilizationDashboardController } from '../../controllers/case-management/resource-utilization-dashboardController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceUtilizationDashboardRoutes(): Router {
  const router = Router();
  const controller = new ResourceUtilizationDashboardController();

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard:
   *   get:
   *     summary: Get all resource utilization dashboard entries
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
   *         description: Resource Utilization Dashboard entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard:
   *   post:
   *     summary: Create a new resource utilization dashboard entry
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
   *         description: Resource Utilization Dashboard entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard/{id}:
   *   get:
   *     summary: Get a specific resource utilization dashboard entry
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
   *         description: Resource Utilization Dashboard entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard/{id}:
   *   put:
   *     summary: Update a resource utilization dashboard entry
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
   *         description: Resource Utilization Dashboard entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard/{id}:
   *   delete:
   *     summary: Delete a resource utilization dashboard entry
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
   *         description: Resource Utilization Dashboard entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/resource-utilization-dashboard/{id}/analytics:
   *   get:
   *     summary: Get analytics for resource utilization dashboard
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
