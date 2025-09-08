/**
 * Task Data Connectors Routes
 * Fortune 100-Grade Task Data Connectors Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskDataConnectorsController } from './controllers/taskDataConnectorsController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskDataConnectorsRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskDataConnectorsController(taskManager);

  // Validation middleware
  const createTaskDataConnectorsValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskDataConnectorsValidation = [
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
   * /api/v1/tasks/task-data-connectors:
   *   get:
   *     summary: Get all task data connectors items
   *     tags: [Task Data Connectors]
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
   *         description: List of task data connectors items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-connectors',
    authenticate,
    controller.getAllTaskDataConnectors.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-connectors/{id}:
   *   get:
   *     summary: Get task data connectors item by ID
   *     tags: [Task Data Connectors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Connectors item ID
   *     responses:
   *       200:
   *         description: Task Data Connectors item details
   *       404:
   *         description: Task Data Connectors item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-connectors/:id',
    authenticate,
    idValidation,
    controller.getTaskDataConnectorsById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-connectors:
   *   post:
   *     summary: Create new task data connectors item
   *     tags: [Task Data Connectors]
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
   *                 description: Task Data Connectors item name
   *               description:
   *                 type: string
   *                 description: Task Data Connectors item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Data Connectors item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-data-connectors',
    authenticate,
    createTaskDataConnectorsValidation,
    controller.createTaskDataConnectors.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-connectors/{id}:
   *   put:
   *     summary: Update task data connectors item
   *     tags: [Task Data Connectors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Connectors item ID
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
   *         description: Task Data Connectors item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Data Connectors item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-data-connectors/:id',
    authenticate,
    idValidation,
    updateTaskDataConnectorsValidation,
    controller.updateTaskDataConnectors.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-connectors/{id}:
   *   delete:
   *     summary: Delete task data connectors item
   *     tags: [Task Data Connectors]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Connectors item ID
   *     responses:
   *       200:
   *         description: Task Data Connectors item deleted successfully
   *       404:
   *         description: Task Data Connectors item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-data-connectors/:id',
    authenticate,
    idValidation,
    controller.deleteTaskDataConnectors.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-connectors/stats:
   *   get:
   *     summary: Get task data connectors statistics
   *     tags: [Task Data Connectors]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Data Connectors statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-connectors/stats',
    authenticate,
    controller.getTaskDataConnectorsStats.bind(controller)
  );

  return router;
}