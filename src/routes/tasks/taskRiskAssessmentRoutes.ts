/**
 * Task Risk Assessment Routes
 * Fortune 100-Grade Task Risk Assessment Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskRiskAssessmentController } from './controllers/taskRiskAssessmentController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskRiskAssessmentRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskRiskAssessmentController(taskManager);

  // Validation middleware
  const createTaskRiskAssessmentValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskRiskAssessmentValidation = [
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
   * /api/v1/tasks/task-risk-assessment:
   *   get:
   *     summary: Get all task risk assessment items
   *     tags: [Task Risk Assessment]
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
   *         description: List of task risk assessment items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-risk-assessment',
    authenticate,
    controller.getAllTaskRiskAssessment.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-risk-assessment/{id}:
   *   get:
   *     summary: Get task risk assessment item by ID
   *     tags: [Task Risk Assessment]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Risk Assessment item ID
   *     responses:
   *       200:
   *         description: Task Risk Assessment item details
   *       404:
   *         description: Task Risk Assessment item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-risk-assessment/:id',
    authenticate,
    idValidation,
    controller.getTaskRiskAssessmentById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-risk-assessment:
   *   post:
   *     summary: Create new task risk assessment item
   *     tags: [Task Risk Assessment]
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
   *                 description: Task Risk Assessment item name
   *               description:
   *                 type: string
   *                 description: Task Risk Assessment item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Risk Assessment item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-risk-assessment',
    authenticate,
    createTaskRiskAssessmentValidation,
    controller.createTaskRiskAssessment.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-risk-assessment/{id}:
   *   put:
   *     summary: Update task risk assessment item
   *     tags: [Task Risk Assessment]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Risk Assessment item ID
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
   *         description: Task Risk Assessment item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Risk Assessment item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-risk-assessment/:id',
    authenticate,
    idValidation,
    updateTaskRiskAssessmentValidation,
    controller.updateTaskRiskAssessment.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-risk-assessment/{id}:
   *   delete:
   *     summary: Delete task risk assessment item
   *     tags: [Task Risk Assessment]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Risk Assessment item ID
   *     responses:
   *       200:
   *         description: Task Risk Assessment item deleted successfully
   *       404:
   *         description: Task Risk Assessment item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-risk-assessment/:id',
    authenticate,
    idValidation,
    controller.deleteTaskRiskAssessment.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-risk-assessment/stats:
   *   get:
   *     summary: Get task risk assessment statistics
   *     tags: [Task Risk Assessment]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Risk Assessment statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-risk-assessment/stats',
    authenticate,
    controller.getTaskRiskAssessmentStats.bind(controller)
  );

  return router;
}