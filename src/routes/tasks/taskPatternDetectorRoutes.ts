/**
 * Task Pattern Detector Routes
 * Fortune 100-Grade Task Pattern Detector Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskPatternDetectorController } from './controllers/taskPatternDetectorController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskPatternDetectorRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskPatternDetectorController(taskManager);

  // Validation middleware
  const createTaskPatternDetectorValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskPatternDetectorValidation = [
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
   * /api/v1/tasks/task-pattern-detector:
   *   get:
   *     summary: Get all task pattern detector items
   *     tags: [Task Pattern Detector]
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
   *         description: List of task pattern detector items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-pattern-detector',
    authenticate,
    controller.getAllTaskPatternDetector.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-pattern-detector/{id}:
   *   get:
   *     summary: Get task pattern detector item by ID
   *     tags: [Task Pattern Detector]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Pattern Detector item ID
   *     responses:
   *       200:
   *         description: Task Pattern Detector item details
   *       404:
   *         description: Task Pattern Detector item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-pattern-detector/:id',
    authenticate,
    idValidation,
    controller.getTaskPatternDetectorById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-pattern-detector:
   *   post:
   *     summary: Create new task pattern detector item
   *     tags: [Task Pattern Detector]
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
   *                 description: Task Pattern Detector item name
   *               description:
   *                 type: string
   *                 description: Task Pattern Detector item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Pattern Detector item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-pattern-detector',
    authenticate,
    createTaskPatternDetectorValidation,
    controller.createTaskPatternDetector.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-pattern-detector/{id}:
   *   put:
   *     summary: Update task pattern detector item
   *     tags: [Task Pattern Detector]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Pattern Detector item ID
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
   *         description: Task Pattern Detector item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Pattern Detector item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-pattern-detector/:id',
    authenticate,
    idValidation,
    updateTaskPatternDetectorValidation,
    controller.updateTaskPatternDetector.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-pattern-detector/{id}:
   *   delete:
   *     summary: Delete task pattern detector item
   *     tags: [Task Pattern Detector]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Pattern Detector item ID
   *     responses:
   *       200:
   *         description: Task Pattern Detector item deleted successfully
   *       404:
   *         description: Task Pattern Detector item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-pattern-detector/:id',
    authenticate,
    idValidation,
    controller.deleteTaskPatternDetector.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-pattern-detector/stats:
   *   get:
   *     summary: Get task pattern detector statistics
   *     tags: [Task Pattern Detector]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Pattern Detector statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-pattern-detector/stats',
    authenticate,
    controller.getTaskPatternDetectorStats.bind(controller)
  );

  return router;
}