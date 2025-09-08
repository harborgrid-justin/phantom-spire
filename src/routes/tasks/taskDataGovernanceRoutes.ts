/**
 * Task Data Governance Routes
 * Fortune 100-Grade Task Data Governance Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskDataGovernanceController } from './controllers/taskDataGovernanceController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskDataGovernanceRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskDataGovernanceController(taskManager);

  // Validation middleware
  const createTaskDataGovernanceValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskDataGovernanceValidation = [
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
   * /api/v1/tasks/task-data-governance:
   *   get:
   *     summary: Get all task data governance items
   *     tags: [Task Data Governance]
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
   *         description: List of task data governance items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-governance',
    authenticate,
    controller.getAllTaskDataGovernance.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-governance/{id}:
   *   get:
   *     summary: Get task data governance item by ID
   *     tags: [Task Data Governance]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Governance item ID
   *     responses:
   *       200:
   *         description: Task Data Governance item details
   *       404:
   *         description: Task Data Governance item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-governance/:id',
    authenticate,
    idValidation,
    controller.getTaskDataGovernanceById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-governance:
   *   post:
   *     summary: Create new task data governance item
   *     tags: [Task Data Governance]
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
   *                 description: Task Data Governance item name
   *               description:
   *                 type: string
   *                 description: Task Data Governance item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Data Governance item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-data-governance',
    authenticate,
    createTaskDataGovernanceValidation,
    controller.createTaskDataGovernance.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-governance/{id}:
   *   put:
   *     summary: Update task data governance item
   *     tags: [Task Data Governance]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Governance item ID
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
   *         description: Task Data Governance item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Data Governance item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-data-governance/:id',
    authenticate,
    idValidation,
    updateTaskDataGovernanceValidation,
    controller.updateTaskDataGovernance.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-governance/{id}:
   *   delete:
   *     summary: Delete task data governance item
   *     tags: [Task Data Governance]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Data Governance item ID
   *     responses:
   *       200:
   *         description: Task Data Governance item deleted successfully
   *       404:
   *         description: Task Data Governance item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-data-governance/:id',
    authenticate,
    idValidation,
    controller.deleteTaskDataGovernance.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-data-governance/stats:
   *   get:
   *     summary: Get task data governance statistics
   *     tags: [Task Data Governance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Data Governance statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-data-governance/stats',
    authenticate,
    controller.getTaskDataGovernanceStats.bind(controller)
  );

  return router;
}