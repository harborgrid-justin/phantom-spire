/**
 * Digital Evidence Analyzer API Routes
 * Handles automated digital evidence analysis and correlation
 */

import { Router } from 'express';
import { DigitalEvidenceAnalyzerController } from '../../controllers/case-management/digital-evidence-analyzerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createDigitalEvidenceAnalyzerRoutes(): Router {
  const router = Router();
  const controller = new DigitalEvidenceAnalyzerController();

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer:
   *   get:
   *     summary: Get all digital evidence analyzer entries
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
   *         description: Digital Evidence Analyzer entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer:
   *   post:
   *     summary: Create a new digital evidence analyzer entry
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
   *         description: Digital Evidence Analyzer entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer/{id}:
   *   get:
   *     summary: Get a specific digital evidence analyzer entry
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
   *         description: Digital Evidence Analyzer entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer/{id}:
   *   put:
   *     summary: Update a digital evidence analyzer entry
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
   *         description: Digital Evidence Analyzer entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer/{id}:
   *   delete:
   *     summary: Delete a digital evidence analyzer entry
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
   *         description: Digital Evidence Analyzer entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/digital-evidence-analyzer/{id}/analytics:
   *   get:
   *     summary: Get analytics for digital evidence analyzer
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
