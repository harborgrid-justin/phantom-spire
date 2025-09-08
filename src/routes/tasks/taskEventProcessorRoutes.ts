/**
 * Task Event Processor Routes
 * Fortune 100-Grade Task Event Processor Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskEventProcessorController } from './controllers/taskEventProcessorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskEventProcessorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskEventProcessorController(taskManager);

  // Validation middleware
  const createTaskEventProcessorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskEventProcessorValidation = [
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
   * /api/v1/tasks/task-event-processor:
   *   get:
   *     summary: Get all task event processor items
   *     tags: [Task Event Processor]
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
   *         description: List of task event processor items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-event-processor',
    authenticate,
    controller.getAllTaskEventProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-event-processor/{id}:
   *   get:
   *     summary: Get task event processor item by ID
   *     tags: [Task Event Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Event Processor item ID
   *     responses:
   *       200:
   *         description: Task Event Processor item details
   *       404:
   *         description: Task Event Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-event-processor/:id',
    authenticate,
    idValidation,
    controller.getTaskEventProcessorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-event-processor:
   *   post:
   *     summary: Create new task event processor item
   *     tags: [Task Event Processor]
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
   *                 description: Task Event Processor item name
   *               description:
   *                 type: string
   *                 description: Task Event Processor item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Event Processor item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-event-processor',
    authenticate,
    createTaskEventProcessorValidation,
    controller.createTaskEventProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-event-processor/{id}:
   *   put:
   *     summary: Update task event processor item
   *     tags: [Task Event Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Event Processor item ID
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
   *         description: Task Event Processor item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Event Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-event-processor/:id',
    authenticate,
    idValidation,
    updateTaskEventProcessorValidation,
    controller.updateTaskEventProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-event-processor/{id}:
   *   delete:
   *     summary: Delete task event processor item
   *     tags: [Task Event Processor]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Event Processor item ID
   *     responses:
   *       200:
   *         description: Task Event Processor item deleted successfully
   *       404:
   *         description: Task Event Processor item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-event-processor/:id',
    authenticate,
    idValidation,
    controller.deleteTaskEventProcessor.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-event-processor/stats:
   *   get:
   *     summary: Get task event processor statistics
   *     tags: [Task Event Processor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Event Processor statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-event-processor/stats',
    authenticate,
    controller.getTaskEventProcessorStats.bind(controller)
  );

  return router;
}