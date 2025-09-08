/**
 * Task Retry Manager Routes
 * Fortune 100-Grade Task Retry Manager Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskRetryManagerController } from './controllers/taskRetryManagerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskRetryManagerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskRetryManagerController(taskManager);

  // Validation middleware
  const createTaskRetryManagerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskRetryManagerValidation = [
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
   * /api/v1/tasks/task-retry-manager:
   *   get:
   *     summary: Get all task retry manager items
   *     tags: [Task Retry Manager]
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
   *         description: List of task retry manager items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-retry-manager',
    authenticate,
    controller.getAllTaskRetryManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-retry-manager/{id}:
   *   get:
   *     summary: Get task retry manager item by ID
   *     tags: [Task Retry Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Retry Manager item ID
   *     responses:
   *       200:
   *         description: Task Retry Manager item details
   *       404:
   *         description: Task Retry Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-retry-manager/:id',
    authenticate,
    idValidation,
    controller.getTaskRetryManagerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-retry-manager:
   *   post:
   *     summary: Create new task retry manager item
   *     tags: [Task Retry Manager]
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
   *                 description: Task Retry Manager item name
   *               description:
   *                 type: string
   *                 description: Task Retry Manager item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Retry Manager item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-retry-manager',
    authenticate,
    createTaskRetryManagerValidation,
    controller.createTaskRetryManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-retry-manager/{id}:
   *   put:
   *     summary: Update task retry manager item
   *     tags: [Task Retry Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Retry Manager item ID
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
   *         description: Task Retry Manager item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Retry Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-retry-manager/:id',
    authenticate,
    idValidation,
    updateTaskRetryManagerValidation,
    controller.updateTaskRetryManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-retry-manager/{id}:
   *   delete:
   *     summary: Delete task retry manager item
   *     tags: [Task Retry Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Retry Manager item ID
   *     responses:
   *       200:
   *         description: Task Retry Manager item deleted successfully
   *       404:
   *         description: Task Retry Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-retry-manager/:id',
    authenticate,
    idValidation,
    controller.deleteTaskRetryManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-retry-manager/stats:
   *   get:
   *     summary: Get task retry manager statistics
   *     tags: [Task Retry Manager]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Retry Manager statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-retry-manager/stats',
    authenticate,
    controller.getTaskRetryManagerStats.bind(controller)
  );

  return router;
}