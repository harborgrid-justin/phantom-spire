/**
 * Privacy Protection Monitor API Routes
 * Handles data privacy compliance and protection monitoring
 */

import { Router } from 'express';
import { PrivacyProtectionMonitorController } from '../../controllers/case-management/privacy-protection-monitorController.js';
import { authenticate } from '../../middleware/auth.js';

export function createPrivacyProtectionMonitorRoutes(): Router {
  const router = Router();
  const controller = new PrivacyProtectionMonitorController();

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor:
   *   get:
   *     summary: Get all privacy protection monitor entries
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
   *         description: Privacy Protection Monitor entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor:
   *   post:
   *     summary: Create a new privacy protection monitor entry
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
   *         description: Privacy Protection Monitor entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor/{id}:
   *   get:
   *     summary: Get a specific privacy protection monitor entry
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
   *         description: Privacy Protection Monitor entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor/{id}:
   *   put:
   *     summary: Update a privacy protection monitor entry
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
   *         description: Privacy Protection Monitor entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor/{id}:
   *   delete:
   *     summary: Delete a privacy protection monitor entry
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
   *         description: Privacy Protection Monitor entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/privacy-protection-monitor/{id}/analytics:
   *   get:
   *     summary: Get analytics for privacy protection monitor
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
