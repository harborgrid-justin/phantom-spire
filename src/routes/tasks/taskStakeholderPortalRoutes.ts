/**
 * Task Stakeholder Portal Routes
 * Fortune 100-Grade Task Stakeholder Portal Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskStakeholderPortalController } from './controllers/taskStakeholderPortalController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskStakeholderPortalRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskStakeholderPortalController(taskManager);

  // Validation middleware
  const createTaskStakeholderPortalValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskStakeholderPortalValidation = [
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
   * /api/v1/tasks/task-stakeholder-portal:
   *   get:
   *     summary: Get all task stakeholder portal items
   *     tags: [Task Stakeholder Portal]
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
   *         description: List of task stakeholder portal items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-stakeholder-portal',
    authenticate,
    controller.getAllTaskStakeholderPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-stakeholder-portal/{id}:
   *   get:
   *     summary: Get task stakeholder portal item by ID
   *     tags: [Task Stakeholder Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Stakeholder Portal item ID
   *     responses:
   *       200:
   *         description: Task Stakeholder Portal item details
   *       404:
   *         description: Task Stakeholder Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-stakeholder-portal/:id',
    authenticate,
    idValidation,
    controller.getTaskStakeholderPortalById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-stakeholder-portal:
   *   post:
   *     summary: Create new task stakeholder portal item
   *     tags: [Task Stakeholder Portal]
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
   *                 description: Task Stakeholder Portal item name
   *               description:
   *                 type: string
   *                 description: Task Stakeholder Portal item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Stakeholder Portal item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-stakeholder-portal',
    authenticate,
    createTaskStakeholderPortalValidation,
    controller.createTaskStakeholderPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-stakeholder-portal/{id}:
   *   put:
   *     summary: Update task stakeholder portal item
   *     tags: [Task Stakeholder Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Stakeholder Portal item ID
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
   *         description: Task Stakeholder Portal item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Stakeholder Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-stakeholder-portal/:id',
    authenticate,
    idValidation,
    updateTaskStakeholderPortalValidation,
    controller.updateTaskStakeholderPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-stakeholder-portal/{id}:
   *   delete:
   *     summary: Delete task stakeholder portal item
   *     tags: [Task Stakeholder Portal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Stakeholder Portal item ID
   *     responses:
   *       200:
   *         description: Task Stakeholder Portal item deleted successfully
   *       404:
   *         description: Task Stakeholder Portal item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-stakeholder-portal/:id',
    authenticate,
    idValidation,
    controller.deleteTaskStakeholderPortal.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-stakeholder-portal/stats:
   *   get:
   *     summary: Get task stakeholder portal statistics
   *     tags: [Task Stakeholder Portal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Stakeholder Portal statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-stakeholder-portal/stats',
    authenticate,
    controller.getTaskStakeholderPortalStats.bind(controller)
  );

  return router;
}