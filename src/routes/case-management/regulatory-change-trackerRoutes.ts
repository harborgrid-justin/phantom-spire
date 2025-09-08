/**
 * Regulatory Change Tracker API Routes
 * Handles regulatory requirement change tracking and impact analysis
 */

import { Router } from 'express';
import { RegulatoryChangeTrackerController } from '../../controllers/case-management/regulatory-change-trackerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createRegulatoryChangeTrackerRoutes(): Router {
  const router = Router();
  const controller = new RegulatoryChangeTrackerController();

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker:
   *   get:
   *     summary: Get all regulatory change tracker entries
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
   *         description: Regulatory Change Tracker entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker:
   *   post:
   *     summary: Create a new regulatory change tracker entry
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
   *         description: Regulatory Change Tracker entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker/{id}:
   *   get:
   *     summary: Get a specific regulatory change tracker entry
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
   *         description: Regulatory Change Tracker entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker/{id}:
   *   put:
   *     summary: Update a regulatory change tracker entry
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
   *         description: Regulatory Change Tracker entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker/{id}:
   *   delete:
   *     summary: Delete a regulatory change tracker entry
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
   *         description: Regulatory Change Tracker entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/regulatory-change-tracker/{id}/analytics:
   *   get:
   *     summary: Get analytics for regulatory change tracker
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
