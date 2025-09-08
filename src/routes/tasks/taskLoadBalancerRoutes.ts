/**
 * Task Load Balancer Routes
 * Fortune 100-Grade Task Load Balancer Management REST API routing configuration
 */

import { Router } from 'express';
import { TaskLoadBalancerController } from './controllers/taskLoadBalancerController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createTaskLoadBalancerRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new TaskLoadBalancerController(taskManager);

  // Validation middleware
  const createTaskLoadBalancerValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateTaskLoadBalancerValidation = [
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
   * /api/v1/tasks/task-load-balancer:
   *   get:
   *     summary: Get all task load balancer items
   *     tags: [Task Load Balancer]
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
   *         description: List of task load balancer items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-load-balancer',
    authenticate,
    controller.getAllTaskLoadBalancer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-load-balancer/{id}:
   *   get:
   *     summary: Get task load balancer item by ID
   *     tags: [Task Load Balancer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Load Balancer item ID
   *     responses:
   *       200:
   *         description: Task Load Balancer item details
   *       404:
   *         description: Task Load Balancer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-load-balancer/:id',
    authenticate,
    idValidation,
    controller.getTaskLoadBalancerById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-load-balancer:
   *   post:
   *     summary: Create new task load balancer item
   *     tags: [Task Load Balancer]
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
   *                 description: Task Load Balancer item name
   *               description:
   *                 type: string
   *                 description: Task Load Balancer item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Task Load Balancer item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/task-load-balancer',
    authenticate,
    createTaskLoadBalancerValidation,
    controller.createTaskLoadBalancer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-load-balancer/{id}:
   *   put:
   *     summary: Update task load balancer item
   *     tags: [Task Load Balancer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Load Balancer item ID
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
   *         description: Task Load Balancer item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task Load Balancer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/task-load-balancer/:id',
    authenticate,
    idValidation,
    updateTaskLoadBalancerValidation,
    controller.updateTaskLoadBalancer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-load-balancer/{id}:
   *   delete:
   *     summary: Delete task load balancer item
   *     tags: [Task Load Balancer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task Load Balancer item ID
   *     responses:
   *       200:
   *         description: Task Load Balancer item deleted successfully
   *       404:
   *         description: Task Load Balancer item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/task-load-balancer/:id',
    authenticate,
    idValidation,
    controller.deleteTaskLoadBalancer.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/task-load-balancer/stats:
   *   get:
   *     summary: Get task load balancer statistics
   *     tags: [Task Load Balancer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Task Load Balancer statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/task-load-balancer/stats',
    authenticate,
    controller.getTaskLoadBalancerStats.bind(controller)
  );

  return router;
}