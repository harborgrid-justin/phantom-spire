/**
 * Evidence Integrity Monitor API Routes
 * Handles continuous evidence integrity verification
 */

import { Router } from 'express';
import { EvidenceIntegrityMonitorController } from '../../controllers/case-management/evidence-integrity-monitorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createEvidenceIntegrityMonitorRoutes(): Router {
  const router = Router();
  const controller = new EvidenceIntegrityMonitorController();

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor:
   *   get:
   *     summary: Get all evidence integrity monitor entries
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
   *         description: Evidence Integrity Monitor entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor:
   *   post:
   *     summary: Create a new evidence integrity monitor entry
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
   *         description: Evidence Integrity Monitor entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor/{id}:
   *   get:
   *     summary: Get a specific evidence integrity monitor entry
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
   *         description: Evidence Integrity Monitor entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor/{id}:
   *   put:
   *     summary: Update a evidence integrity monitor entry
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
   *         description: Evidence Integrity Monitor entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor/{id}:
   *   delete:
   *     summary: Delete a evidence integrity monitor entry
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
   *         description: Evidence Integrity Monitor entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/evidence-integrity-monitor/{id}/analytics:
   *   get:
   *     summary: Get analytics for evidence integrity monitor
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
