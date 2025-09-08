import { Router } from 'express';
import { serviceUnavailableErrorHandlerController } from '../../controllers/system-error-management/serviceUnavailableErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler:
 *   get:
 *     summary: Get all service unavailable error handler items
 *     tags: [Service Unavailable Error Handler]
 *     responses:
 *       200:
 *         description: List of service unavailable error handler items with analytics
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
router.get('/', serviceUnavailableErrorHandlerController.getAll.bind(serviceUnavailableErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler/{id}:
 *   get:
 *     summary: Get service unavailable error handler item by ID
 *     tags: [Service Unavailable Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Unavailable Error Handler item ID
 *     responses:
 *       200:
 *         description: Service Unavailable Error Handler item details
 *       404:
 *         description: Service Unavailable Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', serviceUnavailableErrorHandlerController.getById.bind(serviceUnavailableErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler:
 *   post:
 *     summary: Create new service unavailable error handler item
 *     tags: [Service Unavailable Error Handler]
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
 *         description: Service Unavailable Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', serviceUnavailableErrorHandlerController.create.bind(serviceUnavailableErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler/{id}:
 *   put:
 *     summary: Update service unavailable error handler item
 *     tags: [Service Unavailable Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Unavailable Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Service Unavailable Error Handler item updated successfully
 *       404:
 *         description: Service Unavailable Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', serviceUnavailableErrorHandlerController.update.bind(serviceUnavailableErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler/{id}:
 *   delete:
 *     summary: Delete service unavailable error handler item
 *     tags: [Service Unavailable Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Unavailable Error Handler item ID
 *     responses:
 *       200:
 *         description: Service Unavailable Error Handler item deleted successfully
 *       404:
 *         description: Service Unavailable Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', serviceUnavailableErrorHandlerController.delete.bind(serviceUnavailableErrorHandlerController));

/**
 * @swagger
 * /api/system-error-management/service-unavailable-error-handler/health:
 *   get:
 *     summary: Health check for service unavailable error handler service
 *     tags: [Service Unavailable Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', serviceUnavailableErrorHandlerController.healthCheck.bind(serviceUnavailableErrorHandlerController));

export { router as serviceUnavailableErrorHandlerRoutes };
export default router;