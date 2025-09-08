/**
 * Task Batch Processor Routes
 * Fortune 100-Grade Task Batch Processor Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskBatchProcessorController } from './controllers/taskBatchProcessorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskBatchProcessorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskBatchProcessorController(taskManager);

  // Validation middleware
  const createTaskBatchProcessorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskBatchProcessorValidation = [
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
   * /api/v1/tasks/task-batch-processor:
   *   get:
   *     summary: Get all task batch processor items
   *     tags: [Task Batch Processor]
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
   *         description: List of task batch processor items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-batch-processor',
    authenticate,
    controller.getAllTaskBatchProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-batch-processor/{id}:
   *   get:
   *     summary: Get task batch processor item by ID
   *     tags: [Task Batch Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Batch Processor item ID
   *     responses:
   *       200:
   *         description: Task Batch Processor item details
   *       404:
   *         description: Task Batch Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-batch-processor/:id',
    authenticate,
    idValidation,
    controller.getTaskBatchProcessorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-batch-processor:
   *   post:
   *     summary: Create new task batch processor item
   *     tags: [Task Batch Processor]
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
   *                 description: Task Batch Processor item name
   *               description:
   *                 type: string
   *                 description: Task Batch Processor item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Batch Processor item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-batch-processor',
    authenticate,
    createTaskBatchProcessorValidation,
    controller.createTaskBatchProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-batch-processor/{id}:
   *   put:
   *     summary: Update task batch processor item
   *     tags: [Task Batch Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Batch Processor item ID
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
   *         description: Task Batch Processor item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Batch Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-batch-processor/:id',
    authenticate,
    idValidation,
    updateTaskBatchProcessorValidation,
    controller.updateTaskBatchProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-batch-processor/{id}:
   *   delete:
   *     summary: Delete task batch processor item
   *     tags: [Task Batch Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Batch Processor item ID
   *     responses:
   *       200:
   *         description: Task Batch Processor item deleted successfully
   *       404:
   *         description: Task Batch Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-batch-processor/:id',
    authenticate,
    idValidation,
    controller.deleteTaskBatchProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-batch-processor/stats:
   *   get:
   *     summary: Get task batch processor statistics
   *     tags: [Task Batch Processor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Batch Processor statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-batch-processor/stats',
    authenticate,
    controller.getTaskBatchProcessorStats.bind(controller)
  );

  return router;
}