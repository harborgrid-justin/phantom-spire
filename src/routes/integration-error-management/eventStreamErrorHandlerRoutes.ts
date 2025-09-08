import { Router } from 'express';
import { eventStreamErrorHandlerController } from '../../controllers/integration-error-management/eventStreamErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler:
 *   get:
 *     summary: Get all event stream error handler items
 *     tags: [Event Stream Error Handler]
 *     responses:
 *       200:
 *         description: List of event stream error handler items with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 analytics:
 *                   type: object
 *                 total:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', eventStreamErrorHandlerController.getAll.bind(eventStreamErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler/{id}:
 *   get:
 *     summary: Get event stream error handler item by ID
 *     tags: [Event Stream Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Stream Error Handler item ID
 *     responses:
 *       200:
 *         description: Event Stream Error Handler item details
 *       404:
 *         description: Event Stream Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', eventStreamErrorHandlerController.getById.bind(eventStreamErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler:
 *   post:
 *     summary: Create new event stream error handler item
 *     tags: [Event Stream Error Handler]
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
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               resolutionSteps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Event Stream Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', eventStreamErrorHandlerController.create.bind(eventStreamErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler/{id}:
 *   put:
 *     summary: Update event stream error handler item
 *     tags: [Event Stream Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Stream Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event Stream Error Handler item updated successfully
 *       404:
 *         description: Event Stream Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', eventStreamErrorHandlerController.update.bind(eventStreamErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler/{id}:
 *   delete:
 *     summary: Delete event stream error handler item
 *     tags: [Event Stream Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Stream Error Handler item ID
 *     responses:
 *       200:
 *         description: Event Stream Error Handler item deleted successfully
 *       404:
 *         description: Event Stream Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', eventStreamErrorHandlerController.delete.bind(eventStreamErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/event-stream-error-handler/health:
 *   get:
 *     summary: Health check for event stream error handler service
 *     tags: [Event Stream Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', eventStreamErrorHandlerController.healthCheck.bind(eventStreamErrorHandlerController));

export { router as eventStreamErrorHandlerRoutes };
export default router;