import { Router } from 'express';
import { sessionTimeoutErrorHandlerController } from '../../controllers/user-error-guidance/sessionTimeoutErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler:
 *   get:
 *     summary: Get all session timeout error handler items
 *     tags: [Session Timeout Error Handler]
 *     responses:
 *       200:
 *         description: List of session timeout error handler items with analytics
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
router.get('/', sessionTimeoutErrorHandlerController.getAll.bind(sessionTimeoutErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler/{id}:
 *   get:
 *     summary: Get session timeout error handler item by ID
 *     tags: [Session Timeout Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session Timeout Error Handler item ID
 *     responses:
 *       200:
 *         description: Session Timeout Error Handler item details
 *       404:
 *         description: Session Timeout Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', sessionTimeoutErrorHandlerController.getById.bind(sessionTimeoutErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler:
 *   post:
 *     summary: Create new session timeout error handler item
 *     tags: [Session Timeout Error Handler]
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
 *         description: Session Timeout Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', sessionTimeoutErrorHandlerController.create.bind(sessionTimeoutErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler/{id}:
 *   put:
 *     summary: Update session timeout error handler item
 *     tags: [Session Timeout Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session Timeout Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Session Timeout Error Handler item updated successfully
 *       404:
 *         description: Session Timeout Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', sessionTimeoutErrorHandlerController.update.bind(sessionTimeoutErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler/{id}:
 *   delete:
 *     summary: Delete session timeout error handler item
 *     tags: [Session Timeout Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session Timeout Error Handler item ID
 *     responses:
 *       200:
 *         description: Session Timeout Error Handler item deleted successfully
 *       404:
 *         description: Session Timeout Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', sessionTimeoutErrorHandlerController.delete.bind(sessionTimeoutErrorHandlerController));

/**
 * @swagger
 * /api/user-error-guidance/session-timeout-error-handler/health:
 *   get:
 *     summary: Health check for session timeout error handler service
 *     tags: [Session Timeout Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', sessionTimeoutErrorHandlerController.healthCheck.bind(sessionTimeoutErrorHandlerController));

export { router as sessionTimeoutErrorHandlerRoutes };
export default router;