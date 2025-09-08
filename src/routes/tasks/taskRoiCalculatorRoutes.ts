/**
 * Task ROI Calculator Routes
 * Fortune 100-Grade Task ROI Calculator Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskRoiCalculatorController } from './controllers/taskRoiCalculatorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskRoiCalculatorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskRoiCalculatorController(taskManager);

  // Validation middleware
  const createTaskRoiCalculatorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskRoiCalculatorValidation = [
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
   * /api/v1/tasks/task-roi-calculator:
   *   get:
   *     summary: Get all task roi calculator items
   *     tags: [Task ROI Calculator]
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
   *         description: List of task roi calculator items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-roi-calculator',
    authenticate,
    controller.getAllTaskRoiCalculator.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-roi-calculator/{id}:
   *   get:
   *     summary: Get task roi calculator item by ID
   *     tags: [Task ROI Calculator]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ROI Calculator item ID
   *     responses:
   *       200:
   *         description: Task ROI Calculator item details
   *       404:
   *         description: Task ROI Calculator item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-roi-calculator/:id',
    authenticate,
    idValidation,
    controller.getTaskRoiCalculatorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-roi-calculator:
   *   post:
   *     summary: Create new task roi calculator item
   *     tags: [Task ROI Calculator]
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
   *                 description: Task ROI Calculator item name
   *               description:
   *                 type: string
   *                 description: Task ROI Calculator item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task ROI Calculator item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-roi-calculator',
    authenticate,
    createTaskRoiCalculatorValidation,
    controller.createTaskRoiCalculator.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-roi-calculator/{id}:
   *   put:
   *     summary: Update task roi calculator item
   *     tags: [Task ROI Calculator]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ROI Calculator item ID
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
   *         description: Task ROI Calculator item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task ROI Calculator item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-roi-calculator/:id',
    authenticate,
    idValidation,
    updateTaskRoiCalculatorValidation,
    controller.updateTaskRoiCalculator.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-roi-calculator/{id}:
   *   delete:
   *     summary: Delete task roi calculator item
   *     tags: [Task ROI Calculator]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ROI Calculator item ID
   *     responses:
   *       200:
   *         description: Task ROI Calculator item deleted successfully
   *       404:
   *         description: Task ROI Calculator item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-roi-calculator/:id',
    authenticate,
    idValidation,
    controller.deleteTaskRoiCalculator.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-roi-calculator/stats:
   *   get:
   *     summary: Get task roi calculator statistics
   *     tags: [Task ROI Calculator]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task ROI Calculator statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-roi-calculator/stats',
    authenticate,
    controller.getTaskRoiCalculatorStats.bind(controller)
  );

  return router;
}