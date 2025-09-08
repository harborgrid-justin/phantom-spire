/**
 * Task Compliance Monitor Routes
 * Fortune 100-Grade Task Compliance Monitor Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskComplianceMonitorController } from './controllers/taskComplianceMonitorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskComplianceMonitorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskComplianceMonitorController(taskManager);

  // Validation middleware
  const createTaskComplianceMonitorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskComplianceMonitorValidation = [
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
   * /api/v1/tasks/task-compliance-monitor:
   *   get:
   *     summary: Get all task compliance monitor items
   *     tags: [Task Compliance Monitor]
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
   *         description: List of task compliance monitor items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-compliance-monitor',
    authenticate,
    controller.getAllTaskComplianceMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-compliance-monitor/{id}:
   *   get:
   *     summary: Get task compliance monitor item by ID
   *     tags: [Task Compliance Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Compliance Monitor item ID
   *     responses:
   *       200:
   *         description: Task Compliance Monitor item details
   *       404:
   *         description: Task Compliance Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-compliance-monitor/:id',
    authenticate,
    idValidation,
    controller.getTaskComplianceMonitorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-compliance-monitor:
   *   post:
   *     summary: Create new task compliance monitor item
   *     tags: [Task Compliance Monitor]
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
   *                 description: Task Compliance Monitor item name
   *               description:
   *                 type: string
   *                 description: Task Compliance Monitor item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Compliance Monitor item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-compliance-monitor',
    authenticate,
    createTaskComplianceMonitorValidation,
    controller.createTaskComplianceMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-compliance-monitor/{id}:
   *   put:
   *     summary: Update task compliance monitor item
   *     tags: [Task Compliance Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Compliance Monitor item ID
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
   *         description: Task Compliance Monitor item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Compliance Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-compliance-monitor/:id',
    authenticate,
    idValidation,
    updateTaskComplianceMonitorValidation,
    controller.updateTaskComplianceMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-compliance-monitor/{id}:
   *   delete:
   *     summary: Delete task compliance monitor item
   *     tags: [Task Compliance Monitor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Compliance Monitor item ID
   *     responses:
   *       200:
   *         description: Task Compliance Monitor item deleted successfully
   *       404:
   *         description: Task Compliance Monitor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-compliance-monitor/:id',
    authenticate,
    idValidation,
    controller.deleteTaskComplianceMonitor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-compliance-monitor/stats:
   *   get:
   *     summary: Get task compliance monitor statistics
   *     tags: [Task Compliance Monitor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Compliance Monitor statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-compliance-monitor/stats',
    authenticate,
    controller.getTaskComplianceMonitorStats.bind(controller)
  );

  return router;
}