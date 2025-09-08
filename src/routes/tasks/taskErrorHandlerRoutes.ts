/**
 * Task Error Handler Routes
 * Fortune 100-Grade Task Error Handler Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskErrorHandlerController } from './controllers/taskErrorHandlerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskErrorHandlerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskErrorHandlerController(taskManager);

  // Validation middleware
  const createTaskErrorHandlerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskErrorHandlerValidation = [
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
   * /api/v1/tasks/task-error-handler:
   *   get:
   *     summary: Get all task error handler items
   *     tags: [Task Error Handler]
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
   *         description: List of task error handler items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-error-handler',
    authenticate,
    controller.getAllTaskErrorHandler.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-error-handler/{id}:
   *   get:
   *     summary: Get task error handler item by ID
   *     tags: [Task Error Handler]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Error Handler item ID
   *     responses:
   *       200:
   *         description: Task Error Handler item details
   *       404:
   *         description: Task Error Handler item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-error-handler/:id',
    authenticate,
    idValidation,
    controller.getTaskErrorHandlerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-error-handler:
   *   post:
   *     summary: Create new task error handler item
   *     tags: [Task Error Handler]
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
   *                 description: Task Error Handler item name
   *               description:
   *                 type: string
   *                 description: Task Error Handler item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Error Handler item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-error-handler',
    authenticate,
    createTaskErrorHandlerValidation,
    controller.createTaskErrorHandler.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-error-handler/{id}:
   *   put:
   *     summary: Update task error handler item
   *     tags: [Task Error Handler]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Error Handler item ID
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
   *         description: Task Error Handler item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Error Handler item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-error-handler/:id',
    authenticate,
    idValidation,
    updateTaskErrorHandlerValidation,
    controller.updateTaskErrorHandler.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-error-handler/{id}:
   *   delete:
   *     summary: Delete task error handler item
   *     tags: [Task Error Handler]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Error Handler item ID
   *     responses:
   *       200:
   *         description: Task Error Handler item deleted successfully
   *       404:
   *         description: Task Error Handler item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-error-handler/:id',
    authenticate,
    idValidation,
    controller.deleteTaskErrorHandler.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-error-handler/stats:
   *   get:
   *     summary: Get task error handler statistics
   *     tags: [Task Error Handler]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Error Handler statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-error-handler/stats',
    authenticate,
    controller.getTaskErrorHandlerStats.bind(controller)
  );

  return router;
}