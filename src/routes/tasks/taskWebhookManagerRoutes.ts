/**
 * Task Webhook Manager Routes
 * Fortune 100-Grade Task Webhook Manager Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskWebhookManagerController } from './controllers/taskWebhookManagerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskWebhookManagerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskWebhookManagerController(taskManager);

  // Validation middleware
  const createTaskWebhookManagerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskWebhookManagerValidation = [
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
   * /api/v1/tasks/task-webhook-manager:
   *   get:
   *     summary: Get all task webhook manager items
   *     tags: [Task Webhook Manager]
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
   *         description: List of task webhook manager items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-webhook-manager',
    authenticate,
    controller.getAllTaskWebhookManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-webhook-manager/{id}:
   *   get:
   *     summary: Get task webhook manager item by ID
   *     tags: [Task Webhook Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Webhook Manager item ID
   *     responses:
   *       200:
   *         description: Task Webhook Manager item details
   *       404:
   *         description: Task Webhook Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-webhook-manager/:id',
    authenticate,
    idValidation,
    controller.getTaskWebhookManagerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-webhook-manager:
   *   post:
   *     summary: Create new task webhook manager item
   *     tags: [Task Webhook Manager]
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
   *                 description: Task Webhook Manager item name
   *               description:
   *                 type: string
   *                 description: Task Webhook Manager item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Webhook Manager item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-webhook-manager',
    authenticate,
    createTaskWebhookManagerValidation,
    controller.createTaskWebhookManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-webhook-manager/{id}:
   *   put:
   *     summary: Update task webhook manager item
   *     tags: [Task Webhook Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Webhook Manager item ID
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
   *         description: Task Webhook Manager item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Webhook Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-webhook-manager/:id',
    authenticate,
    idValidation,
    updateTaskWebhookManagerValidation,
    controller.updateTaskWebhookManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-webhook-manager/{id}:
   *   delete:
   *     summary: Delete task webhook manager item
   *     tags: [Task Webhook Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Webhook Manager item ID
   *     responses:
   *       200:
   *         description: Task Webhook Manager item deleted successfully
   *       404:
   *         description: Task Webhook Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-webhook-manager/:id',
    authenticate,
    idValidation,
    controller.deleteTaskWebhookManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-webhook-manager/stats:
   *   get:
   *     summary: Get task webhook manager statistics
   *     tags: [Task Webhook Manager]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Webhook Manager statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-webhook-manager/stats',
    authenticate,
    controller.getTaskWebhookManagerStats.bind(controller)
  );

  return router;
}