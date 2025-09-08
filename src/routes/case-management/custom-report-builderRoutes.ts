/**
 * Custom Report Builder API Routes
 * Handles drag-and-drop custom report creation
 */

import { Router } from 'express';
import { CustomReportBuilderController } from '../../controllers/case-management/custom-report-builderController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCustomReportBuilderRoutes(): Router {
  const router = Router();
  const controller = new CustomReportBuilderController();

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder:
   *   get:
   *     summary: Get all custom report builder entries
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
   *         description: Custom Report Builder entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder:
   *   post:
   *     summary: Create a new custom report builder entry
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
   *         description: Custom Report Builder entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder/{id}:
   *   get:
   *     summary: Get a specific custom report builder entry
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
   *         description: Custom Report Builder entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder/{id}:
   *   put:
   *     summary: Update a custom report builder entry
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
   *         description: Custom Report Builder entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder/{id}:
   *   delete:
   *     summary: Delete a custom report builder entry
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
   *         description: Custom Report Builder entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/custom-report-builder/{id}/analytics:
   *   get:
   *     summary: Get analytics for custom report builder
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
