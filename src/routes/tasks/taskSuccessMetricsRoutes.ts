/**
 * Task Success Metrics Routes
 * Fortune 100-Grade Task Success Metrics Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskSuccessMetricsController } from './controllers/taskSuccessMetricsController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskSuccessMetricsRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskSuccessMetricsController(taskManager);

  // Validation middleware
  const createTaskSuccessMetricsValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskSuccessMetricsValidation = [
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
   * /api/v1/tasks/task-success-metrics:
   *   get:
   *     summary: Get all task success metrics items
   *     tags: [Task Success Metrics]
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
   *         description: List of task success metrics items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-success-metrics',
    authenticate,
    controller.getAllTaskSuccessMetrics.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-success-metrics/{id}:
   *   get:
   *     summary: Get task success metrics item by ID
   *     tags: [Task Success Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Success Metrics item ID
   *     responses:
   *       200:
   *         description: Task Success Metrics item details
   *       404:
   *         description: Task Success Metrics item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-success-metrics/:id',
    authenticate,
    idValidation,
    controller.getTaskSuccessMetricsById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-success-metrics:
   *   post:
   *     summary: Create new task success metrics item
   *     tags: [Task Success Metrics]
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
   *                 description: Task Success Metrics item name
   *               description:
   *                 type: string
   *                 description: Task Success Metrics item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Success Metrics item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-success-metrics',
    authenticate,
    createTaskSuccessMetricsValidation,
    controller.createTaskSuccessMetrics.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-success-metrics/{id}:
   *   put:
   *     summary: Update task success metrics item
   *     tags: [Task Success Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Success Metrics item ID
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
   *         description: Task Success Metrics item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Success Metrics item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-success-metrics/:id',
    authenticate,
    idValidation,
    updateTaskSuccessMetricsValidation,
    controller.updateTaskSuccessMetrics.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-success-metrics/{id}:
   *   delete:
   *     summary: Delete task success metrics item
   *     tags: [Task Success Metrics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Success Metrics item ID
   *     responses:
   *       200:
   *         description: Task Success Metrics item deleted successfully
   *       404:
   *         description: Task Success Metrics item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-success-metrics/:id',
    authenticate,
    idValidation,
    controller.deleteTaskSuccessMetrics.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-success-metrics/stats:
   *   get:
   *     summary: Get task success metrics statistics
   *     tags: [Task Success Metrics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Success Metrics statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-success-metrics/stats',
    authenticate,
    controller.getTaskSuccessMetricsStats.bind(controller)
  );

  return router;
}