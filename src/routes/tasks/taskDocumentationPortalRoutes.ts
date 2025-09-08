/**
 * Task Documentation Portal Routes
 * Fortune 100-Grade Task Documentation Portal Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskDocumentationPortalController } from './controllers/taskDocumentationPortalController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskDocumentationPortalRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskDocumentationPortalController(taskManager);

  // Validation middleware
  const createTaskDocumentationPortalValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskDocumentationPortalValidation = [
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
   * /api/v1/tasks/task-documentation-portal:
   *   get:
   *     summary: Get all task documentation portal items
   *     tags: [Task Documentation Portal]
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
   *         description: List of task documentation portal items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-documentation-portal',
    authenticate,
    controller.getAllTaskDocumentationPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-documentation-portal/{id}:
   *   get:
   *     summary: Get task documentation portal item by ID
   *     tags: [Task Documentation Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Documentation Portal item ID
   *     responses:
   *       200:
   *         description: Task Documentation Portal item details
   *       404:
   *         description: Task Documentation Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-documentation-portal/:id',
    authenticate,
    idValidation,
    controller.getTaskDocumentationPortalById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-documentation-portal:
   *   post:
   *     summary: Create new task documentation portal item
   *     tags: [Task Documentation Portal]
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
   *                 description: Task Documentation Portal item name
   *               description:
   *                 type: string
   *                 description: Task Documentation Portal item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Documentation Portal item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-documentation-portal',
    authenticate,
    createTaskDocumentationPortalValidation,
    controller.createTaskDocumentationPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-documentation-portal/{id}:
   *   put:
   *     summary: Update task documentation portal item
   *     tags: [Task Documentation Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Documentation Portal item ID
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
   *         description: Task Documentation Portal item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Documentation Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-documentation-portal/:id',
    authenticate,
    idValidation,
    updateTaskDocumentationPortalValidation,
    controller.updateTaskDocumentationPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-documentation-portal/{id}:
   *   delete:
   *     summary: Delete task documentation portal item
   *     tags: [Task Documentation Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Documentation Portal item ID
   *     responses:
   *       200:
   *         description: Task Documentation Portal item deleted successfully
   *       404:
   *         description: Task Documentation Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-documentation-portal/:id',
    authenticate,
    idValidation,
    controller.deleteTaskDocumentationPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-documentation-portal/stats:
   *   get:
   *     summary: Get task documentation portal statistics
   *     tags: [Task Documentation Portal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Documentation Portal statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-documentation-portal/stats',
    authenticate,
    controller.getTaskDocumentationPortalStats.bind(controller)
  );

  return router;
}