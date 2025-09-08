/**
 * Task Trend Analyzer Routes
 * Fortune 100-Grade Task Trend Analyzer Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskTrendAnalyzerController } from './controllers/taskTrendAnalyzerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskTrendAnalyzerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskTrendAnalyzerController(taskManager);

  // Validation middleware
  const createTaskTrendAnalyzerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskTrendAnalyzerValidation = [
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
   * /api/v1/tasks/task-trend-analyzer:
   *   get:
   *     summary: Get all task trend analyzer items
   *     tags: [Task Trend Analyzer]
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
   *         description: List of task trend analyzer items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-trend-analyzer',
    authenticate,
    controller.getAllTaskTrendAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-trend-analyzer/{id}:
   *   get:
   *     summary: Get task trend analyzer item by ID
   *     tags: [Task Trend Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Trend Analyzer item ID
   *     responses:
   *       200:
   *         description: Task Trend Analyzer item details
   *       404:
   *         description: Task Trend Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-trend-analyzer/:id',
    authenticate,
    idValidation,
    controller.getTaskTrendAnalyzerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-trend-analyzer:
   *   post:
   *     summary: Create new task trend analyzer item
   *     tags: [Task Trend Analyzer]
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
   *                 description: Task Trend Analyzer item name
   *               description:
   *                 type: string
   *                 description: Task Trend Analyzer item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Trend Analyzer item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-trend-analyzer',
    authenticate,
    createTaskTrendAnalyzerValidation,
    controller.createTaskTrendAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-trend-analyzer/{id}:
   *   put:
   *     summary: Update task trend analyzer item
   *     tags: [Task Trend Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Trend Analyzer item ID
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
   *         description: Task Trend Analyzer item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Trend Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-trend-analyzer/:id',
    authenticate,
    idValidation,
    updateTaskTrendAnalyzerValidation,
    controller.updateTaskTrendAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-trend-analyzer/{id}:
   *   delete:
   *     summary: Delete task trend analyzer item
   *     tags: [Task Trend Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Trend Analyzer item ID
   *     responses:
   *       200:
   *         description: Task Trend Analyzer item deleted successfully
   *       404:
   *         description: Task Trend Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-trend-analyzer/:id',
    authenticate,
    idValidation,
    controller.deleteTaskTrendAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-trend-analyzer/stats:
   *   get:
   *     summary: Get task trend analyzer statistics
   *     tags: [Task Trend Analyzer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Trend Analyzer statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-trend-analyzer/stats',
    authenticate,
    controller.getTaskTrendAnalyzerStats.bind(controller)
  );

  return router;
}