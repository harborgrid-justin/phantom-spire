/**
 * Task Prediction Engine Routes
 * Fortune 100-Grade Task Prediction Engine Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskPredictionEngineController } from './controllers/taskPredictionEngineController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskPredictionEngineRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskPredictionEngineController(taskManager);

  // Validation middleware
  const createTaskPredictionEngineValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskPredictionEngineValidation = [
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
   * /api/v1/tasks/task-prediction-engine:
   *   get:
   *     summary: Get all task prediction engine items
   *     tags: [Task Prediction Engine]
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
   *         description: List of task prediction engine items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-prediction-engine',
    authenticate,
    controller.getAllTaskPredictionEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-prediction-engine/{id}:
   *   get:
   *     summary: Get task prediction engine item by ID
   *     tags: [Task Prediction Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Prediction Engine item ID
   *     responses:
   *       200:
   *         description: Task Prediction Engine item details
   *       404:
   *         description: Task Prediction Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-prediction-engine/:id',
    authenticate,
    idValidation,
    controller.getTaskPredictionEngineById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-prediction-engine:
   *   post:
   *     summary: Create new task prediction engine item
   *     tags: [Task Prediction Engine]
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
   *                 description: Task Prediction Engine item name
   *               description:
   *                 type: string
   *                 description: Task Prediction Engine item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Prediction Engine item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-prediction-engine',
    authenticate,
    createTaskPredictionEngineValidation,
    controller.createTaskPredictionEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-prediction-engine/{id}:
   *   put:
   *     summary: Update task prediction engine item
   *     tags: [Task Prediction Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Prediction Engine item ID
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
   *         description: Task Prediction Engine item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Prediction Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-prediction-engine/:id',
    authenticate,
    idValidation,
    updateTaskPredictionEngineValidation,
    controller.updateTaskPredictionEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-prediction-engine/{id}:
   *   delete:
   *     summary: Delete task prediction engine item
   *     tags: [Task Prediction Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Prediction Engine item ID
   *     responses:
   *       200:
   *         description: Task Prediction Engine item deleted successfully
   *       404:
   *         description: Task Prediction Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-prediction-engine/:id',
    authenticate,
    idValidation,
    controller.deleteTaskPredictionEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-prediction-engine/stats:
   *   get:
   *     summary: Get task prediction engine statistics
   *     tags: [Task Prediction Engine]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Prediction Engine statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-prediction-engine/stats',
    authenticate,
    controller.getTaskPredictionEngineStats.bind(controller)
  );

  return router;
}