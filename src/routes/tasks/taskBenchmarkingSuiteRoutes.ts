/**
 * Task Benchmarking Suite Routes
 * Fortune 100-Grade Task Benchmarking Suite Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskBenchmarkingSuiteController } from './controllers/taskBenchmarkingSuiteController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskBenchmarkingSuiteRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskBenchmarkingSuiteController(taskManager);

  // Validation middleware
  const createTaskBenchmarkingSuiteValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskBenchmarkingSuiteValidation = [
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
   * /api/v1/tasks/task-benchmarking-suite:
   *   get:
   *     summary: Get all task benchmarking suite items
   *     tags: [Task Benchmarking Suite]
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
   *         description: List of task benchmarking suite items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-benchmarking-suite',
    authenticate,
    controller.getAllTaskBenchmarkingSuite.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-benchmarking-suite/{id}:
   *   get:
   *     summary: Get task benchmarking suite item by ID
   *     tags: [Task Benchmarking Suite]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Benchmarking Suite item ID
   *     responses:
   *       200:
   *         description: Task Benchmarking Suite item details
   *       404:
   *         description: Task Benchmarking Suite item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-benchmarking-suite/:id',
    authenticate,
    idValidation,
    controller.getTaskBenchmarkingSuiteById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-benchmarking-suite:
   *   post:
   *     summary: Create new task benchmarking suite item
   *     tags: [Task Benchmarking Suite]
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
   *                 description: Task Benchmarking Suite item name
   *               description:
   *                 type: string
   *                 description: Task Benchmarking Suite item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Benchmarking Suite item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-benchmarking-suite',
    authenticate,
    createTaskBenchmarkingSuiteValidation,
    controller.createTaskBenchmarkingSuite.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-benchmarking-suite/{id}:
   *   put:
   *     summary: Update task benchmarking suite item
   *     tags: [Task Benchmarking Suite]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Benchmarking Suite item ID
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
   *         description: Task Benchmarking Suite item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Benchmarking Suite item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-benchmarking-suite/:id',
    authenticate,
    idValidation,
    updateTaskBenchmarkingSuiteValidation,
    controller.updateTaskBenchmarkingSuite.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-benchmarking-suite/{id}:
   *   delete:
   *     summary: Delete task benchmarking suite item
   *     tags: [Task Benchmarking Suite]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Benchmarking Suite item ID
   *     responses:
   *       200:
   *         description: Task Benchmarking Suite item deleted successfully
   *       404:
   *         description: Task Benchmarking Suite item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-benchmarking-suite/:id',
    authenticate,
    idValidation,
    controller.deleteTaskBenchmarkingSuite.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-benchmarking-suite/stats:
   *   get:
   *     summary: Get task benchmarking suite statistics
   *     tags: [Task Benchmarking Suite]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Benchmarking Suite statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-benchmarking-suite/stats',
    authenticate,
    controller.getTaskBenchmarkingSuiteStats.bind(controller)
  );

  return router;
}