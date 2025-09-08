/**
 * Task Execution Monitor Routes
 * Fortune 100-Grade Task Execution Monitor Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskExecutionMonitorController } from './controllers/taskExecutionMonitorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskExecutionMonitorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskExecutionMonitorController(taskManager);

  // Validation middleware
  const createTaskExecutionMonitorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskExecutionMonitorValidation = [
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
   * /api/v1/tasks/task-execution-monitor:
   *   get:
   *     summary: Get all task execution monitor items
   *     tags: [Task Execution Monitor]
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
   *         description: List of task execution monitor items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-execution-monitor',
    authenticate,
    controller.getAllTaskExecutionMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-execution-monitor/{id}:
   *   get:
   *     summary: Get task execution monitor item by ID
   *     tags: [Task Execution Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Execution Monitor item ID
   *     responses:
   *       200:
   *         description: Task Execution Monitor item details
   *       404:
   *         description: Task Execution Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-execution-monitor/:id',
    authenticate,
    idValidation,
    controller.getTaskExecutionMonitorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-execution-monitor:
   *   post:
   *     summary: Create new task execution monitor item
   *     tags: [Task Execution Monitor]
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
   *                 description: Task Execution Monitor item name
   *               description:
   *                 type: string
   *                 description: Task Execution Monitor item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Execution Monitor item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-execution-monitor',
    authenticate,
    createTaskExecutionMonitorValidation,
    controller.createTaskExecutionMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-execution-monitor/{id}:
   *   put:
   *     summary: Update task execution monitor item
   *     tags: [Task Execution Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Execution Monitor item ID
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
   *         description: Task Execution Monitor item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Execution Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-execution-monitor/:id',
    authenticate,
    idValidation,
    updateTaskExecutionMonitorValidation,
    controller.updateTaskExecutionMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-execution-monitor/{id}:
   *   delete:
   *     summary: Delete task execution monitor item
   *     tags: [Task Execution Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Execution Monitor item ID
   *     responses:
   *       200:
   *         description: Task Execution Monitor item deleted successfully
   *       404:
   *         description: Task Execution Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-execution-monitor/:id',
    authenticate,
    idValidation,
    controller.deleteTaskExecutionMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-execution-monitor/stats:
   *   get:
   *     summary: Get task execution monitor statistics
   *     tags: [Task Execution Monitor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Execution Monitor statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-execution-monitor/stats',
    authenticate,
    controller.getTaskExecutionMonitorStats.bind(controller)
  );

  return router;
}