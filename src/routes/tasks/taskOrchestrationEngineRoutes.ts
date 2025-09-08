/**
 * Task Orchestration Engine Routes
 * Fortune 100-Grade Task Orchestration Engine Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskOrchestrationEngineController } from './controllers/taskOrchestrationEngineController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskOrchestrationEngineRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskOrchestrationEngineController(taskManager);

  // Validation middleware
  const createTaskOrchestrationEngineValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskOrchestrationEngineValidation = [
    body('name').optional().isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['active', 'pending', 'completed', 'failed', 'paused']),
    body('assignedTo').optional().isString().trim(),
    body('progress').optional().isInt({ min: 0, max: 100 }),
  ];

  const idValidation = [
    param('id').isString().isLength({ min: 1 }).trim(),
  ];

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine:
   *   get:
   *     summary: Get all task orchestration engine items
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, pending, completed, failed, paused]
   *         description: Filter by status
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, medium, high, critical]
   *         description: Filter by priority
   *     responses:
   *       200:
   *         description: List of task orchestration engine items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-orchestration-engine',
    authenticate,
    controller.getAllTaskOrchestrationEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine/{id}:
   *   get:
   *     summary: Get task orchestration engine item by ID
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Orchestration Engine item ID
   *     responses:
   *       200:
   *         description: Task Orchestration Engine item details
   *       404:
   *         description: Task Orchestration Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-orchestration-engine/:id',
    authenticate,
    idValidation,
    controller.getTaskOrchestrationEngineById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine:
   *   post:
   *     summary: Create new task orchestration engine item
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Task Orchestration Engine item name
   *               description:
   *                 type: string
   *                 description: Task Orchestration Engine item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Orchestration Engine item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-orchestration-engine',
    authenticate,
    createTaskOrchestrationEngineValidation,
    controller.createTaskOrchestrationEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine/{id}:
   *   put:
   *     summary: Update task orchestration engine item
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Orchestration Engine item ID
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
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *               status:
   *                 type: string
   *                 enum: [active, pending, completed, failed, paused]
   *               assignedTo:
   *                 type: string
   *               progress:
   *                 type: integer
   *                 minimum: 0
   *                 maximum: 100
   *     responses:
   *       200:
   *         description: Task Orchestration Engine item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Orchestration Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-orchestration-engine/:id',
    authenticate,
    idValidation,
    updateTaskOrchestrationEngineValidation,
    controller.updateTaskOrchestrationEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine/{id}:
   *   delete:
   *     summary: Delete task orchestration engine item
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Orchestration Engine item ID
   *     responses:
   *       200:
   *         description: Task Orchestration Engine item deleted successfully
   *       404:
   *         description: Task Orchestration Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-orchestration-engine/:id',
    authenticate,
    idValidation,
    controller.deleteTaskOrchestrationEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-orchestration-engine/stats:
   *   get:
   *     summary: Get task orchestration engine statistics
   *     tags: [Task Orchestration Engine]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Orchestration Engine statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-orchestration-engine/stats',
    authenticate,
    controller.getTaskOrchestrationEngineStats.bind(controller)
  );

  return router;
}