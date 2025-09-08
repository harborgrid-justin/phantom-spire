/**
 * Task Knowledge Base Routes
 * Fortune 100-Grade Task Knowledge Base Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskKnowledgeBaseController } from './controllers/taskKnowledgeBaseController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskKnowledgeBaseRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskKnowledgeBaseController(taskManager);

  // Validation middleware
  const createTaskKnowledgeBaseValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskKnowledgeBaseValidation = [
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
   * /api/v1/tasks/task-knowledge-base:
   *   get:
   *     summary: Get all task knowledge base items
   *     tags: [Task Knowledge Base]
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
   *         description: List of task knowledge base items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-knowledge-base',
    authenticate,
    controller.getAllTaskKnowledgeBase.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-knowledge-base/{id}:
   *   get:
   *     summary: Get task knowledge base item by ID
   *     tags: [Task Knowledge Base]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Knowledge Base item ID
   *     responses:
   *       200:
   *         description: Task Knowledge Base item details
   *       404:
   *         description: Task Knowledge Base item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-knowledge-base/:id',
    authenticate,
    idValidation,
    controller.getTaskKnowledgeBaseById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-knowledge-base:
   *   post:
   *     summary: Create new task knowledge base item
   *     tags: [Task Knowledge Base]
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
   *                 description: Task Knowledge Base item name
   *               description:
   *                 type: string
   *                 description: Task Knowledge Base item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Knowledge Base item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-knowledge-base',
    authenticate,
    createTaskKnowledgeBaseValidation,
    controller.createTaskKnowledgeBase.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-knowledge-base/{id}:
   *   put:
   *     summary: Update task knowledge base item
   *     tags: [Task Knowledge Base]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Knowledge Base item ID
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
   *         description: Task Knowledge Base item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Knowledge Base item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-knowledge-base/:id',
    authenticate,
    idValidation,
    updateTaskKnowledgeBaseValidation,
    controller.updateTaskKnowledgeBase.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-knowledge-base/{id}:
   *   delete:
   *     summary: Delete task knowledge base item
   *     tags: [Task Knowledge Base]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Knowledge Base item ID
   *     responses:
   *       200:
   *         description: Task Knowledge Base item deleted successfully
   *       404:
   *         description: Task Knowledge Base item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-knowledge-base/:id',
    authenticate,
    idValidation,
    controller.deleteTaskKnowledgeBase.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-knowledge-base/stats:
   *   get:
   *     summary: Get task knowledge base statistics
   *     tags: [Task Knowledge Base]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Knowledge Base statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-knowledge-base/stats',
    authenticate,
    controller.getTaskKnowledgeBaseStats.bind(controller)
  );

  return router;
}