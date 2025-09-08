/**
 * Case Priority Matrix API Routes
 * Handles dynamic case prioritization and resource allocation
 */

import { Router } from 'express';
import { CasePriorityMatrixController } from '../../controllers/case-management/case-priority-matrixController.js';
import { authenticate } from '../../middleware/auth.js';

export function createCasePriorityMatrixRoutes(): Router {
  const router = Router();
  const controller = new CasePriorityMatrixController();

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix:
   *   get:
   *     summary: Get all case priority matrix entries
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
   *         description: Case Priority Matrix entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix:
   *   post:
   *     summary: Create a new case priority matrix entry
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
   *         description: Case Priority Matrix entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix/{id}:
   *   get:
   *     summary: Get a specific case priority matrix entry
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
   *         description: Case Priority Matrix entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix/{id}:
   *   put:
   *     summary: Update a case priority matrix entry
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
   *         description: Case Priority Matrix entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix/{id}:
   *   delete:
   *     summary: Delete a case priority matrix entry
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
   *         description: Case Priority Matrix entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/case-priority-matrix/{id}/analytics:
   *   get:
   *     summary: Get analytics for case priority matrix
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
