/**
 * Case Template Management API Routes
 * Handles case template creation and customization
 */

import { Router } from 'express';
import { CaseTemplateManagementController } from '../../controllers/case-management/case-template-managementController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCaseTemplateManagementRoutes(): Router {
  const router = Router();
  const controller = new CaseTemplateManagementController();

  /**
   * @swagger
   * /api/v1/case-management/case-template-management:
   *   get:
   *     summary: Get all case template management entries
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
   *         description: Case Template Management entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/case-template-management:
   *   post:
   *     summary: Create a new case template management entry
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
   *         description: Case Template Management entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/case-template-management/{id}:
   *   get:
   *     summary: Get a specific case template management entry
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
   *         description: Case Template Management entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/case-template-management/{id}:
   *   put:
   *     summary: Update a case template management entry
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
   *         description: Case Template Management entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/case-template-management/{id}:
   *   delete:
   *     summary: Delete a case template management entry
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
   *         description: Case Template Management entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/case-template-management/{id}/analytics:
   *   get:
   *     summary: Get analytics for case template management
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
