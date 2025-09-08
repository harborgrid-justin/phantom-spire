/**
 * Task Security Review Routes
 * Fortune 100-Grade Task Security Review Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskSecurityReviewController } from './controllers/taskSecurityReviewController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskSecurityReviewRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskSecurityReviewController(taskManager);

  // Validation middleware
  const createTaskSecurityReviewValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskSecurityReviewValidation = [
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
   * /api/v1/tasks/task-security-review:
   *   get:
   *     summary: Get all task security review items
   *     tags: [Task Security Review]
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
   *         description: List of task security review items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-security-review',
    authenticate,
    controller.getAllTaskSecurityReview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-security-review/{id}:
   *   get:
   *     summary: Get task security review item by ID
   *     tags: [Task Security Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Security Review item ID
   *     responses:
   *       200:
   *         description: Task Security Review item details
   *       404:
   *         description: Task Security Review item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-security-review/:id',
    authenticate,
    idValidation,
    controller.getTaskSecurityReviewById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-security-review:
   *   post:
   *     summary: Create new task security review item
   *     tags: [Task Security Review]
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
   *                 description: Task Security Review item name
   *               description:
   *                 type: string
   *                 description: Task Security Review item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Security Review item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-security-review',
    authenticate,
    createTaskSecurityReviewValidation,
    controller.createTaskSecurityReview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-security-review/{id}:
   *   put:
   *     summary: Update task security review item
   *     tags: [Task Security Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Security Review item ID
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
   *         description: Task Security Review item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Security Review item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-security-review/:id',
    authenticate,
    idValidation,
    updateTaskSecurityReviewValidation,
    controller.updateTaskSecurityReview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-security-review/{id}:
   *   delete:
   *     summary: Delete task security review item
   *     tags: [Task Security Review]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Security Review item ID
   *     responses:
   *       200:
   *         description: Task Security Review item deleted successfully
   *       404:
   *         description: Task Security Review item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-security-review/:id',
    authenticate,
    idValidation,
    controller.deleteTaskSecurityReview.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-security-review/stats:
   *   get:
   *     summary: Get task security review statistics
   *     tags: [Task Security Review]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Security Review statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-security-review/stats',
    authenticate,
    controller.getTaskSecurityReviewStats.bind(controller)
  );

  return router;
}