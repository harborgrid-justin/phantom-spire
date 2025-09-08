/**
 * Task Capacity Planner Routes
 * Fortune 100-Grade Task Capacity Planner Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskCapacityPlannerController } from './controllers/taskCapacityPlannerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskCapacityPlannerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskCapacityPlannerController(taskManager);

  // Validation middleware
  const createTaskCapacityPlannerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskCapacityPlannerValidation = [
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
   * /api/v1/tasks/task-capacity-planner:
   *   get:
   *     summary: Get all task capacity planner items
   *     tags: [Task Capacity Planner]
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
   *         description: List of task capacity planner items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-capacity-planner',
    authenticate,
    controller.getAllTaskCapacityPlanner.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-capacity-planner/{id}:
   *   get:
   *     summary: Get task capacity planner item by ID
   *     tags: [Task Capacity Planner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Capacity Planner item ID
   *     responses:
   *       200:
   *         description: Task Capacity Planner item details
   *       404:
   *         description: Task Capacity Planner item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-capacity-planner/:id',
    authenticate,
    idValidation,
    controller.getTaskCapacityPlannerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-capacity-planner:
   *   post:
   *     summary: Create new task capacity planner item
   *     tags: [Task Capacity Planner]
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
   *                 description: Task Capacity Planner item name
   *               description:
   *                 type: string
   *                 description: Task Capacity Planner item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Capacity Planner item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-capacity-planner',
    authenticate,
    createTaskCapacityPlannerValidation,
    controller.createTaskCapacityPlanner.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-capacity-planner/{id}:
   *   put:
   *     summary: Update task capacity planner item
   *     tags: [Task Capacity Planner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Capacity Planner item ID
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
   *         description: Task Capacity Planner item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Capacity Planner item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-capacity-planner/:id',
    authenticate,
    idValidation,
    updateTaskCapacityPlannerValidation,
    controller.updateTaskCapacityPlanner.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-capacity-planner/{id}:
   *   delete:
   *     summary: Delete task capacity planner item
   *     tags: [Task Capacity Planner]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Capacity Planner item ID
   *     responses:
   *       200:
   *         description: Task Capacity Planner item deleted successfully
   *       404:
   *         description: Task Capacity Planner item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-capacity-planner/:id',
    authenticate,
    idValidation,
    controller.deleteTaskCapacityPlanner.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-capacity-planner/stats:
   *   get:
   *     summary: Get task capacity planner statistics
   *     tags: [Task Capacity Planner]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Capacity Planner statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-capacity-planner/stats',
    authenticate,
    controller.getTaskCapacityPlannerStats.bind(controller)
  );

  return router;
}