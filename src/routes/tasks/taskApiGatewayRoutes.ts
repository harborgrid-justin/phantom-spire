/**
 * Task API Gateway Routes
 * Fortune 100-Grade Task API Gateway Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskApiGatewayController } from './controllers/taskApiGatewayController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskApiGatewayRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskApiGatewayController(taskManager);

  // Validation middleware
  const createTaskApiGatewayValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskApiGatewayValidation = [
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
   * /api/v1/tasks/task-api-gateway:
   *   get:
   *     summary: Get all task api gateway items
   *     tags: [Task API Gateway]
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
   *         description: List of task api gateway items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-api-gateway',
    authenticate,
    controller.getAllTaskApiGateway.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-api-gateway/{id}:
   *   get:
   *     summary: Get task api gateway item by ID
   *     tags: [Task API Gateway]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task API Gateway item ID
   *     responses:
   *       200:
   *         description: Task API Gateway item details
   *       404:
   *         description: Task API Gateway item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-api-gateway/:id',
    authenticate,
    idValidation,
    controller.getTaskApiGatewayById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-api-gateway:
   *   post:
   *     summary: Create new task api gateway item
   *     tags: [Task API Gateway]
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
   *                 description: Task API Gateway item name
   *               description:
   *                 type: string
   *                 description: Task API Gateway item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task API Gateway item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-api-gateway',
    authenticate,
    createTaskApiGatewayValidation,
    controller.createTaskApiGateway.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-api-gateway/{id}:
   *   put:
   *     summary: Update task api gateway item
   *     tags: [Task API Gateway]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task API Gateway item ID
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
   *         description: Task API Gateway item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task API Gateway item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-api-gateway/:id',
    authenticate,
    idValidation,
    updateTaskApiGatewayValidation,
    controller.updateTaskApiGateway.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-api-gateway/{id}:
   *   delete:
   *     summary: Delete task api gateway item
   *     tags: [Task API Gateway]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task API Gateway item ID
   *     responses:
   *       200:
   *         description: Task API Gateway item deleted successfully
   *       404:
   *         description: Task API Gateway item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-api-gateway/:id',
    authenticate,
    idValidation,
    controller.deleteTaskApiGateway.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-api-gateway/stats:
   *   get:
   *     summary: Get task api gateway statistics
   *     tags: [Task API Gateway]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task API Gateway statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-api-gateway/stats',
    authenticate,
    controller.getTaskApiGatewayStats.bind(controller)
  );

  return router;
}