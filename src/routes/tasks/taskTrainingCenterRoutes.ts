/**
 * Task Training Center Routes
 * Fortune 100-Grade Task Training Center Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskTrainingCenterController } from './controllers/taskTrainingCenterController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskTrainingCenterRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskTrainingCenterController(taskManager);

  // Validation middleware
  const createTaskTrainingCenterValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskTrainingCenterValidation = [
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
   * /api/v1/tasks/task-training-center:
   *   get:
   *     summary: Get all task training center items
   *     tags: [Task Training Center]
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
   *         description: List of task training center items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-training-center',
    authenticate,
    controller.getAllTaskTrainingCenter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-training-center/{id}:
   *   get:
   *     summary: Get task training center item by ID
   *     tags: [Task Training Center]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Training Center item ID
   *     responses:
   *       200:
   *         description: Task Training Center item details
   *       404:
   *         description: Task Training Center item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-training-center/:id',
    authenticate,
    idValidation,
    controller.getTaskTrainingCenterById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-training-center:
   *   post:
   *     summary: Create new task training center item
   *     tags: [Task Training Center]
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
   *                 description: Task Training Center item name
   *               description:
   *                 type: string
   *                 description: Task Training Center item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Training Center item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-training-center',
    authenticate,
    createTaskTrainingCenterValidation,
    controller.createTaskTrainingCenter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-training-center/{id}:
   *   put:
   *     summary: Update task training center item
   *     tags: [Task Training Center]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Training Center item ID
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
   *         description: Task Training Center item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Training Center item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-training-center/:id',
    authenticate,
    idValidation,
    updateTaskTrainingCenterValidation,
    controller.updateTaskTrainingCenter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-training-center/{id}:
   *   delete:
   *     summary: Delete task training center item
   *     tags: [Task Training Center]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Training Center item ID
   *     responses:
   *       200:
   *         description: Task Training Center item deleted successfully
   *       404:
   *         description: Task Training Center item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-training-center/:id',
    authenticate,
    idValidation,
    controller.deleteTaskTrainingCenter.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-training-center/stats:
   *   get:
   *     summary: Get task training center statistics
   *     tags: [Task Training Center]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Training Center statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-training-center/stats',
    authenticate,
    controller.getTaskTrainingCenterStats.bind(controller)
  );

  return router;
}