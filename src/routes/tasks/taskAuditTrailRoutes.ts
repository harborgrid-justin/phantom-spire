/**
 * Task Audit Trail Routes
 * Fortune 100-Grade Task Audit Trail Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskAuditTrailController } from './controllers/taskAuditTrailController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskAuditTrailRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskAuditTrailController(taskManager);

  // Validation middleware
  const createTaskAuditTrailValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskAuditTrailValidation = [
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
   * /api/v1/tasks/task-audit-trail:
   *   get:
   *     summary: Get all task audit trail items
   *     tags: [Task Audit Trail]
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
   *         description: List of task audit trail items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-audit-trail',
    authenticate,
    controller.getAllTaskAuditTrail.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-audit-trail/{id}:
   *   get:
   *     summary: Get task audit trail item by ID
   *     tags: [Task Audit Trail]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Audit Trail item ID
   *     responses:
   *       200:
   *         description: Task Audit Trail item details
   *       404:
   *         description: Task Audit Trail item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-audit-trail/:id',
    authenticate,
    idValidation,
    controller.getTaskAuditTrailById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-audit-trail:
   *   post:
   *     summary: Create new task audit trail item
   *     tags: [Task Audit Trail]
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
   *                 description: Task Audit Trail item name
   *               description:
   *                 type: string
   *                 description: Task Audit Trail item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Audit Trail item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-audit-trail',
    authenticate,
    createTaskAuditTrailValidation,
    controller.createTaskAuditTrail.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-audit-trail/{id}:
   *   put:
   *     summary: Update task audit trail item
   *     tags: [Task Audit Trail]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Audit Trail item ID
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
   *         description: Task Audit Trail item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Audit Trail item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-audit-trail/:id',
    authenticate,
    idValidation,
    updateTaskAuditTrailValidation,
    controller.updateTaskAuditTrail.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-audit-trail/{id}:
   *   delete:
   *     summary: Delete task audit trail item
   *     tags: [Task Audit Trail]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Audit Trail item ID
   *     responses:
   *       200:
   *         description: Task Audit Trail item deleted successfully
   *       404:
   *         description: Task Audit Trail item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-audit-trail/:id',
    authenticate,
    idValidation,
    controller.deleteTaskAuditTrail.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-audit-trail/stats:
   *   get:
   *     summary: Get task audit trail statistics
   *     tags: [Task Audit Trail]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Audit Trail statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-audit-trail/stats',
    authenticate,
    controller.getTaskAuditTrailStats.bind(controller)
  );

  return router;
}