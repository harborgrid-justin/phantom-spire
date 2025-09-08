/**
 * Task SIEM Integration Routes
 * Fortune 100-Grade Task SIEM Integration Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskSiemIntegrationController } from './controllers/taskSiemIntegrationController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskSiemIntegrationRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskSiemIntegrationController(taskManager);

  // Validation middleware
  const createTaskSiemIntegrationValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskSiemIntegrationValidation = [
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
   * /api/v1/tasks/task-siem-integration:
   *   get:
   *     summary: Get all task siem integration items
   *     tags: [Task SIEM Integration]
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
   *         description: List of task siem integration items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-siem-integration',
    authenticate,
    controller.getAllTaskSiemIntegration.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-siem-integration/{id}:
   *   get:
   *     summary: Get task siem integration item by ID
   *     tags: [Task SIEM Integration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task SIEM Integration item ID
   *     responses:
   *       200:
   *         description: Task SIEM Integration item details
   *       404:
   *         description: Task SIEM Integration item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-siem-integration/:id',
    authenticate,
    idValidation,
    controller.getTaskSiemIntegrationById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-siem-integration:
   *   post:
   *     summary: Create new task siem integration item
   *     tags: [Task SIEM Integration]
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
   *                 description: Task SIEM Integration item name
   *               description:
   *                 type: string
   *                 description: Task SIEM Integration item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task SIEM Integration item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-siem-integration',
    authenticate,
    createTaskSiemIntegrationValidation,
    controller.createTaskSiemIntegration.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-siem-integration/{id}:
   *   put:
   *     summary: Update task siem integration item
   *     tags: [Task SIEM Integration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task SIEM Integration item ID
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
   *         description: Task SIEM Integration item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task SIEM Integration item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-siem-integration/:id',
    authenticate,
    idValidation,
    updateTaskSiemIntegrationValidation,
    controller.updateTaskSiemIntegration.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-siem-integration/{id}:
   *   delete:
   *     summary: Delete task siem integration item
   *     tags: [Task SIEM Integration]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task SIEM Integration item ID
   *     responses:
   *       200:
   *         description: Task SIEM Integration item deleted successfully
   *       404:
   *         description: Task SIEM Integration item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-siem-integration/:id',
    authenticate,
    idValidation,
    controller.deleteTaskSiemIntegration.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-siem-integration/stats:
   *   get:
   *     summary: Get task siem integration statistics
   *     tags: [Task SIEM Integration]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task SIEM Integration statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-siem-integration/stats',
    authenticate,
    controller.getTaskSiemIntegrationStats.bind(controller)
  );

  return router;
}