/**
 * Chain of Custody Tracker API Routes
 * Handles complete evidence custody tracking and auditing
 */

import { Router } from 'express';
import { ChainOfCustodyTrackerController } from '../../controllers/case-management/chain-of-custody-trackerController.js';
import { authenticate } from '../../middleware/auth.js';

export function createChainOfCustodyTrackerRoutes(): Router {
  const router = Router();
  const controller = new ChainOfCustodyTrackerController();

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker:
   *   get:
   *     summary: Get all chain of custody tracker entries
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
   *         description: Chain of Custody Tracker entries retrieved successfully
   */
  router.get('/', authenticate, controller.getAll);

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker:
   *   post:
   *     summary: Create a new chain of custody tracker entry
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
   *         description: Chain of Custody Tracker entry created successfully
   */
  router.post('/', authenticate, controller.create);

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker/{id}:
   *   get:
   *     summary: Get a specific chain of custody tracker entry
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
   *         description: Chain of Custody Tracker entry retrieved successfully
   */
  router.get('/:id', authenticate, controller.getById);

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker/{id}:
   *   put:
   *     summary: Update a chain of custody tracker entry
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
   *         description: Chain of Custody Tracker entry updated successfully
   */
  router.put('/:id', authenticate, controller.update);

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker/{id}:
   *   delete:
   *     summary: Delete a chain of custody tracker entry
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
   *         description: Chain of Custody Tracker entry deleted successfully
   */
  router.delete('/:id', authenticate, controller.delete);

  /**
   * @swagger
   * /api/v1/case-management/chain-of-custody-tracker/{id}/analytics:
   *   get:
   *     summary: Get analytics for chain of custody tracker
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
