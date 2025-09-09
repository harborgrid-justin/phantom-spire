/**
 * Resource Utilization Reports API Routes
 * Handles resource utilization reports reporting and analytics
 */

import { Router } from 'express';
import { ResourceUtilizationReportsController } from '../../controllers/operational-efficiency/resource-utilization-reportsController.js';
import { authenticate } from '../../middleware/auth.js';

export function createResourceUtilizationReportsRoutes(): Router {
  const router = Router();
  const controller = new ResourceUtilizationReportsController();

  /**
   * @swagger
   * /api/v1/operational-efficiency/resource-utilization-reports:
   *   get:
   *     summary: Get all resource utilization reports entries
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
   *         description: Successfully retrieved resource utilization reports entries
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/operational-efficiency/resource-utilization-reports/{id}:
   *   get:
   *     summary: Get resource utilization reports entry by ID
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: resource utilization reports entry ID
   *     responses:
   *       200:
   *         description: Successfully retrieved resource utilization reports entry
   *       404:
   *         description: resource utilization reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/operational-efficiency/resource-utilization-reports:
   *   post:
   *     summary: Create new resource utilization reports entry
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
   *         description: resource utilization reports entry created successfully
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
   * /api/v1/operational-efficiency/resource-utilization-reports/{id}:
   *   put:
   *     summary: Update resource utilization reports entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: resource utilization reports entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: resource utilization reports entry updated successfully
   *       404:
   *         description: resource utilization reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/operational-efficiency/resource-utilization-reports/{id}:
   *   delete:
   *     summary: Delete resource utilization reports entry
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: resource utilization reports entry ID
   *     responses:
   *       200:
   *         description: resource utilization reports entry deleted successfully
   *       404:
   *         description: resource utilization reports entry not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/operational-efficiency/resource-utilization-reports/analytics:
   *   get:
   *     summary: Get resource utilization reports analytics
   *     tags: [Operational Efficiency]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved resource utilization reports analytics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/analytics', authenticate, controller.getAnalytics);

  return router;
}
