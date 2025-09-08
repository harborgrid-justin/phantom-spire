/**
 * Task Performance Analyzer Routes
 * Fortune 100-Grade Task Performance Analyzer Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskPerformanceAnalyzerController } from './controllers/taskPerformanceAnalyzerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskPerformanceAnalyzerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskPerformanceAnalyzerController(taskManager);

  // Validation middleware
  const createTaskPerformanceAnalyzerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskPerformanceAnalyzerValidation = [
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
   * /api/v1/tasks/task-performance-analyzer:
   *   get:
   *     summary: Get all task performance analyzer items
   *     tags: [Task Performance Analyzer]
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
   *         description: List of task performance analyzer items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-performance-analyzer',
    authenticate,
    controller.getAllTaskPerformanceAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-performance-analyzer/{id}:
   *   get:
   *     summary: Get task performance analyzer item by ID
   *     tags: [Task Performance Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Performance Analyzer item ID
   *     responses:
   *       200:
   *         description: Task Performance Analyzer item details
   *       404:
   *         description: Task Performance Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-performance-analyzer/:id',
    authenticate,
    idValidation,
    controller.getTaskPerformanceAnalyzerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-performance-analyzer:
   *   post:
   *     summary: Create new task performance analyzer item
   *     tags: [Task Performance Analyzer]
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
   *                 description: Task Performance Analyzer item name
   *               description:
   *                 type: string
   *                 description: Task Performance Analyzer item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Performance Analyzer item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-performance-analyzer',
    authenticate,
    createTaskPerformanceAnalyzerValidation,
    controller.createTaskPerformanceAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-performance-analyzer/{id}:
   *   put:
   *     summary: Update task performance analyzer item
   *     tags: [Task Performance Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Performance Analyzer item ID
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
   *         description: Task Performance Analyzer item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Performance Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-performance-analyzer/:id',
    authenticate,
    idValidation,
    updateTaskPerformanceAnalyzerValidation,
    controller.updateTaskPerformanceAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-performance-analyzer/{id}:
   *   delete:
   *     summary: Delete task performance analyzer item
   *     tags: [Task Performance Analyzer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Performance Analyzer item ID
   *     responses:
   *       200:
   *         description: Task Performance Analyzer item deleted successfully
   *       404:
   *         description: Task Performance Analyzer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-performance-analyzer/:id',
    authenticate,
    idValidation,
    controller.deleteTaskPerformanceAnalyzer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-performance-analyzer/stats:
   *   get:
   *     summary: Get task performance analyzer statistics
   *     tags: [Task Performance Analyzer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Performance Analyzer statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-performance-analyzer/stats',
    authenticate,
    controller.getTaskPerformanceAnalyzerStats.bind(controller)
  );

  return router;
}