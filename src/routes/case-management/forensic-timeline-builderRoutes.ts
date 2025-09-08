/**
 * Forensic Timeline Builder API Routes
 * Handles interactive forensic timeline creation and visualization
 */

import { Router } from 'express';
import { ForensicTimelineBuilderController } from '../../controllers/case-management/forensic-timeline-builderController.js';
import { authenticate } from '../../middleware/auth.js';

export function createForensicTimelineBuilderRoutes(): Router {
  const router = Router();
  const controller = new ForensicTimelineBuilderController();

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder:
   *   get:
   *     summary: Get all forensic timeline builder entries
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
   *         description: Forensic Timeline Builder entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder:
   *   post:
   *     summary: Create a new forensic timeline builder entry
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
   *         description: Forensic Timeline Builder entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder/{id}:
   *   get:
   *     summary: Get a specific forensic timeline builder entry
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
   *         description: Forensic Timeline Builder entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder/{id}:
   *   put:
   *     summary: Update a forensic timeline builder entry
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
   *         description: Forensic Timeline Builder entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder/{id}:
   *   delete:
   *     summary: Delete a forensic timeline builder entry
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
   *         description: Forensic Timeline Builder entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/forensic-timeline-builder/{id}/analytics:
   *   get:
   *     summary: Get analytics for forensic timeline builder
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
