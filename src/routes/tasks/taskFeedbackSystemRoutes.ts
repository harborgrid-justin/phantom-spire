/**
 * Task Feedback System Routes
 * Fortune 100-Grade Task Feedback System Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskFeedbackSystemController } from './controllers/taskFeedbackSystemController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskFeedbackSystemRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskFeedbackSystemController(taskManager);

  // Validation middleware
  const createTaskFeedbackSystemValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskFeedbackSystemValidation = [
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
   * /api/v1/tasks/task-feedback-system:
   *   get:
   *     summary: Get all task feedback system items
   *     tags: [Task Feedback System]
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
   *         description: List of task feedback system items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-feedback-system',
    authenticate,
    controller.getAllTaskFeedbackSystem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-feedback-system/{id}:
   *   get:
   *     summary: Get task feedback system item by ID
   *     tags: [Task Feedback System]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Feedback System item ID
   *     responses:
   *       200:
   *         description: Task Feedback System item details
   *       404:
   *         description: Task Feedback System item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-feedback-system/:id',
    authenticate,
    idValidation,
    controller.getTaskFeedbackSystemById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-feedback-system:
   *   post:
   *     summary: Create new task feedback system item
   *     tags: [Task Feedback System]
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
   *                 description: Task Feedback System item name
   *               description:
   *                 type: string
   *                 description: Task Feedback System item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Feedback System item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-feedback-system',
    authenticate,
    createTaskFeedbackSystemValidation,
    controller.createTaskFeedbackSystem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-feedback-system/{id}:
   *   put:
   *     summary: Update task feedback system item
   *     tags: [Task Feedback System]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Feedback System item ID
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
   *         description: Task Feedback System item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Feedback System item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-feedback-system/:id',
    authenticate,
    idValidation,
    updateTaskFeedbackSystemValidation,
    controller.updateTaskFeedbackSystem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-feedback-system/{id}:
   *   delete:
   *     summary: Delete task feedback system item
   *     tags: [Task Feedback System]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Feedback System item ID
   *     responses:
   *       200:
   *         description: Task Feedback System item deleted successfully
   *       404:
   *         description: Task Feedback System item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-feedback-system/:id',
    authenticate,
    idValidation,
    controller.deleteTaskFeedbackSystem.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-feedback-system/stats:
   *   get:
   *     summary: Get task feedback system statistics
   *     tags: [Task Feedback System]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Feedback System statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-feedback-system/stats',
    authenticate,
    controller.getTaskFeedbackSystemStats.bind(controller)
  );

  return router;
}