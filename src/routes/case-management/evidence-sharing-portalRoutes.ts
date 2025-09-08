/**
 * Evidence Sharing Portal API Routes
 * Handles secure evidence sharing with external parties
 */

import { Router } from 'express';
import { EvidenceSharingPortalController } from '../../controllers/case-management/evidence-sharing-portalController.js';
import { authenticate } from '../../middleware/auth.js';

export function createEvidenceSharingPortalRoutes(): Router {
  const router = Router();
  const controller = new EvidenceSharingPortalController();

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal:
   *   get:
   *     summary: Get all evidence sharing portal entries
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
   *         description: Evidence Sharing Portal entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal:
   *   post:
   *     summary: Create a new evidence sharing portal entry
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
   *         description: Evidence Sharing Portal entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal/{id}:
   *   get:
   *     summary: Get a specific evidence sharing portal entry
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
   *         description: Evidence Sharing Portal entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal/{id}:
   *   put:
   *     summary: Update a evidence sharing portal entry
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
   *         description: Evidence Sharing Portal entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal/{id}:
   *   delete:
   *     summary: Delete a evidence sharing portal entry
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
   *         description: Evidence Sharing Portal entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/evidence-sharing-portal/{id}/analytics:
   *   get:
   *     summary: Get analytics for evidence sharing portal
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
