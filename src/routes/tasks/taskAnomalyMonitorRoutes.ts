/**
 * Task Anomaly Monitor Routes
 * Fortune 100-Grade Task Anomaly Monitor Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskAnomalyMonitorController } from './controllers/taskAnomalyMonitorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskAnomalyMonitorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskAnomalyMonitorController(taskManager);

  // Validation middleware
  const createTaskAnomalyMonitorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskAnomalyMonitorValidation = [
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
   * /api/v1/tasks/task-anomaly-monitor:
   *   get:
   *     summary: Get all task anomaly monitor items
   *     tags: [Task Anomaly Monitor]
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
   *         description: List of task anomaly monitor items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-anomaly-monitor',
    authenticate,
    controller.getAllTaskAnomalyMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-anomaly-monitor/{id}:
   *   get:
   *     summary: Get task anomaly monitor item by ID
   *     tags: [Task Anomaly Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Anomaly Monitor item ID
   *     responses:
   *       200:
   *         description: Task Anomaly Monitor item details
   *       404:
   *         description: Task Anomaly Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-anomaly-monitor/:id',
    authenticate,
    idValidation,
    controller.getTaskAnomalyMonitorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-anomaly-monitor:
   *   post:
   *     summary: Create new task anomaly monitor item
   *     tags: [Task Anomaly Monitor]
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
   *                 description: Task Anomaly Monitor item name
   *               description:
   *                 type: string
   *                 description: Task Anomaly Monitor item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Anomaly Monitor item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-anomaly-monitor',
    authenticate,
    createTaskAnomalyMonitorValidation,
    controller.createTaskAnomalyMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-anomaly-monitor/{id}:
   *   put:
   *     summary: Update task anomaly monitor item
   *     tags: [Task Anomaly Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Anomaly Monitor item ID
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
   *         description: Task Anomaly Monitor item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Anomaly Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-anomaly-monitor/:id',
    authenticate,
    idValidation,
    updateTaskAnomalyMonitorValidation,
    controller.updateTaskAnomalyMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-anomaly-monitor/{id}:
   *   delete:
   *     summary: Delete task anomaly monitor item
   *     tags: [Task Anomaly Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Anomaly Monitor item ID
   *     responses:
   *       200:
   *         description: Task Anomaly Monitor item deleted successfully
   *       404:
   *         description: Task Anomaly Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-anomaly-monitor/:id',
    authenticate,
    idValidation,
    controller.deleteTaskAnomalyMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-anomaly-monitor/stats:
   *   get:
   *     summary: Get task anomaly monitor statistics
   *     tags: [Task Anomaly Monitor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Anomaly Monitor statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-anomaly-monitor/stats',
    authenticate,
    controller.getTaskAnomalyMonitorStats.bind(controller)
  );

  return router;
}