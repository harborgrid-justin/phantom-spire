/**
 * Task Templates API Routes
 * Handles task template management operations
 */

import { Router } from 'express';
import { TaskTemplateController } from '../../controllers/tasks/taskTemplateController.js';
import { authenticate } from '../../middleware/auth.js';

export function createTaskTemplateRoutes(): Router {
  const router = Router();
  const controller = new TaskTemplateController();

  /**
   * @swagger
   * /api/v1/tasks/templates:
   *   get:
   *     summary: Get all task templates
   *     tags: [Task Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: active
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: Task templates retrieved successfully
   */
  router.get('/templates', authenticate, controller.getTemplates);

  /**
   * @swagger
   * /api/v1/tasks/templates:
   *   post:
   *     summary: Create a new task template
   *     tags: [Task Templates]
   *     security:
   *       - bearerAuth: []
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
   *               category:
   *                 type: string
   *               steps:
   *                 type: array
   *                 items:
   *                   type: string
   *               estimatedDuration:
   *                 type: number
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high, critical]
   *               requiredSkills:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Template created successfully
   */
  router.post('/templates', authenticate, controller.createTemplate);

  /**
   * @swagger
   * /api/v1/tasks/templates/{id}:
   *   get:
   *     summary: Get a specific task template
   *     tags: [Task Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Template retrieved successfully
   */
  router.get('/templates/:id', authenticate, controller.getTemplate);

  /**
   * @swagger
   * /api/v1/tasks/templates/{id}:
   *   put:
   *     summary: Update a task template
   *     tags: [Task Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Template updated successfully
   */
  router.put('/templates/:id', authenticate, controller.updateTemplate);

  /**
   * @swagger
   * /api/v1/tasks/templates/{id}:
   *   delete:
   *     summary: Delete a task template
   *     tags: [Task Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Template deleted successfully
   */
  router.delete('/templates/:id', authenticate, controller.deleteTemplate);

  return router;
}