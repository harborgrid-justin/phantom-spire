/**
 * Task External Services Routes
 * Fortune 100-Grade Task External Services Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskExternalServicesController } from './controllers/taskExternalServicesController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskExternalServicesRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskExternalServicesController(taskManager);

  // Validation middleware
  const createTaskExternalServicesValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskExternalServicesValidation = [
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
   * /api/v1/tasks/task-external-services:
   *   get:
   *     summary: Get all task external services items
   *     tags: [Task External Services]
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
   *         description: List of task external services items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-external-services',
    authenticate,
    controller.getAllTaskExternalServices.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-external-services/{id}:
   *   get:
   *     summary: Get task external services item by ID
   *     tags: [Task External Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task External Services item ID
   *     responses:
   *       200:
   *         description: Task External Services item details
   *       404:
   *         description: Task External Services item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-external-services/:id',
    authenticate,
    idValidation,
    controller.getTaskExternalServicesById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-external-services:
   *   post:
   *     summary: Create new task external services item
   *     tags: [Task External Services]
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
   *                 description: Task External Services item name
   *               description:
   *                 type: string
   *                 description: Task External Services item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task External Services item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-external-services',
    authenticate,
    createTaskExternalServicesValidation,
    controller.createTaskExternalServices.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-external-services/{id}:
   *   put:
   *     summary: Update task external services item
   *     tags: [Task External Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task External Services item ID
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
   *         description: Task External Services item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task External Services item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-external-services/:id',
    authenticate,
    idValidation,
    updateTaskExternalServicesValidation,
    controller.updateTaskExternalServices.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-external-services/{id}:
   *   delete:
   *     summary: Delete task external services item
   *     tags: [Task External Services]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task External Services item ID
   *     responses:
   *       200:
   *         description: Task External Services item deleted successfully
   *       404:
   *         description: Task External Services item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-external-services/:id',
    authenticate,
    idValidation,
    controller.deleteTaskExternalServices.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-external-services/stats:
   *   get:
   *     summary: Get task external services statistics
   *     tags: [Task External Services]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task External Services statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-external-services/stats',
    authenticate,
    controller.getTaskExternalServicesStats.bind(controller)
  );

  return router;
}