/**
 * Task Resource Optimizer Routes
 * Fortune 100-Grade Task Resource Optimizer Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskResourceOptimizerController } from './controllers/taskResourceOptimizerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskResourceOptimizerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskResourceOptimizerController(taskManager);

  // Validation middleware
  const createTaskResourceOptimizerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskResourceOptimizerValidation = [
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
   * /api/v1/tasks/task-resource-optimizer:
   *   get:
   *     summary: Get all task resource optimizer items
   *     tags: [Task Resource Optimizer]
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
   *         description: List of task resource optimizer items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-resource-optimizer',
    authenticate,
    controller.getAllTaskResourceOptimizer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-resource-optimizer/{id}:
   *   get:
   *     summary: Get task resource optimizer item by ID
   *     tags: [Task Resource Optimizer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Resource Optimizer item ID
   *     responses:
   *       200:
   *         description: Task Resource Optimizer item details
   *       404:
   *         description: Task Resource Optimizer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-resource-optimizer/:id',
    authenticate,
    idValidation,
    controller.getTaskResourceOptimizerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-resource-optimizer:
   *   post:
   *     summary: Create new task resource optimizer item
   *     tags: [Task Resource Optimizer]
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
   *                 description: Task Resource Optimizer item name
   *               description:
   *                 type: string
   *                 description: Task Resource Optimizer item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Resource Optimizer item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-resource-optimizer',
    authenticate,
    createTaskResourceOptimizerValidation,
    controller.createTaskResourceOptimizer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-resource-optimizer/{id}:
   *   put:
   *     summary: Update task resource optimizer item
   *     tags: [Task Resource Optimizer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Resource Optimizer item ID
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
   *         description: Task Resource Optimizer item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Resource Optimizer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-resource-optimizer/:id',
    authenticate,
    idValidation,
    updateTaskResourceOptimizerValidation,
    controller.updateTaskResourceOptimizer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-resource-optimizer/{id}:
   *   delete:
   *     summary: Delete task resource optimizer item
   *     tags: [Task Resource Optimizer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Resource Optimizer item ID
   *     responses:
   *       200:
   *         description: Task Resource Optimizer item deleted successfully
   *       404:
   *         description: Task Resource Optimizer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-resource-optimizer/:id',
    authenticate,
    idValidation,
    controller.deleteTaskResourceOptimizer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-resource-optimizer/stats:
   *   get:
   *     summary: Get task resource optimizer statistics
   *     tags: [Task Resource Optimizer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Resource Optimizer statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-resource-optimizer/stats',
    authenticate,
    controller.getTaskResourceOptimizerStats.bind(controller)
  );

  return router;
}