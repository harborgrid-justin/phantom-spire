/**
 * Task Workflow API Routes
 * Handles task workflow management operations
 */

import { Router } from 'express';
import { TaskWorkflowController } from '../../controllers/tasks/taskWorkflowController.js';
import { authenticate } from '../../middleware/auth.js';

export function createTaskWorkflowRoutes(): Router {
  const router = Router();
  const controller = new TaskWorkflowController();

  /**
   * @swagger
   * /api/v1/tasks/workflows:
   *   get:
   *     summary: Get all task workflows
   *     tags: [Task Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, active, paused, archived]
   *         description: Filter by workflow status
   *     responses:
   *       200:
   *         description: Workflows retrieved successfully
   */
  router.get('/workflows', authenticate, controller.getWorkflows);

  /**
   * @swagger
   * /api/v1/tasks/workflows:
   *   post:
   *     summary: Create a new task workflow
   *     tags: [Task Workflows]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               steps:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     name:
   *                       type: string
   *                     type:
   *                       type: string
   *                       enum: [manual, automated, approval]
   *                     conditions:
   *                       type: array
   *                       items:
   *                         type: string
   *                     assignedRole:
   *                       type: string
   *               triggers:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Workflow created successfully
   */
  router.post('/workflows', authenticate, controller.createWorkflow);

  /**
   * @swagger
   * /api/v1/tasks/workflows/{id}:
   *   get:
   *     summary: Get a specific workflow
   *     tags: [Task Workflows]
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
   *         description: Workflow retrieved successfully
   */
  router.get('/workflows/:id', authenticate, controller.getWorkflow);

  /**
   * @swagger
   * /api/v1/tasks/workflows/{id}/execute:
   *   post:
   *     summary: Execute a workflow
   *     tags: [Task Workflows]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               context:
   *                 type: object
   *                 description: Execution context data
   *     responses:
   *       200:
   *         description: Workflow execution started
   */
  router.post('/workflows/:id/execute', authenticate, controller.executeWorkflow);

  /**
   * @swagger
   * /api/v1/tasks/workflows/{id}:
   *   put:
   *     summary: Update a workflow
   *     tags: [Task Workflows]
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
   *         description: Workflow updated successfully
   */
  router.put('/workflows/:id', authenticate, controller.updateWorkflow);

  return router;
}