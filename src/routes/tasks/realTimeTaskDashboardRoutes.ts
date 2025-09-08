/**
 * Real-time Task Dashboard Routes
 * Fortune 100-Grade Real-time Task Dashboard Management REST API routing configuration
 */

import { Router } from 'express';
import { RealTimeTaskDashboardController } from './controllers/realTimeTaskDashboardController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { ITaskManager } from '../../data-layer/tasks/interfaces/ITaskManager.js';

export function createRealTimeTaskDashboardRoutes(taskManager: ITaskManager): Router {
  const router = Router();
  const controller = new RealTimeTaskDashboardController(taskManager);

  // Validation middleware
  const createRealTimeTaskDashboardValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().isLength({ max: 1000 }).trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('assignedTo').optional().isString().trim(),
  ];

  const updateRealTimeTaskDashboardValidation = [
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
   * /api/v1/tasks/real-time-task-dashboard:
   *   get:
   *     summary: Get all real-time task dashboard items
   *     tags: [Real-time Task Dashboard]
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
   *         description: List of real-time task dashboard items
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/real-time-task-dashboard',
    authenticate,
    controller.getAllRealTimeTaskDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/real-time-task-dashboard/{id}:
   *   get:
   *     summary: Get real-time task dashboard item by ID
   *     tags: [Real-time Task Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Real-time Task Dashboard item ID
   *     responses:
   *       200:
   *         description: Real-time Task Dashboard item details
   *       404:
   *         description: Real-time Task Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/real-time-task-dashboard/:id',
    authenticate,
    idValidation,
    controller.getRealTimeTaskDashboardById.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/real-time-task-dashboard:
   *   post:
   *     summary: Create new real-time task dashboard item
   *     tags: [Real-time Task Dashboard]
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
   *                 description: Real-time Task Dashboard item name
   *               description:
   *                 type: string
   *                 description: Real-time Task Dashboard item description
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *                 description: Priority level
   *               assignedTo:
   *                 type: string
   *                 description: Assigned team or user
   *     responses:
   *       201:
   *         description: Real-time Task Dashboard item created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post(
    '/tasks/real-time-task-dashboard',
    authenticate,
    createRealTimeTaskDashboardValidation,
    controller.createRealTimeTaskDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/real-time-task-dashboard/{id}:
   *   put:
   *     summary: Update real-time task dashboard item
   *     tags: [Real-time Task Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Real-time Task Dashboard item ID
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
   *         description: Real-time Task Dashboard item updated successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Real-time Task Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/tasks/real-time-task-dashboard/:id',
    authenticate,
    idValidation,
    updateRealTimeTaskDashboardValidation,
    controller.updateRealTimeTaskDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/real-time-task-dashboard/{id}:
   *   delete:
   *     summary: Delete real-time task dashboard item
   *     tags: [Real-time Task Dashboard]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Real-time Task Dashboard item ID
   *     responses:
   *       200:
   *         description: Real-time Task Dashboard item deleted successfully
   *       404:
   *         description: Real-time Task Dashboard item not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/tasks/real-time-task-dashboard/:id',
    authenticate,
    idValidation,
    controller.deleteRealTimeTaskDashboard.bind(controller)
  );

  /**
   * @swagger
   * /api/v1/tasks/real-time-task-dashboard/stats:
   *   get:
   *     summary: Get real-time task dashboard statistics
   *     tags: [Real-time Task Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Real-time Task Dashboard statistics
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/tasks/real-time-task-dashboard/stats',
    authenticate,
    controller.getRealTimeTaskDashboardStats.bind(controller)
  );

  return router;
}