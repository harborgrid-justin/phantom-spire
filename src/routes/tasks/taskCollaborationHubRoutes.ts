/**
 * Task Collaboration Hub Routes
 * Fortune 100-Grade Task Collaboration Hub Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskCollaborationHubController } from './controllers/taskCollaborationHubController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskCollaborationHubRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskCollaborationHubController(taskManager);

  // Validation middleware
  const createTaskCollaborationHubValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskCollaborationHubValidation = [
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
   * /api/v1/tasks/task-collaboration-hub:
   *   get:
   *     summary: Get all task collaboration hub items
   *     tags: [Task Collaboration Hub]
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
   *         description: List of task collaboration hub items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-collaboration-hub',
    authenticate,
    controller.getAllTaskCollaborationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-collaboration-hub/{id}:
   *   get:
   *     summary: Get task collaboration hub item by ID
   *     tags: [Task Collaboration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Collaboration Hub item ID
   *     responses:
   *       200:
   *         description: Task Collaboration Hub item details
   *       404:
   *         description: Task Collaboration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-collaboration-hub/:id',
    authenticate,
    idValidation,
    controller.getTaskCollaborationHubById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-collaboration-hub:
   *   post:
   *     summary: Create new task collaboration hub item
   *     tags: [Task Collaboration Hub]
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
   *                 description: Task Collaboration Hub item name
   *               description:
   *                 type: string
   *                 description: Task Collaboration Hub item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Collaboration Hub item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-collaboration-hub',
    authenticate,
    createTaskCollaborationHubValidation,
    controller.createTaskCollaborationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-collaboration-hub/{id}:
   *   put:
   *     summary: Update task collaboration hub item
   *     tags: [Task Collaboration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Collaboration Hub item ID
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
   *         description: Task Collaboration Hub item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Collaboration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-collaboration-hub/:id',
    authenticate,
    idValidation,
    updateTaskCollaborationHubValidation,
    controller.updateTaskCollaborationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-collaboration-hub/{id}:
   *   delete:
   *     summary: Delete task collaboration hub item
   *     tags: [Task Collaboration Hub]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Collaboration Hub item ID
   *     responses:
   *       200:
   *         description: Task Collaboration Hub item deleted successfully
   *       404:
   *         description: Task Collaboration Hub item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-collaboration-hub/:id',
    authenticate,
    idValidation,
    controller.deleteTaskCollaborationHub.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-collaboration-hub/stats:
   *   get:
   *     summary: Get task collaboration hub statistics
   *     tags: [Task Collaboration Hub]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Collaboration Hub statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-collaboration-hub/stats',
    authenticate,
    controller.getTaskCollaborationHubStats.bind(controller)
  );

  return router;
}