/**
 * Task Certification Manager Routes
 * Fortune 100-Grade Task Certification Manager Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskCertificationManagerController } from './controllers/taskCertificationManagerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskCertificationManagerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskCertificationManagerController(taskManager);

  // Validation middleware
  const createTaskCertificationManagerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskCertificationManagerValidation = [
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
   * /api/v1/tasks/task-certification-manager:
   *   get:
   *     summary: Get all task certification manager items
   *     tags: [Task Certification Manager]
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
   *         description: List of task certification manager items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-certification-manager',
    authenticate,
    controller.getAllTaskCertificationManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-certification-manager/{id}:
   *   get:
   *     summary: Get task certification manager item by ID
   *     tags: [Task Certification Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Certification Manager item ID
   *     responses:
   *       200:
   *         description: Task Certification Manager item details
   *       404:
   *         description: Task Certification Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-certification-manager/:id',
    authenticate,
    idValidation,
    controller.getTaskCertificationManagerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-certification-manager:
   *   post:
   *     summary: Create new task certification manager item
   *     tags: [Task Certification Manager]
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
   *                 description: Task Certification Manager item name
   *               description:
   *                 type: string
   *                 description: Task Certification Manager item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Certification Manager item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-certification-manager',
    authenticate,
    createTaskCertificationManagerValidation,
    controller.createTaskCertificationManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-certification-manager/{id}:
   *   put:
   *     summary: Update task certification manager item
   *     tags: [Task Certification Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Certification Manager item ID
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
   *         description: Task Certification Manager item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Certification Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-certification-manager/:id',
    authenticate,
    idValidation,
    updateTaskCertificationManagerValidation,
    controller.updateTaskCertificationManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-certification-manager/{id}:
   *   delete:
   *     summary: Delete task certification manager item
   *     tags: [Task Certification Manager]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Certification Manager item ID
   *     responses:
   *       200:
   *         description: Task Certification Manager item deleted successfully
   *       404:
   *         description: Task Certification Manager item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-certification-manager/:id',
    authenticate,
    idValidation,
    controller.deleteTaskCertificationManager.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-certification-manager/stats:
   *   get:
   *     summary: Get task certification manager statistics
   *     tags: [Task Certification Manager]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Certification Manager statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-certification-manager/stats',
    authenticate,
    controller.getTaskCertificationManagerStats.bind(controller)
  );

  return router;
}