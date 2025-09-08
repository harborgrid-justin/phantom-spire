/**
 * Task Integration Hub Routes
 * Fortune 100-Grade Task Integration Hub Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskIntegrationHubController } from './controllers/taskIntegrationHubController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskIntegrationHubRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskIntegrationHubController(taskManager);

  // Validation middleware
  const createTaskIntegrationHubValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskIntegrationHubValidation = [
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
   * /api/v1/tasks/task-integration-hub:
   *   get:
   *     summary: Get all task integration hub items
   *     tags: [Task Integration Hub]
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
   *         description: List of task integration hub items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-integration-hub',
    authenticate,
    controller.getAllTaskIntegrationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-integration-hub/{id}:
   *   get:
   *     summary: Get task integration hub item by ID
   *     tags: [Task Integration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Integration Hub item ID
   *     responses:
   *       200:
   *         description: Task Integration Hub item details
   *       404:
   *         description: Task Integration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-integration-hub/:id',
    authenticate,
    idValidation,
    controller.getTaskIntegrationHubById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-integration-hub:
   *   post:
   *     summary: Create new task integration hub item
   *     tags: [Task Integration Hub]
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
   *                 description: Task Integration Hub item name
   *               description:
   *                 type: string
   *                 description: Task Integration Hub item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Integration Hub item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-integration-hub',
    authenticate,
    createTaskIntegrationHubValidation,
    controller.createTaskIntegrationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-integration-hub/{id}:
   *   put:
   *     summary: Update task integration hub item
   *     tags: [Task Integration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Integration Hub item ID
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
   *         description: Task Integration Hub item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Integration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-integration-hub/:id',
    authenticate,
    idValidation,
    updateTaskIntegrationHubValidation,
    controller.updateTaskIntegrationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-integration-hub/{id}:
   *   delete:
   *     summary: Delete task integration hub item
   *     tags: [Task Integration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Integration Hub item ID
   *     responses:
   *       200:
   *         description: Task Integration Hub item deleted successfully
   *       404:
   *         description: Task Integration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-integration-hub/:id',
    authenticate,
    idValidation,
    controller.deleteTaskIntegrationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-integration-hub/stats:
   *   get:
   *     summary: Get task integration hub statistics
   *     tags: [Task Integration Hub]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Integration Hub statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-integration-hub/stats',
    authenticate,
    controller.getTaskIntegrationHubStats.bind(controller)
  );

  return router;
}