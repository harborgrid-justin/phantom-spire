/**
 * Task Analytics Dashboard Routes
 * Fortune 100-Grade Task Analytics Dashboard Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskAnalyticsDashboardController } from './controllers/taskAnalyticsDashboardController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskAnalyticsDashboardRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskAnalyticsDashboardController(taskManager);

  // Validation middleware
  const createTaskAnalyticsDashboardValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskAnalyticsDashboardValidation = [
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
   * /api/v1/tasks/task-analytics-dashboard:
   *   get:
   *     summary: Get all task analytics dashboard items
   *     tags: [Task Analytics Dashboard]
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
   *         description: List of task analytics dashboard items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-analytics-dashboard',
    authenticate,
    controller.getAllTaskAnalyticsDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-analytics-dashboard/{id}:
   *   get:
   *     summary: Get task analytics dashboard item by ID
   *     tags: [Task Analytics Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Analytics Dashboard item ID
   *     responses:
   *       200:
   *         description: Task Analytics Dashboard item details
   *       404:
   *         description: Task Analytics Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-analytics-dashboard/:id',
    authenticate,
    idValidation,
    controller.getTaskAnalyticsDashboardById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-analytics-dashboard:
   *   post:
   *     summary: Create new task analytics dashboard item
   *     tags: [Task Analytics Dashboard]
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
   *                 description: Task Analytics Dashboard item name
   *               description:
   *                 type: string
   *                 description: Task Analytics Dashboard item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Analytics Dashboard item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-analytics-dashboard',
    authenticate,
    createTaskAnalyticsDashboardValidation,
    controller.createTaskAnalyticsDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-analytics-dashboard/{id}:
   *   put:
   *     summary: Update task analytics dashboard item
   *     tags: [Task Analytics Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Analytics Dashboard item ID
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
   *         description: Task Analytics Dashboard item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Analytics Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-analytics-dashboard/:id',
    authenticate,
    idValidation,
    updateTaskAnalyticsDashboardValidation,
    controller.updateTaskAnalyticsDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-analytics-dashboard/{id}:
   *   delete:
   *     summary: Delete task analytics dashboard item
   *     tags: [Task Analytics Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Analytics Dashboard item ID
   *     responses:
   *       200:
   *         description: Task Analytics Dashboard item deleted successfully
   *       404:
   *         description: Task Analytics Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-analytics-dashboard/:id',
    authenticate,
    idValidation,
    controller.deleteTaskAnalyticsDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-analytics-dashboard/stats:
   *   get:
   *     summary: Get task analytics dashboard statistics
   *     tags: [Task Analytics Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Analytics Dashboard statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-analytics-dashboard/stats',
    authenticate,
    controller.getTaskAnalyticsDashboardStats.bind(controller)
  );

  return router;
}