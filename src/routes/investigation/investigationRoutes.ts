/**
 * Investigation Cases API Routes
 * Handles investigation case management operations
 */

import { Router } from 'express';
import { InvestigationController } from '../../controllers/investigation/investigationController.js';
import { authenticate } from '../../middleware/auth.js';

export function createInvestigationRoutes(): Router {
  const router = Router();
  const controller = new InvestigationController();

  /**
   * @swagger
   * /api/v1/investigation/cases:
   *   get:
   *     summary: Get all investigation cases
   *     tags: [Investigation]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [open, under-investigation, pending-review, closed]
   *         description: Filter by case status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high, critical]
   *         description: Filter by priority
   *       - in: query
   *         name: assignedTo
   *         schema:
   *           type: string
   *         description: Filter by assigned investigator
   *     responses:
   *       200:
   *         description: Cases retrieved successfully
   */
  router.get('/cases', authenticate, controller.getCases);

  /**
   * @swagger
   * /api/v1/investigation/cases:
   *   post:
   *     summary: Create a new investigation case
   *     tags: [Investigation]
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
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *               category:
   *                 type: string
   *               assignedInvestigator:
   *                 type: string
   *               leadInvestigator:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Case created successfully
   */
  router.post('/cases', authenticate, controller.createCase);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}:
   *   get:
   *     summary: Get a specific investigation case
   *     tags: [Investigation]
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
   *         description: Case retrieved successfully
   */
  router.get('/cases/:id', authenticate, controller.getCase);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}:
   *   put:
   *     summary: Update an investigation case
   *     tags: [Investigation]
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
   *         description: Case updated successfully
   */
  router.put('/cases/:id', authenticate, controller.updateCase);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}/timeline:
   *   get:
   *     summary: Get case timeline
   *     tags: [Investigation]
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
   *         description: Timeline retrieved successfully
   */
  router.get('/cases/:id/timeline', authenticate, controller.getCaseTimeline);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}/evidence:
   *   get:
   *     summary: Get case evidence
   *     tags: [Investigation]
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
   *         description: Evidence retrieved successfully
   */
  router.get('/cases/:id/evidence', authenticate, controller.getCaseEvidence);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}/notes:
   *   get:
   *     summary: Get case notes
   *     tags: [Investigation]
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
   *         description: Notes retrieved successfully
   */
  router.get('/cases/:id/notes', authenticate, controller.getCaseNotes);

  /**
   * @swagger
   * /api/v1/investigation/cases/{id}/notes:
   *   post:
   *     summary: Add a note to a case
   *     tags: [Investigation]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               content:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [general, evidence, interview, analysis]
   *     responses:
   *       201:
   *         description: Note added successfully
   */
  router.post('/cases/:id/notes', authenticate, controller.addCaseNote);

  return router;
}