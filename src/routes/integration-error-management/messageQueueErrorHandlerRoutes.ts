import { Router } from 'express';
import { messageQueueErrorHandlerController } from '../../controllers/integration-error-management/messageQueueErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler:
 *   get:
 *     summary: Get all message queue error handler items
 *     tags: [Message Queue Error Handler]
 *     responses:
 *       200:
 *         description: List of message queue error handler items with analytics
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
router.get('/', messageQueueErrorHandlerController.getAll.bind(messageQueueErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler/{id}:
 *   get:
 *     summary: Get message queue error handler item by ID
 *     tags: [Message Queue Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message Queue Error Handler item ID
 *     responses:
 *       200:
 *         description: Message Queue Error Handler item details
 *       404:
 *         description: Message Queue Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', messageQueueErrorHandlerController.getById.bind(messageQueueErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler:
 *   post:
 *     summary: Create new message queue error handler item
 *     tags: [Message Queue Error Handler]
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
 *         description: Message Queue Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', messageQueueErrorHandlerController.create.bind(messageQueueErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler/{id}:
 *   put:
 *     summary: Update message queue error handler item
 *     tags: [Message Queue Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message Queue Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Message Queue Error Handler item updated successfully
 *       404:
 *         description: Message Queue Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', messageQueueErrorHandlerController.update.bind(messageQueueErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler/{id}:
 *   delete:
 *     summary: Delete message queue error handler item
 *     tags: [Message Queue Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message Queue Error Handler item ID
 *     responses:
 *       200:
 *         description: Message Queue Error Handler item deleted successfully
 *       404:
 *         description: Message Queue Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', messageQueueErrorHandlerController.delete.bind(messageQueueErrorHandlerController));

/**
 * @swagger
 * /api/integration-error-management/message-queue-error-handler/health:
 *   get:
 *     summary: Health check for message queue error handler service
 *     tags: [Message Queue Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', messageQueueErrorHandlerController.healthCheck.bind(messageQueueErrorHandlerController));

export { router as messageQueueErrorHandlerRoutes };
export default router;