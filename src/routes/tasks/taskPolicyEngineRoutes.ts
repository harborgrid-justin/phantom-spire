/**
 * Task Policy Engine Routes
 * Fortune 100-Grade Task Policy Engine Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskPolicyEngineController } from './controllers/taskPolicyEngineController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskPolicyEngineRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskPolicyEngineController(taskManager);

  // Validation middleware
  const createTaskPolicyEngineValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskPolicyEngineValidation = [
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
   * /api/v1/tasks/task-policy-engine:
   *   get:
   *     summary: Get all task policy engine items
   *     tags: [Task Policy Engine]
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
   *         description: List of task policy engine items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-policy-engine',
    authenticate,
    controller.getAllTaskPolicyEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-policy-engine/{id}:
   *   get:
   *     summary: Get task policy engine item by ID
   *     tags: [Task Policy Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Policy Engine item ID
   *     responses:
   *       200:
   *         description: Task Policy Engine item details
   *       404:
   *         description: Task Policy Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-policy-engine/:id',
    authenticate,
    idValidation,
    controller.getTaskPolicyEngineById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-policy-engine:
   *   post:
   *     summary: Create new task policy engine item
   *     tags: [Task Policy Engine]
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
   *                 description: Task Policy Engine item name
   *               description:
   *                 type: string
   *                 description: Task Policy Engine item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Policy Engine item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-policy-engine',
    authenticate,
    createTaskPolicyEngineValidation,
    controller.createTaskPolicyEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-policy-engine/{id}:
   *   put:
   *     summary: Update task policy engine item
   *     tags: [Task Policy Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Policy Engine item ID
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
   *         description: Task Policy Engine item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Policy Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-policy-engine/:id',
    authenticate,
    idValidation,
    updateTaskPolicyEngineValidation,
    controller.updateTaskPolicyEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-policy-engine/{id}:
   *   delete:
   *     summary: Delete task policy engine item
   *     tags: [Task Policy Engine]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Policy Engine item ID
   *     responses:
   *       200:
   *         description: Task Policy Engine item deleted successfully
   *       404:
   *         description: Task Policy Engine item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-policy-engine/:id',
    authenticate,
    idValidation,
    controller.deleteTaskPolicyEngine.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-policy-engine/stats:
   *   get:
   *     summary: Get task policy engine statistics
   *     tags: [Task Policy Engine]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Policy Engine statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-policy-engine/stats',
    authenticate,
    controller.getTaskPolicyEngineStats.bind(controller)
  );

  return router;
}